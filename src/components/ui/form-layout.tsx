import type { ReactNode } from 'react'
import { classNames } from '@/lib/utils/helpers'

/**
 * Shared scaffolding for the three CMS editors.
 *
 * Both pieces exist because the same two problems appeared in every editor:
 *
 * **1. The save button was below the fold.** Each form is 8–12 fields long. On
 * a 390px-tall phone that is two or three screens of scrolling with the submit
 * button at the very bottom, so every edit meant scrolling to the end just to
 * check whether a save had been offered, then scrolling back up to fix the
 * field you were actually thinking about. `FormStickyActions` pins the pair to
 * the bottom of the viewport on a phone and un-pins it into the normal flow at
 * `sm`, where the whole form usually fits anyway.
 *
 * **2. The sections were only typographic.** An eyebrow and a heading say
 * "Overview" is over there, but with no panel behind it, a single wide column of
 * 11 inputs gives the eye nothing to anchor to — the visible extent of a group
 * is indistinguishable from the next one. `FormSection` gives each group a real
 * surface, so on a phone you can see how much of the form is left without
 * reading it.
 *
 * `id` on a section produces a stable anchor for the in-page jump list, which is
 * the other half of making a long form navigable on a small screen.
 */

export function FormSection({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  id: string
  eyebrow: string
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  const headingId = `${id}-heading`

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={classNames(
        'scroll-mt-24 rounded-[var(--radius-xl)] border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] p-5 sm:p-7',
        className
      )}
    >
      <header className="mb-6">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={headingId} className="heading-4 mt-2">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-[60ch] text-pretty text-[length:var(--text-sm)] leading-relaxed text-[rgb(var(--text-muted))]">
            {description}
          </p>
        )}
      </header>

      <div className="space-y-5">{children}</div>
    </section>
  )
}

/**
 * The save/cancel pair.
 *
 * Sticky below `sm`, inline above it. Two details that are easy to get wrong:
 *
 * - The bar is `sticky`, not `fixed`. `fixed` takes it out of flow entirely, so
 *   the bottom of the form would end up permanently underneath it and the last
 *   field could never be scrolled clear.
 * - The padding clears the iOS home indicator via `env(safe-area-inset-bottom)`,
 *   and the bar is a blurred panel so content scrolling underneath stays
 *   legible rather than colliding with a solid block.
 *
 * The label of the primary action is passed in rather than defaulted to
 * "Save", so it always says what will happen: create vs. save vs. delete.
 */
export function FormStickyActions({
  onCancel,
  cancelLabel = 'Cancel',
  saveLabel,
  isPending,
  className,
}: {
  onCancel: () => void
  cancelLabel?: string
  saveLabel: string
  isPending: boolean
  className?: string
}) {
  return (
    <div
      className={classNames(
        'sticky bottom-0 z-30 -mx-5 mt-2 border-t border-[rgb(var(--border))] bg-[rgb(var(--bg)/0.88)] px-5 backdrop-blur-xl sm:mx-0 sm:rounded-[var(--radius-lg)] sm:border sm:bg-transparent sm:p-0 sm:backdrop-blur-none',
        className
      )}
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center gap-3 pt-4 sm:pt-0">
        {/*
          Reserved slot for the status line. Fixed height so the bar does not
          change size when the pending label appears — a bar that grows by a few
          pixels mid-save shifts everything above it.
        */}
        <p
          className="min-w-0 flex-1 truncate text-[length:var(--text-sm)] text-[rgb(var(--text-muted))]"
          aria-live="polite"
        >
          {isPending ? 'Saving…' : ''}
        </p>

        <button type="button" onClick={onCancel} disabled={isPending} className="btn btn-ghost shrink-0">
          {cancelLabel}
        </button>
        <button type="submit" disabled={isPending} className="btn btn-primary shrink-0">
          {isPending ? 'Saving…' : saveLabel}
        </button>
      </div>
    </div>
  )
}

/**
 * In-page jump list.
 *
 * A long form on a phone is a scroll, and scrolling is how you lose your place.
 * This renders the sections as anchor links so a specific group is one tap away
 * instead of four swipes. Hidden on desktop, where the whole form is visible and
 * the links would just be chrome.
 */
export function FormJumpNav({ items }: { items: ReadonlyArray<{ id: string; label: string }> }) {
  return (
    <nav
      aria-label="Form sections"
      className="-mx-5 mb-6 flex gap-2 overflow-x-auto scrollbar-hide px-5 pb-1 lg:hidden"
    >
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="btn btn-outline btn-sm shrink-0 whitespace-nowrap rounded-[var(--radius-full)]"
        >
          {item.label}
        </a>
      ))}
    </nav>
  )
}
