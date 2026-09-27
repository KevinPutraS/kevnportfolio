'use client'

import Link from 'next/link'
import { Eye, EyeOff, Pencil, Star, Trash2 } from 'lucide-react'
import { classNames, formatMonth } from '@/lib/utils/helpers'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { ActionMessage, RowAction } from '@/components/admin/row-action'
import { useRowActions, type RowToggle } from '@/lib/hooks/use-row-actions'
import { categoryLabels } from '@/config/site'
import type { Project } from '@/types/project'

const TOGGLES: readonly RowToggle<Project>[] = [
  {
    field: 'published',
    describe: (row) => `${row.title} is now ${row.published ? 'a draft' : 'published'}.`,
  },
  {
    field: 'featured',
    describe: (row) => `${row.title} is ${row.featured ? 'no longer featured' : 'now featured'}.`,
  },
]

/**
 * Row actions run through the API rather than a form post, so a failure can be
 * reported inline instead of dumping raw JSON into the browser (which is what
 * `window.alert` on a non-2xx response did).
 */
export function ProjectTableClient({ projects }: { projects: Project[] }) {
  const actions = useRowActions<Project>({
    endpoint: '/api/admin/projects',
    noun: 'project',
    toggles: TOGGLES,
  })

  return (
    <>
      <ActionMessage message={actions.message} />

      {actions.isRefreshing && (
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
              const isBusy = actions.busyId === project.id

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
                      {categoryLabels[project.category]}
                      {project.project_date ? ` · ${formatMonth(project.project_date)}` : ''}
                    </span>
                  </th>

                  <td className="hidden px-4 py-4 text-sm text-[rgb(var(--text-secondary))] lg:table-cell">
                    {categoryLabels[project.category]}
                  </td>

                  <td className="hidden px-4 py-4 font-mono text-xs text-[rgb(var(--text-muted))] lg:table-cell">
                    {project.project_date ? (
                      <time dateTime={project.project_date}>{formatMonth(project.project_date)}</time>
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
                        onClick={() => actions.toggle(project, 'published')}
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
                        onClick={() => actions.toggle(project, 'featured')}
                        label={`${project.featured ? 'Remove from' : 'Add to'} featured: ${project.title}`}
                        pressed={project.featured}
                      >
                        <Star className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">
                          {project.featured ? 'Unfeature' : 'Feature'}
                        </span>
                      </RowAction>

                      {/*
                        A plain <a> rather than <Link>: these are admin routes
                        behind a session, so there is no value in prefetching
                        every row's edit page on a long list.
                      */}
                      <Link
                        href={`/admin/projects/${project.id}/edit`}
                        prefetch={false}
                        className="inline-flex h-8 items-center gap-1.5 border border-[rgb(var(--border-subtle))] px-2.5 text-xs text-[rgb(var(--text-secondary))] transition-colors hover:border-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))]"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        Edit
                      </Link>

                      <RowAction
                        busy={isBusy}
                        onClick={() => actions.requestDelete(project)}
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
        isOpen={actions.pendingDelete !== null}
        onClose={actions.cancelDelete}
        title="Delete project"
        description={
          actions.pendingDelete
            ? `"${actions.pendingDelete.title}" will be permanently removed. This cannot be undone.`
            : undefined
        }
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={actions.cancelDelete}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            loading={actions.busyId === actions.pendingDelete?.id}
            onClick={actions.confirmDelete}
          >
            Delete project
          </Button>
        </div>
      </Modal>
    </>
  )
}
