import { expect, test } from '@playwright/test'
import { settle } from './helpers'

/**
 * The resume preview must not resize the page after it has painted.
 *
 * `/resume` is the one route that is a *measuring machine*: the sheets cannot be
 * drawn until `ResumePreview` has laid the document out off-screen and read every
 * run's height back. Before this was fixed, the scroller was sized to its content
 * — which, before any sheet existed, is nothing — so it held 0px against a final
 * 2206px on a 1440px desktop. The footer rendered directly under the header and
 * then jumped the length of the document about 250ms later.
 *
 * Measured on a production build, that was a Cumulative Layout Shift of **0.319**
 * — "poor" by the standard, and one of the few defects here a visitor feels
 * rather than reads about. Every other route measured 0.0001.
 *
 * **What is asserted, and why not a budget.** CLS is not asserted here, and it is
 * worth being explicit about why, because the obvious version of this test is
 * wrong twice over. A CLS budget needs a production build behind it, which makes
 * the test either slow or dependent on a build that may not exist; and it fails
 * on *any* source of instability on the page, so it cannot say which change broke
 * it.
 *
 * Instead this measures the one property that has to hold: the viewer's height on
 * the first frame that has the DOM, and on the frame after the document has been
 * measured and drawn. Same viewport, same page, two numbers. That is immune to
 * machine speed, to network latency, to whether the build is the one under test —
 * and it fails for exactly one reason, which is the reason the bug existed.
 */
const viewerBox = (page: import('@playwright/test').Page) =>
  page.evaluate(() => {
    const el = document.querySelector('.resume-scroller')
    if (!el) throw new Error('no .resume-scroller — has the viewer been renamed?')
    const { height } = el.getBoundingClientRect()
    const footer = document.querySelector('footer')?.getBoundingClientRect()
    return { height: Math.round(height), footerTop: footer ? Math.round(footer.top) : null }
  })

/** Half a pixel: this is about two numbers agreeing, not about subpixel layout. */
const FIT = 0.5

test.describe('resume viewer stability', () => {
  for (const [label, width, height] of [
    ['a phone', 390, 780],
    ['a desktop', 1440, 900],
  ] as const) {
    test(`the page does not grow under the reader on ${label}`, async ({ page }) => {
      await page.setViewportSize({ width, height: height })

      /*
       * `commit` rather than `load`: the question is what the browser had when it
       * first painted, and waiting for `load` waits for the hydration that is
       * supposed to be the *second* half of this comparison.
       */
      await page.goto('/resume', { waitUntil: 'commit' })
      await page.waitForSelector('.resume-scroller')

      /*
       * Both of these are about making `before` mean something, and neither of
       * them hides the bug this file exists for.
       *
       * **The stylesheet.** The reservation is a `max-height` in CSS, and Next
       * injects that from JS — so `commit` plus a selector is a race with the
       * stylesheet, not the unmeasured state. Before the CSS lands the scroller
       * has no cap and no height, and the delta reported is the stylesheet
       * arriving rather than the viewer resizing itself. That is why this file
       * was reliable in isolation and failed under the suite's parallel workers:
       * the assertion was measuring the machine's load, wearing the costume of a
       * layout bug. The original failure — a scroller sized to its content, 0px
       * against a final 2206px — is 0px with the stylesheet applied just as much
       * as without it, so waiting for the reservation catches it still.
       *
       * **The webfont.** Fonts are loaded with `display: 'swap'`, which is
       * correct for this site and is not going to change: the display face is the
       * identity, and permanently falling back to `system-ui` for a first-time
       * visitor would be a worse outcome than a reflow. But a swap does reflow,
       * and on a 390px screen the lede above the viewer rewraps by two lines when
       * it lands — measured at 29px, with the viewer's own height correctly
       * unchanged at 624px in both samples. Asserting on that would be asserting
       * that the webfont arrives before first paint, which is not a property of
       * this page and not reliably true of any page.
       *
       * So `before` is taken with the stylesheet applied and the fonts resolved:
       * styled, typeset, and unmeasured. That is the state the viewer is supposed
       * to hold still across. Anything that moves after that is the viewer's own
       * measurement, which is the subject of this file. Font loading is a real
       * source of layout shift and deserves its own budget somewhere else; it is
       * not this assertion's job, and folding it in only made this one flaky.
       */
      await page.waitForFunction(() => {
        const el = document.querySelector('.resume-scroller')
        return !!el && getComputedStyle(el).maxHeight !== 'none'
      })
      await page.evaluate(() => document.fonts.ready)
      await page.evaluate(
        () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
      )

      // The frame before the sheets exist: no measurement, no scale, nothing.
      const before = await viewerBox(page)

      // Now let hydration, measurement and pagination finish.
      await settle(page)
      await page.waitForFunction(() => document.querySelectorAll('[data-sheet]').length > 0)
      const after = await viewerBox(page)

      expect(after.height, 'the viewer was resized by its own measurement').toBeCloseTo(
        before.height,
        0
      )
      expect(Math.abs((after.footerTop ?? 0) - (before.footerTop ?? 0))).toBeLessThanOrEqual(FIT)
    })
  }

  test('the document scrolls by exactly the height it is painted at', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 780 })
    await page.goto('/resume')
    await settle(page)
    await page.waitForFunction(() => document.querySelectorAll('[data-sheet]').length > 0)

    const scroller = await page.evaluate(() => {
      const el = document.querySelector('.resume-scroller') as HTMLElement
      return {
        client: el.clientHeight,
        // The scrollable height, which is what a scrollbar reports.
        scroll: el.scrollHeight,
        // The painted height of the stack, read through its own transform.
        painted: Math.round(
          document.querySelector('.resume-stack')!.getBoundingClientRect().height
        ),
      }
    })

    /*
     * `.resume-stack` is `position: absolute` inside `.resume-sizer` precisely so
     * this holds. Its layout box is 210mm wide and unscaled, and a scroller that
     * can scroll that reports room that does not exist: on a phone, 3369px of
     * scroll for 1516px of document, with 1853px of blank paper at the end.
     *
     * A few pixels of slack, because `scrollHeight` rounds up.
     */
    expect(
      scroller.scroll,
      'the scroller offers more scroll than there is document'
    ).toBeLessThanOrEqual(Math.ceil(scroller.painted) + 2)
    expect(scroller.scroll).toBeGreaterThan(scroller.client)
  })
})

