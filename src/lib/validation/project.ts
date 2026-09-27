import { z } from 'zod'
import { projectCategories } from '@/config/site'
import {
  mediaReferenceSchema,
  optionalHttpUrlField,
  optionalMediaField,
  optionalMonthField,
  parseList,
  toDatabaseMonth,
} from './fields'

const categoryValues = projectCategories.map((category) => category.value) as [
  (typeof projectCategories)[number]['value'],
  ...(typeof projectCategories)[number]['value'][],
]

export const projectCategorySchema = z.enum(categoryValues)

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
  project_date: optionalMonthField,
  thumbnail_url: optionalMediaField,
  gallery: z.array(mediaReferenceSchema).max(12, 'A project can have at most 12 gallery images'),
  project_url: optionalHttpUrlField,
  repository_url: optionalHttpUrlField,
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
    technologies: parseList(values.technologies),
    thumbnail_url: values.thumbnail_url ? values.thumbnail_url : null,
    gallery: values.gallery,
    project_url: values.project_url ? values.project_url : null,
    repository_url: values.repository_url ? values.repository_url : null,
    featured: values.featured,
    published: values.published,
    project_date: toDatabaseMonth(values.project_date),
  }
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
