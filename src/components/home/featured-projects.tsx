'use client'

import Link from 'next/link'
import { ProjectCard } from '@/components/projects/project-card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface FeaturedProjectsProps {
  projects: Array<{
    id: string
    title: string
    slug: string
    short_description: string
    category: string
    technologies: string[] | null
    thumbnail_url: string | null
  }>
}

export function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  if (!projects.length) return null

  return (
    <section className="section" aria-labelledby="featured-heading">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 id="featured-heading" className="heading-2">
              Featured Projects
            </h2>
            <p className="mt-2 text-[rgb(var(--text-secondary))]">
              A selection of recent work
            </p>
          </div>
          <Link href="/projects">
            <Button variant="ghost" className="group">
              View All
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <Link key={project.id} href={`/projects/${project.slug}`}>
              <ProjectCard project={project as any} variant="featured" className="animate-fade-in" style={{ animationDelay: `${(index + 1) * 0.1}s` }} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}