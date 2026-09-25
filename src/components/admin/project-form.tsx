'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { projectCategories } from '@/config/site'
import { projectFormSchema, parseTechnologies, formatTechnologies, generateSlug } from '@/lib/validation/project'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Image as ImageIcon, X, Upload, Loader2 } from 'lucide-react'
import type { ProjectFormData } from '@/lib/validation/project'

interface ProjectFormProps {
  initialData?: Partial<ProjectFormData>
  isEditing?: boolean
  projectId?: string
}

async function uploadImage(file: File, folder: string): Promise<{ url: string | null; error: string | null }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  const data = await response.json()

  if (!response.ok) {
    return { url: null, error: data.error || 'Upload failed' }
  }

  return { url: data.url, error: null }
}

export function ProjectForm({ initialData, isEditing = false, projectId }: ProjectFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<ProjectFormData>({
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
    ...initialData,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData({
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
        ...initialData,
      })
      if (initialData.technologies && Array.isArray(initialData.technologies)) {
        setFormData(prev => ({ ...prev, technologies: formatTechnologies(initialData.technologies as unknown as string[]) }))
      }
      if (initialData.thumbnail_url) setThumbnailPreview(initialData.thumbnail_url)
      if (initialData.gallery) setGalleryPreviews(initialData.gallery)
    }
  }, [initialData])

  const validateField = (name: keyof ProjectFormData, value: string) => {
    const fieldSchema = projectFormSchema.shape[name]
    if (fieldSchema) {
      const result = fieldSchema.safeParse(value)
      if (!result.success) {
        setErrors(prev => ({ ...prev, [name]: result.error.errors[0].message }))
      } else {
        setErrors(prev => {
          const next = { ...prev }
          delete next[name]
          return next
        })
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
      validateField(name as keyof ProjectFormData, value)
    }
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, title: value }))
    validateField('title', value)
    if (!formData.slug || prevSlugRef.current === prevTitleRef.current) {
      setFormData(prev => ({ ...prev, slug: generateSlug(value) }))
    }
    prevTitleRef.current = value
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, slug: value }))
    validateField('slug', value)
    prevSlugRef.current = value
  }

  const prevTitleRef = { current: initialData?.title || '' }
  const prevSlugRef = { current: initialData?.slug || '' }

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingThumbnail(true)
    const { url, error } = await uploadImage(file, 'projects/thumbnails')
    setUploadingThumbnail(false)

    if (error) {
      setSubmitError(error)
      return
    }

    if (url) {
      setFormData(prev => ({ ...prev, thumbnail_url: url }))
      setThumbnailPreview(url)
      setSubmitError('')
    }
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    for (const file of files) {
      setUploadingGallery(true)
      const { url, error } = await uploadImage(file, 'projects/gallery')
      setUploadingGallery(false)

      if (error) {
        setSubmitError(error)
        return
      }

      if (url) {
        setFormData(prev => ({ ...prev, gallery: [...(prev.gallery || []), url] }))
        setGalleryPreviews(prev => [...prev, url])
      }
    }
    setSubmitError('')
  }

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({ ...prev, gallery: (prev.gallery || []).filter((_, i) => i !== index) }))
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const removeThumbnail = () => {
    setFormData(prev => ({ ...prev, thumbnail_url: '' }))
    setThumbnailPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')

    const result = projectFormSchema.safeParse({
      ...formData,
      technologies: parseTechnologies(formData.technologies),
      gallery: formData.gallery,
    })

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ProjectFormData, string>> = {}
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof ProjectFormData] = err.message
        }
      })
      setErrors(fieldErrors)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(isEditing ? `/api/admin/projects/${projectId}` : '/api/admin/projects', {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...result.data,
          technologies: parseTechnologies(result.data.technologies),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save project')
      }

      router.push('/admin/projects')
      router.refresh()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      {submitError && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-red-400" role="alert">
          {submitError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleTitleChange}
            error={errors.title}
            placeholder="My Awesome Project"
            required
            maxLength={100}
          />
        </div>
        <div>
          <Input
            label="Slug"
            name="slug"
            value={formData.slug}
            onChange={handleSlugChange}
            error={errors.slug}
            placeholder="my-awesome-project"
            required
            maxLength={100}
            hint="URL-friendly identifier. Auto-generated from title."
          />
        </div>
      </div>

      <div>
        <Textarea
          label="Short Description"
          name="short_description"
          value={formData.short_description}
          onChange={handleChange}
          error={errors.short_description}
          placeholder="A brief summary for project cards and listings."
          required
          maxLength={300}
          rows={3}
        />
      </div>

      <div>
        <Textarea
          label="Full Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Detailed project description. Supports markdown."
          maxLength={10000}
          rows={6}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            error={errors.category}
            options={projectCategories.map(c => ({ value: c.value, label: c.label }))}
            placeholder="Select a category"
            required
          />
        </div>
        <div>
          <Input
            label="Project Date"
            name="project_date"
            type="month"
            value={formData.project_date}
            onChange={handleChange}
            error={errors.project_date}
            hint="When was this project completed? (YYYY-MM)"
          />
        </div>
      </div>

      <div>
        <label className="label">Technologies</label>
        <Input
          name="technologies"
          value={formData.technologies}
          onChange={handleChange}
          placeholder="React, TypeScript, Tailwind, Supabase"
          hint="Comma-separated list of technologies used"
        />
        {formData.technologies && (
          <div className="mt-2 flex flex-wrap gap-2" aria-label="Technology tags">
            {parseTechnologies(formData.technologies).map((tech) => (
              <Badge key={tech} variant="secondary" removable onRemove={() => {
                const techs = parseTechnologies(formData.technologies).filter(t => t !== tech)
                setFormData(prev => ({ ...prev, technologies: formatTechnologies(techs) }))
              }}>
                {tech}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="label">Thumbnail Image</label>
        <div className="relative">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleThumbnailUpload}
            className="sr-only"
            id="thumbnail-upload"
            disabled={uploadingThumbnail}
          />
          <label
            htmlFor="thumbnail-upload"
            className={`
              cursor-pointer border-2 border-dashed rounded-lg p-8 text-center transition-all
              ${thumbnailPreview
                ? 'border-[rgb(var(--border))]'
                : 'border-[rgb(var(--border-subtle))] hover:border-[rgb(var(--accent))]'
              }
            `}
          >
            {thumbnailPreview ? (
              <div className="relative">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  width={300}
                  height={180}
                  className="mx-auto rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={removeThumbnail}
                  className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70 transition-colors"
                  aria-label="Remove thumbnail"
                >
                  <X className="h-4 w-4" />
                </button>
                {uploadingThumbnail && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <ImageIcon className="h-10 w-10 text-[rgb(var(--text-muted))]" />
                <span className="text-[rgb(var(--text-secondary))]">Click to upload thumbnail</span>
                <span className="text-xs text-[rgb(var(--text-muted))]">JPEG, PNG, WebP, GIF up to 2MB</span>
              </div>
            )}
          </label>
        </div>
        {formData.thumbnail_url && (
          <input type="hidden" name="thumbnail_url" value={formData.thumbnail_url} />
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="label mb-0">Gallery Images</label>
          <label
            htmlFor="gallery-upload"
            className="cursor-pointer"
          >
            <Button variant="secondary" size="sm" disabled={uploadingGallery}>
              <Upload className="h-4 w-4 mr-2" />
              Add Images
            </Button>
          </label>
          <input
            type="file"
            id="gallery-upload"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleGalleryUpload}
            className="sr-only"
            disabled={uploadingGallery}
          />
        </div>
        {galleryPreviews.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {galleryPreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Gallery image ${index + 1}`}
                  width={200}
                  height={150}
                  className="rounded-lg object-cover aspect-video"
                />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(index)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 rounded-full bg-black/50 p-1 text-white hover:bg-black/70 transition-opacity"
                  aria-label={`Remove gallery image ${index + 1}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        {(formData.gallery?.length || 0) > 0 && (
          <input type="hidden" name="gallery" value={JSON.stringify(formData.gallery)} />
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Input
            label="Project URL"
            name="project_url"
            type="url"
            value={formData.project_url}
            onChange={handleChange}
            error={errors.project_url}
            placeholder="https://example.com"
            hint="Live project URL (optional)"
          />
        </div>
        <div>
          <Input
            label="Repository URL"
            name="repository_url"
            type="url"
            value={formData.repository_url}
            onChange={handleChange}
            error={errors.repository_url}
            placeholder="https://github.com/username/repo"
            hint="Source code repository (optional)"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Checkbox
            name="featured"
            label="Featured Project"
            checked={formData.featured}
            onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
          />
        </div>
        <div>
          <Checkbox
            name="published"
            label="Published"
            checked={formData.published}
            onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 border-t border-[rgb(var(--border-subtle))] pt-6">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {isEditing ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  )
}