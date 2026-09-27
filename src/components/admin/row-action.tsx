'use client'

import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { classNames } from '@/lib/utils/helpers'

/**
 * The square icon button used for every inline table action.
 *
 * Extracted because each CMS table needed identical markup, and the previous
 * copies had drifted: one of them lost the `disabled` state and let a second
 * click fire a duplicate request while the first was still in flight.
 */
export function RowAction({
  busy,
  onClick,
  label,
  pressed,
  danger,
  children,
}: {
  busy: boolean
  onClick: () => void
  label: string
  /** Renders the button as a toggle and exposes it to assistive tech. */
  pressed?: boolean
  danger?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-label={label}
      aria-pressed={pressed}
      className={classNames(
        'inline-flex h-8 w-8 items-center justify-center border border-[rgb(var(--border-subtle))] transition-colors disabled:opacity-50',
        pressed
          ? 'border-[rgb(var(--accent))]/50 text-[rgb(var(--accent))]'
          : 'text-[rgb(var(--text-secondary))] hover:border-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))]',
        danger && 'hover:border-[rgb(var(--error))] hover:text-[rgb(var(--error))]'
      )}
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : children}
    </button>
  )
}

/**
 * A single live region for every action result in a table.
 *
 * One region per table, rather than one per row, so a screen reader announces a
 * change once instead of interleaving with the row it happened in.
 */
export function ActionMessage({
  message,
  className,
}: {
  message: { tone: 'error' | 'success'; text: string } | null
  className?: string
}) {
  return (
    <p
      role="status"
      aria-live="polite"
      className={classNames(
        'mb-4 border p-3 text-sm',
        className,
        !message && 'sr-only border-transparent',
        message?.tone === 'error' && 'border-[rgb(var(--error))]/40 bg-[rgb(var(--error))]/5',
        message?.tone === 'success' && 'border-[rgb(var(--success))]/40 bg-[rgb(var(--success))]/5'
      )}
    >
      {message?.text}
    </p>
  )
}

export type ActionMessageState = { tone: 'error' | 'success'; text: string } | null
