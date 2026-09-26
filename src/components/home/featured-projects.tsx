import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getFeaturedProjects } from '@/lib/db/projects'
import { ProjectCard } from '@/components/projects/project-card'
import { EmptyState } from '@/components/ui/empty-state'
import type { Project } from '@/types/project'

/**
 * Shows the four most recent featured projects in an asymmetric layout:
 * a wide lead tile above a two-up row. Falls back to the newest published
 * projects so the homepage is never empty while a portfolio is being set up.
 */
export async function FeaturedProjects({ projects }: { projects?: Project[] }) {
  const list = projects ?? (await getFeaturedProjects(4))

  return (
    <section className="section border-t border-[rgb(var(--border-subtle))]">
      <div className="container-custom">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Selected work</p>
            <h2 className="heading-2 mt-4">Featured projects</h2>
          </div>
          <Link
            href="/projects"
            className="group inline-flex items-center gap-2 text-sm text-[rgb(var(--text-secondary))] transition-colors hover:text-[rgb(var(--accent))]"
          >
            All projects
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>

        {list.length === 0 ? (
          <EmptyState
            className="mt-12"
            title="No featured projects yet"
            description="Once a project is published and marked as featured it will appear here."
            action={
              <Link href="/projects" className="link text-sm">
                Browse the full archive
              </Link>
            }
          />
        ) : (
          <div className="mt-12 space-y-12 lg:space-y-16">
            <ProjectCard project={list[0]} variant="feature" index={0} priority />

            {list.length > 1 && (
              <div className="grid gap-10 sm:grid-cols-2 lg:gap-12">
                {list.slice(1, 3).map((project, index) => (
                  <ProjectCard key={project.id} project={project} index={index + 1} />
                ))}
              </div>
            )}

            {list.length > 3 && (
              <div className="grid gap-10 sm:grid-cols-2 lg:gap-12">
                {list.slice(3, 4).map((project, index) => (
                  <ProjectCard key={project.id} project={project} index={index + 3} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
