import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { categoryLabels, type ProjectCategory } from '@/config/site'
import { projectStatusLabels } from '@/config/project-status'
import { formatMonth, classNames } from '@/lib/utils/helpers'
import type { Project } from '@/types/project'
import { ProjectThumbnail } from './project-thumbnail'

/**
 * The featured-work card, rail only.
 *
 * The shared card used to have four variants (standard, rail, feature, compact)
 * and every one of them shipped the same chrome: `rounded-2xl`, a card border, a
 * category-coloured edge, a translate-and-shadow hover and a lifted title. That
 * single object was the template look of the whole site.
 *
 * The projects index is now a column of hairlined rows, so the only card left is
 * this one, and a card left alone in a rail should be a frame for its image, not
 * a decorated box. What survives is what the rail needs:
 *
 *  - The image is the subject, with the earliest project's date overlaid.
 *  - The hover is a zoom inside the frame (`scale-[1.06]` on the image) instead
 *    of the card lifting off the page.
 *  - Category and date sit on one mono line under the title — same as the index
 *    rows — so the two surfaces share one type system.
 *  - The corners are quiet (`rounded-xl)`, the border is the site hairline, and
 *    nothing shifts, glows or casts a coloured shadow.
 *
 * The focus ring is drawn inside the card. The track is a scroll container, so
 * an outside ring on the first card at scroll position 0 would be clipped by the
 * edge of the viewport; an inset ring is the same affordance and cannot be cut
 * off at any scroll offset.
 */
export function ProjectRailCard({
  project,
  className,
  priority,
  lead = false,
}: {
  project: Project
  className?: string
  priority?: boolean
  /**
   * The first card in the rail.
   *
   * The rail used to be six identical cards, which made "featured" mean only that
   * a project was in the list — the CMS flag bought a slot and no emphasis. So the
   * lead gets a taller plate and a larger title, and everything after it keeps the
   * compact card. One card, not six, because the rail is a shelf: the thing you
   * arrive at should be the thing you see, and the rest should be browsable rather
   * than competing.
   */
  lead?: boolean
}) {
  const technologies = project.technologies ?? []
  const category = project.category as ProjectCategory

  return (
    <article
      className={`group relative isolate flex h-full flex-col overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] transition-colors duration-500 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[rgb(var(--text))] ${className ?? ''}`}
    >
      <Link
        href={`/projects/${project.slug}`}
        className="flex h-full min-w-0 flex-col"
        aria-label={`${project.title} — view case study`}
      >
        <div className="relative overflow-hidden">
          <ProjectThumbnail
            src={project.thumbnail_url}
            alt={`${project.title} preview`}
            /*
              3/2 on the supporting cards, 16/10 on the lead. The lead plate is both
              wider and a little shorter, which is the same "more image, less
              chrome" trade the projects index makes between its tiers — the two
              surfaces agree on direction even though they are different components.
            */
            className={classNames(
              'w-full transition-transform duration-700 ease-out group-hover:scale-[1.06]',
              lead ? 'aspect-[16/10]' : 'aspect-[3/2]'
            )}
            priority={priority}
            sizes={
              lead
                ? '(min-width: 1280px) 30rem, (min-width: 1024px) 27rem, (min-width: 640px) 24rem, 78vw'
                : '(min-width: 1280px) 26rem, (min-width: 1024px) 24rem, (min-width: 640px) 22rem, 78vw'
            }
            zoom={false}
          />

          {/*
            Scrim under the date. The date used to be `text-white/80` and nothing
            else, which is a bet that the thumbnail beneath it is dark — and
            `thumbnail_url` comes from the CMS, so that bet is not ours to make.
            A white screenshot put white text on white and the badge disappeared.

            The gradient is `from --bg`, not `from-black`, so it darkens the corner
            in the dark theme and lightens it in the light theme, following the
            page rather than fighting it. Same construction as the gallery overlay
            in `project-gallery.tsx`.
          */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgb(var(--bg)/0.75)] via-transparent to-transparent"
          />

          {project.project_date && (
            <time
              dateTime={project.project_date}
              className="absolute bottom-4 left-4 z-20 font-mono text-xs tabular-nums text-[rgb(var(--text))]"
            >
              {formatMonth(project.project_date)}
            </time>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3
            className={classNames(
              'text-balance font-display font-bold leading-[1.15] tracking-[-0.03em] text-[rgb(var(--text))] transition-colors duration-300 group-hover:text-[rgb(var(--accent))]',
              lead ? 'text-xl sm:text-2xl' : 'text-lg'
            )}
          >
            {/* Stretched link: one tap target for the whole card. */}
            <span className="absolute inset-0" aria-hidden="true" />
            {project.title}
          </h3>

          <p className="mt-2.5 line-clamp-2 text-pretty text-[length:var(--text-sm)] leading-relaxed text-[rgb(var(--text-dim))]">
            {project.short_description}
          </p>

          {/*
            The lead names four technologies rather than two. It is the one card
            with room to say what a project is made *of*, and the overflow count
            keeps a long stack from turning the line into a paragraph.
          */}
          <p className="meta mt-5 flex items-center gap-x-2 gap-y-0.5">
            <span>{categoryLabels[category] ?? project.category}</span>
            {/* Same position as the index row: category, status, then the stack.
                One order across both project surfaces, so the two read as one
                index rather than as two formats. */}
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
            {technologies.length > 0 && (
              <>
                <span aria-hidden="true" className="text-[rgb(var(--border-strong))]">
                  /
                </span>
                <span className="text-[rgb(var(--text-muted))]">
                  {technologies.slice(0, lead ? 4 : 2).join(', ')}
                  {technologies.length > (lead ? 4 : 2)
                    ? ` +${technologies.length - (lead ? 4 : 2)}`
                    : ''}
                </span>
              </>
            )}
          </p>

          <span className="mt-5 flex items-center gap-1.5 border-t border-[rgb(var(--border))] pt-4 text-[length:var(--text-sm)] font-semibold text-[rgb(var(--text))] transition-colors duration-300 group-hover:text-[rgb(var(--accent))]">
            View case study
            <ArrowUpRight
              className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </span>
        </div>
      </Link>
    </article>
  )
}