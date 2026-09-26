'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  contactFormSchema,
  type ContactFieldErrors,
  type ContactFormValues,
} from '@/lib/validation/contact'
import { siteConfig } from '@/config/site'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const EMPTY: ContactFormValues = {
  name: '',
  email: '',
  subject: '',
  message: '',
  company: '',
}

export function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>(EMPTY)
  const [errors, setErrors] = useState<ContactFieldErrors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [feedback, setFeedback] = useState('')

  function update<K extends keyof ContactFormValues>(key: K, value: ContactFormValues[K]) {
    setValues((previous) => ({ ...previous, [key]: value }))
    // Clear the field error as soon as the user edits that field.
    setErrors((previous) => (previous[key] ? { ...previous, [key]: undefined } : previous))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('submitting')
    setFeedback('')

    const parsed = contactFormSchema.safeParse(values)
    if (!parsed.success) {
      const fieldErrors: ContactFieldErrors = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof ContactFormValues
        if (!fieldErrors[field]) fieldErrors[field] = issue.message
      }
      setErrors(fieldErrors)
      setStatus('error')
      setFeedback('Please fix the highlighted fields and try again.')
      return
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })

      const payload = (await response.json().catch(() => ({}))) as {
        message?: string
        delivered?: boolean
        errors?: Record<string, string>
      }

      if (response.ok && payload.delivered) {
        setStatus('success')
        setValues(EMPTY)
        return
      }

      if (payload.errors) {
        setErrors(payload.errors as ContactFieldErrors)
      }
      setStatus('error')
      // The API states plainly when no delivery channel is configured, and the
      // message is surfaced verbatim rather than pretending it was sent.
      setFeedback(payload.message ?? 'Something went wrong. Please try again.')
    } catch {
      setStatus('error')
      setFeedback('Could not reach the server. Please email me directly instead.')
    }
  }

  if (status === 'success') {
    return (
      <div
        role="status"
        className="border-t-2 border-t-[rgb(var(--success))] bg-[rgb(var(--surface))] p-8"
      >
        <p className="eyebrow text-[rgb(var(--success))]">Sent</p>
        <p className="heading-3 mt-4">Message received</p>
        <p className="mt-3 max-w-md text-pretty text-[rgb(var(--text-secondary))]">
          Thanks for reaching out — I&apos;ll get back to you as soon as I can.
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus('idle')
            setFeedback('')
          }}
          className="link-underline mt-8 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[rgb(var(--text-secondary))]"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card p-6 sm:p-8">
      <div className="space-y-5">
        <Input
          label="Name"
          name="name"
          value={values.name}
          onChange={(event) => update('name', event.target.value)}
          error={errors.name}
          autoComplete="name"
          maxLength={100}
          required
        />

        <Input
          label="Email"
          name="email"
          type="email"
          value={values.email}
          onChange={(event) => update('email', event.target.value)}
          error={errors.email}
          hint="Only used to reply to you."
          autoComplete="email"
          maxLength={254}
          required
        />

        <Input
          label="Subject"
          name="subject"
          value={values.subject}
          onChange={(event) => update('subject', event.target.value)}
          error={errors.subject}
          maxLength={200}
          required
        />

        <Textarea
          label="Message"
          name="message"
          value={values.message}
          onChange={(event) => update('message', event.target.value)}
          error={errors.message}
          hint={`${values.message.trim().length} / 5000 characters`}
          maxLength={5000}
          required
        />

        {/*
          Honeypot. Hidden from humans and from screen readers, but bots fill in
          every input they find. Validated server-side.
        */}
        <div className="absolute left-[-9999px] top-0 h-px w-px overflow-hidden" aria-hidden="true">
          <label htmlFor="company">Company</label>
          <input
            id="company"
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={values.company}
            onChange={(event) => update('company', event.target.value)}
          />
        </div>
      </div>

      {/* Announced to assistive tech on failure. */}
      <p role="alert" aria-live="assertive" className={feedback ? 'field-error mt-5' : 'sr-only'}>
        {feedback}
      </p>

      <div className="mt-8 flex flex-col gap-4 border-t border-[rgb(var(--border-subtle))] pt-8 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" size="lg" loading={status === 'submitting'} className="w-full sm:w-auto">
          {status === 'submitting' ? 'Sending…' : 'Send message'}
        </Button>
        <p className="text-sm text-[rgb(var(--text-muted))]">
          Or email{' '}
          <a href={siteConfig.contactEmail} className="link break-all">
            {siteConfig.email}
          </a>
        </p>
      </div>
    </form>
  )
}
