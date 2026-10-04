import { expect, test } from '@playwright/test'
import { settle } from './helpers'

/**
 * Responsive sweep across every public route.
 *
 * `layout.spec.ts` sweeps widths, but only against `/`. That is a real gap rather
 * than a redundant one: the routes that break at a narrow width are not the
 * homepage. A three-column grid, a sticky metadata rail, a full-bleed plate and a
 * two-column definition list all behave differently at 320px, and each of those
 * lives on a different page from the hero. If only `/` is swept, all four can be
 * broken at once and the suite stays green.
 *
 * One test per route rather than one per route/width pair: the diagnostic --
 * "which element is widest, and how far past the edge is it" -- is what makes a
 * failure actionable, and pairing every route with every width makes the suite
 * report a dozen near-identical failures instead of one.
 *
 * The widths are the ones the hero's own comment commits to, trimmed at the top:
 * 320 (smallest phone still in use), 390 (the common case), 768 (where the phone
 * layout becomes the tablet layout), 1024 (where the desktop nav appears) and
 * 1440 (the widest the container is designed around). 1600 and 1920 add nothing
 * here because every column is already capped by `container-custom` by 1440.
 */

const WIDTHS = [320, 390, 768, 1024, 1440]

/** Resolved at run time so the case-study slug is never hardcoded here. */
async function caseStudyHref(page: import('@playwright/test').Page) {
  await page.goto('/projects', { waitUntil: 'domcontentloaded' })
  const href = await page.locator('a[href^="/projects/"]').first().getAttribute('href')
  return href ?? '/projects'
}

async function measureOverflow(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const doc = document.documentElement
    const offenders = [...document.querySelectorAll<HTMLElement>('body *')]
      .map((el) => ({ el, r: el.getBoundingClientRect() }))
      // `right` past the viewport is what produces a scrollbar. A negative `left`
      // is the deliberate full-bleed on the case-study plate and is not a fault.
      .filter(({ r }) => r.width > 0 && r.right > doc.clientWidth + 1)
      .sort((a, b) => b.r.right - a.r.right)
      .slice(0, 3)
      .map(
        ({ el, r }) =>
          `${el.tagName.toLowerCase()}.${String(el.className).split(' ').slice(0, 2).join('.')} right=${Math.round(r.right)} w=${Math.round(r.width)}`
      )
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      offenders,
    }
  })
}

test.describe('no route overflows horizontally', () => {
  // Same reason as `layout.spec.ts`: this sweep drives its own viewports, which a
  // mobile context cannot do, since its width is fixed by the device descriptor.
  test.skip(({ isMobile }) => !!isMobile, 'runs its own viewport sweep')

  const routes = [
    { name: 'home', resolve: async () => '/' },
    { name: 'projects index', resolve: async () => '/projects' },
    { name: 'case study', resolve: caseStudyHref },
    { name: 'about', resolve: async () => '/about' },
    { name: 'experience', resolve: async () => '/experience' },
    { name: 'certificates', resolve: async () => '/certificates' },
    { name: 'contact', resolve: async () => '/contact' },
    { name: 'resume', resolve: async () => '/resume' },
    { name: '404', resolve: async () => '/this-route-does-not-exist' },
  ]

  for (const route of routes) {
    test(route.name, async ({ page }) => {
      const href = await route.resolve(page)

      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 900 })
        await page.goto(href, { waitUntil: 'domcontentloaded' })
        await settle(page)

        const m = await measureOverflow(page)
        expect(
          m.scrollWidth,
          `${href} at ${width}px -- widest: ${m.offenders.join(' | ') || 'none'}`
        ).toBeLessThanOrEqual(m.clientWidth + 1)
      }
    })
  }
})

test.describe('prose keeps a readable measure at 320px', () => {
  test.skip(({ isMobile }) => !!isMobile, 'runs its own viewport sweep')

  // Overflow alone is not enough. A paragraph can stay inside the viewport and
  // still be unreadable -- squeezed to 180px by a neighbouring grid track, a
  // `max-w-2xl` paragraph reads fine to a geometry check and terribly to a person.
  //
  // The filter is deliberately narrow, because the first version of this check
  // failed on `li w=54 "Home"` and `p w=98 "Contact"`. Those are footer nav links
  // and header eyebrows: shrink-to-fit boxes that are *supposed* to be as wide as
  // their label, and flagging them says nothing about readability. What actually
  // matters is a long run of prose landing in a column too narrow to read, so the
  // test only looks at text long enough to wrap over several lines.
  const MIN_TEXT = 60

  for (const [name, resolve] of [
    ['case study', caseStudyHref],
    ['about', async () => '/about'],
    ['contact', async () => '/contact'],
    ['experience', async () => '/experience'],
    ['certificates', async () => '/certificates'],
  ] as const) {
    test(name, async ({ page }) => {
      const href = await resolve(page)
      await page.setViewportSize({ width: 320, height: 900 })
      await page.goto(href, { waitUntil: 'domcontentloaded' })
      await settle(page)

      const narrow = await page.evaluate((min) => {
        // Measured against the enclosing card, not the viewport.
        //
        // The first version compared against `clientWidth` and flagged
        // `li w=178 of 320` -- a responsibility bullet inside a card that is itself
        // inset by the timeline indent and its own padding, so 178px is 97% of the
        // space it was given. Measuring against the viewport condemns every layout
        // that is deliberately indented.
        //
        // Against the nearest `article`/`section` the ratio means what it should:
        // "this text got less than 70% of the box it was placed in", which is what
        // a flex sibling compressing it looks like.
        const FLOOR = 0.7

        const rows: string[] = []
        for (const el of document.querySelectorAll<HTMLElement>('p, dd, li')) {
          const text = (el.textContent ?? '').trim()
          const r = el.getBoundingClientRect()
          // Long enough that it must wrap. Short labels in a nav or a chip list are
          // legitimately narrow at any width.
          if (text.length < min || r.width === 0) continue

          const box = el.closest('article, section') ?? el.parentElement
          const bw = box?.getBoundingClientRect().width ?? 0
          if (bw === 0) continue

          const ratio = r.width / bw
          if (ratio >= FLOOR) continue

          rows.push(
            `${el.tagName.toLowerCase()} ${Math.round(r.width)} of ${Math.round(bw)} (${Math.round(ratio * 100)}%) "${text.slice(0, 48)}"`
          )
          if (rows.length === 3) break
        }
        return rows
      }, MIN_TEXT)

      expect(
        narrow,
        `prose given under 70% of its containing card at 320px: ${narrow.join(' | ') || 'none'}`
      ).toEqual([])
    })
  }
})
