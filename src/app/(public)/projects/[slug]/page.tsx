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
 */
export const dynamic = 'force-dynamic'

/**
 * `getProjectBySlug` already filters on `published = true`, so an unpublished
 * project 404s for visitors and is invisible to search engines.
 */
export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug)

  if (!project) {
    // Raised here as well as in the page body so no metadata is ever generated
    // for a project that does not exist. The page-level `notFound()` is what
    // actually decides the HTTP status; see the note on `dynamic` below.
    notFound()
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
      <header className="border-b border-[rgb(var(--border-subtle))]">
        <div className="container-custom py-12 sm:py-16 lg:py-20">
          <Link
            href="/projects"
            className="group inline-flex items-center gap-2 font-mono text-xs text-[rgb(var(--text-muted))] transition-colors hover:text-[rgb(var(--accent))]"
          >
            <ArrowLeft
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-1"
              aria-hidden="true"
            />
            All projects
          </Link>

          <div className="mt-10 grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="caption text-[rgb(var(--accent))]">
                  {categoryLabels[project.category] ?? project.category}
                </span>
                {project.project_date && (
                  <>
                    <span aria-hidden="true" className="h-px w-8 bg-[rgb(var(--border))]" />
                    <time
                      dateTime={project.project_date}
                      className="font-mono text-[0.6875rem] text-[rgb(var(--text-muted))]"
                    >
                      {formatProjectDate(project.project_date)}
                    </time>
                  </>
                )}
              </div>

              <h1 className="heading-1 mt-5 break-words">{project.title}</h1>

              <p className="body mt-6 max-w-2xl text-[rgb(var(--text-secondary))]">
                {project.short_description}
              </p>

              {hasLinks && (
                <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                  {/* Both buttons are omitted entirely when the URL is absent. */}
                  {project.project_url && (
                    <ButtonLink href={project.project_url} external size="md" className="w-full sm:w-auto">
                      Visit project
                    </ButtonLink>
                  )}
                  {project.repository_url && (
                    <ButtonLink
                      href={project.repository_url}
                      external
                      variant="secondary"
                      className="w-full sm:w-auto"
                    >
                      View repository
                    </ButtonLink>
                  )}
                </div>
              )}
            </div>

            {technologies.length > 0 && (
              <aside className="lg:col-span-4">
                <p className="eyebrow">Built with</p>
                <ul className="mt-4 space-y-2">
                  {technologies.map((technology) => (
                    <li
                      key={technology}
                      className="flex items-center gap-3 border-b border-[rgb(var(--border-subtle))] py-2 text-sm text-[rgb(var(--text-secondary))]"
                    >
                      <span
                        aria-hidden="true"
                        className="h-1 w-1 shrink-0 bg-[rgb(var(--accent))]"
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
        <div className="container-custom mt-12 sm:mt-16">
          <ProjectThumbnail
            src={project.thumbnail_url}
            alt={`${project.title} preview`}
            className="aspect-[16/9] border border-[rgb(var(--border-subtle))]"
            priority
            sizes="(min-width: 1280px) 1200px, 100vw"
          />
        </div>
      )}

      {/* ---- Body -------------------------------------------------------- */}
      {hasDescription && (
        <section className="container-custom py-16 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <p className="eyebrow">Overview</p>
            </div>
            <div className="prose-block max-w-2xl lg:col-span-8">
              {project.description?.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---- Gallery ----------------------------------------------------- */}
      {gallery.length > 0 && (
        <section className="border-t border-[rgb(var(--border-subtle))] py-16 sm:py-20">
          <div className="container-custom">
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-3">
                <p className="eyebrow">Gallery</p>
                <p className="mt-3 font-mono text-xs text-[rgb(var(--text-muted))]">
                  {gallery.length} {gallery.length === 1 ? 'image' : 'images'}
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
      <section className="border-t border-[rgb(var(--border-subtle))] py-12 sm:py-16">
        <div className="container-custom flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/projects"
            className="group inline-flex items-center gap-2 text-sm text-[rgb(var(--text-secondary))] transition-colors hover:text-[rgb(var(--text-primary))]"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
            Back to all projects
          </Link>

          {project.repository_url && (
            <a
              href={project.repository_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 font-mono text-xs text-[rgb(var(--text-muted))] transition-colors hover:text-[rgb(var(--accent))]"
            >
              <GitBranch className="h-3.5 w-3.5" aria-hidden="true" />
              Source
              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            </a>
          )}
        </div>
      </section>

      <RelatedProjects projects={related} />
    </article>
  )
}
