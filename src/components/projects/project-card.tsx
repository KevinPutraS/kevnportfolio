import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { categoryLabels, type ProjectCategory } from '@/config/site'
import { formatMonth, classNames } from '@/lib/utils/helpers'
import type { Project } from '@/types/project'
import { ProjectThumbnail } from './project-thumbnail'

/**
 * `feature` spans two columns and shows the full description; `compact` is the
 * smaller tile used in dense lists. The variation is what keeps the projects
 * index from reading as a uniform card wall.
 */
export type ProjectCardVariant = 'feature' | 'standard' | 'compact'

interface ProjectCardProps {
  project: Project
  variant?: ProjectCardVariant
  className?: string
  priority?: boolean
}

/**
 * One project.
 *
 * Every card states its three facts in the same order — category and date,
 * title, description, technologies — and ends with a visible "View case study"
 * action. There is no `index` prop: a sequential number on a filtered, sortable
 * list is a tie-breaker that means nothing to a reader, and it was competing
 * for attention with the category label, which does mean something.
 */
export function ProjectCard({
  project,
  variant = 'standard',
  className,
  priority,
}: ProjectCardProps) {
  const isFeature = variant === 'feature'
  const isCompact = variant === 'compact'
  const technologies = project.technologies ?? []
  const visibleTechnologies = technologies.slice(0, isFeature ? 6 : isCompact ? 3 : 4)
  const overflowCount = technologies.length - visibleTechnologies.length

  return (
    <article className={classNames('group relative flex h-full', className)}>
      <Link
        href={`/projects/${project.slug}`}
        className="flex w-full flex-col focus-visible:outline-none"
        // Stretches over the whole tile so the entire card is clickable, while
        // keeping a single tab stop and a single accessible name.
        aria-label={`${project.title} — view case study`}
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

        {/* Category and date: the two facts that help someone decide whether to
            keep reading. Category leads because it is the broader filter. */}
        <div className="mt-5 flex items-center gap-3 border-t border-[rgb(var(--border-subtle))] pt-4">
          <span className="meta-strong">
            {categoryLabels[project.category as ProjectCategory] ?? project.category}
          </span>
          {project.project_date && (
            <time
              dateTime={project.project_date}
              className="meta ml-auto shrink-0 tabular-nums"
            >
              {formatMonth(project.project_date)}
            </time>
          )}
        </div>

        <h3
          className={classNames(
            'mt-3 font-display font-bold leading-[1.15] tracking-[-0.025em] text-[rgb(var(--text-primary))] transition-colors duration-150 group-hover:text-[rgb(var(--accent))]',
            isFeature ? 'text-3xl sm:text-4xl' : isCompact ? 'text-base' : 'text-xl'
          )}
        >
          <span className="absolute inset-0" aria-hidden="true" />
          {project.title}
        </h3>

        <p
          className={classNames(
            'mt-2 text-pretty text-[rgb(var(--text-secondary))]',
            isFeature ? 'max-w-xl text-base' : 'line-clamp-3 text-[length:var(--text-body-sm)]'
          )}
        >
          {project.short_description}
        </p>

        {visibleTechnologies.length > 0 && (
          <p className="tech-list mt-4">
            <span className="sr-only">Built with: </span>
            {visibleTechnologies.join(' · ')}
            {overflowCount > 0 && <span> · +{overflowCount} more</span>}
          </p>
        )}

        {/*
          The action, always visible.
          The affordance used to be a corner arrow that only appeared on hover,
          which meant the clickability existed only for pointer users and only
          while hovering. A labelled link with a rule under it is legible before
          you touch anything and says what happens next.
        */}
        <span className="mt-auto flex items-center gap-2 pt-6">
          <span className="relative text-[length:var(--text-body-sm)] font-medium text-[rgb(var(--text-primary))]">
            View case study
            <span
              aria-hidden="true"
              className="absolute -bottom-0.5 left-0 h-px w-full bg-[rgb(var(--border))] transition-colors duration-150 group-hover:bg-[rgb(var(--accent))]"
            />
          </span>
          <ArrowUpRight
            className="h-4 w-4 shrink-0 text-[rgb(var(--text-muted))] transition-[color,transform] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[rgb(var(--accent))]"
            aria-hidden="true"
          />
        </span>
      </Link>
    </article>
  )
}
