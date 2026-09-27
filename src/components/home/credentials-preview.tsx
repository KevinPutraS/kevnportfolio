import { getExperienceSummaries, EXPERIENCE_PREVIEW_LIMIT } from '@/lib/db/experience'
import { getPublishedCertificates, CERTIFICATE_PREVIEW_LIMIT } from '@/lib/db/certificates'
import { CredentialLists } from '@/components/credentials/credential-lists'

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
    <section className="rule-top">
      <div className="container-custom rhythm-lg">
        <div className="grid gap-x-10 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow">Background</p>
            <h2 className="heading-2 mt-5 text-balance">Experience and certificates.</h2>
            <p className="mt-5 max-w-prose text-[length:var(--text-body-sm)] text-[rgb(var(--text-secondary))]">
              Roles, school projects and courses. Written down so the gaps are visible rather than
              inferred.
            </p>
          </div>

          <div className="lg:col-span-8">
            <CredentialLists experiences={experiences} certificates={certificates} />
          </div>
        </div>
      </div>
    </section>
  )
}
