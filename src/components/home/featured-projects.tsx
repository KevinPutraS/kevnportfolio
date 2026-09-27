import { getFeaturedProjects } from '@/lib/db/projects'
import { ProjectGrid } from '@/components/projects/project-grid'
import { ArrowLink } from '@/components/ui/arrow-link'
import { EmptyState } from '@/components/ui/empty-state'
import type { Project } from '@/types/project'

/**
 * Homepage selection of work.
 *
 * Reuses `ProjectGrid` rather than defining a second layout: the archive and the
 * homepage should show the same project identically, otherwise the first
 * impression and the real index stop matching. Falls back to the newest
 * published projects so the homepage is never empty while a portfolio is being
 * set up.
 *
 * The eyebrow used to read "Selected work". "Projects" is what the section
 * actually contains, and it matches the label in the header, so a visitor who
 * clicks either one is not surprised by the destination.
 */
export async function FeaturedProjects({ projects }: { projects?: Project[] }) {
  const list = projects ?? (await getFeaturedProjects(4))

  return (
    <section className="rhythm-lg rule-top">
      <div className="container-custom">
        <div className="section-head">
          <div>
            <p className="eyebrow">Projects</p>
            <h2 className="section-head-title">A few things I have built.</h2>
          </div>

          <ArrowLink href="/projects" className="shrink-0">
            View all projects
          </ArrowLink>
        </div>

        {list.length === 0 ? (
          <EmptyState
            className="mt-12"
            title="No projects published yet"
            description="Once a project is published it will appear here. Nothing is hidden — this section is genuinely empty until there is something to show."
            action={<ArrowLink href="/about">Read about how I work</ArrowLink>}
          />
        ) : (
          <ProjectGrid projects={list} className="mt-12 sm:mt-16" />
        )}
      </div>
    </section>
  )
}
