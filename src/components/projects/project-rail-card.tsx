import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { categoryLabels, type ProjectCategory } from '@/config/site'
import { formatMonth } from '@/lib/utils/helpers'
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
}: {
  project: Project
  className?: string
  priority?: boolean
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
            className="aspect-[3/2] w-full transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            priority={priority}
            sizes="(min-width: 1280px) 26rem, (min-width: 1024px) 24rem, (min-width: 640px) 22rem, 78vw"
            zoom={false}
          />

          {project.project_date && (
            <time
              dateTime={project.project_date}
              className="absolute bottom-4 left-4 z-20 font-mono text-xs tabular-nums text-white/80"
            >
              {formatMonth(project.project_date)}
            </time>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-balance font-display text-lg font-bold leading-[1.15] tracking-[-0.03em] text-[rgb(var(--text))] transition-colors duration-300 group-hover:text-[rgb(var(--accent))]">
            {/* Stretched link: one tap target for the whole card. */}
            <span className="absolute inset-0" aria-hidden="true" />
            {project.title}
          </h3>

          <p className="mt-2.5 line-clamp-2 text-pretty text-[length:var(--text-sm)] leading-relaxed text-[rgb(var(--text-dim))]">
            {project.short_description}
          </p>

          <p className="meta mt-5 flex items-center gap-x-2 gap-y-0.5">
            <span>{categoryLabels[category] ?? project.category}</span>
            {technologies.length > 0 && (
              <>
                <span aria-hidden="true" className="text-[rgb(var(--border-strong))]">
                  /
                </span>
                <span className="text-[rgb(var(--text-muted))]">
                  {technologies.slice(0, 2).join(', ')}
                  {technologies.length > 2 ? ` +${technologies.length - 2}` : ''}
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