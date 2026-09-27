import { NextResponse, type NextRequest } from 'next/server'
import {
  booleanTogglePatch,
  databaseErrorResponse,
  getAdminClient,
  guardAdmin,
  parseJson,
  revalidateExperiencePaths,
  validationErrorResponse,
} from '@/lib/api/admin-guard'
import { experienceFormSchema, toExperienceRecord } from '@/lib/validation/experience'
import { toMonthInput } from '@/lib/validation/fields'
import { isUuid } from '@/lib/utils/validation'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: { id: string }
}

const TOGGLE_FIELDS = ['published', 'current'] as const

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { error } = await guardAdmin()
  if (error) return error

  if (!isUuid(params.id)) {
    return NextResponse.json({ message: 'Invalid experience id.' }, { status: 400 })
  }

  const supabase = await getAdminClient()
  const { data, error: queryError } = await supabase
    .from('experiences')
    .select('*')
    .eq('id', params.id)
    .limit(1)

  if (queryError) {
    return NextResponse.json({ message: 'Could not load the experience entry.' }, { status: 500 })
  }
  if (!data || data.length === 0) {
    return NextResponse.json({ message: 'Experience entry not found.' }, { status: 404 })
  }

  return NextResponse.json({ experience: data[0] })
}

/**
 * PATCH /api/admin/experience/[id]
 *
 * Two shapes are accepted, matching the project editor:
 *   - a body of booleans only  -> flip `published` / `current`
 *   - anything else            -> merge over the stored row, validate, write
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { error } = await guardAdmin()
  if (error) return error

  if (!isUuid(params.id)) {
    return NextResponse.json({ message: 'Invalid experience id.' }, { status: 400 })
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
    /*
     * Marking a role as current and leaving a stored end date behind violates
     * the `experiences_current_end_date` CHECK (current ⇒ end_date IS NULL),
     * which the database would reject with a bare 23514. Clearing the date in
     * the same update is what the toggle actually means — "this is ongoing" —
     * and it avoids making the editor open the full form to do it by hand.
     *
     * The inverse needs no special handling: `current = false` with a null end
     * date is legal, and the public timeline falls back to the employment-type
     * label instead of printing an empty date range.
     */
    update =
      togglePatch.current === true ? { ...togglePatch, end_date: null } : { ...togglePatch }
  } else {
    const { data: existing, error: readError } = await supabase
      .from('experiences')
      .select('*')
      .eq('id', params.id)
      .limit(1)

    if (readError) {
      return NextResponse.json({ message: 'Could not load the experience entry.' }, { status: 500 })
    }
    if (!existing || existing.length === 0) {
      return NextResponse.json({ message: 'Experience entry not found.' }, { status: 404 })
    }

    const row = existing[0]
    const merged = {
      title: row.title,
      organization: row.organization,
      location: row.location ?? '',
      employment_type: row.employment_type,
      start_date: toMonthInput(row.start_date),
      end_date: toMonthInput(row.end_date),
      current: row.current,
      description: row.description ?? '',
      responsibilities: (row.responsibilities ?? []).join('\n'),
      technologies: (row.technologies ?? []).join(', '),
      organization_logo_url: row.organization_logo_url ?? '',
      project_url: row.project_url ?? '',
      sort_order: String(row.sort_order ?? 0),
      published: row.published,
      ...patch,
    }

    const parsed = experienceFormSchema.safeParse(merged)
    if (!parsed.success) {
      return validationErrorResponse(parsed.error)
    }
    update = toExperienceRecord(parsed.data) as unknown as Record<string, unknown>
  }

  const { data, error: updateError } = await supabase
    .from('experiences')
    .update(update)
    .eq('id', params.id)
    .select('*')
    .limit(1)

  if (updateError) {
    return databaseErrorResponse(updateError, 'update the experience entry')
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ message: 'Experience entry not found.' }, { status: 404 })
  }

  revalidateExperiencePaths()
  return NextResponse.json({ experience: data[0] })
}

/** DELETE /api/admin/experience/[id] */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { error } = await guardAdmin()
  if (error) return error

  if (!isUuid(params.id)) {
    return NextResponse.json({ message: 'Invalid experience id.' }, { status: 400 })
  }

  const supabase = await getAdminClient()
  const { data, error: deleteError } = await supabase
    .from('experiences')
    .delete()
    .eq('id', params.id)
    .select('id')

  if (deleteError) {
    return databaseErrorResponse(deleteError, 'delete the experience entry')
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ message: 'Experience entry not found.' }, { status: 404 })
  }

  revalidateExperiencePaths()
  return NextResponse.json({ success: true })
}
