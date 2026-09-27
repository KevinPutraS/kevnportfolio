import { experienceTypeLabels } from '@/config/site'
import { formatDateRange } from '@/lib/validation/fields'
import { ArrowLink } from '@/components/ui/arrow-link'
import type { Experience } from '@/types/experience'

/**
 * One entry in the public timeline.
 *
 * Reads top to bottom in the order a reader wants it: what the role was, who it
 * was for, when, what it involved, what it was built with, and where to see the
 * result.
 *
 * Three changes from the previous version:
 *
 * 1. Technologies were a row of bordered pills. On a timeline page that repeats
 *    the same treatment on every entry, the pills became the loudest thing on
 *    the page and buried the actual work. They are now a single separated line,
 *    consistent with the project cards.
 * 2. The organisation name is set in primary text directly under the role, so
 *    "who" is as findable as "what". It was previously the same recessive grey
 *    as the dates.
 * 3. "Related work" was 11px uppercase mono — a link that was easy to walk past.
 *    It uses the shared `ArrowLink` and is only rendered when a URL exists.
 */
export function ExperienceEntry({ experience }: { experience: Experience }) {
  const period = formatDateRange(experience.start_date, experience.end_date, experience.current)
  const technologies = experience.technologies ?? []
  const responsibilities = experience.responsibilities ?? []

  return (
    <li className="group relative grid gap-4 border-t border-[rgb(var(--border-subtle))] py-10 md:grid-cols-12 md:gap-8 md:py-12">
      {/*
        The marker is decorative; the period column carries the meaning, so it is
        hidden from assistive tech rather than announced twice.
      */}
      <span
        aria-hidden="true"
        className="absolute -top-px left-0 h-px w-8 bg-[rgb(var(--accent))] transition-all duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:w-16"
      />

      {/* Period and type, in a narrow left column on wide screens and inline
          above the title on mobile, where a 12-column grid would only produce
          cramped empty gutters. */}
      <div className="md:col-span-3">
        <p className="meta-strong">
          {period || 'Date not set'}
        </p>
        <p className="meta mt-1.5">{experienceTypeLabels[experience.employment_type]}</p>
      </div>

      <div className="md:col-span-9">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h3 className="heading-3 text-balance">{experience.title}</h3>

          {experience.current && (
            <span className="meta-strong rounded-sm bg-[rgb(var(--surface-elevated))] px-2 py-1 text-[rgb(var(--accent))]">
              Current
            </span>
          )}
        </div>

        <p className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          {experience.organization_logo_url && (
            <img
              src={experience.organization_logo_url}
              alt=""
              aria-hidden="true"
              className="h-6 w-auto shrink-0"
              loading="lazy"
            />
          )}
          <span className="text-[length:var(--text-lead)] font-medium text-[rgb(var(--text-primary))]">
            {experience.organization}
          </span>
          {experience.location ? (
            <span className="meta">· {experience.location}</span>
          ) : null}
        </p>

        {experience.description ? (
          <p className="mt-4 max-w-prose text-pretty text-[rgb(var(--text-secondary))]">
            {experience.description}
          </p>
        ) : null}

        {responsibilities.length > 0 && (
          <div className="mt-6">
            <p className="label">What I did</p>
            <ul className="mt-3 space-y-2.5">
              {responsibilities.map((responsibility) => (
                <li
                  key={responsibility}
                  className="flex gap-3 text-[length:var(--text-body-sm)] leading-relaxed text-[rgb(var(--text-secondary))]"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2.5 h-px w-4 shrink-0 bg-[rgb(var(--border))]"
                  />
                  <span>{responsibility}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {technologies.length > 0 && (
          <p className="tech-list mt-6">
            <span className="sr-only">Technologies used: </span>
            {technologies.join(' · ')}
          </p>
        )}

        {experience.project_url ? (
          <div className="mt-7">
            <ArrowLink href={experience.project_url} direction="up" external>
              Related work
            </ArrowLink>
          </div>
        ) : null}
      </div>
    </li>
  )
}
