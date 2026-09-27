'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import { siteConfig, socialLinks, type NavItem } from '@/config/site'
import { classNames, isActiveRoute } from '@/lib/utils/helpers'
import { useFocusTrap } from '@/lib/hooks/use-focus-trap'

/**
 * Mobile navigation drawer.
 *
 * Redesigned around one observation: the previous version gave every item a
 * one-line description, so the drawer needed three or four screens of scrolling
 * before the social links at the bottom were even reachable. A menu is a way out
 * of a page, not a page — it should be readable in one glance and dismissed just
 * as fast. The descriptions moved to the hero, which is where a visitor actually
 * decides where to go.
 *
 * What replaced them: an icon and a hue per destination, so each row is
 * identifiable at a glance and the whole menu fits without scrolling. The hues
 * are the same category palette used by the section cards, so the menu reads as
 * part of the site rather than a separate component.
 *
 * Accessibility contract, unchanged and not traded away for the compactness:
 * - the trigger is a real `<button>` with `aria-expanded` + `aria-controls`
 * - the panel is a labelled dialog inside a focus trap, so Tab cannot wander into
 *   the obscured page
 * - Escape closes it and focus returns to the trigger
 * - `body` scroll is locked while open and restored on close
 * - the panel is unmounted when closed, so its links are not tabbable
 *
 * Why a portal. The header is `sticky` with `backdrop-blur`, and a
 * `backdrop-filter` (like `transform` or `filter`) establishes a **containing
 * block for fixed-position descendants**. A `fixed inset-0` panel rendered inside
 * the header was therefore laid out relative to the header, not the viewport: the
 * drawer was clipped to the 64px header strip and the page behind stayed visible
 * and scrollable. `createPortal` to `document.body` puts it outside that
 * containing block. `mounted` guards SSR, where `document` does not exist.
 */
