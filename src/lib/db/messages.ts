import { requireClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { isUuid } from '@/lib/utils/validation'
import type { ContactMessage } from '@/types/message'

/**
 * How many messages the inbox loads in one request.
 *
 * An inbox is the one admin list where the tail genuinely matters — nobody
 * archives mail — but it is still capped, because a table that renders an
 * unbounded number of rows is what makes an admin page unusable on a phone.
 * 200 is roughly two years of an active portfolio's contact form.
 */
export const MESSAGE_INBOX_LIMIT = 200

/**
 * The admin inbox, newest first.
 *
 * `strict` rethrows so the admin API can answer 500 instead of implying the
 * inbox is empty; the admin page keeps the lenient default. Same contract as
 * `getAllCertificatesForAdmin`, and the same reason: an empty inbox and a
 * failed read look identical to the visitor otherwise.
 *
 * The session client is what makes the drafts-visible analogue of the other
 * tables unnecessary here — messages are never drafts, they are simply private
 * to admins, and that is RLS's job, not this function's.
 */
export async function getMessagesForAdmin({
  strict = false,
  limit = MESSAGE_INBOX_LIMIT,
}: { strict?: boolean; limit?: number } = {}): Promise<ContactMessage[]> {
  if (!isSupabaseConfigured()) return []

  const supabase = await requireClient()
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(Math.min(MESSAGE_INBOX_LIMIT, Math.max(1, limit)))

  if (error) {
    if (strict) throw new Error(`Failed to load contact messages: ${error.message}`)
    console.error('[db] failed to fetch contact messages for admin:', error.message)
    return []
  }

  return (data ?? []) as ContactMessage[]
}

/**
 * Exact unread count, from a `head` request that transfers no rows.
 *
 * Kept separate from the inbox list rather than derived from it: the list is
 * capped, so counting its unread entries would quietly cap the badge too.
 */
export async function getUnreadMessageCount(): Promise<number> {
  if (!isSupabaseConfigured()) return 0

  const supabase = await requireClient()
  const { count, error } = await supabase
    .from('contact_messages')
    .select('id', { count: 'exact', head: true })
    .eq('is_read', false)

  if (error) {
    console.error('[db] failed to count unread contact messages:', error.message)
    return 0
  }

  return count ?? 0
}

/**
 * Single row. Returns drafts-plus-private equivalently — every message is
 * private — but keeps the `isUuid` guard the other `getXById` helpers have, so
 * a malformed id in a URL is a null rather than a Postgres error.
 */
export async function getMessageById(id: string): Promise<ContactMessage | null> {
  if (!isSupabaseConfigured()) return null
  if (!isUuid(id)) return null

  const supabase = await requireClient()
  const { data, error } = await supabase.from('contact_messages').select('*').eq('id', id).limit(1)

  if (error) {
    console.error('[db] failed to fetch contact message by id:', error.message)
    return null
  }

  return (data as ContactMessage[])[0] ?? null
}