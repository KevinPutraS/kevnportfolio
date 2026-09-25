'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { projectCategories, type ProjectCategoryFilter } from '@/config/site'
import { categoryLabels } from '@/types/category'
import { classNames } from '@/lib/utils/helpers'

export function ProjectFilter() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const currentCategory = (searchParams.get('category') as ProjectCategoryFilter) || 'all'

  const handleCategoryChange = (category: ProjectCategoryFilter) => {
    const params = new URLSearchParams(searchParams.toString())
    if (category === 'all') {
      params.delete('category')
    } else {
      params.set('category', category)
    }
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mb-10" role="group" aria-label="Filter projects by category">
      {projectCategories.map((category) => (
        <button
          key={category.value}
          type="button"
          onClick={() => handleCategoryChange(category.value)}
          className={classNames(
            'rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
            currentCategory === category.value
              ? 'bg-[rgb(var(--accent))] text-[rgb(var(--text-inverse))] shadow-[0_0_0_1px_rgb(var(--accent))]'
              : 'bg-[rgb(var(--surface-elevated))] text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--border))]'
          )}
          aria-pressed={currentCategory === category.value}
        >
          {categoryLabels[category.value] || category.label}
        </button>
      ))}
    </div>
  )
}