import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { categoryLabels, type ProjectCategory } from '@/config/site'
import { projectStatusLabels } from '@/config/project-status'
import { formatMonth, classNames } from '@/lib/utils/helpers'
import type { Project } from '@/types/project'
import { ProjectThumbnail } from './project-thumbnail'

/**
 * Projects index, as a printed index rather than a grid of cards.
 *
 * This was three columns of rounded rectangles — border, background, a coloured
 * edge, a lift and a shadow on hover. The result read as a SaaS gallery: every
 * project was a self-contained object, so the page could be skimmed as a set of
 * shapes and the title was the smallest thing in each one.
 *
 * An index inverts that. Each project is one row of a numbered column, divided
 * by a hairline rather than boxed in by a border, so the page reads top to bottom
 * as a single column of type — the way a contents page or a filmography does.
 * What that buys:
 *
 *  - The title is the largest thing in the row, not the thumbnail.
 *  - Category, date and technologies share one line under it, so the column can
 *    be scanned by type without reading a single title.
 *  - Nothing lifts, glows or shifts. The row's rule and title colour change,
 *    which is a quieter signal than a translate-and-shadow.
 *  - The thumbnail is a small box on the right — 80px on a phone, 160px on a
 *    desktop — the same shape as the certificate row, so the site has one idea
 *    of "a thing with a document next to it" rather than two.
 *
 * A flex row rather than a twelve-column grid: the container is 72rem, and
 * splitting it into twelve tracks with a gap left the thumbnail about 60px
 * wide, which is not a thumbnail. A fixed-width trailing image and a `flex-1`
 * text column stay readable at every container size without a breakpoint.
 *
 * `startIndex` is supplied by the caller so the numbering is honest across
 * pages — project 07 stays 07 on page two.
 */
export function ProjectIndex({
  projects,
  startIndex = 0,
  className,
}: {
  projects: Project[]
  /** How many rows were rendered before this batch, so numbering continues. */
  startIndex?: number
  className?: string
}) {
  if (projects.length === 0) return null

  return (
    <ol className={classNames('border-t border-[rgb(var(--border))]', className)}>
      {projects.map((project, i) => {
        const number = startIndex + i + 1
        const category = project.category as ProjectCategory
        const technologies = project.technologies ?? []

        return (
          <li key={project.id} className="group border-b border-[rgb(var(--border))]">
            <Link
              href={`/projects/${project.slug}`}
              className="flex items-start gap-4 py-7 transition-colors duration-300 sm:gap-6 sm:py-8"
            >
              {/* Ordinal. Present at every width — it is what makes a column of
                  rows read as an index rather than as a list. */}
              <span className="w-7 shrink-0 pt-1 font-mono text-[length:var(--text-meta)] tabular-nums text-[rgb(var(--text-muted))] sm:w-9">
                {String(number).padStart(2, '0')}
              </span>

              <div className="min-w-0 flex-1">
                <h2 className="text-balance font-display text-xl font-bold leading-[1.15] tracking-[-0.03em] text-[rgb(var(--text))] transition-colors duration-300 group-hover:text-[rgb(var(--accent))] sm:text-2xl lg:text-[length:var(--text-h4)]">
                  {project.title}
                </h2>

                <p className="mt-2 max-w-prose text-pretty text-[length:var(--text-sm)] leading-relaxed text-[rgb(var(--text-dim))] sm:text-[length:var(--text-body-sm)]">
                  {project.short_description}
                </p>

                {/*
                  Category, date, technologies. One line so the whole list can be
                  scanned without reading a title. The separators are decorative
                  and hidden from assistive tech, which reads the values in
                  order anyway.
                */}
                <p className="mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[length:var(--text-meta)] uppercase tracking-[0.1em]">
                  <span className="text-[rgb(var(--text))]">
                    {categoryLabels[category] ?? project.category}
                  </span>
                  {/*
                    Status, right after the category and before the date.

                    The order is the argument: kind of thing, then how far it got,
                    then when. A reader scanning the column for "is this finished"
                    finds it in the same position on every row, which is the only
                    reason a metadata line like this is worth having at all. It is
                    dimmer than the category so the row's identity still leads.
                  */}
                  {project.status && (
                    <>
                      <span aria-hidden="true" className="text-[rgb(var(--border-strong))]">
                        ·
                      </span>
                      <span className="text-[rgb(var(--text-muted))]">
                        {projectStatusLabels[project.status]}
                      </span>
                    </>
                  )}
                  {project.project_date ? (
                    <>
                      <span aria-hidden="true" className="text-[rgb(var(--border-strong))]">
                        ·
                      </span>
                      <time dateTime={project.project_date} className="tabular-nums text-[rgb(var(--text-dim))]">
                        {formatMonth(project.project_date)}
                      </time>
                    </>
                  ) : null}
                  {technologies.length > 0 && (
                    <>
                      <span aria-hidden="true" className="text-[rgb(var(--border-strong))]">
                        ·
                      </span>
                      <span className="text-[rgb(var(--text-muted))]">
                        {technologies.slice(0, 4).join(', ')}
                        {technologies.length > 4 ? ` +${technologies.length - 4}` : ''}
                      </span>
                    </>
                  )}
                </p>
              </div>

              {/* The thumbnail, and the one affordance: the arrow that marks the
                  row as a destination. Both are trailing, so the text column
                  keeps the full measure of the page. */}
              <div className="flex shrink-0 items-center gap-3">
                <div className="w-20 shrink-0 overflow-hidden rounded-[var(--radius-md)] border border-[rgb(var(--border))] sm:w-28 lg:w-40">
                  <ProjectThumbnail
                    src={project.thumbnail_url}
                    alt={`${project.title} preview`}
                    className="aspect-[4/3] w-full"
                    sizes="(min-width: 1024px) 10rem, (min-width: 640px) 7rem, 5rem"
                  />
                </div>
                <ArrowUpRight
                  className="hidden h-4 w-4 shrink-0 text-[rgb(var(--text-muted))] transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[rgb(var(--accent))] sm:block"
                  aria-hidden="true"
                />
              </div>
            </Link>
          </li>
        )
      })}
    </ol>
  )
}

