import type { Metadata } from 'next'
import { Briefcase } from 'lucide-react'
import { getPublishedExperiences } from '@/lib/db/experience'
import { ExperienceEntry } from '@/components/experience/experience-entry'
import { EmptyState } from '@/components/ui/empty-state'
import { siteConfig } from '@/config/site'

/**
 * Public timeline.
 *
 * ISR like the homepage: the read uses the cookie-less client, so this page
 * stays statically generated and publishing from the CMS shows up without a
 * redeploy.
 */
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Experience',
  description: `Roles, school projects and organization work by ${siteConfig.name}.`,
  alternates: { canonical: '/experience' },
  openGraph: {
    title: `Experience — ${siteConfig.name}`,
    description: 'Roles, school projects and organization work.',
    url: '/experience',
  },
}

export default async function ExperiencePage() {
  const experiences = await getPublishedExperiences()

  return (
    <>
      <header className="rule-top">
        <div className="container-custom pt-20 sm:pt-28">
          <p className="eyebrow">Experience</p>
          <h1 className="heading-1 mt-6 max-w-3xl text-balance">Where I have worked and built.</h1>
          <p className="mt-6 max-w-prose text-[rgb(var(--text-secondary))]">
            Internships, coursework and committees alongside anything else that shaped how I
            work. Written as what I actually did rather than a list of responsibilities.
          </p>
        </div>
      </header>

      <section className="rule-top">
        <div className="container-custom">
          {experiences.length === 0 ? (
            <EmptyState
              className="mt-12"
              icon={<Briefcase className="h-8 w-8" aria-hidden="true" />}
              title="Nothing published yet"
              description="Experience entries appear here once they are added and published in the CMS."
            />
          ) : (
            <ol className="mt-2">
              {experiences.map((experience) => (
                <ExperienceEntry key={experience.id} experience={experience} />
              ))}
            </ol>
          )}
        </div>
      </section>
    </>
  )
}
