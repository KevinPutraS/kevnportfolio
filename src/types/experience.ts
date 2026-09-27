import type { ExperienceType } from '@/config/site'

export type { ExperienceType }

export interface Experience {
  id: string
  title: string
  organization: string
  location: string | null
  employment_type: ExperienceType
  /** Month precision: stored as `YYYY-MM-01`. Required by the database. */
  start_date: string
  /** `null` while `current` is true. */
  end_date: string | null
  /** Reserved word in SQL, so it is always quoted; safe as a TS key. */
  current: boolean
  description: string | null
  responsibilities: string[] | null
  technologies: string[] | null
  organization_logo_url: string | null
  project_url: string | null
  sort_order: number
  published: boolean
  created_at: string
  updated_at: string
}

/** The exact set of fields the experience editor manages. */
export interface ExperienceFormData {
  title: string
  organization: string
  location: string
  employment_type: ExperienceType
  start_date: string
  end_date: string
  current: boolean
  description: string
  /** One responsibility per line in the textarea. */
  responsibilities: string
  technologies: string
  organization_logo_url: string
  project_url: string
  sort_order: string
  published: boolean
}

export type ExperienceFieldErrors = Partial<Record<keyof ExperienceFormData, string>>

/** Columns needed to render a compact summary (homepage, about page). */
export interface ExperienceSummary {
  id: string
  title: string
  organization: string
  employment_type: ExperienceType
  start_date: string
  end_date: string | null
  current: boolean
  technologies: string[] | null
}
