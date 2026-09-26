import { NextResponse, type NextRequest } from 'next/server'
import { getAdminClient, guardAdmin, parseJson, validationErrorResponse } from '@/lib/api/admin-guard'
import { projectFormSchema, toProjectRecord } from '@/lib/validation/project'
import { isUuid } from '@/lib/utils/validation'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: { id: string }
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { error } = await guardAdmin()
  if (error) return error

  if (!isUuid(params.id)) {
    return NextResponse.json({ message: 'Invalid project id.' }, { status: 400 })
  }

  const supabase = await getAdminClient()
  const { data, error: queryError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .maybeSingle()

  if (queryError) {
    return NextResponse.json({ message: 'Could not load the project.' }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ message: 'Project not found.' }, { status: 404 })
  }

  return NextResponse.json({ project: data })
}

/**
 * PATCH /api/admin/projects/[id]
 *
 * Applies a partial update (used by the publish/feature toggles). Validated
 * against the same schema as create so a toggle can never write a malformed
 * row, and a missing row returns 404 rather than a misleading success.
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { error } = await guardAdmin()
  if (error) return error

  if (!isUuid(params.id)) {
    return NextResponse.json({ message: 'Invalid project id.' }, { status: 400 })
  }

  const body = await parseJson(request)
  if (body === null) {
    return NextResponse.json({ message: 'Request body must be valid JSON.' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ message: 'Request body must be an object.' }, { status: 400 })
  }

  const patch = body as Record<string, unknown>
  const allowedFields = ['featured', 'published'] as const
  const hasOnlyToggleFields = Object.keys(patch).length > 0 &&
    Object.keys(patch).every((key) => (allowedFields as readonly string[]).includes(key)) &&
    Object.values(patch).every((value) => typeof value === 'boolean')

  let update: Record<string, unknown>

  if (hasOnlyToggleFields) {
    // Fast path for the publish / feature switches.
    update = Object.fromEntries(
      Object.entries(patch).map(([key, value]) => [key, value as boolean])
    )
  } else {
    // Full editor save: merge over the existing row, then validate everything.
    const supabase = await getAdminClient()
    const { data: existing, error: readError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', params.id)
      .maybeSingle()

    if (readError) {
      return NextResponse.json({ message: 'Could not load the project.' }, { status: 500 })
    }
    if (!existing) {
      return NextResponse.json({ message: 'Project not found.' }, { status: 404 })
    }

    const merged = {
      title: existing.title,
      slug: existing.slug,
      short_description: existing.short_description,
      description: existing.description ?? '',
      category: existing.category,
      technologies: (existing.technologies ?? []).join(', '),
      project_date: existing.project_date ? existing.project_date.slice(0, 7) : '',
      thumbnail_url: existing.thumbnail_url ?? '',
      gallery: existing.gallery ?? [],
      project_url: existing.project_url ?? '',
      repository_url: existing.repository_url ?? '',
      featured: existing.featured,
      published: existing.published,
      ...patch,
    }

    const parsed = projectFormSchema.safeParse(merged)
    if (!parsed.success) {
      return validationErrorResponse(parsed.error)
    }
    update = toProjectRecord(parsed.data) as unknown as Record<string, unknown>
  }

  const supabase = await getAdminClient()
  const { data, error: updateError } = await supabase
    .from('projects')
    .update(update)
    .eq('id', params.id)
    .select('*')
    .maybeSingle()

  if (updateError) {
    if (updateError.code === '23505') {
      return NextResponse.json(
        {
          message: 'That slug is already in use.',
          errors: { slug: 'Another project already uses this slug.' },
        },
        { status: 409 }
      )
    }
    return NextResponse.json({ message: 'Could not update the project.' }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ message: 'Project not found.' }, { status: 404 })
  }

  return NextResponse.json({ project: data })
}

/** DELETE /api/admin/projects/[id] */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { error } = await guardAdmin()
  if (error) return error

  if (!isUuid(params.id)) {
    return NextResponse.json({ message: 'Invalid project id.' }, { status: 400 })
  }

  const supabase = await getAdminClient()
  const { error: deleteError } = await supabase.from('projects').delete().eq('id', params.id)

  if (deleteError) {
    return NextResponse.json({ message: 'Could not delete the project.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
