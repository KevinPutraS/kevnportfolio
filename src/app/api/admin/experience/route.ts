import { NextResponse, type NextRequest } from 'next/server'
import {
  databaseErrorResponse,
  getAdminClient,
  guardAdmin,
  parseJson,
  revalidateExperiencePaths,
  validationErrorResponse,
} from '@/lib/api/admin-guard'
import { getAllExperiencesForAdmin } from '@/lib/db/experience'
import { experienceFormSchema, toExperienceRecord } from '@/lib/validation/experience'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/experience — every row, drafts included.
 *
 * Reads through the db layer rather than repeating the query here. An earlier
 * version had its own `order()` chain and drifted out of sync with the public
 * one, which silently reversed the manual ordering in the editor.
 */
export async function GET() {
  const { error } = await guardAdmin()
  if (error) return error

  let experiences
  try {
    experiences = await getAllExperiencesForAdmin({ strict: true })
  } catch {
    return NextResponse.json({ message: 'Could not load experience.' }, { status: 500 })
  }

  return NextResponse.json({ experiences })
}

/** POST /api/admin/experience — create an entry. */
export async function POST(request: NextRequest) {
  const { error } = await guardAdmin()
  if (error) return error

  const body = await parseJson(request)
  if (body === null) {
    return NextResponse.json({ message: 'Request body must be valid JSON.' }, { status: 400 })
  }

  const parsed = experienceFormSchema.safeParse(body)
  if (!parsed.success) {
    return validationErrorResponse(parsed.error)
  }

  const record = toExperienceRecord(parsed.data)
  const supabase = await getAdminClient()
  const { data, error: insertError } = await supabase
    .from('experiences')
    .insert(record)
    .select('*')
    .single()

  if (insertError) {
    return databaseErrorResponse(insertError, 'create the experience entry')
  }

  revalidateExperiencePaths()
  return NextResponse.json({ experience: data }, { status: 201 })
}
