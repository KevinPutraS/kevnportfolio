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
 *
 * Description and error share one permanently mounted region, for the reason
 * `FieldShell` does the same: a `role="alert"` that appears at the same moment as
 * its text is announcing into a region that did not exist a moment earlier, which
 * is the one case live regions do not cover. One node means one id, so
 * `aria-describedby` does not change when validation runs either. It collapses
 * to nothing when there is nothing to say — `empty:` rather than `hidden`,
 * because `display: none` removes the node from the accessibility tree.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { className, label, description, error, id, ...props },
  ref
) {
  const generatedId = useId()
  const checkboxId = id ?? generatedId
  const messageId = `${checkboxId}-description`
  const message = error ?? description

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
          aria-describedby={message ? messageId : undefined}
          {...props}
        />
        <div className="min-w-0">
          <label htmlFor={checkboxId} className="cursor-pointer text-sm text-[rgb(var(--text-primary))]">
            {label}
          </label>
        </div>
      </div>
      <p
        id={messageId}
        role="alert"
        className={classNames(
          // Both variants sit under the label, indented by the box and the gap
          // (16px + 12px = `ml-7`), which is where each of them used to be — the
          // description inside the label's column, the error below the row.
          error ? 'field-error ml-7' : 'ml-7 mt-0.5 text-sm text-[rgb(var(--text-muted))]',
          !message && 'empty:mt-0 empty:ml-0'
        )}
      >
        {message || null}
      </p>
    </div>
  )
})
