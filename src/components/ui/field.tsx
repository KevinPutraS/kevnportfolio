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

      {error ? (
        <p id={`${labelHtmlFor}-error`} className="field-error" role="alert">
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p id={`${labelHtmlFor}-hint`} className="field-hint">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

/** Id for a control's error/hint description, referenced via aria-describedby. */
export function describedByFor(controlId: string, hasError: boolean, hasHint: boolean) {
  if (hasError) return `${controlId}-error`
  if (hasHint) return `${controlId}-hint`
  return undefined
}
