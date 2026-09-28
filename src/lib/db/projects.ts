import { requireClient } from '@/lib/supabase/server'
import { requirePublicClient } from '@/lib/supabase/public'
import type { Project, ProjectCategory, PaginatedProjects, CategoryCount } from '@/types/project'
import type { ProjectCategoryFilter } from '@/config/site'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { isUuid } from '@/lib/utils/validation'

/**
 * Nine, so a full page of results is three rows of three on a desktop.
 *
 * Twelve was a grid-shaped number and not a page-shaped one: four rows is a long
 * scroll on a laptop and a very long one on a phone, and it left the paginator
 * with enough pages that the numbers no longer fit in one line. Nine keeps the
 * page bounded at something that can actually be scanned in one pass.
 */
export const PROJECTS_PAGE_SIZE = 9

export interface GetProjectsOptions {
  page?: number
  /** Overrides the default page size. Clamped to 1–100. */
  pageSize?: number
  category?: ProjectCategoryFilter
  featured?: boolean
  /**
   * `true`  -> published only (public site)
   * `false` -> drafts only
   * `null`  -> no status filter (admin listing, RLS still protects the rows)
   */
  published?: boolean | null
}

function isMissingConfig(error: { code?: string } | null): boolean {
  // PostgREST raises this when the anon key cannot reach the project at all.
  return error?.code === 'PGRST301' || error?.code === 'PGRST00'
}

function emptyResult(page: number): PaginatedProjects {
  return { projects: [], total: 0, page, pageSize: PROJECTS_PAGE_SIZE }
}

/**
 * Reads projects through the caller's Supabase session, so Row Level Security
 * decides what is visible: anonymous visitors only ever see published rows.
 */
export async function getProjects({
  page = 1,
  pageSize = PROJECTS_PAGE_SIZE,
  category,
  featured,
  published = true,
}: GetProjectsOptions = {}): Promise<PaginatedProjects> {
  if (!isSupabaseConfigured()) return emptyResult(page)

  // Asking for every status is the admin listing, and it *must* go through the
  // session client. The cookieless public client runs as `anon`, whose RLS
  // policy is `published = true`, so it silently hides every draft — the
  // "including drafts" list would only ever show published rows and the
  // unpublish action would have nothing to act on.
  //
  // Cost of the session client is `cookies()`, which opts the route out of
  // static rendering. Admin routes are already `force-dynamic`, so nothing is
  // lost; the public path below keeps the cacheable cookieless client.
  const isAdminListing = published === null
  const supabase = isAdminListing ? await requireClient() : requirePublicClient()
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
  const safePageSize = Math.min(100, Math.max(1, Math.floor(pageSize) || PROJECTS_PAGE_SIZE))

  let query = supabase
    .from('projects')
    .select('*', { count: 'exact' })
    .order('project_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (published !== null) {
    query = query.eq('published', published)
  }

  if (featured !== undefined) {
    query = query.eq('featured', featured)
  }

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  const from = (safePage - 1) * safePageSize
  const { data, error, count } = await query.range(from, from + safePageSize - 1)

  if (error) {
    if (!isMissingConfig(error)) {
      console.error('[db] failed to fetch projects:', error.message)
    }
    return emptyResult(safePage)
  }

  return {
    projects: (data ?? []) as Project[],
    total: count ?? 0,
    page: safePage,
    pageSize: safePageSize,
  }
}

/**
 * Exact published / draft / featured counts, for the admin dashboard.
 *
 * The dashboard used to derive its counters by filtering the five most recent
 * projects and calling the result "Drafts". With more than five projects in the
 * system that number was simply wrong — it counted drafts *among the five
 * newest* — so the four tiles could not add up to the "Total projects" tile
 * beside them, which came from a real `count: 'exact'`. Somebody checking the
 * dashboard against the projects list saw a contradiction and had no way to
 * tell which figure was lying.
 *
 * `getProjects` already returns an exact `total`, so this reuses it three times
 * with `pageSize: 1`: the count is correct regardless of page size, so one row
 * back per query is all that is needed. Three narrow index-backed counts are
 * far cheaper than shipping every project row to the server just to count them
 * in JavaScript.
 *
 * Uses the session client (`published: null`) so drafts are visible at all —
 * the cookieless public client runs as `anon` under a `published = true` RLS
 * policy and would report zero drafts forever.
 */
