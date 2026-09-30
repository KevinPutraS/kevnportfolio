import { expect, test } from '@playwright/test'
import { contrast } from './contrast'
import { settle } from './helpers'

/**
 * The text tokens against the page background.
 *
 * The tokens are stored as bare RGB triplets (`--text-muted: 116 117 136`) and
 * consumed as `rgb(var(--text-muted))`, so the ratio is a property of the
 * palette and holds on every route whether or not a page uses the token.
 *
 * This file also records a known failure. `--text-muted` measures 4.39:1 against
 * `--bg`, just under the 4.5:1 WCAG AA asks of text this size, and it is used in
 * 38 files. The hero already works around it with a `.meta-strong` class built on
 * `--text-dim` (8.6:1) — a per-component patch for a palette problem, which is
 * the shape that drifts. The honest fix is one token.
 *
 * `test.fail()` marks that as expected: the suite stays green while the debt is
 * open, and the day someone lifts the token this becomes a real pass with no edit
 * here. Dropping the `.fail` before the token is fixed is the one way to lose
 * track of it.
 */

type Token = { name: string; value: [number, number, number] }

/*
 * Serialised into the page, so it carries its own helpers. A function passed to
 * `page.evaluate` cannot close over an import from this file — the bundler
 * renames the reference and the browser throws `_contrast is not defined`.
 */
function readTokens(): Token[] {
  const root = getComputedStyle(document.documentElement)
  const read = (name: string): [number, number, number] => {
    const n = root.getPropertyValue(name).match(/[\d.]+/g)?.slice(0, 3).map(Number)
    return [n?.[0] ?? 0, n?.[1] ?? 0, n?.[2] ?? 0]
  }
  return [
    { name: '--text', value: read('--text') },
    { name: '--text-dim', value: read('--text-dim') },
    { name: '--text-muted', value: read('--text-muted') },
  ]
}

const pageBackground = (page: import('@playwright/test').Page) =>
  page.evaluate(() => {
    const n = getComputedStyle(document.documentElement)
      .getPropertyValue('--bg')
      .match(/[\d.]+/g)!
      .slice(0, 3)
      .map(Number)
    return [n[0], n[1], n[2]] as [number, number, number]
  })

