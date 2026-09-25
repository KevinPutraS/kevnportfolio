import { z } from 'zod'

export const projectFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  slug: z.string().min(1, 'Slug is required').max(100, 'Slug must be 100 characters or less').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  short_description: z.string().min(1, 'Short description is required').max(300, 'Short description must be 300 characters or less'),
  description: z.string().max(10000, 'Description must be 10,000 characters or less').optional(),
  category: z.enum(['web', 'app', 'design', 'networking', 'experiment', 'school', 'other']),
  technologies: z.string().max(500, 'Technologies must be 500 characters or less').optional(),
  project_date: z.string().regex(/^\d{4}-\d{2}$/, 'Project date must be in YYYY-MM format').optional().or(z.literal('')),
  thumbnail_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  gallery: z.array(z.string().url('Must be a valid URL')).optional(),
  project_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  repository_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
})

export type ProjectFormData = z.infer<typeof projectFormSchema>

export const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject must be 200 characters or less'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000, 'Message must be 5,000 characters or less'),
})

export type ContactFormData = z.infer<typeof contactFormSchema>

export function parseTechnologies(input: string | undefined): string[] {
  if (!input) return []
  return input
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
}

export function formatTechnologies(technologies: string[]): string {
  return technologies.join(', ')
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}