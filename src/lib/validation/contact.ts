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
  /*
   * The 254 cap is RFC 5321's maximum path length, and it is here rather than
   * only on the table because `contact_messages.email` has a CHECK constraint to
   * match. Without it a long-but-regexplausible address passed the form, failed
   * the insert, and surfaced as a delivery failure — the visitor told to email
   * directly because of a length the form never asked about.
   */
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .max(254, 'Email must be 254 characters or less')
    .email('Enter a valid email address'),
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
  /*
   * The honeypot accepts a filled field on purpose.
   *
   * This used to be `z.string().max(0, 'Spam detected')`, which made a tripped
   * honeypot a *validation error*: the route answered 400 with
   * `errors.company: "Spam detected"`. That is the exact opposite of what the
   * route's own comment promised — "respond as if accepted so the bot learns
   * nothing" — and it handed a scraper a labelled error naming the one field it
   * had to leave blank.
   *
   * The route now recognises a filled field and returns a plain success with
   * nothing stored or forwarded, which is what a honeypot is for. The length cap
   * stays so the field still cannot be used to push an arbitrarily large body.
   */
  company: z.string().max(200).optional(),
})

export type ContactFormValues = z.infer<typeof contactFormSchema>

/** The subset of fields that are actually delivered (honeypot excluded). */
export type ContactSubmission = Pick<ContactFormValues, 'name' | 'email' | 'subject' | 'message'>

export type ContactFieldErrors = Partial<Record<keyof ContactFormValues, string>>
