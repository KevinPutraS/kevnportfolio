'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { FormJumpNav, FormSection, FormStickyActions } from '@/components/ui/form-layout'
import { useUnsavedChanges } from '@/lib/hooks/use-unsaved-changes'
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

/**
 * The row as the form holds it.
 *
 * Extracted so the unsaved-changes guard can compare against the same mapping the
 * effect below applies. Reading it off the prop rather than off the state is what
 * lets the guard be correct from the first render — the state is still the empty
 * form until that effect runs.
 */
function toFormData(certificate: Certificate): CertificateFormData {
  return {
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
  }
}

export function CertificateForm({ certificate, returnTo = '/admin/certificates' }: CertificateFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState<CertificateFormData>(emptyCertificateForm)
  const [errors, setErrors] = useState<CertificateFieldErrors>({})
  const [message, setMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null)

  const isDirty = useUnsavedChanges(form, certificate ? toFormData(certificate) : null)

  useEffect(() => {
    if (!certificate) return

    setForm(toFormData(certificate))
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {message ? (
        <p
          role="status"
          aria-live="polite"
          className={
            message.tone === 'error'
              ? 'border border-[rgb(var(--error)/0.4)] bg-[rgb(var(--error)/0.05)] p-3 text-sm text-[rgb(var(--error))]'
              : 'border border-[rgb(var(--success)/0.4)] bg-[rgb(var(--success)/0.05)] p-3 text-sm text-[rgb(var(--success))]'
          }
        >
          {message.text}
        </p>
      ) : null}

      <FormJumpNav
        items={[
          { id: 'certificate-overview', label: 'Overview' },
          { id: 'certificate-appearance', label: 'Appearance' },
          { id: 'certificate-visibility', label: 'Visibility' },
        ]}
      />

      <FormSection
        id="certificate-overview"
        eyebrow="Basics"
        title="Overview"
        description="What the certificate is, who issued it, and when. The title and issuer are the only two fields a visitor sees in the list."
      >
        <div className="grid gap-5 sm:grid-cols-2">
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

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Skills"
            hint="Comma separated. e.g. Networking, TCP/IP, Security"
            value={form.skills}
            error={errors.skills}
            onChange={(event) => update('skills', event.target.value)}
            placeholder="Networking, TCP/IP, Security"
          />

          <Input
            label="Sort order"
            inputMode="numeric"
            hint="Whole number. Higher values sit earlier in the list."
            value={form.sort_order}
            error={errors.sort_order}
            onChange={(event) => update('sort_order', event.target.value)}
          />
        </div>
      </FormSection>

      <FormSection
        id="certificate-appearance"
        eyebrow="Proof &amp; reference"
        title="Appearance"
        description="The image and the link that prove the credential is real. All of it is optional, but an entry with an image and a credential ID reads very differently from a bare title."
      >
        <ImageUploader
          label="Certificate image"
          folder="certificates/images"
          value={form.certificate_image_url}
          onChange={(url) => update('certificate_image_url', url)}
          hint="Optional. Clickable to open a larger preview on the public page."
        />

        <div className="grid gap-5 sm:grid-cols-2">
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
      </FormSection>

      <FormSection
        id="certificate-visibility"
        eyebrow="Publishing"
        title="Visibility"
        description="Drafts stay hidden from the public pages until this is on."
      >
        <Checkbox
          label="Publish this certificate"
          description="Turn this on to make it visible on the Certificates page."
          checked={form.published}
          onChange={(event) => update('published', event.target.checked)}
        />
      </FormSection>

      <FormStickyActions
        onCancel={() => router.push(returnTo)}
        saveLabel={certificate ? 'Save changes' : 'Create certificate'}
        status={isDirty ? 'Unsaved changes' : ''}
        isPending={isPending}
      />
    </form>
  )
}
