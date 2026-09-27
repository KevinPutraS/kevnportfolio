import type { Metadata } from 'next'
import { Award } from 'lucide-react'
import { getPublishedCertificates } from '@/lib/db/certificates'
import { CertificateCard } from '@/components/certificates/certificate-card'
import { EmptyState } from '@/components/ui/empty-state'
import { siteConfig } from '@/config/site'

/** ISR, for the same reason as the homepage and the timeline. */
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Certificates',
  description: `Courses and training completed by ${siteConfig.name}.`,
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
      <header className="rule-top">
        <div className="container-custom pt-20 sm:pt-28">
          <p className="eyebrow">Certificates</p>
          <h1 className="heading-1 mt-6 max-w-3xl text-balance">Things I finished learning.</h1>
          <p className="mt-6 max-w-prose text-[rgb(var(--text-secondary))]">
            Courses and programmes that filled a specific gap. Each one lists what it actually
            covered, and expired credentials are marked rather than quietly dropped.
          </p>
        </div>
      </header>

      <section className="rule-top">
        <div className="container-custom">
          {certificates.length === 0 ? (
            <EmptyState
              className="mt-12"
              icon={<Award className="h-8 w-8" aria-hidden="true" />}
              title="Nothing published yet"
              description="Certificates appear here once they are added and published in the CMS."
            />
          ) : (
            <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {certificates.map((certificate) => (
                <li key={certificate.id} className="h-full">
                  <CertificateCard certificate={certificate} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  )
}
