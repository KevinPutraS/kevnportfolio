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
 *
 * **Two shapes, on purpose.** An action button (`label`) and a toggle button
 * (`toggle`) are different ARIA shapes and cannot share one prop. A toggle has to
 * carry `aria-pressed`, and `aria-pressed` states the *state*; so does the
 * accessible name. Passing "Unpublish Atlas" as the name next to
 * `aria-pressed={true}` announced "Unpublish Atlas, toggle button, pressed" — the
 * label claiming one thing and the state claiming the opposite, from five call
 * sites at once.
 *
 * So the toggle's `name` is the subject and must not change with the state:
 * `Published: Atlas UI` announces "Published: Atlas UI, toggle button, pressed"
 * when it is live and "… not pressed" when it is not. That is the ARIA Authoring
 * Practices toggle pattern, and it means there is no prop combination left that
 * can put an action label next to a state.
 *
 * **Size.** This was a fixed `h-8 w-8` — 32px — at every viewport. That is a
 * fine pointer target on a desktop monitor and roughly a third of the size of a
 * fingertip on a phone, and these tables are the main way content gets edited
 * on mobile. It is 40px below `sm` and 34px above, where a mouse makes 34px
 * unambiguous and a phone would only be adding empty space to a dense row.
 * `.tap`-style growth is not applied here on purpose: the buttons sit in a
 * flex row, so padding them out would push the row's other actions off screen.
 */
type RowActionProps = {
  busy: boolean
  onClick: () => void
  danger?: boolean
  children: ReactNode
} & (
  | {
      /** Accessible name for a plain action, phrased as what pressing does. */
      label: string
      toggle?: never
    }
  | {
      /**
       * A toggle's state. `name` is the *subject* and stays the same in both
       * states; `pressed` carries the state.
       */
      toggle: { name: string; pressed: boolean }
      label?: never
    }
)

export function RowAction({ busy, onClick, label, toggle, danger, children }: RowActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-label={toggle ? toggle.name : label}
      aria-pressed={toggle ? toggle.pressed : undefined}
      className={classNames(
        'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:h-[34px] sm:w-[34px]',
        toggle?.pressed
          ? 'border-[rgb(var(--accent)/0.5)] bg-[rgb(var(--accent)/0.12)] text-[rgb(var(--accent))]'
          : 'border-[rgb(var(--border))] text-[rgb(var(--text-dim))] hover:border-[rgb(var(--border-strong))] hover:bg-[rgb(var(--bg-highlight))] hover:text-[rgb(var(--text))]',
        danger &&
          'hover:border-[rgb(var(--error))] hover:bg-[rgb(var(--error)/0.12)] hover:text-[rgb(var(--error))]'
      )}
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        children
      )}
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
        // Kept in the layout rather than removed when empty. An `aria-live`
        // region that is added to the DOM at the same moment it receives text
        // is frequently not announced at all, because the live region has to
        // already exist when the change happens for the change to be observed.
        !message && 'sr-only border-transparent',
        message?.tone === 'error' &&
          'border-[rgb(var(--error)/0.4)] bg-[rgb(var(--error)/0.05)] text-[rgb(var(--error))]',
        message?.tone === 'success' &&
          'border-[rgb(var(--success)/0.4)] bg-[rgb(var(--success)/0.05)] text-[rgb(var(--success))]'
      )}
    >
      {message?.text}
    </p>
  )
}

export type ActionMessageState = { tone: 'error' | 'success'; text: string } | null
