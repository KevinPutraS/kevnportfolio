import { NextResponse, type NextRequest } from 'next/server'
import {
  booleanTogglePatch,
  databaseErrorResponse,
  getAdminClient,
  guardAdmin,
  parseJson,
  revalidateCertificatePaths,
  validationErrorResponse,
} from '@/lib/api/admin-guard'
import { certificateFormSchema, toCertificateRecord } from '@/lib/validation/certificate'
import { toMonthInput } from '@/lib/validation/fields'
import { isUuid } from '@/lib/utils/validation'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: { id: string }
}

const TOGGLE_FIELDS = ['published'] as const

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { error } = await guardAdmin()
  if (error) return error

  if (!isUuid(params.id)) {
    return NextResponse.json({ message: 'Invalid certificate id.' }, { status: 400 })
  }

  const supabase = await getAdminClient()
  const { data, error: queryError } = await supabase
    .from('certificates')
    .select('*')
    .eq('id', params.id)
    .limit(1)

  if (queryError) {
    return NextResponse.json({ message: 'Could not load the certificate.' }, { status: 500 })
  }
  if (!data || data.length === 0) {
    return NextResponse.json({ message: 'Certificate not found.' }, { status: 404 })
  }

  return NextResponse.json({ certificate: data[0] })
}

/**
 * PATCH /api/admin/certificates/[id]
 *
 * Accepts a boolean-only body (the publish switch in the table) or a full
 * editor save, which is merged over the stored row before validation so a
 * partial payload can never blank out a field the client did not send.
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { error } = await guardAdmin()
  if (error) return error

  if (!isUuid(params.id)) {
    return NextResponse.json({ message: 'Invalid certificate id.' }, { status: 400 })
  }

  const body = await parseJson(request)
  if (body === null) {
    return NextResponse.json({ message: 'Request body must be valid JSON.' }, { status: 400 })
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return NextResponse.json({ message: 'Request body must be an object.' }, { status: 400 })
  }

  const patch = body as Record<string, unknown>
  const supabase = await getAdminClient()

  let update: Record<string, unknown>

  const togglePatch = booleanTogglePatch(patch, TOGGLE_FIELDS)
  if (togglePatch) {
    update = togglePatch
  } else {
    const { data: existing, error: readError } = await supabase
      .from('certificates')
      .select('*')
      .eq('id', params.id)
      .limit(1)

    if (readError) {
      return NextResponse.json({ message: 'Could not load the certificate.' }, { status: 500 })
    }
    if (!existing || existing.length === 0) {
      return NextResponse.json({ message: 'Certificate not found.' }, { status: 404 })
    }

    const row = existing[0]
    const merged = {
      title: row.title,
      issuer: row.issuer,
      issue_date: toMonthInput(row.issue_date),
      expiration_date: toMonthInput(row.expiration_date),
      credential_id: row.credential_id ?? '',
      credential_url: row.credential_url ?? '',
      certificate_image_url: row.certificate_image_url ?? '',
      description: row.description ?? '',
      skills: (row.skills ?? []).join(', '),
      sort_order: String(row.sort_order ?? 0),
      published: row.published,
      ...patch,
    }

    const parsed = certificateFormSchema.safeParse(merged)
    if (!parsed.success) {
      return validationErrorResponse(parsed.error)
    }
    update = toCertificateRecord(parsed.data) as unknown as Record<string, unknown>
  }

  const { data, error: updateError } = await supabase
    .from('certificates')
    .update(update)
    .eq('id', params.id)
    .select('*')
    .limit(1)

  if (updateError) {
    return databaseErrorResponse(updateError, 'update the certificate')
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ message: 'Certificate not found.' }, { status: 404 })
  }

  revalidateCertificatePaths()
  return NextResponse.json({ certificate: data[0] })
}

/** DELETE /api/admin/certificates/[id] */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { error } = await guardAdmin()
  if (error) return error

  if (!isUuid(params.id)) {
    return NextResponse.json({ message: 'Invalid certificate id.' }, { status: 400 })
  }

  const supabase = await getAdminClient()
  const { data, error: deleteError } = await supabase
    .from('certificates')
    .delete()
    .eq('id', params.id)
    .select('id')

  if (deleteError) {
    return databaseErrorResponse(deleteError, 'delete the certificate')
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ message: 'Certificate not found.' }, { status: 404 })
  }

  revalidateCertificatePaths()
  return NextResponse.json({ success: true })
}
