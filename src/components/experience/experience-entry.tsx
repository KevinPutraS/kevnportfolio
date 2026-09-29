import { experienceTypeLabels } from '@/config/site'
import { formatDateRange } from '@/lib/validation/fields'
import { ArrowLink } from '@/components/ui/arrow-link'
import { OrganizationLogo } from './organization-logo'
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
 * ## What makes the card scannable
 *
 * Everything on it is visible at once — no disclosure, no "read more", nothing
 * hidden behind a tap. That is a rule, not a preference: the certificate page was
 * once compacted into expandable rows and it made the section worse, because a
 * visitor could no longer tell at a glance which certificates were real. So the
 * budget for making this card modern was spent entirely on hierarchy and
 * spacing, never on concealment.
 *
 * The order is what a reader's eye does anyway: *what was the job, for whom, how
 * long, am I still there, what did I do, what with.* So the identity comes first
 * (logo, title, organisation), the timeline metadata sits on the same baseline as
 * the title instead of in a row of its own, and the prose starts only after that
 * block is over.
 *
 * Two structural notes:
 *
 *  - The period is in the same flex row as the title with `justify-between`, not
 *    in a third column. A separate column would have to either squeeze the title
 *    on a 320px screen or hide itself below a breakpoint, and a date you have to
 *    scroll to find is not a date you can scan. Wrapping onto its own line when
 *    the title is long is the responsive answer, and it needs no duplicate markup.
 *  - `Current` leads the chip row. It is the only chip that answers a question a
 *    visitor actually asks of a timeline, so it gets the first and most prominent
 *    position; the employment type follows as classification.
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
          scrollbar on a phone, which is the one overflow a timeline must not have.

          The current role used to be marked with a soft halo ring outside the
          node; that is gone with the rest of the glow. A filled accent node
          against a hollow one is signal enough.

          Sits at `top-8`, which lines it up with the optical centre of the job
          title rather than with the top edge of the entry. */}
      <span
        aria-hidden="true"
        className={classNames(
          'absolute left-[7px] top-8 z-10 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 transition-colors duration-500 sm:top-9',
          isCurrent
            ? 'border-[rgb(var(--accent))] bg-[rgb(var(--accent))]'
            : 'border-[rgb(var(--border-strong))] bg-[rgb(var(--bg))] group-hover:border-[rgb(var(--accent))]'
        )}
      />

      <article className="pb-10 pl-8 sm:pb-12 sm:pl-10">
        {/* The entry itself. This was a raised card — `rounded-2xl`, its own
            background, a lift and a shadow on hover, and a blurred colour wash
            bleeding from the top corner. The spine is the shape of a timeline
            and the entries needed to hang off it quietly, so the box and its
            wash are gone and the entry reads as type. The hover is now a word
            changing colour, not the whole block lifting. */}
        <div className="relative">
          <div className="flex flex-wrap items-start gap-x-4 gap-y-3 sm:gap-x-5">
            {/* 64px on desktop, up from 56px. The logo is the only non-text
                element in the row and it is what lets a visitor scan the column
                instead of reading it, so it gets the room. */}
            <OrganizationLogo
              src={experience.organization_logo_url}
              name={experience.organization}
              className="h-14 w-14 sm:h-16 sm:w-16"
            />

            <div className="min-w-0 flex-1">
              <h3 className="text-balance break-words font-display text-xl font-bold leading-[1.15] tracking-[-0.025em] text-[rgb(var(--text))] transition-colors duration-300 group-hover:text-[rgb(var(--accent))] sm:text-2xl">
                {experience.title}
              </h3>

              <p className="mt-1.5 break-words font-medium text-[rgb(var(--text-dim))]">
                {experience.organization}
                {experience.location && <span className="meta"> · {experience.location}</span>}
              </p>
            </div>

            {/*
              The period and the chips, in their own row.

              This is the third attempt at this row, and the arithmetic is worth
              writing down because the failure is invisible until it is not. The
              text column beside a 56px logo, on a 320px screen, is:

                  320 viewport
                  − 40  container-custom padding-inline
                  − 32  the timeline's pl-8 indent
                  − 56  the logo
                  − 16  the gap
                  = 176px

              (Wider than it used to be: the entry no longer sits in a padded
              card, so the 40px of card padding it paid is back in the budget.)

              And the period is not the string it looks like. `formatMonth` uses
              `month: 'long'`, rendered through `meta-strong` — 12px mono,
              uppercase, 0.14em of tracking — so it arrives as:

                  "SEPTEMBER 2021 — PRESENT"        23 chars ≈ 204px
                  "SEPTEMBER 2021 — DECEMBER 2026"  29 chars ≈ 258px

              Two conclusions. `w-full` below `sm` is worth having: 248px instead
              of 176px keeps the common range on one line. But 248px is not
              enough for the longest one, and no font size or tracking value
              fixes that within a 176px budget — so this row wraps, deliberately,
              onto a second line at the space before the end date.

              That is why the `<time>` has no `whitespace-nowrap` and no
              `shrink-0`: an unbreakable range with nowhere to fit overruns the
              column. `min-w-0` lets it shrink to its longest word and wrap
              there instead, so the whole range is always readable. A two-line
              date is a normal thing to see on a phone. A date missing its year
              is not.

              At `sm` the row is content-sized with `sm:ml-auto` setting it
              against the right edge, beside the identity block, where there are
              hundreds of pixels and no constraint left to reason about.
            */}
            <div className="flex w-full min-w-0 flex-wrap items-center gap-x-3 gap-y-2 sm:ml-auto sm:w-auto">
              {/* `tabular-nums` so the months line up when several entries are
                  read against each other. No `nowrap`: see above. */}
              <time className="meta-strong min-w-0 tabular-nums">
                {period || 'Date not set'}
              </time>

              {isCurrent && <span className="badge-primary">Current</span>}
              <span className="cat-chip inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-[0.1em]">
                <span aria-hidden="true" className="cat-dot h-1.5 w-1.5 rounded-full" />
                {experienceTypeLabels[experience.employment_type]}
              </span>
            </div>
          </div>

          {experience.description && (
            <p className="relative mt-5 max-w-prose text-pretty leading-relaxed text-[rgb(var(--text-dim))]">
              {experience.description}
            </p>
          )}

          {/*
            A real `list-disc` list rather than flex rows with a hand-placed dot.
            The marker is positioned by the browser, so the bullet cannot drift
            out of alignment with the text, and the list keeps its semantics for a
            screen reader without a `role="list"` patch.
          */}
          {responsibilities.length > 0 && (
            <ul className="relative mt-4 max-w-prose list-disc space-y-1.5 pl-5 marker:text-[rgb(var(--cat))]">
              {responsibilities.map((responsibility) => (
                <li
                  key={responsibility}
                  className="text-[length:var(--text-sm)] leading-relaxed text-[rgb(var(--text-dim))]"
                >
                  {responsibility}
                </li>
              ))}
            </ul>
          )}

          <div className="relative mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-[rgb(var(--border))] pt-4">
            {/*
              `break-words` for the same reason as the organisation above: a
              single long technology name is the one string here that can exceed
              the column.
            */}
            {technologies.length > 0 ? (
              <p className="tech-list break-words">
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
