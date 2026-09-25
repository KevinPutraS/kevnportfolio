'use client'

import { forwardRef, HTMLAttributes } from 'react'
import { classNames } from '@/lib/utils/helpers'
import { X } from 'lucide-react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  removable?: boolean
  onRemove?: () => void
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'primary', removable, onRemove, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-[rgb(var(--accent))/0.15] text-[rgb(var(--accent-hover))] border border-[rgb(var(--accent))/0.3]',
      secondary: 'bg-[rgb(var(--surface-elevated))] text-[rgb(var(--text-secondary))] border border-[rgb(var(--border))]',
      success: 'bg-green-500/15 text-green-400 border border-green-500/30',
      warning: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
      error: 'bg-red-500/15 text-red-400 border border-red-500/30',
    }

    return (
      <span
        ref={ref}
        className={classNames(
          'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
          variants[variant],
          removable && 'pr-1',
          className
        )}
        {...props}
      >
        {children}
        {removable && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-black/10 transition-colors"
            aria-label="Remove"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        )}
      </span>
    )
  }
)

Badge.displayName = 'Badge'