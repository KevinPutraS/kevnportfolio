export interface Project {
  id: string
  title: string
  slug: string
  short_description: string
  description: string | null
  category: ProjectCategory
  technologies: string[]
  thumbnail_url: string | null
  gallery: string[] | null
  project_url: string | null
  repository_url: string | null
  featured: boolean
  published: boolean
  project_date: string | null
  created_at: string
  updated_at: string
}

export type ProjectCategory = 'web' | 'app' | 'design' | 'networking' | 'experiment' | 'school' | 'other'

export interface ProjectFormData {
  title: string
  slug: string
  short_description: string
  description: string
  category: ProjectCategory
  technologies: string
  project_date: string
  thumbnail_url: string
  gallery: string[]
  project_url: string
  repository_url: string
  featured: boolean
  published: boolean
}

export interface ProjectCardProps {
  project: Project
  variant?: 'default' | 'featured' | 'compact'
  className?: string
}

export interface PaginatedProjects {
  projects: Project[]
  total: number
  page: number
  pageSize: number
}

export interface CategoryCount {
  category: ProjectCategory
  count: number
}