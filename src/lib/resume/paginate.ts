/**
 * Pagination.
 *
 * This decides where the document breaks, as a pure function over measured
 * heights so it can be reasoned about without a browser.
 *
 * The rules it enforces, and why each one is here:
 *
 *  - **A unit is atomic.** Every item — one role, one project, one certificate,
 *    one skill group — is measured as a single height and either goes on a page
 *    whole or starts the next one. A role whose title sits at the foot of one
 *    sheet and whose bullets are on the next is the most obvious possible sign
 *    that a document was generated rather than designed, so it is impossible
 *    here by construction rather than by hoping.
 *  - **A heading is never the last thing on a page.** A section heading is
 *    placed together with its *first* unit, or not at all. `break-after: avoid`
 *    expresses the same rule in print, and doing it in the packer too means the
 *    on-screen preview and the printed PDF obey one rule rather than two that
 *    happen to agree.
 *  - **Sections do break.** Whole sections are explicitly *not* atomic. An
 *    earlier version marked every `<section>` `break-inside: avoid`, which looks
 *    careful and produces the worst available result: a five-role Experience
 *    section that cannot fit the remainder of a page is pushed wholesale to a
 *    fresh sheet, leaving two thirds of the previous one blank. That is the
 *    "wastes large portions of the first page" failure exactly. Only units break.
 *  - **Nothing sits at the top of a page.** The space above a heading is dropped
 *    when the heading is the first thing on its page, so a break never opens with
 *    a hole the height of a section gap.
 *
 * Gaps are passed in as scalars rather than baked into the measured heights, for
 * one reason: the browser measures margins as part of an element's box only when
 * it has not collapsed them, and margins between grid items do collapse in ways
 * that make a measured total quietly wrong. Owning the numbers here means the
 * packer and the stylesheet cannot disagree.
 */

/** One unbreakable unit of content. */
export interface ResumeRun {
  id: string
  /** `'header'` for the document header, otherwise the owning section id. */
  section: string
  /** Measured height in CSS pixels, margins excluded. */
  height: number
}

/** A heading and the units beneath it. */
export interface ResumeSectionRun {
  id: string
  /** Height of the heading band, margins excluded. */
  height: number
  /**
   * Space between the heading rule and the first unit.
   *
   * Carried separately from `height` because the stylesheet applies it as the
   * first unit's `margin-top`, which `getBoundingClientRect` does not include. If
   * the packer did not add it back, the rendered sheet would be this much taller
   * than counted for *every section* — a few millimetres of drift that is
   * invisible on page one and pushes the last page over its box.
   */
  belowHeight: number
  runIds: string[]
}

/**
 * One printed element, in the order it appears on the page.
 *
 * This is a single ordered list rather than a `runIds` array plus a `headingIds`
 * array on purpose. Two parallel arrays cannot express *interleaving*, and the
 * renderer has no way to recover it — it would have to re-derive the document
 * order, which is precisely the information the packer already had and threw
 * away. The first version of this file did exactly that, and the result was a
 * page one that printed the Experience and Projects headings above the document
 * header and pushed the 2mm of the discrepancy over the page box.
 */
export type ResumeBlock =
  | { kind: 'run'; id: string }
  | { kind: 'heading'; section: string }

export interface ResumePagePlan {
  /** Headings and units, in printed order. */
  blocks: ResumeBlock[]
  /** True when this page's units continue one that started overleaf. */
  continued: boolean
  /** Filled content, for the development diagnostic. */
  used: number
  /** Content available on this page after its continuation rule. */
  limit: number
}

export interface PaginateInput {
  runs: ResumeRun[]
  sections: ResumeSectionRun[]
  /** Content height of one page, in CSS pixels, excluding page chrome. */
  pageHeight: number
  /** Space reserved on every page after the first for the continuation rule. */
  continuationHeight: number
  /** Space between two units of the same section. */
  atomGap: number
  /** Space above a section heading. */
  sectionGap: number
  /** The document header, which is always first on page one. */
  headerRunId?: string
  /**
   * Sub-pixel tolerance, in pixels. Measured heights are fractional and CSS
   * rounds at paint time, so an exact `>` comparison rejects runs that visibly
   * fit and cascades the error down every subsequent page.
   */
  epsilon?: number
}

