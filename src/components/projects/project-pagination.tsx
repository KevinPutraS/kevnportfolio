import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { classNames } from '@/lib/utils/helpers'
import type { ProjectCategoryFilter } from '@/config/site'

/**
 * The canonical URL for a page of results.
 *
 * One builder, used by the paginator and by the page's out-of-range redirect, so
 * "page 3 of the web filter" can never be spelled two different ways — a
 * mismatch would produce a link the redirect then immediately bounces.
 *
 * `page = 1` omits the parameter entirely, so the first page of every view is
 * the clean URL a visitor would type or share.
 */
export function projectsHref({
  category,
  page,
}: {
  category: ProjectCategoryFilter
  page: number
}): string {
  const params = new URLSearchParams()
  if (category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `/projects?${query}` : '/projects'
}

/**
 * Result pagination for the projects index.
 *
 * The index is a grid, not a rail, and that is deliberate: a grid can be scanned
 * in a single pass, a rail hides everything past the first swipe, and a page
 * whose job is "show me everything, filtered" should not require a gesture to
 * reveal the next item. The rail lives on the homepage, where the section is a
 * sample of the work rather than the whole of it.
 *
 * So the length of this page is bounded a different way — by page size and real
 * pagination. Nine per page is three rows of three on a desktop, which is the
 * most anyone will scroll in one go, and it leaves the number of pages small
 * enough to show as a row of figures.
 *
 * Those figures are links, not buttons, so a page is bookmarkable, shareable and
 * works with JavaScript disabled, and the category filter is carried through
 * every href — otherwise "page 3" of a filtered view would silently drop the
 * filter and show unrelated work.
 */
export function ProjectPagination({
  page,
  totalPages,
  category,
}: {
  page: number
  totalPages: number
  category: ProjectCategoryFilter
}) {
  if (totalPages <= 1) return null

  const href = (target: number) => projectsHref({ category, page: target })

  return (
    <nav
      aria-label="Pagination"
      className="mt-16 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-[rgb(var(--border))] pt-8"
    >
      <PageLink
        href={href(page - 1)}
        disabled={page <= 1}
        rel="prev"
        icon={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}
      >
        Previous
      </PageLink>

      {/*
        A short page count is shown in full; a long one is windowed with
        ellipses, because a row of thirty figures is worse than no row at all.
      */}
      <ol className="order-last flex w-full items-center justify-center gap-1 sm:order-none sm:w-auto">
        {pageWindow(page, totalPages).map((entry, index) =>
          entry === null ? (
            <li
              key={`gap-${index}`}
              aria-hidden="true"
              className="px-1 text-[length:var(--text-sm)] text-[rgb(var(--text-muted))]"
            >
              …
            </li>
          ) : (
            <li key={entry}>
              <Link
                href={href(entry)}
                aria-current={entry === page ? 'page' : undefined}
                aria-label={`Page ${entry}${entry === page ? ', current page' : ''}`}
                className={classNames(
                  'inline-flex h-9 min-w-9 items-center justify-center rounded-[var(--radius-sm)] px-2 text-[length:var(--text-sm)] tabular-nums transition-colors duration-200',
                  entry === page
                    ? 'bg-[rgb(var(--accent-bg))] font-semibold text-[rgb(var(--accent))]'
                    : 'text-[rgb(var(--text-dim))] hover:bg-[rgb(var(--bg-highlight))] hover:text-[rgb(var(--text))]'
                )}
              >
                {entry}
              </Link>
            </li>
          )
        )}
      </ol>

      <PageLink
        href={href(page + 1)}
        disabled={page >= totalPages}
        rel="next"
        iconAfter={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
      >
        Next
      </PageLink>
    </nav>
  )
}

/** Page numbers to render, with `null` marking an ellipsis. */
function pageWindow(page: number, totalPages: number): Array<number | null> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1)

  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1])
  const sorted = [...pages].filter((value) => value >= 1 && value <= totalPages).sort((a, b) => a - b)

  return sorted.reduce<Array<number | null>>((result, value, index) => {
    if (index > 0 && value - (sorted[index - 1] as number) > 1) result.push(null)
    result.push(value)
    return result
  }, [])
}

function PageLink({
  href,
  disabled,
  rel,
  children,
  icon,
  iconAfter,
}: {
  href: string
  disabled: boolean
  rel: 'prev' | 'next'
  children: React.ReactNode
  icon?: React.ReactNode
  iconAfter?: React.ReactNode
}) {
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className="inline-flex min-h-9 items-center gap-1.5 px-1 text-[length:var(--text-sm)] font-medium text-[rgb(var(--text-muted))] opacity-40"
      >
        {icon}
        {children}
      </span>
    )
  }

  return (
    <Link
      href={href}
      rel={rel}
      className="inline-flex min-h-9 items-center gap-1.5 px-1 text-[length:var(--text-sm)] font-medium text-[rgb(var(--text))] transition-colors duration-200 hover:text-[rgb(var(--accent))]"
    >
      {icon}
      {children}
      {iconAfter}
    </Link>
  )
}
