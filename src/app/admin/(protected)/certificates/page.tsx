import type { Metadata } from 'next'
import { getAllCertificatesForAdmin } from '@/lib/db/certificates'
import { CertificateTableClient } from '@/components/admin/certificate-table-client'
import { ButtonLink } from '@/components/ui/button-link'
import { EmptyState } from '@/components/ui/empty-state'
import { Award } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Certificates',
  robots: { index: false, follow: false },
}

export default async function AdminCertificatesPage() {
  // The session client, so drafts are included — the RLS admin policy decides,
  // not this function.
  const certificates = await getAllCertificatesForAdmin()
  const published = certificates.filter((c) => c.published).length

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Content</p>
          <h1 className="heading-2 mt-3">Certificates</h1>
          <p className="mt-3 text-[rgb(var(--text-secondary))]">
            {certificates.length} {certificates.length === 1 ? 'certificate' : 'certificates'} · {published}{' '}
            published.
          </p>
        </div>
        <ButtonLink href="/admin/certificates/new">New certificate</ButtonLink>
      </header>

      {certificates.length === 0 ? (
        <EmptyState
          icon={<Award className="h-8 w-8" aria-hidden="true" />}
          title="No certificates yet"
          description="Add a course certificate, a training programme or anything else worth recording."
          action={<ButtonLink href="/admin/certificates/new">Add a certificate</ButtonLink>}
        />
      ) : (
        <CertificateTableClient certificates={certificates} />
      )}
    </div>
  )
}
