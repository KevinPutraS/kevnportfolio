'use client'

import { forwardRef, useId, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { classNames } from '@/lib/utils/helpers'
import { FieldShell, describedByFor } from './field'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'children'> {
  id?: string
  label: string
  error?: string
  hint?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, label, error, hint, id, options, placeholder, required, ...props },
  ref
) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const describedBy = describedByFor(selectId, Boolean(error), Boolean(hint))

  return (
    <FieldShell label={label} labelHtmlFor={selectId} error={error} hint={hint} required={required}>
      {/*
        The chevron is a positioned sibling rather than a `bg-[url(data:...)]`
        arbitrary value: the inline SVG data URI was fragile, unthemeable and
        broke whenever the URL needed escaping.
      */}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={classNames('input appearance-none pr-10', className)}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          required={required}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--text-muted))]"
          aria-hidden="true"
        />
      </div>
    </FieldShell>
  )
})
