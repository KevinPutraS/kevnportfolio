'use client'

import type { ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import { classNames } from '@/lib/utils/helpers'

interface FieldShellProps {
  label: string
  labelHtmlFor: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
  children: ReactNode
}

/**
 * Shared label / control / error / hint wrapper.
 *
 * `input`, `textarea` and `select` all need identical accessibility wiring, so
 * it lives here once instead of being copy-pasted into each primitive.
 *
 * The label sits *above* the control on every width. Side-by-side labels fit
 * more fields on a desktop, but on a phone they collapse to a column anyway and
 * the gap makes the control harder to associate with its name at a glance.
 *
 * Errors replace hints in the same slot, so a field's explanatory line never
 * jumps when validation runs, and the error carries an icon rather than relying
 * on red alone to convey that something is wrong.
 *
 * That slot is a **single, permanently mounted element**, and that is the whole
 * point. It used to be three branches — error node, hint node, nothing — so
 * submitting an empty contact form replaced one node with a different node, and
 * the `role="alert"` arrived *with* its text. A live region only announces what
 * appears in a region that already existed: `role="alert"` means "watch this node,
 * then tell me what changed inside it", not "tell me about yourself when you
 * appear". Mounting and announcing together is why client-side validation errors
 * were silent on several screen reader/browser pairings, while the server-side
 * ones — which arrive while the region already exists — did get read out. The
 * trade is a stable `aria-describedby` target: the control now points at one id,
 * and the id has the error or the hint in it depending on the state.
 */
export function FieldShell({
  label,
  labelHtmlFor,
  error,
  hint,
  required,
  className,
  children,
}: FieldShellProps) {
  const message = error ?? hint
  return (
    <div className={classNames('w-full', className)}>
      <label htmlFor={labelHtmlFor} className="label">
        {label}
        {required && (
          <>
            <span className="ml-1 text-[rgb(var(--accent))]" aria-hidden="true">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </label>

      {children}

      {/*
        Always rendered, so it is always a live region. When there is nothing to
        say it collapses to nothing: the span is not rendered either — an element
        holding an empty span is not `:empty`, so the `empty:mt-0` below would
        never match and the `margin-top` on `.field-hint` / `.field-error` would
        leave an 8px gap under every field in the CMS. It is `mt-0` and not
        `hidden` on purpose: `display: none` takes the node out of the
        accessibility tree, which is the very thing being avoided here.
      */}
      <p
        id={`${labelHtmlFor}-description`}
        role="alert"
        className={classNames(error ? 'field-error' : 'field-hint', !message && 'empty:mt-0')}
      >
        {error && <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
        {message && <span>{message}</span>}
      </p>
    </div>
  )
}

/**
 * Id for a control's description, referenced via `aria-describedby`.
 *
 * One id for both states, so the attribute does not have to change when
 * validation runs. It is only attached when there is something to point at;
 * an empty region is not worth naming, and a bare `aria-describedby` on every
 * field is noise in the accessibility tree.
 */
export function describedByFor(controlId: string, hasError: boolean, hasHint: boolean) {
  return hasError || hasHint ? `${controlId}-description` : undefined
}
