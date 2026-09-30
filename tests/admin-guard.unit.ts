import { expect, test } from '@playwright/test'
import { z } from 'zod'
import {
  booleanTogglePatch,
  databaseErrorResponse,
  parseJson,
  validationErrorResponse,
} from '../src/lib/api/admin-guard'

/**
 * The shared admin request contract.
 *
 * Every admin route is four steps — configured, authenticated, validated,
 * written — and three of those four live in this one file. Projects, experiences
 * and certificates all depend on the helpers below, so a bug in any of them
 * repeats across the whole admin surface at once. None of them had a test.
 *
 * What is worth asserting here is the behaviour at the edges a normal click
 * never produces: a toggle sent as a string, an unknown Postgres error code, a
 * field with two validation messages, a body that is not JSON at all.
 */

test.describe('booleanTogglePatch', () => {
  const statusFields = ['published', 'featured'] as const

  test('accepts a body of nothing but the allowed booleans', () => {
    expect(booleanTogglePatch({ published: true }, statusFields)).toEqual({ published: true })
    expect(booleanTogglePatch({ published: true, featured: false }, statusFields)).toEqual({
      published: true,
      featured: false,
    })
  })

  test('preserves false rather than treating it as absent', () => {
    // The case the whole function exists for. A falsy check here would silently
    // drop an unpublish.
    expect(booleanTogglePatch({ published: false }, statusFields)).toEqual({ published: false })
  })

  test('refuses a boolean sent as a string', () => {
    // `{"published": "false"}` forwarded to Postgres stores the string, and the
    // row reads as published. It must be rejected so the caller falls through to
    // a full editor save.
    expect(booleanTogglePatch({ published: 'false' }, statusFields)).toBeNull()
    expect(booleanTogglePatch({ published: 'true' }, statusFields)).toBeNull()
  })

  test('refuses numbers, null, objects and arrays as toggle values', () => {
    for (const value of [1, 0, null, {}, [], undefined, NaN]) {
      expect(booleanTogglePatch({ published: value }, statusFields), String(value)).toBeNull()
    }
  })

  test('refuses a key that is not on the allowlist', () => {
    // `id` and `slug` are not switches, so a body carrying one is a full save.
    expect(booleanTogglePatch({ published: true, id: 'abc' }, statusFields)).toBeNull()
    expect(booleanTogglePatch({ slug: 'abc' }, statusFields)).toBeNull()
  })

  test('refuses an empty body', () => {
    // Ambiguous with "nothing to do"; the caller treats null as a full save.
    expect(booleanTogglePatch({}, statusFields)).toBeNull()
  })

  test('refuses a mixed body even when the other keys are valid', () => {
    expect(booleanTogglePatch({ published: true, featured: 'no' }, statusFields)).toBeNull()
  })
})

test.describe('databaseErrorResponse', () => {
  test('maps a unique violation to 409', async () => {
    const res = databaseErrorResponse({ code: '23505', message: 'duplicate key value violates unique constraint' }, 'save the project')
    expect(res.status).toBe(409)
    await expect(res.json()).resolves.toMatchObject({ message: expect.any(String) })
  })

  test('maps a check violation to 400', async () => {
    const res = databaseErrorResponse({ code: '23514', message: 'new row violates check constraint' }, 'save the project')
    expect(res.status).toBe(400)
  })

  test('maps anything else to 500', async () => {
    for (const code of [undefined, '', '99999', 'PGRST116']) {
      const res = databaseErrorResponse({ code, message: 'relation "x" does not exist' }, 'save the project')
      expect(res.status, String(code)).toBe(500)
    }
  })

  test('never echoes the database message back to the client', async () => {
    // The Postgres message carries table and constraint names. Turning it into a
    // 500 body would hand a caller the schema for free.
    const leaky = 'duplicate key value violates unique constraint "projects_slug_key"'
    for (const code of ['23505', '23514', 'PGRST116', undefined]) {
      const res = databaseErrorResponse({ code, message: leaky }, 'save the project')
      const text = JSON.stringify(await res.json())
      expect(text, String(code)).not.toContain('projects_slug_key')
      expect(text, String(code)).not.toContain('constraint')
    }
  })

  test('names the action in the generic message so the UI can say what failed', async () => {
    const res = databaseErrorResponse({ code: 'XX', message: 'boom' }, 'delete the certificate')
    await expect(res.json()).resolves.toMatchObject({ message: 'Could not delete the certificate.' })
  })
})

test.describe('validationErrorResponse', () => {
  const schema = z.object({
    // Two independent checks that both fail on the same input, so "take the
    // first message" is actually exercised rather than trivially true. Note
    // `z.string().min(1).min(4)` would *not* do this: the second `min` replaces
    // the first, and only one error is ever reported.
    title: z
      .string()
      .min(4, 'At least 4 characters.')
      .regex(/^[a-z]+$/, 'Lowercase letters only.'),
    slug: z.string().regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and dashes only.'),
  })

  test('returns one message per field so the form can highlight it', async () => {
    const res = validationErrorResponse(schema.safeParse({ title: 'AB', slug: 'Not A Slug' }).error!)
    expect(res.status).toBe(400)
    const body = (await res.json()) as { message: string; errors: Record<string, string> }
    // `title` failed both checks; the first is reported, not the last and not both.
    expect(body.errors.title).toBe('At least 4 characters.')
    expect(body.errors.slug).toBe('Lowercase letters, numbers and dashes only.')
  })

  test('returns an empty error map for a body that failed for no field reason', async () => {
    const schema = z.object({}).strict()
    const res = validationErrorResponse(schema.safeParse({ extra: true }).error!)
    expect(res.status).toBe(400)
    const body = (await res.json()) as { errors: Record<string, string> }
    expect(body.errors).toEqual({})
  })
})

test.describe('parseJson', () => {
  // A real `Request`, not a stub: the point is that `request.json()` rejects
  // malformed input, which is a platform behaviour rather than this app's.
  const asRequest = (init: RequestInit) => new Request('http://localhost/api/admin/projects', init) as never

  test('parses a JSON object', async () => {
    await expect(parseJson(asRequest({ method: 'POST', body: '{"title":"x"}' }))).resolves.toEqual({ title: 'x' })
  })

  test('returns null rather than throwing on malformed JSON', async () => {
    await expect(parseJson(asRequest({ method: 'POST', body: '{not json' }))).resolves.toBeNull()
  })

  test('returns null on an empty body', async () => {
    await expect(parseJson(asRequest({ method: 'POST' }))).resolves.toBeNull()
  })

  test('does not throw on a JSON scalar, which is valid JSON but not an object', async () => {
    // `"just a string"` parses fine; the zod schema then rejects it. What must
    // not happen is the guard throwing and turning a 400 into a 500.
    await expect(parseJson(asRequest({ method: 'POST', body: '"just a string"' }))).resolves.toBe('just a string')
  })
})
