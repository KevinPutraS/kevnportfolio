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

export type ProjectCardVariant = 'feature' | 'standard' | 'compact' | 'rail'

interface ProjectCardProps {
  project: Project
  variant?: ProjectCardVariant
  className?: string
  priority?: boolean
}

/**
 * One project, image first.
 *
 * The image is the thing a visitor actually reacts to, so it gets roughly half
 * the card's height and the text is trimmed to what helps a decision: category,
 * title, one line of what it is, and a visible action. The previous versions
 * either buried the image behind a border and a caption, or filled the card with
 * pills until the work was the smallest element on it.
 *
 * `feature` is the first project on a page and runs wider with a taller image —
 * enough asymmetry to make an index feel laid out rather than gridded, while
 * still fitting two per row on a laptop.
 *
 * `rail` is the same card in a `HorizontalRail`: the image is slightly shorter
 * and the text is trimmed one step further, because a rail card is judged
 * against its neighbours at a glance rather than read on its own. Its width is
 * the caller's to set — the rail sizes the items, not the card — so every card
 * in the strip comes out the same size.
 */
export function ProjectCard({
  project,
  variant = 'standard',
  className,
  priority,
}: ProjectCardProps) {
  const isFeature = variant === 'feature'
  const isRail = variant === 'rail'
  const technologies = project.technologies ?? []
  const visible = technologies.slice(0, isFeature ? 4 : isRail ? 2 : 3)
  const category = project.category as ProjectCategory
  const catClass = categoryColorClass(project.category)

  return (
    <article
      className={classNames(
        'group relative isolate flex flex-col overflow-hidden rounded-2xl',
        'border bg-[rgb(var(--bg-elevated))]',
        catClass,
        'cat-edge transition-[transform,border-color,box-shadow] duration-500 ease-out',
        'hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-24px_rgb(0_0_0/0.75)]',
        // The link below opts out of the global focus ring, so the ring is drawn
        // here instead — `focus-within` covers both the pointer and the keyboard,
        // and the category hue ties it to the card it belongs to.
        'focus-within:outline focus-within:outline-2 focus-within:outline-offset-2',
        'focus-within:outline-[rgb(var(--cat))]'
      )}
    >
      <Link
        href={`/projects/${project.slug}`}
        className="flex h-full flex-col focus-visible:outline-none"
        aria-label={`${project.title} — view case study`}
      >
        {/* Image. The dominant element, and the reason to click. */}
        <div className="relative overflow-hidden">
          {/* A faint wash of the category colour, so the card is identifiable
              even from the image area rather than only from the chip. */}
          <div aria-hidden="true" className="cat-glow pointer-events-none absolute inset-0 z-10" />

          <ProjectThumbnail
            src={project.thumbnail_url}
            alt={`${project.title} preview`}
            className={classNames(
              'w-full transition-transform duration-700 ease-out group-hover:scale-[1.06]',
              isFeature ? 'aspect-[16/10]' : isRail ? 'aspect-[3/2]' : 'aspect-video'
            )}
            priority={priority}
            sizes={
              // Mirrors the rail's own width steps (21/22/24/26rem). An
              // underestimate here is not a visual bug but a resolution one: the
              // browser picks the next size down and the card looks soft.
              isRail
                ? '(min-width: 1280px) 26rem, (min-width: 1024px) 24rem, (min-width: 640px) 22rem, 78vw'
                : isFeature
                  ? '(min-width: 1024px) 60vw, 100vw'
                  : '(min-width: 1024px) 40vw, (min-width: 640px) 50vw, 100vw'
            }
            zoom={false}
          />

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
        </div>

        {/* Text. Compact, so the image stays the subject. */}
        <div className="flex flex-1 flex-col p-5">
          <h3
            className={classNames(
              'text-balance font-display font-bold leading-[1.12] tracking-[-0.03em]',
              'text-[rgb(var(--text))] transition-colors duration-300 group-hover:text-[rgb(var(--accent))]',
              isFeature ? 'text-2xl' : 'text-lg'
            )}
          >
            <span className="absolute inset-0" aria-hidden="true" />
            {project.title}
          </h3>

          <p
            className={classNames(
              'mt-2.5 text-pretty leading-relaxed text-[rgb(var(--text-dim))]',
              isFeature ? 'line-clamp-2 text-base' : 'line-clamp-2 text-[length:var(--text-sm)]'
            )}
          >
            {project.short_description}
          </p>

          {visible.length > 0 && (
            <p className={classNames('tech-list mt-4', isRail && 'mb-5')}>
              <span className="sr-only">Built with: </span>
              {visible.join(' · ')}
              {technologies.length > visible.length && (
                <span> · +{technologies.length - visible.length}</span>
              )}
            </p>
          )}

          {/*
            Action. Always visible, never hover-only.

            In a rail the row is pushed to the bottom of the card, so the
            "View case study" line sits on the same baseline across every card
            in the strip. In a grid the cards are in rows and read top-down, so
            the row simply follows the text.
          */}
          <span
            className={classNames(
              'flex items-center gap-1.5 border-t border-[rgb(var(--border))] pt-4 text-[length:var(--text-sm)] font-semibold text-[rgb(var(--text))] transition-colors duration-300 group-hover:text-[rgb(var(--accent))]',
              isRail ? 'mt-auto' : 'mt-6'
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
