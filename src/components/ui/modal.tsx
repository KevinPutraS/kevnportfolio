'use client'

import { useId, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { classNames } from '@/lib/utils/helpers'
import { useFocusTrap } from '@/lib/hooks/use-focus-trap'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  className?: string
}

/**
 * Confirmation dialog.
 *
 * Presented as a **bottom sheet on a phone** and a centred dialog from `sm`
 * up. That is not decoration: a centred dialog on a 390px screen has to leave
 * space above and below it, so the buttons land in the middle of the viewport
 * with the message scrolled off the top and the sheet's own edges cut off by
 * the safe area. Anchoring to the bottom instead puts the title where it is
 * read first and the actions directly under the thumb, and it matches the
 * gesture people already expect from a phone.
 *
 * Rendered through a portal so it is never clipped by a `transform`,
 * `filter` or `backdrop-filter` on an ancestor — the sticky header carries a
 * backdrop blur, which establishes a containing block for `position: fixed`
 * descendants and would otherwise trap the dialog inside a 64px strip.
 *
 * Focus is trapped while open, Escape closes, and `body` scroll is locked by
 * `useFocusTrap`. The panel is unmounted when closed, so its buttons are not
 * reachable by Tab.
 *
 * Destructive styling is not a prop here. A `tone="danger"` variant was declared
 * and documented as swapping the confirm/cancel pair for a single full-width
 * action, but the dialog cannot do that — it does not own the buttons, so the
 * behaviour never existed and the prop did nothing. Callers express it the way
 * that is actually visible: `Button variant="danger"` on the confirming action,
 * with Cancel first in the DOM and marked `data-modal-initial`.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: ModalProps) {
  const titleId = useId()
  const descriptionId = useId()
  // Focus lands on the first button in the panel, which callers order so that
  // the safe action comes first. See the `data-modal-initial` marker below.
  const containerRef = useFocusTrap<HTMLDivElement>(isOpen, onClose, '[data-modal-initial]')

  if (!isOpen || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="animate-fade-in absolute inset-0 bg-[rgb(0_0_0/0.7)] backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={classNames(
          'animate-sheet-up relative w-full max-w-lg rounded-t-[var(--radius-2xl)] border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] p-5 shadow-[0_-20px_60px_-20px_rgb(0_0_0/0.9)] focus:outline-none sm:animate-scale-in sm:rounded-[var(--radius-2xl)] sm:p-6',
          className
        )}
      >
        {/*
          Drag affordance. Presentational only — this is a dialog, not a
          swipeable surface, so it must not imply an interaction that does not
          exist. Visible on the phone layout where the sheet reads as a sheet.
        */}
        <div
          aria-hidden="true"
          className="mx-auto mb-4 h-1 w-10 rounded-full bg-[rgb(var(--border-strong))] sm:hidden"
        />

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="font-display text-lg font-bold tracking-[-0.02em] text-[rgb(var(--text))]"
            >
              {title}
            </h2>
            {description && (
              <p
                id={descriptionId}
                className="mt-2 text-pretty text-[length:var(--text-sm)] leading-relaxed text-[rgb(var(--text-dim))]"
              >
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1.5 -mt-1.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[rgb(var(--text-muted))] transition-colors hover:bg-[rgb(var(--bg-highlight))] hover:text-[rgb(var(--text))]"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Safe-area padding so the last button clears the iOS home indicator. */}
        <div className="mt-6 overscroll-contain pb-[env(safe-area-inset-bottom)]">{children}</div>
      </div>
    </div>,
    document.body
  )
}