export interface PaginateResult {
  pages: ResumePagePlan[]
  /**
   * Units taller than an entire page. They cannot be kept whole, so they are
   * placed alone and allowed to run past the page box. The budgets in
   * `./content` exist to make this list permanently empty; it is reported so
   * that if it ever is not, the cause is visible instead of being a clipped
   * last line.
   */
  oversized: string[]
}

const DEFAULT_EPSILON = 0.75

/**
 * Greedy first-fit.
 *
 * Deliberately not an optimal line breaker. A paragraph-quality packer balances
 * page heights by pushing later breaks *earlier*, which evens out the page
 * bottoms at the cost of moving content away from where it naturally fell — and
 * on a CV, a role that starts at the top of a page reads better than one that
 * starts two thirds of the way down a shorter page. First-fit keeps the natural
 * flow and the reader's expectation of it.
 */
export function paginateResume({
  runs,
  sections,
  pageHeight,
  continuationHeight,
  atomGap,
  sectionGap,
  headerRunId,
  epsilon = DEFAULT_EPSILON,
}: PaginateInput): PaginateResult {
  const byId = new Map(runs.map((run) => [run.id, run]))

  const oversized = runs
    .filter((run) => run.height > pageHeight - continuationHeight - epsilon)
    .map((run) => run.id)

  const pages: ResumePagePlan[] = []
  let chrome = 0
  let cur: ResumePagePlan = newPage(0)

  function newPage(used: number): ResumePagePlan {
    return { blocks: [], continued: pages.length > 0, used, limit: pageHeight - chrome }
  }

  function openPage(): void {
    if (cur.blocks.length > 0) pages.push(cur)
    chrome = pages.length > 0 ? continuationHeight : 0
    cur = newPage(chrome)
  }

  /** True when nothing has been placed on the current page yet. */
  const empty = (): boolean => cur.blocks.length === 0

  /*
   * The document header, placed once and never re-placed. It is a run like any
   * other so it measures in the same container at the same width, but it is
   * outside the loop because it belongs to page one by definition, and because a
   * header that is allowed to move is a header that will eventually move.
   */
  const header = headerRunId ? byId.get(headerRunId) : undefined
  if (header) {
    cur.used += header.height
    cur.blocks.push({ kind: 'run', id: header.id })
  }

  for (const section of sections) {
    if (section.runIds.length === 0) continue

    const first = byId.get(section.runIds[0])
    if (!first) continue

    /*
     * Heading and first unit travel together. If they do not fit on what is left
     * of this page, the whole group moves — which is also why a heading is never
     * printed with nothing under it.
     */
    const headingBlock = sectionGap + section.height + section.belowHeight + first.height
    if (!empty() && cur.used + headingBlock > cur.limit - epsilon) {
      openPage()
    }

    cur.used += (empty() ? 0 : sectionGap) + section.height + section.belowHeight
    cur.blocks.push({ kind: 'heading', section: section.id })

    for (let index = 0; index < section.runIds.length; index += 1) {
      const run = byId.get(section.runIds[index])
      if (!run) continue

      // The first unit's gap is the heading's `belowHeight`, already counted above.
      const gap = index === 0 ? 0 : atomGap

      if (!empty() && cur.used + gap + run.height > cur.limit - epsilon) {
        openPage()
      }

      cur.used += (empty() ? 0 : gap) + run.height
      cur.blocks.push({ kind: 'run', id: run.id })
    }
  }

  if (!empty()) pages.push(cur)

  return { pages, oversized }
}

/**
 * The share of each page that carries content, for a development warning.
 *
 * The original complaint was a first page that "feels empty while the content is
 * compressed into a small area", and that is measurable rather than a matter of
 * taste. A page under ~60% full while another is full means a unit was pushed
 * whole rather than split, which is the correct trade — but it is worth seeing
 * while building the document, instead of rediscovering it from a screenshot.
 */
export function fillRatios(pages: ResumePagePlan[]): number[] {
  return pages.map((page) => (page.limit > 0 ? page.used / page.limit : 0))
}
