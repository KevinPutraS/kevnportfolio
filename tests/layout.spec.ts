import { expect, test } from '@playwright/test'
import { settle } from './helpers'

/**
 * The width sweep.
 *
 * Every layout claim in this codebase was arrived at by measuring at specific
 * widths, and the widths are written down in the hero's own comment as the set
 * that matters. Keeping them in a test is what stops a change from quietly
 * breaking 320px while 1440px still looks fine.
 */
const WIDTHS = [320, 360, 390, 430, 768, 1024, 1280, 1440, 1600, 1920]

test.describe('width sweep', () => {
  // `isMobile` rather than a project-name check: the mobile project sets
  // `isMobile: true` through `devices['iPhone 13']`, and this sweep drives its
  // own viewports, which a mobile context cannot do (its width is fixed by the
  // device descriptor and `setViewportSize` cannot change `isMobile`).
  test.skip(({ isMobile }) => !!isMobile, 'runs its own viewport sweep')

  for (const width of WIDTHS) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/')
      await settle(page)

      const overflow = await page.evaluate(() => {
        const doc = document.documentElement
        const widest = [...document.querySelectorAll<HTMLElement>('body *')]
          .map((el) => ({ el, r: el.getBoundingClientRect() }))
          // `width + left` past the viewport is what produces a scrollbar; a
          // negative left is intentional bleed and is not a fault.
          .filter(({ r }) => r.width > 0 && r.right > doc.clientWidth + 1)
          .sort((a, b) => b.r.right - a.r.right)[0]
        return {
          scrollWidth: doc.scrollWidth,
          clientWidth: doc.clientWidth,
          widest: widest ? `${widest.el.tagName.toLowerCase()}.${String(widest.el.className).split(' ')[0]} right=${Math.round(widest.r.right)}` : 'none',
        }
      })

      expect(overflow.scrollWidth, `widest offender: ${overflow.widest}`).toBeLessThanOrEqual(overflow.clientWidth + 1)
    })
  }

  test('the hero shares the page container, not a wider one of its own', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await settle(page)

    // The hero used to carry `lg:max-w-[84rem]` and start its text at x=104 while
    // every section below started at x=200 — a 96px step in the left edge
    // directly under the fold. Both should now resolve to the same left edge.
    const edges = await page.evaluate(() => {
      const heroBox = document.querySelector('section .container-custom')!.getBoundingClientRect()
      const below = document.querySelectorAll('section')[1]?.querySelector('.container-custom')
      return {
        hero: Math.round(heroBox.left),
        below: below ? Math.round(below.getBoundingClientRect().left) : null,
      }
    })

    expect(edges.below).not.toBeNull()
    expect(edges.hero).toBe(edges.below)
  })
})

/**
 * No fixed chrome is allowed to sit on top of the last thing on the page.
 *
 * The bottom tab bar used to be `fixed inset-x-0 bottom-0` and was paid for with
 * a 4rem spacer at the end of every page. Both are gone; this asserts the
 * outcome rather than the absence of a class, so a future fixed bar cannot
 * quietly reintroduce the problem.
 */
test.describe('nothing fixed covers the end of the page', () => {
  test('the footer is reachable at the bottom of the scroll', async ({ page }) => {
    await page.goto('/')
    await settle(page)

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    await page.evaluate(
      () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    )

    const footer = await page.evaluate(() => {
      const f = document.querySelector('footer')!
      const r = f.getBoundingClientRect()
      const hit = document.elementFromPoint(r.left + r.width / 2, Math.min(r.bottom - 4, window.innerHeight - 2))
      return {
        bottom: Math.round(r.bottom),
        viewport: window.innerHeight,
        // The `.page-depth` overlay is fixed and full-height, but it is
        // `pointer-events: none` and never hit-tests.
        topmost: hit ? `${hit.tagName.toLowerCase()}.${String(hit.className).split(' ')[0]}` : 'nothing',
        insideFooter: !!hit?.closest('footer'),
      }
    })

    expect(footer.bottom, 'footer ends below the fold even at full scroll').toBeLessThanOrEqual(footer.viewport + 1)
    expect(footer.insideFooter, `footer bottom is covered by ${footer.topmost}`).toBe(true)
  })

  test('no fixed element over 30px tall is pinned to the bottom of the viewport', async ({ page }) => {
    await page.goto('/')
    await settle(page)

    const bars = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('body *')]
        .filter((el) => {
          const cs = getComputedStyle(el)
          // The grain overlay is fixed and full-height by design; it is
          // `pointer-events: none`, so it cannot intercept anything.
          return cs.position === 'fixed' && cs.bottom === '0px' && cs.pointerEvents === 'auto' && el.getBoundingClientRect().height > 30
        })
        .map((el) => `${el.tagName.toLowerCase()}[${el.getAttribute('aria-label') ?? ''}]`)
    )

    expect(bars, `fixed bottom bar(s) present: ${bars.join(', ')}`).toHaveLength(0)
  })
})
