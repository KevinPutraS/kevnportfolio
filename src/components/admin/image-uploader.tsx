'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import { ImageOff, Loader2, Upload } from 'lucide-react'
import { classNames } from '@/lib/utils/helpers'
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES, isAllowedImageType, type UploadFolder } from '@/lib/storage/image-types'

interface ImageUploaderProps {
  label: string
  folder: UploadFolder
  value: string
  onChange: (url: string) => void
  hint?: string
  error?: string
  id?: string
}

/**
 * Uploads through the server route rather than calling Supabase from the
 * browser.
 *
 * The previous version imported the server-only Supabase client into this
 * client component, which bundled server-only code paths into the browser
 * bundle and could not have worked without leaking credentials.
 */
export function ImageUploader({
  label,
  folder,
  value,
  onChange,
  hint,
  error,
  id,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [status, setStatus] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Reset immediately so selecting the same file again re-triggers change.
    event.target.value = ''
    if (!file) return

    setLocalError(null)
    setStatus('')

    if (!isAllowedImageType(file.type)) {
      setLocalError(`Unsupported file type. Use one of: ${ACCEPTED_IMAGE_TYPES.join(', ')}.`)
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setLocalError('File size must be 2MB or less.')
      return
    }

    setIsUploading(true)
    setStatus('Uploading…')

    try {
      const body = new FormData()
      body.append('file', file)
      body.append('folder', folder)

      const response = await fetch('/api/upload', { method: 'POST', body })

      if (response.status === 401) {
        throw new Error('Your session expired. Sign in again and retry.')
      }

      const payload = (await response.json().catch(() => ({}))) as { url?: string; message?: string }

      if (!response.ok || !payload.url) {
        throw new Error(payload.message ?? 'Upload failed. Please try again.')
      }

      onChange(payload.url)
      setStatus('Uploaded')
    } catch (uploadError) {
      setStatus('')
      setLocalError(
        uploadError instanceof Error ? uploadError.message : 'Upload failed. Please try again.'
      )
    } finally {
      setIsUploading(false)
    }
  }

  const message = localError ?? error

  return (
    <div className="w-full">
      <span className="label" id={`${id ?? folder}-label`}>
        {label}
      </span>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {value ? (
          <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden border border-[rgb(var(--border-subtle))] bg-[rgb(var(--surface))] sm:w-56">
            {/* Plain <img>: the value is a user-supplied remote URL and is only
                ever shown inside the admin editor, so it is not routed through
                the next/image optimizer. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="flex aspect-[16/9] w-full shrink-0 items-center justify-center border border-dashed border-[rgb(var(--border))] bg-[rgb(var(--surface))] text-[rgb(var(--text-muted))] sm:w-56">
            <ImageOff className="h-6 w-6" aria-hidden="true" />
          </div>
        )}

        <div className="flex min-w-0 flex-col gap-2">
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            onChange={handleChange}
            disabled={isUploading}
            className="sr-only"
            aria-describedby={message ? `${id ?? folder}-error` : undefined}
            aria-invalid={message ? true : undefined}
            aria-labelledby={`${id ?? folder}-label`}
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              className={classNames(
                'inline-flex h-9 items-center gap-2 border border-[rgb(var(--border))] bg-[rgb(var(--surface-elevated))] px-3 text-xs transition-colors hover:border-[rgb(var(--text-muted))] disabled:opacity-50'
              )}
            >
              {isUploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Upload className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {value ? 'Replace image' : 'Upload image'}
            </button>

            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange('')
                  setStatus('')
                  setLocalError(null)
                }}
                className="inline-flex h-9 items-center border border-[rgb(var(--border))] px-3 text-xs text-[rgb(var(--text-muted))] transition-colors hover:border-[rgb(var(--error))] hover:text-[rgb(var(--error))]"
              >
                Remove
              </button>
            )}
          </div>

          <p className={classNames('text-xs', message ? 'text-[rgb(var(--error))]' : 'text-[rgb(var(--text-muted))]')} id={`${id ?? folder}-error`}>
            {message ?? hint ?? `JPEG, PNG, WebP or GIF, up to ${Math.round(MAX_IMAGE_BYTES / 1024 / 1024)}MB.`}
          </p>

          <p aria-live="polite" className="sr-only">
            {status}
          </p>
        </div>
      </div>
    </div>
  )
}
