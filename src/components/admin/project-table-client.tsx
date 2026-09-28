'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, Pencil, Star, Trash2 } from 'lucide-react'
import { classNames, formatMonth } from '@/lib/utils/helpers'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { ActionMessage, RowAction } from '@/components/admin/row-action'
import { useRowActions, type RowToggle } from '@/lib/hooks/use-row-actions'
import { categoryLabels, categoryColorClass } from '@/config/site'
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
        stacked rows, so the data is never hidden behind a horizontal scroll.

        The redesign here is that a row now shows the work. It used to be a title
        string in the first column, which meant scanning twenty projects meant
        reading twenty titles to work out which was which — while the screenshot
        that identifies a project was sitting in the CMS form, one click away.
        A 40px thumbnail in the row does the identifying that a sentence of text
        was doing badly, and the category column carries its hue so the table
        reads as a colour map too.
      */}
      <div className="overflow-hidden rounded-xl border border-[rgb(var(--border))]">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            All projects with their status, date and available actions
          </caption>
          <thead className="hidden border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-highlight))] lg:table-header-group">
            <tr>
              {['Project', 'Category', 'Date', 'Status', 'Actions'].map((heading) => (
                <th
                  key={heading}
                  scope="col"
                  className="px-4 py-3 font-mono text-[length:var(--text-xs)] font-medium uppercase tracking-[0.12em] text-[rgb(var(--text-muted))]"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {projects.map((project) => {
              const isBusy = actions.busyId === project.id
              const tone = categoryColorClass(project.category)

              return (
                <tr
                  key={project.id}
                  className={classNames(
                    'block border-b border-[rgb(var(--border))] transition-colors last:border-b-0 hover:bg-[rgb(var(--bg-elevated))] lg:table-row',
                    tone,
                    isBusy && 'opacity-60'
                  )}
                >
                  <th scope="row" className="block px-4 pb-1 pt-4 font-normal lg:table-cell lg:py-3">
                    <span className="flex items-center gap-3">
                      <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--bg-highlight))]">
                        {project.thumbnail_url ? (
                          <Image
                            src={project.thumbnail_url}
                            alt=""
                            fill
                            sizes="56px"
                            quality={60}
                            className="object-cover"
                          />
                        ) : (
                          <span
                            aria-hidden="true"
                            className="flex h-full w-full items-center justify-center cat-dot opacity-25"
                          />
                        )}
                      </span>

                      <span className="min-w-0">
                        <span className="block truncate font-medium text-[rgb(var(--text))]">
                          {project.title}
                        </span>
                        <span className="mt-0.5 block font-mono text-[length:var(--text-xs)] text-[rgb(var(--text-muted))] lg:hidden">
                          {categoryLabels[project.category]}
                          {project.project_date ? ` · ${formatMonth(project.project_date)}` : ''}
                        </span>
                      </span>
                    </span>
                  </th>

                  <td className="hidden px-4 py-3 lg:table-cell">
                    <span className="cat-chip inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[length:var(--text-xs)] uppercase tracking-[0.08em]">
                      <span aria-hidden="true" className="cat-dot h-1.5 w-1.5 rounded-full" />
                      {categoryLabels[project.category]}
                    </span>
                  </td>

                  <td className="hidden px-4 py-3 font-mono text-[length:var(--text-xs)] tabular-nums text-[rgb(var(--text-dim))] lg:table-cell">
                    {project.project_date ? (
                      <time dateTime={project.project_date}>{formatMonth(project.project_date)}</time>
                    ) : (
                      <span aria-label="No date" className="text-[rgb(var(--text-muted))]">
                        —
                      </span>
                    )}
                  </td>

                  <td className="block px-4 py-2 lg:table-cell lg:py-3">
                    <span className="flex flex-wrap items-center gap-2">
                      {project.published ? (
                        <span className="badge-success">Published</span>
                      ) : (
                        <span className="badge-neutral">Draft</span>
                      )}
                      {project.featured && <span className="badge-primary">Featured</span>}
                    </span>
                  </td>

                  <td className="block px-4 pb-4 pt-2 lg:table-cell lg:py-3">
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
                        className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[var(--radius-md)] border border-[rgb(var(--border))] px-3 text-xs text-[rgb(var(--text-dim))] transition-colors hover:border-[rgb(var(--border-strong))] hover:bg-[rgb(var(--bg-highlight))] hover:text-[rgb(var(--text))] sm:h-[34px]"
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
          {/* `data-modal-initial` puts focus on Cancel the moment this opens. */}
          <Button
            type="button"
            variant="ghost"
            data-modal-initial
            onClick={actions.cancelDelete}
          >
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
