import type { Metadata } from 'next'
import { getProjects } from '@/lib/db/projects'
import { ProjectTable } from '@/components/admin/project-table'
import { ButtonLink } from '@/components/ui/button-link'
import { EmptyState } from '@/components/ui/empty-state'
import { FolderOpen } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Projects',
  robots: { index: false, follow: false },
}

export default async function AdminProjectsPage() {
  // `published: null` includes drafts — the admin must see unpublished rows.
  const { projects, total } = await getProjects({ page: 1, published: null, pageSize: 100 })

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Content</p>
          <h1 className="heading-2 mt-3">Projects</h1>
          <p className="mt-3 text-[rgb(var(--text-secondary))]">
            {total} {total === 1 ? 'project' : 'projects'} in the database, including drafts.
          </p>
        </div>
        <ButtonLink href="/admin/projects/new">New project</ButtonLink>
      </header>

      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="h-8 w-8" aria-hidden="true" />}
          title="No projects yet"
          description="Create your first project. It will be saved as a draft until you publish it."
          action={<ButtonLink href="/admin/projects/new">Create a project</ButtonLink>}
        />
      ) : (
        <ProjectTable projects={projects} />
      )}
    </div>
  )
}
