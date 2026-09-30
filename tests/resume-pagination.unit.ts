import { expect, test } from '@playwright/test'
import {
  fillRatios,
  paginateResume,
  type PaginateInput,
  type ResumePagePlan,
  type ResumeRun,
  type ResumeSectionRun,
} from '../src/lib/resume/paginate'

/**
 * The resume packer, tested as arithmetic.
 *
 * The file it covers is the one piece of this project that describes itself as a
 * pure function over measured heights "so it can be reasoned about without a
 * browser", and it had no test. That is the most testable claim in the codebase
 * and the one nothing was checking.
 *
 * The numbers below are chosen so every expectation is exact rather than
 * approximate. `PAGE - CONT - DEFAULT_EPSILON` is 939.25, which is the threshold
 * that decides almost every branch in the packer, so runs are placed well clear
 * of it instead of near it.
 */

const PAGE = 1000
const CONT = 60
const ATOM = 10
const SECTION_GAP = 30
const EPSILON = 0.75
/** What a unit must exceed to count as taller than a page. */
const OVERSIZE_LIMIT = PAGE - CONT - EPSILON // 939.25

const run = (id: string, height: number, section = 'exp'): ResumeRun => ({ id, section, height })

const sect = (id: string, runIds: string[], height = 40, belowHeight = 10): ResumeSectionRun => ({
  id,
  height,
  belowHeight,
  runIds,
})

const plan = (over: Partial<PaginateInput> = {}) =>
  paginateResume({
    runs: [],
    sections: [],
    pageHeight: PAGE,
    continuationHeight: CONT,
    atomGap: ATOM,
    sectionGap: SECTION_GAP,
    ...over,
  })

const blockKey = (page: ResumePagePlan) =>
  page.blocks.map((b) => (b.kind === 'run' ? `run:${b.id}` : `heading:${b.section}`))

/** The rule the packer's own docs lead with: a heading is never left alone. */
const orphanHeadings = (pages: ResumePagePlan[]) =>
  pages.flatMap((p, i) => (p.blocks.at(-1)?.kind === 'heading' ? [`page ${i + 1}`] : []))

const countBlock = (pages: ResumePagePlan[], key: string) =>
  pages.flatMap((p) => p.blocks).filter((b) => (b.kind === 'run' ? `run:${b.id}` : `heading:${b.section}`) === key).length

test.describe('paginateResume: document order', () => {
  test('keeps the header first on page one and never re-places it', () => {
    const { pages } = plan({
      runs: [run('header', 80, 'header'), run('a', 200), run('b', 300)],
      sections: [sect('exp', ['a', 'b'])],
      headerRunId: 'header',
    })

    expect(pages).toHaveLength(1)
    expect(blockKey(pages[0])).toEqual(['run:header', 'heading:exp', 'run:a', 'run:b'])
    expect(countBlock(pages, 'run:header')).toBe(1)
  })

  test('counts the header, heading and first unit into one used total', () => {
    // 80 header + (30 gap + 40 heading + 10 below) + 200 a + (10 gap + 300 b)
    const { pages } = plan({
      runs: [run('header', 80, 'header'), run('a', 200), run('b', 300)],
      sections: [sect('exp', ['a', 'b'])],
      headerRunId: 'header',
    })

    expect(pages[0].used).toBe(670)
    expect(pages[0].limit).toBe(PAGE)
    expect(fillRatios(pages)).toEqual([0.67])
  })
})

test.describe('paginateResume: a heading travels with its first unit', () => {
  const input = {
    runs: [run('header', 80, 'header'), run('a', 200), run('b', 300), run('c', 350)],
    sections: [sect('exp', ['a', 'b']), sect('proj', ['c'], 30, 8)],
    headerRunId: 'header',
  }

  test('moves the heading to the next page rather than stranding it', () => {
    const { pages } = plan(input)

    // Page one cannot take the Projects group: 670 + (30 + 30 + 8 + 350) = 1088.
    expect(pages).toHaveLength(2)
    expect(blockKey(pages[0])).toEqual(['run:header', 'heading:exp', 'run:a', 'run:b'])
    expect(blockKey(pages[1])).toEqual(['heading:proj', 'run:c'])
    expect(orphanHeadings(pages)).toEqual([])
  })

  test('drops the section gap when the heading opens a page', () => {
    const { pages } = plan(input)

    // 60 continuation + 0 + 30 heading + 8 below + 350 c. If `sectionGap` leaked
    // into a page-opening heading this would read 390, and the drift would be a
    // hole at the top of every continuation page rather than an obvious bug.
    expect(pages[1].used).toBe(448)
  })
})

