import type { Metadata } from 'next'
import { Award } from 'lucide-react'
import { getPublishedCertificates } from '@/lib/db/certificates'
import { CertificateEntry } from '@/components/certificates/certificate-entry'
import { EmptyState } from '@/components/ui/empty-state'
import { SectionShell } from '@/components/ui/section-shell'
import { ArrowLink } from '@/components/ui/arrow-link'
import { PageHeader } from '@/components/ui/page-header'
import { siteConfig } from '@/config/site'
import type { Certificate } from '@/types/certificate'

/** ISR, for the same reason as the homepage and the timeline. */
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Certificates',
  description: `Courses and training completed by ${siteConfig.personName}, with the issuer, date and topics covered for each.`,
  alternates: { canonical: '/certificates' },
  openGraph: {
    title: `Certificates — ${siteConfig.name}`,
    description: 'Courses and training completed along the way.',
    url: '/certificates',
  },
}

export default async function CertificatesPage() {
  const certificates = await getPublishedCertificates()

  return (
    <>
      <div className="container-custom">
        <PageHeader
          eyebrow="Certificates"
          title="Things I finished learning."
          lede="Courses and programmes that filled a specific gap. Each entry lists who issued it, when, what it covered, and a link to verify it if the issuer provides one. Credentials that have expired are marked rather than quietly dropped."
          action={
            <ArrowLink href="/experience" direction="up">
              Where I applied them
            </ArrowLink>
          }
          tone="section-tone-school"
          meta={
            <p className="meta">
              {certificates.length === 0
                ? 'No published certificates yet'
                : `${String(certificates.length).padStart(2, '0')} ${
                    certificates.length === 1 ? 'certificate' : 'certificates'
                  }, newest first`}
            </p>
          }
        />
      </div>

      <SectionShell tone="section-tone-school">
        <div className="container-custom">
          {certificates.length === 0 ? (
            <EmptyState
              className="mt-12"
              icon={<Award className="h-8 w-8" aria-hidden="true" />}
              title="No certificates published yet"
              description="Certificates appear here once they are added and published. The projects page shows what I have built instead."
              action={<ArrowLink href="/projects">Browse projects instead</ArrowLink>}
            />
          ) : (
            /*
              Grouped by the year the certificate was issued, newest group
              first. A flat list of fifteen rows gives a visitor no way to tell
              where they are or to judge how much of it they have already read;
              a year marker turns "a long list" into "four short ones", and it
              costs one line of markup per group.

              The certificate rows themselves are compact and expand in place
              (see `CertificateEntry`), so this page is a scannable index rather
              than a stack of full records.
            */
            groupByIssueYear(certificates).map((group) => (
              <section key={group.key} aria-labelledby={group.headingId} className="mt-10 first:mt-2">
                {/*
                  Sticky, so the current year stays visible while a long group
                  scrolls past. The fill has to be nearly opaque, otherwise the
                  rows pass visibly behind the marker. The alpha goes *inside*
                  the `rgb()` — the `/95` form produces no CSS at all (see the
                  note in globals.css).
                */}
                <h2
                  id={group.headingId}
                  className="sticky top-[var(--nav-h)] -mx-1 mb-1 flex items-baseline gap-3 bg-[rgb(var(--bg)/0.94)] px-1 py-2 backdrop-blur-sm"
                >
                  <span className="index-marker">{group.label}</span>
                  <span className="h-px flex-1 bg-[rgb(var(--border))]" aria-hidden="true" />
                  <span className="meta tabular-nums">
                    {String(group.items.length).padStart(2, '0')}
                  </span>
                </h2>

                <ul>
                  {group.items.map((certificate) => (
                    <li key={certificate.id}>
                      <CertificateEntry certificate={certificate} />
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      </SectionShell>
    </>
  )
}

interface CertificateYearGroup {
  key: string
  /** Year as written, or "Undated" for a record with an unusable date. */
  label: string
  /** Matches the `aria-labelledby` on the group's `<section>`. */
  headingId: string
  items: Certificate[]
}

/**
 * Splits an already-sorted list into year groups, keeping the incoming order.
 *
 * The list arrives newest first, so the groups do too. Rows whose `issue_date`
 * cannot be read as a year are collected into a single trailing group rather
 * than dropped: the column is `NOT NULL` and month-constrained, so this is a
 * fallback for hand-edited data, not an expected case.
 */
function groupByIssueYear(certificates: Certificate[]): CertificateYearGroup[] {
  const groups = new Map<string, CertificateYearGroup>()

  for (const certificate of certificates) {
    const year = /^(\d{4})/.exec(certificate.issue_date ?? '')?.[1]
    const key = year ?? 'undated'

    const existing = groups.get(key)
    if (existing) {
      existing.items.push(certificate)
      continue
    }

    groups.set(key, {
      key,
      label: year ?? 'Undated',
      // Derived from the key rather than from a counter, so it is stable across
      // renders and unique on the page.
      headingId: `certificates-${key}`,
      items: [certificate],
    })
  }

  return [...groups.values()]
}
