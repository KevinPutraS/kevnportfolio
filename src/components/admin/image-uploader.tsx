'use client'

import { useState } from 'react'
import { uploadImage, generateImagePath } from '@/lib/storage/images'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, X, Loader2, Image as ImageIcon, CheckCircle } from 'lucide-react'
import { classNames } from '@/lib/utils/helpers'

interface ImageUploaderProps {
  value?: string
  onChange: (url: string) => void
  onRemove?: () => void
  label?: string
  folder?: string
  accept?: string
  maxSizeMB?: number
}

export function ImageUploader({
  value,
  onChange,
  onRemove,
  label = 'Image',
  folder = 'uploads',
  accept = 'image/jpeg,image/png,image/webp,image/gif',
  maxSizeMB = 2,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.')
      return
    }

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size must be less than ${maxSizeMB}MB.`)
      return
    }

    setUploading(true)
    setError(null)

    const path = generateImagePath(file.name, folder)
    const { url, error: uploadError } = await uploadImage(file, path)

    setUploading(false)

    if (uploadError) {
      setError(uploadError)
      return
    }

    if (url) {
      setPreview(url)
      onChange(url)
      setError(null)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange('')
    onRemove?.()
  }

  return (
    <div className="space-y-3">
      <label className="label">{label}</label>
      
      <div className="relative">
        <input
          type="file"
          accept={accept}
          onChange={handleUpload}
          className="sr-only"
          id={`${label.toLowerCase().replace(/\s+/g, '-')}-upload`}
          disabled={uploading}
        />
        <label
          htmlFor={`${label.toLowerCase().replace(/\s+/g, '-')}-upload`}
          className={classNames(
            'cursor-pointer border-2 border-dashed rounded-lg p-8 text-center transition-all',
            preview || value
              ? 'border-[rgb(var(--border))]'
              : 'border-[rgb(var(--border-subtle))] hover:border-[rgb(var(--accent))]'
          )}
        >
          {preview || value ? (
            <div className="relative max-w-xs mx-auto">
              <img
                src={preview || value!}
                alt={`${label} preview`}
                className="rounded-lg object-cover aspect-video w-full"
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70 transition-colors"
                aria-label={`Remove ${label.toLowerCase()}`}
              >
                <X className="h-4 w-4" />
              </button>
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <ImageIcon className="h-10 w-10 text-[rgb(var(--text-muted))]" />
              <span className="text-[rgb(var(--text-secondary))]">Click to upload {label.toLowerCase()}</span>
              <span className="text-xs text-[rgb(var(--text-muted))]">
                JPEG, PNG, WebP, GIF up to {maxSizeMB}MB
              </span>
            </div>
          )}
        </label>
      </div>

      {error && (
        <p className="text-sm text-[rgb(var(--error))]" role="alert">{error}</p>
      )}

      {(preview || value) && (
        <div className="flex items-center gap-2 text-sm text-[rgb(var(--text-secondary))]">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <span>{label} uploaded successfully</span>
        </div>
      )}
    </div>
  )
}