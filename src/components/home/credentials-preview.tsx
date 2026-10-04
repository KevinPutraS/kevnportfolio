import { getExperienceSummaries, EXPERIENCE_PREVIEW_LIMIT } from '@/lib/db/experience'
import { getPublishedCertificates, CERTIFICATE_PREVIEW_LIMIT } from '@/lib/db/certificates'
import { CredentialLists } from '@/components/credentials/credential-lists'
import { SectionShell, SectionEyebrow } from '@/components/ui/section-shell'

/**
 * Homepage teaser for /experience and /certificates.
 *
 * Two compact lists side by side rather than full previews: the timeline and
 * certificate pages carry the detail, and the homepage only needs to prove they
 * exist and show the shape of the content. Skipped entirely when both are
 * empty, so a portfolio that has not filled these in yet does not show two
 * empty headings.
 *
 * The markup lives in `CredentialLists`, shared with the about page.
 */
export async function CredentialsPreview() {
  const [experiences, certificates] = await Promise.all([
    getExperienceSummaries(EXPERIENCE_PREVIEW_LIMIT),
    getPublishedCertificates({ limit: CERTIFICATE_PREVIEW_LIMIT }),
  ])

  if (experiences.length === 0 && certificates.length === 0) return null

  return (
    <SectionShell tone="section-tone-networking" index="03">
      <div className="container-custom py-16 lg:py-24">
        <div className="grid gap-x-10 gap-y-12 lg:grid-cols-12">
          {/*
            Heading only. The previous version added "Roles, school projects and
            courses. Written down so the gaps are visible rather than inferred." —
            two sentences explaining the obvious, immediately above a list that
            already shows exactly that.

            The heading is capped at 11ch so it breaks after "Experience" on a
            desktop. Set across a 4-column track at the open end of the display
            scale it otherwise ran to four words a line, which is a shape, not a
            heading.
          */}
          <div className="lg:col-span-4">
            <SectionEyebrow>Background</SectionEyebrow>
            <h2 className="heading-2 mt-5 max-w-[11ch] text-balance">
              Experience and certificates.
            </h2>
          </div>

          <div className="lg:col-span-8">
            <CredentialLists experiences={experiences} certificates={certificates} />
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
