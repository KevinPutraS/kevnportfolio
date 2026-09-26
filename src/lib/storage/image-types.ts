/**
 * Client-safe image upload constants and type guards.
 *
 * This module deliberately contains no imports, so it can be pulled into a
 * Client Component without dragging in `next/headers`. Everything that touches
 * the Supabase Storage SDK lives in `./images.ts` (server only).
 */

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024

/**
 * MIME type -> canonical file extension.
 *
 * The stored extension is always derived from the validated MIME type, never
 * from the client-supplied filename, so an uploaded `payload.html` can never
 * be published as an HTML document.
 */
export const ALLOWED_IMAGE_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
} as const

export type AllowedImageType = keyof typeof ALLOWED_IMAGE_TYPES

export const ACCEPTED_IMAGE_TYPES = Object.keys(ALLOWED_IMAGE_TYPES) as AllowedImageType[]

/** Only these folders may be written to, preventing path traversal. */
export const ALLOWED_UPLOAD_FOLDERS = ['projects/thumbnails', 'projects/gallery'] as const

export type UploadFolder = (typeof ALLOWED_UPLOAD_FOLDERS)[number]

export function isAllowedFolder(value: unknown): value is UploadFolder {
  return typeof value === 'string' && (ALLOWED_UPLOAD_FOLDERS as readonly string[]).includes(value)
}

export function isAllowedImageType(value: string): value is AllowedImageType {
  return Object.prototype.hasOwnProperty.call(ALLOWED_IMAGE_TYPES, value)
}
