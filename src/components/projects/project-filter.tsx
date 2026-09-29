import Link from 'next/link'
import {
  projectCategories,
  categoryColorClass,
  type ProjectCategoryFilter,
} from '@/config/site'
import { classNames } from '@/lib/utils/helpers'

export interface ProjectFilterOption {
  value: ProjectCategoryFilter
  label: string
  count?: number
}

export interface ProjectFilterProps {
  options: ProjectFilterOption[]
  active: ProjectCategoryFilter
}

/**
 * Category filter, set as a contents line rather than a row of chips.
 *
 * The previous version used bordered pills, which is the single most
 * recognisable "filter dropdown" pattern and was the fastest way to make the
 * archive look like an admin table. Running text with hairline dividers reads
 * as an index instead.
 *
 * Type size matters more than the treatment. Filtering is a primary action, so
 * the options sit at 14px in sentence case, matching the header navigation,
 * with a 44px touch target on small screens. At the previous 11px uppercase
 * mono the categories were the hardest thing on the page to read, and a filter
 * you cannot read is a filter you cannot use.
 *
 * Real links, not buttons + client state, so a filtered view stays shareable,
 * bookmarkable and works with JavaScript disabled. On mobile the line scrolls
 * horizontally with a mask on the right edge as the affordance that more
 * categories exist; the dividers are hidden from assistive tech so the list is
 * announced as plain items.
 */
export function ProjectFilter({ options, active }: ProjectFilterProps) {
  const all: ProjectFilterOption = { value: 'all', label: 'All' }
  const entries = [all, ...options]

  return (
    <nav aria-label="Project categories" className="relative">
      {/* `-mx-6` negates the container's 1.5rem gutter so the line runs to the
          screen edge on a phone, which is the only place the category list is
          allowed to break the column. It is deliberately the same value as the
          container padding: the two were 1.25rem and drifted apart once, which
          left the first category 4px out of alignment with the heading above. */}
      <ul className="-mx-6 flex items-center gap-3 overflow-x-auto px-6 scrollbar-hide sm:mx-0 sm:flex-wrap sm:gap-x-6 sm:overflow-visible sm:px-0">
        {entries.map((option, index) => {
          const isActive = option.value === active
          const isEmpty = option.count === 0 && option.value !== 'all'

          return (
            <li
              key={option.value}
              className={classNames(
                'flex shrink-0 items-center gap-3 sm:gap-6',
                option.value !== 'all' ? categoryColorClass(option.value) : ''
              )}
            >
              {index > 0 && (
                <span aria-hidden="true" className="hidden h-4 w-px bg-[rgb(var(--border))] sm:block" />
              )}

              <Link
                href={option.value === 'all' ? '/projects' : `/projects?category=${option.value}`}
                scroll={false}
                aria-current={isActive ? 'true' : undefined}
                className={classNames(
                  // `min-h-11` keeps the tap target at 44px on a phone; the
                  // underline is a separate child rather than a border so it can
                  // animate width without moving the text.
                  'group relative inline-flex min-h-11 items-center gap-2 whitespace-nowrap px-1 py-2 text-[length:var(--text-nav)] font-medium tracking-[-0.01em] transition-colors duration-200',
                  isActive
                    ? 'text-[rgb(var(--cat,var(--text)))]'
                    : 'text-[rgb(var(--text-dim))] hover:text-[rgb(var(--cat,var(--text)))]'
                )}
              >
                {option.value !== 'all' && (
                  <span
                    aria-hidden="true"
                    className={classNames(
                      'h-1.5 w-1.5 rounded-full transition-opacity',
                      isActive ? 'cat-dot opacity-100' : 'cat-dot opacity-40'
                    )}
                  />
                )}
                {option.label}
                {option.count !== undefined && (
                  <span
                    className={classNames(
                      'meta tabular-nums transition-colors',
                      isActive ? 'text-[rgb(var(--cat))]' : 'text-[rgb(var(--text-muted))]'
                    )}
                  >
                    {String(option.count).padStart(2, '0')}
                  </span>
                )}
                {/*
                  The active marker: a 2px bar, matching the header's active
                  navigation item so the two read as the same language.
                */}
                <span
                  aria-hidden="true"
                  className={classNames(
                    'absolute inset-x-0 -bottom-px h-0.5 origin-center transition-all duration-200',
                    isActive
                      ? 'cat-dot scale-x-100'
                      : 'scale-x-0 bg-transparent group-hover:scale-x-100 group-hover:bg-[rgb(var(--border))]'
                  )}
                />
                {/*
                  An empty category stays listed — the bar should never silently
                  omit one — and its `00` count is the visible signal. The
                  screen-reader text spells that out, because "00" alone reads as a
                  number rather than as "there is nothing here".
                */}
                {isEmpty && <span className="sr-only"> (no projects)</span>}
              </Link>
            </li>
          )
        })}
      </ul>

      {/* Edge fade, mobile only — the line scrolls but does not look cut off. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 -right-6 w-12 bg-gradient-to-l from-[rgb(var(--background))] to-transparent sm:hidden"
      />
    </nav>
  )
}

/** Every category, so the filter bar never silently omits an empty category. */
export function buildFilterOptions(
  counts: Array<{ category: (typeof projectCategories)[number]['value']; count: number }>
): ProjectFilterOption[] {
  const byCategory = new Map(counts.map((entry) => [entry.category, entry.count]))
  return projectCategories.map((category) => ({
    value: category.value,
    label: category.label,
    count: byCategory.get(category.value) ?? 0,
  }))
}
