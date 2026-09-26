import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from './config'

/**
 * Request-scoped Supabase client that reads and refreshes the auth session
 * from cookies. Row Level Security is evaluated against the caller's session,
 * which is what keeps drafts private from anonymous visitors.
 *
 * The client is intentionally not parameterised with the generated
 * `Database` type: coupling to `supabase-js`'s generic helpers made every
 * `.from()` call resolve to `never` on this version. Rows are narrowed with an
 * explicit cast to `ProjectRow` at each call site instead, so the schema is
 * still checked where it matters.
 *
 * Returns `null` when Supabase is not configured so pages can render their
 * empty states instead of throwing during a build.
 */
export async function createClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured()) return null

  const cookieStore = await cookies()

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch {
          // Called from a Server Component: the session is refreshed by the
          // middleware instead, so this is safe to ignore.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options })
        } catch {
          // See the note in `set`.
        }
      },
    },
  })
}

/**
 * Same as {@link createClient} but guarantees a client. Callers must already
 * have checked {@link isSupabaseConfigured}.
 */
export async function requireClient(): Promise<SupabaseClient> {
  const client = await createClient()
  if (!client) {
    throw new Error('Supabase client requested while Supabase is not configured')
  }
  return client
}