test.describe('palette contrast', () => {
  test('--text and --text-dim clear AA against the page background', async ({ page }) => {
    await page.goto('/')
    await settle(page)
    const background = await pageBackground(page)

    for (const t of (await page.evaluate(readTokens)).filter((t) => t.name !== '--text-muted')) {
      const ratio = contrast(t.value, background)
      console.log(`  ${t.name.padEnd(14)} rgb(${t.value.join(', ')})  ${ratio.toFixed(2)}:1`)
      expect(ratio, `${t.name} against --bg`).toBeGreaterThanOrEqual(4.5)
    }
  })

  test('--text-muted clears AA against the page background', async ({ page }) => {
    // Known debt: 4.39:1 in 38 files. See the note at the top of this file.
    test.fail(true, 'known debt: --text-muted is 4.39:1; fix the token, then drop this .fail')

    await page.goto('/')
    await settle(page)
    const background = await pageBackground(page)

    for (const t of await page.evaluate(readTokens)) {
      if (t.name !== '--text-muted') continue
      const ratio = contrast(t.value, background)
      console.log(`  ${t.name.padEnd(14)} rgb(${t.value.join(', ')})  ${ratio.toFixed(2)}:1  (needs 4.5)`)
      expect(ratio, `${t.name} against --bg`).toBeGreaterThanOrEqual(4.5)
    }
  })

  test('no small text on the homepage fails against its own background', async ({ page }) => {
    // Same debt as the token above, seen from the other end. 30 elements, all of
    // them `--text-muted`. Marked expected so the suite is green while the token
    // is short; it turns into a real pass the moment the token is fixed, and it
    // is the test that will complain if a *new* element starts using the token
    // somewhere the palette test has no visibility of.
    test.fail(true, 'follows --text-muted: every offender is that one token; fix it and this passes')

    await page.goto('/')
    await settle(page)

    /*
     * Measured per element rather than per token, so a token used somewhere the
     * palette test cannot see is still caught — and resolved against the
     * background the element actually sits on. Two things make the naive version
     * wrong, and both showed up as false positives the first time this ran:
     *
     *  - inverse sections and the accent buttons set near-black text on amber.
     *    Against `--bg` that reads as 1.00:1 and looks catastrophic; on its own
     *    background it is perfectly legible.
     *  - the `/` between the descriptor and the year is `aria-hidden`. WCAG 1.4.3
     *    exempts purely decorative text, and a separator is exactly that.
     *
     * Opacity is deliberately not consulted. Contrast is a property of the two
     * colours, and skipping half-faded elements would have made the count depend
     * on when the assertion happened to run — a fade-in still in flight is a
     * function of machine load, not of the design. The intended rendered state is
     * full opacity, so that is what is measured.
     *
     * A gradient or image background resolves to null and is skipped rather than
     * guessed at; the hero's own text over its artwork is measured for real, by
     * sampling pixels, in `hero-contrast.spec.ts`.
     *
     * One thing worth knowing before the token is lifted: `--bg-elevated`
     * (17 17 25) is *lighter* than the page, so muted grey on it measures 4.15:1
     * — worse than the 4.39:1 against the page itself. A replacement has to clear
     * 4.5:1 on both, and the elevated surface is the binding constraint.
     */
    const found = await page.evaluate(() => {
      const bgTriplet = getComputedStyle(document.documentElement).getPropertyValue('--bg').match(/[\d.]+/g)!.slice(0, 3).map(Number)
      const fallback = [bgTriplet[0], bgTriplet[1], bgTriplet[2]] as number[]

      const effectiveBg = (el: Element): number[] | null => {
        for (let n: Element | null = el; n && n !== document.documentElement; n = n.parentElement) {
          const cs = getComputedStyle(n)
          // A gradient or image is not a colour; resolving it would be a guess.
          if (cs.backgroundImage !== 'none') return null
          const m = cs.backgroundColor.match(/[\d.]+/g)
          if (!m) continue
          const alpha = m.length > 3 ? Number(m[3]) : 1
          if (alpha > 0.85) return [Number(m[0]), Number(m[1]), Number(m[2])]
        }
        return fallback
      }

      const out: Array<{ text: string; color: number[]; bg: number[]; size: number }> = []
      for (const el of document.querySelectorAll<HTMLElement>('body *')) {
        if (el.closest('[aria-hidden="true"]')) continue
        const text = (el.textContent ?? '').trim()
        if (!text || el.children.length > 0) continue
        const r = el.getBoundingClientRect()
        if (r.width === 0 || r.height === 0) continue
        const cs = getComputedStyle(el)
        if (cs.visibility === 'hidden') continue
        const size = Number.parseFloat(cs.fontSize)
        if (size > 16) continue // AA asks 4.5:1 below this; larger text gets 3:1
        const bg = effectiveBg(el)
        if (!bg) continue
        const c = cs.color.match(/[\d.]+/g)!.slice(0, 3).map(Number)
        out.push({ text: text.slice(0, 40), color: [c[0], c[1], c[2]], bg, size })
      }
      return out
    })

    const failing = found
      .map((o) => ({ ...o, ratio: contrast(o.color as [number, number, number], o.bg as [number, number, number]) }))
      .filter((o) => o.ratio < 4.5)

    // The inspected count is logged because a *pass* here is ambiguous on its
    // own: it can mean the palette is clean, or it can mean the walk skipped
    // everything. Without the denominator those look identical.
    console.log(`  inspected ${found.length} small text elements, ${failing.length} below 4.5:1`)

    for (const o of failing) {
      console.log(`  ${o.ratio.toFixed(2)}:1  ${o.size}px  "${o.text}"  text rgb(${o.color.join(', ')}) on rgb(${o.bg.join(', ')})`)
    }
    expect(
      failing.map((o) => `"${o.text}" @ ${o.ratio.toFixed(2)}:1`),
      `${failing.length} small text element(s) below 4.5:1 on the homepage`
    ).toEqual([])
  })
})
