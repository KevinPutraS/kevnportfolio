import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

/**
 * Case-study page layout.
 *
 * Two things here are invisible in a screenshot review and cheap to break.
 *
 * **The hero plate escapes its container.** It cancels the `container-custom`
 * padding with negative margins at `sm`/`lg`/`xl`, which is the only way to bleed
 * to both viewport edges without a second layout system. Negative margins are also
 * the classic way to produce a horizontal scrollbar, and the only thing preventing
 * one is `overflow-x: clip` on `html`/`body`. If that ever comes off, this is the
 * test that says so.
 *
 * **The gallery grid has a lead tile.** Its aspect ratio and column span both used
 * to be written as inline `style`/index-conditional expressions that could not
 * respond to a breakpoint, so the lead stayed 16/9 on a phone while the code
 * claimed it dropped to 4/3. Both are Tailwind utilities now, and the failure mode
 * is still the same silent one: a class string that never reaches the stylesheet
 * produces a layout with no error anywhere.
 *
 * ## Why the gallery half loads the compiled stylesheet instead of the page
 *
 * Both published projects currently have an empty `gallery` array, so `ProjectGallery`
 * returns null in production and its grid never renders on the live site. The detail
 * route is also server-rendered, so intercepting the Supabase REST read from the
 * browser does nothing -- the fetch happens on the server, before the HTML exists.
 *
 * That leaves the stylesheet as the only layer where the change can be exercised
 * honestly. The gallery half therefore renders the exact class strings
 * `ProjectGallery` emits against the real built CSS from `.next/static/css`. It is a
 * harness, not the page, and it is scoped to the grid on purpose: it does not
 * attempt to cover the lightbox, the image loading or the alt text, all of which are
 * covered by rendering the component itself.
 */

const CSS_PATH = path.join('.next', 'static', 'css', 'app', 'layout.css')

/** The grid exactly as `ProjectGallery` writes it, with the real class strings. */
const galleryMarkup = (count: number) => `
  <div class="container-custom py-16">
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
      ${Array.from({ length: count }, (_, i) => `
        <button
          type="button"
          class="group relative block w-full overflow-hidden rounded-[var(--radius-lg)] border border-[rgb(var(--border))] ${i === 0 ? 'aspect-[4/3] sm:aspect-[16/9] sm:col-span-2' : 'aspect-[4/3]'}"
          data-tile="${i}"
        ><span>tile ${i}</span></button>
      `).join('')}
    </div>
  </div>`

/** The first published case study, so the slug is never hardcoded. */
async function firstCaseStudy(page: import('@playwright/test').Page) {
  await page.goto('/projects', { waitUntil: 'domcontentloaded' })
  const href = await page
    .locator('a[href^="/projects/"]')
    .first()
    .getAttribute('href')
  expect(href, 'the projects index should link to at least one case study').toBeTruthy()
  return href!
}

async function openGallery(page: import('@playwright/test').Page, width: number, count = 5) {
  const css = fs.readFileSync(CSS_PATH, 'utf8')
  await page.setViewportSize({ width, height: 900 })
  // The viewport meta tag is load-bearing here, not boilerplate. Without it, mobile
  // emulation lays the document out at a default 980 CSS px and *every* `sm:` and
  // `md:` rule applies -- so the lead came out 16/9 at a nominal 320px and this
  // harness reported the opposite of what the real page does. The app declares this
  // in `layout.tsx`; the harness has to declare it too or it is not the same page.
  await page.setContent(
    `<!doctype html><html lang="en"><head><meta charset="utf-8">
     <meta name="viewport" content="width=device-width, initial-scale=1">
     <style>${css}</style></head><body>${galleryMarkup(count)}</body></html>`,
    { waitUntil: 'load' }
  )
  expect(await page.getAttribute('meta[name="viewport"]', 'content')).toContain(
    'width=device-width'
  )
}

const tile = (page: import('@playwright/test').Page, i: number) =>
  page.locator(`[data-tile="${i}"]`)

test.describe('the case-study hero plate', () => {
  test('does not cause horizontal overflow on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 })
    await page.goto(await firstCaseStudy(page), { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle')

    const m = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }))
    expect(m.scrollW).toBeLessThanOrEqual(m.clientW)
  })

  test('reaches both viewport edges once the container padding is cancelled', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto(await firstCaseStudy(page), { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle')

    const plate = page.locator('header img').first()
    await plate.waitFor({ state: 'visible' })
    const box = await plate.boundingBox()
    expect(box).not.toBeNull()

    // Flush to the left edge, and wider than the 72rem text column it shares a
    // page with -- both would be false if the negative margins stopped applying.
    expect(Math.round(box!.x)).toBeLessThanOrEqual(1)
    expect(Math.round(box!.width)).toBeGreaterThanOrEqual(1278)
    expect(Math.round(box!.width)).toBeGreaterThan(1152)
  })
})

