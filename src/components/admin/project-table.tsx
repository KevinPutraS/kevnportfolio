'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatProjectDate } from '@/lib/utils/helpers'
import { categoryLabels, categoryColors } from '@/types/category'
import type { Project } from '@/types/project'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreVertical, Trash2, Edit, Eye, ExternalLink } from 'lucide-react'
import { classNames } from '@/lib/utils/helpers'

interface ProjectTableProps {
  projects: Project[]
  onDelete: (id: string) => void
  onTogglePublish: (id: string, published: boolean) => void
  onToggleFeatured: (id: string, featured: boolean) => void
  isDeleting?: string | null
  isToggling?: string | null
}

export function ProjectTable({
  projects,
  onDelete,
  onTogglePublish,
  onToggleFeatured,
  isDeleting,
  isToggling,
}: ProjectTableProps) {
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)

  if (!projects.length) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[rgb(var(--accent))/0.1] text-[rgb(var(--accent))] mb-4">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="heading-4 mb-2">No projects yet</h3>
        <p className="text-[rgb(var(--text-muted))] mb-6">Get started by creating your first project.</p>
        <Link href="/admin/projects/new">
          <Button>Create Project</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full" role="table">
        <thead>
          <tr className="border-b border-[rgb(var(--border-subtle))]">
            <th className="text-left px-4 py-3 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider">Project</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider hidden md:table-cell">Category</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider hidden lg:table-cell">Date</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider">Status</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgb(var(--border-subtle))]">
          {projects.map((project) => (
            <tr key={project.id} className="hover:bg-[rgb(var(--surface-elevated))/0.5] transition-colors">
              <td className="px-4 py-4">
                <div className="flex items-center gap-4">
                  {project.thumbnail_url && (
                    <Link href={`/projects/${project.slug}`} target="_blank" rel="noopener noreferrer" className="relative h-12 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-[rgb(var(--surface-elevated))]">
                      <Image src={project.thumbnail_url} alt="" fill sizes="64px" className="object-cover" />
                    </Link>
                  )}
                  <div className="min-w-0">
                    <Link href={`/projects/${project.slug}`} target="_blank" rel="noopener noreferrer" className="font-medium text-[rgb(var(--text-primary))] hover:text-[rgb(var(--accent))] transition-colors truncate block">
                      {project.title}
                    </Link>
                    <p className="text-sm text-[rgb(var(--text-muted))] truncate max-w-xs">
                      {project.short_description}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 hidden md:table-cell">
                <Badge variant="secondary" className={categoryColors[project.category] ? `${categoryColors[project.category].bg} ${categoryColors[project.category].text} ${categoryColors[project.category].border}` : ''}>
                  {categoryLabels[project.category] || project.category}
                </Badge>
              </td>
              <td className="px-4 py-4 hidden lg:table-cell text-[rgb(var(--text-secondary))]">
                {formatProjectDate(project.project_date)}
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onTogglePublish(project.id, !project.published)}
                    disabled={isToggling === project.id}
                    className={classNames(
                      'h-8 px-3',
                      project.published
                        ? 'text-green-400 hover:bg-green-500/10'
                        : 'text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--surface-elevated))]'
                    )}
                    aria-label={project.published ? 'Unpublish' : 'Publish'}
                    aria-pressed={project.published}
                  >
                    {project.published ? 'Published' : 'Draft'}
                  </Button>
                  {project.featured && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleFeatured(project.id, false)}
                      disabled={isToggling === project.id}
                      className="h-8 px-3 text-amber-400 hover:bg-amber-500/10"
                      aria-label="Unfeature"
                      aria-pressed={true}
                    >
                      Featured
                    </Button>
                  )}
                </div>
              </td>
              <td className="px-4 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/projects/${project.id}/edit`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--surface-elevated))] transition-colors"
                    aria-label={`Edit ${project.title}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/projects/${project.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--surface-elevated))] transition-colors"
                    aria-label={`View ${project.title}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  {project.project_url && (
                    <a
                      href={project.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--surface-elevated))] transition-colors"
                      aria-label={`Open live project: ${project.title}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setDropdownOpen(dropdownOpen === project.id ? null : project.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--surface-elevated))] transition-colors"
                      aria-label="More options"
                      aria-expanded={dropdownOpen === project.id}
                      aria-haspopup="true"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {dropdownOpen === project.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(null)} aria-hidden="true" />
                        <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg bg-[rgb(var(--surface))] border border-[rgb(var(--border))] shadow-lg py-1">
                          <button
                            type="button"
                            onClick={() => {
                              onDelete(project.id)
                              setDropdownOpen(null)
                            }}
                            disabled={isDeleting === project.id}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[rgb(var(--error))] hover:bg-[rgb(var(--surface-elevated))]"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}