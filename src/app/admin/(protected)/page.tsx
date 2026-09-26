import Link from 'next/link'
import { ArrowUpRight, FileText, Star, EyeOff } from 'lucide-react'
import { getProjects } from '@/lib/db/projects'
import { getUser } from '@/lib/auth'
import { ButtonLink } from '@/components/ui/button-link'
import { EmptyState } from '@/components/ui/empty-state'
import { formatRelativeTime } from '@/lib/utils/helpers'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
}

export default async function AdminDashboardPage() {
  const [user, { projects, total }] = await Promise.all([
    getUser(),
    // `published: null` is essential here: the default filters to published
    // rows only, which previously hid every draft from the dashboard.
    getProjects({ page: 1, published: null, pageSize: 5 }),
  ])

  const published = projects.filter((project) => project.published).length
  const drafts = projects.filter((project) => !project.published).length
  const featured = projects.filter((project) => project.featured).length

  const stats = [
    { label: 'Total projects', value: total },
    { label: 'Published', value: published },
    { label: 'Drafts', value: drafts },
    { label: 'Featured', value: featured },
  ]

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className="heading-2 mt-3">Welcome back</h1>
          <p className="mt-3 text-[rgb(var(--text-secondary))]">
            Signed in as <span className="font-mono text-sm">{user?.email}</span>
          </p>
        </div>
        <ButtonLink href="/admin/projects/new">New project</ButtonLink>
      </header>

      {/* Counters are computed from the current page, so they are labelled as
          a summary rather than presented as exact site-wide totals. */}
      <section aria-label="Summary">
        <ul className="grid gap-px border border-[rgb(var(--border-subtle))] bg-[rgb(var(--border-subtle))] sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <li key={stat.label} className="bg-[rgb(var(--surface))] p-5">
              <p className="caption text-[rgb(var(--text-muted))]">{stat.label}</p>
              <p className="mt-2 font-display text-3xl font-bold tracking-tight">{stat.value}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-[rgb(var(--text-muted))]">
          Summary of the {projects.length} most recent projects.
        </p>
      </section>

      <section>
        <div className="flex items-center justify-between gap-4 border-b border-[rgb(var(--border-subtle))] pb-4">
          <h2 className="heading-3">Recent projects</h2>
          <Link
            href="/admin/projects"
            className="group inline-flex items-center gap-2 text-sm text-[rgb(var(--text-secondary))] transition-colors hover:text-[rgb(var(--accent))]"
          >
            Manage all
            <ArrowUpRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>

        {projects.length === 0 ? (
          <EmptyState
            className="mt-8"
            icon={<FileText className="h-8 w-8" aria-hidden="true" />}
            title="No projects yet"
            description="Create your first project to populate the public portfolio."
            action={<ButtonLink href="/admin/projects/new">Create a project</ButtonLink>}
          />
        ) : (
          <ul className="mt-2">
            {projects.map((project) => (
              <li
                key={project.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[rgb(var(--border-subtle))] py-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{project.title}</p>
                  <p className="caption mt-1 text-[rgb(var(--text-muted))]">
                    {project.updated_at
                      ? `Updated ${formatRelativeTime(project.updated_at)}`
                      : 'Just created'}
                  </p>
                </div>

                {project.featured && (
                  <span className="caption inline-flex items-center gap-1.5 text-[rgb(var(--accent))]">
                    <Star className="h-3 w-3" aria-hidden="true" />
                    Featured
                  </span>
                )}

                <span
                  className={
                    project.published
                      ? 'caption text-[rgb(var(--success))]'
                      : 'caption inline-flex items-center gap-1.5 text-[rgb(var(--text-muted))]'
                  }
                >
                  {!project.published && <EyeOff className="h-3 w-3" aria-hidden="true" />}
                  {project.published ? 'Published' : 'Draft'}
                </span>

                <Link
                  href={`/admin/projects/${project.id}/edit`}
                  className="text-sm text-[rgb(var(--text-secondary))] transition-colors hover:text-[rgb(var(--accent))]"
                >
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
