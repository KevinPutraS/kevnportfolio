import { expect, test } from '@playwright/test'
import { classListIn, settle, sourceOf } from './helpers'

/**
 * Controls a thumb has to hit must be big enough to hit.
 *
 * The three controls measured here were 32px, 32px and 36px — all of them below
 * the 44px that a fingertip needs, and all of them in the CMS, which is the part
 * of this site that gets used on a phone the most. Nothing about them was broken
 * in a way a test could see: each was a real `<button>` with an accessible name,
 * keyboard-reachable, visible, enabled. Each was simply smaller than a thumb,
 * which is a target-size bug and not an accessibility-tree one, so no assertion
 * about markup or names could ever have caught it.
 *
 * **Why this measures class lists read out of the source.** `/admin` sits behind
 * Supabase Auth, so the real components cannot be rendered without a session and a
 * test needing credentials is a test that does not run. The class lists are read
 * from the component files and applied to probe elements, so what is measured is
 * the shipped Tailwind — if the components change, this measures the change
 * rather than a copy that was correct once. Same trade-off as
 * `tests/admin-chrome.spec.ts`, including its blind spot: markup that renders a
 * different element than the one whose classes were read would not be caught.
 *
 * `sm:` is resolved by giving the page a phone viewport and a desktop one, so the
 * two-tier treatments are checked as geometry rather than as strings.
 */

/** The `X` on a technology chip in the project form. */
const CHIP_REMOVE = classListIn(
  sourceOf('src/components/admin/project-form.tsx'),
  'sm:h-8 sm:w-8'
)

/** "Upload image" / "Replace image" on the thumbnail uploader. */
const UPLOAD = classListIn(
  sourceOf('src/components/admin/image-uploader.tsx'),
  'bg-[rgb(var(--surface-elevated))] px-3 text-xs transition-colors'
)

/** "Remove" beside it. */
const UPLOAD_REMOVE = classListIn(
  sourceOf('src/components/admin/image-uploader.tsx'),
  'px-3 text-xs text-[rgb(var(--text-muted))] transition-colors hover:border'
)

/**
 * A sidebar nav row. Not one of the three that were too small — measured here
 * because the 32px icon tile inside it looks like one, and the next audit will
 * flag it again unless there is a reason written down next to the number.
 */
const NAV_ROW = classListIn(
  sourceOf('src/components/admin/admin-navigation.tsx'),
  'min-h-11 items-center gap-3 border-l-2'
)

type Target = { label: string; classes: string }

/**
 * Renders each class list on a bare control and reports the resolved box, so the
 * numbers come out of Tailwind's cascade rather than out of arithmetic on class
 * names — `h-11`, `min-h-11` and a `px-3` on an `h-11` box are three different
 * ways to end up at a height, and only one of them is measured here.
 */
const measure = async (page: import('@playwright/test').Page, targets: Target[]) =>
  page.evaluate((list) => {
    const host = document.createElement('div')
    host.style.cssText = 'position:relative;width:320px'
    document.body.appendChild(host)

    const boxes = list.map(({ label, classes }) => {
      // A `<button>` because all three are buttons in the components, which means
      // the UA default box-sizing and font metrics apply exactly as they will on
      // the page.
      const el = document.createElement('button')
      el.type = 'button'
      el.className = classes
      el.textContent = label
      host.appendChild(el)
      const { width, height } = el.getBoundingClientRect()
      el.remove()
      return { label, width, height }
    })

    host.remove()
    return boxes
  }, targets)

const PHONE = { width: 390, height: 780 }
const DESKTOP = { width: 1024, height: 800 }

/** Half a pixel, as elsewhere: this is about a shared number, not subpixel layout. */
const FIT = 0.5

test.describe('admin tap targets', () => {
  test('the chip remove button is a thumb-sized target on a phone', async ({ page }) => {
    await page.setViewportSize(PHONE)
    await page.goto('/')
    await settle(page)

    const [box] = await measure(page, [{ label: 'Remove Next.js', classes: CHIP_REMOVE }])

    // 40 rather than 44: 44 in a pill makes the chip taller than the text it
    // wraps around, and this sits in a wrapping row of chips where the height of
    // one chip is the height of the line. Same two-tier size `RowAction` uses,
    // for the same reason.
    expect(box.height, 'the chip is still shorter than a thumb on a phone').toBeGreaterThanOrEqual(
      40 - FIT
    )
    expect(box.width).toBeGreaterThanOrEqual(40 - FIT)
  })

  test('the chip remove button stays tight on a desktop pointer', async ({ page }) => {
    await page.setViewportSize(DESKTOP)
    await page.goto('/')
    await settle(page)

    const [box] = await measure(page, [{ label: 'Remove Next.js', classes: CHIP_REMOVE }])

    // The point of the `sm:` tier: a mouse can hit 32px, and a row of chips that
    // is 50% taller than it needs to be is a row nobody asked for. This asserts
    // the size *dropped*, which is what stops the phone fix from being applied
    // everywhere by someone who only ever sees the desktop screenshot.
    expect(box.height, 'the desktop half of the two-tier treatment is gone').toBeLessThan(40)
    expect(box.height).toBeGreaterThanOrEqual(32 - FIT)
  })

  test('both thumbnail controls are 44px at every width', async ({ page }) => {
    await page.goto('/')

    for (const viewport of [PHONE, DESKTOP]) {
      await page.setViewportSize(viewport)
      await settle(page)

      const [upload, remove] = await measure(page, [
        { label: 'Upload image', classes: UPLOAD },
        { label: 'Remove', classes: UPLOAD_REMOVE },
      ])

      for (const box of [upload, remove]) {
        expect(
          box.height,
          `"${box.label}" is ${box.height}px tall at ${viewport.width}px wide`
        ).toBeGreaterThanOrEqual(44 - FIT)
        expect(box.width, `"${box.label}" is ${box.width}px wide at ${viewport.width}px wide`)
          .toBeGreaterThanOrEqual(44 - FIT)
      }
    }
  })

  test('the sidebar icon tile is not a tap target — its row is', async ({ page }) => {
    await page.goto('/')

    for (const viewport of [PHONE, DESKTOP]) {
      await page.setViewportSize(viewport)
      await settle(page)

      const [row] = await measure(page, [{ label: 'Projects', classes: NAV_ROW }])

      // The `h-8 w-8` in `admin-navigation.tsx` is an `aria-hidden` `<span>`
      // holding an icon, sized for optical alignment inside the row. Nothing
      // about it is clickable; the whole row is the link. Measuring the row
      // instead of the tile is the whole point — a 32px hit area would be a
      // genuine bug, a 32px icon on a 44px row is not, and the two are only
      // distinguishable by knowing which element the pointer lands on.
      expect(row.height, `the nav row is ${row.height}px tall at ${viewport.width}px wide`)
        .toBeGreaterThanOrEqual(44 - FIT)
    }
  })
})