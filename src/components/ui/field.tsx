'use client'

import type { ReactNode } from 'react'
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
          {error}
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
