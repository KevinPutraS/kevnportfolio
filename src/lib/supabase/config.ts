/**
 * Single source of truth for Supabase environment configuration.
 *
 * The app must boot (and render useful empty/error states) even when the
 * environment has not been wired up yet, so nothing here throws.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? ''
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? ''

export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0
}

/** Throws a descriptive error only on paths that genuinely require Supabase. */
export function assertSupabaseConfigured(): void {
  if (isSupabaseConfigured()) return
  throw new Error(
    'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
  )
}
