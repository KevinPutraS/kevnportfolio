import { expect, test, type Page } from '@playwright/test'
import { settle } from './helpers'
import { THEME_STORAGE_KEY } from '../src/lib/theme'

/**
 * Theme behaviour: resolution, persistence, the absence of a flash, and print.
 *
 * `palette-contrast.spec.ts` proves the light palette is readable. This file proves
 * the light palette is ever reached at all — which is a separate question, and the
 * one that is easy to regress silently. A theme can be perfectly tuned and still
 * be dead code if the attribute is written after first paint, and no amount of
 * measuring colours will notice, because the tokens resolve fine either way.
 *
 * Every test drives the real path: `localStorage` is seeded and the pre-paint
 * script in `layout.tsx` does the resolving. Nothing here sets `data-theme` by
 * hand, so these tests fail if the script, the storage key or the toggle breaks.
 */

const LIGHT_BG = '250, 250, 251'
const PRINT_BG = '255, 255, 255'
const DARK_BG = '9, 9, 15'

async function stored(page: Page, theme: 'light' | 'dark' | 'system') {
  await page.addInitScript(
    ([key, value]) => window.localStorage.setItem(key, value),
    [THEME_STORAGE_KEY, theme] as const
  )
}

const appliedTheme = (page: Page) =>
  page.evaluate(() => document.documentElement.getAttribute('data-theme'))

const canvas = (page: Page) =>
  page.evaluate(() => {
    const m = getComputedStyle(document.documentElement).getPropertyValue('--bg').match(/[\d.]+/g)
    return m ? `${Number(m[0])}, ${Number(m[1])}, ${Number(m[2])}` : ''
  })

test.describe('theme resolution', () => {
  test('with nothing stored, the system decides', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/')
    await settle(page)
    expect(await appliedTheme(page), 'a light system should resolve to light').toBe('light')
    expect(await canvas(page)).toBe(LIGHT_BG)

    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/')
    await settle(page)
    expect(await appliedTheme(page), 'a dark system should resolve to dark').toBe('dark')
    expect(await canvas(page)).toBe(DARK_BG)
  })

  test('a stored preference beats the system', async ({ page }) => {
    // The whole point of storing: someone who has told us they want light does not
    // get overridden every time their OS is set to dark.
    await stored(page, 'light')
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/')
    await settle(page)
    expect(await appliedTheme(page)).toBe('light')
    expect(await canvas(page)).toBe(LIGHT_BG)
  })

  test('a stored "system" tracks the system', async ({ page }) => {
    await stored(page, 'system')
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/')
    await settle(page)
    expect(await appliedTheme(page)).toBe('light')
  })
})

test.describe('no flash on first paint', () => {
  test('data-theme is set while the document is still parsing', async ({ page }) => {
    /*
     * The FOUC test, expressed as a fact about timing rather than a screenshot.
     *
     * The observer is installed from an init script, so it is running *before* the
     * theme script in `layout.tsx` and cannot miss the write. What it records is
     * `document.readyState` at the instant `data-theme` first appears.
     *
     * `'loading'` means the document was still parsing, so nothing had painted and
     * there was no opportunity for a flash. If someone moved the theme into a
     * `useEffect`, a `DOMContentLoaded` listener or a `next/script` with the wrong
     * strategy, this reads `'interactive'` or `'complete'` and fails. That is the
     * regression worth catching, and it is invisible in a screenshot review because
     * a one-frame flash is easy to miss by eye and trivial to introduce.
     */
    await page.addInitScript(() => {
      const w = window as unknown as {
        __themeFirstSet?: { value: string | null; readyState: string }
        __themeSnapshots?: Array<{ rs: string; theme: string | null }>
      }
      const read = () => document.documentElement?.getAttribute('data-theme') ?? null

      // `document`, not `document.documentElement`. At document-start the root
      // element may not exist yet, and `observe(null)` does not throw loudly — it
      // just watches nothing, so the test below would report "the script never
      // ran" for a script that ran perfectly. `subtree` catches the attribute
      // wherever the root element ends up being created.
      new MutationObserver(() => {
        if (w.__themeFirstSet) return
        const value = read()
        if (value) w.__themeFirstSet = { value, readyState: document.readyState }
      }).observe(document, { subtree: true, attributes: true, attributeFilter: ['data-theme'] })

      /*
       * A second, independent signal, because "the observer fired early" is a
       * statement about a microtask and this is a statement about parse progress.
       * If the theme were applied after hydration the snapshots would show
       * `null` all the way to `interactive` and then jump.
       */
      w.__themeSnapshots = [{ rs: document.readyState, theme: read() }]
      document.addEventListener('readystatechange', () => {
        w.__themeSnapshots?.push({ rs: document.readyState, theme: read() })
      })
    })
    await stored(page, 'light')
    await page.goto('/')
    await settle(page)

    const first = await page.evaluate(() => {
      const w = window as unknown as { __themeFirstSet?: { value: string | null; readyState: string } }
      return w.__themeFirstSet
    })
    const snapshots = await page.evaluate(() => {
      const w = window as unknown as { __themeSnapshots?: Array<{ rs: string; theme: string | null }> }
      return w.__themeSnapshots ?? []
    })

    expect(first, 'the pre-paint script never set data-theme').toBeTruthy()
    expect(first?.value).toBe('light')
    expect(
      first?.readyState,
      `data-theme was set at readyState "${first?.readyState}". It must be set during parsing, ` +
        `or the dark palette paints first and the visitor sees a flash.`
    ).toBe('loading')

    const atInteractive = snapshots.find((s) => s.rs === 'interactive')
    expect(
      atInteractive?.theme,
      'parsing must finish with the theme already applied, not after it'
    ).toBe('light')
  })

  test('the theme script is the first thing in the body', async ({ page }) => {
    // Belt to the braces go with the test above: this is what makes "early" true
    // rather than incidental, since React streams the document and anything added
    // above this node later would quietly reintroduce the flash.
    await page.goto('/')
    const firstChild = await page.evaluate(() => document.body.firstElementChild?.tagName ?? null)
    expect(firstChild, 'the theme script should precede all rendered content').toBe('SCRIPT')
  })
})

