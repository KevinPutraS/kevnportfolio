export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          title: string
          slug: string
          short_description: string
          description: string | null
          category: 'web' | 'app' | 'design' | 'networking' | 'experiment' | 'school' | 'other'
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
        Insert: {
          id?: string
          title: string
          slug: string
          short_description: string
          description?: string | null
          category: 'web' | 'app' | 'design' | 'networking' | 'experiment' | 'school' | 'other'
          technologies?: string[] | null
          thumbnail_url?: string | null
          gallery?: string[] | null
          project_url?: string | null
          repository_url?: string | null
          featured?: boolean
          published?: boolean
          project_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          short_description?: string
          description?: string | null
          category?: 'web' | 'app' | 'design' | 'networking' | 'experiment' | 'school' | 'other'
          technologies?: string[] | null
          thumbnail_url?: string | null
          gallery?: string[] | null
          project_url?: string | null
          repository_url?: string | null
          featured?: boolean
          published?: boolean
          project_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}