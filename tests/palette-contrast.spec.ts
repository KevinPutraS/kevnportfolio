import { expect, test } from '@playwright/test'
import { contrast } from './contrast'
import { settle } from './helpers'

/**
 * The text tokens against the page background.
 *
 * The tokens are stored as bare RGB triplets (`--text-muted: 132 133 152`) and
 * consumed as `rgb(var(--text-muted))`, so the ratio is a property of the
 * palette and holds on every route whether or not a page uses the token.
 *
 * This file used to carry a known failure. `--text-muted` measured 4.39:1 against
 * `--bg` and 4.15:1 against `--bg-elevated`, and the hero had grown a
 * `.meta-strong` class built on `--text-dim` to dodge it — a per-component patch
 * for a palette problem, which is the shape that drifts, since 37 other files
 * stayed non-compliant. The token is fixed now and the assertions are plain, so
 * this test is the thing that stops it drifting back.
 *
 * The second test is the one that carries the weight. Measuring a token against
 * `--bg` is a measurement of the palette on paper; walking every small text
 * element on a page and measuring it against the surface it *actually* sits on is
 * a measurement of the site, and it is the one that catches a token used on a
 * brighter surface than the token test can see.
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
  // Spelled out rather than globbed, because the three that belong on the page are
  // not all the tokens starting with `--text`. `--text-inverse` is deliberately
  // the near-invisible one — it is set on top of an accent fill, where it clears
  // 10:1 against amber, and against `--bg` it measures about 1.00:1. Adding it
  // here "for coverage" would fail with a number that looks absurd until you know
  // what the token is for.
  return [
    { name: '--text', value: read('--text') },
    { name: '--text-dim', value: read('--text-dim') },
    { name: '--text-muted', value: read('--text-muted') },
  ]
}

/**
 * The page background, read from the stylesheet rather than assumed.
 *
 * If `--bg` comes back empty then the stylesheet never applied, and the honest
 * answer is to say so. A bare `.match(...).slice` throws `Cannot read properties
 * of null` from a line that looks unrelated to the cause, which is a bad way to
 * learn that someone ran `next build` against the shared `.next` and the dev
 * server is now serving 200 HTML over a 404 stylesheet.
 */
const pageBackground = (page: import('@playwright/test').Page) =>
  page.evaluate(() => {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--bg')
    const m = raw.match(/[\d.]+/g)
    if (!m) {
      throw new Error(
        `--bg resolved to "${raw.trim()}" on :root, so globals.css is not applied. ` +
          `Check the stylesheet responds 200 before trusting any result here — a ` +
          `200 from the dev server only means the HTML did.`
      )
    }
    return [Number(m[0]), Number(m[1]), Number(m[2])] as [number, number, number]
  })

test.describe('palette contrast', () => {
  test('--text and --text-dim clear AA against the page background', async ({ page }) => {
    await page.goto('/')
    await settle(page)
    const background = await pageBackground(page)

    for (const t of await page.evaluate(readTokens)) {
      const ratio = contrast(t.value, background)
      console.log(`  ${t.name.padEnd(14)} rgb(${t.value.join(', ')})  ${ratio.toFixed(2)}:1`)
      expect(ratio, `${t.name} against --bg`).toBeGreaterThanOrEqual(4.5)
    }
  })

  test('--text-muted clears AA against the page background', async ({ page }) => {
    // Was 4.39:1 against --bg and 4.15:1 against --bg-elevated, and was the one
    // token the loop above had to skip. 116 117 136 -> 132 133 152; see the note
    // on the token in globals.css for why the binding surface is not --bg.
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
    // The same debt seen from the other end: it was 31-32 elements, and every one
    // of them was this token. Kept as its own test because the palette test above
    // only knows the token, while this one walks the rendered elements and so
    // catches a *new* small-text element landing on a surface the palette test has
    // no visibility of.
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
     * The opacity of an *ancestor* is a different matter, and it is checked. An
     * element's own `opacity: 0.5` is a decision about that element, which the
     * walk already skips; but `opacity` on a wrapper composites every descendant
     * toward the backdrop, and none of the two colours above know about it. A
     * `disabled:opacity-50` or a `transition-opacity` left on an ancestor would
     * put real text under AA while this file still reported the declared token
     * ratio. The declared value is not the painted value.
     *
     * A gradient or image background resolves to null and is skipped rather than
     * guessed at; the hero's own text over its artwork is measured for real, by
     * sampling pixels, in `hero-contrast.spec.ts`.
     */
    const found = await page.evaluate(() => {
      const raw = getComputedStyle(document.documentElement).getPropertyValue('--bg')
      const bgMatch = raw.match(/[\d.]+/g)
      if (!bgMatch) {
        throw new Error(
          `--bg resolved to "${raw.trim()}" on :root, so globals.css is not applied. ` +
            `Everything below would be measured against a fallback and mean nothing.`
        )
      }
      const fallback = [Number(bgMatch[0]), Number(bgMatch[1]), Number(bgMatch[2])]

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

      /** The alpha an ancestor paints this element at, as a multiplier. */
      const inheritedFade = (el: Element): { fade: number; culprit: string } => {
        let fade = 1
        let culprit = ''
        for (let n: Element | null = el; n && n !== document.documentElement; n = n.parentElement) {
          const o = Number.parseFloat(getComputedStyle(n).opacity)
          if (o < 1) {
            fade *= o
            if (!culprit) culprit = `${n.tagName.toLowerCase()}.${String(n.className).split(' ')[0]}`
          }
        }
        return { fade, culprit }
      }

      const out: Array<{ text: string; color: number[]; bg: number[]; size: number; fade: number; culprit: string }> = []
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
        const { fade, culprit } = inheritedFade(el)
        out.push({ text: text.slice(0, 40), color: [c[0], c[1], c[2]], bg, size, fade, culprit })
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

    // Asserted separately, because the failure mode is different in kind: not a
    // token that was always wrong, but text that renders lighter than its
    // declared colour because a wrapper is semi-transparent. `disabled:opacity-50`
    // and `transition-opacity` are both easy to leave behind.
    const faded = found.filter((o) => o.fade < 1)
    console.log(`  of those, ${faded.length} sit under a semi-transparent ancestor`)
    for (const f of faded) {
      console.log(`  ${f.fade}x via ${f.culprit}  "${f.text}"`)
    }
    expect(
      faded.map((o) => `${o.text} at ${o.fade}x via ${o.culprit}`),
      'small text must not be composited down by a semi-transparent ancestor'
    ).toEqual([])
  })
})
