import { requireClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export type SessionUser = { id: string; email: string | null }

/**
 * Resolves the current user from the request cookie session.
 *
 * `getUser()` revalidates the JWT with Supabase Auth on every call, which is
 * what makes this safe for authorization decisions (a stale/unsigned cookie
 * cannot grant access).
 */
export async function getUser(): Promise<SessionUser | null> {
  if (!isSupabaseConfigured()) return null

  const supabase = await requireClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null
  return { id: user.id, email: user.email ?? null }
}

export async function isAuthenticated(): Promise<boolean> {
  return (await getUser()) !== null
}

/**
 * Server-action / route-handler guard. Returns the user or `null` so callers
 * can respond with the right status code instead of catching an exception.
 */
export async function requireUser(): Promise<SessionUser | null> {
  return getUser()
}

export async function signIn(email: string, password: string) {
  const supabase = await requireClient()
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  const supabase = await requireClient()
  return supabase.auth.signOut()
}
