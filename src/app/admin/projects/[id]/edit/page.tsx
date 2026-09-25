import { getProjectById } from '@/lib/db/projects'
import { notFound } from 'next/navigation'
import { ProjectForm } from '@/components/admin/project-form'

interface EditProjectPageProps {
  params: Promise<{ id: string }>
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const resolvedParams = await params
  const project = await getProjectById(resolvedParams.id)

  if (!project) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="heading-1">Edit Project</h1>
        <p className="text-[rgb(var(--text-secondary))] mt-1">Update your portfolio project</p>
      </div>
      <ProjectForm
        isEditing={true}
        projectId={project.id}
        initialData={{
          title: project.title,
          slug: project.slug,
          short_description: project.short_description,
          description: project.description || '',
          category: project.category,
          technologies: Array.isArray(project.technologies) ? project.technologies.join(', ') : '',
          project_date: project.project_date || '',
          thumbnail_url: project.thumbnail_url || '',
          gallery: project.gallery || [],
          project_url: project.project_url || '',
          repository_url: project.repository_url || '',
          featured: project.featured,
          published: project.published,
        }}
      />
    </div>
  )
}