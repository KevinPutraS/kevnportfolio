'use client'

import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { buildDocument, ResumeSheet, RUN_ATTRIBUTE } from './document'
import { paginateResume, type ResumePagePlan, type ResumeRun, type ResumeSectionRun } from '@/lib/resume/paginate'
import type { ResumeContent } from '@/lib/resume/content'

/**
 * The preview.
 *
 * Three jobs, in this order, and the order is the design:
 *
 *  1. **Measure.** Lay the whole document out off-screen at the exact content
 *     width of an A4 page and read every run's height. The measuring host carries
 *     the same `.resume-body` typography and the same width as a real sheet, so a
 *     measured height *is* the height that will be printed.
 *  2. **Paginate.** Hand those heights to `paginateResume`, a pure function that
 *     decides the breaks.
 *  3. **Present.** Draw the resulting sheets at a scale that fits the viewport.
 *
 * The document is measured rather than hand-laid-out for one reason: the preview
 * and the PDF are then the *same DOM*. There is no second, print-only
 * arrangement to keep in sync, and no mechanism by which the page on a phone and
 * the page in the browser's print dialog can disagree — which was the complaint
 * that started this work. The previous version had one arrangement for the screen
 * and a stack of `@media print` overrides for the paper, and the two drifted.
 *
 * Scaling is a `transform: scale()` on the sheet stack and nothing else. The
 * document's internal proportions are identical at every viewport width; only the
 * magnification changes, capped at 1 so a sheet is never blown up past its real
 * size. The transform is dropped entirely in `@media print`.
 *
 * The preview is also capped at one viewport in height and scrolls internally,
 * which is a stability decision rather than a layout one: see `.resume-scroller`
 * in `globals.css` for the layout shift it removes.
 */

/** `useLayoutEffect` on the server is a warning; here it wants to run before paint. */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * The stack's laid-out size, and how far to shift it to centre the *scaled* sheet.
 *
 * Both numbers are read back from the DOM. Recomputing them in JavaScript would
 * mean knowing the sheet's margins, its shadow and the inter-sheet gap, and any of
 * those changing in the stylesheet would silently desynchronise the transform from
 * the layout box.
 */
function useStackLayout(
  scale: number,
  ready: boolean,
  stackRef: React.RefObject<HTMLDivElement>,
  scrollerRef: React.RefObject<HTMLDivElement>
) {
  const [layout, setLayout] = useState<{ offsetX: number; height: number; panX: 'auto' | 'hidden' } | null>(
    null
  )

  useIsomorphicLayoutEffect(() => {
    const stack = stackRef.current
    const scroller = scrollerRef.current
    if (!stack || !scroller) return

    const scaledWidth = stack.offsetWidth * scale

    setLayout({
      offsetX: Math.max(0, (scroller.clientWidth - scaledWidth) / 2),
      height: stack.offsetHeight * scale,
      /*
       * A transform does not change layout, so the stack keeps a 210mm layout box
       * no matter how small it is painted. Left alone, that gives a 390px phone a
       * scroller with ~400px of empty space to its right: the page looks correct
       * and drags sideways into nothing. So horizontal panning is enabled only
       * when the *painted* sheet is genuinely wider than the viewport — which is
       * exactly the zoomed-in case it exists for — and suppressed at fit-to-width,
       * where there is nothing to pan to.
       */
      panX: scaledWidth > scroller.clientWidth + 1 ? 'auto' : 'hidden',
    })
  }, [scale, ready, stackRef, scrollerRef])

  return layout
}

interface Geometry {
  /** Full width of a sheet, in px — the basis for the fit-to-width scale. */
  pageWidth: number
  /** Content height of a page, in px, excluding the continuation rule. */
  pageHeight: number
  /** Space reserved on every page after the first for the continuation rule. */
  continuationHeight: number
  /** Space between the heading rule and the first unit of a section. */
  belowHeight: number
  atomGap: number
  sectionGap: number
}

interface Measurement {
  geometry: Geometry
  runs: ResumeRun[]
  sections: ResumeSectionRun[]
  nodes: Map<string, React.ReactNode>
  pages: ResumePagePlan[]
}

/** The zoom range, as multiples of fit-to-width. */
const ZOOM_MIN = 0.6
const ZOOM_MAX = 2
const ZOOM_STEP = 0.2

