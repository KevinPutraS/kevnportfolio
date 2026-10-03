import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProjectById, getRelatedProjects } from '@/lib/db/projects'
import { ProjectDetail } from '@/components/projects/project-detail'
import { isUuid } from '@/lib/utils/validation'

/**
 * Renders the real case-study body for a project that is not published yet.
 *
 * Why this route exists at all: the public route filters on `published = true`,
 * so before publishing there was no way to see the page the work would produce.
 * The only honest options were to publish and hope, or to open a database console.
 * Neither is a review step — one risks the work going live unseen, the other shows
 * fields rather than a page. This is the missing middle: the actual layout,
 * served from the saved row, behind the admin session.
 *
 * It is preview of the *saved* project, not of the open editor. Adding a preview
 * link to the form would be actively misleading — the form's in-memory state is
 * not what this reads — so the entry point lives on the projects table instead,
 * where nothing is half-edited.
 *
 * `force-dynamic` for the same reason the public route is dynamic, and more
 * sharply: caching this route would cache the draft, so an admin could save a fix,
 * hit preview, and be shown the pre-fix page. A preview that can be stale is worse
 * than no preview, because it looks like an answer.
 */
export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  /*
   * No `notFound()` here. The metadata resolver runs outside the render tree the
   * not-found boundary wraps, so throwing would serve a bare 404 with an empty
   * body instead of the page. The body below stays the authority on the status
   * code; this only sets the tab title.
   */
  const project = await isUuid(params.id) ? await getProjectById(params.id) : null

  return {
    title: project ? `Preview: ${project.title}` : 'Preview project',
    // Belt and braces: the admin shell is already behind a session and already
    // noindexed, and this route is not linked from anywhere public.
    robots: { index: false, follow: false },
  }
}

export default async function PreviewProjectPage({ params }: { params: { id: string } }) {
  // Reject non-UUIDs before hitting the database: Postgres would raise an
  // invalid input syntax error for a malformed id.
  if (!isUuid(params.id)) notFound()

  const project = await getProjectById(params.id)
  if (!project) notFound()

  /*
   * Related projects are fetched through the public client, so the rail below the
   * case study shows published neighbours even when the project itself is a draft.
   * That is deliberate: the rail is not under review, and having it empty or full
   * of drafts would misrepresent the published page.
   */
  const related = await getRelatedProjects(project.slug, project.category, 3)

  return <ProjectDetail project={project} related={related} isPreview />
}