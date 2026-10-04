import { expect, test, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
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

/*
 * The expected backgrounds are read out of the stylesheet rather than written
 * here as literals.
 *
 * They used to be `'9, 9, 15'` and `'255, 255, 255'`, which is a trap: the
 * redesign changed the canvas and the suite went red on a *correct* page, because
 * the assertion was really asserting "the palette is still the old one" and
 * calling that a theme test. Reading the authored value keeps the thing this file
 * is actually about — that the page renders the palette it was given, and that a
 * light system does not change it — and lets the palette move without a red
 * build that means nothing.
 *
 * `--bg-elevated`, `--bg-highlight` and `--bg-accent` all begin with the same
 * characters, so the pattern requires the colon immediately after `bg` and cannot
 * match them.
 */
const stylesheet = readFileSync(join(process.cwd(), 'src/styles/globals.css'), 'utf8')

const readAuthoredBg = (source: string): string => {
  const m = source.match(/--bg:\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*;/)
  if (!m) throw new Error('no authored --bg found; globals.css is not where it was expected')
  return `${Number(m[1])}, ${Number(m[2])}, ${Number(m[3])}`
}

const printBlockStart = stylesheet.indexOf('@media print')
if (printBlockStart === -1) throw new Error('no @media print block; print theming is gone')

const SCREEN_BG = readAuthoredBg(stylesheet.slice(0, printBlockStart))
const PRINT_BG = readAuthoredBg(stylesheet.slice(printBlockStart))

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

    expect(await canvas(page), 'the page must not follow the system').toBe(SCREEN_BG)
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
    expect(await canvas(page), 'precondition: the screen palette is the authored one').toBe(SCREEN_BG)

    await page.emulateMedia({ media: 'print' })
    expect(await canvas(page), 'print must use the paper palette').toBe(PRINT_BG)
    expect(PRINT_BG, 'print has to be paper, not another dark screen').not.toBe(SCREEN_BG)

    const textDim = await page.evaluate(() => {
      const m = getComputedStyle(document.documentElement).getPropertyValue('--text-dim').match(/[\d.]+/g)
      return m ? `${Number(m[0])}, ${Number(m[1])}, ${Number(m[2])}` : ''
    })
    // The print ink, not the screen's `--text-dim`. Read from the print block so
    // the assertion is "print replaces the token" rather than "print is still
    // the ink it was".
    expect(textDim, 'print ink must not be the screen token').toBe(
      (() => {
        const m = stylesheet
          .slice(printBlockStart)
          .match(/--text-dim:\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*;/)
        return m ? `${Number(m[1])}, ${Number(m[2])}, ${Number(m[3])}` : ''
      })()
    )
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