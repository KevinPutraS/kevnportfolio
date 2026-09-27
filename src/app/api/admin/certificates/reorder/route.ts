import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import {
  databaseErrorResponse,
  getAdminClient,
  guardAdmin,
  parseJson,
  revalidateCertificatePaths,
  validationErrorResponse,
} from '@/lib/api/admin-guard'
import { isUuid } from '@/lib/utils/validation'

export const dynamic = 'force-dynamic'

const reorderSchema = z.object({
  order: z
    .array(z.string().refine(isUuid, 'Invalid certificate id'))
    .min(1, 'Nothing to reorder')
    .max(500, 'Too many entries to reorder at once'),
})

/** POST /api/admin/certificates/reorder — apply a manual ordering. */
export async function POST(request: NextRequest) {
  const { error } = await guardAdmin()
  if (error) return error

  const body = await parseJson(request)
  if (body === null) {
    return NextResponse.json({ message: 'Request body must be valid JSON.' }, { status: 400 })
  }

  const parsed = reorderSchema.safeParse(body)
  if (!parsed.success) {
    return validationErrorResponse(parsed.error)
  }

  const order = parsed.data.order
  const supabase = await getAdminClient()

  // Existence check first, so a stale tab cannot trigger an insert. See the
  // matching comment in `/api/admin/experience/reorder`.
  const { data: existing, error: readError } = await supabase
    .from('certificates')
    .select('id')
    .in('id', order)

  if (readError) {
    return NextResponse.json({ message: 'Could not load the certificates.' }, { status: 500 })
  }

  const found = new Set((existing ?? []).map((row) => row.id))
  if (order.some((id) => !found.has(id))) {
    return NextResponse.json(
      { message: 'One or more certificates no longer exist. Reload and try again.' },
      { status: 404 }
    )
  }

  for (const [index, id] of order.entries()) {
    const { error: updateError } = await supabase
      .from('certificates')
      .update({ sort_order: order.length - index })
      .eq('id', id)

    if (updateError) {
      return databaseErrorResponse(updateError, 'reorder the certificates')
    }
  }

  revalidateCertificatePaths()
  return NextResponse.json({ success: true })
}
