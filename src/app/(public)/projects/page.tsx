import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getCategoryCounts, getProjects, PROJECTS_PAGE_SIZE } from '@/lib/db/projects'
import { isProjectCategory, type ProjectCategoryFilter } from '@/config/site'
import { ProjectFilter, buildFilterOptions } from '@/components/projects/project-filter'
import { ProjectGrid } from '@/components/projects/project-grid'
import { EmptyState } from '@/components/ui/empty-state'
import { ButtonLink } from '@/components/ui/button-link'
import { ArrowLink } from '@/components/ui/arrow-link'
import { PageHeader } from '@/components/ui/page-header'
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
 *
 * Reading `searchParams` in a Server Component is also what makes this route
 * **dynamic**, and the build output confirms it — `/projects` is listed as
 * `ƒ`, while `/`, `/about`, `/experience` and `/certificates` are `○`. The
 * other three carry `revalidate = 60` and are genuinely ISR.
 *
 * So do not add `export const revalidate = 60` here hoping to fix that. It would
 * be silently ignored: any `searchParams` access opts the page out of static
 * rendering regardless, and adding the export would only make the page *look*
 * cached while behaving differently from what the constant says.
 *
 * Making this ISR would mean reading the category on the client with
 * `useSearchParams` and rendering the grid from a cached fetch. That is a real
 * trade, not a free win: the current version serves a correct, fully rendered
 * page for every category URL with JavaScript disabled and gives each category
 * its own server-rendered document. For a portfolio this size, a cookieless
 * `count: 'exact'` read per request is not the bottleneck worth optimising
 * away at the cost of no-JS filtering.
 */
function resolveCategory(value: string | string[] | undefined): ProjectCategoryFilter {
  const raw = Array.isArray(value) ? value[0] : value
  if (!raw) return 'all'
  return isProjectCategory(raw) && VALID_CATEGORIES.includes(raw) ? raw : 'all'
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { category?: string | string[]; page?: string | string[] }
}) {
  const category = resolveCategory(searchParams.category)
  const requestedPage = Number(Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page)
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? Math.floor(requestedPage) : 1

  /*
   * The count is read here as well as inside the results block below. The two
   * reads are independent and cheap — the category counts are a single grouped
   * query — and splitting them keeps the header outside the Suspense boundary so
   * the page never renders a giant "00" placeholder while data loads.
   */
  const counts = await getCategoryCounts()
  const total = counts.reduce((sum, entry) => sum + entry.count, 0)

  return (
    <>
      <div className="container-custom">
        {/*
          The shared `PageHeader`, with the published count supplied as its
          `meta` slot. This page used to hand-roll its own opening — an
          `Archive` eyebrow over "Things I have built." — which is exactly the
          kind of one-off that makes a site stop feeling like one site. Putting
          the count in the header's meta slot keeps the scale of the work
          stated up front, which is the one thing this page wants to say, without
          a second layout to maintain.
        */}
        <PageHeader
          eyebrow="Projects"
          title="Things I have built."
          lede="Every project I have made public, from coursework to longer experiments. Each entry explains what it is, what it is made of, and why I built it. Not everything here is finished — that is part of the point."
          tone="section-tone-app"
          meta={
            <p className="inline-flex items-baseline gap-3">
              <span className="font-display text-5xl font-bold leading-none tracking-[-0.04em] text-[rgb(var(--text))] sm:text-6xl">
                {String(total).padStart(2, '0')}
              </span>
              <span className="meta">{total === 1 ? 'project published' : 'projects published'}</span>
            </p>
          }
        />
      </div>

      {/*
        The Suspense boundary is declared *inside* this page rather than through a
        `loading.tsx` in the `projects/` segment. A segment-level `loading.tsx`
        applies to every descendant segment, including `projects/[slug]` — and
        because it starts streaming the response, a `notFound()` thrown there
        would be served as HTTP 200 with 404 markup instead of a real 404.
        Scoping the boundary to this page keeps the skeleton and gives the
        detail route a correct status code.
      */}
      <Suspense fallback={<ProjectsSkeleton />}>
        <ProjectResults category={category} page={page} />
      </Suspense>
    </>
  )
}

function ProjectsSkeleton() {
  return (
    <section className="rhythm-lg">
      <div className="container-custom">
        <div className="h-10 w-full max-w-3xl animate-pulse rounded-[var(--radius-sm)] bg-[rgb(var(--surface))]" />
        <div className="mt-6 h-3 w-40 animate-pulse rounded-[var(--radius-sm)] bg-[rgb(var(--surface-elevated))]" />
        <GridSkeleton count={6} />
      </div>
    </section>
  )
}

async function ProjectResults({
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
        <div className="flex flex-col gap-4 border-y border-[rgb(var(--border))] py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <ProjectFilter options={filterOptions} active={category} />

          <p className="meta shrink-0 text-[rgb(var(--text-muted))]" aria-live="polite">
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
                className="mt-16 flex items-center justify-between border-t border-[rgb(var(--border))] pt-8"
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

                <span className="meta">
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
