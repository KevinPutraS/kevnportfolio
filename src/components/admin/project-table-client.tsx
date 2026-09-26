'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Pencil, Star, Trash2, Loader2 } from 'lucide-react'
import { classNames } from '@/lib/utils/helpers'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { categoryLabels, type ProjectCategory } from '@/config/site'
import { formatProjectDate } from '@/lib/utils/helpers'
import type { Project } from '@/types/project'

/**
 * Row actions run through the API rather than a form post, so a failure can be
 * reported inline instead of dumping raw JSON into the browser (which is what
 * `window.alert` on a non-2xx response did).
 */
export function ProjectTableClient({ projects }: { projects: Project[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null)
  const [message, setMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null)

  async function patchProject(project: Project, field: 'published' | 'featured') {
    setBusyId(project.id)
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: !project[field] }),
      })

      if (response.status === 401) {
        setMessage({ tone: 'error', text: 'Your session expired. Sign in again.' })
        return
      }

      const payload = (await response.json().catch(() => ({}))) as { message?: string }

      if (!response.ok) {
        setMessage({ tone: 'error', text: payload.message ?? 'The change could not be saved.' })
        return
      }

      setMessage({
        tone: 'success',
        text: `${project.title} is now ${field === 'published' ? (project.published ? 'a draft' : 'published') : project.featured ? 'no longer featured' : 'featured'}.`,
      })
      startTransition(() => router.refresh())
    } catch {
      setMessage({ tone: 'error', text: 'Could not reach the server. Please try again.' })
    } finally {
      setBusyId(null)
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    const project = pendingDelete
    setBusyId(project.id)
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/projects/${project.id}`, { method: 'DELETE' })

      if (response.status === 401) {
        setMessage({ tone: 'error', text: 'Your session expired. Sign in again.' })
        return
      }

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { message?: string }
        setMessage({ tone: 'error', text: payload.message ?? 'The project could not be deleted.' })
        return
      }

      setMessage({ tone: 'success', text: `"${project.title}" was deleted.` })
      startTransition(() => router.refresh())
    } catch {
      setMessage({ tone: 'error', text: 'Could not reach the server. Please try again.' })
    } finally {
      setBusyId(null)
      setPendingDelete(null)
    }
  }

  return (
    <>
      {/* Single live region for every action result. */}
      <p
        role="status"
        aria-live="polite"
        className={classNames(
          'mb-4 border p-3 text-sm',
          message === null && 'sr-only',
          !message && 'border-transparent',
          message?.tone === 'error' && 'border-[rgb(var(--error))]/40 bg-[rgb(var(--error))]/5',
          message?.tone === 'success' && 'border-[rgb(var(--success))]/40 bg-[rgb(var(--success))]/5'
        )}
      >
        {message?.text}
      </p>

      {isPending && (
        <p className="sr-only" aria-live="polite">
          Refreshing project list
        </p>
      )}

      {/*
        Desktop: a real table. On small screens the same markup is restyled into
        stacked cards, so the data is never hidden behind a horizontal scroll.
      */}
      <div className="overflow-hidden border border-[rgb(var(--border-subtle))]">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            All projects with their status, date and available actions
          </caption>
          <thead className="hidden border-b border-[rgb(var(--border-subtle))] bg-[rgb(var(--surface))] lg:table-header-group">
            <tr>
              {['Title', 'Category', 'Date', 'Status', 'Actions'].map((heading) => (
                <th
                  key={heading}
                  scope="col"
                  className="px-4 py-3 font-mono text-[0.6875rem] font-normal uppercase tracking-[0.12em] text-[rgb(var(--text-muted))]"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {projects.map((project) => {
              const isBusy = busyId === project.id

              return (
                <tr
                  key={project.id}
                  className={classNames(
                    'block border-b border-[rgb(var(--border-subtle))] last:border-b-0 lg:table-row',
                    isBusy && 'opacity-60'
                  )}
                >
                  <th
                    scope="row"
                    className="block px-4 pb-1 pt-4 font-normal lg:table-cell lg:py-4"
                  >
                    <span className="block font-medium">{project.title}</span>
                    <span className="mt-1 block font-mono text-xs text-[rgb(var(--text-muted))] lg:hidden">
                      {categoryLabels[project.category as ProjectCategory] ?? project.category}
                      {project.project_date ? ` · ${formatProjectDate(project.project_date)}` : ''}
                    </span>
                  </th>

                  <td className="hidden px-4 py-4 text-sm text-[rgb(var(--text-secondary))] lg:table-cell">
                    {categoryLabels[project.category as ProjectCategory] ?? project.category}
                  </td>

                  <td className="hidden px-4 py-4 font-mono text-xs text-[rgb(var(--text-muted))] lg:table-cell">
                    {project.project_date ? (
                      <time dateTime={project.project_date}>{formatProjectDate(project.project_date)}</time>
                    ) : (
                      <span aria-label="No date">—</span>
                    )}
                  </td>

                  <td className="block px-4 py-2 lg:table-cell lg:py-4">
                    <span className="flex flex-wrap items-center gap-2">
                      <span
                        className={classNames(
                          'caption',
                          project.published
                            ? 'text-[rgb(var(--success))]'
                            : 'text-[rgb(var(--text-muted))]'
                        )}
                      >
                        {project.published ? 'Published' : 'Draft'}
                      </span>
                      {project.featured && (
                        <span className="caption inline-flex items-center gap-1 text-[rgb(var(--accent))]">
                          <Star className="h-3 w-3" aria-hidden="true" />
                          Featured
                        </span>
                      )}
                    </span>
                  </td>

                  <td className="block px-4 pb-4 pt-2 lg:table-cell lg:py-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <RowAction
                        busy={isBusy}
                        onClick={() => void patchProject(project, 'published')}
                        label={`${project.published ? 'Unpublish' : 'Publish'} ${project.title}`}
                        pressed={project.published}
                      >
                        {project.published ? (
                          <EyeOff className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        )}
                        <span className="sr-only">
                          {project.published ? 'Unpublish' : 'Publish'}
                        </span>
                      </RowAction>

                      <RowAction
                        busy={isBusy}
                        onClick={() => void patchProject(project, 'featured')}
                        label={`${project.featured ? 'Remove from' : 'Add to'} featured: ${project.title}`}
                        pressed={project.featured}
                      >
                        <Star className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">
                          {project.featured ? 'Unfeature' : 'Feature'}
                        </span>
                      </RowAction>

                      <Link
                        href={`/admin/projects/${project.id}/edit`}
                        className="inline-flex h-8 items-center gap-1.5 border border-[rgb(var(--border-subtle))] px-2.5 text-xs text-[rgb(var(--text-secondary))] transition-colors hover:border-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))]"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        Edit
                      </Link>

                      <RowAction
                        busy={isBusy}
                        onClick={() => setPendingDelete(project)}
                        label={`Delete ${project.title}`}
                        danger
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="sr-only">Delete</span>
                      </RowAction>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="Delete project"
        description={
          pendingDelete
            ? `"${pendingDelete.title}" will be permanently removed. This cannot be undone.`
            : undefined
        }
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={() => setPendingDelete(null)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            loading={busyId === pendingDelete?.id}
            onClick={() => void confirmDelete()}
          >
            Delete project
          </Button>
        </div>
      </Modal>
    </>
  )
}

function RowAction({
  busy,
  onClick,
  label,
  pressed,
  danger,
  children,
}: {
  busy: boolean
  onClick: () => void
  label: string
  pressed?: boolean
  danger?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-label={label}
      aria-pressed={pressed}
      className={classNames(
        'inline-flex h-8 w-8 items-center justify-center border border-[rgb(var(--border-subtle))] transition-colors disabled:opacity-50',
        pressed
          ? 'border-[rgb(var(--accent))]/50 text-[rgb(var(--accent))]'
          : 'text-[rgb(var(--text-secondary))] hover:border-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))]',
        danger && 'hover:border-[rgb(var(--error))] hover:text-[rgb(var(--error))]'
      )}
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : children}
    </button>
  )
}
