import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getCategoryCounts, getProjects, PROJECTS_PAGE_SIZE } from '@/lib/db/projects'
import { isProjectCategory, type ProjectCategoryFilter } from '@/config/site'
import { ProjectFilter, buildFilterOptions } from '@/components/projects/project-filter'
import { ProjectGrid } from '@/components/projects/project-grid'
import { EmptyState } from '@/components/ui/empty-state'
import { ButtonLink } from '@/components/ui/button-link'
import { GridSkeleton } from '@/components/ui/skeletons'
import { FolderOpen } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'A selection of web applications, tools, networking experiments and half-finished ideas. Filtered by what they are and what they are made of.',
  alternates: { canonical: '/projects' },
}

const VALID_CATEGORIES: ProjectCategoryFilter[] = [
  'web',
  'app',
  'design',
  'networking',
  'experiment',
  'school',
  'other',
]

/**
 * Resolves the category from search params.
 *
 * `searchParams` is read here and passed down; no component ever touches
 * `window`. That was the original crash: a Server Component called
 * `window.location.search`, which only works for the first 12 results and
 * throws on the server otherwise.
 */
function resolveCategory(value: string | string[] | undefined): ProjectCategoryFilter {
  const raw = Array.isArray(value) ? value[0] : value
  if (!raw) return 'all'
  return isProjectCategory(raw) && VALID_CATEGORIES.includes(raw) ? raw : 'all'
}

export default function ProjectsPage({
  searchParams,
}: {
  searchParams: { category?: string | string[]; page?: string | string[] }
}) {
  const category = resolveCategory(searchParams.category)
  const requestedPage = Number(Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page)
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? Math.floor(requestedPage) : 1

  return (
    <>
      <section>
        <div className="container-custom">
          {/*
            Masthead. Title set against a right-hand column of body copy rather
            than stacked underneath it — the offset is what makes the archive
            read as a contents page instead of a page heading.
          */}
          <div className="grid gap-10 py-14 sm:py-20 lg:grid-cols-12 lg:gap-8 lg:py-24">
            <div className="lg:col-span-7">
              <p className="eyebrow">Archive</p>
              <h1 className="heading-1 mt-6">Projects.</h1>
            </div>

            <p className="body-lg text-pretty text-[rgb(var(--text-secondary))] lg:col-span-5 lg:self-end">
              Everything I have made public so far — applications, experiments, coursework and the
              occasional thing that was never meant to leave a hard drive. Not all of it is
              finished.
            </p>
          </div>
        </div>
      </section>

      {/*
        The Suspense boundary is declared *inside* this page rather than through a
        `loading.tsx` in the `projects/` segment. A segment-level `loading.tsx`
        applies to every descendant segment, including `projects/[slug]` — and
        because it starts streaming the response, a `notFound()` thrown there
        would be served as HTTP 200 with 404 markup instead of a real 404.
        Scoping the boundary to this page keeps the skeleton and gives the
        detail route a correct status code.
      */}
      <Suspense fallback={<ArchiveSkeleton />}>
        <ArchiveResults category={category} page={page} />
      </Suspense>
    </>
  )
}

function ArchiveSkeleton() {
  return (
    <section className="section-sm">
      <div className="container-custom">
        <div className="h-10 w-full max-w-3xl animate-pulse bg-[rgb(var(--surface))]" />
        <div className="mt-6 h-3 w-40 animate-pulse bg-[rgb(var(--surface-elevated))]" />
        <GridSkeleton count={6} />
      </div>
    </section>
  )
}

async function ArchiveResults({
  category,
  page,
}: {
  category: ProjectCategoryFilter
  page: number
}) {
  const [{ projects, total }, counts] = await Promise.all([
    getProjects({ page, category }),
    getCategoryCounts(),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PROJECTS_PAGE_SIZE))
  const filterOptions = buildFilterOptions(counts)
  const isFiltered = category !== 'all'
  const isEmptyByFilter = isFiltered && total === 0

  return (
    <section className="rhythm-lg">
      <div className="container-custom">
        {/*
          Filter and result count share one hairline row. Keeping the count on
          the same line as the filter means the reader can see both what they
          selected and how much it returned without a second block.
        */}
        <div className="flex flex-col gap-4 border-y border-[rgb(var(--border-subtle))] py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <ProjectFilter options={filterOptions} active={category} />

          <p
            className="caption shrink-0 text-[rgb(var(--text-muted))]"
            aria-live="polite"
          >
            {String(total).padStart(2, '0')} {total === 1 ? 'project' : 'projects'}
            {isFiltered ? ` / ${filterOptions.find((o) => o.value === category)?.label}` : ''}
          </p>
        </div>

        {projects.length > 0 ? (
          <>
            <ProjectGrid projects={projects} className="mt-12 sm:mt-16" />

            {totalPages > 1 && (
              <nav
                aria-label="Pagination"
                className="mt-16 flex items-center justify-between border-t border-[rgb(var(--border-subtle))] pt-8"
              >
                {page > 1 ? (
                  <ButtonLink
                    href={`/projects?${new URLSearchParams({ ...(isFiltered ? { category } : {}), page: String(page - 1) })}`}
                    variant="secondary"
                    size="sm"
                  >
                    Previous
                  </ButtonLink>
                ) : (
                  <span />
                )}

                <span className="font-mono text-xs text-[rgb(var(--text-muted))]">
                  Page {page} / {totalPages}
                </span>

                {page < totalPages ? (
                  <ButtonLink
                    href={`/projects?${new URLSearchParams({ ...(isFiltered ? { category } : {}), page: String(page + 1) })}`}
                    variant="secondary"
                    size="sm"
                  >
                    Next
                  </ButtonLink>
                ) : (
                  <span />
                )}
              </nav>
            )}
          </>
        ) : isEmptyByFilter ? (
          <EmptyState
            className="mt-12"
            title="Nothing in this category yet"
            description="This filter has no published projects right now. Try another category or clear the filter to see everything."
            action={
              <ButtonLink href="/projects" variant="secondary" size="sm">
                Show all projects
              </ButtonLink>
            }
          />
        ) : (
          <EmptyState
            className="mt-12"
            icon={<FolderOpen className="h-8 w-8" aria-hidden="true" />}
            title="No projects published yet"
            description="Once a project is published it will show up here. In the meantime, the about page explains what I am working on."
            action={
              <ButtonLink href="/about" variant="secondary" size="sm">
                Read the about page
              </ButtonLink>
            }
          />
        )}
      </div>
    </section>
  )
}

/**
 * Rendered per request on purpose.
 *
 * Reading `searchParams` (category + page) makes this route request-specific,
 * so it cannot be statically cached. The underlying queries still go through the
 * cookie-less public client and are protected by Row Level Security.
 */
export const dynamic = 'force-dynamic'
