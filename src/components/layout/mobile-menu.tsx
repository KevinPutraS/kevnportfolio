'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import { siteConfig, socialLinks } from '@/config/site'
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
 *
 * Visually it mirrors the desktop bar rather than inventing a second design:
 * the same wordmark, the same numbered index, the same hairline separators. The
 * only concession to the small viewport is the larger touch target.
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
        className="inline-flex h-10 w-10 items-center justify-center text-[rgb(var(--text-primary))] transition-colors duration-150 hover:text-[rgb(var(--accent))] md:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 animate-fade-in bg-black/80" onClick={close} aria-hidden="true" />

          <div
            ref={panelRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            tabIndex={-1}
            className="absolute inset-x-0 top-0 max-h-[100dvh] animate-slide-down overflow-y-auto overscroll-contain border-b border-[rgb(var(--border))] bg-[rgb(var(--background))] focus:outline-none"
          >
            <div className="container-custom flex h-16 items-center justify-between border-b border-[rgb(var(--border-subtle))]">
              <span className="font-display text-base font-bold tracking-[-0.03em]">
                {siteConfig.shortName}
                <span className="text-[rgb(var(--accent))]">.</span>
              </span>
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="inline-flex h-10 w-10 items-center justify-center text-[rgb(var(--text-primary))] transition-colors duration-150 hover:text-[rgb(var(--accent))]"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="Mobile" className="container-custom py-8">
              <ul>
                {siteConfig.navigation.map((item, index) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

                  return (
                    <li
                      key={item.href}
                      className="animate-fade-in border-t border-[rgb(var(--border-subtle))] last:border-b"
                      style={{ animationDelay: `${index * 45}ms` }}
                    >
                      <Link
                        href={item.href}
                        onClick={close}
                        aria-current={isActive ? 'page' : undefined}
                        className="group flex items-baseline gap-4 py-4"
                      >
                        <span
                          className={classNames(
                            'index-marker transition-colors duration-150',
                            isActive && 'text-[rgb(var(--accent))]'
                          )}
                        >
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span
                          className={classNames(
                            'flex-1 font-display text-2xl font-bold tracking-[-0.03em] transition-colors duration-150',
                            isActive
                              ? 'text-[rgb(var(--text-primary))]'
                              : 'text-[rgb(var(--text-secondary))] group-hover:text-[rgb(var(--text-primary))]'
                          )}
                        >
                          {item.label}
                        </span>
                        <ArrowUpRight
                          className="h-4 w-4 shrink-0 self-center text-[rgb(var(--text-muted))] transition-colors duration-150 group-hover:text-[rgb(var(--accent))]"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  )
                })}
              </ul>

              <div className="mt-10 border-t border-[rgb(var(--border-subtle))] pt-6">
                <p className="meta-label">Email</p>
                <a
                  href={siteConfig.contactEmail}
                  className="mt-3 inline-block break-all font-mono text-sm text-[rgb(var(--text-secondary))] transition-colors duration-150 hover:text-[rgb(var(--accent))]"
                >
                  {siteConfig.email}
                </a>

                <p className="meta-label mt-8">Elsewhere</p>
                <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                  {socialLinks.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[rgb(var(--text-muted))] transition-colors duration-150 hover:text-[rgb(var(--text-primary))]"
                      >
                        {link.label}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
