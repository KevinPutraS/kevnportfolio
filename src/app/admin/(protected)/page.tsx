import Link from 'next/link'
import Image from 'next/image'
import { Award, ArrowUpRight, Briefcase, Eye, EyeOff, FileText, FolderOpen, Pencil, Star } from 'lucide-react'
import { getProjects, getProjectStatusCounts } from '@/lib/db/projects'
import { getAllExperiencesForAdmin } from '@/lib/db/experience'
import { getAllCertificatesForAdmin } from '@/lib/db/certificates'
import { getUser } from '@/lib/auth'
import { ButtonLink } from '@/components/ui/button-link'
import { EmptyState } from '@/components/ui/empty-state'
import { SectionEyebrow } from '@/components/ui/section-shell'
import { categoryColorClass } from '@/config/site'
import { classNames, formatRelativeTime } from '@/lib/utils/helpers'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
}

export default async function AdminDashboardPage() {
  const [user, { projects }, counts, experiences, certificates] = await Promise.all([
    getUser(),
    // `published: null` is essential here: the default filters to published
    // rows only, which previously hid every draft from the dashboard.
    getProjects({ page: 1, published: null, pageSize: 5 }),
    getProjectStatusCounts(),
    getAllExperiencesForAdmin(),
    getAllCertificatesForAdmin(),
  ])

  // Counters come from exact counts rather than from filtering the five rows
  // above. Deriving them from a page of five made the "Drafts" tile describe the
  // five newest projects rather than every draft, so the tiles disagreed with
  // each other and with the projects list.
  const { total, published, drafts, featured } = counts

  // Each counter carries a hue and an icon. Projects are blue, experience pink,
  // certificates amber — the same mapping the public site uses, so the dashboard
  // and the site it manages read as one thing.
  const stats = [
    { label: 'Total projects', value: total, tone: 'cat-web', icon: <FolderOpen className="h-3.5 w-3.5" aria-hidden="true" /> },
    { label: 'Published', value: published, tone: 'cat-app', icon: <Eye className="h-3.5 w-3.5" aria-hidden="true" /> },
    { label: 'Drafts', value: drafts, tone: 'cat-networking', icon: <EyeOff className="h-3.5 w-3.5" aria-hidden="true" /> },
    { label: 'Featured', value: featured, tone: 'cat-experiment', icon: <Star className="h-3.5 w-3.5" aria-hidden="true" /> },
  ]

  const collections = [
    {
      label: 'Experience entries',
      icon: <Briefcase className="h-4 w-4" aria-hidden="true" />,
      tone: 'cat-design',
      total: experiences.length,
      live: experiences.filter((item) => item.published).length,
      href: '/admin/experience',
      emptyLabel: 'No experience entries yet',
    },
    {
      label: 'Certificates',
      icon: <Award className="h-4 w-4" aria-hidden="true" />,
      tone: 'cat-networking',
      total: certificates.length,
      live: certificates.filter((item) => item.published).length,
      href: '/admin/certificates',
      emptyLabel: 'No certificates yet',
    },
  ]

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <SectionEyebrow>Dashboard</SectionEyebrow>
          <h1 className="heading-2 mt-4">Welcome back</h1>
          <p className="mt-2 text-[length:var(--text-sm)] text-[rgb(var(--text-dim))]">
            <span className="font-mono">{user?.email}</span>
          </p>
        </div>
        <ButtonLink href="/admin/projects/new">New project</ButtonLink>
      </header>

      {/*
        Counters. Each card carries the hue of the section it counts, so the
        dashboard is scannable the same way the public site is: projects are blue,
        experience pink, certificates amber. The old version was a single grey
        grid of four identical numbers, which is the most "spreadsheet" thing on
        the screen.
      */}
      <section aria-label="Summary">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <li
              key={stat.label}
              className={classNames(
                'rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] p-5 transition-[transform,border-color] duration-300 hover:-translate-y-1',
                stat.tone
              )}
            >
              <p className="flex items-center gap-2 text-[length:var(--text-xs)] uppercase tracking-[0.12em] text-[rgb(var(--text-muted))]">
                <span
                  aria-hidden="true"
                  className="flex h-6 w-6 items-center justify-center rounded-md border border-[rgb(var(--cat)/0.4)] bg-[rgb(var(--cat)/0.14)] text-[rgb(var(--cat))]"
                >
                  {stat.icon}
                </span>
                {stat.label}
              </p>
              <p className="mt-3 font-display text-4xl font-bold leading-none tracking-[-0.04em] text-[rgb(var(--text))] tabular-nums">
                {String(stat.value).padStart(2, '0')}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[length:var(--text-xs)] text-[rgb(var(--text-muted))]">
          Counts cover every project. The list below shows the{' '}
          {projects.length === 1 ? 'single' : `${projects.length} most recent`}.
        </p>
      </section>

      <section aria-label="Other content">
        <ul className="grid gap-3 sm:grid-cols-2">
          {collections.map((collection) => (
            <li
              key={collection.label}
              className={classNames(
                'rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] p-5 transition-[border-color] duration-300 hover:border-[rgb(var(--cat)/0.5)]',
                collection.tone
              )}
            >
              <p className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgb(var(--cat)/0.4)] bg-[rgb(var(--cat)/0.14)] text-[rgb(var(--cat))]"
                >
                  {collection.icon}
                </span>
                <span className="text-[length:var(--text-sm)] font-semibold text-[rgb(var(--text))]">
                  {collection.label}
                </span>
              </p>

              <p className="mt-4 text-[length:var(--text-sm)] text-[rgb(var(--text-muted))]">
                {collection.total === 0
                  ? collection.emptyLabel
                  : `${collection.live} of ${collection.total} published`}
              </p>

              <Link
                href={collection.href}
                className="group mt-4 inline-flex min-h-11 items-center gap-1.5 text-[length:var(--text-sm)] font-medium text-[rgb(var(--cat))]"
              >
                Manage
                <ArrowUpRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Recent projects, with the thumbnail so a row is identifiable at a glance. */}
      <section>
        <div className="flex items-center justify-between gap-4 border-b border-[rgb(var(--border))] pb-4">
          <h2 className="heading-3">Recent projects</h2>
          <Link
            href="/admin/projects"
            className="group inline-flex items-center gap-1.5 text-[length:var(--text-sm)] font-medium text-[rgb(var(--text-dim))] transition-colors hover:text-[rgb(var(--accent))]"
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
          <ul className="mt-3 space-y-2">
            {projects.map((project) => (
              <li key={project.id}>
                <Link
                  href={`/admin/projects/${project.id}/edit`}
                  className={classNames(
                    'group flex items-center gap-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] p-2.5 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[rgb(var(--cat)/0.5)]',
                    categoryColorClass(project.category)
                  )}
                >
                  <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--bg-highlight))]">
                    {project.thumbnail_url ? (
                      <Image
                        src={project.thumbnail_url}
                        alt=""
                        fill
                        sizes="56px"
                        quality={60}
                        className="object-cover"
                      />
                    ) : null}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[length:var(--text-sm)] font-medium text-[rgb(var(--text))]">
                      {project.title}
                    </span>
                    <span className="mt-0.5 block font-mono text-[length:var(--text-xs)] text-[rgb(var(--text-muted))]">
                      {project.updated_at
                        ? `Updated ${formatRelativeTime(project.updated_at)}`
                        : 'Just created'}
                    </span>
                  </span>

                  <span className="hidden shrink-0 items-center gap-2 sm:flex">
                    {project.featured && <span className="badge-primary">Featured</span>}
                    {project.published ? (
                      <span className="badge-success">Published</span>
                    ) : (
                      <span className="badge-neutral">Draft</span>
                    )}
                  </span>

                  <Pencil
                    className="h-4 w-4 shrink-0 text-[rgb(var(--text-muted))] transition-colors group-hover:text-[rgb(var(--cat))]"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