test.describe('resume preview on paper', () => {
  test('nothing about the screen cap reaches the printed document', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/resume')
    await settle(page)
    await page.waitForFunction(() => document.querySelectorAll('[data-sheet]').length > 0)
    await page.emulateMedia({ media: 'print' })

    const printed = await page.evaluate(() => {
      const scroller = document.querySelector('.resume-scroller') as HTMLElement
      const stack = document.querySelector('.resume-stack') as HTMLElement
      const sheets = [...document.querySelectorAll('[data-sheet]')] as HTMLElement[]
      const css = (el: Element, prop: string) => getComputedStyle(el).getPropertyValue(prop)
      return {
        maxHeight: css(scroller, 'max-height'),
        overflow: css(scroller, 'overflow'),
        position: css(stack, 'position'),
        transform: css(stack, 'transform'),
        width: Math.round(stack.getBoundingClientRect().width),
        sheets: sheets.length,
        clipped: sheets
          .filter((s) => s.scrollHeight > s.clientHeight + 1)
          .map((s) => `sheet ${s.dataset.sheet}: ${s.scrollHeight}px of content in ${s.clientHeight}px`),
        measuringHost: css(document.querySelector('.resume-measure') as Element, 'display'),
      }
    })

    /*
     * The screen caps the viewer at one viewport so the page cannot reflow under
     * the reader. On paper that cap would be a page-deleting bug rather than a
     * layout one: `.resume-stack` is out of flow inside `.resume-sizer` and scaled
     * by a transform, so the whole reset is three declarations, and each of them
     * is load-bearing.
     */
    expect(printed.maxHeight, 'the screen cap survived into print').toBe('none')
    expect(printed.overflow, 'the scroller is still a scroll container on paper').toBe('visible')
    expect(printed.position, 'the stack is still out of flow on paper').toBe('static')
    expect(printed.transform, 'the screen scale is still applied on paper').toBe('none')
    expect(printed.measuringHost, 'the off-screen measuring pass would print as a blank page').toBe(
      'none'
    )
    // 210mm at the print viewport, not the 794px preview box: this is what catches
    // the sheet inheriting a screen width and running off the paper.
    expect(printed.width).toBeGreaterThan(600)
    expect(printed.sheets).toBeGreaterThan(0)
    expect(printed.clipped, 'a clipped sheet is a deleted line on someone\'s CV').toEqual([])
  })
})