/**
 * One row's treatment, resolved from its position in the list.
 *
 * The archive used to give every project the same row: same thumbnail box, same
 * title size, same padding. That is not neutrality, it is a claim — it says the
 * first project and the ninth are equally worth an hour. On a portfolio whose
 * only job is to be looked at, the claim is the problem.
 *
 * So the index is built in three tiers and each one is a different *shape*, not
 * the same shape with bigger numbers:
 *
 *  - `lead`     One per page. The image moves out of the text column's line and
 *               becomes a wide plate beside the largest title on the site. It is
 *               the only row that gets its own vertical rhythm.
 *  - `support`  One per page. The same row shape as the archive but at 1.5x the
 *               scale — enough to read as deliberate placement after the lead,
 *               not enough to compete with it.
 *  - `archive`  Everything else. The compact numbered row, which is the thing
 *               `ProjectIndex` already does well and which is why this component
 *               extends that file rather than replacing it.
 *
 * The tiers come from position, not from a CMS flag. A `featured` boolean would
 * make this layout depend on an editorial decision that has to be re-made every
 * time a project is published or reordered, and would leave the page with a hole
 * in it wherever the flag was unset. Position is already the thing a reader
 * perceives as importance, so it is the honest source.
 *
 * The plate ratio is fixed per tier (16/10 for the lead, 4/3 below) rather than
 * varying row to row. `thumbnail_url` has no width or height on it — the CMS
 * does not record them — so there is no per-project fact to vary it by, and
 * alternating ratios down a column of fixed-width images would make the rows
 * jump in height as the eye travels. Inventing a ratio from the project's slug
 * would be decoration pretending to be data. The differentiation here is in
 * scale and structure, which is real information.
 */
type ProjectTier = 'lead' | 'support' | 'archive'

const TIER_BY_POSITION = ['lead', 'support'] as const

