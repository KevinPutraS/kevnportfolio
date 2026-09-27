'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Menu, X } from 'lucide-react'
import { useFocusTrap } from '@/lib/hooks/use-focus-trap'
import { AdminBrand, AdminNavLinks, SignOutForm, ViewSiteLink } from './admin-navigation'

/**
 * The admin shell header, which is also the entire mobile navigation.
 *
 * The previous version had no mobile trigger at all, so below the `md`
 * breakpoint the navigation was unreachable.
 *
 * Rendered through a portal, for the same reason the public menu is: this header
 * is `sticky`, and while `sticky` alone does not create a containing block, the
 * panel is a sibling of the content it overlays and a portal keeps it from
 * inheriting any future `transform` or `backdrop-filter` added to the header —
 * which is exactly the bug that clipped the public drawer to 64px.
 */
export function AdminHeader({ email }: { email: string | null }) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const close = () => setIsOpen(false)
  const panelRef = useFocusTrap<HTMLDivElement>(isOpen, close)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-40 border-b border-[rgb(var(--border))] bg-[rgb(var(--background))] md:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <p className="font-display text-sm font-bold tracking-[-0.02em] text-[rgb(var(--text))]">
          Admin
        </p>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-expanded={isOpen}
          aria-controls="admin-mobile-nav"
          aria-label="Open admin menu"
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-sm text-[rgb(var(--text))] transition-colors hover:text-[rgb(var(--accent))]"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {isOpen &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[60] md:hidden">
            <div className="absolute inset-0 animate-fade-in bg-black/75" onClick={close} aria-hidden="true" />
            <div
              ref={panelRef}
              id="admin-mobile-nav"
              role="dialog"
              aria-modal="true"
              aria-label="Admin navigation"
              tabIndex={-1}
              className="absolute inset-x-0 top-0 flex max-h-[100dvh] flex-col overflow-y-auto overscroll-contain border-b border-[rgb(var(--border))] bg-[rgb(var(--background))] focus:outline-none"
            >
              <div className="flex h-14 shrink-0 items-center justify-between px-4">
                <span className="font-display text-sm font-bold tracking-[-0.02em] text-[rgb(var(--text))]">
                  Admin
                </span>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close admin menu"
                  className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-sm text-[rgb(var(--text))] transition-colors hover:text-[rgb(var(--accent))]"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="flex-1 pb-8">
                <AdminNavLinks onNavigate={close} />
                <div className="mt-6 border-t border-[rgb(var(--border))] pt-4">
                  {email && (
                    <p className="truncate px-4 pb-2 font-mono text-[length:var(--text-xs)] text-[rgb(var(--text-muted))]">
                      {email}
                    </p>
                  )}
                  <ViewSiteLink onNavigate={close} />
                  <SignOutForm />
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  )
}
