import { NextResponse, type NextRequest } from 'next/server'
import {
  databaseErrorResponse,
  getAdminClient,
  guardAdmin,
  parseJson,
  revalidateCertificatePaths,
  validationErrorResponse,
} from '@/lib/api/admin-guard'
import { certificateFormSchema, toCertificateRecord } from '@/lib/validation/certificate'
import { getAllCertificatesForAdmin } from '@/lib/db/certificates'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/certificates — every row, drafts included.
 *
 * Reads through the db layer so the ordering lives in exactly one place.
 */
export async function GET() {
  const { error } = await guardAdmin()
  if (error) return error

  let certificates
  try {
    certificates = await getAllCertificatesForAdmin({ strict: true })
  } catch {
    return NextResponse.json({ message: 'Could not load certificates.' }, { status: 500 })
  }

  return NextResponse.json({ certificates })
}

/** POST /api/admin/certificates — create a certificate. */
export async function POST(request: NextRequest) {
  const { error } = await guardAdmin()
  if (error) return error

  const body = await parseJson(request)
  if (body === null) {
    return NextResponse.json({ message: 'Request body must be valid JSON.' }, { status: 400 })
  }

  const parsed = certificateFormSchema.safeParse(body)
  if (!parsed.success) {
    return validationErrorResponse(parsed.error)
  }

  const record = toCertificateRecord(parsed.data)
  const supabase = await getAdminClient()
  const { data, error: insertError } = await supabase
    .from('certificates')
    .insert(record)
    .select('*')
    .single()

  if (insertError) {
    return databaseErrorResponse(insertError, 'create the certificate')
  }

  revalidateCertificatePaths()
  return NextResponse.json({ certificate: data }, { status: 201 })
}
