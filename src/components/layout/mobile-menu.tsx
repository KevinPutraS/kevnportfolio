'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { classNames } from '@/lib/utils/helpers'
import { useFocusTrap } from '@/lib/hooks/use-focus-trap'

/**
 * Mobile navigation drawer.
 *
 * Accessibility contract:
 * - trigger is a real `<button>` with `aria-expanded` + `aria-controls`
 * - the panel is a labelled `<nav>` inside a focus trap, so Tab cannot wander
 *   into the obscured page
 * - Escape closes it and focus returns to the trigger
 * - `body` scroll is locked while open, and closed on route change
 * - the panel is unmounted when closed, so its links are not tabbable
 */
export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const close = useCallback(() => setIsOpen(false), [])
  const panelRef = useFocusTrap<HTMLDivElement>(isOpen, close)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        aria-label="Open menu"
        className="inline-flex h-10 w-10 items-center justify-center border border-[rgb(var(--border))] text-[rgb(var(--text-primary))] transition-colors hover:border-[rgb(var(--text-muted))] md:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 animate-fade-in bg-black/70" onClick={close} aria-hidden="true" />

          <div
            ref={panelRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            tabIndex={-1}
            className="absolute inset-x-0 top-0 max-h-[100dvh] animate-slide-down overflow-y-auto border-b border-[rgb(var(--border))] bg-[rgb(var(--background))] focus:outline-none"
          >
            <div className="container-custom flex h-16 items-center justify-between">
              <span className="font-display text-sm font-bold tracking-tight">{siteConfig.shortName}</span>
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="inline-flex h-10 w-10 items-center justify-center border border-[rgb(var(--border))] text-[rgb(var(--text-primary))] transition-colors hover:border-[rgb(var(--text-muted))]"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="Mobile" className="container-custom pb-10">
              <ul className="flex flex-col border-t border-[rgb(var(--border-subtle))]">
                {siteConfig.navigation.map((item, index) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  return (
                    <li
                      key={item.href}
                      className="animate-fade-in border-b border-[rgb(var(--border-subtle))]"
                      style={{ animationDelay: `${index * 45}ms` }}
                    >
                      <Link
                        href={item.href}
                        onClick={close}
                        aria-current={isActive ? 'page' : undefined}
                        className={classNames(
                          'flex items-center justify-between py-4 font-display text-2xl font-bold tracking-tight transition-colors',
                          isActive
                            ? 'text-[rgb(var(--accent))]'
                            : 'text-[rgb(var(--text-primary))]'
                        )}
                      >
                        {item.label}
                        <span className="font-mono text-xs font-normal text-[rgb(var(--text-muted))]">
                          0{index + 1}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>

              <div className="mt-8 flex flex-col gap-2">
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="text-sm text-[rgb(var(--text-secondary))] transition-colors hover:text-[rgb(var(--text-primary))]"
                >
                  {siteConfig.email}
                </a>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
