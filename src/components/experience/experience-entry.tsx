import { experienceTypeLabels } from '@/config/site'
import { formatDateRange } from '@/lib/validation/fields'
import { ArrowLink } from '@/components/ui/arrow-link'
import { classNames } from '@/lib/utils/helpers'
import type { Experience } from '@/types/experience'

/**
 * Colours cycle through the category palette so a column of entries is
 * scannable at a glance. Decorative only — an entry's colour carries no meaning,
 * it just stops a list of identical cards from reading as a table.
 */
const tone = ['cat-web', 'cat-app', 'cat-design', 'cat-networking', 'cat-experiment'] as const

/**
 * One entry on the timeline.
 *
 * The page draws a single vertical spine and this component only contributes the
 * node and the card that hang off it. An earlier version drew a per-entry rule as
 * well, which doubled the lines and made the column look like a stack of unrelated
 * boxes rather than one continuous history.
 *
 * The logo is a 56px tile because it is the only thing in the row that is not
 * text — it is what lets a visitor scan down a column instead of reading it.
 */
export function ExperienceEntry({
  experience,
  index,
}: {
  experience: Experience
  index: number
}) {
  const period = formatDateRange(experience.start_date, experience.end_date, experience.current)
  const technologies = experience.technologies ?? []
  const responsibilities = experience.responsibilities ?? []
  const isCurrent = experience.current

  return (
    <li className={classNames('group relative', tone[index % tone.length])}>
      {/* Node on the spine. Hollow while dormant, filled for the current role.
          Inset to `left-[7px]` rather than `left-0` with a -50% translate: that
          would push half the node outside the container and produce a horizontal
          scrollbar on a phone, which is the one overflow a timeline must not have. */}
      <span
        aria-hidden="true"
        className={classNames(
          'absolute left-[7px] top-7 z-10 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 transition-all duration-500',
          isCurrent
            ? 'cat-dot border-[rgb(var(--cat))] shadow-[0_0_0_5px_rgb(var(--cat)/0.18)]'
            : 'border-[rgb(var(--border-strong))] bg-[rgb(var(--bg))] group-hover:border-[rgb(var(--cat))] group-hover:bg-[rgb(var(--cat))]'
        )}
      />

      <article className="pb-12 pl-8 sm:pl-10">
        <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] p-5 transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1 hover:border-[rgb(var(--cat)/0.5)] hover:shadow-[0_26px_54px_-30px_rgb(0_0_0/0.8)] sm:p-7">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <time className="meta-strong tabular-nums">{period || 'Date not set'}</time>
            <span className="cat-chip inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-[0.1em]">
              <span aria-hidden="true" className="cat-dot h-1.5 w-1.5 rounded-full" />
              {experienceTypeLabels[experience.employment_type]}
            </span>
            {isCurrent && <span className="badge-primary">Current</span>}
          </div>

          <div className="mt-4 flex items-start gap-4">
            {experience.organization_logo_url ? (
              <img
                src={experience.organization_logo_url}
                alt=""
                aria-hidden="true"
                className="h-14 w-14 shrink-0 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-highlight))] object-contain p-2"
                loading="lazy"
              />
            ) : null}

            <div className="min-w-0 flex-1">
              <h3 className="text-balance font-display text-xl font-bold leading-[1.15] tracking-[-0.025em] text-[rgb(var(--text))] transition-colors duration-300 group-hover:text-[rgb(var(--cat))] sm:text-2xl">
                {experience.title}
              </h3>

              <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="font-medium text-[rgb(var(--text-dim))]">
                  {experience.organization}
                </span>
                {experience.location && <span className="meta">· {experience.location}</span>}
              </p>
            </div>
          </div>

          {experience.description && (
            <p className="mt-5 max-w-prose text-pretty leading-relaxed text-[rgb(var(--text-dim))]">
              {experience.description}
            </p>
          )}

          {responsibilities.length > 0 && (
            <ul className="mt-5 max-w-prose space-y-2" role="list">
              {responsibilities.map((responsibility) => (
                <li
                  key={responsibility}
                  className="relative pl-5 text-[length:var(--text-sm)] leading-relaxed text-[rgb(var(--text-dim))]"
                >
                  <span
                    aria-hidden="true"
                    className="cat-dot absolute left-0 top-[0.62em] h-1.5 w-1.5 rounded-full"
                  />
                  {responsibility}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-[rgb(var(--border))] pt-4">
            {technologies.length > 0 ? (
              <p className="tech-list">
                <span className="sr-only">Technologies used: </span>
                {technologies.join(' · ')}
              </p>
            ) : (
              <span />
            )}

            {experience.project_url && (
              <ArrowLink
                href={experience.project_url}
                direction="up"
                external
                className="shrink-0"
              >
                Related work
              </ArrowLink>
            )}
          </div>
        </div>
      </article>
    </li>
  )
}
