import type { HTMLAttributes } from 'react'
import { classNames } from '@/lib/utils/helpers'

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error'

const VARIANTS: Record<BadgeVariant, string> = {
  primary: 'badge-primary',
  secondary: 'badge-secondary',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

/**
 * Status pill. Deliberately square-cornered to match the editorial panel
 * language instead of the rounded-pill look of a typical template.
 */
export function Badge({ className, variant = 'secondary', ...props }: BadgeProps) {
  return <span className={classNames(VARIANTS[variant], className)} {...props} />
}
