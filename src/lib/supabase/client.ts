import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from './config'

/**
 * Browser client for auth session management. Returns `null` when Supabase has
 * not been configured so callers can degrade instead of crashing the bundle.
 *
 * Only ever called from Client Components — never import this on the server.
 */
export function createClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
