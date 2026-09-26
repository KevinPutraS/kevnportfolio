import { requireClient } from '@/lib/supabase/server'
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  isAllowedImageType,
  type AllowedImageType,
  type UploadFolder,
} from './image-types'

/** Bucket that holds every uploaded project thumbnail and gallery image. */
export const PORTFOLIO_BUCKET = 'portfolio-images'

export { MAX_IMAGE_BYTES, ALLOWED_IMAGE_TYPES, isAllowedImageType }
export type { AllowedImageType, UploadFolder }

export interface ImageValidationResult {
  ok: boolean
  error?: string
  extension?: string
}

export function validateImageFile(file: File): ImageValidationResult {
  if (!file || typeof file.arrayBuffer !== 'function') {
    return { ok: false, error: 'No file was received.' }
  }
  if (!isAllowedImageType(file.type)) {
    return { ok: false, error: 'Unsupported file type. Use JPEG, PNG, WebP or GIF.' }
  }
  if (file.size <= 0) {
    return { ok: false, error: 'The selected file is empty.' }
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: 'File size must be 2MB or less.' }
  }
  return { ok: true, extension: ALLOWED_IMAGE_TYPES[file.type] }
}

/**
 * Very light magic-number check. A browser-supplied MIME type alone is not
 * enough, because both the filename and the type are attacker controlled.
 */
const MAGIC_BYTES: Record<AllowedImageType, number[]> = {
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
  'image/gif': [0x47, 0x49, 0x46, 0x38],
}

export async function hasValidImageSignature(file: File): Promise<boolean> {
  if (!isAllowedImageType(file.type)) return false

  const expected = MAGIC_BYTES[file.type]
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer())

  return expected.every((byte, index) => header[index] === byte)
}

/** Collision-resistant object key. The extension comes from the MIME type. */
export function buildObjectPath(folder: UploadFolder, extension: string): string {
  const random = crypto.randomUUID().replace(/-/g, '').slice(0, 12)
  return `${folder}/${Date.now()}-${random}.${extension}`
}

/** Converts a public storage URL back into its object key. */
export function objectPathFromPublicUrl(url: string): string | null {
  if (!url.startsWith('/')) return null
  return url.replace(/^\/+/, '')
}

export async function getPublicUrl(path: string): Promise<string> {
  const supabase = await requireClient()
  const { data } = supabase.storage.from(PORTFOLIO_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function removeStoredObject(path: string): Promise<{ error: string | null }> {
  const supabase = await requireClient()
  const { error } = await supabase.storage.from(PORTFOLIO_BUCKET).remove([path])
  return { error: error?.message ?? null }
}
