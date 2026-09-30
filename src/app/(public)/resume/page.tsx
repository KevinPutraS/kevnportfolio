import { getPublishedExperiences } from '@/lib/db/experience'
import { getPublishedCertificates } from '@/lib/db/certificates'
import { getProjects } from '@/lib/db/projects'
import { buildResumeContent } from '@/lib/resume/content'
import { PageHeader } from '@/components/ui/page-header'
import { ResumePreview } from '@/components/resume/preview'
import { ResumeActions } from '@/components/resume/resume-actions'

/**
 * The resume route.
 *
 * This file used to *be* the resume: 460 lines of markup and utility classes
 * describing a page that happened to be printable. It is now a shell — three
 * queries, one call to the content layer, and a preview. The document itself is
 * `src/components/resume/document.tsx` and its geometry is in `globals.css`, and
 * the two are separated because they are genuinely different concerns: what the
 * document says, and what a sheet of A4 looks like.
 *
 * The reason for the split is that the two had drifted. Every layout decision
 * lived in JSX utility classes expressed in `rem` and `vw`, none of which relate
 * to a 210mm page, so the printed result was not a smaller version of the screen
 * result — it was a different document, one nobody had looked at. A document with
 * real millimetre geometry and a print stylesheet that does not contradict it
 * cannot drift that way: there is one source of truth for the geometry, and the
 * preview and the PDF render the same elements.
 *
 * What this page deliberately still does not do:
 *
 *  - **No skills bars.** "JavaScript 80%" is a number nobody can check and that
 *    means nothing beside someone who has seen the work. The tool groups are
 *    listed plainly and the entries above them are the evidence.
 *  - **No education section.** Nothing in the schema models it, and inventing a
 *    section to fill a space is worse than the space. When there is a table to
 *    read it from, it is one entry in `RESUME_SECTION_ORDER` and one case in
 *    `buildDocument`.
 */
export const revalidate = 60

export const metadata = {
  title: 'Resume',
  description:
    'A printable A4 resume: experience, selected work, tools and certifications, built from the same published records as the rest of the site.',
  alternates: { canonical: '/resume' },
  openGraph: {
    title: 'Resume',
    description: 'Experience, selected work and credentials as a printable A4 document.',
    url: '/resume',
  },
}

/** Reserved for the preview while the document is still being measured. */
export default async function ResumePage() {
  const [experiences, certificates, projectPage] = await Promise.all([
    getPublishedExperiences(),
    getPublishedCertificates(),
    /*
     * Over-fetched on purpose. `buildResumeContent` caps what reaches the page,
     * and it is the layer that should make that decision: the query layer's job
     * is "give me the published rows in order", not "know what a CV needs". So it
     * fetches 12 and the content layer decides that five is the number that reads
     * well. Asking the query for exactly five would move a presentation decision
     * into the wrong layer, where the next person to add a project would not know
     * to look.
     */
    getProjects({ page: 1, pageSize: 12 }),
  ])

  const content = buildResumeContent({
    experiences,
    projects: projectPage.projects,
    certificates,
  })

  return (
    <>
      <div className="container-custom print:hidden">
        <PageHeader
          eyebrow="Resume"
          title="The short version."
          lede="A printable A4 document, built from the same published records as the rest of this site so the two cannot disagree. Zoom, page through it, or print it to a PDF — the preview and the PDF are the same pages."
          tone="section-tone-app"
          action={<ResumeActions />}
        />
      </div>

      {/*
        The document, and the only part of this route that prints. The page
        header above it is screen chrome: a heading, a paragraph of instructions
        and a button row are not the first thing on a sheet of A4 a recruiter is
        handed. The viewer itself is *not* hidden in print — it is the document —
        so the print block removes its scale, its background and its controls
        rather than the whole thing.
      */}
      <div className="resume-shell">
        <ResumePreview content={content} />
      </div>
    </>
  )
}
