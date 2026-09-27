import { z } from 'zod'
import { formatMonth } from '@/lib/utils/helpers'

/**
 * Field primitives shared by the project, experience and certificate schemas.
 *
 * These were previously declared privately inside `project.ts`. Adding two more
 * content types meant either copy-pasting the same URL/date logic a third time
 * or extracting it here. Extracting is the cheaper failure mode: the month-date
 * bug that broke project saves (Postgres rejecting `2026-01`) would otherwise
 * have to be fixed three times, and a partial fix is worse than none.
 */

/** Absolute `http(s)` URL. Rejects `javascript:`, `data:` and relative paths. */
export const absoluteHttpUrlSchema = z
  .string()
  .trim()
  .min(1, 'Must be an http(s) URL')
  .refine((value) => {
    try {
      const url = new URL(value)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }, 'Must be an http(s) URL')

/** A path served by this site, e.g. a bundled placeholder in /public/images. */
export const rootRelativePathSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => value.startsWith('/') && !value.startsWith('//'), 'Must be a path starting with /')

/**
 * An image reference: either an absolute URL or a path this site serves.
 * `//evil.com` is rejected because a protocol-relative URL silently inherits the
 * current page's scheme.
 */
export const mediaReferenceSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => {
    if (value.startsWith('/')) return !value.startsWith('//')
    try {
      const url = new URL(value)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }, 'Must be an http(s) URL or a root-relative path starting with /')

/*
 * The `.optional()` on each of these matters. Without it a client that simply
 * omits an optional key fails with a bare "Invalid input" against a field it
 * never sent, which reads like a bug in the editor rather than a missing value.
 * A value that *is* supplied is still validated in full.
 */

/** Optional image field. An empty string means "unset", not "invalid". */
export const optionalMediaField = z.union([mediaReferenceSchema, z.literal('')]).optional()

/** Optional outbound link. Only absolute http(s) URLs, or empty. */
export const optionalHttpUrlField = z.union([absoluteHttpUrlSchema, z.literal('')]).optional()

/** `YYYY-MM`, matching what `<input type="month">` submits. */
export const monthSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Must be in YYYY-MM format')

/** Optional month field. */
export const optionalMonthField = z.union([monthSchema, z.literal('')]).optional()

/** The months an experience spans, with `null` meaning "still going". */
export function formatDateRange(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  current: boolean
): string {
  const start = formatMonth(startDate)
  const end = current ? 'Present' : formatMonth(endDate)

  if (start && end) return `${start} — ${end}`
  if (start) return start
  if (end) return `Until ${end}`
  return ''
}

/**
 * Turns a month-precision value into the shape a Postgres `date` column needs.
 *
 * The editors use `<input type="month">`, which submits `2026-01`. A `date`
 * column will not parse that:
 *
 *     22007 invalid input syntax for type date: "2026-01"
 *
 * so every save with a date failed with a 500 until this conversion was added.
 * The day is never displayed, so the first of the month is stored: it keeps the
 * column a real `date`, sorts correctly, and survives the CHECK constraint that
 * pins the day to 01.
 */
export function toDatabaseMonth(value: string | undefined | null): string | null {
  if (!value) return null
  return `${value}-01`
}

/** Inverse of {@link toDatabaseMonth}, for populating a month input. */
export function toMonthInput(value: string | null | undefined): string {
  return value ? value.slice(0, 7) : ''
}

/** Splits a comma-separated string, trims, drops empties and de-duplicates. */
export function parseList(input: string | undefined | null): string[] {
  if (!input) return []
  const seen = new Set<string>()
  for (const part of input.split(',')) {
    const value = part.trim()
    if (value) seen.add(value)
  }
  return [...seen]
}

/**
 * Splits a newline-separated string, used for free-form bullet lists where a
 * comma is a legitimate character inside an item.
 */
export function parseLines(input: string | undefined | null, limit = 20): string[] {
  if (!input) return []
  const seen = new Set<string>()
  for (const part of input.split('\n')) {
    const value = part.trim()
    if (value) seen.add(value)
  }
  return [...seen].slice(0, limit)
}

/** Inverse of {@link parseList}, for populating a text input. */
export function formatList(values: readonly string[] | null | undefined): string {
  return values?.join(', ') ?? ''
}

/** Inverse of {@link parseLines}, for populating a textarea. */
export function formatLines(values: readonly string[] | null | undefined): string {
  return values?.join('\n') ?? ''
}

/**
 * Parses the manual ordering field. Anything unparseable becomes 0 rather than
 * `NaN`, because `NaN` serialised into a Postgres `integer` column is a 500.
 */
export function parseSortOrder(value: string | number | undefined | null): number {
  const parsed = typeof value === 'number' ? value : Number.parseInt(String(value ?? '').trim(), 10)
  if (!Number.isFinite(parsed)) return 0
  return Math.min(100000, Math.max(-100000, Math.trunc(parsed)))
}
