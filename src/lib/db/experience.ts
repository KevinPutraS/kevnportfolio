import { requireClient } from '@/lib/supabase/server'
import { requirePublicClient } from '@/lib/supabase/public'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { isUuid } from '@/lib/utils/validation'
import type { Experience, ExperienceSummary } from '@/types/experience'

export const EXPERIENCE_PREVIEW_LIMIT = 4

export interface GetExperiencesOptions {
  limit?: number
  /** `true` -> ongoing roles only. */
  current?: boolean
}

/**
 * The public timeline, newest first by default.
 *
 * Ordering is `sort_order` first so an entry can be pinned to the top of the
 * list from the CMS, then `start_date` so the natural chronology still governs
 * the common case where every row shares the default order of 0.
 */
export async function getPublishedExperiences({
  limit = 100,
  current,
}: GetExperiencesOptions = {}): Promise<Experience[]> {
  if (!isSupabaseConfigured()) return []

  const supabase = requirePublicClient()
  let query = supabase
    .from('experiences')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: false })
    .order('start_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(Math.min(200, Math.max(1, limit)))

  if (current !== undefined) {
    query = query.eq('current', current)
  }

  const { data, error } = await query

  if (error) {
    console.error('[db] failed to fetch experiences:', error.message)
    return []
  }

  return (data ?? []) as Experience[]
}

/**
 * Compact shape for the homepage and About previews, so those pages do not
 * pull full descriptions and responsibility lists they never render.
 */
export async function getExperienceSummaries(limit = EXPERIENCE_PREVIEW_LIMIT): Promise<
  ExperienceSummary[]
> {
  if (!isSupabaseConfigured()) return []

  const supabase = requirePublicClient()
  const { data, error } = await supabase
    .from('experiences')
    .select('id, title, organization, employment_type, start_date, end_date, current, technologies')
    .eq('published', true)
    .order('sort_order', { ascending: false })
    .order('start_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(Math.min(20, Math.max(1, limit)))

  if (error) {
    console.error('[db] failed to fetch experience summaries:', error.message)
    return []
  }

  return (data ?? []) as ExperienceSummary[]
}

/**
 * Every row, drafts included, for the CMS listing.
 *
 * Uses the session client, so an authenticated non-admin still only sees
 * published rows — the `Admins can read all experiences` policy is what makes
 * drafts visible, not the choice of client.
 *
 * `strict` rethrows instead of returning `[]`, which is what the admin API route
 * needs: a 500 is truthful, whereas an empty list reads as "you have no entries".
 * The admin pages deliberately keep the lenient default.
 */
export async function getAllExperiencesForAdmin({ strict = false } = {}): Promise<Experience[]> {
  if (!isSupabaseConfigured()) return []

  const supabase = await requireClient()
  const { data, error } = await supabase
    .from('experiences')
    .select('*')
    .order('sort_order', { ascending: false })
    .order('start_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    if (strict) throw new Error(`Failed to load experiences: ${error.message}`)
    console.error('[db] failed to fetch experiences for admin:', error.message)
    return []
  }

  return (data ?? []) as Experience[]
}

/** Single row for the editor. Returns drafts, hence the session client. */
export async function getExperienceById(id: string): Promise<Experience | null> {
  if (!isSupabaseConfigured()) return null
  if (!isUuid(id)) return null

  const supabase = await requireClient()
  const { data, error } = await supabase.from('experiences').select('*').eq('id', id).limit(1)

  if (error) {
    console.error('[db] failed to fetch experience by id:', error.message)
    return null
  }

  return (data as Experience[])[0] ?? null
}
