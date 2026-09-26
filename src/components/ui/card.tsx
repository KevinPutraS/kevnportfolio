import type { HTMLAttributes } from 'react'
import { classNames } from '@/lib/utils/helpers'

export type CardVariant = 'default' | 'hover' | 'elevated'

const VARIANTS: Record<CardVariant, string> = {
  default: 'card',
  hover: 'card-hover',
  elevated: 'card border-[rgb(var(--border))] bg-[rgb(var(--surface-elevated))]',
}

/** Square-cornered hairline panel. No client boundary: safe in Server Components. */
export function Card({ className, variant = 'default', ...props }: HTMLAttributes<HTMLDivElement> & { variant?: CardVariant }) {
  return <div className={classNames(VARIANTS[variant], className)} {...props} />
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={classNames('px-5 pt-5 sm:px-6 sm:pt-6', className)} {...props} />
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={classNames('p-5 sm:p-6', className)} {...props} />
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={classNames(
        'flex items-center border-t border-[rgb(var(--border-subtle))] px-5 py-4 sm:px-6',
        className
      )}
      {...props}
    />
  )
}
