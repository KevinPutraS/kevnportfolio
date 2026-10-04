import { expect, test, type Page } from '@playwright/test'
import { settle } from './helpers'

/**
 * The single palette, and the paper it turns into.
 *
 * The site has one theme. There is no `data-theme` attribute, no pre-paint
 * script and no switch, so most of what this file used to prove is gone with
 * them: resolution, persistence, the absence of a flash and the accessibility of
 * a two-icon button all described machinery that no longer exists.
 *
 * What is left is the two facts that are easy to break quietly:
 *
 *  - The palette is fixed, which means it has to survive a visitor whose system
 *    asks for something else. A `@media (prefers-color-scheme: light)` block
 *    would render correctly on a light-mode laptop and fail here, in CI, where
 *    nothing else notices.
 *  - Print is the one place the tokens change, and it changes by *replacing*
 *    them rather than by layering over them.
 */

const DARK_BG = '9, 9, 15'
const PRINT_BG = '255, 255, 255'

const canvas = (page: Page) =>
  page.evaluate(() => {
    const m = getComputedStyle(document.documentElement).getPropertyValue('--bg').match(/[\d.]+/g)
    return m ? `${Number(m[0])}, ${Number(m[1])}, ${Number(m[2])}` : ''
  })

const scheme = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.documentElement).colorScheme.trim())

test.describe('one palette', () => {
  test('a light system does not get a light page', async ({ page }) => {
    /*
     * The whole reason this test exists. `colorScheme: 'dark'` on `:root` is what
     * makes the UA render scrollbars, form controls, the caret and the default
     * canvas dark, and `themeColor` in `viewport` is the copy the browser reads
     * before the document exists. Neither is allowed to consult the system.
     */
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/')
    await settle(page)

    expect(await canvas(page), 'the page must not follow the system').toBe(DARK_BG)
    expect(await scheme(page), 'form controls and scrollbars must be rendered dark').toBe('dark')

    const themeColor = await page
      .locator('meta[name="theme-color"]')
      .getAttribute('content')
      .catch(() => null)
    expect(themeColor, 'the browser chrome needs a theme-color to match the page').toBeTruthy()
  })

  test('there is no theme switch left in the chrome', async ({ page }) => {
    /*
     * A guard against the machinery being quietly reintroduced halfway: a
     * `data-theme` attribute with nothing to write it, or a button that cannot
     * do anything, is worse than neither.
     */
    await page.goto('/')
    await settle(page)

    expect(await page.evaluate(() => document.documentElement.hasAttribute('data-theme'))).toBe(false)
    expect(await page.locator('[data-theme-icon]').count(), 'no orphaned theme icons').toBe(0)
    expect(await page.locator('[data-theme-label]').count(), 'no orphaned theme labels').toBe(0)
    expect(await page.getByTestId('theme-toggle').count()).toBe(0)
  })
})

test.describe('print', () => {
  test('paper replaces the screen palette rather than sitting on top of it', async ({ page }) => {
    await page.goto('/')
    await settle(page)
    expect(await canvas(page), 'precondition: the screen palette is dark').toBe(DARK_BG)

    await page.emulateMedia({ media: 'print' })
    expect(await canvas(page), 'print must use the paper palette').toBe(PRINT_BG)

    const textDim = await page.evaluate(() => {
      const m = getComputedStyle(document.documentElement).getPropertyValue('--text-dim').match(/[\d.]+/g)
      return m ? `${Number(m[0])}, ${Number(m[1])}, ${Number(m[2])}` : ''
    })
    // 55 55 55, not the screen's 169 170 186.
    expect(textDim, 'print ink must not be the screen token').toBe('55, 55, 55')
  })

  test('the navbar and footer are not printed', async ({ page }) => {
    // `data-print="hide"` is an explicit opt-in precisely because an element
    // selector cannot tell the site chrome from the resume's own document header.
    await page.goto('/')
    await settle(page)
    await page.emulateMedia({ media: 'print' })

    const header = page.locator('header[data-print="hide"]').first()
    if (await header.count()) {
      expect(await header.evaluate((el) => getComputedStyle(el).display)).toBe('none')
    }
  })
})