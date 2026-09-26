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
 * Category filter.
 *
 * Uses real links (not buttons + state) so a filtered view is shareable,
 * bookmarkable, works without JavaScript, and the active item is announced
 * through `aria-current`. The "All" entry is always present, even when a
 * category currently has no projects.
 */
export function ProjectFilter({ options, active }: ProjectFilterProps) {
  const all: ProjectFilterOption = { value: 'all', label: 'All' }

  return (
    <nav aria-label="Project categories">
      <ul className="-mx-5 flex snap-x gap-2 overflow-x-auto px-5 pb-2 scrollbar-hide sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {[all, ...options].map((option) => {
          const isActive = option.value === active
          return (
            <li key={option.value} className="snap-start">
              <Link
                href={option.value === 'all' ? '/projects' : `/projects?category=${option.value}`}
                scroll={false}
                aria-current={isActive ? 'true' : undefined}
                className={classNames(
                  'inline-flex h-9 items-center gap-2 whitespace-nowrap border px-3.5 font-mono text-[0.6875rem] uppercase tracking-[0.12em] transition-colors duration-150',
                  isActive
                    ? 'border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))]'
                    : 'border-[rgb(var(--border-subtle))] text-[rgb(var(--text-muted))] hover:border-[rgb(var(--border))] hover:text-[rgb(var(--text-primary))]'
                )}
              >
                {option.label}
                {option.count !== undefined && (
                  <span className={isActive ? 'text-[rgb(var(--accent))]/70' : 'text-[rgb(var(--text-muted))]/60'}>
                    {String(option.count).padStart(2, '0')}
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
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
