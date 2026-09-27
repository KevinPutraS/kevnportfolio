'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'
import type { ActionMessageState } from '@/components/admin/row-action'

/**
 * The state machine behind every CMS table's inline actions: flip a boolean
 * switch, reorder a row, or delete it behind a confirmation dialog.
 *
 * Projects, experiences and certificates all expose the same publish switch and
 * the same delete flow, so the request handling, the busy tracking and the
 * single live region live here once. What differs per table — the endpoint, the
 * wording, and which extra switches exist — is passed in as data.
 */

export interface ToggleableRow {
  id: string
  title: string
  published: boolean
}

export interface RowToggle<TRow> {
  /** The column to flip. Every table exposes `published`; some add more. */
  field: 'published' | 'featured' | 'current'
  /**
   * Sentence shown after a successful flip. Receives the caller's own row type,
   * so the message can mention the organization, the issuer, and so on.
   */
  describe: (row: TRow) => string
}

export interface RowActionsConfig<TRow extends ToggleableRow> {
  /** Collection endpoint, e.g. `/api/admin/experience`. Item urls append the id. */
  endpoint: string
  /** Noun used in messages, e.g. "experience entry". */
  noun: string
  toggles: readonly RowToggle<TRow>[]
  /** Enables the move up / move down buttons and the reorder endpoint. */
  reorder?: { endpoint: string }
}

export interface RowActions<TRow extends ToggleableRow> {
  message: ActionMessageState
  pendingDelete: TRow | null
  busyId: string | null
  isRefreshing: boolean
  toggle: (row: TRow, field: RowToggle<TRow>['field']) => void
  move: (rows: TRow[], index: number, direction: -1 | 1) => void
  requestDelete: (row: TRow) => void
  cancelDelete: () => void
  confirmDelete: () => void
}

/**
 * Reads a toggle column off a row.
 *
 * The field is one of three known booleans, but the row types are unrelated
 * interfaces, so a single localized cast beats widening every table row to
 * `Record<string, boolean>` and losing the real field types everywhere else.
 */
function readToggle(row: ToggleableRow, field: RowToggle<ToggleableRow>['field']): boolean {
  return Boolean((row as unknown as Record<string, unknown>)[field])
}

export function useRowActions<TRow extends ToggleableRow>(
  config: RowActionsConfig<TRow>
): RowActions<TRow> {
  const router = useRouter()
  const [isRefreshing, startTransition] = useTransition()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<TRow | null>(null)
  const [message, setMessage] = useState<ActionMessageState>(null)

  const report = useCallback(async (response: Response, fallback: string): Promise<boolean> => {
    if (response.status === 401) {
      setMessage({ tone: 'error', text: 'Your session expired. Sign in again.' })
      return false
    }

    const payload = (await response.json().catch(() => ({}))) as {
      message?: string
      errors?: Record<string, string>
    }

    if (!response.ok) {
      // A field-level error from the server is more useful than the generic
      // summary, so surface it when the API sent one.
      const fieldError = payload.errors ? Object.values(payload.errors)[0] : undefined
      setMessage({ tone: 'error', text: fieldError ?? payload.message ?? fallback })
      return false
    }

    return true
  }, [])

  const refresh = useCallback(() => {
    startTransition(() => router.refresh())
  }, [router])

  function toggle(row: TRow, field: RowToggle<TRow>['field']) {
    const definition = config.toggles.find((item) => item.field === field)
    if (!definition) return

    setBusyId(row.id)
    setMessage(null)

    void (async () => {
      try {
        const response = await fetch(`${config.endpoint}/${row.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [field]: !readToggle(row, field) }),
        })

        if (await report(response, `The ${config.noun} could not be updated.`)) {
          setMessage({ tone: 'success', text: definition.describe(row) })
          refresh()
        }
      } catch {
        setMessage({ tone: 'error', text: 'Could not reach the server. Please try again.' })
      } finally {
        setBusyId(null)
      }
    })()
  }

  function move(rows: TRow[], index: number, direction: -1 | 1) {
    if (!config.reorder) return

    const target = index + direction
    if (target < 0 || target >= rows.length) return

    const next = [...rows]
    const [moved] = next.splice(index, 1)
    next.splice(target, 0, moved)

    setBusyId(moved.id)
    setMessage(null)

    void (async () => {
      try {
        const response = await fetch(config.reorder!.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: next.map((row) => row.id) }),
        })

        if (await report(response, `The ${config.noun} order could not be saved.`)) {
          setMessage({ tone: 'success', text: 'Order updated.' })
          refresh()
        }
      } catch {
        setMessage({ tone: 'error', text: 'Could not reach the server. Please try again.' })
      } finally {
        setBusyId(null)
      }
    })()
  }

  function requestDelete(row: TRow) {
    setMessage(null)
    setPendingDelete(row)
  }

  function cancelDelete() {
    setPendingDelete(null)
  }

  function confirmDelete() {
    if (!pendingDelete) return

    const row = pendingDelete
    setBusyId(row.id)
    setMessage(null)

    void (async () => {
      try {
        const response = await fetch(`${config.endpoint}/${row.id}`, { method: 'DELETE' })

        if (await report(response, `The ${config.noun} could not be deleted.`)) {
          setMessage({ tone: 'success', text: `"${row.title}" was deleted.` })
          refresh()
        }
      } catch {
        setMessage({ tone: 'error', text: 'Could not reach the server. Please try again.' })
      } finally {
        setBusyId(null)
        setPendingDelete(null)
      }
    })()
  }

  return {
    message,
    pendingDelete,
    busyId,
    isRefreshing,
    toggle,
    move,
    requestDelete,
    cancelDelete,
    confirmDelete,
  }
}
