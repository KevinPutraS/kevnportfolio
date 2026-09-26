'use client'

import { forwardRef, useId, type TextareaHTMLAttributes } from 'react'
import { classNames } from '@/lib/utils/helpers'
import { FieldShell, describedByFor } from './field'

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  id?: string
  label: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, label, error, hint, id, required, rows, ...props },
  ref
) {
  const generatedId = useId()
  const textareaId = id ?? generatedId

  return (
    <FieldShell label={label} labelHtmlFor={textareaId} error={error} hint={hint} required={required}>
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows ?? 8}
        className={classNames('textarea', className)}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedByFor(textareaId, Boolean(error), Boolean(hint))}
        required={required}
        {...props}
      />
    </FieldShell>
  )
})
