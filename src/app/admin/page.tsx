import { getProjects } from '@/lib/db/projects'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FolderKanban, Plus, TrendingUp, Star } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/helpers'
import { classNames } from '@/lib/utils/helpers'

export default async function AdminDashboard() {
  const [allProjects, featuredProjects, publishedProjects] = await Promise.all([
    getProjects({ published: undefined }),
    getProjects({ featured: true, published: true }),
    getProjects({ published: true }),
  ])

  const stats = [
    { label: 'Total Projects', value: allProjects.total, icon: FolderKanban, color: 'text-blue-400' },
    { label: 'Published', value: publishedProjects.total, icon: TrendingUp, color: 'text-green-400' },
    { label: 'Featured', value: featuredProjects.total, icon: Star, color: 'text-amber-400' },
    { label: 'Drafts', value: allProjects.total - publishedProjects.total, icon: Plus, color: 'text-[rgb(var(--text-muted))]' },
  ]

  const recentProjects = allProjects.projects.slice(0, 5)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-1">Dashboard</h1>
          <p className="text-[rgb(var(--text-secondary))] mt-1">Manage your portfolio projects</p>
        </div>
        <Link href="/admin/projects/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--text-muted))]">{stat.label}</p>
                <p className="heading-2 mt-1">{stat.value}</p>
              </div>
              <div className={classNames('h-12 w-12 rounded-xl items-center justify-center', `${stat.color}/10`)} >
                <stat.icon className="h-6 w-6" aria-hidden="true" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="border-b border-[rgb(var(--border-subtle))] px-6 py-4 flex items-center justify-between">
          <h2 className="heading-4">Recent Projects</h2>
          <Link href="/admin/projects" className="text-sm text-[rgb(var(--accent))] hover:underline">
            View All
          </Link>
        </div>
        {recentProjects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgb(var(--border-subtle))]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider">Project</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider hidden md:table-cell">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider hidden lg:table-cell">Updated</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--border-subtle))]">
                {recentProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-[rgb(var(--surface-elevated))/0.5]">
                    <td className="px-4 py-4">
                      <Link href={`/admin/projects/${project.id}/edit`} className="font-medium text-[rgb(var(--text-primary))] hover:text-[rgb(var(--accent))]">
                        {project.title}
                      </Link>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className={classNames(
                        'badge',
                        project.published ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-[rgb(var(--surface-elevated))] text-[rgb(var(--text-muted))] border-[rgb(var(--border))]'
                      )}>
                        {project.published ? 'Published' : 'Draft'}
                      </span>
                      {project.featured && (
                        <span className="badge-success ml-1">Featured</span>
                      )}
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell text-[rgb(var(--text-secondary))]">
                      {formatRelativeTime(project.updated_at)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link href={`/admin/projects/${project.id}/edit`} className="btn-ghost btn-sm">Edit</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <FolderKanban className="h-12 w-12 mx-auto text-[rgb(var(--text-muted))] mb-4" />
            <h3 className="heading-4 mb-2">No projects yet</h3>
            <p className="text-[rgb(var(--text-muted))] mb-4">Create your first project to get started.</p>
            <Link href="/admin/projects/new">
              <Button>Create Project</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}