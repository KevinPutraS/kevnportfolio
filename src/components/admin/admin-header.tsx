'use client'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { ExternalLink, Menu, X } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { classNames, isActiveRoute } from '@/lib/utils/helpers'
import { useFocusTrap } from '@/lib/hooks/use-focus-trap'
import { AdminBrand, AdminNavLinks, SignOutForm, ViewSiteLink, useAdminSection } from './admin-navigation'

/**
 * The admin shell header, which below `md` is also the entire navigation.
 *
 * The previous version had no mobile trigger at all, so under the `md`
 * breakpoint the navigation was unreachable.
 *
 * It also said nothing about *where you are*. It rendered the literal word
 * "Admin" at every width, on every section — an admin moving between Projects
 * and Certificates on a phone got no confirmation that the tap had landed, and
 * no context about what the screen in front of them contains. The current
 * section is named here, taken from the same `adminNavigation` config the nav
 * list is built from.
 *
 * Portalled to `<body>` at `z-[70]`, above the header's own `z-40` and above the
 * sticky form action bars. See `MobileMenu` on the public site for why a
 * `fixed` overlay must not be rendered inside a `backdrop-filter`ed ancestor.
 */
export function AdminHeader({ email }: { email: string | null }) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const section = useAdminSection()

  const close = useCallback(() => setIsOpen(false), [])
  const panelRef = useFocusTrap<HTMLDivElement>(isOpen, close)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-40 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg)/0.9)] backdrop-blur-xl md:hidden">
      <div className="flex h-16 items-center justify-between gap-3 px-4">
        <div className="min-w-0">
          <p className="font-mono text-[length:var(--text-xs)] uppercase tracking-[0.14em] text-[rgb(var(--text-muted))]">
            {siteConfig.name} · Admin
          </p>
          <p className="mt-0.5 truncate font-display text-[length:var(--text-base)] font-bold tracking-[-0.02em] text-[rgb(var(--text))]">
            {section}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {/*
            A direct link to the public site, on every mobile screen. The
            sidebar has always offered it and the sidebar does not exist at this
            width, so the only way back to the front end was to open the drawer
            and then find the link at the bottom of it.
          */}
          <Link
            href="/"
            className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] text-[rgb(var(--text-dim))] transition-colors hover:bg-[rgb(var(--bg-highlight))] hover:text-[rgb(var(--accent))]"
            aria-label="View public site"
          >
            <ExternalLink className="h-5 w-5" aria-hidden="true" />
          </Link>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-expanded={isOpen}
            aria-controls="admin-mobile-nav"
            aria-label="Open admin menu"
            className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] text-[rgb(var(--text))] transition-colors hover:bg-[rgb(var(--bg-highlight))]"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>

      {isOpen &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[70] md:hidden">
            <div
              className="animate-fade-in absolute inset-0 bg-[rgb(0_0_0/0.65)] backdrop-blur-sm"
              onClick={close}
              aria-hidden="true"
            />

            {/*
              A right-hand sheet, matching the public drawer. The previous
              version dropped a panel from the top edge and capped it with
              `max-h-[100dvh]` — so its height depended on how much content it
              happened to hold, and it arrived covering an unknown fraction of
              the screen. Full height and anchored to one edge behaves the same
              at every content length.
            */}
            <div
              ref={panelRef}
              id="admin-mobile-nav"
              role="dialog"
              aria-modal="true"
              aria-label="Admin navigation"
              tabIndex={-1}
              className="surface-glass absolute inset-y-0 right-0 flex w-[min(19rem,86vw)] animate-slide-in-right flex-col border-l border-[rgb(var(--border))] focus:outline-none"
            >
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-[rgb(var(--border))] px-4">
                <AdminBrand />
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close admin menu"
                  className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] text-[rgb(var(--text))] transition-colors hover:bg-[rgb(var(--bg-highlight))]"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain py-4">
                <AdminNavLinks onNavigate={close} />
              </div>

              <div className={classNames('shrink-0 space-y-1 border-t border-[rgb(var(--border))] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]')}>
                {email && (
                  <p className="truncate px-3 pb-1.5 font-mono text-[length:var(--text-xs)] text-[rgb(var(--text-muted))]">
                    {email}
                  </p>
                )}
                <ViewSiteLink onNavigate={close} />
                <SignOutForm />
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  )
}
