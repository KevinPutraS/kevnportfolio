'use client'

import { ProjectCard } from './project-card'
import type { Project } from '@/types/project'

interface RelatedProjectsProps {
  projects: Project[]
  currentSlug: string
}

export function RelatedProjects({ projects, currentSlug }: RelatedProjectsProps) {
  const filteredProjects = projects.filter((p) => p.slug !== currentSlug)

  if (!filteredProjects.length) return null

  return (
    <section className="section border-t border-[rgb(var(--border-subtle))]" aria-labelledby="related-heading">
      <div className="container-custom">
        <h2 id="related-heading" className="heading-3 mb-8">
          Related Projects
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.slice(0, 3).map((project, index) => (
            <ProjectCard key={project.id} project={project} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }} />
          ))}
        </div>
      </div>
    </section>
  )
}