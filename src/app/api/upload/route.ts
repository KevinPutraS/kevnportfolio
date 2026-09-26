import { NextResponse, type NextRequest } from 'next/server'
import { getAdminClient, guardAdmin } from '@/lib/api/admin-guard'
import { ALLOWED_UPLOAD_FOLDERS, isAllowedFolder } from '@/lib/storage/image-types'
import {
  PORTFOLIO_BUCKET,
  buildObjectPath,
  hasValidImageSignature,
  validateImageFile,
} from '@/lib/storage/images'

export const dynamic = 'force-dynamic'

/**
 * POST /api/upload
 *
 * Multipart upload for project thumbnails and gallery images.
 *
 * Security decisions:
 * - the destination folder is validated against an allowlist, so a client
 *   cannot write `../../` or an arbitrary bucket path
 * - the file extension is derived from the *validated MIME type*, never from
 *   the client-supplied filename, so `payload.html` is stored as `payload.jpg`
 * - the magic number is checked, because `file.type` is attacker controlled
 * - the bucket is private; public read is granted per object
 */
export async function POST(request: NextRequest) {
  const { error } = await guardAdmin()
  if (error) return error

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ message: 'Expected a multipart form upload.' }, { status: 400 })
  }

  const file = formData.get('file')
  const folder = formData.get('folder')

  if (!isAllowedFolder(folder)) {
    return NextResponse.json(
      { message: `folder must be one of: ${ALLOWED_UPLOAD_FOLDERS.join(', ')}` },
      { status: 400 }
    )
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ message: 'No file was uploaded.' }, { status: 400 })
  }

  const validation = validateImageFile(file)
  if (!validation.ok || !validation.extension) {
    return NextResponse.json({ message: validation.error }, { status: 400 })
  }

  if (!(await hasValidImageSignature(file))) {
    return NextResponse.json(
      { message: 'The file contents do not match the declared image type.' },
      { status: 400 }
    )
  }

  const objectPath = buildObjectPath(folder, validation.extension)
  const buffer = Buffer.from(await file.arrayBuffer())

  const supabase = await getAdminClient()
  const { error: uploadError } = await supabase.storage
    .from(PORTFOLIO_BUCKET)
    .upload(objectPath, buffer, {
      contentType: file.type,
      // Never treat a user upload as executable markup.
      cacheControl: '31536000',
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json({ message: `Upload failed: ${uploadError.message}` }, { status: 500 })
  }

  const { data } = supabase.storage.from(PORTFOLIO_BUCKET).getPublicUrl(objectPath)

  return NextResponse.json({ url: data.publicUrl, path: objectPath }, { status: 201 })
}

/** DELETE /api/upload?path=projects/gallery/… — used when replacing an image. */
export async function DELETE(request: NextRequest) {
  const { error } = await guardAdmin()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path') ?? ''

  const isAllowedPrefix = ALLOWED_UPLOAD_FOLDERS.some((folder) => path.startsWith(`${folder}/`))
  if (!path || !isAllowedPrefix || path.includes('..')) {
    return NextResponse.json({ message: 'Invalid storage path.' }, { status: 400 })
  }

  const supabase = await getAdminClient()
  const { error: removeError } = await supabase.storage.from(PORTFOLIO_BUCKET).remove([path])

  if (removeError) {
    return NextResponse.json({ message: 'Could not delete the file.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