const TIERS: Record<
  ProjectTier,
  {
    row: string
    marker: string
    title: string
    summary: string
    meta: string
    plate: string
    plateWidth: string
    sizes: string
    /** How many technologies are named before the `+n` overflow. */
    techLimit: number
  }
> = {
  lead: {
    row: 'gap-5 py-10 sm:gap-8 sm:py-14',
    marker: 'w-8 pt-2 sm:w-10 sm:pt-3',
    title: 'text-3xl leading-[1.06] tracking-[-0.04em] sm:text-4xl lg:text-[length:var(--text-h1)]',
    summary:
      'mt-4 max-w-[54ch] text-[length:var(--text-sm)] leading-relaxed sm:text-[length:var(--text-base)]',
    meta: 'mt-6 gap-x-3 gap-y-1.5 text-[length:var(--text-sm)]',
    plate: 'aspect-[16/10]',
    plateWidth: 'w-full sm:w-72 lg:w-96',
    sizes: '(min-width: 1024px) 24rem, (min-width: 640px) 18rem, (min-width: 400px) 100vw, 92vw',
    techLimit: 6,
  },
  support: {
    row: 'gap-5 py-8 sm:gap-6 sm:py-10',
    marker: 'w-8 pt-1.5 sm:w-9',
    title: 'text-2xl leading-[1.1] tracking-[-0.035em] sm:text-3xl',
    summary: 'mt-2.5 max-w-prose text-[length:var(--text-sm)] leading-relaxed',
    meta: 'mt-4 gap-x-2.5 gap-y-1 text-[length:var(--text-meta)]',
    plate: 'aspect-[4/3]',
    plateWidth: 'w-28 sm:w-44 lg:w-56',
    sizes: '(min-width: 1024px) 14rem, (min-width: 640px) 11rem, 7rem',
    techLimit: 4,
  },
  archive: {
    row: 'gap-4 py-6 sm:gap-6 sm:py-7',
    marker: 'w-7 pt-1 sm:w-9',
    title: 'text-xl leading-[1.15] tracking-[-0.03em] sm:text-2xl',
    summary: 'mt-2 max-w-prose text-[length:var(--text-sm)] leading-relaxed',
    meta: 'mt-3.5 gap-x-2.5 gap-y-1 text-[length:var(--text-meta)]',
    plate: 'aspect-[4/3]',
    plateWidth: 'w-20 sm:w-28 lg:w-40',
    sizes: '(min-width: 1024px) 10rem, (min-width: 640px) 7rem, 5rem',
    techLimit: 3,
  },
}

/**
 * The projects index, tiered.
 *
 * Same data, same numbering, same filters and pagination as `ProjectIndex` — the
 * rows below the first two are the identical row, and the first two are that row
 * with the plate and the type scaled up. The only new prop is `featuredCount`,
 * which the caller sets to `0` on every page after the first so the lead slot
 * belongs to the top of the collection and not to whatever page someone lands on
 * with `?page=4`.
 *
 * Marked up as an `<ol>` of `<li>`s, one `<h2>` per project, and a single stretched
 * link per row: the whole row is the tap target, so the title is not a link inside
 * a link and the arrow is decorative rather than a second affordance.
 */
