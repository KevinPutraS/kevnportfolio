import { ProjectCard } from './project-card'
import { EmptyState } from '@/components/ui/empty-state'
import type { Project } from '@/types/project'

/** Renders nothing when there is nothing to relate. */
export function RelatedProjects({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null

  return (
    <section className="section border-t border-[rgb(var(--border-subtle))]">
      <div className="container-custom">
        <p className="eyebrow">Keep reading</p>
        <h2 className="heading-2 mt-4">Related projects</h2>

        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} variant="compact" index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

export { EmptyState }
