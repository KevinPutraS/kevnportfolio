import { z } from 'zod'
import { projectCategories } from '@/config/site'

const categoryValues = projectCategories.map((category) => category.value) as [
  (typeof projectCategories)[number]['value'],
  ...(typeof projectCategories)[number]['value'][],
]

export const projectCategorySchema = z.enum(categoryValues)

/**
 * Accepts absolute http(s) URLs and root-relative paths (used by the bundled
 * placeholder images in `public/images`). Anything else is rejected so a
 * `javascript:` or `data:` URL can never reach the database.
 */
const imageOrUrlSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => {
    if (value.startsWith('/')) return !value.startsWith('//')
    try {
      const url = new URL(value)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }, 'Must be an http(s) URL or a root-relative path starting with /')

/** Same rules, but the field is optional and an empty string means "unset". */
const optionalMediaField = z.union([imageOrUrlSchema, z.literal('')])

export const projectFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be 100 characters or less')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be lowercase letters, numbers and single hyphens (e.g. my-project)'
    ),
  short_description: z
    .string()
    .trim()
    .min(1, 'Short description is required')
    .max(300, 'Short description must be 300 characters or less'),
  description: z
    .string()
    .max(10000, 'Description must be 10,000 characters or less')
    .optional()
    .or(z.literal('')),
  category: projectCategorySchema,
  technologies: z
    .string()
    .max(500, 'Technologies must be 500 characters or less')
    .optional()
    .or(z.literal('')),
  project_date: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Project date must be in YYYY-MM format')
    .optional()
    .or(z.literal('')),
  thumbnail_url: optionalMediaField,
  gallery: z.array(imageOrUrlSchema).max(12, 'A project can have at most 12 gallery images'),
  project_url: z
    .union([imageOrUrlSchema, z.literal('')])
    .refine((value) => value === '' || value.startsWith('https://') || value.startsWith('http://'), {
      message: 'Must be an http(s) URL',
    }),
  repository_url: z
    .union([imageOrUrlSchema, z.literal('')])
    .refine((value) => value === '' || value.startsWith('https://') || value.startsWith('http://'), {
      message: 'Must be an http(s) URL',
    }),
  featured: z.boolean(),
  published: z.boolean(),
})

export type ProjectFormValues = z.infer<typeof projectFormSchema>

/** The shape persisted in the `projects` table. */
export interface ProjectRecordInput {
  title: string
  slug: string
  short_description: string
  description: string | null
  category: (typeof projectCategories)[number]['value']
  technologies: string[]
  thumbnail_url: string | null
  gallery: string[]
  project_url: string | null
  repository_url: string | null
  featured: boolean
  published: boolean
  project_date: string | null
}

/**
 * Turns validated form strings into the row shape the database expects.
 * Empty strings become `null` so the UI can hide optional sections cleanly.
 */
export function toProjectRecord(values: ProjectFormValues): ProjectRecordInput {
  return {
    title: values.title,
    slug: values.slug,
    short_description: values.short_description,
    description: values.description ? values.description : null,
    category: values.category,
    technologies: parseTechnologies(values.technologies),
    thumbnail_url: values.thumbnail_url ? values.thumbnail_url : null,
    gallery: values.gallery,
    project_url: values.project_url ? values.project_url : null,
    repository_url: values.repository_url ? values.repository_url : null,
    featured: values.featured,
    published: values.published,
    project_date: values.project_date ? values.project_date : null,
  }
}

export function parseTechnologies(input: string | undefined | null): string[] {
  if (!input) return []
  const seen = new Set<string>()
  for (const part of input.split(',')) {
    const value = part.trim()
    if (value && !seen.has(value)) seen.add(value)
  }
  return [...seen]
}

export function formatTechnologies(technologies: readonly string[] | null | undefined): string {
  return technologies?.join(', ') ?? ''
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
}
