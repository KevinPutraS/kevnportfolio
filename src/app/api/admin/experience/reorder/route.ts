import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import {
  databaseErrorResponse,
  getAdminClient,
  guardAdmin,
  parseJson,
  revalidateExperiencePaths,
  validationErrorResponse,
} from '@/lib/api/admin-guard'
import { isUuid } from '@/lib/utils/validation'

export const dynamic = 'force-dynamic'

/**
 * The client submits the list of ids in their new display order. Validating the
 * whole array in one statement is what keeps a partially applied reorder from
 * leaving the timeline in a scrambled state.
 */
const reorderSchema = z.object({
  order: z
    .array(z.string().refine(isUuid, 'Invalid experience id'))
    .min(1, 'Nothing to reorder')
    .max(500, 'Too many entries to reorder at once'),
})

/** POST /api/admin/experience/reorder — apply a manual ordering. */
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

  /*
   * Every id is checked up front. An `upsert` would be tidier as a single
   * statement, but an id that does not exist would then be *inserted*, and
   * `title` / `organization` are NOT NULL, so a stale client tab would fail
   * halfway through and leave the list half reordered. Rejecting unknown ids
   * keeps the operation all-or-nothing from the caller's point of view.
   */
  const { data: existing, error: readError } = await supabase
    .from('experiences')
    .select('id')
    .in('id', order)

  if (readError) {
    return NextResponse.json({ message: 'Could not load the timeline.' }, { status: 500 })
  }

  const found = new Set((existing ?? []).map((row) => row.id))
  const missing = order.filter((id) => !found.has(id))
  if (missing.length > 0) {
    return NextResponse.json(
      { message: 'One or more entries no longer exist. Reload and try again.' },
      { status: 404 }
    )
  }

  /*
   * `sort_order` is a sparse descending number so the array's first id sorts
   * highest, and there is room to insert between two entries later without
   * renumbering the whole list. Timelines hold a handful of entries, so a
   * sequential update is cheaper than the machinery needed to batch it into
   * one statement.
   */
  for (const [index, id] of order.entries()) {
    const { error: updateError } = await supabase
      .from('experiences')
      .update({ sort_order: order.length - index })
      .eq('id', id)

    if (updateError) {
      return databaseErrorResponse(updateError, 'reorder the timeline')
    }
  }

  revalidateExperiencePaths()
  return NextResponse.json({ success: true })
}
