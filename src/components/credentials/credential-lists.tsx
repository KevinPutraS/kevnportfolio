import { ArrowLink } from '@/components/ui/arrow-link'
import { experienceTypeLabels } from '@/config/site'
import { formatMonth } from '@/lib/utils/helpers'
import { formatDateRange } from '@/lib/validation/fields'
import type { ExperienceSummary } from '@/types/experience'
import type { Certificate } from '@/types/certificate'

/**
 * The paired experience / certificate list.
 *
 * Extracted because the homepage (`CredentialsPreview`) and the about page
 * (`BackgroundSummary`) were rendering the same two columns independently —
 * same markup, same ordering, same field selection, differing only in heading
 * and in how many rows they asked for. Two copies of that drift apart the first
 * time a field is added to one of them.
 *
 * The caller fetches the rows and owns the section heading; this component only
 * owns the presentation of the two lists. It renders `null` for a list with no
 * rows rather than an empty heading, so a half-populated section does not show a
 * dangling "Certificates" label over nothing.
 */
export function CredentialLists({
  experiences,
  certificates,
}: {
  experiences: ExperienceSummary[]
  certificates: Certificate[]
}) {
  if (experiences.length === 0 && certificates.length === 0) return null

  return (
    <div className="grid gap-10 sm:grid-cols-2">
      {experiences.length > 0 && (
        <div>
          <h3 className="label">Experience</h3>
          <ul>
            {experiences.map((experience) => (
              <li
                key={experience.id}
                className="border-t border-[rgb(var(--border-subtle))] py-4 first:border-t-0 first:pt-0"
              >
                <p className="font-medium leading-snug">{experience.title}</p>
                <p className="mt-1 text-[length:var(--text-body-sm)] text-[rgb(var(--text-secondary))]">
                  {experience.organization}
                </p>
                <p className="meta mt-1.5 tabular-nums">
                  {formatDateRange(experience.start_date, experience.end_date, experience.current) ||
                    experienceTypeLabels[experience.employment_type]}
                </p>
              </li>
            ))}
          </ul>
          <ArrowLink href="/experience" className="mt-5">
            Full timeline
          </ArrowLink>
        </div>
      )}

      {certificates.length > 0 && (
        <div>
          <h3 className="label">Certificates</h3>
          <ul>
            {certificates.map((certificate) => (
              <li
                key={certificate.id}
                className="border-t border-[rgb(var(--border-subtle))] py-4 first:border-t-0 first:pt-0"
              >
                <p className="font-medium leading-snug">{certificate.title}</p>
                <p className="mt-1 text-[length:var(--text-body-sm)] text-[rgb(var(--text-secondary))]">
                  {certificate.issuer}
                </p>
                {certificate.issue_date ? (
                  <p className="meta mt-1.5 tabular-nums">{formatMonth(certificate.issue_date)}</p>
                ) : null}
              </li>
            ))}
          </ul>
          <ArrowLink href="/certificates" className="mt-5">
            All certificates
          </ArrowLink>
        </div>
      )}
    </div>
  )
}
