import Link from 'next/link'
import { projectCategories, type ProjectCategoryFilter } from '@/config/site'
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
 * as an index instead, and the only thing that changes state is the type colour
 * and a small marker.
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
      <ul className="-mx-5 flex items-center gap-4 overflow-x-auto px-5 scrollbar-hide sm:mx-0 sm:flex-wrap sm:gap-x-6 sm:overflow-visible sm:px-0">
        {entries.map((option, index) => {
          const isActive = option.value === active

          return (
            <li key={option.value} className="flex shrink-0 items-center gap-4 sm:gap-6">
              {index > 0 && (
                <span aria-hidden="true" className="hidden h-3 w-px bg-[rgb(var(--border-subtle))] sm:block" />
              )}

              <Link
                href={option.value === 'all' ? '/projects' : `/projects?category=${option.value}`}
                scroll={false}
                aria-current={isActive ? 'true' : undefined}
                className={classNames(
                  'group inline-flex items-center gap-2 whitespace-nowrap font-mono text-[0.6875rem] uppercase tracking-[0.16em] transition-colors duration-150',
                  isActive
                    ? 'text-[rgb(var(--text-primary))]'
                    : 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-secondary))]'
                )}
              >
                {/*
                  The active marker. One small accent square, and the only
                  accent on the page outside a single CTA.
                */}
                <span
                  aria-hidden="true"
                  className={classNames(
                    'h-1.5 w-1.5 shrink-0 transition-colors duration-150',
                    isActive
                      ? 'bg-[rgb(var(--accent))]'
                      : 'bg-[rgb(var(--border))] group-hover:bg-[rgb(var(--text-muted))]'
                  )}
                />
                {option.label}
                {option.count !== undefined && (
                  <span className="tabular-nums opacity-50">{String(option.count).padStart(2, '0')}</span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>

      {/* Edge fade, mobile only — the line scrolls but does not look cut off. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 -right-5 w-12 bg-gradient-to-l from-[rgb(var(--background))] to-transparent sm:hidden"
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
