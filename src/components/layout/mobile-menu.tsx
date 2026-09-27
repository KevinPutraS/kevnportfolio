'use client'

import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { siteConfig, socialLinks } from '@/config/site'
import { classNames, isActiveRoute } from '@/lib/utils/helpers'
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
 * the same wordmark, the same labels, the same active marker. Each item also
 * carries a one-line description of what is on that page, so on a phone — where
 * there is no other context — a visitor knows what they are about to open
 * before they commit to it.
 */
export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const panelRef = useFocusTrap<HTMLDivElement>(isOpen, () => setIsOpen(false))

  const close = useCallback(() => setIsOpen(false), [])

  // Annotated as `Map<string, string>`: `siteConfig.sections` is `as const`, so
  // an inferred Map keys on the literal href union and rejects the plain
  // `string` coming from `NavItem`.
  const descriptions = useMemo(
    () => new Map<string, string>(siteConfig.sections.map((section) => [section.href, section.description])),
    []
  )

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        aria-label="Open menu"
        className="-mr-1 inline-flex h-11 w-11 items-center justify-center rounded-sm text-[rgb(var(--text-primary))] transition-colors duration-150 hover:text-[rgb(var(--accent))] lg:hidden"
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
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
              <span className="font-display text-lg font-bold tracking-[-0.035em]">
                {siteConfig.name}
                <span className="text-[rgb(var(--accent))]">.</span>
              </span>
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="-mr-1 inline-flex h-11 w-11 items-center justify-center rounded-sm text-[rgb(var(--text-primary))] transition-colors duration-150 hover:text-[rgb(var(--accent))]"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="Mobile" className="container-custom py-6">
              <ul>
                {siteConfig.navigation.map((item, index) => {
                  const isActive = isActiveRoute(pathname, item.href)
                  const description = descriptions.get(item.href)

                  return (
                    <li
                      key={item.href}
                      className="animate-fade-in border-t border-[rgb(var(--border-subtle))] last:border-b"
                      style={{ animationDelay: `${index * 40}ms` }}
                    >
                      <Link
                        href={item.href}
                        onClick={close}
                        aria-current={isActive ? 'page' : undefined}
                        className={classNames(
                          'group flex min-h-14 flex-col justify-center gap-1 py-4',
                          isActive && 'border-l-2 border-l-[rgb(var(--accent))] pl-4'
                        )}
                      >
                        <span
                          className={classNames(
                            'font-display text-xl font-bold tracking-[-0.03em] transition-colors duration-150',
                            isActive
                              ? 'text-[rgb(var(--accent))]'
                              : 'text-[rgb(var(--text-primary))]'
                          )}
                        >
                          {item.label}
                        </span>
                        {description && (
                          <span className="max-w-prose text-[length:var(--text-body-sm)] leading-snug text-[rgb(var(--text-secondary))]">
                            {description}
                          </span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>

              <div className="mt-8 border-t border-[rgb(var(--border-subtle))] pt-6">
                <p className="label">Email</p>
                <a
                  href={siteConfig.contactEmail}
                  className="inline-block min-h-11 break-all py-1 font-mono text-sm text-[rgb(var(--text-secondary))] transition-colors duration-150 hover:text-[rgb(var(--accent))]"
                >
                  {siteConfig.email}
                </a>

                <p className="label mt-6">Elsewhere</p>
                <ul className="flex flex-wrap gap-x-6 gap-y-1">
                  {socialLinks.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center text-[length:var(--text-body-sm)] text-[rgb(var(--text-secondary))] transition-colors duration-150 hover:text-[rgb(var(--accent))]"
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
