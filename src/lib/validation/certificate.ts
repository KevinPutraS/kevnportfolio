import { z } from 'zod'
import type { CertificateFieldErrors, CertificateFormData } from '@/types/certificate'
import {
  optionalHttpUrlField,
  optionalMediaField,
  parseList,
  parseSortOrder,
  toDatabaseMonth,
} from './fields'

export const certificateFormSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(150, 'Title must be 150 characters or less'),
    issuer: z
      .string()
      .trim()
      .min(1, 'Issuer is required')
      .max(120, 'Issuer must be 120 characters or less'),
    issue_date: z
      .string()
      .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Issue date must be in YYYY-MM format'),
    expiration_date: z
      .string()
      .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Expiry date must be in YYYY-MM format')
      .optional()
      .or(z.literal('')),
    credential_id: z
      .string()
      .max(120, 'Credential ID must be 120 characters or less')
      .optional()
      .or(z.literal('')),
    credential_url: optionalHttpUrlField,
    certificate_image_url: optionalMediaField,
    description: z
      .string()
      .max(1000, 'Description must be 1,000 characters or less')
      .optional()
      .or(z.literal('')),
    skills: z
      .string()
      .max(500, 'Skills must be 500 characters or less')
      .optional()
      .or(z.literal('')),
    sort_order: z
      .string()
      .regex(/^-?\d+$/, 'Order must be a whole number')
      .optional()
      .or(z.literal('')),
    published: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.expiration_date && values.expiration_date < values.issue_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['expiration_date'],
        message: 'Expiry date must be the same as or after the issue date',
      })
    }
  })

export type CertificateFormValues = z.infer<typeof certificateFormSchema>

/** The shape persisted in the `certificates` table. */
export interface CertificateRecordInput {
  title: string
  issuer: string
  issue_date: string
  expiration_date: string | null
  credential_id: string | null
  credential_url: string | null
  certificate_image_url: string | null
  description: string | null
  skills: string[]
  sort_order: number
  published: boolean
}

export function toCertificateRecord(values: CertificateFormValues): CertificateRecordInput {
  return {
    title: values.title,
    issuer: values.issuer,
    issue_date: toDatabaseMonth(values.issue_date) as string,
    expiration_date: toDatabaseMonth(values.expiration_date),
    credential_id: values.credential_id || null,
    credential_url: values.credential_url || null,
    certificate_image_url: values.certificate_image_url || null,
    description: values.description || null,
    skills: parseList(values.skills),
    sort_order: parseSortOrder(values.sort_order),
    published: values.published,
  }
}

export const emptyCertificateForm: CertificateFormData = {
  title: '',
  issuer: '',
  issue_date: '',
  expiration_date: '',
  credential_id: '',
  credential_url: '',
  certificate_image_url: '',
  description: '',
  skills: '',
  sort_order: '0',
  published: false,
}

export function certificateFieldErrors(error: z.ZodError): CertificateFieldErrors {
  const errors: CertificateFieldErrors = {}
  for (const issue of error.issues) {
    const field = issue.path[0]
    if (typeof field === 'string' && !(field in errors)) {
      errors[field as keyof CertificateFormData] = issue.message
    }
  }
  return errors
}
