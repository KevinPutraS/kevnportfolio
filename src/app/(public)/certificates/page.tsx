import type { Metadata } from 'next'
import { Award } from 'lucide-react'
import { getPublishedCertificates } from '@/lib/db/certificates'
import { CertificateEntry } from '@/components/certificates/certificate-entry'
import { EmptyState } from '@/components/ui/empty-state'
import { ArrowLink } from '@/components/ui/arrow-link'
import { PageHeader } from '@/components/ui/page-header'
import { siteConfig } from '@/config/site'

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

      <section className="rule-top">
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
            <ul className="mt-2">
              {certificates.map((certificate) => (
                <li key={certificate.id}>
                  <CertificateEntry certificate={certificate} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  )
}
