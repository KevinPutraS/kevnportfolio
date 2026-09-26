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
 * Editorial text action: a label with a rule that grows underneath on hover and
 * an arrow that advances a few pixels.
 *
 * This is the restrained counterpart to the filled accent button. Anywhere a
 * second, equal-priority action is needed, a bordered box would double the
 * visual weight and make the hero look like a dialog. A rule carries the same
 * affordance at a fraction of the noise.
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
        'group inline-flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[rgb(var(--text-secondary))] transition-colors duration-150 hover:text-[rgb(var(--text-primary))]',
        className
      )}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <span className="relative">
        {children}
        <span
          aria-hidden="true"
          className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-100 bg-[rgb(var(--border))] transition-transform duration-250 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:bg-[rgb(var(--accent))]"
        />
      </span>
      <Icon
        className={classNames(
          'h-3.5 w-3.5 shrink-0 text-[rgb(var(--text-muted))] transition-colors duration-150 group-hover:text-[rgb(var(--accent))]',
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