export function ProjectIndexWithHierarchy({
  projects,
  startIndex = 0,
  className,
  featuredCount = 0,
}: {
  projects: Project[]
  startIndex?: number
  className?: string
  /** How many leading rows get `lead` and `support` treatment. */
  featuredCount?: number
}) {
  if (projects.length === 0) return null

  return (
    <ol className={classNames('border-t border-[rgb(var(--border))]', className)}>
      {projects.map((project, i) => {
        const number = startIndex + i + 1
        const category = project.category as ProjectCategory
        const technologies = project.technologies ?? []

        const tier: ProjectTier =
          i < featuredCount
            ? TIER_BY_POSITION[i] ?? 'archive'
            : 'archive'
        const t = TIERS[tier]

        /*
          The lead's plate sits beside the text on a phone's narrow screen only if
          it is allowed to wrap, so below `sm` it drops under the copy and goes
          full width. Every other tier keeps the trailing plate — at 5rem on the
          smallest phone there is not room to give it its own line without pushing
          the title into a one-word-per-line column.
        */
        const plateFirst = tier === 'lead'

        return (
          <li key={project.id} className="group border-b border-[rgb(var(--border))]">
            <Link
              href={`/projects/${project.slug}`}
              className={classNames(
                'flex items-start transition-colors duration-300',
                t.row,
                plateFirst ? 'flex-wrap' : 'flex-nowrap'
              )}
            >
              <span
                className={classNames(
                  'shrink-0 font-mono tabular-nums text-[rgb(var(--text-dim))]',
                  t.marker
                )}
              >
                {String(number).padStart(2, '0')}
              </span>

              <div className={classNames('min-w-0', plateFirst ? 'basis-full sm:basis-0 sm:flex-1' : 'flex-1')}>
                <h2
                  className={classNames(
                    'text-balance font-display font-bold text-[rgb(var(--text))] transition-colors duration-300 group-hover:text-[rgb(var(--accent))]',
                    t.title
                  )}
                >
                  {project.title}
                </h2>

                <p
                  className={classNames(
                    'text-pretty text-[rgb(var(--text-dim))]',
                    t.summary
                  )}
                >
                  {project.short_description}
                </p>

                {/*
                  Category, status, date, stack — one line, in that order, on every
                  tier. The order is the scanability: a reader can find any one fact
                  in the same place in every row regardless of how large the row
                  above it was. Only the type size and the overflow count change.
                */}
                <p
                  className={classNames(
                    'flex flex-wrap items-center font-mono uppercase tracking-[0.1em]',
                    t.meta
                  )}
                >
                  <span className="text-[rgb(var(--text))]">
                    {categoryLabels[category] ?? project.category}
                  </span>
                  {project.status && (
                    <>
                      <span aria-hidden="true" className="text-[rgb(var(--border-strong))]">
                        /
                      </span>
                      <span className="text-[rgb(var(--text-muted))]">
                        {projectStatusLabels[project.status]}
                      </span>
                    </>
                  )}
                  {project.project_date ? (
                    <>
                      <span aria-hidden="true" className="text-[rgb(var(--border-strong))]">
                        /
                      </span>
                      <time
                        dateTime={project.project_date}
                        className="tabular-nums text-[rgb(var(--text-dim))]"
                      >
                        {formatMonth(project.project_date)}
                      </time>
                    </>
                  ) : null}
                  {technologies.length > 0 && (
                    <>
                      <span aria-hidden="true" className="text-[rgb(var(--border-strong))]">
                        /
                      </span>
                      <span className="text-[rgb(var(--text-muted))]">
                        {technologies.slice(0, t.techLimit).join(', ')}
                        {technologies.length > t.techLimit
                          ? ` +${technologies.length - t.techLimit}`
                          : ''}
                      </span>
                    </>
                  )}
                </p>
              </div>

              <div
                className={classNames(
                  'shrink-0 overflow-hidden rounded-[var(--radius-md)] border border-[rgb(var(--border))]',
                  t.plateWidth,
                  plateFirst ? 'order-first basis-full sm:order-none sm:basis-auto' : 'order-none'
                )}
              >
                <ProjectThumbnail
                  src={project.thumbnail_url}
                  alt={`${project.title} preview`}
                  className={classNames('w-full', t.plate)}
                  sizes={t.sizes}
                  zoom={false}
                />
              </div>

              {/*
                Decorative. The entire row is already the link, so this only has to
                make the target legible — it travels on hover as the affordance
                rather than sitting there competing with the title for the line.
              */}
              <ArrowUpRight
                className={classNames(
                  'hidden shrink-0 text-[rgb(var(--text-muted))] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[rgb(var(--accent))]',
                  /*
                    The lead's row is the one place the arrow is dropped between
                    `sm` and `lg`: at that width the plate has already gone
                    full-width under the copy, so the arrow would be the third
                    full-width thing in the row and the row would stop reading as
                    a single link.
                  */
                  plateFirst ? 'lg:block' : 'sm:block'
                )}
                aria-hidden="true"
              />
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
