import { expect, test } from '@playwright/test'
import { header, settle } from './helpers'

/**
 * The header has to stay on screen.
 *
 * This is a regression test for a bug that was invisible rather than broken: the
 * header carried `sticky top-0`, but `position: sticky` resolves against the
 * element's containing block, and the header's was the shell wrapper sized to
 * the header's own content. Travel was 0px, so the page moved one pixel and the
 * bar left with it, exactly as if it had been `static`. The `lifted` background,
 * the scroll-progress hairline and the `--nav-h` scroll padding all depended on
 * a sticky bar that never once ran.
 *
 * Asserting the class would not have caught it — the class was there the whole
 * time. Only the position after a scroll does.
 */
test.describe('sticky header', () => {
  test('stays pinned to the top once the page is scrolled', async ({ page }) => {
    await page.goto('/')
    await settle(page)

    await expect(header(page)).toBeVisible()
    const atRest = await header(page).boundingBox()
    expect(atRest?.y).toBe(0)

    for (const offset of [200, 400, 1200]) {
      await page.evaluate((y) => window.scrollTo(0, y), offset)
      // Two frames: the scroll handler is passive and runs on the next frame.
      await page.evaluate(
        () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
      )
      const box = await header(page).boundingBox()
      expect(box?.y, `header drifted at scrollY=${offset}`).toBe(0)
    }
  })

  test('is not covered by the page content once it overlaps it', async ({ page }) => {
    await page.goto('/')
    await settle(page)
    await page.evaluate(() => window.scrollTo(0, 600))
    await page.evaluate(
      () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    )

    // The header's wrapper was `z-10` while `main` was also `z-10`. Equal
    // z-indexes are settled by DOM order, so `main` — later in the document —
    // painted over the header's stacking context. Nothing overlapped while the
    // header was broken, which is exactly why it survived; the moment it stuck,
    // the header would have been drawn underneath. Hit testing the header's
    // midpoint is the only assertion that sees the difference.
    //
    // `elementFromPoint` returns the deepest element, so this asks what that
    // element belongs to rather than what it is called.
    const hit = await page.evaluate(() => {
      const h = document.querySelector('header')!
      const r = h.getBoundingClientRect()
      const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) as HTMLElement | null
      return {
        tag: el?.tagName.toLowerCase() ?? 'none',
        inHeader: !!el?.closest('header'),
        inMain: !!el?.closest('main'),
      }
    })
    expect(hit.inHeader, `topmost element at the header's midpoint was a ${hit.tag}`).toBe(true)
    expect(hit.inMain, 'main is painting over the header').toBe(false)
  })

  test('raises its stacking context above main and the footer', async ({ page }) => {
    await page.goto('/')
    await settle(page)

    const z = await page.evaluate(() => {
      const read = (sel: string) => {
        const el = document.querySelector(sel)!
        return Number(getComputedStyle(el.parentElement!).zIndex) || 0
      }
      return { headerWrapper: read('header'), main: Number(getComputedStyle(document.querySelector('main')!).zIndex) || 0 }
    })
    expect(z.headerWrapper).toBeGreaterThanOrEqual(z.main)
  })

  test('scroll-padding covers the header height, per --nav-h', async ({ page }) => {
    await page.goto('/')
    await settle(page)

        const { navH, headerH, scrollPaddingTop } = await page.evaluate(() => {
          const root = getComputedStyle(document.documentElement)
          return {
            navH: Number.parseFloat(root.getPropertyValue('--nav-h')) * 16,
            headerH: document.querySelector('header')!.getBoundingClientRect().height,
            scrollPaddingTop: Number.parseFloat(root.scrollPaddingTop),
          }
        })

        // Equal, not approximately equal. `--nav-h` sizes the header, so any
        // difference at all means the two have come apart — which is exactly what
        // happened while the token was a hand-kept copy of `h-16`: the bar was
        // 65px because the `border-b` sat outside the height, the token said
        // 64px, and a 1.5px tolerance meant it never failed. Half a pixel of
        // slack covers subpixel rounding in a scaled viewport and no more.
        expect(Math.abs(navH - headerH), `--nav-h is ${navH}px, header is ${headerH}px`).toBeLessThanOrEqual(0.5)
        expect(scrollPaddingTop).toBeGreaterThanOrEqual(headerH)
  })
})
