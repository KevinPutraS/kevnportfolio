import Link from 'next/link'
import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { classNames } from '@/lib/utils/helpers'
import { buttonStyles, type ButtonSize, type ButtonVariant } from './button-styles'

interface ButtonLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string
  variant?: ButtonVariant
  size?: ButtonSize
  /** Renders a real `<a>` for external/off-site destinations. */
  external?: boolean
  children: ReactNode
}

function content(children: ReactNode, external?: boolean) {
  return (
    <>
      {children}
      {external && (
        <svg
          className="h-3.5 w-3.5 shrink-0 opacity-70"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M7 17 17 7M9 7h8v8" />
        </svg>
      )}
    </>
  )
}

/**
 * Link styled as a button.
 *
 * This exists because the previous implementation reused the raw `.btn` CSS
 * class, which hard-coded `w-full` and therefore stretched every link button to
 * the full width of its parent.
 */
export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  external,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  const classes = buttonStyles({ variant, size, className })

  if (external || /^(https?:|mailto:)/.test(href)) {
    return (
      <a href={href} className={classes} rel="noopener noreferrer" target="_blank" {...props}>
        {content(children, true)}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    )
  }

  return (
    <Link href={href} className={classes} {...props}>
      {content(children, false)}
    </Link>
  )
}
