import { NextResponse, type NextRequest } from 'next/server'
import { getAdminClient, guardAdmin, parseJson, validationErrorResponse } from '@/lib/api/admin-guard'
import { projectFormSchema, toProjectRecord } from '@/lib/validation/project'

export const dynamic = 'force-dynamic'

/** GET /api/admin/projects — paginated listing including drafts. */
export async function GET(request: NextRequest) {
  const { error } = await guardAdmin()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1)
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') ?? '25') || 25))
  const from = (page - 1) * pageSize

  const supabase = await getAdminClient()
  const { data, error: queryError, count } = await supabase
    .from('projects')
    .select('*', { count: 'exact' })
    .order('project_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1)

  if (queryError) {
    return NextResponse.json({ message: 'Could not load projects.' }, { status: 500 })
  }

  return NextResponse.json({ projects: data ?? [], total: count ?? 0, page, pageSize })
}

/** POST /api/admin/projects — create a project. */
export async function POST(request: NextRequest) {
  const { error } = await guardAdmin()
  if (error) return error

  const body = await parseJson(request)
  if (body === null) {
    return NextResponse.json({ message: 'Request body must be valid JSON.' }, { status: 400 })
  }

  /*
   * `technologies` arrives here as the comma-separated string the editor shows
   * (matching the form schema), and `toProjectRecord` converts it to a text[]
   * for the database. The previous implementation converted it in the client
   * and then re-validated against a string schema, so every create returned 400.
   */
  const parsed = projectFormSchema.safeParse(body)
  if (!parsed.success) {
    return validationErrorResponse(parsed.error)
  }

  const record = toProjectRecord(parsed.data)
  const supabase = await getAdminClient()

  const { data, error: insertError } = await supabase
    .from('projects')
    .insert(record)
    .select('*')
    .single()

  if (insertError) {
    // 23505 = unique_violation on projects_slug_key
    if (insertError.code === '23505') {
      return NextResponse.json(
        {
          message: 'That slug is already in use.',
          errors: { slug: 'Another project already uses this slug.' },
        },
        { status: 409 }
      )
    }
    return NextResponse.json({ message: 'Could not create the project.' }, { status: 500 })
  }

  return NextResponse.json({ project: data }, { status: 201 })
}
