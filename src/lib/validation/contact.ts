import { z } from 'zod'

/**
 * Contact form contract. The field is intentionally a honeypot: real users
 * never see it, bots fill in every input they can find.
 */
export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  subject: z
    .string()
    .trim()
    .min(1, 'Subject is required')
    .max(200, 'Subject must be 200 characters or less'),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be 5,000 characters or less'),
  company: z.string().max(0, 'Spam detected').optional().or(z.literal('')),
})

export type ContactFormValues = z.infer<typeof contactFormSchema>

/** The subset of fields that are actually delivered (honeypot excluded). */
export type ContactSubmission = Pick<ContactFormValues, 'name' | 'email' | 'subject' | 'message'>

export type ContactFieldErrors = Partial<Record<keyof ContactFormValues, string>>