export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const panelRef = useFocusTrap<HTMLDivElement>(isOpen, () => setIsOpen(false))

  const close = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    setMounted(true)
  }, [])

  // A route change from outside the drawer (browser back, a footer link) must
  // not leave the menu open over the new page.
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const toneFor = useMemo(
    () =>
      new Map<string, string>([
        ['/', 'cat-web'],
        ['/projects', 'cat-app'],
        ['/experience', 'cat-design'],
        ['/certificates', 'cat-networking'],
        ['/about', 'cat-experiment'],
        ['/contact', 'cat-school'],
      ]),
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
        className="-mr-1 inline-flex h-11 w-11 items-center justify-center rounded-sm text-[rgb(var(--text))] transition-colors duration-150 hover:text-[rgb(var(--accent))] lg:hidden"
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {isOpen &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[60] lg:hidden">
            <div className="absolute inset-0 animate-fade-in bg-black/80" onClick={close} aria-hidden="true" />

            <div
              ref={panelRef}
              id="mobile-navigation"
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              tabIndex={-1}
              className="absolute inset-x-0 top-0 flex max-h-[100dvh] animate-slide-down flex-col overflow-y-auto overscroll-contain border-b border-[rgb(var(--border))] bg-[rgb(var(--background))] focus:outline-none"
            >
              <div className="container-custom flex h-16 shrink-0 items-center justify-between border-b border-[rgb(var(--border))]">
                <span className="font-display text-lg font-bold tracking-[-0.035em]">
                  {siteConfig.name}
                  <span className="text-[rgb(var(--accent))]">.</span>
                </span>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close menu"
                  className="-mr-1 inline-flex h-11 w-11 items-center justify-center rounded-sm text-[rgb(var(--text))] transition-colors duration-150 hover:text-[rgb(var(--accent))]"
                >
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <nav aria-label="Mobile" className="container-custom flex-1 py-4">
                <ul className="space-y-1">
                  {siteConfig.navigation.map((item) => (
                    <MenuRow
                      key={item.href}
                      item={item}
                      tone={toneFor.get(item.href) ?? 'cat-other'}
                      active={isActiveRoute(pathname, item.href)}
                      onNavigate={close}
                    />
                  ))}
                </ul>

                <div className="mt-5 space-y-3 border-t border-[rgb(var(--border))] pt-5">
                  <a
                    href={siteConfig.contactEmail}
                    className="flex min-h-11 items-center gap-2.5 text-[length:var(--text-sm)] text-[rgb(var(--text-dim))] transition-colors duration-200 hover:text-[rgb(var(--accent))]"
                  >
                    <MenuIcon name="mail" className="h-4 w-4 text-[rgb(var(--text-muted))]" />
                    <span className="truncate">{siteConfig.email}</span>
                  </a>

                  <ul className="flex flex-wrap gap-x-5">
                    {socialLinks.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex min-h-11 items-center gap-1 text-[length:var(--text-sm)] text-[rgb(var(--text-muted))] transition-colors duration-200 hover:text-[rgb(var(--accent))]"
                        >
                          {link.label}
                          <ArrowUpRight
                            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            aria-hidden="true"
                          />
                          <span className="sr-only">(opens in a new tab)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </nav>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}

/**
 * One destination: icon tile, label, and its hue. No description — see the note
 * on the drawer. The active row is marked three ways, so it does not rely on
 * colour alone: a filled tile, primary text, and `aria-current`.
 */
function MenuRow({
  item,
  tone,
  active,
  onNavigate,
}: {
  item: NavItem
  tone: string
  active: boolean
  onNavigate: () => void
}) {
  return (
    <li className={tone}>
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? 'page' : undefined}
        className={classNames(
          'flex min-h-14 items-center gap-3.5 rounded-xl border px-3 transition-[background-color,border-color] duration-200',
          active
            ? 'border-[rgb(var(--cat)/0.5)] bg-[rgb(var(--cat)/0.12)]'
            : 'border-transparent hover:border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-elevated))]'
        )}
      >
        <span
          className={classNames(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors duration-200',
            active
              ? 'border-[rgb(var(--cat))] bg-[rgb(var(--cat))] text-[rgb(var(--bg))]'
              : 'border-[rgb(var(--cat)/0.35)] bg-[rgb(var(--cat)/0.12)] text-[rgb(var(--cat))]'
          )}
        >
          <MenuIcon name={item.label} />
        </span>

        <span
          className={classNames(
            'font-display text-lg font-bold tracking-[-0.02em] transition-colors duration-200',
            active ? 'text-[rgb(var(--cat))]' : 'text-[rgb(var(--text))]'
          )}
        >
          {item.label}
        </span>

        {active && (
          <span className="ml-auto text-[length:var(--text-xs)] uppercase tracking-[0.14em] text-[rgb(var(--cat))]">
            Here
          </span>
        )}
      </Link>
    </li>
  )
}

/** Inline icons keyed by the nav label, so no icon package grows for six items. */
function MenuIcon({ name, className }: { name: string; className?: string }) {
  const shared = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: className ?? 'h-[18px] w-[18px]',
    'aria-hidden': true,
  }

  switch (name) {
    case 'Home':
      return (
        <svg {...shared}>
          <path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2Z" />
        </svg>
      )
    case 'Projects':
      return (
        <svg {...shared}>
          <rect x="3" y="3" width="8" height="8" rx="2" />
          <rect x="13" y="3" width="8" height="8" rx="2" />
          <rect x="3" y="13" width="8" height="8" rx="2" />
          <rect x="13" y="13" width="8" height="8" rx="2" />
        </svg>
      )
    case 'Experience':
      return (
        <svg {...shared}>
          <path d="M4 21v-1.5A4.5 4.5 0 0 1 8.5 15h1A4.5 4.5 0 0 1 14 19.5V21" />
          <circle cx="11" cy="8" r="3.5" />
          <path d="M18 21v-1.5a4.5 4.5 0 0 0-3-4.24" />
          <path d="M15.5 4.6a3.5 3.5 0 0 1 0 6.8" />
        </svg>
      )
    case 'Certificates':
      return (
        <svg {...shared}>
          <path d="M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" />
          <path d="m8.5 13.5-1.5 7 5-2.5 5 2.5-1.5-7" />
        </svg>
      )
    case 'About':
      return (
        <svg {...shared}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
        </svg>
      )
    case 'Contact':
      return (
        <svg {...shared}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      )
    case 'mail':
      return (
        <svg {...shared}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      )
    default:
      return (
        <svg {...shared}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      )
  }
}
