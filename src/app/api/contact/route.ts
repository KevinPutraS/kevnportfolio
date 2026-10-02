import { NextResponse, type NextRequest } from 'next/server'
import { contactFormSchema, type ContactSubmission } from '@/lib/validation/contact'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import { hasControlCharacters } from '@/lib/utils/validation'
import { createPublicClient } from '@/lib/supabase/public'

export const dynamic = 'force-dynamic'

/**
 * POST /api/contact
 *
 * Delivery model
 * --------------
 * Two independent channels, in this order:
 *
 *  1. The CMS inbox. The submission is stored in `public.contact_messages`, so
 *     the form works on a bare deploy with no third-party credentials at all.
 *  2. `CONTACT_WEBHOOK_URL`, if set, still gets the payload. It is a bonus copy,
 *     not the system of record.
 *
 * The store is attempted first and never allowed to fail the request. A visitor
 * who gets an error page has no way to know whether the message was saved, and
 * will send it again; storing before delivering means the worst case is a
 * duplicate row, not a lost message. The mirror of that rule is why a webhook
 * failure does *not* produce a 502 once the row exists — the visitor is told it
 * arrived, because it did.
 *
 * Abuse protection
 * ----------------
 * - honeypot field (`company`), validated by the schema
 * - IP-based rate limit
 * - length caps in the schema, mirrored as CHECK constraints on the table
 *
 * The order of those checks is the point, not an accident. The limiter runs
 * *after* parsing and validation, so it counts real submissions: checked first,
 * three mistyped email addresses locked a visitor out of the form for a minute
 * having sent nothing, which is a way to lose a message that the form was built
 * to catch. A request that fails to parse or validate never reaches a delivery
 * channel, so it has nothing to rate-limit either.
 *
 * Known trade-off: the anonymous role holds an INSERT grant on the table, so a
 * determined bot could post to PostgREST directly and skip the honeypot, the
 * rate limit and the control-character check. That is the price of not running
 * a service-role key (see README "Security"). The table is write-only for the
 * public — no SELECT, UPDATE or DELETE — and every column is length-capped in
 * the database, so the worst a direct write can do is fill an unread inbox.
 */

/**
 * Stores a submission through the anonymous client.
 *
 * Returns `false` when Supabase is unconfigured or the write failed, which is
 * the signal to fall back to the webhook. Errors are logged rather than thrown
 * for the reason in the delivery model above.
 *
 * `CONTACT_INBOX_DISABLED=1` returns `false` without attempting a write. It
 * exists because the Playwright suite posts to this endpoint against the
 * developer's real Supabase project, and a test run has no business filling a
 * live inbox with "Ada Lovelace". The switch is deliberately one-directional —
 * it can only make the route store *less*, never more, so the worst a stray
 * value does is quietly return the endpoint to the webhook-only behaviour it
 * had before this table existed.
 */
async function storeSubmission(submission: ContactSubmission): Promise<boolean> {
  if (process.env.CONTACT_INBOX_DISABLED === '1') return false

  const supabase = createPublicClient()
  if (!supabase) return false

  try {
    const { error } = await supabase.from('contact_messages').insert(submission)
    if (error) {
      console.error('[contact] could not store the message:', error.message)
      return false
    }
    return true
  } catch (error) {
    console.error('[contact] store threw:', error instanceof Error ? error.message : 'unknown error')
    return false
  }
}

/** Forwards to the webhook. Never throws; `false` covers both failure modes. */
async function deliverToWebhook(webhook: string, submission: ContactSubmission): Promise<boolean> {
  try {
    const forwarded = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...submission, receivedAt: new Date().toISOString() }),
      // Never hang the request on a slow webhook.
      signal: AbortSignal.timeout(8000),
    })

    if (!forwarded.ok) {
      console.error(`[contact] webhook responded ${forwarded.status}`)
      return false
    }
    return true
  } catch (error) {
    console.error('[contact] delivery failed:', error instanceof Error ? error.message : 'unknown error')
    return false
  }
}

const DELIVERED = { delivered: true, message: 'Thanks — your message was received.' }
const NOT_DELIVERED = 'The message could not be delivered. Please email me directly.'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Request body must be valid JSON.' }, { status: 400 })
  }

  const parsed = contactFormSchema.safeParse(body)
  if (!parsed.success) {
    const { fieldErrors } = parsed.error.flatten()
    const errors = Object.fromEntries(
      Object.entries(fieldErrors).map(([field, messages]) => [field, messages[0]])
    )
    return NextResponse.json(
      { message: 'Please fix the highlighted fields.', errors },
      { status: 400 }
    )
  }

  // Honeypot tripped. Respond as if accepted so the bot learns nothing, but
  // never store or forward the payload. Returning before the limiter is also
  // what makes it free for a scraper to hit this branch.
  if (parsed.data.company) {
    return NextResponse.json(DELIVERED)
  }

  const submission: ContactSubmission = {
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject,
    message: parsed.data.message,
  }

  // Control characters could be used to forge log lines further down the stack.
  if (hasControlCharacters(`${submission.name}${submission.email}${submission.subject}${submission.message}`)) {
    return NextResponse.json({ message: 'Message contains unsupported characters.' }, { status: 400 })
  }

  /*
   * Rate limit last, once the request is known to be a real submission. Anything
   * rejected above is not a message, and spending a visitor's budget on a typo
   * would be the form rejecting the enquiry it exists to catch.
   */
  const forwardedFor = request.headers.get('x-forwarded-for')
  const ip = forwardedFor?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'

  const rate = checkRateLimit(ip, { limit: 3, windowMs: 60_000 })
  if (!rate.allowed) {
    return NextResponse.json(
      { message: 'Too many messages sent. Please wait a minute and try again.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rate.retryAfterMs / 1000)) } }
    )
  }

  const stored = await storeSubmission(submission)
  const webhook = process.env.CONTACT_WEBHOOK_URL?.trim()

  if (webhook) {
    const delivered = await deliverToWebhook(webhook, submission)

    if (!delivered && !stored) {
      return NextResponse.json({ delivered: false, message: NOT_DELIVERED }, { status: 502 })
    }
  } else if (!stored) {
    /*
     * No channel at all: not configured for storage either. This is a
     * deliberate, visible state — `delivered: false` makes the client render
     * the email fallback instead of pretending a message was kept.
     */
    return NextResponse.json(
      {
        delivered: false,
        message: 'The contact form is not connected to an inbox yet. Please email me directly.',
      },
      { status: 202 }
    )
  }

  return NextResponse.json(DELIVERED)
}