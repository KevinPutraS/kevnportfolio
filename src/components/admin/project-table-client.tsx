'use client'

import { useState } from 'react'
import type { Project, PaginatedProjects } from '@/types/project'
import { ProjectTable } from './project-table'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface ProjectTableClientProps {
  initialProjects: Project[]
  initialTotal: number
  initialPage: number
}

async function fetchProjectsAPI(page: number): Promise<PaginatedProjects> {
  const response = await fetch(`/api/admin/projects/list?page=${page}&published=`, {
    credentials: 'include',
  })
  if (!response.ok) {
    throw new Error('Failed to fetch projects')
  }
  return response.json()
}

export function ProjectTableClient({ initialProjects, initialTotal, initialPage }: ProjectTableClientProps) {
  const [projects, setProjects] = useState(initialProjects)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(initialPage)
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const fetchProjects = async (pageNum = 1) => {
    setLoading(true)
    try {
      const data = await fetchProjectsAPI(pageNum)
      setProjects(data.projects)
      setTotal(data.total)
      setPage(data.page)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project? This cannot be undone.')) return
    
    setDeletingId(id)
    try {
      const response = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete project')
      fetchProjects(page)
    } catch (error) {
      alert('Failed to delete project')
    } finally {
      setDeletingId(null)
    }
  }

  const handleTogglePublish = async (id: string, published: boolean) => {
    setTogglingId(id)
    try {
      const response = await fetch(`/api/admin/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published }),
      })
      if (!response.ok) throw new Error('Failed to update project')
      fetchProjects(page)
    } catch (error) {
      alert('Failed to update project')
    } finally {
      setTogglingId(null)
    }
  }

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    setTogglingId(id)
    try {
      const response = await fetch(`/api/admin/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured }),
      })
      if (!response.ok) throw new Error('Failed to update project')
      fetchProjects(page)
    } catch (error) {
      alert('Failed to update project')
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="card">
      {loading ? (
        <div className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[rgb(var(--accent))]" />
          <p className="mt-4 text-[rgb(var(--text-secondary))]">Loading projects...</p>
        </div>
      ) : (
        <ProjectTable
          projects={projects}
          onDelete={handleDelete}
          onTogglePublish={handleTogglePublish}
          onToggleFeatured={handleToggleFeatured}
          isDeleting={deletingId}
          isToggling={togglingId}
        />
      )}

      {total > 12 && (
        <div className="border-t border-[rgb(var(--border-subtle))] px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-[rgb(var(--text-secondary))]">
            Showing {projects.length} of {total} projects
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fetchProjects(page - 1)}
              disabled={page === 1 || loading}
            >
              Previous
            </Button>
            <span className="px-4 text-sm text-[rgb(var(--text-secondary))]">
              Page {page} of {Math.ceil(total / 12)}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fetchProjects(page + 1)}
              disabled={page >= Math.ceil(total / 12) || loading}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}