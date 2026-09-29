import type { ProjectCategory } from '@/config/site'
import type { ProjectStatus } from '@/config/project-status'

export type { ProjectCategory, ProjectStatus }

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
  /**
   * What the owner actually did on this project. `null` means not stated, and
   * the public page omits the row rather than rendering an empty one.
   */
  role: string | null
  /**
   * How finished it is. `null` renders no badge at all — see the migration for
   * why this is not defaulted to a value the author never chose.
   */
  status: ProjectStatus | null
  /** What came of it. Capped at 600 characters in the database. */
  outcome: string | null
  /** Month precision: stored as `YYYY-MM`. */
  project_date: string | null
  created_at: string
  updated_at: string
}

/** The exact set of fields the project editor manages. */
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
  role: string
  status: '' | ProjectStatus
  outcome: string
  featured: boolean
  published: boolean
}

export type ProjectFieldErrors = Partial<Record<keyof ProjectFormData, string>>

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
