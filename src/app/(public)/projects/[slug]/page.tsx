import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, GitBranch } from 'lucide-react'
import { getProjectBySlug, getRelatedProjects } from '@/lib/db/projects'
import { categoryLabels, categoryColorClass, siteConfig } from '@/config/site'
import { projectStatusLabels } from '@/config/project-status'
import { formatMonth } from '@/lib/utils/helpers'
import { ProjectGallery } from '@/components/projects/project-gallery'
import { ProjectThumbnail } from '@/components/projects/project-thumbnail'
import { RelatedProjects } from '@/components/projects/related-projects'
import { ButtonLink } from '@/components/ui/button-link'

interface ProjectPageProps {
  params: { slug: string }
}

/**
 * Rendered on demand rather than through ISR, deliberately.
 *
 * Two Next.js behaviours make a cached detail route the wrong choice here:
 *
 * 1. With `revalidate` set, a `notFound()` thrown from this route is served
 *    through the static cache and comes back as **HTTP 200** containing 404
 *    markup.
 * 2. A `loading.tsx` anywhere above this route puts it in a Suspense boundary,
 *    which streams the response and locks the status to 200 before `notFound()`
 *    is ever reached.
 *
 * Either one would make search engines treat unknown project URLs as real,
 * indexable pages. A correct 404 status matters more here than saving one indexed
 * primary-key lookup, so the route stays dynamic and always fresh.
 *
 * The homepage keeps its 60s ISR window: it never calls `notFound()`, so it has no
 * equivalent downside. The archive's skeleton lives in an in-page `<Suspense>`
 * rather than a segment `loading.tsx` for the same reason.
 *
 * `force-dynamic` is load-bearing, not decoration. Public reads go through a
 * cookieless Supabase client, so with the default `dynamic = 'auto'` this route is
 * served from the Full Route Cache. A project requested while it was still a draft
 * had its 404 written to that cache, and publishing it changed nothing — the page
 * stayed 404 until the cache was discarded.
 */
export const dynamic = 'force-dynamic'

/**
 * `getProjectBySlug` already filters on `published = true`, so an unpublished
 * project 404s for visitors and is invisible to search engines.
 */
