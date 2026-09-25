'use client'

import Image from 'next/image'
import Link from 'next/link'
import { classNames } from '@/lib/utils/helpers'
import { categoryLabels, categoryColors } from '@/types/category'
import type { Project } from '@/types/project'
import { ExternalLink } from 'lucide-react'

interface ProjectCardProps {
  project: Project
  variant?: 'default' | 'featured' | 'compact'
  className?: string
}

export function ProjectCard({ project, variant = 'default', className }: ProjectCardProps) {
  const categoryInfo = categoryColors[project.category] || categoryColors.other
  const technologies = project.technologies || []

  if (variant === 'compact') {
    return (
      <Link
        href={`/projects/${project.slug}`}
        className={classNames('card-hover group flex gap-4 p-4', className)}
        aria-label={`View ${project.title}`}
      >
        {project.thumbnail_url && (
          <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-[rgb(var(--surface-elevated))]">
            <Image
              src={project.thumbnail_url}
              alt=""
              fill
              sizes="64px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-[rgb(var(--text-primary))] group-hover:text-[rgb(var(--accent))] transition-colors truncate">
            {project.title}
          </h3>
          <p className="mt-1 text-sm text-[rgb(var(--text-muted))] line-clamp-1">
            {project.short_description}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className={classNames('badge', categoryInfo.bg, categoryInfo.text, categoryInfo.border)}>
              {categoryLabels[project.category] || project.category}
            </span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <article className={classNames('card-hover group', variant === 'featured' && 'h-full flex flex-col', className)}>
      {project.thumbnail_url && (
        <Link href={`/projects/${project.slug}`} className="relative aspect-video overflow-hidden" aria-label={`View ${project.title}`}>
          <Image
            src={project.thumbnail_url}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--background))/0.8] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>
      )}
      <div className={classNames('p-6', variant === 'featured' ? 'flex-1 flex flex-col' : '')}>
        <div className="flex items-center gap-2 mb-3">
          <span className={classNames('badge', categoryInfo.bg, categoryInfo.text, categoryInfo.border)}>
            {categoryLabels[project.category] || project.category}
          </span>
          {project.featured && (
            <span className="badge-success">Featured</span>
          )}
        </div>
        <Link href={`/projects/${project.slug}`} className="group" aria-label={`View ${project.title}`}>
          <h3 className="heading-4 group-hover:text-[rgb(var(--accent))] transition-colors">
            {project.title}
          </h3>
        </Link>
        <p className="mt-3 text-[rgb(var(--text-secondary))] line-clamp-3 {variant === 'featured' ? 'flex-1' : ''}">
          {project.short_description}
        </p>
        {technologies.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2" aria-label="Technologies used">
            {technologies.slice(0, 5).map((tech) => (
              <span key={tech} className="badge-secondary text-xs">
                {tech}
              </span>
            ))}
            {technologies.length > 5 && (
              <span className="badge-secondary text-xs text-[rgb(var(--text-muted))]">
                +{technologies.length - 5} more
              </span>
            )}
          </div>
        )}
        {project.project_url && (
          <Link
            href={project.project_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[rgb(var(--accent))] hover:text-[rgb(var(--accent-hover))] transition-colors"
            aria-label={`View live project: ${project.title}`}
          >
            View Project
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        )}
      </div>
    </article>
  )
}