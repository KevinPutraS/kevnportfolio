import Link from 'next/link'
import { ArrowUpRight, ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { classNames } from '@/lib/utils/helpers'

type ArrowLinkProps = {
  href: string
  children: ReactNode
  /** `up` opens outward (external); `right` reads as forward motion. */
  direction?: 'right' | 'up'
  external?: boolean
  className?: string
}

/**
 * The secondary action: a labelled link with an arrow.
 *
 * This is the restrained counterpart to the filled accent button, used wherever
 * a section needs a "see everything" next step. Two deliberate changes from the
 * version it replaces:
 *
 * 1. It is `body-sm` in sentence case, not 11px uppercase mono. It was sharing
 *    a visual treatment with dates and technology lists, so the one element that
 *    tells a visitor where to go next was the hardest thing on the page to read.
 * 2. The rule under the label is always visible, and the arrow always sits at
 *    full contrast. Both were hover-only, which meant the affordance existed
 *    only for people using a mouse — and requirement is that a link looks
 *    clickable before you touch it.
 */
export function ArrowLink({
  href,
  children,
  direction = 'right',
  external = false,
  className,
}: ArrowLinkProps) {
  const Icon = direction === 'up' ? ArrowUpRight : ArrowRight

  return (
    <Link
      href={href}
      className={classNames(
        'group inline-flex min-h-11 items-center gap-2 py-2 text-[length:var(--text-body-sm)] font-medium text-[rgb(var(--text-primary))] transition-colors duration-150',
        className
      )}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <span className="relative">
        {children}
        <span
          aria-hidden="true"
          className="absolute -bottom-0.5 left-0 h-px w-full bg-[rgb(var(--border))] transition-colors duration-150 group-hover:bg-[rgb(var(--accent))]"
        />
      </span>
      <Icon
        className={classNames(
          'h-4 w-4 shrink-0 text-[rgb(var(--text-secondary))] transition-colors duration-150 group-hover:text-[rgb(var(--accent))]',
          direction === 'up'
            ? 'transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5'
            : 'arrow-shift'
        )}
        aria-hidden="true"
      />
      {external && <span className="sr-only">(opens in a new tab)</span>}
    </Link>
  )
}