export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug)

  /*
   * `notFound()` is deliberately NOT called here.
   *
   * Throwing from `generateMetadata` is not a supported way to produce a 404 in
   * the App Router: the metadata resolver runs outside the render tree that the
   * not-found boundary wraps, so the throw unwinds before the boundary is
   * resolved and the response is served as a bare 404 with an empty `<body>` —
   * right status, no page, no navigation.
   *
   * So metadata resolution degrades quietly and the page body stays the single
   * authority on the status code. The project is not found either way; what
   * changes is whether the visitor gets the 404 page or a blank screen.
   */
  if (!project) {
    return {
      title: 'Project not found',
      robots: { index: false, follow: false },
    }
  }

  const description = project.short_description
  const image = project.thumbnail_url ?? siteConfig.ogImage

  return {
    title: project.title,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      type: 'article',
      url: `${siteConfig.url}/projects/${project.slug}`,
      title: `${project.title} — ${siteConfig.name}`,
      description,
      images: [{ url: image, alt: `${project.title} preview` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${project.title} — ${siteConfig.name}`,
      description,
      images: [image],
    },
  }
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const project = await getProjectBySlug(params.slug)

  if (!project) notFound()

  const related = await getRelatedProjects(project.slug, project.category, 3)
  const gallery = project.gallery ?? []
  const hasDescription = Boolean(project.description?.trim())
  const technologies = project.technologies ?? []
  const hasLinks = Boolean(project.project_url || project.repository_url)
  const catClass = categoryColorClass(project.category)
  const role = project.role?.trim() || null
  const outcome = project.outcome?.trim() || null
  const statusLabel = project.status ? projectStatusLabels[project.status] : null

  return (
    <article className={catClass}>
      {/* ---- Case study header -------------------------------------------
        * The title sits on the page with nothing beside it, and the metadata
        * moves to a sticky rail beside the body. A sidebar next to the heading
        * competes with the heading; a rail beside long-form content supports it.
        */}
      <header>
        <div className="container-custom">
          <div className="flex items-center justify-between gap-6 border-b border-[rgb(var(--border))] py-4">
            <Link
              href="/projects"
              className="group -ml-2 inline-flex min-h-11 items-center gap-2 px-2 text-[length:var(--text-body-sm)] font-medium text-[rgb(var(--text-dim))] transition-colors duration-200 hover:text-[rgb(var(--text))]"
            >
              <ArrowLeft
                className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1"
                aria-hidden="true"
              />
              All projects
            </Link>
            <p className="meta hidden sm:block">Case study</p>
          </div>

          <div className="py-14 sm:py-20 lg:py-24">
            {/*
              Category and status, side by side when there is a status to show.

              Two chips of the same weight reading as one row is the point: the
              category says what kind of thing this is, the status says how far it
              got, and a reader deciding whether to keep reading needs both
              before the title, not after it. With no status set the row is a
              single chip rather than a chip and a gap.
            */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="cat-chip inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.12em]">
                <span aria-hidden="true" className="cat-dot h-1.5 w-1.5 rounded-full" />
                {categoryLabels[project.category] ?? project.category}
              </span>

              {statusLabel && (
                <span className="inline-flex items-center rounded-full border border-[rgb(var(--border))] px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.12em] text-[rgb(var(--text-dim))]">
                  {statusLabel}
                </span>
              )}
            </div>

            <h1 className="heading-1 mt-7 max-w-[16ch] text-balance">{project.title}</h1>

            {role && (
              <p className="mt-4 flex items-start gap-2.5 text-[length:var(--text-body-sm)] text-[rgb(var(--text-muted))]">
                <span className="label mt-px shrink-0">Role</span>
                <span className="text-pretty">{role}</span>
              </p>
            )}

            <p className="body-lg mt-7 max-w-2xl text-pretty text-[rgb(var(--text-dim))]">
              {project.short_description}
            </p>

            {hasLinks && (
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Both buttons are omitted entirely when the URL is absent. */}
                {project.project_url && (
                  <ButtonLink href={project.project_url} external size="lg" className="w-full sm:w-auto">
                    Visit project
                  </ButtonLink>
                )}
                {project.repository_url && (
                  <ButtonLink
                    href={project.repository_url}
                    external
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    View repository
                  </ButtonLink>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ---- Hero image, full bleed ---------------------------------------
          * Escapes the container on wide screens. A case study opens on the work,
          * and the work should be as large as the viewport allows.
          */}
        {project.thumbnail_url && (
          <div className="px-5 sm:px-8 lg:px-12 xl:px-16">
            <div className="mx-auto w-full max-w-[100rem] overflow-hidden rounded-xl border border-[rgb(var(--cat)/0.35)]">
              <ProjectThumbnail
                src={project.thumbnail_url}
                alt={`${project.title} preview`}
                className="aspect-video"
                priority
                zoom={false}
                sizes="100vw"
              />
            </div>
          </div>
        )}
      </header>

      {/* ---- Body with a sticky metadata rail ------------------------------ */}
      <div className="container-custom">
        <div className="grid gap-x-12 gap-y-12 py-16 lg:grid-cols-12 lg:py-20">
          {/* Sticky rail: the facts, held in view while the prose scrolls past. */}
          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-24">
              {project.project_date && (
                <div className="border-b border-[rgb(var(--border))] pb-5">
                  <p className="label">Date</p>
                  <time
                    dateTime={project.project_date}
                    className="mt-1 block font-mono text-sm tabular-nums text-[rgb(var(--text-dim))]"
                  >
                    {formatMonth(project.project_date)}
                  </time>
                </div>
              )}

              <div className="border-b border-[rgb(var(--border))] py-5">
                <p className="label">Category</p>
                <p className="mt-1 flex items-center gap-2 text-sm text-[rgb(var(--text-dim))]">
                  <span aria-hidden="true" className="cat-dot h-2 w-2 rounded-full" />
                  {categoryLabels[project.category] ?? project.category}
                </p>
              </div>

              {technologies.length > 0 && (
                <div className="pt-5">
                  <p className="label">Built with</p>
                  <ul className="mt-1 space-y-1">
                    {technologies.map((technology) => (
                      <li
                        key={technology}
                        className="text-[length:var(--text-sm)] leading-relaxed text-[rgb(var(--text-dim))]"
                      >
                        {technology}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {project.repository_url && (
                <a
                  href={project.repository_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-6 inline-flex min-h-11 items-center gap-2 text-[length:var(--text-sm)] font-medium text-[rgb(var(--text))] transition-colors hover:text-[rgb(var(--cat))]"
                >
                  <GitBranch className="h-4 w-4" aria-hidden="true" />
                  Source
                  <ArrowUpRight
                    className="h-3.5 w-3.5 text-[rgb(var(--text-muted))] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              )}
            </div>
          </aside>

          <div className="lg:col-span-8 lg:col-start-5">
            {hasDescription && (
              <section>
                <h2 className="heading-3">Overview</h2>
                <div className="prose-block mt-5 max-w-2xl text-pretty">
                  {project.description?.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </section>
            )}

            {/*
              The outcome, and the reason it is its own section rather than the
              last paragraph of the overview.

              A case study's overview says what the project was; its outcome says
              what it produced. Running them together is how a page ends on a
              description of the code instead of on a result, which is the one
              thing a reader came for. Set on a tinted panel so it reads as a
              conclusion rather than as more body copy, and capped at 600
              characters in the database to keep it to a single paragraph.
            */}
            {outcome && (
              <section className="mt-14 border-l-2 border-[rgb(var(--accent))] bg-[rgb(var(--accent)/0.05)] px-5 py-4 sm:px-6">
                <h2 className="label text-[rgb(var(--accent))]">Outcome</h2>
                <p className="mt-2 text-pretty text-[length:var(--text-body-sm)] leading-relaxed text-[rgb(var(--text))]">
                  {outcome}
                </p>
              </section>
            )}

            {gallery.length > 0 && (
              <section className="mt-16">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="heading-3">Gallery</h2>
                  <p className="meta tabular-nums">
                    {String(gallery.length).padStart(2, '0')}{' '}
                    {gallery.length === 1 ? 'image' : 'images'}
                  </p>
                </div>
                <div className="mt-6">
                  <ProjectGallery images={gallery} title={project.title} />
                </div>
              </section>
            )}

            {/*
              Only when the page is genuinely empty. A project with a role and an
              outcome but no long description and no gallery has real content on
              it, and "a write-up is on the way" next to that is a lie the page
              tells about itself. The gate counts all three sections.
            */}
            {!hasDescription && !outcome && gallery.length === 0 && (
              <p className="body text-pretty text-[rgb(var(--text-muted))]">
                A write-up for this one is on the way.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ---- Footer nav -------------------------------------------------- */}
      <section className="rule-top">
        <div className="container-custom">
          <div className="flex flex-col gap-6 py-12 sm:flex-row sm:items-center sm:justify-between sm:py-16">
            <Link
              href="/projects"
              className="group -ml-2 inline-flex min-h-11 items-center gap-2 px-2 text-[length:var(--text-body-sm)] font-medium text-[rgb(var(--text-dim))] transition-colors duration-200 hover:text-[rgb(var(--text))]"
            >
              <ArrowLeft
                className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1"
                aria-hidden="true"
              />
              Back to all projects
            </Link>

            {project.project_url && (
              <a
                href={project.project_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex min-h-11 items-center gap-2 text-[length:var(--text-body-sm)] font-medium text-[rgb(var(--text-dim))] transition-colors duration-200 hover:text-[rgb(var(--text))]"
              >
                <span className="cat-chip inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs uppercase tracking-[0.1em]">
                  Live site
                  <ArrowUpRight
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </span>
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
          </div>
        </div>
      </section>

      <RelatedProjects projects={related} />
    </article>
  )
}
