import type { Metadata } from 'next'
import { getAllExperiencesForAdmin } from '@/lib/db/experience'
import { ExperienceTableClient } from '@/components/admin/experience-table-client'
import { ButtonLink } from '@/components/ui/button-link'
import { EmptyState } from '@/components/ui/empty-state'
import { Briefcase } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Experience',
  robots: { index: false, follow: false },
}

export default async function AdminExperiencePage() {
  // The session client, so drafts are included — the RLS admin policy decides,
  // not this function.
  const experiences = await getAllExperiencesForAdmin()
  const published = experiences.filter((e) => e.published).length
  const currentCount = experiences.filter((e) => e.current).length

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Content</p>
          <h1 className="heading-2 mt-3">Experience</h1>
          <p className="mt-3 text-[rgb(var(--text-secondary))]">
            {experiences.length} {experiences.length === 1 ? 'entry' : 'entries'} · {published} published ·{' '}
            {currentCount} current.
          </p>
        </div>
        <ButtonLink href="/admin/experience/new">New entry</ButtonLink>
      </header>

      {experiences.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-8 w-8" aria-hidden="true" />}
          title="No experience entries yet"
          description="Add internships, school projects, organization work or anything else that shaped how you work."
          action={<ButtonLink href="/admin/experience/new">Add an entry</ButtonLink>}
        />
      ) : (
        <ExperienceTableClient experiences={experiences} />
      )}
    </div>
  )
}
