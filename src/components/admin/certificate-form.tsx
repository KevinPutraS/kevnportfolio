'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { ImageUploader } from '@/components/admin/image-uploader'
import {
  certificateFieldErrors,
  certificateFormSchema,
  emptyCertificateForm,
} from '@/lib/validation/certificate'
import { formatList, toMonthInput } from '@/lib/validation/fields'
import type { Certificate, CertificateFieldErrors, CertificateFormData } from '@/types/certificate'

interface CertificateFormProps {
  certificate?: Certificate | null
  returnTo?: string
}

export function CertificateForm({ certificate, returnTo = '/admin/certificates' }: CertificateFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState<CertificateFormData>(emptyCertificateForm)
  const [errors, setErrors] = useState<CertificateFieldErrors>({})
  const [message, setMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null)

  useEffect(() => {
    if (!certificate) return

    setForm({
      title: certificate.title,
      issuer: certificate.issuer,
      issue_date: toMonthInput(certificate.issue_date),
      expiration_date: toMonthInput(certificate.expiration_date),
      credential_id: certificate.credential_id ?? '',
      credential_url: certificate.credential_url ?? '',
      certificate_image_url: certificate.certificate_image_url ?? '',
      description: certificate.description ?? '',
      skills: formatList(certificate.skills),
      sort_order: String(certificate.sort_order ?? 0),
      published: certificate.published,
    })
  }, [certificate])

  function update<K extends keyof CertificateFormData>(key: K, value: CertificateFormData[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)
    setErrors({})

    const parsed = certificateFormSchema.safeParse(form)
    if (!parsed.success) {
      setErrors(certificateFieldErrors(parsed.error))
      return
    }

    const isEditing = Boolean(certificate)
    const url = isEditing ? `/api/admin/certificates/${certificate!.id}` : '/api/admin/certificates'

    try {
      const response = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const payload = (await response.json().catch(() => ({}))) as {
        message?: string
        errors?: Record<string, string>
      }

      if (response.status === 401) {
        setMessage({ tone: 'error', text: 'Your session expired. Sign in again.' })
        return
      }

      if (!response.ok) {
        const fieldError = payload.errors ? Object.values(payload.errors)[0] : undefined
        setMessage({ tone: 'error', text: fieldError ?? payload.message ?? 'Could not save the certificate.' })
        return
      }

      startTransition(() => router.push(returnTo))
    } catch {
      setMessage({ tone: 'error', text: 'Could not reach the server. Please try again.' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-10">
      {message ? (
        <p
          role="status"
          aria-live="polite"
          className={`border p-3 text-sm ${
            message.tone === 'error'
              ? 'border-[rgb(var(--error))]/40 bg-[rgb(var(--error))]/5'
              : 'border-[rgb(var(--success))]/40 bg-[rgb(var(--success))]/5'
          }`}
        >
          {message.text}
        </p>
      ) : null}

      <section className="space-y-6">
        <div>
          <p className="eyebrow">Basics</p>
          <h2 className="heading-3 mt-3">Overview</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Input
            label="Title"
            required
            value={form.title}
            error={errors.title}
            onChange={(event) => update('title', event.target.value)}
            placeholder="e.g. Foundations of Networking"
          />

          <Input
            label="Issuer"
            required
            value={form.issuer}
            error={errors.issuer}
            onChange={(event) => update('issuer', event.target.value)}
            placeholder="e.g. Course provider"
          />

          <Input
            label="Issue date"
            type="month"
            required
            value={form.issue_date}
            error={errors.issue_date}
            hint="Month and year only."
            onChange={(event) => update('issue_date', event.target.value)}
          />

          <Input
            label="Expiry date"
            type="month"
            hint="Leave blank if it does not expire."
            value={form.expiration_date}
            error={errors.expiration_date}
            onChange={(event) => update('expiration_date', event.target.value)}
          />

          <Input
            label="Credential ID"
            hint="Optional. The reference printed on the certificate."
            value={form.credential_id}
            error={errors.credential_id}
            onChange={(event) => update('credential_id', event.target.value)}
            placeholder="e.g. ABC123456"
          />

          <Input
            label="Credential URL"
            type="url"
            hint="Optional. Must be an http(s) URL."
            value={form.credential_url}
            error={errors.credential_url}
            onChange={(event) => update('credential_url', event.target.value)}
            placeholder="https://example.com/verify"
          />
        </div>

        <Textarea
          label="Description"
          rows={4}
          hint="Optional. What it covered, or what you took from it."
          value={form.description}
          error={errors.description}
          onChange={(event) => update('description', event.target.value)}
          placeholder="A short note about the subject and why it mattered."
        />

        <Input
          label="Skills"
          hint="Comma separated. e.g. Networking, TCP/IP, Security"
          value={form.skills}
          error={errors.skills}
          onChange={(event) => update('skills', event.target.value)}
          placeholder="Networking, TCP/IP, Security"
        />
      </section>

      <section className="space-y-6">
        <div>
          <p className="eyebrow">Media &amp; ordering</p>
          <h2 className="heading-3 mt-3">Appearance</h2>
        </div>

        <ImageUploader
          label="Certificate image"
          folder="certificates/images"
          value={form.certificate_image_url}
          onChange={(url) => update('certificate_image_url', url)}
          hint="Optional. Clickable to open a larger preview on the public page."
        />

        <Input
          label="Sort order"
          inputMode="numeric"
          hint="Whole number. Higher values sit earlier in the list."
          value={form.sort_order}
          error={errors.sort_order}
          onChange={(event) => update('sort_order', event.target.value)}
        />
      </section>

      <section className="space-y-4">
        <Checkbox
          label="Publish this certificate"
          description="Drafts stay private until you switch this on."
          checked={form.published}
          onChange={(event) => update('published', event.target.checked)}
        />
      </section>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.push(returnTo)} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" loading={isPending}>
          {certificate ? 'Save changes' : 'Create certificate'}
        </Button>
      </div>
    </form>
  )
}
