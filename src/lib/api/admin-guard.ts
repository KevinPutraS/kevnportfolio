import { NextResponse, type NextRequest } from 'next/server'
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
