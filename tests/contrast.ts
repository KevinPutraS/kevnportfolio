/**
 * Contrast measurement.
 *
 * The hero's backdrop is an image under a veil, so "what colour is behind this
 * text" cannot be answered from the stylesheet — the answer is the brightest
 * pixel in the text's own box. That is why the hero is tuned by measurement
 * rather than by eye, and why the numbers that justify `.hero-backdrop` and
 * `.hero-veil` are luminances against the page background.
 *
 * The method: hide the words, photograph what is left, decode the PNG back
 * *inside the page* and read the pixels there. Decoding in the browser avoids a
 * native PNG dependency in the test suite, and keeping the pixel array in the
 * page avoids shipping megabytes over the wire per measurement — only the
 * per-rectangle statistics come back.
 *
 * Hiding is `visibility: hidden`, not `display: none`, and the difference is
 * load-bearing: a `display: none` element has no box, so its rect collapses to
 * nothing and the sample is taken from the wrong place. Stale text pixels
 * surviving a full-page screenshot is the other half of that lesson, which is
 * why animations are disabled before anything is measured.
 */

/** WCAG relative luminance, per channel. */
function channel(c: number) {
  const v = c / 255
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

export function luminance(r: number, g: number, b: number) {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/** WCAG contrast ratio between two sRGB triples. */
export function contrast(a: [number, number, number], b: [number, number, number]) {
  const la = luminance(...a)
  const lb = luminance(...b)
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

/** `'rgb(9 9 15)'` / `'rgb(9, 9, 15)'` / `'rgba(9 9 15 / 0.6)'` to a triple. */
export function parseColor(value: string): [number, number, number] {
  const nums = value.match(/[\d.]+/g)?.slice(0, 3).map(Number)
  return [nums?.[0] ?? 0, nums?.[1] ?? 0, nums?.[2] ?? 0]
}

export type Rect = { x: number; y: number; width: number; height: number }

export type Target = {
  name: string
  color: [number, number, number]
  /** Relative to the measured element, not to the page. */
  rect: Rect
  ratioNeeded: number
}

export type Sampled = {
  /** Colour of the brightest pixel in the box — the worst case for light text. */
  worstBackdrop: [number, number, number]
  /** Relative luminance of that pixel, 0..1. */
  p95: number
  /** Mean relative luminance over the box, 0..1. */
  mean: number
  ratio: number
}

/**
 * Measure the backdrop behind each target inside `selector`.
 *
 * `collect` runs in the page and must return boxes relative to the measured
 * element's own border box, which is what the screenshot is cropped to.
 */
export async function measureBackdrop(
  page: import('@playwright/test').Page,
  selector: string,
  collect: () => Target[]
): Promise<Record<string, Sampled>> {
  const element = page.locator(selector).first()
  if (!(await element.boundingBox())) throw new Error(`cannot measure: ${selector} has no box`)

  const targets = await page.evaluate(collect)

  // Hide the words, photograph the backdrop, put them back. The style element is
  // removed rather than overridden: an unconditional `visibility: visible` would
  // also un-hide anything inside the hero that is meant to be hidden.
  const style = await page.addStyleTag({ content: `${selector} * { visibility: hidden !important; }` })
  const shot = (await element.screenshot({ animations: 'disabled' })).toString('base64')
  // The handle is typed as a `Node`, which has no `remove()`. The element really
  // is the `<style>` this call added.
  await style.evaluate((el) => (el as Element).remove())

  const raw = await page.evaluate(
    async ({ data, boxes }) => {
      const blob = await (await fetch(`data:image/png;base64,${data}`)).blob()
      const bmp = await createImageBitmap(blob)
      const canvas = new OffscreenCanvas(bmp.width, bmp.height)
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('no 2d context available')
      ctx.drawImage(bmp, 0, 0)
      const px = ctx.getImageData(0, 0, bmp.width, bmp.height)

      const lum = (r: number, g: number, b: number) => {
        const f = (c: number) => {
          const v = c / 255
          return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
        }
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
      }
      const ratio = (a: number[], b: number[]) => {
        const hi = Math.max(lum(a[0], a[1], a[2]), lum(b[0], b[1], b[2]))
        const lo = Math.min(lum(a[0], a[1], a[2]), lum(b[0], b[1], b[2]))
        return (hi + 0.05) / (lo + 0.05)
      }

      const out: Record<string, { worstBackdrop: number[]; p95: number; mean: number; ratio: number }> = {}
      for (const box of boxes) {
        const x0 = Math.max(0, Math.round(box.rect.x))
        const y0 = Math.max(0, Math.round(box.rect.y))
        const x1 = Math.min(bmp.width, Math.round(box.rect.x + box.rect.width))
        const y1 = Math.min(bmp.height, Math.round(box.rect.y + box.rect.height))

        const samples: Array<{ l: number; rgb: number[] }> = []
        let sum = 0
        for (let y = y0; y < y1; y += 1) {
          for (let x = x0; x < x1; x += 1) {
            const i = (y * bmp.width + x) * 4
            const rgb = [px.data[i], px.data[i + 1], px.data[i + 2]]
            const l = lum(rgb[0], rgb[1], rgb[2])
            samples.push({ l, rgb })
            sum += l
          }
        }
        if (!samples.length) throw new Error(`empty sample for ${box.name}`)

        samples.sort((a, b) => a.l - b.l)
        // The 95th percentile rather than the maximum: one stray bright pixel out
        // of the artwork should not define the worst case for a whole line.
        const worst = samples[Math.floor(samples.length * 0.95)]

        out[box.name] = {
          worstBackdrop: worst.rgb,
          p95: worst.l,
          mean: sum / samples.length,
          ratio: ratio(box.color, worst.rgb),
        }
      }
      return out
    },
    { data: shot, boxes: targets }
  )

  // The colours cross the CDP boundary as plain arrays. Narrowing them here
  // rather than casting means a malformed triple is a type error at the point of
  // conversion instead of an `undefined` channel turning up later as a nonsense
  // contrast ratio.
  const out: Record<string, Sampled> = {}
  for (const [name, s] of Object.entries(raw)) {
    const [r, g, b] = s.worstBackdrop
    if (r === undefined || g === undefined || b === undefined) {
      throw new Error(`${name}: backdrop sample came back as ${JSON.stringify(s.worstBackdrop)}`)
    }
    out[name] = { worstBackdrop: [r, g, b], p95: s.p95, mean: s.mean, ratio: s.ratio }
  }
  return out
}
