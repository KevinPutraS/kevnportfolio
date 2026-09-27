import type { ReactNode } from 'react'
import { classNames } from '@/lib/utils/helpers'

type PageHeaderProps = {
  /**
   * Names the page, e.g. "Projects". One or two words, not a slogan — the
   * heading below already carries the tone.
   */
  eyebrow: string
  /**
   * The H1. Answers "what is on this page?" in a visitor's own words.
   */
  title: ReactNode
  /**
   * One paragraph saying what the visitor will find here. This is the single
   * highest-value line on the page: it is what lets someone decide whether to
   * keep reading without scrolling.
   */
  lede: ReactNode
  /** Optional next step, rendered to the right of the title on wide screens. */
  action?: ReactNode
  /** Optional count or status line, e.g. "12 projects". */
  meta?: ReactNode
  className?: string
}

/**
 * The shared opening of every public page.
 *
 * Four pages previously invented four different introductions — an `Archive`
 * eyebrow with a manifesto, an "Index" rail, a different metadata slot. The
 * structure was similar but the order was not, so the site never felt like one
 * site. This component fixes the order everywhere:
 *
 *   eyebrow  ->  what page am I on
 *   H1       ->  what is on it
 *   lede     ->  what I will find
 *   meta     ->  how much of it
 *   action   ->  where do I go next
 *
 * The H1 is a real `<h1>` and `title` is passed as children, so each page keeps
 * control of its own wording while the shape stays identical.
 */
export function PageHeader({
  eyebrow,
  title,
  lede,
  action,
  meta,
  className,
}: PageHeaderProps) {
  return (
    <header className={classNames('page-header', className)}>
      <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-10">
        <div className="lg:col-span-8">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="page-header-title">{title}</h1>
        </div>

        {action && (
          <div className="lg:col-span-4 lg:justify-self-end lg:pb-2">{action}</div>
        )}
      </div>

      <div className="mt-8 grid gap-6 border-t border-[rgb(var(--border-subtle))] pt-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <p className="page-header-lede mt-0">{lede}</p>
        </div>
        {meta && <div className="lg:col-span-5 lg:pt-1">{meta}</div>}
      </div>
    </header>
  )
}
