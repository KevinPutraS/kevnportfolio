import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { inflateSync } from 'node:zlib'
import { siteConfig } from '../src/config/site'

/**
 * The committed resume PDF must match the page it was generated from.
 *
 * `public/resume.pdf` is a build artifact (`npm run resume:pdf`) that no test
 * produces and nothing regenerates automatically. That makes it the one thing in
 * the repository able to be quietly wrong: edit an experience, a project or a
 * certificate in the CMS, and the live `/resume` page changes while the file a
 * recruiter downloads does not. Nothing fails. The download button keeps working
 * and keeps lying.
 *
 * So this asserts the property that makes the staleness visible — the artifact
 * and the page agree — rather than trusting a comment in the README to say so.
 *
 * Reading the PDF
 * ---------------
 * Chromium embeds these subsetted weights as *Type3* fonts: each glyph is drawn
 * as a PDF procedure rather than referenced from an embedded font program, so
 * there is no `FontFile` and no `BaseFont` to lean on. The text is still real —
 * `Tj` operators carry one-byte glyph codes, and every font object has a
 * `ToUnicode` CMap that maps those codes back to characters — which is what an
 * ATS, a copy-paste and `Ctrl+F` all use. Hence the decoder below.
 *
 * Two things it must get right, both learned by getting them wrong first:
 *
 *  - **Codes are per font, not global.** Code `0x0E` is `K` in the 33pt name face
 *    and something else entirely in the 14pt body face, so a merged table decodes
 *    into plausible nonsense. Each font's own CMap is tracked across `Tf`.
 *  - **Codes are one byte here.** Decoding four hex digits at a time yields
 *    nothing at all, which reads exactly like "the text is missing" and is how a
 *    correct PDF gets reported as an empty one.
 *
 * If Chromium ever changes this output shape, the honest outcome is a failure
 * here with a clear message — not a silently weakened assertion.
 */

const PDF_PATH = join(process.cwd(), 'public', 'resume.pdf')

const raw = (): string => readFileSync(PDF_PATH).toString('latin1')

/**
 * Body of object `n`, decompressed when it is a stream.
 *
 * Cut at `endstream` rather than `endobj` for streams, because deflated bytes can
 * contain the literal `endobj` and stopping there truncates the CMap.
 */
function objectBody(source: string, n: number): string {
  const header = `\n${n} 0 obj`
  const start = source.indexOf(header)
  if (start < 0) return ''

  const from = start + header.length
  const streamAt = source.indexOf('stream', from)
  const endObj = source.indexOf('endobj', from)

  if (streamAt >= 0 && (endObj < 0 || streamAt < endObj)) {
    const body = source.slice(from, streamAt)
    const data = streamAt + 'stream'.length
    const lineEnd = data + (source[data] === '\r' ? 2 : 1)
    const dataEnd = source.indexOf('endstream', lineEnd)
    try {
      return body + inflateSync(Buffer.from(source.slice(lineEnd, dataEnd), 'latin1')).toString('latin1')
    } catch {
      return body
    }
  }

  return source.slice(from, endObj < 0 ? from : endObj)
}

const utf16be = (hex: string): string => {
  let out = ''
  for (let i = 0; i + 4 <= hex.length; i += 4) {
    const code = parseInt(hex.slice(i, i + 4), 16)
    if (!Number.isNaN(code) && code > 0) out += String.fromCharCode(code)
  }
  return out
}

/** A `ToUnicode` CMap's `bfchar`/`bfrange` sections, as `Map<code, character>`. */
function parseCMap(body: string): Map<number, string> {
  const map = new Map()

  for (const block of body.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) {
    for (const pair of block[1].matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) {
      map.set(parseInt(pair[1], 16), utf16be(pair[2]))
    }
  }

  for (const block of body.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) {
    for (const row of block[1].matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) {
      const low = parseInt(row[1], 16)
      const high = parseInt(row[2], 16)
      const base = parseInt(row[3], 16)
      for (let code = low; code <= high && code - low < 1024; code += 1) {
        map.set(code, String.fromCharCode(base + (code - low)))
      }
    }
  }

  return map
}

/** Font resource name (`/F9`) to its glyph-code table. */
function fontTables(source: string): Map<string, Map<number, string>> {
  const tables = new Map()

  for (const resource of source.matchAll(/\/Font\s*<<([^>]*?)>>/g)) {
    for (const font of resource[1].matchAll(/\/(F\d+)\s+(\d+)\s+0\s+R/g)) {
      const toUnicode = objectBody(source, Number(font[2])).match(/\/ToUnicode\s+(\d+)\s+0\s+R/)
      if (!toUnicode) continue
      tables.set(font[1], parseCMap(objectBody(source, Number(toUnicode[1]))))
    }
  }

  return tables
}

