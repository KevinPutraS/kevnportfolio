import { NextResponse } from 'next/server'
import { guardAdmin } from '@/lib/api/admin-guard'
import { getMessagesForAdmin } from '@/lib/db/messages'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/messages — the inbox, newest first.
 *
 * Deliberately no `revalidate*` call, unlike every other admin route in the app:
 * nothing public renders a message, so there is no cached render to drop. The
 * table refreshes itself with `router.refresh()` instead.
 */
export async function GET() {
  const { error } = await guardAdmin()
  if (error) return error

  let messages
  try {
    messages = await getMessagesForAdmin({ strict: true })
  } catch {
    return NextResponse.json({ message: 'Could not load messages.' }, { status: 500 })
  }

  return NextResponse.json({ messages })
}