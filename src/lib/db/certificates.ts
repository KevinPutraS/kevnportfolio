import { requireClient } from '@/lib/supabase/server'
import { requirePublicClient } from '@/lib/supabase/public'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { isUuid } from '@/lib/utils/validation'
import type { Certificate } from '@/types/certificate'

export const CERTIFICATE_PREVIEW_LIMIT = 3

export interface GetCertificatesOptions {
  limit?: number
  /** `true` -> certificates whose expiry date has not passed. */
  active?: boolean
}

/**
 * The public certificate list, newest first.
 *
 * Same ordering contract as the experience timeline: `sort_order` pins an
 * entry, then `issue_date` breaks the (very common) tie at the default 0.
 */
export async function getPublishedCertificates({
  limit = 100,
  active,
}: GetCertificatesOptions = {}): Promise<Certificate[]> {
  if (!isSupabaseConfigured()) return []

  const supabase = requirePublicClient()
  let query = supabase
    .from('certificates')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: false })
    .order('issue_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(Math.min(200, Math.max(1, limit)))

  if (active !== undefined) {
    const today = new Date().toISOString().slice(0, 10)
    /*
     * Both directions are explicit. `active: false` used to fall through and
     * return every row, which silently included the expired certificates the
     * caller was trying to exclude — a wrong result rather than an empty one.
     *
     * A null `expiration_date` means "does not expire", so it only ever
     * appears in the `active: true` set.
     */
    query = active
      ? query.or(`expiration_date.is.null,expiration_date.gte.${today}`)
      : query.not('expiration_date', 'is', null).lt('expiration_date', today)
  }

  const { data, error } = await query

  if (error) {
    console.error('[db] failed to fetch certificates:', error.message)
    return []
  }

  return (data ?? []) as Certificate[]
}

/**
 * Drafts included. Session client, so RLS still limits it to admins.
 *
 * `strict` rethrows so the admin API can answer 500 instead of implying the
 * collection is empty; the admin pages keep the lenient default.
 */
export async function getAllCertificatesForAdmin({ strict = false } = {}): Promise<Certificate[]> {
  if (!isSupabaseConfigured()) return []

  const supabase = await requireClient()
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .order('sort_order', { ascending: false })
    .order('issue_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    if (strict) throw new Error(`Failed to load certificates: ${error.message}`)
    console.error('[db] failed to fetch certificates for admin:', error.message)
    return []
  }

  return (data ?? []) as Certificate[]
}

/** Single row for the editor. Returns drafts, hence the session client. */
export async function getCertificateById(id: string): Promise<Certificate | null> {
  if (!isSupabaseConfigured()) return null
  if (!isUuid(id)) return null

  const supabase = await requireClient()
  const { data, error } = await supabase.from('certificates').select('*').eq('id', id).limit(1)

  if (error) {
    console.error('[db] failed to fetch certificate by id:', error.message)
    return null
  }

  return (data as Certificate[])[0] ?? null
}
