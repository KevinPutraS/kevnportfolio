import Link from 'next/link'
import { getExperienceSummaries } from '@/lib/db/experience'
import { getPublishedCertificates } from '@/lib/db/certificates'
import { experienceTypeLabels } from '@/config/site'
import { formatMonth } from '@/lib/utils/helpers'
import { formatDateRange } from '@/lib/validation/fields'

/**
 * Compact experience and certificate summary for the About page.
 *
 * Returns `null` when there is nothing published, which is deliberate. The rest
 * of the About page is static copy that makes no claims about employment or
 * credentials, and that promise only holds if this section stays silent until
 * real records exist. Inventing plausible-looking rows here would undo the
 * point of the page.
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

          <div className="grid gap-10 lg:col-span-9 sm:grid-cols-2">
            {experiences.length > 0 ? (
              <div>
                <h3 className="meta-label">Experience</h3>
                <ul className="mt-5">
                  {experiences.map((experience) => (
                    <li
                      key={experience.id}
                      className="border-t border-[rgb(var(--border-subtle))] py-4 first:border-t-0 first:pt-0"
                    >
                      <p className="font-medium leading-snug">{experience.title}</p>
                      <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
                        {experience.organization}
                      </p>
                      <p className="mt-1.5 font-mono text-xs text-[rgb(var(--text-muted))]">
                        {formatDateRange(
                          experience.start_date,
                          experience.end_date,
                          experience.current
                        ) || experienceTypeLabels[experience.employment_type]}
                      </p>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/experience"
                  className="mt-4 inline-block font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[rgb(var(--text-secondary))] transition-colors hover:text-[rgb(var(--accent))]"
                >
                  Full timeline
                </Link>
              </div>
            ) : null}

            {certificates.length > 0 ? (
              <div>
                <h3 className="meta-label">Certificates</h3>
                <ul className="mt-5">
                  {certificates.map((certificate) => (
                    <li
                      key={certificate.id}
                      className="border-t border-[rgb(var(--border-subtle))] py-4 first:border-t-0 first:pt-0"
                    >
                      <p className="font-medium leading-snug">{certificate.title}</p>
                      <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
                        {certificate.issuer}
                      </p>
                      {certificate.issue_date ? (
                        <p className="mt-1.5 font-mono text-xs text-[rgb(var(--text-muted))]">
                          {formatMonth(certificate.issue_date)}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/certificates"
                  className="mt-4 inline-block font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[rgb(var(--text-secondary))] transition-colors hover:text-[rgb(var(--accent))]"
                >
                  All certificates
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
