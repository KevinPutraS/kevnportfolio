import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { getExperienceById } from '@/lib/db/experience'
import { ExperienceForm } from '@/components/admin/experience-form'
import { experienceTypeLabels } from '@/config/site'
import { formatDateRange } from '@/lib/validation/fields'
import { isUuid } from '@/lib/utils/validation'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Edit experience entry',
  robots: { index: false, follow: false },
}

export default async function EditExperiencePage({ params }: { params: { id: string } }) {
  // Reject non-UUIDs before hitting the database: Postgres would raise an
  // invalid input syntax error for a malformed id.
  if (!isUuid(params.id)) notFound()

  const experience = await getExperienceById(params.id)
  if (!experience) notFound()

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/experience"
        className="group inline-flex items-center gap-2 font-mono text-xs text-[rgb(var(--text-muted))] transition-colors hover:text-[rgb(var(--accent))]"
      >
        <ArrowLeft
          className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1"
          aria-hidden="true"
        />
        All experience entries
      </Link>

      <header className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow">Edit</p>
          <h1 className="heading-2 mt-3 break-words">{experience.title}</h1>
          <p className="mt-3 font-mono text-xs text-[rgb(var(--text-muted))]">
            {experienceTypeLabels[experience.employment_type]}
            {' · '}
            {formatDateRange(experience.start_date, experience.end_date, experience.current) || 'No period'}
          </p>
        </div>

        {experience.published && (
          <a
            href="/experience"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-2 border border-[rgb(var(--border))] px-4 text-sm text-[rgb(var(--text-secondary))] transition-colors hover:border-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))]"
          >
            View live
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        )}
      </header>

      <div className="mt-10">
        <ExperienceForm experience={experience} />
      </div>
    </div>
  )
}
