import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import {
  categoryLabels,
  categoryColorClass,
  type ProjectCategory,
} from '@/config/site'
import { formatMonth, classNames } from '@/lib/utils/helpers'
import type { Project } from '@/types/project'
import { ProjectThumbnail } from './project-thumbnail'

/**
 * Only two variants are left.
 *
 * `feature` and `compact` were declared here and used nowhere in the codebase —
 * the index settled on a uniform grid and the homepage on a rail. They were not
 * free: `isFeature` branched the image aspect, the title size, the description
 * size, the technology count and the `sizes` hint on every card that rendered.
 * Dead variants in a shared component are a tax paid by every live one.
 */
export type ProjectCardVariant = 'standard' | 'rail'

interface ProjectCardProps {
  project: Project
  variant?: ProjectCardVariant
  className?: string
  priority?: boolean
}

/**
 * One project.
 *
 * `standard` is the index card, and it is two layouts wearing one component.
 *
 * Below `sm` it is a **row**: a 96px thumbnail on the left, category, date,
 * title and two lines of description on the right, about 110px tall. As a
 * stacked card the same content was roughly 380px — a 16:9 image at full width
 * plus a padded text block — so a phone showed one project per screen and an
 * index of twelve was four and a half screens of scrolling. A row is the
 * correct shape for a list on a narrow screen: the title stays legible at 15px,
 * the image stays present, and three projects fit where one used to.
 *
 * From `sm` it is the stacked card again, where there is width to spend on the
 * image.
 *
 * The category and the date moved out of the image overlay and into a meta line
 * above the title. At 96px there is no room for a floating chip, and rendering
 * it in both places would put the category into the accessibility tree twice and
 * let the two disagree. The colour coding survives as the dot on that meta line,
 * and the homepage rail keeps the overlay treatment, because a rail card is wide
 * enough to carry it and wants to.
 *
 * `rail` is the same card in a `HorizontalRail`, sized by the caller: it keeps
 * the full-width image with the chip and date overlaid, because there the image
 * is the subject and one card is meant to fill the viewport.
 */
