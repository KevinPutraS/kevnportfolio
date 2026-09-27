import { ProjectCard } from './project-card'
import { classNames } from '@/lib/utils/helpers'
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

          <div className={classNames(
            'mt-10 grid gap-5 sm:gap-6 lg:gap-7',
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          )}>
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                variant="standard"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
