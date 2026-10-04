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
