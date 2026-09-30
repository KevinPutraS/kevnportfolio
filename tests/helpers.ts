import { expect, test } from '@playwright/test'

/**
 * Freeze the page before measuring anything.
 *
 * The hero fades in on mount and the backdrop drifts on a long animation, so a
 * measurement taken during either one is a measurement of a different page than
 * the one that ships. `waitForLoadState` does not help: both animations are
 * CSS, already running by the time it resolves.
 */
export async function settle(page: import('@playwright/test').Page) {
  await page.waitForLoadState('domcontentloaded')
  // `networkidle` because the suite runs these in parallel against one dev
  // server: a section can still be streaming in when the assertions run, and a
  // measurement that depends on how much of the page exists is a measurement of
  // the machine's load rather than of the layout. Observed as exactly that — a
  // pass at 111 elements in isolation and a different count under 50 workers.
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
  await page.addStyleTag({
    content:
      '*,*::before,*::after{animation:none !important;transition:none !important;transform:none !important;will-change:auto !important}',
  })
  // One frame so the style above has been applied and layout has recalculated.
  await page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  )
}

/** The public shell's `<header>`. Kept as a helper so a selector change is one edit. */
export function header(page: import('@playwright/test').Page) {
  return page.locator('header').first()
}