/** Every string drawn on the page, decoded. */
function extractText(source: string): string {
  const tables = fontTables(source)
  let out = ''
  let current: Map<number, string> | null = null

  for (const match of source.matchAll(/stream\r?\n/g)) {
    const end = source.indexOf('endstream', match.index)
    if (end < 0) continue

    let body: string
    try {
      body = inflateSync(Buffer.from(source.slice(match.index + match[0].length, end), 'latin1')).toString('latin1')
    } catch {
      continue
    }
    if (!/\bTj\b/.test(body)) continue

    for (const token of body.matchAll(/\/(F\d+)\s+[\d.]+\s+Tf|<([0-9A-Fa-f]+)>\s*Tj/g)) {
      if (token[1]) {
        current = tables.get(token[1]) ?? null
        continue
      }
      if (!current) continue
      for (let i = 0; i + 2 <= token[2].length; i += 2) {
        out += current.get(parseInt(token[2].slice(i, i + 2), 16)) ?? ''
      }
    }
  }

  return out
}

/**
 * Lowercase alphanumerics only.
 *
 * Every glyph carries its own `Td` advance, so raw output arrives as `K e v i n`
 * — and stripping only whitespace still leaves a space wherever a real one
 * belongs and none where a letter-spacing gap sat. Reducing to `[a-z0-9]` makes
 * the assertions insensitive to both, and to `text-transform` in the stylesheet,
 * which is why `EXPERIENCE` on paper and `Experience` in the DOM both match.
 */
const squash = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]/g, '')

test.describe('the committed resume PDF', () => {
  test('is a well-formed A4 document', () => {
    const source = raw()

    expect(source.slice(0, 5), 'PDF header').toBe('%PDF-')
    expect(source.trimEnd().endsWith('%%EOF'), 'PDF trailer').toBe(true)

    const boxes = [...source.matchAll(/\/MediaBox\s*\[([^\]]*)\]/g)].map((m) =>
      m[1].trim().split(/\s+/).map(Number)
    )
    expect(boxes.length, 'every page declares a MediaBox').toBeGreaterThan(0)

    // MediaBox is [x0 y0 x1 y1]; A4 at 72dpi is 595.28 x 841.89pt.
    for (const [, , width, height] of boxes) {
      expect(Math.abs(width - 595.28), 'page width in points').toBeLessThan(2)
      expect(Math.abs(height - 841.89), 'page height in points').toBeLessThan(2)
    }
  })

  test('carries selectable text rather than drawn outlines', () => {
    const source = raw()

    expect(source, 'text is extractable via ToUnicode CMaps').toContain('/ToUnicode')
    expect(source, 'links survive into the PDF').toContain('/Subtype /Link')
    expect(extractText(source).length, 'no text could be decoded').toBeGreaterThan(500)
  })

  test('has one page per sheet the document paginated to', async ({ page }) => {
    /*
     * The one assertion that cannot be faked. Both numbers come from the same
     * render — the sheets are measured and laid out in the browser, and the PDF
     * is that browser's print output — so a disagreement means the artifact was
     * produced by something else, or from a different document.
     */
    await page.goto('/resume')
    await page.evaluate(() => document.fonts.ready)
    await page.waitForFunction(() => document.querySelectorAll('[data-sheet]').length > 0)

    const sheets = await page.evaluate(() => document.querySelectorAll('[data-sheet]').length)
    const pdfPages = (raw().match(/\/Type\s*\/Page[^s]/g) || []).length

    expect(pdfPages, 'the committed PDF is stale — regenerate with `npm run resume:pdf`').toBe(sheets)
  })

  test('contains the current name, contact details and every section on the page', async ({ page }) => {
    await page.goto('/resume')
    await page.evaluate(() => document.fonts.ready)
    await page.waitForFunction(() => document.querySelectorAll('[data-sheet]').length > 0)

    /*
     * Read the headings off the live page rather than hard-coding the four
     * section titles. A section with no content is skipped at build time, so a
     * literal list would fail on a document that legitimately has no projects —
     * while the real question, "does the PDF say what the page says", stays
     * answerable either way.
     */
    const headings = await page.locator('.resume-section__title').allInnerTexts()
    expect(headings.length, 'the resume rendered no section headings').toBeGreaterThan(0)

    const text = squash(extractText(raw()))

    for (const heading of [...headings, siteConfig.personName, siteConfig.email]) {
      expect(text, `"${heading}" is in the page but not in the PDF`).toContain(squash(heading))
    }
  })
})