test.describe('paginateResume: sections break, units stay whole', () => {
  const input = {
    runs: [run('header', 80, 'header'), run('a', 300), run('b', 300), run('c', 300)],
    sections: [sect('exp', ['a', 'b', 'c'])],
    headerRunId: 'header',
  }

  test('breaks between units of one section and does not repeat the heading', () => {
    const { pages } = plan(input)

    expect(pages).toHaveLength(2)
    expect(blockKey(pages[0])).toEqual(['run:header', 'heading:exp', 'run:a', 'run:b'])
    expect(blockKey(pages[1])).toEqual(['run:c'])
    // The heading belongs to the section, not to the page it happened to start on.
    expect(countBlock(pages, 'heading:exp')).toBe(1)
  })

  test('a page opened mid-section carries no section gap', () => {
    const { pages } = plan(input)

    // 60 continuation + 0 (no section gap: nothing opens this page) + 300 c.
    expect(pages[1].used).toBe(360)
  })
})

test.describe('paginateResume: the continuation reserve', () => {
  const input = {
    runs: [run('header', 80, 'header'), run('a', 200), run('b', 300), run('c', 350)],
    sections: [sect('exp', ['a', 'b']), sect('proj', ['c'], 30, 8)],
    headerRunId: 'header',
  }

  test('charges the reserve to every page after the first and to none of the first', () => {
    const { pages } = plan(input)

    expect(pages[0].limit).toBe(PAGE)
    expect(pages[0].continued).toBe(false)
    expect(pages[1].limit).toBe(PAGE - CONT)
    expect(pages[1].continued).toBe(true)
    // The reserve is counted as used, not just subtracted from the limit, so the
    // fill ratio a developer sees is the share of the box that is really filled.
    expect(pages[1].used).toBeGreaterThanOrEqual(CONT)
  })
})

test.describe('paginateResume: oversized units', () => {
  test('reports every run taller than a page, in document order', () => {
    const { oversized } = plan({
      runs: [run('ok', 900), run('tall', 1000), run('borderline', 940), run('justUnder', OVERSIZE_LIMIT)],
    })

    // 940 clears 939.25; exactly 939.25 does not. The threshold is the whole
    // point of the epsilon, so the boundary is asserted rather than approximated.
    expect(oversized).toEqual(['tall', 'borderline'])
  })

  test('does not strand the heading of an oversized first unit', () => {
    const { pages, oversized } = plan({
      runs: [run('header', 80, 'header'), run('huge', 1200)],
      sections: [sect('exp', ['huge'])],
      headerRunId: 'header',
    })

    expect(oversized).toEqual(['huge'])

    // The unit is taller than a page, so it must be allowed to run past the box
    // rather than be split. But its heading is not taller than a page, so the
    // heading goes with it instead of being left on a page of its own.
    expect(orphanHeadings(pages)).toEqual([])

    const headingPage = pages.findIndex((p) => p.blocks.some((b) => b.kind === 'heading' && b.section === 'exp'))
    const unitPage = pages.findIndex((p) => p.blocks.some((b) => b.kind === 'run' && b.id === 'huge'))
    expect(headingPage).toBeGreaterThanOrEqual(0)
    expect(headingPage).toBe(unitPage)
  })
})

test.describe('paginateResume: input it should not have to be given', () => {
  test('skips a section with no runs', () => {
    const { pages } = plan({
      runs: [run('a', 200)],
      sections: [sect('empty', []), sect('exp', ['a'])],
    })

    expect(blockKey(pages[0])).toEqual(['heading:exp', 'run:a'])
    expect(orphanHeadings(pages)).toEqual([])
  })

  test('skips a run id that is not in the measured set', () => {
    const { pages } = plan({
      runs: [run('a', 200)],
      sections: [sect('exp', ['a', 'ghost'])],
    })

    expect(blockKey(pages[0])).toEqual(['heading:exp', 'run:a'])
  })

  test('ignores a headerRunId that does not resolve', () => {
    const { pages } = plan({
      runs: [run('a', 200)],
      sections: [sect('exp', ['a'])],
      headerRunId: 'missing',
    })

    expect(blockKey(pages[0])).toEqual(['heading:exp', 'run:a'])
  })

  test('returns no pages for no content', () => {
    expect(plan().pages).toEqual([])
  })
})
