'use client'

import { ProjectCard } from './project-card'
import type { Project } from '@/types/project'
import { classNames } from '@/lib/utils/helpers'

interface ProjectGridProps {
  projects: Project[]
  className?: string
}

export function ProjectGrid({ projects, className }: ProjectGridProps) {
  if (!projects.length) {
    return (
      <div className="text-center py-20" role="status">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[rgb(var(--accent))/0.1] text-[rgb(var(--accent))] mb-4">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="heading-4 mb-2">No projects found</h3>
        <p className="text-[rgb(var(--text-muted))]">Try adjusting your filters or check back later.</p>
      </div>
    )
  }

  return (
    <div
      className={classNames(
        'grid gap-6',
        'sm:grid-cols-2 lg:grid-cols-3',
        className
      )}
      role="list"
      aria-label="Projects"
    >
      {projects.map((project, index) => (
        <div key={project.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
          <ProjectCard project={project} />
        </div>
      ))}
    </div>
  )
}