'use client'

import { forwardRef, LabelHTMLAttributes, InputHTMLAttributes } from 'react'
import { classNames } from '@/lib/utils/helpers'

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const checkboxId = id || label.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          className={classNames(
            'mt-1 h-4 w-4 rounded border-[rgb(var(--border))] text-[rgb(var(--accent))] focus:ring-2 focus:ring-[rgb(var(--accent))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--background))]',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        />
        <label htmlFor={checkboxId} className="text-sm text-[rgb(var(--text-secondary))] cursor-pointer select-none">
          {label}
        </label>
        {error && (
          <p className="mt-1.5 text-sm text-[rgb(var(--error))]" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'