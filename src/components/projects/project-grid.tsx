import { ProjectCard, type ProjectCardVariant } from './project-card'
import { classNames } from '@/lib/utils/helpers'
import type { Project } from '@/types/project'

/**
 * Editorial grid.
 *
 * On wide screens a repeating 12-column rhythm is used (wide / narrow / narrow,
 * then offset) so the page reads like a laid-out spread rather than a uniform
 * card wall. On mobile and tablet everything collapses to a single column,
 * which is the only honest layout at 320px.
 */
function layoutFor(index: number): { wrapper: string; variant: ProjectCardVariant } {
  const position = index % 4

  if (position === 0) {
    return { wrapper: 'lg:col-span-7', variant: 'feature' }
  }
  if (position === 1) {
    return { wrapper: 'lg:col-span-5 lg:pt-16', variant: 'standard' }
  }
  if (position === 2) {
    return { wrapper: 'lg:col-span-5', variant: 'standard' }
  }
  return { wrapper: 'lg:col-span-7 lg:pt-16', variant: 'standard' }
}

export function ProjectGrid({ projects, className }: { projects: Project[]; className?: string }) {
  return (
    <div className={classNames('grid gap-x-10 gap-y-14 sm:gap-y-16 lg:grid-cols-12', className)}>
      {projects.map((project, index) => {
        const { wrapper, variant } = layoutFor(index)
        return (
          <div key={project.id} className={classNames('min-w-0', wrapper)}>
            <ProjectCard project={project} variant={variant} index={index} priority={index < 2} />
          </div>
        )
      })}
    </div>
  )
}
