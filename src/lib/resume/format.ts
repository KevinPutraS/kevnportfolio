/**
 * Formatting primitives for the resume document.
 *
 * These exist because the resume is a *fixed-size* page, and the site's general
 * formatters are not usable on it.
 *
 * `formatDateRange` — the one the rest of the site uses — writes "October 2025 —
 * December 2025". That is twenty-two characters, and in a 32mm monospace date
 * column at 9pt it is roughly 46mm of type: it cannot sit in the column at all.
 * A date rail on A4 has to be abbreviated ("Oct 2025 — Dec 2025", two lines) or
 * the column has to grow to nearly half the page, and both are worse than
 * abbreviating. Abbreviated months are also the convention every printed CV
 * uses, so the reader's eye already knows how to parse them.
 *
 * Everything here is deliberately total: bad input produces an empty string
 * rather than `NaN`, `"Invalid Date"` or a thrown error, because a CV that
 * renders a broken date is worse than one that renders no date.
 */

const SHORT_MONTH_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

/**
 * Normalises the two month-precision shapes the database can return: `YYYY-MM`
 * (what the editor writes, what `to_char` returns) and `YYYY-MM-DD` (what a
 * Postgres `date` column gives back). Both are pinned to UTC, because
 * `new Date('2025-10')` is parsed as UTC midnight and then rendered in the
 * *local* zone — which is the 30th of September for anyone west of Greenwich,
 * and a CV that says "Sep 2025" for an October job is not a rounding error.
 */
function toUtcDate(value: string | null | undefined): Date | null {
  if (!value) return null

  const trimmed = String(value).trim()
  const month = /^(\d{4})-(\d{2})$/.exec(trimmed)
  const day = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed)

  if (month) {
    const date = new Date(Date.UTC(Number(month[1]), Number(month[2]) - 1, 1))
    return Number.isNaN(date.getTime()) ? null : date
  }

  if (day) {
    const date = new Date(Date.UTC(Number(day[1]), Number(day[2]) - 1, Number(day[3])))
    return Number.isNaN(date.getTime()) ? null : date
  }

  return null
}

/** `2025-10` / `2025-10-01` -> "Oct 2025". Empty string when unparseable. */
export function formatMonthShort(value: string | null | undefined): string {
  const date = toUtcDate(value)
  return date ? SHORT_MONTH_FORMATTER.format(date) : ''
}

/**
 * The two halves of a date range, split rather than joined.
 *
 * The document renders these as two lines in the date column with the dash
 * leading the second, rather than as one string the browser wraps wherever it
 * happens to fall. That is the whole point of a date rail: the ranges have to
 * align on one axis, and a string that wraps on a word boundary breaks the
 * alignment for every entry whose organisation name happens to be long.
 *
 * `to` is `null` for an ongoing role, which the document renders as "Present".
 */
export function formatRangeShort(
  start: string | null | undefined,
  end: string | null | undefined,
  current: boolean
): { from: string; to: string | null } {
  const from = formatMonthShort(start)

  if (current) return { from, to: null }
  const to = formatMonthShort(end)
  return { from, to: to || null }
}

/** Just the year, for certificate rows. `2026-03-01` -> "2026". */
export function formatYear(value: string | null | undefined): string {
  const trimmed = (value ?? '').trim()
  const match = /^(\d{4})/.exec(trimmed)
  return match ? match[1] : ''
}

/** Collapses every run of whitespace, including the newlines prose is stored with. */
function flatten(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

/**
 * Trims prose to a character budget without cutting a word in half.
 *
 * On paper, an ellipsis at a word boundary reads as an editor's judgement. A
 * bullet cut mid-word reads as a bug. The two-pass approach — take the last
 * complete word, then look backwards for a sentence end inside the budget — means
 * the common case (a description whose first sentence already fits) gets clean,
 * unpunctuated prose rather than a truncated sentence.
 *
 * The character budgets are set from the *measured* line count, not from taste:
 * see `RESUME_BUDGETS` in `./content`.
 */
export function clip(text: string, max: number): string {
  const clean = flatten(text)
  if (clean.length <= max) return clean

  // A sentence that already ends inside the budget is the best possible cut, so
  // look for one before falling back to a word boundary.
  const window = clean.slice(0, max + 1)
  const sentenceEnd = Math.max(
    window.lastIndexOf('. '),
    window.lastIndexOf('! '),
    window.lastIndexOf('? '),
  )
  if (sentenceEnd > max * 0.5) return clean.slice(0, sentenceEnd + 1)

  const clipped = clean.slice(0, max)
  const lastSpace = clipped.lastIndexOf(' ')
  return `${(lastSpace > max * 0.6 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}…`
}

/**
 * One sentence, clipped to `max`.
 *
 * Used for the one-line summary on an experience entry, where the `description`
 * column holds a paragraph written for a project card on a web page — a length
 * that makes sense at 320px wide and does not make sense at 140mm in a grid
 * column next to a date rail.
 */
export function firstSentence(text: string | null | undefined, max: number): string | null {
  if (!text) return null

  const clean = flatten(text)
  if (!clean) return null
  if (clean.length <= max) return clean

  const window = clean.slice(0, max + 1)
  const sentenceEnd = Math.max(window.lastIndexOf('. '), window.lastIndexOf('! '), window.lastIndexOf('? '))
  if (sentenceEnd > 0) return clean.slice(0, sentenceEnd + 1)

  return clip(clean, max)
}

/** First `count` entries, de-duplicated case-insensitively, empties dropped. */
export function takeTags(values: readonly string[] | null | undefined, count: number): string[] {
  if (!values) return []

  const seen = new Set<string>()
  const result: string[] = []

  for (const value of values) {
    const clean = value.trim()
    if (!clean) continue
    const key = clean.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    result.push(clean)
    if (result.length === count) break
  }

  return result
}
