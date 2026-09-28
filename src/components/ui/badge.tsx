import type { HTMLAttributes } from 'react'
import { classNames } from '@/lib/utils/helpers'

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'neutral'

const VARIANTS: Record<BadgeVariant, string> = {
  primary: 'badge-primary',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  neutral: 'badge-neutral',
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

/**
 * Status pill. The `badge` base is always included because it carries the
 * padding, radius and type size — a variant class on its own is only colours.
 */
export function Badge({ className, variant = 'neutral', ...props }: BadgeProps) {
  return <span className={classNames('badge', VARIANTS[variant], className)} {...props} />
}
