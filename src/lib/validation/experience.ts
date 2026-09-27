import { z } from 'zod'
import { experienceTypes } from '@/config/site'
import type { ExperienceFieldErrors, ExperienceFormData } from '@/types/experience'
import {
  optionalHttpUrlField,
  optionalMediaField,
  parseLines,
  parseList,
  parseSortOrder,
  toDatabaseMonth,
} from './fields'

const employmentTypeValues = experienceTypes.map((type) => type.value) as [
  (typeof experienceTypes)[number]['value'],
  ...(typeof experienceTypes)[number]['value'][],
]

export const employmentTypeSchema = z.enum(employmentTypeValues)

export const experienceFormSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(120, 'Title must be 120 characters or less'),
    organization: z
      .string()
      .trim()
      .min(1, 'Organization is required')
      .max(120, 'Organization must be 120 characters or less'),
    location: z
      .string()
      .max(120, 'Location must be 120 characters or less')
      .optional()
      .or(z.literal('')),
    employment_type: employmentTypeSchema,
    start_date: z
      .string()
      .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Start date must be in YYYY-MM format'),
    end_date: z
      .string()
      .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'End date must be in YYYY-MM format')
      .optional()
      .or(z.literal('')),
    current: z.boolean(),
    description: z
      .string()
      .max(2000, 'Description must be 2,000 characters or less')
      .optional()
      .or(z.literal('')),
    // One responsibility per line: a comma is legal inside a bullet.
    responsibilities: z
      .string()
      .max(2000, 'Responsibilities must be 2,000 characters or less')
      .optional()
      .or(z.literal('')),
    technologies: z
      .string()
      .max(500, 'Technologies must be 500 characters or less')
      .optional()
      .or(z.literal('')),
    organization_logo_url: optionalMediaField,
    project_url: optionalHttpUrlField,
    sort_order: z
      .string()
      .regex(/^-?\d+$/, 'Order must be a whole number')
      .optional()
      .or(z.literal('')),
    published: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.current && values.end_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['end_date'],
        message: 'Clear the end date for a current role',
      })
      return
    }

    if (!values.current && !values.end_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['end_date'],
        message: 'End date is required unless this is a current role',
      })
      return
    }

    if (values.end_date && values.end_date < values.start_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['end_date'],
        message: 'End date must be the same as or after the start date',
      })
    }
  })

export type ExperienceFormValues = z.infer<typeof experienceFormSchema>

/** The shape persisted in the `experiences` table. */
export interface ExperienceRecordInput {
  title: string
  organization: string
  location: string | null
  employment_type: ExperienceFormValues['employment_type']
  start_date: string
  end_date: string | null
  current: boolean
  description: string | null
  responsibilities: string[]
  technologies: string[]
  organization_logo_url: string | null
  project_url: string | null
  sort_order: number
  published: boolean
}

export function toExperienceRecord(values: ExperienceFormValues): ExperienceRecordInput {
  return {
    title: values.title,
    organization: values.organization,
    location: values.location || null,
    employment_type: values.employment_type,
    start_date: toDatabaseMonth(values.start_date) as string,
    // A current role has no end date; storing both is rejected by the schema
    // and by a CHECK constraint, so the flag is authoritative here.
    end_date: values.current ? null : toDatabaseMonth(values.end_date),
    current: values.current,
    description: values.description || null,
    responsibilities: parseLines(values.responsibilities),
    technologies: parseList(values.technologies),
    organization_logo_url: values.organization_logo_url || null,
    project_url: values.project_url || null,
    sort_order: parseSortOrder(values.sort_order),
    published: values.published,
  }
}

export const emptyExperienceForm: ExperienceFormData = {
  title: '',
  organization: '',
  location: '',
  employment_type: 'other',
  start_date: '',
  end_date: '',
  current: false,
  description: '',
  responsibilities: '',
  technologies: '',
  organization_logo_url: '',
  project_url: '',
  sort_order: '0',
  published: false,
}

/**
 * Flattens a ZodError into the `{ field: message }` shape the form renders.
 *
 * `superRefine` issues share the field path of the field they describe, so they
 * surface against the same input instead of at the top of the form.
 */
export function experienceFieldErrors(error: z.ZodError): ExperienceFieldErrors {
  const errors: ExperienceFieldErrors = {}
  for (const issue of error.issues) {
    const field = issue.path[0]
    if (typeof field === 'string' && !(field in errors)) {
      errors[field as keyof ExperienceFormData] = issue.message
    }
  }
  return errors
}
