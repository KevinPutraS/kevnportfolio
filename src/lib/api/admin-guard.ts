import { NextResponse, type NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { projectFormSchema, toProjectRecord } from '@/lib/validation/project'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export const dynamic = 'force-dynamic'

/**
 * Every admin route follows the same contract:
 *   1. configuration check  -> 503
 *   2. authentication check -> 401
 *   3. validation           -> 400 with per-field messages
 *   4. database write
 *
 * Authorisation is enforced by Row Level Security as well; this guard is only
 * there to return a clean status code instead of an empty 200.
 */
export async function guardAdmin() {
  if (!isSupabaseConfigured()) {
    return {
      error: NextResponse.json(
        { message: 'Supabase is not configured on this deployment.' },
        { status: 503 }
      ),
    }
  }

  const user = await getUser()
  if (!user) {
    return { error: NextResponse.json({ message: 'Not authenticated.' }, { status: 401 }) }
  }

  return { user }
}

export function validationErrorResponse(error: { flatten: () => { fieldErrors: Record<string, string[]> } }) {
  const { fieldErrors } = error.flatten()
  const errors = Object.fromEntries(
    Object.entries(fieldErrors).map(([field, messages]) => [field, messages[0]])
  )
  return NextResponse.json({ message: 'Please fix the highlighted fields.', errors }, { status: 400 })
}

/** Reads and validates a JSON body, returning `null` on malformed input. */
export async function parseJson(request: NextRequest): Promise<unknown | null> {
  try {
    return await request.json()
  } catch {
    return null
  }
}

/** Convenience wrapper for the Supabase client used by admin routes. */
export async function getAdminClient() {
  return requireClient()
}

/**
 * Drops the public caches for a project that was just written.
 *
 * Without this, a project requested while it was still a draft keeps serving
 * the 404 that was rendered for it, and publishing it in the CMS changes
 * nothing on the public site until the cache is discarded by a redeploy. The
 * detail route already opts out of the Full Route Cache, so this exists for the
 * ISR windows on the homepage and the archive plus the Supabase read that
 * backed the previous render.
 */
export function revalidateProjectPaths(slug?: string | null) {
  revalidatePath('/')
  revalidatePath('/projects')
  if (slug) revalidatePath(`/projects/${slug}`)
  else revalidatePath('/projects/[slug]', 'page')
}

/** The public pages whose cached render depends on experiences. */
export function revalidateExperiencePaths() {
  revalidatePath('/')
  revalidatePath('/experience')
  revalidatePath('/about')
}

/** The public pages whose cached render depends on certificates. */
export function revalidateCertificatePaths() {
  revalidatePath('/')
  revalidatePath('/certificates')
  revalidatePath('/about')
}

/**
 * Recognises a PATCH body that only flips boolean switches, e.g. the publish
 * and feature toggles in a table row.
 *
 * Returns `null` when the body contains anything else, which tells the caller
 * to treat it as a full editor save instead. Checking the *value* type matters
 * as much as the key: `{"published": "false"}` is not a toggle request, and
 * forwarding it to Postgres would store the string.
 *
 * Shared because projects, experiences and certificates all expose the same
 * status switches, and each one would otherwise re-implement this check.
 */
export function booleanTogglePatch(
  patch: Record<string, unknown>,
  allowedFields: readonly string[]
): Record<string, boolean> | null {
  const keys = Object.keys(patch)
  if (keys.length === 0) return null
  if (!keys.every((key) => allowedFields.includes(key))) return null
  if (!Object.values(patch).every((value) => typeof value === 'boolean')) return null

  return Object.fromEntries(
    keys.map((key) => [key, patch[key] as boolean])
  ) as Record<string, boolean>
}

/**
 * Turns a database error into a response.
 *
 * 23505 is a unique violation and 23514 a CHECK violation. The latter is
 * reachable for the month-precision date rules and the `current` / end-date
 * rule, so a hand-written query or a client that bypasses the editor surfaces
 * a readable message instead of a bare 500.
 */
export function databaseErrorResponse(error: { code?: string; message: string }, action: string) {
  if (error.code === '23505') {
    return NextResponse.json({ message: 'That value is already in use.' }, { status: 409 })
  }
  if (error.code === '23514') {
    return NextResponse.json(
      { message: 'Those values are not allowed together. Check the dates.' },
      { status: 400 }
    )
  }
  return NextResponse.json({ message: `Could not ${action}.` }, { status: 500 })
}
