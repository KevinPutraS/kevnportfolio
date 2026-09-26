/** Shared, dependency-free validators that are not tied to a single schema. */

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_PATTERN.test(value)
}

/**
 * True when the string contains a C0 or C1 control character.
 *
 * Implemented with a code-point check rather than a regex literal so the
 * source file itself stays free of unprintable bytes.
 */
export function hasControlCharacters(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index)
    if (code <= 0x1f || (code >= 0x7f && code <= 0x9f)) {
      return true
    }
  }
  return false
}

/** Strips a single layer of leading/trailing slashes from an object key. */
export function normaliseStoragePath(value: string): string {
  return value.replace(/^\/+/, '').replace(/\/+$/, '')
}
