import { getProjects } from '@/lib/db/projects'
import { ProjectTableClient } from '@/components/admin/project-table-client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

interface AdminProjectsPageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function AdminProjectsPage({ searchParams }: AdminProjectsPageProps) {
  const resolvedSearchParams = await searchParams
  const page = parseInt(resolvedSearchParams.page || '1', 10)

  const projectsData = await getProjects({ page, published: undefined })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-1">Projects</h1>
          <p className="text-[rgb(var(--text-secondary))] mt-1">Manage your portfolio projects</p>
        </div>
        <Link href="/admin/projects/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      <ProjectTableClient
        initialProjects={projectsData.projects}
        initialTotal={projectsData.total}
        initialPage={projectsData.page}
      />
    </div>
  )
}