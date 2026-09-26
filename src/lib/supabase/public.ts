import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from './config'

/**
 * Anonymous, cookieless Supabase client used for every public read.
 *
 * Why this exists
 * ---------------
 * The request-scoped client in `./server.ts` calls `cookies()`, which forces
 * Next.js to opt the whole route out of static rendering. Public pages do not
 * need a session: Row Level Security already restricts the `anon` role to
 * `published = true`, so a cookie-less client is both safer (there is no user
 * context to leak into a shared cache) and cacheable, which lets the public
 * pages be statically generated and revalidated on an interval.
 *
 * Admin reads keep using the session client from `./server.ts`.
 */
export function createPublicClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null

  return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

/** Same, but guarantees a client. Check {@link isSupabaseConfigured} first. */
export function requirePublicClient(): SupabaseClient {
  const client = createPublicClient()
  if (!client) {
    throw new Error('Public Supabase client requested while Supabase is not configured')
  }
  return client
}
