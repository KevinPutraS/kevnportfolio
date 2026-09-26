import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, GitBranch } from 'lucide-react'
import { getProjectBySlug, getRelatedProjects } from '@/lib/db/projects'
import { categoryLabels, siteConfig } from '@/config/site'
import { formatProjectDate } from '@/lib/utils/helpers'
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
 *    which streams the response and locks the status to 200 before
 *    `notFound()` is ever reached.
 *
 * Either one would make search engines treat unknown project URLs as real,
 * indexable pages. A correct 404 status matters more here than saving one
 * indexed primary-key lookup, so the route stays dynamic and always fresh.
 *
 * The homepage keeps its 60s ISR window: it never calls `notFound()`, so it has
 * no equivalent downside. The archive's skeleton lives in an in-page `<Suspense>`
 * rather than a segment `loading.tsx` for the same reason.
 *
 * No route segment config is declared here on purpose. This is a dynamic segment
 * with no `generateStaticParams`, which Next renders on demand by default —
 * declaring `revalidate` is what would introduce the HTTP 200 problem above.
 */

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

  return (
    <article>
      {/* ---- Header ------------------------------------------------------ */}
      <header>
        <div className="container-custom">
          <div className="flex items-center justify-between gap-6 border-b border-[rgb(var(--border-subtle))] py-4">
            <Link
              href="/projects"
              className="group inline-flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[rgb(var(--text-muted))] transition-colors duration-150 hover:text-[rgb(var(--text-primary))]"
            >
              <ArrowLeft
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-1"
                aria-hidden="true"
              />
              All projects
            </Link>

            <p className="caption hidden text-[rgb(var(--text-muted))] sm:block">
              Case study
            </p>
          </div>

          {/*
            Title set against a metadata rail rather than stacked under it. The
            rail is a border-left column so it reads as a caption, not a card.
          */}
          <div className="grid gap-x-10 gap-y-10 py-14 sm:py-20 lg:grid-cols-12 lg:py-24">
            <div className="lg:col-span-7">
              <div className="flex flex-wrap items-center gap-3">
                <span className="caption text-[rgb(var(--text-muted))]">
                  {categoryLabels[project.category] ?? project.category}
                </span>
                {project.project_date && (
                  <>
                    <span aria-hidden="true" className="h-3 w-px bg-[rgb(var(--border-subtle))]" />
                    <time
                      dateTime={project.project_date}
                      className="font-mono text-[0.6875rem] tabular-nums text-[rgb(var(--text-muted))]"
                    >
                      {formatProjectDate(project.project_date)}
                    </time>
                  </>
                )}
              </div>

              <h1 className="heading-1 mt-6 max-w-[16ch] text-balance">{project.title}</h1>

              <p className="body-lg mt-8 max-w-2xl text-pretty text-[rgb(var(--text-secondary))]">
                {project.short_description}
              </p>

              {hasLinks && (
                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
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

            {technologies.length > 0 && (
              <aside className="lg:col-span-4 lg:col-start-9">
                <p className="meta-label">Built with</p>
                <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-2 lg:block">
                  {technologies.map((technology) => (
                    <li
                      key={technology}
                      className="border-t border-[rgb(var(--border-subtle))] py-2.5 text-sm text-[rgb(var(--text-secondary))] lg:flex lg:items-baseline lg:gap-3"
                    >
                      <span
                        aria-hidden="true"
                        className="hidden h-1 w-1 shrink-0 bg-[rgb(var(--accent))] lg:block"
                      />
                      {technology}
                    </li>
                  ))}
                </ul>
              </aside>
            )}
          </div>
        </div>
      </header>

      {/* ---- Hero image -------------------------------------------------- */}
      {project.thumbnail_url && (
        <div className="container-custom">
          <ProjectThumbnail
            src={project.thumbnail_url}
            alt={`${project.title} preview`}
            className="aspect-[16/9] border border-[rgb(var(--border-subtle))]"
            priority
            zoom={false}
            sizes="(min-width: 1280px) 1200px, 100vw"
          />
        </div>
      )}

      {/* ---- Body -------------------------------------------------------- */}
      {hasDescription && (
        <section className="container-custom">
          <div className="grid gap-x-10 gap-y-6 py-16 sm:py-20 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <p className="eyebrow">Overview</p>
            </div>
            <div className="prose-block max-w-2xl text-pretty lg:col-span-8 lg:col-start-5">
              {project.description?.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---- Gallery ----------------------------------------------------- */}
      {gallery.length > 0 && (
        <section className="rule-top">
          <div className="container-custom">
            <div className="grid gap-x-10 gap-y-8 py-16 sm:py-20 lg:grid-cols-12">
              <div className="lg:col-span-3">
                <p className="eyebrow">Gallery</p>
                <p className="mt-3 font-mono text-[0.6875rem] tabular-nums text-[rgb(var(--text-muted))]">
                  {String(gallery.length).padStart(2, '0')}{' '}
                  {gallery.length === 1 ? 'image' : 'images'}
                </p>
              </div>
              <div className="lg:col-span-9">
                <ProjectGallery images={gallery} title={project.title} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ---- Footer nav -------------------------------------------------- */}
      <section className="rule-top">
        <div className="container-custom">
          <div className="flex flex-col gap-6 py-12 sm:flex-row sm:items-center sm:justify-between sm:py-16">
            <Link
              href="/projects"
              className="group inline-flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[rgb(var(--text-muted))] transition-colors duration-150 hover:text-[rgb(var(--text-primary))]"
            >
              <ArrowLeft
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-1"
                aria-hidden="true"
              />
              Back to all projects
            </Link>

            {project.repository_url && (
              <a
                href={project.repository_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[rgb(var(--text-muted))] transition-colors duration-150 hover:text-[rgb(var(--text-primary))]"
              >
                <GitBranch className="h-3.5 w-3.5" aria-hidden="true" />
                Source
                <ArrowUpRight
                  className="h-3 w-3 text-[rgb(var(--text-muted))] transition-colors duration-150 group-hover:text-[rgb(var(--accent))]"
                  aria-hidden="true"
                />
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
