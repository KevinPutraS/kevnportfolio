import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ProjectForm } from '@/components/admin/project-form'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'New project',
  robots: { index: false, follow: false },
}

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/projects"
        className="group inline-flex items-center gap-2 font-mono text-xs text-[rgb(var(--text-muted))] transition-colors hover:text-[rgb(var(--accent))]"
      >
        <ArrowLeft
          className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1"
          aria-hidden="true"
        />
        All projects
      </Link>

      <header className="mt-8">
        <p className="eyebrow">Create</p>
        <h1 className="heading-2 mt-3">New project</h1>
        <p className="mt-3 text-[rgb(var(--text-secondary))]">
          New projects are saved as drafts. Publish it when it is ready.
        </p>
      </header>

      <div className="mt-10">
        {/* No `project` prop: the form starts empty. */}
        <ProjectForm />
      </div>
    </div>
  )
}
