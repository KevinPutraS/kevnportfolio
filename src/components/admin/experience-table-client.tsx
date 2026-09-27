'use client'

import Link from 'next/link'
import { Briefcase, ChevronDown, ChevronUp, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'
import { classNames } from '@/lib/utils/helpers'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { ActionMessage, RowAction } from '@/components/admin/row-action'
import { useRowActions, type RowToggle } from '@/lib/hooks/use-row-actions'
import { experienceTypeLabels } from '@/config/site'
import { formatDateRange } from '@/lib/validation/fields'
import type { Experience } from '@/types/experience'

const TOGGLES: readonly RowToggle<Experience>[] = [
  {
    field: 'published',
    describe: (row) => `${row.title} is now ${row.published ? 'a draft' : 'published'}.`,
  },
  {
    field: 'current',
    describe: (row) =>
      row.current
        ? `${row.title} is now marked as a current role.`
        : `${row.title} is no longer marked as a current role.`,
  },
]

export function ExperienceTableClient({ experiences }: { experiences: Experience[] }) {
  const actions = useRowActions<Experience>({
    endpoint: '/api/admin/experience',
    noun: 'experience entry',
    toggles: TOGGLES,
    reorder: { endpoint: '/api/admin/experience/reorder' },
  })

  return (
    <>
      <ActionMessage message={actions.message} />

      {actions.isRefreshing && (
        <p className="sr-only" aria-live="polite">
          Refreshing timeline
        </p>
      )}

      {/*
        Desktop: a real table. Below `lg` the same markup restyles into stacked
        cards, so nothing is pushed behind a horizontal scroll at 320px.
      */}
      <div className="overflow-hidden border border-[rgb(var(--border-subtle))]">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            All experience entries with their type, period, status and available actions
          </caption>
          <thead className="hidden border-b border-[rgb(var(--border-subtle))] bg-[rgb(var(--surface))] lg:table-header-group">
            <tr>
              {['Role', 'Type', 'Period', 'Status', 'Order', 'Actions'].map((heading) => (
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
            {experiences.map((experience, index) => {
              const isBusy = actions.busyId === experience.id

              return (
                <tr
                  key={experience.id}
                  className={classNames(
                    'block border-b border-[rgb(var(--border-subtle))] last:border-b-0 lg:table-row',
                    isBusy && 'opacity-60'
                  )}
                >
                  <th
                    scope="row"
                    className="block px-4 pb-1 pt-4 font-normal lg:table-cell lg:py-4"
                  >
                    <span className="block font-medium">{experience.title}</span>
                    <span className="mt-1 block font-mono text-xs text-[rgb(var(--text-muted))] lg:hidden">
                      {experienceTypeLabels[experience.employment_type]} ·{' '}
                      {formatDateRange(experience.start_date, experience.end_date, experience.current) || '—'}
                    </span>
                  </th>

                  <td className="hidden px-4 py-4 text-sm text-[rgb(var(--text-secondary))] lg:table-cell">
                    {experienceTypeLabels[experience.employment_type]}
                    {experience.organization ? (
                      <span className="mt-0.5 block text-xs text-[rgb(var(--text-muted))]">
                        {experience.organization}
                      </span>
                    ) : null}
                  </td>

                  <td className="hidden px-4 py-4 font-mono text-xs text-[rgb(var(--text-muted))] lg:table-cell">
                    <time dateTime={experience.start_date ?? undefined}>
                      {formatDateRange(experience.start_date, experience.end_date, experience.current) || '—'}
                    </time>
                  </td>

                  <td className="block px-4 py-2 lg:table-cell lg:py-4">
                    <span className="flex flex-wrap items-center gap-2">
                      <span
                        className={classNames(
                          'caption',
                          experience.published
                            ? 'text-[rgb(var(--success))]'
                            : 'text-[rgb(var(--text-muted))]'
                        )}
                      >
                        {experience.published ? 'Published' : 'Draft'}
                      </span>
                      {experience.current && (
                        <span className="caption text-[rgb(var(--accent))]">Current</span>
                      )}
                    </span>
                  </td>

                  {/*
                    Reordering writes `sort_order` for the whole list, so these
                    buttons always operate on the full server-ordered array.
                  */}
                  <td className="hidden px-4 py-4 lg:table-cell">
                    <span className="flex items-center gap-1.5">
                      <RowAction
                        busy={isBusy}
                        onClick={() => actions.move(experiences, index, -1)}
                        label={`Move ${experience.title} earlier`}
                      >
                        <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="sr-only">Move earlier</span>
                      </RowAction>
                      <RowAction
                        busy={isBusy}
                        onClick={() => actions.move(experiences, index, 1)}
                        label={`Move ${experience.title} later`}
                      >
                        <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="sr-only">Move later</span>
                      </RowAction>
                    </span>
                  </td>

                  <td className="block px-4 pb-4 pt-2 lg:table-cell lg:py-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <RowAction
                        busy={isBusy}
                        onClick={() => actions.toggle(experience, 'published')}
                        label={`${experience.published ? 'Unpublish' : 'Publish'} ${experience.title}`}
                        pressed={experience.published}
                      >
                        {experience.published ? (
                          <EyeOff className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        )}
                        <span className="sr-only">
                          {experience.published ? 'Unpublish' : 'Publish'}
                        </span>
                      </RowAction>

                      <RowAction
                        busy={isBusy}
                        onClick={() => actions.toggle(experience, 'current')}
                        label={`${experience.current ? 'Remove the current flag from' : 'Mark as current'} ${experience.title}`}
                        pressed={experience.current}
                      >
                        <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="sr-only">
                          {experience.current ? 'Not current' : 'Mark current'}
                        </span>
                      </RowAction>

                      <Link
                        href={`/admin/experience/${experience.id}/edit`}
                        prefetch={false}
                        className="inline-flex h-8 items-center gap-1.5 border border-[rgb(var(--border-subtle))] px-2.5 text-xs text-[rgb(var(--text-secondary))] transition-colors hover:border-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))]"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        Edit
                      </Link>

                      <RowAction
                        busy={isBusy}
                        onClick={() => actions.requestDelete(experience)}
                        label={`Delete ${experience.title}`}
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
        title="Delete experience entry"
        description={
          actions.pendingDelete
            ? `"${actions.pendingDelete.title}" at ${actions.pendingDelete.organization} will be permanently removed. This cannot be undone.`
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
            Delete entry
          </Button>
        </div>
      </Modal>
    </>
  )
}
