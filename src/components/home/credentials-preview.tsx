import { getExperienceSummaries, EXPERIENCE_PREVIEW_LIMIT } from '@/lib/db/experience'
import { getPublishedCertificates, CERTIFICATE_PREVIEW_LIMIT } from '@/lib/db/certificates'
import { ArrowLink } from '@/components/ui/arrow-link'
import { experienceTypeLabels } from '@/config/site'
import { formatMonth } from '@/lib/utils/helpers'
import { formatDateRange } from '@/lib/validation/fields'

/**
 * Homepage teaser for /experience and /certificates.
 *
 * Two compact lists side by side rather than full previews: the timeline and
 * certificate pages carry the detail, and the homepage only needs to prove they
 * exist and show the shape of the content. Skipped entirely when both are
 * empty, so a portfolio that has not filled these in yet does not show two
 * empty headings.
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
            <h2 className="heading-2 mt-5 text-balance">Where the time went.</h2>
            <p className="mt-5 max-w-prose text-sm text-[rgb(var(--text-secondary))]">
              Roles, school projects and courses. Written down so the gaps are visible rather than
              inferred.
            </p>
          </div>

          {experiences.length > 0 ? (
            <div className="lg:col-span-4">
              <h3 className="caption text-[rgb(var(--text-muted))]">Experience</h3>
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
              <ArrowLink href="/experience" className="mt-6">
                Full timeline
              </ArrowLink>
            </div>
          ) : null}

          {certificates.length > 0 ? (
            <div className="lg:col-span-4">
              <h3 className="caption text-[rgb(var(--text-muted))]">Certificates</h3>
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
              <ArrowLink href="/certificates" className="mt-6">
                All certificates
              </ArrowLink>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
