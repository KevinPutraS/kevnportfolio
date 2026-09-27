import { ExternalLink } from 'lucide-react'
import { experienceTypeLabels } from '@/config/site'
import { formatDateRange } from '@/lib/validation/fields'
import type { Experience } from '@/types/experience'

/**
 * One entry in the public timeline.
 *
 * The vertical rule and the period column are what make it read as a timeline
 * rather than a list of jobs: the period sits in a narrow left column on wide
 * screens and moves inline above the title on mobile, where a 12-column grid
 * would only produce cramped empty gutters.
 */
export function ExperienceEntry({ experience }: { experience: Experience }) {
  const period = formatDateRange(
    experience.start_date,
    experience.end_date,
    experience.current
  )
  const technologies = experience.technologies ?? []

  return (
    <li className="group relative grid gap-4 border-t border-[rgb(var(--border-subtle))] py-10 md:grid-cols-12 md:gap-8 md:py-12">
      {/*
        The marker is decorative; the period text below carries the meaning, so
        it is hidden from assistive tech rather than announced twice.
      */}
      <span
        aria-hidden="true"
        className="absolute -top-px left-0 h-px w-8 bg-[rgb(var(--accent))] transition-all duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:w-16"
      />

      <div className="md:col-span-3">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-[rgb(var(--text-muted))]">
          {period || 'Date not set'}
        </p>
        <p className="mt-2 caption text-[rgb(var(--text-muted))]">
          {experienceTypeLabels[experience.employment_type]}
        </p>
      </div>

      <div className="md:col-span-9">
        <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
          <h3 className="heading-3 text-balance">{experience.title}</h3>

          {experience.current && (
            <span className="caption mt-1.5 text-[rgb(var(--accent))]">Current</span>
          )}
        </div>

        <p className="mt-2 text-[rgb(var(--text-secondary))]">
          {experience.organization}
          {experience.location ? (
            <>
              <span aria-hidden="true"> · </span>
              <span className="text-[rgb(var(--text-muted))]">{experience.location}</span>
            </>
          ) : null}
        </p>

        {experience.description ? (
          <p className="mt-4 max-w-prose text-[rgb(var(--text-secondary))]">{experience.description}</p>
        ) : null}

        {experience.responsibilities && experience.responsibilities.length > 0 ? (
          <ul className="mt-5 space-y-2">
            {experience.responsibilities.map((responsibility) => (
              <li
                key={responsibility}
                className="flex gap-3 text-sm leading-relaxed text-[rgb(var(--text-secondary))]"
              >
                <span aria-hidden="true" className="mt-2 h-px w-4 shrink-0 bg-[rgb(var(--border))]" />
                <span>{responsibility}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {technologies.length > 0 ? (
          <ul className="mt-6 flex flex-wrap gap-2">
            {technologies.map((technology) => (
              <li key={technology} className="badge-secondary">
                {technology}
              </li>
            ))}
          </ul>
        ) : null}

        {experience.project_url ? (
          <a
            href={experience.project_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[rgb(var(--text-secondary))] transition-colors hover:text-[rgb(var(--accent))]"
          >
            Related work
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        ) : null}
      </div>
    </li>
  )
}
