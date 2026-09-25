'use client'

import { forwardRef, HTMLAttributes } from 'react'
import { classNames } from '@/lib/utils/helpers'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ isOpen, onClose, title, description, children, className, ...props }, ref) => {
    if (!isOpen) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby={title ? 'modal-title' : undefined} aria-describedby={description ? 'modal-description' : undefined}>
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" 
          onClick={onClose}
          aria-hidden="true"
        />
        <div
          ref={ref}
          className={classNames(
            'relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-[rgb(var(--surface))] border border-[rgb(var(--border))] shadow-2xl animate-scale-in',
            className
          )}
          {...props}
        >
          {(title || description) && (
            <div className="flex items-start justify-between gap-4 border-b border-[rgb(var(--border-subtle))] p-6">
              <div>
                {title && (
                  <h2 id="modal-title" className="text-xl font-semibold text-[rgb(var(--text-primary))]">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id="modal-description" className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
                    {description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--surface-elevated))] transition-colors"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    )
  }
)

Modal.displayName = 'Modal'