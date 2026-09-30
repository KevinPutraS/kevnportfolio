import { expect, test } from '@playwright/test'
import { settle } from './helpers'

/**
 * The name, and the mark after it.
 *
 * The mark is a regression test in its own right. It was `hidden` with no
 * override below `lg`, so a phone rendered a bare "Kevin" and only wide
 * viewports got the full stop that the navbar wordmark sets. The element was in
 * the markup the whole time and visible in the source; only a rendered check at
 * a narrow width could see it.
 */
test.describe('hero name', () => {
  test('carries the accent mark at every width', async ({ page }) => {
    await page.goto('/')
    await settle(page)

    const mark = page.locator('h1 span[aria-hidden="true"]').first()
    await expect(mark).toBeVisible()

    const box = await mark.boundingBox()
    const h1 = await page.locator('h1').first().boundingBox()
    // Inside the heading, so it is a mark on the name and not a stray block.
    expect(box!.y).toBeGreaterThan(h1!.y)
    expect(box!.y + box!.height).toBeLessThan(h1!.y + h1!.height + 1)
    // Sits to the right of the name text, not under it.
    expect(box!.x).toBeGreaterThan(h1!.x)
  })

  test('the mark is sized relative to the type, not fixed', async ({ page }) => {
    await page.goto('/')
    await settle(page)

    const size = await page.evaluate(() => {
      const mark = document.querySelector('h1 span[aria-hidden="true"]') as HTMLElement
      const r = mark.getBoundingClientRect()
      return { mark: r.width, fontSize: Number.parseFloat(getComputedStyle(mark.parentElement!).fontSize) }
    })

    // `em`-sized, so it tracks the fluid display type. A fixed px value here is
    // the regression: at 390px the mark is ~9px and at 1440px it is ~29px.
    expect(size.mark / size.fontSize).toBeGreaterThan(0.1)
    expect(size.mark / size.fontSize).toBeLessThan(0.45)
  })
})

/**
 * The reading order the hero is required to have on a phone: metadata, name,
 * introduction, the two calls to action, and only then the site index. The index
 * is pushed below with `order-2`, so DOM order and visual order disagree by
 * design — which means this can only be checked from geometry.
 */
test.describe('mobile reading order', () => {
  test.skip(({ isMobile }) => !isMobile, 'the layout only stacks below lg')

  test('reads metadata, name, statement, actions, index', async ({ page }) => {
    await page.goto('/')
    await settle(page)

    const tops = await page.evaluate(() => {
      const section = document.querySelector('section')!
      const pick = (sel: string) => {
        const el = section.querySelector(sel)!
        return el.getBoundingClientRect().top
      }
      return {
        metadata: pick('.container-custom > div:first-child'),
        name: pick('h1'),
        index: pick('aside'),
        primaryCta: pick('a[href="/projects"]'),
        secondaryCta: pick('a[href="/about"]'),
      }
    })

    expect(tops.metadata).toBeLessThan(tops.name)
    expect(tops.name).toBeLessThan(tops.primaryCta)
    expect(tops.secondaryCta).toBeGreaterThan(tops.primaryCta - 1)
    // The index comes after both calls to action: the work is one tap away before
    // a visitor is asked to browse a table of contents.
    expect(tops.index).toBeGreaterThan(tops.secondaryCta)
  })
})