export function ProjectCard({
  project,
  variant = 'standard',
  className,
  priority,
}: ProjectCardProps) {
  const isRail = variant === 'rail'
  const technologies = project.technologies ?? []
  const visible = technologies.slice(0, isRail ? 2 : 3)
  const category = project.category as ProjectCategory
  const catClass = categoryColorClass(project.category)

  return (
    <article
      className={classNames(
        'group relative isolate flex overflow-hidden rounded-2xl',
        // The row below `sm`, the column from `sm`. `items-stretch` is the flex
        // default and is what lets the thumbnail match the height of the text
        // beside it instead of leaving a gap under a fixed-ratio image.
        isRail ? 'flex-col' : 'flex-col max-sm:flex-row',
        'border bg-[rgb(var(--bg-elevated))]',
        catClass,
        'cat-edge transition-[transform,border-color,box-shadow] duration-500 ease-out',
        'hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-24px_rgb(0_0_0/0.75)]',
        // The link below opts out of the global focus ring, so the ring is drawn
        // here instead — `focus-within` covers both the pointer and the keyboard,
        // and the category hue ties it to the card it belongs to.
        //
        // In a rail the ring is drawn *inside* the card. The track is a scroll
        // container, so an outside ring on the first card at scroll position 0
        // is clipped by the edge of the viewport; an inset ring is the same
        // affordance and cannot be cut off at any scroll offset.
        'focus-within:outline focus-within:outline-2',
        isRail
          ? 'focus-within:-outline-offset-2 focus-within:outline-[rgb(var(--cat))]'
          : 'focus-within:outline-offset-2 focus-within:outline-[rgb(var(--cat))]'
      )}
    >
      <Link
        href={`/projects/${project.slug}`}
        className={classNames('flex min-w-0', isRail ? 'h-full flex-col' : 'max-sm:items-stretch sm:h-full sm:flex-col')}
        aria-label={`${project.title} — view case study`}
      >
        <div
          className={classNames(
            'relative overflow-hidden',
            // A fixed-width column on the phone. `shrink-0` stops the thumbnail
            // being squeezed by a long title.
            !isRail && 'max-sm:w-24 max-sm:shrink-0'
          )}
        >
          {/* A faint wash of the category colour, rail only: a 96px thumbnail has
              no room for it and it just muddies the crop. */}
          {isRail && <div aria-hidden="true" className="cat-glow pointer-events-none absolute inset-0 z-10" />}

          <ProjectThumbnail
            src={project.thumbnail_url}
            alt={`${project.title} preview`}
            className={classNames(
              'w-full transition-transform duration-700 ease-out group-hover:scale-[1.06]',
              /*
               * `max-sm:h-full` alongside the ratio: once both width and height
               * are definite, `aspect-ratio` stops applying, so the thumbnail
               * fills the height of the row. Below `sm` the ratio is what sizes
               * the box if the text beside it is shorter than 72px, so the image
               * is never zero-height.
               */
              isRail ? 'aspect-[3/2]' : 'max-sm:h-full max-sm:aspect-[4/3] sm:aspect-video'
            )}
            priority={priority}
            sizes={
              // Mirrors the rail's own width steps (21/22/24/26rem). An
              // underestimate here is not a visual bug but a resolution one: the
              // browser picks the next size down and the card looks soft.
              isRail
                ? '(min-width: 1280px) 26rem, (min-width: 1024px) 24rem, (min-width: 640px) 22rem, 78vw'
                : '(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 6rem'
            }
            zoom={false}
          />

          {isRail && (
            <>
              {/* Bottom scrim so the overlaid date stays legible on any image. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-black/75 via-black/25 to-transparent"
              />

              {/* Category chip, carrying the category colour. */}
              <span
                className={classNames(
                  'cat-chip absolute left-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-[0.1em] backdrop-blur-md'
                )}
              >
                <span aria-hidden="true" className="cat-dot h-1.5 w-1.5 rounded-full" />
                {categoryLabels[category] ?? project.category}
              </span>

              {project.project_date && (
                <time
                  dateTime={project.project_date}
                  className="absolute bottom-4 left-4 z-20 font-mono text-xs tabular-nums text-white/75"
                >
                  {formatMonth(project.project_date)}
                </time>
              )}
            </>
          )}
        </div>

        <div
          className={classNames(
            'flex flex-1 flex-col',
            isRail ? 'p-5' : 'min-w-0 p-4 sm:p-5'
          )}
        >
          {/* Category and date as a line of text, at every width for `standard`. */}
          {!isRail && (
            <p className="meta flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="inline-flex items-center gap-1.5 text-[rgb(var(--cat))]">
                <span aria-hidden="true" className="cat-dot h-1.5 w-1.5 rounded-full" />
                {categoryLabels[category] ?? project.category}
              </span>
              {project.project_date ? (
                <>
                  <span aria-hidden="true" className="text-[rgb(var(--border-strong))]">
                    /
                  </span>
                  <time dateTime={project.project_date} className="tabular-nums">
                    {formatMonth(project.project_date)}
                  </time>
                </>
              ) : null}
            </p>
          )}

          <h3
            className={classNames(
              'text-balance font-display font-bold leading-[1.15] tracking-[-0.03em]',
              'text-[rgb(var(--text))] transition-colors duration-300 group-hover:text-[rgb(var(--accent))]',
              isRail
                ? 'text-lg'
                : 'mt-2 text-[length:var(--text-body-sm)] sm:mt-2.5 sm:text-lg'
            )}
          >
            {/* Stretched link: one tap target for the whole card, and the reason
                the text is not itself a link. */}
            <span className="absolute inset-0" aria-hidden="true" />
            {project.title}
          </h3>

          <p
            className={classNames(
              'text-pretty leading-relaxed text-[rgb(var(--text-dim))]',
              isRail
                ? 'mt-2.5 line-clamp-2 text-[length:var(--text-sm)]'
                : 'mt-1.5 line-clamp-2 text-[length:var(--text-sm)] sm:mt-2.5'
            )}
          >
            {project.short_description}
          </p>

          {visible.length > 0 && (
            <p
              className={classNames(
                'tech-list mt-4',
                // Nothing but the title, the description and the meta line fit a
                // 110px row, and a technology list truncated to three of eight is
                // not worth the space it would take from the description.
                !isRail && 'max-sm:hidden',
                isRail && 'mb-5'
              )}
            >
              <span className="sr-only">Built with: </span>
              {visible.join(' · ')}
              {technologies.length > visible.length && (
                <span> · +{technologies.length - visible.length}</span>
              )}
            </p>
          )}

          {/*
            Action. Always visible on a rail, where there is height to spend and
            the row is pushed to the bottom so every card in the strip shares a
            baseline.

            On an index card it is a desktop affordance. The phone row already
            reads as a link — it is one stretched `<a>` — so the label and its
            divider are dropped there, and the `aria-label` on the link above
            still names the destination for anyone not looking at it.
          */}
          <span
            className={classNames(
              'flex items-center gap-1.5 border-t border-[rgb(var(--border))] pt-4 text-[length:var(--text-sm)] font-semibold text-[rgb(var(--text))] transition-colors duration-300 group-hover:text-[rgb(var(--accent))]',
              isRail ? 'mt-auto' : 'mt-6 max-sm:hidden'
            )}
          >
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