export function ResumePreview({ content }: { content: ResumeContent }) {
  const built = useMemo(() => buildDocument(content), [content])

  const measureRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const stackRef = useRef<HTMLDivElement>(null)

  const [measurement, setMeasurement] = useState<Measurement | null>(null)
  const [zoom, setZoom] = useState(1)
  const [fitScale, setFitScale] = useState(1)
  const [page, setPage] = useState(1)

  /**
   * Reads the geometry and every run height out of the DOM.
   *
   * The page box, the gaps and the continuation rule are measured from a set of
   * empty ruler elements rather than parsed out of CSS custom properties, and the
   * distinction is not a detail. `getComputedStyle().getPropertyValue('--x')`
   * returns the *token* for an unregistered custom property — `"271mm"`, not
   * `"1024px"` — so parsing it would compare millimetres against pixel heights and
   * every page would be wrong. A ruler element has a real box, so reading its
   * `getBoundingClientRect()` is a genuine unit conversion performed by the
   * browser.
   *
   * The alternative — a copy of these numbers in TypeScript — is worse, because it
   * drifts the first time a margin is changed, with no error: the pages just
   * paginate slightly wrong and there is nothing to find.
   */
  const measure = useCallback(() => {
    const host = measureRef.current
    if (!host) return

    const ruler = (name: string) => {
      const element = host.querySelector<HTMLElement>(`[data-ruler="${name}"]`)
      return element ? element.getBoundingClientRect() : null
    }

    const page = ruler('page')
    const cont = ruler('cont')
    const below = ruler('below')
    const atom = ruler('atom')
    const section = ruler('section')
    if (!page || !cont || !below || !atom || !section) return
    if (page.width <= 0 || page.height <= 0) return

    const geometry: Geometry = {
      pageWidth: page.width,
      pageHeight: page.height,
      continuationHeight: cont.height,
      belowHeight: below.height,
      atomGap: atom.height,
      sectionGap: section.height,
    }

    const measured = new Map<string, number>()
    host.querySelectorAll<HTMLElement>(`[${RUN_ATTRIBUTE}]`).forEach((element) => {
      const id = element.getAttribute(RUN_ATTRIBUTE)
      if (id) measured.set(id, element.getBoundingClientRect().height)
    })

    const nodes = new Map<string, React.ReactNode>()
    nodes.set(built.headerId, built.headerNode)

    const headerRun: ResumeRun = {
      id: built.headerId,
      section: 'header',
      height: measured.get(built.headerId) ?? 0,
    }

    const sectionRuns: ResumeRun[] = []
    const sections: ResumeSectionRun[] = built.sections.map((section) => {
      const headingId = `head:${section.id}`
      nodes.set(headingId, section.headingNode)

      for (const run of section.runs) {
        nodes.set(run.id, run.node)
        sectionRuns.push({ id: run.id, section: section.id, height: measured.get(run.id) ?? 0 })
      }

      return {
        id: section.id,
        height: measured.get(headingId) ?? 0,
        belowHeight: geometry.belowHeight,
        runIds: section.runs.map((run) => run.id),
      }
    })

    const runs = [headerRun, ...sectionRuns]
    const { pages, oversized } = paginateResume({
      runs,
      sections,
      pageHeight: geometry.pageHeight,
      continuationHeight: geometry.continuationHeight,
      atomGap: geometry.atomGap,
      sectionGap: geometry.sectionGap,
      headerRunId: built.headerId,
    })

    if (process.env.NODE_ENV !== 'production' && oversized.length > 0) {
      console.warn('[resume] runs taller than a page cannot be kept whole:', oversized)
    }

    setMeasurement({ geometry, runs, sections, nodes, pages })
  }, [built])

  /*
   * Measured in a layout effect, so this completes before the browser paints and
   * the reader never sees an unpaginated frame. It also re-runs once the webfonts
   * resolve, because every height up to that point was measured against a
   * substituted face — and a substituted face has different metrics, which is the
   * same class of bug that made headings overlap in the earlier PDF.
   */
  useIsomorphicLayoutEffect(() => {
    measure()

    if (typeof document === 'undefined' || !document.fonts) return
    let cancelled = false
    void document.fonts.ready.then(() => {
      if (!cancelled) measure()
    })
    return () => {
      cancelled = true
    }
  }, [measure])

  /*
   * Fit-to-width. The single number that changes with the viewport: a phone gets
   * a small scale, a monitor a large one, and the document inside is byte
   * identical either way.
   *
   * Measured against the *full sheet* rather than the content column, because the
   * scale has to bring the margins with it — fitting the 180mm of content into a
   * 358px phone viewport and then printing the 15mm margins at full size produces
   * a sheet wider than the screen, cut off on both sides.
   *
   * Capped at 1. A sheet is 210mm; nobody needs it magnified past its real size,
   * and allowing it means the preview stops being a preview and becomes a
   * full-screen reader for a document that is not that long.
   */
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const update = () => {
      if (!measurement) return
      const available = stage.clientWidth
      if (available > 0) setFitScale(Math.min(1, available / measurement.geometry.pageWidth))
    }

    update()
    if (typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(update)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [measurement])

  const scale = fitScale * zoom
  const pageCount = measurement?.pages.length ?? 0

  /*
   * A `transform` does not change layout, so the stack's own box is the unscaled
   * one: 210mm wide and every sheet tall. Two consequences, and the second is
   * why `.resume-sizer` exists at all.
   *
   * The scroller's height is therefore read back from the DOM rather than
   * recomputed from the page count — the sheets carry real margins and a real
   * shadow, and arithmetic in JavaScript would have to know about all of it.
   *
   * Its *scrollable* height, on the other hand, must be the painted height. The
   * sizer supplies that: the stack is positioned inside it rather than flowing in
   * it, so what the scroller can scroll over is what it can scroll over.
   *
   * The centring is part of the transform rather than a flex `align-items: center`
   * because the stack is 210mm wide in *layout* space, so a flex container would
   * centre a 794px box inside a 358px one, negative offsets and all, and the
   * scaled result would sit off to the left of centre. Scaling about `top left`
   * and translating by the scaled remainder puts the sheet exactly where a flex
   * centring would have put the *rendered* box.
   */
  const layout = useStackLayout(scale, pageCount > 0, stackRef, scrollRef)

  /* Scroll position and the page indicator are two views of one fact. */
  const scrollToPage = useCallback(
    (target: number) => {
      const scroller = scrollRef.current
      const stack = stackRef.current
      if (!scroller || !stack) return

      const sheet = stack.querySelector<HTMLElement>(`[data-sheet="${target}"]`)
      if (!sheet) return
      scroller.scrollTo({ top: sheet.offsetTop * scale, behavior: 'smooth' })
    },
    [scale]
  )

  const goToPage = useCallback(
    (target: number) => {
      const clamped = Math.min(Math.max(target, 1), Math.max(pageCount, 1))
      setPage(clamped)
      scrollToPage(clamped)
    },
    [pageCount, scrollToPage]
  )

  useEffect(() => {
    const scroller = scrollRef.current
    if (!scroller) return

    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const sheets = scroller.querySelectorAll<HTMLElement>('[data-sheet]')
        const top = scroller.scrollTop
        let current = 1
        sheets.forEach((sheet, index) => {
          if (sheet.offsetTop * scale <= top + 8) current = index + 1
        })
        setPage(current)
      })
    }

    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      scroller.removeEventListener('scroll', onScroll)
    }
  }, [scale, pageCount])

  const reserved = layout?.height ?? 0

  return (
    <div className="resume-viewer">
      {/*
        The measuring host. Off-screen and invisible, but *laid out* — a
        `display: none` element has no box and reports a height of zero, which
        would paginate the entire document onto a single overflowing page. It
        carries `.resume-body` so it inherits exactly the typography a real sheet
        does, rather than a copy of it that could drift.

        The rulers come first. Four empty boxes whose only job is to be measurable:
        they are how the millimetre values in the stylesheet become the pixel
        values the paginator compares run heights against, with the browser doing
        the unit conversion. There is no second copy of the geometry in
        TypeScript to fall out of step.
      */}
      <div className="resume-measure resume-body" ref={measureRef} aria-hidden="true">
        <div className="resume-ruler resume-ruler--page" data-ruler="page" />
        <div className="resume-ruler resume-ruler--cont" data-ruler="cont" />
        <div className="resume-ruler resume-ruler--below" data-ruler="below" />
        <div className="resume-ruler resume-ruler--atom" data-ruler="atom" />
        <div className="resume-ruler resume-ruler--section" data-ruler="section" />

        {built.headerNode}
        {built.sections.map((section) => (
          <Fragment key={section.id}>
            {section.headingNode}
            {section.runs.map((run) => (
              <div key={run.id} className="resume-run">
                {run.node}
              </div>
            ))}
          </Fragment>
        ))}
      </div>

      <div className="resume-stage" ref={stageRef}>
        <div
          className="resume-scroller"
          ref={scrollRef}
          style={{
            /*
             * The cap before there is anything to show, the measured height after.
             *
             * `.resume-scroller` caps this box at `--resume-stage-max`, so for any
             * document taller than the cap both of these resolve to the same used
             * height and the page below the viewer does not move when the sheets
             * arrive. Reserving nothing instead cost 2200px of reflow about 250ms
             * after paint — the footer was sitting under the header and then
             * jumped the length of the document.
             */
            height: reserved > 0 ? `${reserved}px` : 'var(--resume-stage-max)',
            overflowX: layout?.panX,
          }}
        >
          {/*
            `.resume-sizer` is the scaled document's real footprint. The stack
            below is out of flow inside it, so the scrollable height is the
            painted height rather than the 210mm layout height — without it a
            phone scrolls 1853px past the last sheet into nothing.
          */}
          <div className="resume-sizer" style={{ height: reserved > 0 ? `${reserved}px` : undefined }}>
            <div
              className="resume-stack"
              ref={stackRef}
              style={{
                transform: `translateX(${layout?.offsetX ?? 0}px) scale(${scale})`,
                visibility: layout ? undefined : 'hidden',
              }}
            >
              {measurement &&
                measurement.pages.map((plan, index) => (
                  <ResumeSheet
                    key={index}
                    index={index + 1}
                    continuationName={content.name.toUpperCase()}
                  >
                    {plan.blocks.map((block) => {
                      /*
                       * `plan.blocks` is already in printed order, so this is a
                       * straight walk. A heading is emitted as a *direct* child of
                       * `.resume-body` with no wrapper: `.resume-body > :first-child`
                       * and `.resume-section__head + .resume-run` are the two rules
                       * that keep the rendered gaps identical to the ones the
                       * paginator counted, and an intervening `<div>` defeats both —
                       * the first block on a page keeps its leading margin, and every
                       * section's first unit falls to the atom gap instead of the
                       * heading's below-gap. The measuring host above is built the
                       * same way for the same reason.
                       */
                      if (block.kind === 'heading') {
                        const section = built.sections.find((item) => item.id === block.section)
                        return section?.headingNode ?? null
                      }

                      const node = measurement.nodes.get(block.id)
                      return node ? (
                        <div key={block.id} className="resume-run">
                          {node}
                        </div>
                      ) : null
                    })}
                  </ResumeSheet>
                ))}
            </div>
          </div>
        </div>
      </div>

      <div className="resume-controls print:hidden">
        <div className="resume-controls__group">
          <button
            type="button"
            className="resume-control"
            onClick={() => setZoom((value) => Math.max(ZOOM_MIN, Number((value - ZOOM_STEP).toFixed(2))))}
            disabled={zoom <= ZOOM_MIN}
            aria-label="Zoom out"
          >
            <span aria-hidden="true">&minus;</span>
          </button>
          <span className="resume-controls__value" aria-live="polite">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            className="resume-control"
            onClick={() => setZoom((value) => Math.min(ZOOM_MAX, Number((value + ZOOM_STEP).toFixed(2))))}
            disabled={zoom >= ZOOM_MAX}
            aria-label="Zoom in"
          >
            <span aria-hidden="true">+</span>
          </button>
          <button
            type="button"
            className="resume-control resume-control--wide"
            onClick={() => setZoom(1)}
            aria-pressed={zoom === 1}
          >
            Fit
          </button>
        </div>

        {pageCount > 1 && (
          <div className="resume-controls__group">
            <button
              type="button"
              className="resume-control"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              aria-label="Previous page"
            >
              <span aria-hidden="true">&uarr;</span>
            </button>
            <span className="resume-controls__value tabular-nums">
              {page} <span className="resume-controls__of">/</span> {pageCount}
            </span>
            <button
              type="button"
              className="resume-control"
              onClick={() => goToPage(page + 1)}
              disabled={page >= pageCount}
              aria-label="Next page"
            >
              <span aria-hidden="true">&darr;</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
