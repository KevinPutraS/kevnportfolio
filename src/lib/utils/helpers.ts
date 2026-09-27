/**
 * Formatting helpers.
 *
 * Date formatting intentionally uses the built-in `Intl` API instead of a
 * date library so the bundle stays dependency-free.
 */

const MONTH_YEAR_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

const FULL_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

/**
 * `project_date` is month-precision and can arrive either as `YYYY-MM`
 * (what the editor submits) or `YYYY-MM-DD` (what a Postgres `date`
 * column returns). Both are normalised here.
 */
function toDate(value: string): Date | null {
  const trimmed = value.trim()
  const monthOnly = /^(\d{4})-(\d{2})$/.exec(trimmed)
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed)

  if (monthOnly) {
    const date = new Date(Date.UTC(Number(monthOnly[1]), Number(monthOnly[2]) - 1, 1))
    return Number.isNaN(date.getTime()) ? null : date
  }

  if (iso) {
    const date = new Date(Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])))
    return Number.isNaN(date.getTime()) ? null : date
  }

  const parsed = new Date(trimmed)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

/**
 * Formats a month-precision date, e.g. `2024-03-01` -> "March 2024".
 *
 * Named for the precision rather than the caller: projects, experience entries
 * and certificates all store month-precision dates in a Postgres `date`.
 */
export function formatMonth(value: string | null | undefined): string {
  if (!value) return ''
  const date = toDate(value)
  return date ? MONTH_YEAR_FORMATTER.format(date) : value
}

/** Formats a full ISO timestamp, e.g. `2024-03-15T10:00:00Z` -> "March 15, 2024". */
export function formatDate(value: string | null | undefined): string {
  if (!value) return ''
  const date = toDate(value)
  return date ? FULL_DATE_FORMATTER.format(date) : value
}

const RELATIVE_UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 365 * 24 * 60 * 60 * 1000],
  ['month', 30 * 24 * 60 * 60 * 1000],
  ['week', 7 * 24 * 60 * 60 * 1000],
  ['day', 24 * 60 * 60 * 1000],
]

const RELATIVE_FORMATTER = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

/** Formats a timestamp as a coarse relative label, e.g. "3 days ago". */
export function formatRelativeTime(value: string | null | undefined): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const diff = date.getTime() - Date.now()
  for (const [unit, ms] of RELATIVE_UNITS) {
    if (Math.abs(diff) >= ms) {
      return RELATIVE_FORMATTER.format(Math.round(diff / ms), unit)
    }
  }
  return RELATIVE_FORMATTER.format(0, 'day')
}

/**
 * True when a month-precision date has not passed yet.
 *
 * Because the stored value is a month rather than a day, a certificate with an
 * expiry of `2026-03` is treated as valid until April begins — expiring it on
 * the 1st of its final month would be wrong for a month-granular credential.
 *
 * A missing or unparseable value returns `true` so malformed data is shown
 * rather than hidden.
 */
export function isMonthCurrent(value: string | null | undefined): boolean {
  if (!value) return true
  const date = toDate(value)
  if (!date) return true

  const endOfMonth = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1))
  return endOfMonth.getTime() > Date.now()
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return `${text.slice(0, length).trimEnd()}...`
}

export function classNames(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}
