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

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: ProjectRow
        Insert: ProjectInsert
        Update: ProjectUpdate
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
