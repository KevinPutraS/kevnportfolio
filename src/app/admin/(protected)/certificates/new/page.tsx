import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { CertificateForm } from '@/components/admin/certificate-form'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'New certificate',
  robots: { index: false, follow: false },
}

export default function NewCertificatePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/certificates"
        className="group inline-flex items-center gap-2 font-mono text-xs text-[rgb(var(--text-muted))] transition-colors hover:text-[rgb(var(--accent))]"
      >
        <ArrowLeft
          className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1"
          aria-hidden="true"
        />
        All certificates
      </Link>

      <header className="mt-8">
        <p className="eyebrow">Create</p>
        <h1 className="heading-2 mt-3">New certificate</h1>
        <p className="mt-3 text-[rgb(var(--text-secondary))]">
          Certificates are saved as drafts. Publish when they are ready to show.
        </p>
      </header>

      <div className="mt-10">
        {/* No `certificate` prop: the form starts empty. */}
        <CertificateForm />
      </div>
    </div>
  )
}
