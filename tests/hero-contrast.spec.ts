import { expect, test } from '@playwright/test'
import { measureBackdrop } from './contrast'
import { settle } from './helpers'

/**
 * The hero's text over its backdrop, measured.
 *
 * Every number in the HERO BACKDROP block of `globals.css` — the backdrop
 * opacity, the veil's strength, the art direction — exists because the text has
 * to stay readable on top of an image. That is not something a comment can
 * enforce, and it is exactly the kind of thing a later change to the artwork, a
 * scrim or the type scale quietly undoes.
 *
 * The thresholds are the ones the design is actually held to: 4.5:1 for body
 * text, 3:1 for the name, which is display-scale and reads as a graphic.
 *
 * The p95 figure in the failure output is the relative luminance of the
 * brightest pixel in each text box. A number in the low tenths means the words
 * are sitting on near-black; if it climbs, something has let the artwork in
 * under the type and the scrim is what needs strengthening, not the text.
 */
const HERO = 'section .container-custom'

/*
 * This function is serialised and run inside the page, so it cannot close over
 * anything imported here — including the `rgb` helper the measurements need. It
 * carries its own copy, and the copy is the one thing about it that must not
 * drift: if the two disagree, the measurements are computed against colours the
 * page never painted.
 */
function collect() {
  const rgb = (value: string): [number, number, number] => {
    const n = value.match(/[\d.]+/g)?.slice(0, 3).map(Number)
    return [n?.[0] ?? 0, n?.[1] ?? 0, n?.[2] ?? 0]
  }

  const root = document.querySelector('section .container-custom')!
  const box = root.getBoundingClientRect()
  const rel = (r: DOMRect) => ({ x: r.left - box.left, y: r.top - box.top, width: r.width, height: r.height })
  const relTo = (el: Element) => rel(el.getBoundingClientRect())

  const items: Array<{
    name: string
    color: [number, number, number]
    rect: { x: number; y: number; width: number; height: number }
    ratioNeeded: number
  }> = []

  const push = (name: string, el: Element, ratioNeeded: number) => {
    items.push({ name, color: rgb(getComputedStyle(el).color), rect: relTo(el), ratioNeeded })
  }

  // The name is the h1's first block span. Its border box includes the
  // decorative mark, which is a zero-content inline-block, so a Range over the
  // text node is what actually measures the word.
  const nameEl = root.querySelector('h1 > span')!
  const range = document.createRange()
  range.selectNodeContents(nameEl)
  items.push({
    name: 'name',
    color: rgb(getComputedStyle(nameEl).color),
    rect: rel(range.getBoundingClientRect()),
    ratioNeeded: 3,
  })

  const statement = root.querySelector('h1 > span:nth-of-type(2)')
  if (statement) push('statement', statement, 4.5)

  const eyebrow = root.querySelector('aside p')
  if (eyebrow) push('indexEyebrow', eyebrow, 4.5)

  const titles = [...root.querySelectorAll('aside ol a span.font-medium')]
  if (titles[0]) push('indexRowTitle', titles[0], 4.5)

  const descs = [...root.querySelectorAll('aside ol a span.col-start-2')]
  if (descs[0]) push('indexRowDesc', descs[0], 4.5)
  if (descs[descs.length - 1]) push('indexLastDesc', descs[descs.length - 1], 4.5)

  return items
}

test.describe('hero contrast over the backdrop', () => {
  test.skip(({ isMobile }) => !!isMobile, 'the two-column composition is a desktop concern; mobile uses a different plate')

  /*
   * `hero-veil` washes the plate with `rgb(var(--bg) / 0.7)`, so the scrim is the
   * canvas colour itself and the artwork underneath is a dark bitmap. That makes
   * the composition a property of the palette rather than of a setting: if
   * `--bg` is retuned and the veil moves with it, these numbers are the only
   * thing that notices.
   */
  test('every line keeps its contrast with the brightest pixel behind it', async ({ page }) => {
    await page.goto('/')
    await settle(page)

    const results = await measureBackdrop(page, HERO, collect)

    for (const [name, s] of Object.entries(results)) {
      const needed = name === 'name' ? 3 : 4.5
      // Reported whether or not it passes, so a failure says what to strengthen.
      console.log(
        `  ${name.padEnd(14)} ${s.ratio.toFixed(2)}:1 (needs ${needed})   p95 ${(s.p95 * 100).toFixed(2)}%  backdrop rgb(${s.worstBackdrop.join(', ')})`
      )
      expect(s.ratio, `${name} lost contrast over the backdrop`).toBeGreaterThanOrEqual(needed)
    }
  })

  test('the plate reads as atmosphere, not as an image', async ({ page }) => {
    await page.goto('/')
    await settle(page)

    const results = await measureBackdrop(page, HERO, collect)
    const worst = Math.max(...Object.values(results).map((s) => s.p95))
    console.log(`  worst p95 under text ${(worst * 100).toFixed(2)}%`)

    // A ceiling rather than a floor. If this fails, the artwork has started
    // competing with the words and the scrim needs to come back up, not the
    // page background.
    expect(worst, `backdrop p95 reached ${(worst * 100).toFixed(1)}% under the text`).toBeLessThan(0.05)
  })
})
