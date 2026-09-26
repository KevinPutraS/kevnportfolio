'use client'

import { forwardRef, useId, type InputHTMLAttributes } from 'react'
import { classNames } from '@/lib/utils/helpers'
import { FieldShell, describedByFor } from './field'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id?: string
  label: string
  error?: string
  hint?: string
}

/**
 * Invalid state is driven by `aria-invalid` in `globals.css` rather than a
 * separate border utility class, so markup and styling cannot disagree.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, error, hint, id, required, ...props },
  ref
) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <FieldShell label={label} labelHtmlFor={inputId} error={error} hint={hint} required={required}>
      <input
        ref={ref}
        id={inputId}
        className={classNames('input', className)}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedByFor(inputId, Boolean(error), Boolean(hint))}
        required={required}
        {...props}
      />
    </FieldShell>
  )
})
