import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { formatProjectDate, formatDate } from '@/lib/utils/helpers'
import { categoryLabels, categoryColors } from '@/types/category'
import { ProjectGallery } from '@/components/projects/project-gallery'
import { RelatedProjects } from '@/components/projects/related-projects'
import { Button } from '@/components/ui/button'
import { getProjectBySlug, getRelatedProjects } from '@/lib/db/projects'
import { ExternalLink, Github, ArrowLeft, Calendar, Tag, Code } from 'lucide-react'
import type { Project } from '@/types/project'

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const project = await getProjectBySlug(resolvedParams.slug)
  
  if (!project) {
    return { title: 'Project Not Found' }
  }

  return {
    title: project.title,
    description: project.short_description,
    openGraph: {
      title: project.title,
      description: project.short_description,
      type: 'article',
      images: project.thumbnail_url ? [project.thumbnail_url] : [],
      publishedTime: project.created_at,
      modifiedTime: project.updated_at,
      tags: project.technologies || [],
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.short_description,
      images: project.thumbnail_url ? [project.thumbnail_url] : [],
    },
  }
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const resolvedParams = await params
  const project = await getProjectBySlug(resolvedParams.slug)

  if (!project) {
    notFound()
  }

  const relatedProjects = await getRelatedProjects(project.slug, project.category, 3)
  const categoryInfo = categoryColors[project.category] || categoryColors.other
  const technologies = project.technologies || []

  return (
    <article className="min-h-screen">
      <header className="section-sm border-b border-[rgb(var(--border-subtle))]">
        <div className="container-custom">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent))] transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Projects
          </Link>
          
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className={`
                badge ${categoryInfo.bg} ${categoryInfo.text} ${categoryInfo.border}
              `}>
                {categoryLabels[project.category] || project.category}
              </span>
              {project.featured && (
                <span className="badge-success">Featured</span>
              )}
            </div>
            
            <h1 className="heading-1 mb-6">{project.title}</h1>
            
            <p className="body-lg text-[rgb(var(--text-secondary))] mb-8 max-w-3xl">
              {project.short_description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-[rgb(var(--text-secondary))]">
              {project.project_date && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  {formatProjectDate(project.project_date)}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Tag className="h-4 w-4" aria-hidden="true" />
                {technologies.slice(0, 3).join(', ')}
                {technologies.length > 3 && <span>+{technologies.length - 3} more</span>}
              </span>
            </div>
          </div>
        </div>
      </header>

      {project.thumbnail_url && (
        <div className="relative aspect-video max-w-6xl mx-auto px-4 -mt-8 mb-12">
          <Image
            src={project.thumbnail_url}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 80vw"
            priority
            className="rounded-xl object-cover"
          />
        </div>
      )}

      <div className="section">
        <div className="container-custom">
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-12">
              {project.description && (
                <section aria-labelledby="overview-heading">
                  <h2 id="overview-heading" className="heading-3 mb-4">Overview</h2>
                  <div className="prose prose-invert max-w-none text-[rgb(var(--text-secondary))]">
                    {project.description.split('\n\n').map((paragraph, i) => (
                      <p key={i} className="body-lg">{paragraph}</p>
                    ))}
                  </div>
                </section>
              )}

              {technologies.length > 0 && (
                <section aria-labelledby="tech-heading">
                  <h2 id="tech-heading" className="heading-3 mb-4 flex items-center gap-2">
                    <Code className="h-5 w-5" aria-hidden="true" />
                    Technologies
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {technologies.map((tech) => (
                      <span key={tech} className="badge-secondary">
                        {tech}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {project.gallery && project.gallery.length > 0 && (
                <section aria-labelledby="gallery-heading">
                  <h2 id="gallery-heading" className="heading-3 mb-6">Gallery</h2>
                  <ProjectGallery images={project.gallery} alt={`${project.title} screenshot`} />
                </section>
              )}

              {project.project_url || project.repository_url ? (
                <section aria-labelledby="links-heading">
                  <h2 id="links-heading" className="heading-3 mb-4">Links</h2>
                  <div className="flex flex-wrap gap-4">
                    {project.project_url && (
                      <a
                        href={project.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary group"
                      >
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        View Live Project
                      </a>
                    )}
                    {project.repository_url && (
                      <a
                        href={project.repository_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary group"
                      >
                        <Github className="h-4 w-4" aria-hidden="true" />
                        View Source
                      </a>
                    )}
                  </div>
                </section>
              ) : null}
            </div>

            <aside className="space-y-8">
              <div className="card p-6 sticky top-24">
                <h3 className="heading-4 mb-4">Project Details</h3>
                <dl className="space-y-4 text-sm">
                  <div>
                    <dt className="text-[rgb(var(--text-muted))] mb-1">Category</dt>
                    <dd className="font-medium">
                      <span className={`
                        badge ${categoryInfo.bg} ${categoryInfo.text} ${categoryInfo.border}
                      `}>
                        {categoryLabels[project.category] || project.category}
                      </span>
                    </dd>
                  </div>
                  {project.project_date && (
                    <div>
                      <dt className="text-[rgb(var(--text-muted))] mb-1">Completed</dt>
                      <dd className="font-medium">{formatProjectDate(project.project_date)}</dd>
                    </div>
                  )}
                  {project.created_at && (
                    <div>
                      <dt className="text-[rgb(var(--text-muted))] mb-1">Added to Portfolio</dt>
                      <dd className="font-medium">{formatDate(project.created_at)}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-[rgb(var(--text-muted))] mb-1">Status</dt>
                    <dd className="font-medium">
                      <span className={project.published ? 'text-green-400' : 'text-[rgb(var(--text-muted))]'}>
                        {project.published ? 'Published' : 'Draft'}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              {technologies.length > 0 && (
                <div className="card p-6 sticky top-24" style={{ top: 'calc(24rem + 2rem)' }}>
                  <h3 className="heading-4 mb-4 flex items-center gap-2">
                    <Code className="h-5 w-5" aria-hidden="true" />
                    Tech Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {technologies.map((tech) => (
                      <span key={tech} className="badge-primary">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>

      <RelatedProjects projects={relatedProjects} currentSlug={project.slug} />
    </article>
  )
}