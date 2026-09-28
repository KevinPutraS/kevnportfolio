'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { FormJumpNav, FormSection, FormStickyActions } from '@/components/ui/form-layout'
import { ImageUploader } from '@/components/admin/image-uploader'
import { experienceTypes } from '@/config/site'
import {
  emptyExperienceForm,
  experienceFieldErrors,
  experienceFormSchema,
} from '@/lib/validation/experience'
import { formatLines, formatList, toMonthInput } from '@/lib/validation/fields'
import type { Experience, ExperienceFieldErrors, ExperienceFormData } from '@/types/experience'

const END_DATE_HINT = 'Required unless this is a current role'
const END_DATE_CURRENT_HINT = 'Unavailable while this role is marked as current'

interface ExperienceFormProps {
  experience?: Experience | null
  returnTo?: string
}

export function ExperienceForm({ experience, returnTo = '/admin/experience' }: ExperienceFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState<ExperienceFormData>(emptyExperienceForm)
  const [errors, setErrors] = useState<ExperienceFieldErrors>({})
  const [message, setMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null)

  useEffect(() => {
    if (!experience) return

    setForm({
      title: experience.title,
      organization: experience.organization,
      location: experience.location ?? '',
      employment_type: experience.employment_type,
      start_date: toMonthInput(experience.start_date),
      end_date: toMonthInput(experience.end_date),
      current: experience.current,
      description: experience.description ?? '',
      responsibilities: formatLines(experience.responsibilities),
      technologies: formatList(experience.technologies),
      organization_logo_url: experience.organization_logo_url ?? '',
      project_url: experience.project_url ?? '',
      sort_order: String(experience.sort_order ?? 0),
      published: experience.published,
    })
  }, [experience])

  function update<K extends keyof ExperienceFormData>(key: K, value: ExperienceFormData[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)
    setErrors({})

    const parsed = experienceFormSchema.safeParse(form)
    if (!parsed.success) {
      setErrors(experienceFieldErrors(parsed.error))
      return
    }

    const isEditing = Boolean(experience)
    const url = isEditing ? `/api/admin/experience/${experience!.id}` : '/api/admin/experience'

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
        setMessage({ tone: 'error', text: fieldError ?? payload.message ?? 'Could not save the entry.' })
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
          { id: 'experience-overview', label: 'Overview' },
          { id: 'experience-details', label: 'What I did' },
          { id: 'experience-context', label: 'Context' },
          { id: 'experience-visibility', label: 'Visibility' },
        ]}
      />

      <FormSection
        id="experience-overview"
        eyebrow="Basics"
        title="Overview"
        description="The role and the dates. Title, organization and start date are what appear in the timeline header, so they are the three worth getting right."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Title"
            required
            value={form.title}
            error={errors.title}
            onChange={(event) => update('title', event.target.value)}
            placeholder="e.g. Technical Contributor"
          />

          <Input
            label="Organization"
            required
            value={form.organization}
            error={errors.organization}
            onChange={(event) => update('organization', event.target.value)}
            placeholder="e.g. University Lab"
          />

          <Input
            label="Location"
            hint="Optional. City, country or Remote."
            value={form.location}
            error={errors.location}
            onChange={(event) => update('location', event.target.value)}
            placeholder="e.g. Remote"
          />

          <Select
            label="Employment type"
            required
            value={form.employment_type}
            error={errors.employment_type}
            options={[...experienceTypes]}
            onChange={(event) =>
              update('employment_type', event.target.value as ExperienceFormData['employment_type'])
            }
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Start date"
            type="month"
            required
            value={form.start_date}
            error={errors.start_date}
            hint="Month and year only."
            onChange={(event) => update('start_date', event.target.value)}
          />

          <Input
            label="End date"
            type="month"
            disabled={form.current}
            value={form.end_date}
            error={errors.end_date}
            hint={form.current ? END_DATE_CURRENT_HINT : END_DATE_HINT}
            onChange={(event) => update('end_date', event.target.value)}
          />
        </div>

        <Checkbox
          label="This is a current role"
          description="Shows “Present” on the timeline and needs no end date."
          checked={form.current}
          onChange={(event) => {
            const next = event.target.checked
            update('current', next)
            // The API rejects a current role that also carries an end date, so
            // clear it here rather than failing on save.
            if (next) update('end_date', '')
          }}
        />
      </FormSection>

      <FormSection
        id="experience-details"
        eyebrow="The work"
        title="What I did"
        description="This is the part a reader actually reads. One bullet per line, and lead each with the outcome rather than the activity."
      >
        <Textarea
          label="Description"
          rows={4}
          hint="Optional. A short summary of what the role focused on."
          value={form.description}
          error={errors.description}
          onChange={(event) => update('description', event.target.value)}
          placeholder="What this role was about, and what you took away from it."
        />

        <Textarea
          label="Responsibilities"
          rows={5}
          hint="One per line. Rendered as bullet points on the timeline."
          value={form.responsibilities}
          error={errors.responsibilities}
          onChange={(event) => update('responsibilities', event.target.value)}
          placeholder={'Designed and shipped internal tooling\nImproved onboarding documentation'}
        />

        <Input
          label="Technologies"
          hint="Comma separated. e.g. TypeScript, Next.js, Supabase"
          value={form.technologies}
          error={errors.technologies}
          onChange={(event) => update('technologies', event.target.value)}
          placeholder="TypeScript, Next.js, Supabase"
        />
      </FormSection>

      <FormSection
        id="experience-context"
        eyebrow="Links &amp; media"
        title="Context"
        description="Everything that helps a reader judge the entry: a link to the work, a logo, and where it sits in the order."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Related link"
            type="url"
            hint="Optional. Must be an http(s) URL."
            value={form.project_url}
            error={errors.project_url}
            onChange={(event) => update('project_url', event.target.value)}
            placeholder="https://example.com"
          />

          <Input
            label="Sort order"
            inputMode="numeric"
            hint="Whole number. Higher values sit earlier on the timeline."
            value={form.sort_order}
            error={errors.sort_order}
            onChange={(event) => update('sort_order', event.target.value)}
          />
        </div>

        <ImageUploader
          label="Organization logo"
          folder="experiences/logos"
          value={form.organization_logo_url}
          onChange={(url) => update('organization_logo_url', url)}
          hint="Optional. Shown beside the organization name."
        />
      </FormSection>

      <FormSection
        id="experience-visibility"
        eyebrow="Publishing"
        title="Visibility"
        description="Drafts stay hidden from the public timeline until this is on."
      >
        <Checkbox
          label="Publish this experience entry"
          description="Turn this on to make it visible on the Experience page."
          checked={form.published}
          onChange={(event) => update('published', event.target.checked)}
        />
      </FormSection>

      <FormStickyActions
        onCancel={() => router.push(returnTo)}
        saveLabel={experience ? 'Save changes' : 'Create entry'}
        isPending={isPending}
      />
    </form>
  )
}
