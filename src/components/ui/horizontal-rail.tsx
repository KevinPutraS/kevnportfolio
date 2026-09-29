'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { classNames } from '@/lib/utils/helpers'

export interface HorizontalRailProps {
  /**
   * What the rail holds, e.g. "Featured projects". Announced as the accessible
   * name of the scrolling region, and folded into the arrow labels.
   */
  label: string
  children: ReactNode
  /**
   * Applied to the scrolling track. To size the items, style the elements the
   * caller renders inside it — there is deliberately no `itemClassName` that
   * reaches down and dresses someone else's children, because doing that means
   * cloning them.
   */
  trackClassName?: string
  className?: string
  /** Set `false` where the surrounding layout provides its own controls. */
  controls?: boolean
}

interface RailState {
  /** There is more than one screen of content. */
  scrollable: boolean
  atStart: boolean
  atEnd: boolean
  /** 0–1, how far through the rail the viewport is. */
  progress: number
}

const INITIAL_STATE: RailState = { scrollable: false, atStart: true, atEnd: true, progress: 0 }

/** Sub-pixel tolerance: `scrollLeft` is fractional on some platforms. */
const EDGE_EPSILON = 2

/**
 * A horizontally scrolling rail, for content that is a *sample* of something
 * larger rather than the whole of it.
 *
 * Why a rail and not a grid or a stack:
 *
 *  - A grid grows the page downward, so a section with six items costs three
 *    screens of scroll before the visitor reaches anything else. On the homepage
 *    that pushed everything below it out of view.
 *  - A stack has the same problem, and worse: it is the only option that gives
 *    items no relationship to each other.
 *  - A rail keeps the section one screen tall at any item count, and the visible
 *    sliver of the next card is a better "there is more here" signal than a
 *    scrollbar.
 *
 * Built on native scrolling and CSS scroll snap rather than a carousel library:
 * touch, trackpad, shift+wheel, keyboard and screen-reader rotation all keep
 * working, and nothing has to be reimplemented badly. A Client Component only
 * because it measures its own overflow and owns the arrow buttons — the cards
 * inside are Server Components passed through as `children`.
 *
 * Accessibility contract:
 *  - The track is a labelled, focusable region, so it can be scrolled with the
 *    arrow keys once focused, without a mouse.
 *  - The arrows are real buttons with dynamic labels and a disabled state, and
 *    they are only rendered once the rail is known to overflow — there is no
 *    dead control on a rail of two cards.
 *  - The progress bar is decorative; the count is already announced by whatever
 *    list semantics the caller renders.
 *
 * Degrades to a plain scrollable strip with no JavaScript: the track is
 * scrollable, the items are links, and only the arrows and the progress bar
 * disappear.
 *
 * The rail owns the container, not the items: callers size and snap their own
 * children (`className="w-[80vw] shrink-0 snap-start"`), which keeps the
 * component free of `cloneElement` and keeps markup decisions where the data
 * is.
 */
