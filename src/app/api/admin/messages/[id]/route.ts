import { NextResponse, type NextRequest } from 'next/server'
import { booleanTogglePatch, databaseErrorResponse, getAdminClient, guardAdmin, parseJson } from '@/lib/api/admin-guard'
import { isUuid } from '@/lib/utils/validation'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: { id: string }
}

/*
 * `is_read` is the only writable column. A message's text, sender and timestamp
 * are what the visitor submitted, and letting an editor rewrite them would mean
 * the inbox could no longer be trusted as a record of what actually arrived.
 */
const TOGGLE_FIELDS = ['is_read'] as const

function invalidId() {
  return NextResponse.json({ message: 'Invalid message id.' }, { status: 400 })
}

function notFound() {
  return NextResponse.json({ message: 'Message not found.' }, { status: 404 })
}

/** GET /api/admin/messages/[id] */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { error } = await guardAdmin()
  if (error) return error

  if (!isUuid(params.id)) return invalidId()

  const supabase = await getAdminClient()
  const { data, error: queryError } = await supabase
    .from('contact_messages')
    .select('*')
    .eq('id', params.id)
    .limit(1)

  if (queryError) {
    return NextResponse.json({ message: 'Could not load the message.' }, { status: 500 })
  }
  if (!data || data.length === 0) return notFound()

  return NextResponse.json({ message: data[0] })
}

/**
 * PATCH /api/admin/messages/[id]
 *
 * A boolean-only body, nothing else. Unlike the project and certificate editors
 * there is no full-save branch to merge over the stored row, because there is no
 * editor: flipping read state is the entire write surface of this table.
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { error } = await guardAdmin()
  if (error) return error

  if (!isUuid(params.id)) return invalidId()

  const body = await parseJson(request)
  if (body === null) {
    return NextResponse.json({ message: 'Request body must be valid JSON.' }, { status: 400 })
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return NextResponse.json({ message: 'Request body must be an object.' }, { status: 400 })
  }

  const update = booleanTogglePatch(body as Record<string, unknown>, TOGGLE_FIELDS)
  if (!update) {
    return NextResponse.json({ message: 'Nothing to update.' }, { status: 400 })
  }

  const supabase = await getAdminClient()
  const { data, error: updateError } = await supabase
    .from('contact_messages')
    .update(update)
    .eq('id', params.id)
    .select('*')
    .limit(1)

  if (updateError) {
    return databaseErrorResponse(updateError, 'update the message')
  }
  if (!data || data.length === 0) return notFound()

  return NextResponse.json({ message: data[0] })
}

/** DELETE /api/admin/messages/[id] — permanent; the inbox has no trash. */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { error } = await guardAdmin()
  if (error) return error

  if (!isUuid(params.id)) return invalidId()

  const supabase = await getAdminClient()
  const { data, error: deleteError } = await supabase
    .from('contact_messages')
    .delete()
    .eq('id', params.id)
    .select('id')

  if (deleteError) {
    return databaseErrorResponse(deleteError, 'delete the message')
  }
  if (!data || data.length === 0) return notFound()

  return NextResponse.json({ success: true })
}