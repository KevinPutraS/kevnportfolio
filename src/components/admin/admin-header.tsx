'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useFocusTrap } from '@/lib/hooks/use-focus-trap'
import { AdminBrand, AdminNavLinks, SignOutForm, ViewSiteLink } from './admin-navigation'

/**
 * The admin shell header.
 *
 * The previous version had no mobile trigger at all, so the navigation was
 * unreachable below the `md` breakpoint.
 */
export function AdminHeader({ email }: { email: string | null }) {
  const [isOpen, setIsOpen] = useState(false)
  const close = () => setIsOpen(false)
  const panelRef = useFocusTrap<HTMLDivElement>(isOpen, close)

  return (
    <header className="sticky top-0 z-40 border-b border-[rgb(var(--border-subtle))] bg-[rgb(var(--background))] md:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <p className="font-display text-sm font-bold tracking-tight">Admin</p>

        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls="admin-mobile-nav"
          aria-label={isOpen ? 'Close admin menu' : 'Open admin menu'}
          className="inline-flex h-10 w-10 items-center justify-center border border-[rgb(var(--border))] text-[rgb(var(--text-primary))]"
        >
          {isOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 animate-fade-in bg-black/70" onClick={close} aria-hidden="true" />
          <div
            ref={panelRef}
            id="admin-mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Admin navigation"
            tabIndex={-1}
            className="absolute inset-x-0 top-0 max-h-[100dvh] overflow-y-auto border-b border-[rgb(var(--border))] bg-[rgb(var(--background))] focus:outline-none"
          >
            <div className="flex h-14 items-center justify-end px-4">
              <button
                type="button"
                onClick={close}
                aria-label="Close admin menu"
                className="inline-flex h-10 w-10 items-center justify-center border border-[rgb(var(--border))] text-[rgb(var(--text-primary))]"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="pb-8">
              <AdminNavLinks onNavigate={close} />
              <div className="mt-6 border-t border-[rgb(var(--border-subtle))] pt-4">
                {email && <p className="px-4 pb-2 font-mono text-xs text-[rgb(var(--text-muted))]">{email}</p>}
                <ViewSiteLink onNavigate={close} />
                <SignOutForm />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