export function HorizontalRail({
  label,
  children,
  trackClassName,
  className,
  controls = true,
}: HorizontalRailProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<RailState>(INITIAL_STATE)

  const measure = useCallback(() => {
    const track = trackRef.current
    if (!track) return

    const max = track.scrollWidth - track.clientWidth
    const scrollable = max > EDGE_EPSILON

    setState((previous) => {
      const next: RailState = {
        scrollable,
        atStart: track.scrollLeft <= EDGE_EPSILON,
        atEnd: !scrollable || track.scrollLeft >= max - EDGE_EPSILON,
        progress: scrollable ? track.scrollLeft / max : 0,
      }
      // Scroll events fire far more often than the state meaningfully changes.
      if (
        previous.scrollable === next.scrollable &&
        previous.atStart === next.atStart &&
        previous.atEnd === next.atEnd &&
        Math.abs(previous.progress - next.progress) < 0.001
      ) {
        return previous
      }
      return next
    })
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let frame = 0
    const scheduleMeasure = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        measure()
      })
    }

    measure()
    track.addEventListener('scroll', scheduleMeasure, { passive: true })

    /*
     * The scroll range is not known from markup: it depends on the rendered
     * card widths, the container width, and how wide the fallback text wraps.
     * So it is re-measured on any resize of the track or of any item inside it,
     * and once more after webfonts land — otherwise a rail measured with
     * fallback metrics reports the wrong overflow and the arrows lie.
     */
    const observer = new ResizeObserver(scheduleMeasure)
    observer.observe(track)
    for (const child of Array.from(track.children)) observer.observe(child)

    let cancelled = false
    void document.fonts?.ready.then(() => {
      if (!cancelled) scheduleMeasure()
    })

    return () => {
      cancelled = true
      if (frame) window.cancelAnimationFrame(frame)
      track.removeEventListener('scroll', scheduleMeasure)
      observer.disconnect()
    }
  }, [measure])

  const scrollByCard = useCallback((direction: -1 | 1) => {
    const track = trackRef.current
    if (!track) return

    const first = track.firstElementChild as HTMLElement | null
    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 0
    const step = (first ? first.getBoundingClientRect().width : track.clientWidth * 0.8) + gap

    /*
     * `behavior: 'smooth'` is an explicit request to the CSSOM, so it is *not*
     * covered by the `scroll-behavior: auto !important` rule in globals.css
     * that honours `prefers-reduced-motion`. It has to be checked here, or the
     * rail is the one animated thing on the site for a visitor who asked for
     * none.
     */
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    track.scrollBy({ left: direction * step, behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [])

  return (
    <div className={className}>
      <div className="relative">
        <div
          ref={trackRef}
          tabIndex={0}
          role="group"
          aria-roledescription="carousel"
          aria-label={label}
          className={classNames(
            // The first card is inset by the container's own gutter on every
            // breakpoint so it lines up with the section heading above it,
            // rather than running flush to the viewport edge on a phone. A
            // trailing right padding lets the last card and the next one show
            // the same peek, and because the track is the scroll container none
            // of this can widen the page.
            'flex snap-x snap-mandatory gap-6 overflow-x-auto pr-5',
            'scrollbar-hide overscroll-x-contain sm:pr-8 lg:pr-0',
            // Bottom padding so a focused card's outline is not clipped by the
            // container's overflow.
            'pb-2',
            trackClassName
          )}
        >
          {children}
        </div>

        {/*
          Edge fade, only while there is more to see and only below `lg`, where
          the rail bleeds to the viewport edge. Above `lg` the arrows carry that
          signal, and a fade across a card that is fully visible just looks like
          a rendering bug.
        */}
        {!state.atEnd && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-14 bg-gradient-to-l from-[rgb(var(--bg))] to-transparent lg:hidden"
          />
        )}
      </div>

      {/*
        Progress line and arrows share one row below the rail, so the controls
        cost 44px rather than a header row of their own. It renders only once
        the rail is measured as overflowing — and because it sits *after* the
        track, appearing adds space below the cards and shifts nothing.
      */}
      {state.scrollable && (
        <div className="mt-6 flex items-center gap-5 sm:gap-8">
          <div aria-hidden="true" className="relative h-[2px] flex-1 bg-[rgb(var(--border))]">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-[rgb(var(--accent))] transition-[width] duration-200 ease-out"
              /* A minimum width keeps the handle visible at position zero. */
              style={{ width: `${Math.max(4, state.progress * 100)}%` }}
            />
          </div>

          {controls && (
            <div className="flex shrink-0 items-center gap-2">
              <RailButton
                direction="previous"
                label={label}
                disabled={state.atStart}
                onClick={() => scrollByCard(-1)}
              />
              <RailButton
                direction="next"
                label={label}
                disabled={state.atEnd}
                onClick={() => scrollByCard(1)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function RailButton({
  direction,
  label,
  disabled,
  onClick,
}: {
  direction: 'previous' | 'next'
  label: string
  disabled: boolean
  onClick: () => void
}) {
  const Icon = direction === 'previous' ? ArrowLeft : ArrowRight

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`${direction === 'previous' ? 'Previous' : 'Next'} ${label.toLowerCase()}`}
      className="tap inline-flex items-center justify-center rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-dim))] transition-colors duration-200 hover:border-[rgb(var(--border-strong))] hover:text-[rgb(var(--text))] disabled:pointer-events-none disabled:opacity-35"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  )
}
