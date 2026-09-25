import { createClient } from '@/lib/supabase/server'
import type { Project, ProjectCategory, PaginatedProjects, CategoryCount } from '@/types/project'
import type { ProjectCategoryFilter } from '@/config/site'

const PAGE_SIZE = 12

export async function getProjects({
  page = 1,
  category,
  featured,
  published = true,
}: {
  page?: number
  category?: ProjectCategoryFilter
  featured?: boolean
  published?: boolean
} = {}): Promise<PaginatedProjects> {
  const supabase = await createClient()
  
  let query = supabase
    .from('projects')
    .select('*', { count: 'exact' })
    .order('project_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (published !== undefined) {
    query = query.eq('published', published)
  }
  
  if (featured !== undefined) {
    query = query.eq('featured', featured)
  }
  
  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1
  
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching projects:', error)
    return { projects: [], total: 0, page, pageSize: PAGE_SIZE }
  }

  return {
    projects: (data || []) as Project[],
    total: count || 0,
    page,
    pageSize: PAGE_SIZE,
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('Error fetching project:', error)
    }
    return null
  }

  return data as Project
}

export async function getProjectById(id: string): Promise<Project | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching project by ID:', error)
    return null
  }

  return data as Project
}

export async function getFeaturedProjects(limit = 4): Promise<Project[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('published', true)
    .eq('featured', true)
    .order('project_date', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching featured projects:', error)
    return []
  }

  return (data || []) as Project[]
}

export async function getRelatedProjects(currentSlug: string, category: ProjectCategory, limit = 3): Promise<Project[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('published', true)
    .eq('category', category)
    .neq('slug', currentSlug)
    .order('project_date', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching related projects:', error)
    return []
  }

  return (data || []) as Project[]
}

export async function getCategoryCounts(): Promise<CategoryCount[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('projects')
    .select('category')
    .eq('published', true)

  if (error) {
    console.error('Error fetching category counts:', error)
    return []
  }

  const counts: Record<string, number> = {}
  for (const project of data || []) {
    counts[project.category] = (counts[project.category] || 0) + 1
  }

  return Object.entries(counts).map(([category, count]) => ({
    category: category as ProjectCategory,
    count,
  }))
}

export async function getAllProjectsAdmin(): Promise<Project[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all projects:', error)
    return []
  }

  return (data || []) as Project[]
}