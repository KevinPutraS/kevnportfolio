import { ProjectForm } from '@/components/admin/project-form'

export default function NewProjectPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="heading-1">New Project</h1>
        <p className="text-[rgb(var(--text-secondary))] mt-1">Create a new portfolio project</p>
      </div>
      <ProjectForm isEditing={false} />
    </div>
  )
}