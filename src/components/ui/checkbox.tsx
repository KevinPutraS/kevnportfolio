'use client'

import { forwardRef, useId, type InputHTMLAttributes } from 'react'
import { classNames } from '@/lib/utils/helpers'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
  id?: string
  label: string
  description?: string
  error?: string
}

/**
 * The error message is rendered outside the `flex` row: previously it was a
 * third flex child, so it sat inline next to the label instead of underneath.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { className, label, description, error, id, ...props },
  ref
) {
  const generatedId = useId()
  const checkboxId = id ?? generatedId
  const descriptionId = `${checkboxId}-description`
  const errorId = `${checkboxId}-error`

  return (
    <div className="w-full">
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          className={classNames(
            'mt-0.5 h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-sm border border-[rgb(var(--border))] bg-[rgb(var(--surface))] transition-colors checked:border-[rgb(var(--accent))] checked:bg-[rgb(var(--accent))] hover:not(:disabled):border-[rgb(var(--text-muted))] disabled:cursor-not-allowed disabled:opacity-50',
            "checked:bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%2308090D' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3.5 8.5l3 3 6-6'/%3E%3C/svg%3E\")] checked:bg-center checked:bg-no-repeat",
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : description ? descriptionId : undefined}
          {...props}
        />
        <div className="min-w-0">
          <label htmlFor={checkboxId} className="cursor-pointer text-sm text-[rgb(var(--text-primary))]">
            {label}
          </label>
          {description && !error && (
            <p id={descriptionId} className="mt-0.5 text-sm text-[rgb(var(--text-muted))]">
              {description}
            </p>
          )}
        </div>
      </div>
      {error && (
        <p id={errorId} className="field-error ml-7" role="alert">
          {error}
        </p>
      )}
    </div>
  )
})
