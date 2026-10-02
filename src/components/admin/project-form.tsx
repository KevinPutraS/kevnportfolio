'use client'

import { useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { FormJumpNav, FormSection, FormStickyActions } from '@/components/ui/form-layout'
import { ImageUploader } from './image-uploader'
import { projectCategories, type ProjectCategory } from '@/config/site'
import { projectStatuses, type ProjectStatus } from '@/config/project-status'
import { classNames } from '@/lib/utils/helpers'
import {
  formatList,
  parseList,
  toMonthInput,
} from '@/lib/validation/fields'
import { generateSlug, projectFormSchema } from '@/lib/validation/project'
import type { Project, ProjectFieldErrors, ProjectFormData } from '@/types/project'

const CATEGORY_OPTIONS = projectCategories.map((category) => ({
  value: category.value,
  label: category.label,
}))

/*
 * The status `<Select>` carries an empty first option, and that is not a
 * placeholder to be styled around — it is the "not stated" state, the same
 * `NULL` the public page treats as "render no badge". Labeling it "Not stated"
 * rather than leaving it blank makes the choice visible instead of looking like
 * a control that failed to load.
 */
const STATUS_OPTIONS = [
  { value: '', label: 'Not stated' },
  ...projectStatuses.map((status) => ({ value: status.value, label: status.label })),
]

const EMPTY_FORM: ProjectFormData = {
  title: '',
  slug: '',
  short_description: '',
  description: '',
  category: 'web',
  technologies: '',
  project_date: '',
  thumbnail_url: '',
  gallery: [],
  project_url: '',
  repository_url: '',
  role: '',
  status: '',
  outcome: '',
  featured: false,
  published: false,
}

function toFormData(project: Project): ProjectFormData {
  return {
    title: project.title,
    slug: project.slug,
    short_description: project.short_description,
    description: project.description ?? '',
    category: project.category,
    technologies: formatList(project.technologies),
    // `project_date` is a Postgres DATE, so trim it back to month precision
    // for the `<input type="month">` control.
    project_date: toMonthInput(project.project_date),
    thumbnail_url: project.thumbnail_url ?? '',
    gallery: project.gallery ?? [],
    project_url: project.project_url ?? '',
    repository_url: project.repository_url ?? '',
    role: project.role ?? '',
    // A row written before the migration has `undefined` here, not `null`, so
    // `?? ''` covers both. The Select's empty option is the "not stated" state.
    status: project.status ?? '',
    outcome: project.outcome ?? '',
    featured: project.featured,
    published: project.published,
  }
}

export function ProjectForm({ project }: { project?: Project }) {
  const router = useRouter()
  const isEditing = Boolean(project)

  const [values, setValues] = useState<ProjectFormData>(
    project ? toFormData(project) : EMPTY_FORM
  )
  const [errors, setErrors] = useState<ProjectFieldErrors>({})
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const slugManuallyEdited = useRef(Boolean(project))

  function update<K extends keyof ProjectFormData>(key: K, value: ProjectFormData[K]) {
    setValues((previous) => {
      const next = { ...previous, [key]: value }
      // Auto-fill the slug from the title until the user edits it directly.
      if (key === 'title' && !slugManuallyEdited.current) {
        next.slug = generateSlug(String(value))
      }
      return next
    })
    setErrors((previous) => (previous[key] ? { ...previous, [key]: undefined } : previous))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')

    const parsed = projectFormSchema.safeParse(values)
    if (!parsed.success) {
      const fieldErrors: ProjectFieldErrors = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof ProjectFormData
        if (!fieldErrors[field]) fieldErrors[field] = issue.message
      }
      setErrors(fieldErrors)
      setFormError('Please fix the highlighted fields.')
      // Move focus to the first invalid control.
      const firstField = Object.keys(fieldErrors)[0]
      document.getElementById(`project-${firstField}`)?.focus()
      return
    }

    setErrors({})
    setIsSaving(true)

    try {
      const response = await fetch(
        isEditing ? `/api/admin/projects/${project!.id}` : '/api/admin/projects',
        {
          method: isEditing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          // `technologies` is sent as the comma-separated string the schema
          // expects; the API converts it to text[] for the database.
          body: JSON.stringify(values),
        }
      )

      if (response.status === 401) {
        setFormError('Your session expired. Sign in again and save the project.')
        setIsSaving(false)
        return
      }

      const payload = (await response.json().catch(() => ({}))) as {
        message?: string
        errors?: ProjectFieldErrors
      }

      if (!response.ok) {
        if (payload.errors) setErrors(payload.errors)
        setFormError(payload.message ?? 'Could not save the project.')
        setIsSaving(false)
        return
      }

      router.push('/admin/projects')
      router.refresh()
    } catch {
      setFormError('Could not reach the server. Check your connection and try again.')
      setIsSaving(false)
    }
  }

  const technologyList = parseList(values.technologies)

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {formError && (
        <div
          role="alert"
          className="border border-[rgb(var(--error)/0.4)] bg-[rgb(var(--error)/0.05)] p-4"
        >
          <p className="text-sm text-[rgb(var(--error))]">{formError}</p>
        </div>
      )}

      <FormJumpNav
        items={[
          { id: 'project-details', label: 'Details' },
          { id: 'project-role', label: 'Role & outcome' },
          { id: 'project-technologies', label: 'Technologies' },
          { id: 'project-images', label: 'Images' },
          { id: 'project-links', label: 'Links' },
          { id: 'project-visibility', label: 'Visibility' },
        ]}
      />

      <FormSection
        id="project-details"
        eyebrow="The project"
        title="Details"
        description="What it is, what kind of project it is, and the one-line summary that appears on the card. The slug becomes the page URL, so it is generated from the title until you edit it yourself."
      >
        <Input
          id="project-title"
          label="Title"
          value={values.title}
          onChange={(event) => update('title', event.target.value)}
          error={errors.title}
          maxLength={100}
          required
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            id="project-slug"
            label="Slug"
            value={values.slug}
            onChange={(event) => {
              slugManuallyEdited.current = true
              update('slug', generateSlug(event.target.value))
            }}
            error={errors.slug}
            hint="Lowercase letters, numbers and hyphens."
            maxLength={100}
            required
          />

          <Select
            id="project-category"
            label="Category"
            value={values.category}
            onChange={(event) => update('category', event.target.value as ProjectCategory)}
            error={errors.category}
            options={CATEGORY_OPTIONS}
            required
          />
        </div>

        <Input
          id="project-project_date"
          label="Project date"
          type="month"
          value={values.project_date}
          onChange={(event) => update('project_date', event.target.value)}
          error={errors.project_date}
          hint="Month only, for example 2024-03."
        />

        <Textarea
          id="project-short_description"
          label="Short description"
          value={values.short_description}
          onChange={(event) => update('short_description', event.target.value)}
          error={errors.short_description}
          hint="One or two sentences. Shown on project cards and in search results."
          rows={3}
          maxLength={300}
          required
        />

        <Textarea
          id="project-description"
          label="Description"
          value={values.description}
          onChange={(event) => update('description', event.target.value)}
          error={errors.description}
          hint="Longer case-study text. Leave blank to hide the overview section."
          rows={10}
          maxLength={10000}
        />
      </FormSection>

      {/*
        A section of its own rather than three more fields inside "Details".

        These three answer a different question from the rest of the form. Title,
        category and date describe what the project *is*; role, status and
        outcome describe what happened. That is the difference between a
        catalogue entry and a case study, and it is the part a project page
        cannot invent for itself — which is exactly why it gets its own heading
        in the editor too, so it does not read as optional metadata.
      */}
      <FormSection
        id="project-role"
        eyebrow="The work"
        title="Role, status and outcome"
        description="How you were involved, how far it got, and what came of it. All three are optional and the public page hides whatever is left blank — but a project with all three set is a case study, and one without is a listing."
      >
        <Input
          id="project-role"
          label="Your role"
          value={values.role}
          onChange={(event) => update('role', event.target.value)}
          error={errors.role}
          hint="What you actually did. Shown beside the project on the public page — for example: built the front end alone, or owned the API."
          maxLength={200}
        />

        <Select
          id="project-status"
          label="Status"
          value={values.status}
          onChange={(event) => update('status', event.target.value as ProjectStatus | '')}
          error={errors.status}
          options={STATUS_OPTIONS}
          hint="Shown as a badge next to the category. Leave it unstated and no badge appears."
        />

        <Textarea
          id="project-outcome"
          label="Outcome"
          value={values.outcome}
          onChange={(event) => update('outcome', event.target.value)}
          error={errors.outcome}
          hint="A result, a lesson, a number — one short paragraph. Deliberately capped: this is the closing statement, and anything longer belongs in the description above."
          rows={4}
          maxLength={600}
        />
      </FormSection>

      <FormSection
        id="project-technologies"
        eyebrow="Stack"
        title="Technologies"
        description="What it is built with. Rendered as tags on the project page, so short and recognisable beats complete."
      >
        <Input
          id="project-technologies"
          label="Technologies"
          value={values.technologies}
          onChange={(event) => update('technologies', event.target.value)}
          error={errors.technologies}
          hint="Comma separated, for example: Next.js, TypeScript, PostgreSQL"
          maxLength={500}
        />

        {technologyList.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {technologyList.map((technology) => (
<li
                  key={technology}
                  className="inline-flex items-center gap-0.5 rounded-[var(--radius-full)] border border-[rgb(var(--border))] bg-[rgb(var(--bg-highlight))] py-0.5 pl-3 pr-0.5 font-mono text-[length:var(--text-xs)] text-[rgb(var(--text-dim))] sm:py-1 sm:pr-1"
                >
                {technology}
                {/*
                  The chip's own height is the target, not just the glyph. A 16px
                  `X` in a 24px pill is unclickable on a phone, and this is the
                  one control in the form a thumb has to aim at.

                  So the button is 40px below `sm` — the same two-tier size as
                  `RowAction`, for the same reason: 44px in a chip would make the
                  pill taller than the text it is wrapped around, and the desktop
                  figure can stay tight because a mouse does not have a thumb.
                */}
                <button
                  type="button"
                  onClick={() =>
                    update(
                      'technologies',
                      parseList(values.technologies)
                        .filter((item) => item !== technology)
                        .join(', ')
                    )
                  }
                  aria-label={`Remove ${technology}`}
                  className="-mr-1.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[rgb(var(--text-muted))] transition-colors hover:bg-[rgb(var(--error)/0.14)] hover:text-[rgb(var(--error))] sm:-mr-0.5 sm:h-8 sm:w-8"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </FormSection>

      <FormSection
        id="project-images"
        eyebrow="Media"
        title="Images"
        description="The thumbnail is what appears on every card, so it is the only image that is effectively required. Gallery images are optional and the gallery is hidden when empty."
      >
        <ImageUploader
          id="project-thumbnail_url"
          label="Thumbnail"
          folder="projects/thumbnails"
          value={values.thumbnail_url}
          onChange={(url) => update('thumbnail_url', url)}
          error={errors.thumbnail_url}
          hint="Shown on project cards. Recommended 1600×900."
        />

        <div>
          <span className="label">Gallery images</span>
          <GalleryManager
            images={values.gallery}
            onChange={(gallery) => update('gallery', gallery)}
            error={errors.gallery}
          />
        </div>
      </FormSection>

      <FormSection
        id="project-links"
        eyebrow="Outbound"
        title="Links"
        description="Both are optional, and each button is hidden from the public page when its field is empty, so there is no downside to leaving one blank."
      >
        <Input
          id="project-project_url"
          label="Live project URL"
          type="url"
          inputMode="url"
          value={values.project_url}
          onChange={(event) => update('project_url', event.target.value)}
          error={errors.project_url}
          hint="Optional. The button is hidden when this is empty."
          placeholder="https://example.com"
        />

        <Input
          id="project-repository_url"
          label="Repository URL"
          type="url"
          inputMode="url"
          value={values.repository_url}
          onChange={(event) => update('repository_url', event.target.value)}
          error={errors.repository_url}
          hint="Optional. The button is hidden when this is empty."
          placeholder="https://github.com/you/project"
        />
      </FormSection>

      <FormSection
        id="project-visibility"
        eyebrow="Publishing"
        title="Visibility"
        description="Publishing controls whether the project appears on the public site at all. Featuring is a separate, narrower switch: it decides which projects the homepage leads with."
      >
        <Checkbox
          id="project-published"
          label="Published"
          description="Only published projects are visible on the public site."
          checked={values.published}
          onChange={(event) => update('published', event.target.checked)}
        />
        <Checkbox
          id="project-featured"
          label="Featured"
          description="Featured projects appear on the homepage."
          checked={values.featured}
          onChange={(event) => update('featured', event.target.checked)}
        />
      </FormSection>

      <FormStickyActions
        onCancel={() => router.back()}
        saveLabel={isEditing ? 'Save changes' : 'Create project'}
        isPending={isSaving}
      />
    </form>
  )
}

/** Reorderable, removable list of gallery images. */
function GalleryManager({
  images,
  onChange,
  error,
}: {
  images: string[]
  onChange: (images: string[]) => void
  error?: string
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploadError(null)
    setIsUploading(true)

    const uploaded: string[] = []
    try {
      for (const file of Array.from(files)) {
        const body = new FormData()
        body.append('file', file)
        body.append('folder', 'projects/gallery')

        const response = await fetch('/api/upload', { method: 'POST', body })
        const payload = (await response.json().catch(() => ({}))) as { url?: string; message?: string }

        if (!response.ok || !payload.url) {
          throw new Error(payload.message ?? `Failed to upload ${file.name}.`)
        }
        uploaded.push(payload.url)
      }
      onChange([...images, ...uploaded].slice(0, 12))
    } catch (uploadFailure) {
      setUploadError(
        uploadFailure instanceof Error ? uploadFailure.message : 'Upload failed. Please try again.'
      )
      // Keep whatever did upload rather than discarding it.
      if (uploaded.length > 0) onChange([...images, ...uploaded].slice(0, 12))
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="sr-only"
        onChange={(event) => {
          void handleFiles(event.target.files)
          event.target.value = ''
        }}
        aria-describedby={error || uploadError ? 'gallery-error' : undefined}
      />

      <Button
        type="button"
        variant="secondary"
        size="sm"
        loading={isUploading}
        onClick={() => inputRef.current?.click()}
        className={classNames(images.length >= 12 && 'pointer-events-none opacity-50')}
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        {images.length >= 12 ? 'Gallery is full' : 'Add gallery images'}
      </Button>

      <p className="text-xs text-[rgb(var(--text-muted))]">
        {images.length} of 12 used. The gallery section is hidden entirely when empty.
      </p>

      {images.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <li
              key={`${image}-${index}`}
              className="relative aspect-[16/9] overflow-hidden rounded-[var(--radius-lg)] border border-[rgb(var(--border))]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" className="h-full w-full object-cover" />
              {/*
                40px rather than the 28px a thumbnail-scale target would want:
                this is the *only* way to remove a gallery image, and it sits on
                top of another control, so it has to be findable by thumb rather
                than by pointer. The position is nudged inward on a phone so the
                target is not flush against the tile edge.
              */}
              <button
                type="button"
                onClick={() => onChange(images.filter((_, position) => position !== index))}
                aria-label={`Remove gallery image ${index + 1}`}
                className="absolute right-1.5 top-1.5 inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[rgb(var(--border-strong))] bg-[rgb(var(--bg)/0.85)] text-[rgb(var(--text))] backdrop-blur transition-colors hover:border-[rgb(var(--error))] hover:text-[rgb(var(--error))]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {(error || uploadError) && (
        <p id="gallery-error" className="field-error" role="alert">
          {error ?? uploadError}
        </p>
      )}
    </div>
  )
}
