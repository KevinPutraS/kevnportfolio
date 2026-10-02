'use client'

import { Mail, MailOpen, Reply, Trash2 } from 'lucide-react'
import { classNames, formatDate } from '@/lib/utils/helpers'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { ActionMessage, RowAction } from '@/components/admin/row-action'
import { useRowActions, type RowToggle } from '@/lib/hooks/use-row-actions'
import type { ContactMessageRow } from '@/types/message'

const TOGGLES: readonly RowToggle<ContactMessageRow>[] = [
  {
    // `describe` receives the row as it was before the flip, so it has to name
    // the state being moved *into* — same shape as the publish switches.
    field: 'is_read',
    describe: (row) =>
      `The message from ${row.name} is now ${row.is_read ? 'unread' : 'read'}.`,
  },
]

/**
 * Builds the `mailto:` for the reply button.
 *
 * A link rather than a form: replying from the CMS would mean storing the
 * visitor's reply text somewhere, and the whole point of this table is that the
 * inbox stays a record of what arrived. Handing the thread to the mail client
 * also means the reply is threaded properly in the visitor's own mail.
 *
 * The subject is encoded because it is user input — an unencoded `?` or `#` in a
 * subject line would otherwise truncate the mailto into a different, valid-looking
 * link.
 */
function replyHref(message: ContactMessageRow): string {
  return `mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`
}

/**
 * The contact inbox.
 *
 * A list rather than a table, on purpose. The three things that matter — who
 * wrote, what it was about, and what they actually said — are a paragraph, not
 * three columns, and a table cell that wraps to six lines is worse than a card.
 * It also means the body is always visible rather than behind a click: an inbox
 * you have to expand to read is an inbox you read twice.
 *
 * Unread state is carried by a dot, a tinted background and the sender's weight,
 * never by colour alone. No left border is added when a message becomes unread,
 * because a 2px border appearing on one card and not its siblings reflows the
 * row and makes the toggle feel like it moved something.
 */
export function MessageInbox({ messages }: { messages: ContactMessageRow[] }) {
  const actions = useRowActions<ContactMessageRow>({
    endpoint: '/api/admin/messages',
    noun: 'message',
    toggles: TOGGLES,
  })

  return (
    <>
      <ActionMessage message={actions.message} />

      {actions.isRefreshing && (
        <p className="sr-only" aria-live="polite">
          Refreshing messages
        </p>
      )}

      <ul className="overflow-hidden rounded-xl border border-[rgb(var(--border))]">
        {messages.map((message) => {
          const isBusy = actions.busyId === message.id
          const unread = !message.is_read

          return (
            <li
              key={message.id}
              className={classNames(
                'border-b border-[rgb(var(--border))] px-4 py-4 transition-colors last:border-b-0 sm:px-5',
                unread ? 'bg-[rgb(var(--accent)/0.04)]' : 'bg-transparent',
                isBusy && 'opacity-60'
              )}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="flex items-baseline gap-2">
                  {/*
                    Decorative: the row's own background and the "Unread" caption
                    carry the state for anyone who cannot see the dot.
                  */}
                  <span
                    aria-hidden="true"
                    className={classNames(
                      'inline-block h-2 w-2 shrink-0 rounded-full',
                      unread
                        ? 'bg-[rgb(var(--accent))]'
                        : 'bg-transparent'
                    )}
                  />
                  <span className={classNames('text-sm', unread ? 'font-semibold' : 'font-medium')}>
                    {message.name}
                  </span>
                  <a
                    href={`mailto:${message.email}`}
                    className="break-all font-mono text-xs text-[rgb(var(--text-muted))] underline decoration-dotted underline-offset-2 hover:text-[rgb(var(--text))]"
                  >
                    {message.email}
                  </a>
                </p>

                <time
                  dateTime={message.created_at}
                  className="ml-4 shrink-0 font-mono text-xs text-[rgb(var(--text-muted))]"
                >
                  {formatDate(message.created_at)}
                </time>
              </div>

              <h2 className="mt-2 text-sm font-medium">{message.subject}</h2>

              {unread && <span className="caption mt-1 text-[rgb(var(--accent))]">Unread</span>}

              <p className="mt-2 whitespace-pre-wrap break-words text-sm text-[rgb(var(--text-secondary))]">
                {message.message}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <RowAction
                  busy={isBusy}
                  onClick={() => actions.toggle(message, 'is_read')}
                  toggle={{ name: `Read: ${message.subject}`, pressed: message.is_read }}
                >
                  {message.is_read ? (
                    <MailOpen className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Mail className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span className="sr-only">
                    {message.is_read ? 'Mark as unread' : 'Mark as read'}
                  </span>
                </RowAction>

                <a
                  href={replyHref(message)}
                  className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[var(--radius-md)] border border-[rgb(var(--border))] px-3 text-xs text-[rgb(var(--text-dim))] transition-colors hover:border-[rgb(var(--border-strong))] hover:bg-[rgb(var(--bg-highlight))] hover:text-[rgb(var(--text))] sm:h-[34px]"
                >
                  <Reply className="h-3.5 w-3.5" aria-hidden="true" />
                  Reply
                </a>

                <RowAction
                  busy={isBusy}
                  onClick={() => actions.requestDelete(message)}
                  label={`Delete the message from ${message.name}`}
                  danger
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="sr-only">Delete</span>
                </RowAction>
              </div>
            </li>
          )
        })}
      </ul>

      <Modal
        isOpen={actions.pendingDelete !== null}
        onClose={actions.cancelDelete}
        title="Delete message"
        description={
          actions.pendingDelete
            ? `The message from ${actions.pendingDelete.name} will be permanently removed. There is no trash.`
            : undefined
        }
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          {/* `data-modal-initial` puts focus on Cancel the moment this opens. */}
          <Button type="button" variant="ghost" data-modal-initial onClick={actions.cancelDelete}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            loading={actions.busyId === actions.pendingDelete?.id}
            onClick={actions.confirmDelete}
          >
            Delete message
          </Button>
        </div>
      </Modal>
    </>
  )
}