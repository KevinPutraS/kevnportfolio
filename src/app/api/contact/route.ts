import { NextResponse, type NextRequest } from 'next/server'
import { contactFormSchema } from '@/lib/validation/contact'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import { hasControlCharacters } from '@/lib/utils/validation'

export const dynamic = 'force-dynamic'

/**
 * POST /api/contact
 *
 * Delivery model
 * --------------
 * No third-party mail SDK is bundled, and no mail API key is compiled into the
 * bundle. If `CONTACT_WEBHOOK_URL` is configured the submission is forwarded
 * there server-side. If it is *not* configured the endpoint responds with
 * `delivered: false` and the form tells the visitor to use the email link
 * instead — it never claims a message was sent.
 *
 * Abuse protection
 * ----------------
 * - honeypot field (`company`), validated by the schema
 * - IP-based rate limit
 * - length caps in the schema
 */
export async function POST(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const ip = forwardedFor?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'

  const rate = checkRateLimit(ip, { limit: 3, windowMs: 60_000 })
  if (!rate.allowed) {
    return NextResponse.json(
      { message: 'Too many messages sent. Please wait a minute and try again.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rate.retryAfterMs / 1000)) } }
    )
  }

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
  // never forward the payload.
  if (parsed.data.company) {
    return NextResponse.json({ delivered: true, message: 'Thanks — your message was received.' })
  }

  const { name, email, subject, message } = parsed.data

  // Control characters could be used to forge log lines further down the stack.
  if (hasControlCharacters(`${name}${email}${subject}${message}`)) {
    return NextResponse.json({ message: 'Message contains unsupported characters.' }, { status: 400 })
  }

  const webhook = process.env.CONTACT_WEBHOOK_URL?.trim()

  if (!webhook) {
    /*
     * No delivery channel configured. This is a deliberate, visible state:
     * `delivered: false` makes the client render the email fallback.
     */
    return NextResponse.json(
      {
        delivered: false,
        message: 'The contact form is not connected to an inbox yet. Please email me directly.',
      },
      { status: 202 }
    )
  }

  try {
    const forwarded = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, subject, message, receivedAt: new Date().toISOString() }),
      // Never hang the request on a slow webhook.
      signal: AbortSignal.timeout(8000),
    })

    if (!forwarded.ok) {
      return NextResponse.json(
        { delivered: false, message: 'The message could not be delivered. Please email me directly.' },
        { status: 502 }
      )
    }
  } catch (error) {
    console.error('[contact] delivery failed:', error instanceof Error ? error.message : 'unknown error')
    return NextResponse.json(
      { delivered: false, message: 'The message could not be delivered. Please email me directly.' },
      { status: 502 }
    )
  }

  return NextResponse.json({ delivered: true, message: 'Thanks — your message was received.' })
}
