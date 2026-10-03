import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProjectBySlug, getRelatedProjects } from '@/lib/db/projects'
import { siteConfig } from '@/config/site'
import { ProjectDetail } from '@/components/projects/project-detail'

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
 * project 404s for visitors and is invisible to search engines. The admin's draft
 * preview does not go through this route — it renders the shared body directly
 * from `getProjectById`, which is why that filter stays here.
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

  return <ProjectDetail project={project} related={related} />
}