test.describe('the gallery lead tile', () => {
  test('depends on grid rules that are actually in the built stylesheet', () => {
    const css = fs.readFileSync(CSS_PATH, 'utf8')

    // The silent failure: the JSX says `sm:col-span-2`, the class is never
    // emitted, the lead collapses to one column, and nothing throws.
    expect(css).toMatch(/\.sm\\:col-span-2\s*\{[^}]*grid-column:\s*span 2\s*\/\s*span 2/)
    expect(css).toMatch(/\.sm\\:grid-cols-2\s*\{[^}]*grid-template-columns/)
    expect(css).toMatch(/\.md\\:grid-cols-3\s*\{[^}]*grid-template-columns/)

    // `aspect-[16/9]` cannot be matched by regex without three levels of escaping:
    // Tailwind escapes the brackets *and* the slash, so the selector in the file is
    // the literal text `.sm\:aspect-\[16\/9\]` -- backslashes and all. Substring
    // search is clearer here and cannot be broken by the next escaping mistake.
    expect(css).toContain('.sm' + '\\' + ':aspect-' + '\\' + '[' + '16' + '\\' + '/' + '9' + '\\' + ']')
    expect(css).toContain('aspect-ratio: 16/9')
  })

  test('is 4/3 at 320px, where there is no column to span', async ({ page }) => {
    await openGallery(page, 320)

    const boxes = []
    for (let i = 0; i < 5; i++) boxes.push((await tile(page, i).boundingBox())!)

    const leadRatio = boxes[0].width / boxes[0].height
    expect(leadRatio).toBeGreaterThan(1.2)
    expect(leadRatio).toBeLessThan(1.45)

    // Every tile is the same width, and they stack in one column.
    for (const b of boxes) expect(Math.round(b.width)).toBe(Math.round(boxes[0].width))
    for (let i = 1; i < 5; i++) expect(boxes[i].y).toBeGreaterThan(boxes[i - 1].y)
  })

  test('spans the whole two-column row at 640px', async ({ page }) => {
    await openGallery(page, 640)

    const lead = (await tile(page, 0).boundingBox())!
    const second = (await tile(page, 1).boundingBox())!
    expect(lead.width / lead.height).toBeGreaterThan(1.6)
    expect(Math.round(lead.width)).toBeGreaterThan(Math.round(second.width) * 1.8)
  })

  test('takes two of three tracks at 1280px, with a tile beside it', async ({ page }) => {
    await openGallery(page, 1280)

    const boxes = []
    for (let i = 0; i < 5; i++) boxes.push((await tile(page, i).boundingBox())!)

    const lead = boxes[0]
    expect(lead.width / lead.height).toBeGreaterThan(1.6)
    expect(lead.width / lead.height).toBeLessThan(1.85)

    // Two tracks wide plus the one gap between them. Measured against the
    // neighbour rather than an absolute width, because the container width is not
    // what is under test.
    const beside = boxes[1]
    expect(lead.width - beside.width * 2).toBeGreaterThan(8)
    expect(lead.width - beside.width * 2).toBeLessThan(24)

    // Supports are 4/3, so squarer than the 16/9 lead.
    for (const b of boxes.slice(1)) {
      const ratio = b.width / b.height
      expect(ratio).toBeGreaterThan(1.2)
      expect(ratio).toBeLessThan(1.45)
    }

    // The second tile sits in the third track, on the lead's own row.
    expect(Math.round(beside.x)).toBeGreaterThan(Math.round(lead.x + lead.width - 2))
    expect(Math.round(beside.y)).toBe(Math.round(lead.y))

    // Tiles three to five fill one three-track row beneath, and the row's last
    // column lines up with the lead's neighbour so the two rows read as one grid.
    const row2 = boxes.slice(2)
    expect(Math.round(row2[0].y)).toBe(Math.round(row2[1].y))
    expect(Math.round(row2[1].y)).toBe(Math.round(row2[2].y))
    expect(Math.round(row2[0].y)).toBeGreaterThan(Math.round(lead.y + lead.height) - 2)
    expect(Math.round(row2[0].x)).toBe(Math.round(lead.x))
    expect(Math.round(row2[1].x)).toBeGreaterThan(Math.round(row2[0].x))
    expect(Math.round(row2[2].x)).toBe(Math.round(beside.x))
  })
})