import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { categoryLabels, type ProjectCategory } from '@/config/site'
import { formatProjectDate } from '@/lib/utils/helpers'
import type { Project } from '@/types/project'
import { classNames } from '@/lib/utils/helpers'
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

  return (
    <article className={classNames('group relative', className)}>
      <Link
        href={`/projects/${project.slug}`}
        className="block h-full focus-visible:outline-none"
        // Stretch the link over the whole tile so the entire card is clickable,
        // while keeping a single tab stop and a single accessible name.
        aria-label={`${project.title} — view project`}
      >
        <ProjectThumbnail
          src={project.thumbnail_url}
          alt={`${project.title} preview`}
          className={classNames(
            'border border-[rgb(var(--border-subtle))] transition-colors duration-300',
            isFeature ? 'aspect-[16/10]' : variant === 'compact' ? 'aspect-[16/9]' : 'aspect-[4/3]',
            'group-hover:border-[rgb(var(--border))]'
          )}
          priority={priority}
          sizes={
            isFeature
              ? '(min-width: 1024px) 66vw, 100vw'
              : variant === 'compact'
                ? '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
                : '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
          }
        />

        <div className={classNames(isFeature ? 'pt-6' : 'pt-5')}>
          <div className="flex items-center gap-3">
            {index !== undefined && (
              <span className="font-mono text-[0.6875rem] text-[rgb(var(--text-muted))]">
                {String(index + 1).padStart(2, '0')}
              </span>
            )}
            <span className="caption text-[rgb(var(--accent))]">
              {categoryLabels[project.category as ProjectCategory] ?? project.category}
            </span>
            {project.project_date && (
              <>
                <span aria-hidden="true" className="h-px flex-1 bg-[rgb(var(--border-subtle))]" />
                <time
                  dateTime={project.project_date}
                  className="font-mono text-[0.6875rem] text-[rgb(var(--text-muted))]"
                >
                  {formatProjectDate(project.project_date)}
                </time>
              </>
            )}
          </div>

          <h3
            className={classNames(
              'mt-3 font-display font-bold leading-tight tracking-tight transition-colors duration-200',
              'text-[rgb(var(--text-primary))] group-hover:text-[rgb(var(--accent))]',
              isFeature ? 'text-2xl sm:text-3xl' : 'text-lg'
            )}
          >
            <span className="absolute inset-0" aria-hidden="true" />
            {project.title}
          </h3>

          {!isFeature && (
            <p className="mt-2 line-clamp-2 text-sm text-[rgb(var(--text-secondary))]">
              {project.short_description}
            </p>
          )}

          {isFeature && (
            <p className="mt-3 max-w-xl text-[rgb(var(--text-secondary))]">
              {project.short_description}
            </p>
          )}

          {project.technologies && project.technologies.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {project.technologies.slice(0, isFeature ? 6 : 4).map((technology) => (
                <li
                  key={technology}
                  className="border border-[rgb(var(--border-subtle))] px-2 py-0.5 font-mono text-[0.6875rem] text-[rgb(var(--text-muted))]"
                >
                  {technology}
                </li>
              ))}
              {!isFeature && project.technologies.length > 4 && (
                <li className="px-1 py-0.5 font-mono text-[0.6875rem] text-[rgb(var(--text-muted))]">
                  +{project.technologies.length - 4}
                </li>
              )}
            </ul>
          )}

          <span className="mt-5 inline-flex items-center gap-1 text-sm text-[rgb(var(--text-muted))] transition-colors group-hover:text-[rgb(var(--accent))]">
            View project
            <ArrowUpRight
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </span>
        </div>
      </Link>
    </article>
  )
}
