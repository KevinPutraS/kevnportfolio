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
  /** Accent hue for the eyebrow, as a `section-tone-*` class. */
  tone?: string
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
 * On a phone the order is title, lede, meta, then action: the heading and the
 * one-sentence answer are what a visitor needs in the first screen, and the
 * action is the last thing they need. The action becomes a full-width button so
 * it is a comfortable target rather than a small link under a paragraph.
 *
 * The title moved from `.h1` to `.display-1` in the redesign. At 4.25rem an
 * inner page opened with something smaller than the homepage's supporting copy
 * read as, and every route below `/` looked like a settings screen rather than a
 * page of the same publication. The cap is 14ch, because at the display scale
 * the previous 18ch produced four words a line.
 */
export function PageHeader({
  eyebrow,
  title,
  lede,
  action,
  meta,
  tone = 'section-tone-web',
  className,
}: PageHeaderProps) {
  return (
    <header className={classNames('relative', tone, className)}>
      {/*
        The hairline is inside the container, not full-bleed. It was an absolutely
        positioned 2px accent gradient spanning the viewport, which put a coloured
        edge above every page; as a 1px `--border` rule aligned to the text column
        it reads as the top of the page rather than as a banner above it.
      */}
      <div className="container-custom">
        <div aria-hidden="true" className="section-rule" />
      </div>

      <div className="container-custom pt-12 sm:pt-16 lg:pt-20">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-7">
            <p className="section-eyebrow">{eyebrow}</p>
            {/*
              `.display-1` rather than `.page-header-title`, which set a margin and
              a max width but no `font-size` at all — so every page using that
              class rendered its `<h1>` at the browser default of 2em in the body
              typeface, indistinguishable from body copy at a glance.
            */}
            <h1 className="display-1 mt-6 max-w-[14ch] text-balance sm:mt-7">{title}</h1>
          </div>

          {action && (
            <div className="lg:col-span-5 lg:justify-self-end lg:pb-1">{action}</div>
          )}
        </div>

        <div className="mt-8 grid gap-5 border-t border-[rgb(var(--border))] pt-7 sm:mt-10 sm:pt-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <p className="lead max-w-[58ch] text-pretty text-[rgb(var(--text-dim))]">{lede}</p>
          </div>
          {meta && (
            <div className="lg:col-span-5 lg:justify-self-end lg:pt-1 lg:text-right">{meta}</div>
          )}
        </div>
      </div>
    </header>
  )
}
