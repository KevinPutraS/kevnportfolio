import type { Metadata } from 'next'
import { getMessagesForAdmin, getUnreadMessageCount } from '@/lib/db/messages'
import { MessageInbox } from '@/components/admin/message-inbox'
import { EmptyState } from '@/components/ui/empty-state'
import { Inbox } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Inbox',
  robots: { index: false, follow: false },
}

export default async function AdminMessagesPage() {
  /*
   * Two round trips, on purpose: the list is capped at 200 rows but the unread
   * count is exact, so a badge derived from the list would quietly cap too.
   */
  const [messages, unread] = await Promise.all([getMessagesForAdmin(), getUnreadMessageCount()])

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow">Contact</p>
        <h1 className="heading-2 mt-3">Inbox</h1>
        <p className="mt-3 text-[rgb(var(--text-secondary))]">
          {messages.length} {messages.length === 1 ? 'message' : 'messages'}
          {unread > 0 ? ` · ${unread} unread` : ''}.
        </p>
      </header>

      {messages.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-8 w-8" aria-hidden="true" />}
          title="No messages yet"
          description="Submissions from the contact form land here. Nothing to read so far."
        />
      ) : (
        <MessageInbox messages={messages.map((message) => ({ ...message, title: message.subject }))} />
      )}
    </div>
  )
}