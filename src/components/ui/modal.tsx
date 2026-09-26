'use client'

import { useCallback, useEffect, useId, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { classNames } from '@/lib/utils/helpers'
import { useFocusTrap } from '@/lib/hooks/use-focus-trap'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, title, description, children, className }: ModalProps) {
  const titleId = useId()
  const descriptionId = useId()
  const containerRef = useFocusTrap<HTMLDivElement>(isOpen, onClose)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto sm:items-center sm:p-4">
      <div className="fixed inset-0 animate-fade-in bg-black/75" onClick={onClose} aria-hidden="true" />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={classNames(
          'relative z-10 w-full max-w-lg animate-slide-up border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-6 shadow-2xl focus:outline-none sm:max-w-xl',
          className
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id={titleId} className="font-display text-xl font-semibold">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1.5 text-sm text-[rgb(var(--text-secondary))]">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 -mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center text-[rgb(var(--text-muted))] transition-colors hover:text-[rgb(var(--text-primary))]"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}

/** Escape handler helper reused by dismissible surfaces. */
export function useEscapeKey(enabled: boolean, onEscape: () => void): void {
  const handler = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') onEscape()
    },
    [onEscape]
  )
  useEffect(() => {
    if (!enabled) return
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [enabled, handler])
}