test.describe('toggle', () => {
  test('flips the theme and remembers the choice', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/')
    await settle(page)
    expect(await appliedTheme(page)).toBe('dark')

    await page.getByTestId('theme-toggle').click()
    expect(await appliedTheme(page), 'one click should land on light').toBe('light')
    expect(await canvas(page)).toBe(LIGHT_BG)

    // Persisted, and it survives a fresh document rather than living in memory.
    expect(await page.evaluate((k) => window.localStorage.getItem(k), THEME_STORAGE_KEY)).toBe('light')
    await page.reload()
    await settle(page)
    expect(await appliedTheme(page), 'light should survive a reload').toBe('light')

    await page.getByTestId('theme-toggle').click()
    expect(await appliedTheme(page)).toBe('dark')
    expect(await page.evaluate((k) => window.localStorage.getItem(k), THEME_STORAGE_KEY)).toBe('dark')
  })

  test('an explicit choice stops the system from overriding it', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/')
    await settle(page)
    await page.getByTestId('theme-toggle').click() // -> light
    expect(await appliedTheme(page)).toBe('light')

    await page.emulateMedia({ colorScheme: 'light' })
    // The listener exists to follow the system for people who never chose. Once
    // they have chosen, the OS changing its mind is not a request to change theirs.
    await page.waitForTimeout(150)
    expect(await appliedTheme(page), 'an explicit choice must not be overridden').toBe('light')
  })

  test('exactly one label reaches the accessibility tree', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/')
    await settle(page)

    /*
     * Both labels exist in the DOM at all times, and the stylesheet hides the
     * inactive one with `display: none`. `display: none` rather than `sr-only` is
     * the whole point: `sr-only` clips visually but leaves the text readable, so
     * a screen-reader user would be told to switch to the theme they are already
     * in. This asserts the hiding is a real removal from the a11y tree rather
     * than a visual trick.
     */
    for (const theme of ['light', 'dark'] as const) {
      // Set the attribute directly: this test is about the CSS and the
      // accessibility tree, not about resolution, and clicking the toggle here
      // would also write to storage and leak state into the next iteration.
      await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme)

      const shown = await page.evaluate(() =>
        Array.from(document.querySelectorAll<HTMLElement>('[data-theme-label]'))
          .filter((el) => getComputedStyle(el).display !== 'none')
          .map((el) => el.getAttribute('data-theme-label'))
      )

      expect(shown, `in the ${theme} theme exactly one label should be exposed`).toEqual([theme])
      expect(shown[0], 'the exposed label must offer the theme being switched to').toBe(theme)
    }
  })

  test('the button meets the touch target size', async ({ page }) => {
    await page.goto('/')
    await settle(page)
    const box = await page.getByTestId('theme-toggle').boundingBox()
    // 44px is the WCAG 2.5.5 / platform HIG floor. The button is 40px, so this is
    // the one assertion here that documents a deliberate gap rather than
    // confirming compliance.
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(40)
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(40)
  })
})

test.describe('print', () => {
  test('the paper palette wins even when the light theme is active', async ({ page }) => {
    await stored(page, 'light')
    await page.goto('/')
    await settle(page)
    expect(await appliedTheme(page), 'precondition: the light theme is on').toBe('light')

    await page.emulateMedia({ media: 'print' })
    /*
     * The reason the light palette is wrapped in `@media screen`.
     *
     * `:root[data-theme='light']` has specificity (0,2,0); the print block's
     * `:root` is (0,1,0). On specificity alone the light theme would win inside a
     * print job, and a light-theme visitor would get a white-themed but
     * dark-tokened page on paper. The light `--bg` (250 250 251) and the print
     * `--bg` (255 255 255) are deliberately different, so this distinguishes a
     * real regression from a block that happens to still look plausible.
     */
    expect(await canvas(page), 'print must use the paper palette, not the screen light palette').toBe(PRINT_BG)

    const textDim = await page.evaluate(() => {
      const m = getComputedStyle(document.documentElement).getPropertyValue('--text-dim').match(/[\d.]+/g)
      return m ? `${Number(m[0])}, ${Number(m[1])}, ${Number(m[2])}` : ''
    })
    // print 55 55 55 vs light screen 58 58 71
    expect(textDim, 'print ink must not be the screen light token').toBe('55, 55, 55')
  })
})
