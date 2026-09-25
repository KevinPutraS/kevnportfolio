import { Metadata } from 'next'
import { ProjectFilter } from '@/components/projects/project-filter'
import { ProjectGrid } from '@/components/projects/project-grid'
import { getProjects, getCategoryCounts } from '@/lib/db/projects'
import { projectCategories, type ProjectCategory } from '@/config/site'

interface ProjectsPageProps {
  searchParams: Promise<{ category?: string; page?: string }>
}

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Browse my portfolio of web applications, experiments, tools, and creative coding projects.',
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const resolvedSearchParams = await searchParams
  const categoryParam = resolvedSearchParams.category || 'all'
  const category = categoryParam as ProjectCategory | 'all'
  const page = parseInt(resolvedSearchParams.page || '1', 10)

  const [projectsData, categoryCounts] = await Promise.all([
    getProjects({ category: category === 'all' ? undefined : category, page }),
    getCategoryCounts(),
  ])

  const totalPages = Math.ceil(projectsData.total / projectsData.pageSize)

  return (
    <div className="min-h-screen">
      <section className="section border-b border-[rgb(var(--border-subtle))]">
        <div className="container-custom">
          <header className="max-w-3xl">
            <h1 className="heading-1 mb-4">Projects</h1>
            <p className="body text-[rgb(var(--text-secondary))]">
              A collection of things I've built — web apps, experiments, tools, and creative explorations.
            </p>
          </header>
        </div>
      </section>

      <section className="section" aria-labelledby="projects-heading">
        <div className="container-custom">
          <ProjectFilter />

          <div className="flex items-center justify-between mb-8">
            <h2 id="projects-heading" className="sr-only">Project List</h2>
            <p className="text-sm text-[rgb(var(--text-muted))]">
              Showing {projectsData.projects.length} of {projectsData.total} project{projectsData.total !== 1 ? 's' : ''}
            </p>
          </div>

          <ProjectGrid projects={projectsData.projects} />

          {totalPages > 1 && (
            <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
              {page > 1 && (
                <a
                  href={`/projects?${new URLSearchParams({ ...Object.fromEntries(new URLSearchParams(window.location.search)), page: String(page - 1) }).toString()}`}
                  className="btn-secondary"
                >
                  Previous
                </a>
              )}
              <span className="px-4 text-sm text-[rgb(var(--text-secondary))]" aria-current="page">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <a
                  href={`/projects?${new URLSearchParams({ ...Object.fromEntries(new URLSearchParams(window.location.search)), page: String(page + 1) }).toString()}`}
                  className="btn-secondary"
                >
                  Next
                </a>
              )}
            </nav>
          )}
        </div>
      </section>

      <section className="section-sm border-t border-[rgb(var(--border-subtle))]" aria-labelledby="categories-heading">
        <div className="container-custom">
          <h3 id="categories-heading" className="heading-4 mb-6 text-center">Browse by Category</h3>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {projectCategories.map((cat) => {
              const count = categoryCounts.find(c => c.category === cat.value)?.count || 0
              return (
                <a
                  key={cat.value}
                  href={`/projects?category=${cat.value}`}
                  className="badge-secondary group hover:bg-[rgb(var(--border))] transition-colors"
                >
                  {cat.label}
                  <span className="ml-1 text-[rgb(var(--text-muted))]">({count})</span>
                </a>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}