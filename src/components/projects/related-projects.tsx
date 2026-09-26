import { ProjectCard } from './project-card'
import { EmptyState } from '@/components/ui/empty-state'
import type { Project } from '@/types/project'

/** Renders nothing when there is nothing to relate. */
export function RelatedProjects({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null

  return (
    <section className="rule-top">
      <div className="container-custom">
        <div className="rhythm-lg">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Keep reading</p>
              <h2 className="heading-2 mt-5">Related projects</h2>
            </div>
          </div>

          <div className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                variant="compact"
                index={index}
                className={index === projects.length - 1 ? 'sm:col-span-2 lg:col-span-1' : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export { EmptyState }
