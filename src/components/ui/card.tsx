'use client'

import { forwardRef, HTMLAttributes } from 'react'
import { classNames } from '@/lib/utils/helpers'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hover' | 'elevated'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'rounded-lg bg-[rgb(var(--surface))] border border-[rgb(var(--border-subtle))]',
      hover: 'rounded-lg bg-[rgb(var(--surface))] border border-[rgb(var(--border-subtle))] transition-all duration-300 hover:border-[rgb(var(--border))] hover:shadow-xl hover:shadow-[rgb(var(--accent))/0.05]',
      elevated: 'rounded-lg bg-[rgb(var(--surface))] border border-[rgb(var(--border))] shadow-lg',
    }

    return (
      <div
        ref={ref}
        className={classNames(variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={classNames('px-6 pt-6 pb-2', className)} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={classNames('px-6 pb-6', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={classNames('flex items-center px-6 py-4 border-t border-[rgb(var(--border-subtle))]', className)} {...props} />
  )
)
CardFooter.displayName = 'CardFooter'