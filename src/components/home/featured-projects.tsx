import Link from 'next/link'
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
 */
export async function FeaturedProjects({ projects }: { projects?: Project[] }) {
  const list = projects ?? (await getFeaturedProjects(4))

  return (
    <section className="rhythm-lg rule-top">
      <div className="container-custom">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Selected work</p>
            <h2 className="heading-2 mt-5 text-balance">A few things I built.</h2>
          </div>

          <ArrowLink href="/projects" className="mb-2">
            All projects
          </ArrowLink>
        </div>

        {list.length === 0 ? (
          <EmptyState
            className="mt-12"
            title="No featured projects yet"
            description="Once a project is published and marked as featured it will appear here."
            action={
              <Link href="/projects" className="link-underline font-mono text-[0.6875rem] uppercase tracking-[0.16em]">
                Browse the full archive
              </Link>
            }
          />
        ) : (
          <ProjectGrid projects={list} className="mt-12 sm:mt-16" />
        )}
      </div>
    </section>
  )
}