export async function getProjectStatusCounts(): Promise<{
  total: number
  published: number
  drafts: number
  featured: number
}> {
  if (!isSupabaseConfigured()) return { total: 0, published: 0, drafts: 0, featured: 0 }

  const [all, live, unpublished, starred] = await Promise.all([
    getProjects({ page: 1, pageSize: 1, published: null }),
    getProjects({ page: 1, pageSize: 1, published: true }),
    getProjects({ page: 1, pageSize: 1, published: false }),
    getProjects({ page: 1, pageSize: 1, published: null, featured: true }),
  ])

  return {
    total: all.total,
    published: live.total,
    drafts: unpublished.total,
    featured: starred.total,
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (!isSupabaseConfigured()) return null

  const supabase = await requirePublicClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .limit(1)

  if (error) {
    console.error('[db] failed to fetch project by slug:', error.message)
    return null
  }

  return (data as Project[])[0] ?? null
}

/** Used by the admin editor. Returns drafts as well as published projects. */
export async function getProjectById(id: string): Promise<Project | null> {
  if (!isSupabaseConfigured()) return null
  if (!isUuid(id)) return null

  const supabase = await requireClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .limit(1)

  if (error) {
    console.error('[db] failed to fetch project by id:', error.message)
    return null
  }

  return (data as Project[])[0] ?? null
}

export async function getFeaturedProjects(limit = 4): Promise<Project[]> {
  if (!isSupabaseConfigured()) return []

  const supabase = await requirePublicClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('published', true)
    .eq('featured', true)
    .order('project_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[db] failed to fetch featured projects:', error.message)
    return []
  }

  return (data ?? []) as Project[]
}

export async function getRelatedProjects(
  currentSlug: string,
  category: ProjectCategory,
  limit = 3
): Promise<Project[]> {
  if (!isSupabaseConfigured()) return []

  const supabase = await requirePublicClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('published', true)
    .eq('category', category)
    .neq('slug', currentSlug)
    .order('project_date', { ascending: false, nullsFirst: false })
    .limit(limit)

  if (error) {
    console.error('[db] failed to fetch related projects:', error.message)
    return []
  }

  return (data ?? []) as Project[]
}

/** Counts published projects per category, always returning every category. */
export async function getCategoryCounts(): Promise<CategoryCount[]> {
  if (!isSupabaseConfigured()) return []

  const supabase = await requirePublicClient()
  const { data, error } = await supabase.from('projects').select('category').eq('published', true)

  if (error) {
    console.error('[db] failed to fetch category counts:', error.message)
    return []
  }

  const counts = new Map<string, number>()
  for (const row of data ?? []) {
    counts.set(row.category, (counts.get(row.category) ?? 0) + 1)
  }

  return [...counts.entries()].map(([category, count]) => ({
    category: category as ProjectCategory,
    count,
  }))
}

/**
 * Slug + update timestamp for every published project.
 * The sitemap needs *all* of them, not one page of results.
 */
export async function getPublishedProjectIndex(): Promise<
  Array<{ slug: string; updatedAt: string | null }>
> {
  if (!isSupabaseConfigured()) return []

  const supabase = await requirePublicClient()
  const { data, error } = await supabase
    .from('projects')
    .select('slug, updated_at')
    .eq('published', true)
    .order('project_date', { ascending: false, nullsFirst: false })

  if (error) {
    console.error('[db] failed to fetch published project index:', error.message)
    return []
  }

  const rows: Array<{ slug: string; updated_at: string | null }> = data ?? []

  return rows.map((row) => ({ slug: row.slug, updatedAt: row.updated_at ?? null }))
}
