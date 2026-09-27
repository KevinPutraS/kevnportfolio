'use client'

import Link from 'next/link'
import { Award, ChevronDown, ChevronUp, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'
import { classNames, formatMonth, isMonthCurrent } from '@/lib/utils/helpers'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { ActionMessage, RowAction } from '@/components/admin/row-action'
import { useRowActions, type RowToggle } from '@/lib/hooks/use-row-actions'
import type { Certificate } from '@/types/certificate'

const TOGGLES: readonly RowToggle<Certificate>[] = [
  {
    field: 'published',
    describe: (row) => `${row.title} is now ${row.published ? 'a draft' : 'published'}.`,
  },
]

export function CertificateTableClient({ certificates }: { certificates: Certificate[] }) {
  const actions = useRowActions<Certificate>({
    endpoint: '/api/admin/certificates',
    noun: 'certificate',
    toggles: TOGGLES,
    reorder: { endpoint: '/api/admin/certificates/reorder' },
  })

  return (
    <>
      <ActionMessage message={actions.message} />

      {actions.isRefreshing && (
        <p className="sr-only" aria-live="polite">
          Refreshing certificates
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-[rgb(var(--border))]">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            All certificates with their issuer, issue date, status and available actions
          </caption>
          <thead className="hidden border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-highlight))] lg:table-header-group">
            <tr>
              {['Certificate', 'Issued', 'Status', 'Order', 'Actions'].map((heading) => (
                <th
                  key={heading}
                  scope="col"
                  className="px-4 py-3 font-mono text-[length:var(--text-xs)] font-normal uppercase tracking-[0.12em] text-[rgb(var(--text-muted))]"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {certificates.map((certificate, index) => {
              const isBusy = actions.busyId === certificate.id
              const isActive = isMonthCurrent(certificate.expiration_date)

              return (
                <tr
                  key={certificate.id}
                  className={classNames(
                    'block border-b border-[rgb(var(--border))] last:border-b-0 lg:table-row',
                    isBusy && 'opacity-60'
                  )}
                >
                  <th
                    scope="row"
                    className="block px-4 pb-1 pt-4 font-normal lg:table-cell lg:py-4"
                  >
                    <span className="block font-medium">{certificate.title}</span>
                    <span className="mt-1 block font-mono text-xs text-[rgb(var(--text-muted))] lg:hidden">
                      {certificate.issuer}
                      {certificate.issue_date ? ` · ${formatMonth(certificate.issue_date)}` : ''}
                    </span>
                  </th>

                  <td className="hidden px-4 py-4 text-sm text-[rgb(var(--text-dim))] lg:table-cell">
                    {certificate.issuer}
                    {certificate.credential_id ? (
                      <span className="mt-0.5 block font-mono text-xs text-[rgb(var(--text-muted))]">
                        ID {certificate.credential_id}
                      </span>
                    ) : null}
                  </td>

                  <td className="hidden px-4 py-4 font-mono text-xs text-[rgb(var(--text-muted))] lg:table-cell">
                    {certificate.issue_date ? (
                      <time dateTime={certificate.issue_date}>{formatMonth(certificate.issue_date)}</time>
                    ) : (
                      <span aria-label="No issue date">—</span>
                    )}
                  </td>

                  <td className="block px-4 py-2 lg:table-cell lg:py-4">
                    <span className="flex flex-wrap items-center gap-2">
                      <span
                        className={classNames(
                          'caption',
                          certificate.published
                            ? 'text-[rgb(var(--success))]'
                            : 'text-[rgb(var(--text-muted))]'
                        )}
                      >
                        {certificate.published ? 'Published' : 'Draft'}
                      </span>
                      {certificate.expiration_date && !isActive && (
                        <span className="caption text-[rgb(var(--text-muted))]">Expired</span>
                      )}
                    </span>
                  </td>

                  <td className="hidden px-4 py-4 lg:table-cell">
                    <span className="flex items-center gap-1.5">
                      <RowAction
                        busy={isBusy}
                        onClick={() => actions.move(certificates, index, -1)}
                        label={`Move ${certificate.title} earlier`}
                      >
                        <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="sr-only">Move earlier</span>
                      </RowAction>
                      <RowAction
                        busy={isBusy}
                        onClick={() => actions.move(certificates, index, 1)}
                        label={`Move ${certificate.title} later`}
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
                        onClick={() => actions.toggle(certificate, 'published')}
                        label={`${certificate.published ? 'Unpublish' : 'Publish'} ${certificate.title}`}
                        pressed={certificate.published}
                      >
                        {certificate.published ? (
                          <EyeOff className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        )}
                        <span className="sr-only">
                          {certificate.published ? 'Unpublish' : 'Publish'}
                        </span>
                      </RowAction>

                      <Link
                        href={`/admin/certificates/${certificate.id}/edit`}
                        prefetch={false}
                        className="inline-flex h-8 items-center gap-1.5 border border-[rgb(var(--border))] px-2.5 text-xs text-[rgb(var(--text-dim))] transition-colors hover:border-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        Edit
                      </Link>

                      <RowAction
                        busy={isBusy}
                        onClick={() => actions.requestDelete(certificate)}
                        label={`Delete ${certificate.title}`}
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
        title="Delete certificate"
        description={
          actions.pendingDelete
            ? `"${actions.pendingDelete.title}" will be permanently removed. The uploaded image is kept in storage.`
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
            Delete certificate
          </Button>
        </div>
      </Modal>
    </>
  )
}
