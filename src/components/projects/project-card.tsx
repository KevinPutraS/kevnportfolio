import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { categoryLabels, type ProjectCategory } from '@/config/site'
import { formatProjectDate, classNames } from '@/lib/utils/helpers'
import type { Project } from '@/types/project'
import { ProjectThumbnail } from './project-thumbnail'

/**
 * `feature` spans two columns and shows the description; `compact` is the
 * smaller tile used in the dense index. The variation is what keeps the
 * projects index from reading as a uniform card grid.
 */
export type ProjectCardVariant = 'feature' | 'standard' | 'compact'

interface ProjectCardProps {
  project: Project
  variant?: ProjectCardVariant
  index?: number
  className?: string
  priority?: boolean
}

export function ProjectCard({
  project,
  variant = 'standard',
  index,
  className,
  priority,
}: ProjectCardProps) {
  const isFeature = variant === 'feature'
  const isCompact = variant === 'compact'
  const technologies = project.technologies ?? []
  const visibleTechnologies = technologies.slice(0, isFeature ? 6 : isCompact ? 3 : 4)
  const overflowCount = technologies.length - visibleTechnologies.length

  return (
    <article className={classNames('group relative', className)}>
      <Link
        href={`/projects/${project.slug}`}
        className="flex h-full flex-col focus-visible:outline-none"
        // Stretch the link over the whole tile so the entire card is clickable,
        // while keeping a single tab stop and a single accessible name.
        aria-label={`${project.title} — view project`}
      >
        <ProjectThumbnail
          src={project.thumbnail_url}
          alt={`${project.title} preview`}
          className={classNames(
            'border border-[rgb(var(--border-subtle))] transition-colors duration-300 group-hover:border-[rgb(var(--border))]',
            isFeature ? 'aspect-[16/10]' : isCompact ? 'aspect-[16/9]' : 'aspect-[4/3]'
          )}
          priority={priority}
          sizes={
            isFeature
              ? '(min-width: 1024px) 66vw, 100vw'
              : isCompact
                ? '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
                : '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
          }
        />

        {/*
          Metadata row. The rule is the hover target: it wipes in from the left
          on hover so the card reacts without recolouring the title or adding
          another box. `flex-1` keeps the date hard right on every card width.
        */}
        <div className="mt-5 flex items-center gap-3 border-t border-[rgb(var(--border-subtle))] pt-4">
          {index !== undefined && (
            <span className="index-marker transition-colors duration-150 group-hover:text-[rgb(var(--accent))]">
              {String(index + 1).padStart(2, '0')}
            </span>
          )}
          <span className="caption text-[rgb(var(--text-muted))]">
            {categoryLabels[project.category as ProjectCategory] ?? project.category}
          </span>
          {project.project_date && (
            <time
              dateTime={project.project_date}
              className="ml-auto shrink-0 font-mono text-[0.6875rem] tabular-nums text-[rgb(var(--text-muted))]"
            >
              {formatProjectDate(project.project_date)}
            </time>
          )}
        </div>

        <div className="mt-3 flex items-start justify-between gap-4">
          <h3
            className={classNames(
              'font-display font-bold leading-[1.15] tracking-[-0.025em] text-[rgb(var(--text-primary))]',
              isFeature ? 'text-2xl sm:text-3xl' : isCompact ? 'text-base' : 'text-lg'
            )}
          >
            <span className="absolute inset-0" aria-hidden="true" />
            {project.title}
          </h3>

          {/*
            Replaces the old always-visible "View project" line. The affordance
            is now a mark in the corner that appears on hover, which removes a
            row of repeated text from every tile.
          */}
          <span
            aria-hidden="true"
            className="mt-0.5 hidden shrink-0 -translate-x-1 text-[rgb(var(--accent))] opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100 sm:block"
          >
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>

        <p
          className={classNames(
            'text-pretty text-[rgb(var(--text-secondary))]',
            isFeature ? 'mt-3 max-w-xl' : isCompact ? 'mt-2 line-clamp-2 text-sm' : 'mt-2 line-clamp-2 text-sm'
          )}
        >
          {project.short_description}
        </p>

        {/*
          Technologies as a running mono list. Chips were the single most
          "dashboard" element in the old card; a comma-separated line carries
          the same information and reads as part of the typography.
        */}
        {visibleTechnologies.length > 0 && (
          <p className="mt-auto pt-4 font-mono text-[0.6875rem] leading-relaxed text-[rgb(var(--text-muted))]">
            {visibleTechnologies.join(' · ')}
            {overflowCount > 0 && <span> · +{overflowCount}</span>}
          </p>
        )}
      </Link>
    </article>
  )
}
