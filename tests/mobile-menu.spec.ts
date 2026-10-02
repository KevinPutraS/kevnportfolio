import { expect, test, type Page } from '@playwright/test'
import { settle } from './helpers'

/**
 * The navigation drawer has to close when the viewport crosses into desktop.
 *
 * The drawer and its trigger are both `lg:hidden`, but the `MobileMenu` component
 * is not conditional on the breakpoint — it renders the trigger, and the panel is
 * a portal, so `isOpen` outlived the width that made it visible. Rotating a
 * tablet, or dragging a window across 1024px, left it "open" behind a
 * `display: none` overlay, and two things stayed broken at once:
 *
 * - the focus trap holds `body { overflow: hidden }` for as long as it is
 *   mounted, so the page silently stopped scrolling;
 * - the trap's candidate list filters on `offsetParent !== null`, which is null
 *   for everything inside a `display: none` subtree. The list came back empty,
 *   the empty case was "keep the Tab", and so *every* keypress was consumed. The
 *   keyboard was frozen page-wide, with nothing on screen to suggest why —
 *   Escape or a navigation was the only way out.
 *
 * Asserted on the two symptoms rather than on `isOpen`, because neither symptom
 * is visible from the markup: the dialog being absent from the DOM, the scroll
 * lock being released, and the keyboard working again are what a user would
 * actually notice, and the first two are the ones a passing test that only
 * checked visibility would miss — `toBeHidden()` was true either way.
 */

const PHONE = { width: 390, height: 780 }
const DESKTOP = { width: 1100, height: 800 }

const dialog = (page: Page) => page.getByRole('dialog', { name: 'Site navigation' })

/**
 * The panel by id, so a hidden-but-mounted one still counts.
 *
 * `getByRole` resolves only to exposed elements, so it reports zero for a drawer
 * sitting in the DOM behind `display: none` — which is the whole bug. Asserting
 * on the role would have passed with the fix reverted; `locator.count()` counts
 * matches whether or not they are visible, so this one cannot.
 */
const panel = (page: Page) => page.locator('#mobile-navigation')

const bodyOverflow = (page: Page) =>
  page.evaluate(() => document.body.style.overflow)

const activeElement = (page: Page) =>
  page.evaluate(() => {
    const el = document.activeElement
    return el === null ? 'none' : `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}`
  })

test.describe('navigation drawer across the breakpoint', () => {
  test('hands the page back when it grows past lg', async ({ page }) => {
    await page.setViewportSize(PHONE)
    await page.goto('/')
    await settle(page)

    await page.getByRole('button', { name: 'Open menu' }).click()
    await expect(dialog(page)).toBeVisible()
    // Armed. Without this the assertions after the resize could pass for the
    // wrong reason — a trap that never locked anything has nothing to release.
    expect(await bodyOverflow(page), 'the drawer did not lock the scroll').toBe('hidden')

    await page.setViewportSize(DESKTOP)
    // The matchMedia listener fires on the next task, so wait for the teardown
    // rather than sampling the DOM mid-flight.
    await expect(panel(page), 'the panel is still mounted behind the desktop nav').toHaveCount(0)
    await expect(dialog(page)).toHaveCount(0)

    expect(await bodyOverflow(page), 'the scroll lock outlived the drawer').not.toBe('hidden')

    // Focus was inside the panel when it unmounted, so it fell to the body.
    // Tab from there has to move it — before the fix this keypress was eaten by
    // the still-mounted trap.
    await page.keyboard.press('Tab')
    expect(await activeElement(page), 'Tab was swallowed; the keyboard is frozen').not.toBe('body')
  })

  test('still traps and closes normally on a phone', async ({ page }) => {
    await page.setViewportSize(PHONE)
    await page.goto('/')
    await settle(page)

    const trigger = page.getByRole('button', { name: 'Open menu' })
    await trigger.click()
    await expect(dialog(page)).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(panel(page)).toHaveCount(0)
    await expect(dialog(page)).toHaveCount(0)
    expect(await bodyOverflow(page)).not.toBe('hidden')
    // Focus goes back where it came from, which is the part of the contract that
    // a bare "it closed" assertion would miss.
    await expect(trigger).toBeFocused()
  })
})
