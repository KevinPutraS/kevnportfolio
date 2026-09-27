import type { Metadata } from 'next'
import { Briefcase } from 'lucide-react'
import { getPublishedExperiences } from '@/lib/db/experience'
import { ExperienceEntry } from '@/components/experience/experience-entry'
import { EmptyState } from '@/components/ui/empty-state'
import { SectionShell } from '@/components/ui/section-shell'
import { ArrowLink } from '@/components/ui/arrow-link'
import { PageHeader } from '@/components/ui/page-header'
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
  description: `Internships, school projects and organization work by ${siteConfig.personName}, written as what was actually done.`,
  alternates: { canonical: '/experience' },
  openGraph: {
    title: `Experience — ${siteConfig.name}`,
    description: 'Internships, school projects and organization work, written as what was done.',
    url: '/experience',
  },
}

export default async function ExperiencePage() {
  const experiences = await getPublishedExperiences()

  return (
    <>
      <div className="container-custom">
        <PageHeader
          eyebrow="Experience"
          title="Where I have worked and built."
          lede="Internships, school projects, committee work and anything else that taught me something. Each entry lists what I actually did, not just the job title — and it is listed newest first."
          action={
            <ArrowLink href="/projects" direction="up">
              See the projects
            </ArrowLink>
          }
          meta={
            <p className="meta">
              {experiences.length === 0
                ? 'No published entries yet'
                : `${String(experiences.length).padStart(2, '0')} ${
                    experiences.length === 1 ? 'entry' : 'entries'
                  }, newest first`}
            </p>
          }
        />
      </div>

      <SectionShell tone="section-tone-app">
        <div className="container-custom">
          {experiences.length === 0 ? (
            <EmptyState
              className="mt-12"
              icon={<Briefcase className="h-8 w-8" aria-hidden="true" />}
              title="No experience published yet"
              description="Entries appear here once they are added and published. In the meantime, the projects page shows what I have built and the about page explains how I work."
              action={
                <ArrowLink href="/projects">Browse projects instead</ArrowLink>
              }
            />
          ) : (
            /*
              The spine is drawn once, here, rather than per entry. Each entry
              contributes only its node and card, so the column reads as one
              continuous line of history instead of a stack of separate boxes.
            */
            <div className="relative mt-2">
              <span
                aria-hidden="true"
                className="absolute bottom-6 left-[7px] top-8 w-px bg-gradient-to-b from-[rgb(var(--cat-web))] via-[rgb(var(--cat-design))] to-[rgb(var(--cat-experiment))] opacity-40"
              />
              <ol>
                {experiences.map((experience, index) => (
                  <ExperienceEntry
                    key={experience.id}
                    experience={experience}
                    index={index}
                  />
                ))}
              </ol>
            </div>
          )}
        </div>
      </SectionShell>
    </>
  )
}
