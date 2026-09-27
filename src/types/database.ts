/**
 * Hand-maintained mirror of the Postgres schema.
 *
 * Regenerate with `npm run db:generate` after changing a migration, then merge
 * the result. The `Category` union must stay in sync with the CHECK constraint
 * in `supabase/migrations/*_initial_schema.sql`.
 *
 * The `[_ in never]: never` form for the empty schema members is the shape
 * `supabase gen types` emits; using a plain `Record<string, never>` instead
 * makes every `.from()` query resolve to `never`.
 */

export type ProjectCategory =
  | 'web'
  | 'app'
  | 'design'
  | 'networking'
  | 'experiment'
  | 'school'
  | 'other'

export interface ProjectRow {
  id: string
  title: string
  slug: string
  short_description: string
  description: string | null
  category: ProjectCategory
  technologies: string[] | null
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

export type ProjectInsert = Omit<ProjectRow, 'id' | 'created_at' | 'updated_at'> &
  Partial<Pick<ProjectRow, 'id' | 'created_at' | 'updated_at'>>

export type ProjectUpdate = Partial<Omit<ProjectRow, 'id' | 'created_at' | 'updated_at'>>

export type ExperienceType =
  | 'internship'
  | 'part_time'
  | 'freelance'
  | 'organization'
  | 'school_project'
  | 'volunteer'
  | 'other'

export interface ExperienceRow {
  id: string
  title: string
  organization: string
  location: string | null
  employment_type: ExperienceType
  /** NOT NULL in Postgres; month precision. */
  start_date: string
  end_date: string | null
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

export type ExperienceInsert = Omit<ExperienceRow, 'id' | 'created_at' | 'updated_at'> &
  Partial<Pick<ExperienceRow, 'id' | 'created_at' | 'updated_at'>>

export type ExperienceUpdate = Partial<Omit<ExperienceRow, 'id' | 'created_at' | 'updated_at'>>

export interface CertificateRow {
  id: string
  title: string
  issuer: string
  /** NOT NULL in Postgres; month precision. */
  issue_date: string
  expiration_date: string | null
  credential_id: string | null
  credential_url: string | null
  certificate_image_url: string | null
  description: string | null
  skills: string[] | null
  sort_order: number
  published: boolean
  created_at: string
  updated_at: string
}

export type CertificateInsert = Omit<CertificateRow, 'id' | 'created_at' | 'updated_at'> &
  Partial<Pick<CertificateRow, 'id' | 'created_at' | 'updated_at'>>

export type CertificateUpdate = Partial<Omit<CertificateRow, 'id' | 'created_at' | 'updated_at'>>

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: ProjectRow
        Insert: ProjectInsert
        Update: ProjectUpdate
        Relationships: []
      }
      experiences: {
        Row: ExperienceRow
        Insert: ExperienceInsert
        Update: ExperienceUpdate
        Relationships: []
      }
      certificates: {
        Row: CertificateRow
        Insert: CertificateInsert
        Update: CertificateUpdate
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
