'use client'

import { useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ImageUploader } from './image-uploader'
import { projectCategories, type ProjectCategory } from '@/config/site'
import { classNames } from '@/lib/utils/helpers'
import {
  formatTechnologies,
  generateSlug,
  parseTechnologies,
  projectFormSchema,
} from '@/lib/validation/project'
import type { Project, ProjectFieldErrors, ProjectFormData } from '@/types/project'

const CATEGORY_OPTIONS = projectCategories.map((category) => ({
  value: category.value,
  label: category.label,
}))

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
    technologies: formatTechnologies(project.technologies),
    // `project_date` is a Postgres DATE, so trim it back to month precision
    // for the `<input type="month">` control.
    project_date: project.project_date ? project.project_date.slice(0, 7) : '',
    thumbnail_url: project.thumbnail_url ?? '',
    gallery: project.gallery ?? [],
    project_url: project.project_url ?? '',
    repository_url: project.repository_url ?? '',
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

  const technologyList = parseTechnologies(values.technologies)

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      {formError && (
        <div role="alert" className="border border-[rgb(var(--error))]/40 bg-[rgb(var(--error))]/5 p-4">
          <p className="text-sm text-[rgb(var(--text-primary))]">{formError}</p>
        </div>
      )}

      {/* ---- Details ----------------------------------------------------- */}
      <fieldset className="space-y-6">
        <legend className="heading-4">Details</legend>

        <Input
          id="project-title"
          label="Title"
          value={values.title}
          onChange={(event) => update('title', event.target.value)}
          error={errors.title}
          maxLength={100}
          required
        />

        <Input
          id="project-slug"
          label="Slug"
          value={values.slug}
          onChange={(event) => {
            slugManuallyEdited.current = true
            update('slug', generateSlug(event.target.value))
          }}
          error={errors.slug}
          hint="Lowercase letters, numbers and hyphens. Used in the page URL."
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
      </fieldset>

      {/* ---- Technologies ------------------------------------------------ */}
      <fieldset className="space-y-4">
        <legend className="heading-4">Technologies</legend>
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
                className="inline-flex items-center gap-1.5 border border-[rgb(var(--border-subtle))] px-2.5 py-1 font-mono text-xs text-[rgb(var(--text-secondary))]"
              >
                {technology}
                <button
                  type="button"
                  onClick={() =>
                    update(
                      'technologies',
                      parseTechnologies(values.technologies)
                        .filter((item) => item !== technology)
                        .join(', ')
                    )
                  }
                  aria-label={`Remove ${technology}`}
                  className="text-[rgb(var(--text-muted))] transition-colors hover:text-[rgb(var(--error))]"
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      {/* ---- Images ------------------------------------------------------ */}
      <fieldset className="space-y-8">
        <legend className="heading-4">Images</legend>

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
      </fieldset>

      {/* ---- Links ------------------------------------------------------- */}
      <fieldset className="space-y-6">
        <legend className="heading-4">Links</legend>

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
      </fieldset>

      {/* ---- Visibility -------------------------------------------------- */}
      <fieldset className="space-y-4">
        <legend className="heading-4">Visibility</legend>
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
      </fieldset>

      {/* ---- Actions ----------------------------------------------------- */}
      <div className="flex flex-col gap-3 border-t border-[rgb(var(--border-subtle))] pt-6 sm:flex-row sm:items-center sm:justify-end">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" loading={isSaving} className="w-full sm:w-auto">
          {isEditing ? 'Save changes' : 'Create project'}
        </Button>
      </div>
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
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <li key={`${image}-${index}`} className="relative aspect-[16/9] overflow-hidden border border-[rgb(var(--border-subtle))]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange(images.filter((_, position) => position !== index))}
                aria-label={`Remove gallery image ${index + 1}`}
                className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center border border-[rgb(var(--border))] bg-[rgb(var(--background))]/90 text-[rgb(var(--text-primary))] transition-colors hover:border-[rgb(var(--error))] hover:text-[rgb(var(--error))]"
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
