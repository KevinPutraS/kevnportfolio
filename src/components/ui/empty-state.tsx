import type { ReactNode } from 'react'
import { classNames } from '@/lib/utils/helpers'

export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

/**
 * Shared empty state so "nothing published yet" and "nothing matches this
 * filter" look intentional instead of broken.
 */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={classNames(
        'flex flex-col items-center justify-center border border-dashed border-[rgb(var(--border))] px-6 py-16 text-center',
        className
      )}
    >
      {icon && <div className="mb-4 text-[rgb(var(--text-muted))]">{icon}</div>}
      <h3 className="heading-4">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-[rgb(var(--text-secondary))]">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
