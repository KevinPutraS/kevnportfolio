import { getExperienceSummaries } from '@/lib/db/experience'
import { getPublishedCertificates } from '@/lib/db/certificates'
import { CredentialLists } from '@/components/credentials/credential-lists'

/**
 * Compact experience and certificate summary for the About page.
 *
 * Returns `null` when there is nothing published, which is deliberate. The rest
 * of the About page is static copy that makes no claims about employment or
 * credentials, and that promise only holds if this section stays silent until
 * real records exist. Inventing plausible-looking rows here would undo the
 * point of the page.
 *
 * The markup lives in `CredentialLists`, shared with the homepage.
 */
export async function BackgroundSummary() {
  const [experiences, certificates] = await Promise.all([
    getExperienceSummaries(3),
    getPublishedCertificates({ limit: 3 }),
  ])

  if (experiences.length === 0 && certificates.length === 0) return null

  return (
    <section className="rule-top">
      <div className="container-custom">
        <div className="rhythm-lg grid gap-x-10 gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <p className="eyebrow">Background</p>
            <h2 className="heading-2 mt-5 max-w-[12ch] text-balance">Where this has happened</h2>
          </div>

          <div className="lg:col-span-9">
            <CredentialLists experiences={experiences} certificates={certificates} />
          </div>
        </div>
      </div>
    </section>
  )
}
