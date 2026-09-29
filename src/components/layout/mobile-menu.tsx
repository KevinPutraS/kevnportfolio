'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import { Menu, X, ArrowUpRight, Mail } from 'lucide-react'
import { siteConfig, socialLinks, type NavItem } from '@/config/site'
import { classNames, isActiveRoute } from '@/lib/utils/helpers'
import { useFocusTrap } from '@/lib/hooks/use-focus-trap'

/**
 * Mobile navigation drawer.
 *
 * A full-height sheet rather than a panel that drops in from the top edge. The
 * top-panel version had to guess a height, capped itself with `max-h`, and on a
 * short phone the social links fell below the fold of a menu — which is a
 * terrible ratio. A full-height drawer has room for every destination at a
 * genuinely comfortable row height plus the contact details, with no scrolling
 * and no guessing.
 *
 * The descriptions that used to sit under each label are gone. They made the
 * list three screens long, and a menu is a way out of a page, not a page. The
 * copy they carried moved to the hero, which is where a visitor actually
 * decides where to go. What replaces them is an icon and a hue per destination
 * — the same category palette the section cards use, so the menu reads as part
 * of the site rather than a separate component.
 *
 * Accessibility contract, not traded away for the compactness:
 * - the trigger is a real `<button>` with `aria-expanded` + `aria-controls`
 * - the panel is a labelled dialog inside a focus trap, so Tab cannot wander
 *   into the obscured page
 * - Escape closes it and focus returns to the trigger
 * - `body` scroll is locked while open and restored on close
 * - the panel is unmounted when closed, so its links are not tabbable
 *
 * Why a portal. The header is `sticky` with `backdrop-blur`, and a
 * `backdrop-filter` (like `transform` or `filter`) establishes a **containing
 * block for fixed-position descendants**. A `fixed inset-0` panel rendered
 * inside the header was therefore laid out relative to the header, not the
 * viewport: the drawer was clipped to the 64px header strip and the page behind
 * stayed visible and scrollable. `createPortal` to `document.body` puts it
 * outside that containing block. `mounted` guards SSR, where `document` does
 * not exist.
 */
export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const close = useCallback(() => setIsOpen(false), [])
  /*
    `close` is passed to the trap, not an inline `() => setIsOpen(false)`. The
    hook lists `onClose` in its effect dependencies, so a fresh arrow function
    every render would tear the trap down and rebuild it on each render — which
    re-locks the scroll, re-runs the listener and, worst of all, yanks focus
    back to the panel. `useCallback` gives it a stable identity so the effect
    only runs when the drawer actually opens or closes.
  */
  const panelRef = useFocusTrap<HTMLDivElement>(isOpen, close)

  useEffect(() => {
    setMounted(true)
  }, [])

  // A route change from outside the drawer (browser back, a footer link) must
  // not leave the menu open over the new page.
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        aria-label="Open menu"
        className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] text-[rgb(var(--text))] transition-colors duration-200 hover:bg-[rgb(var(--bg-highlight))] lg:hidden"
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {isOpen &&
        mounted &&
        createPortal(
          /*
            `h-[100dvh]` rather than `inset-0`. A `fixed` box sized with `inset-0`
            resolves against the *layout* viewport, which on iOS Safari is taller
            than what the user can actually see while the URL bar is expanded — so
            the drawer's footer (email + social links, in a `shrink-0` block at the
            bottom) sat underneath the browser chrome and could not be tapped.
            The dynamic viewport tracks the bars as they collapse, and `top-0` is
            kept explicit so the panel still starts at the very top.
          */
          <div className="fixed inset-x-0 top-0 z-[70] h-[100dvh] lg:hidden">
            <div
              className="animate-fade-in absolute inset-0 bg-[rgb(0_0_0/0.65)] backdrop-blur-sm"
              onClick={close}
              aria-hidden="true"
            />

            <div
              ref={panelRef}
              id="mobile-navigation"
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              tabIndex={-1}
              className="surface-glass absolute inset-y-0 right-0 flex w-[min(21rem,88vw)] animate-slide-in-right flex-col border-l border-[rgb(var(--border))] shadow-[-24px_0_60px_-20px_rgb(0_0_0/0.8)] focus:outline-none"
            >
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-[rgb(var(--border))] px-4">
                <span className="font-display text-lg font-bold tracking-[-0.04em] text-[rgb(var(--text))]">
                  {siteConfig.name}
                  <span className="text-[rgb(var(--accent))]">.</span>
                </span>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close menu"
                  className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] text-[rgb(var(--text))] transition-colors duration-200 hover:bg-[rgb(var(--bg-highlight))]"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <nav aria-label="Mobile" className="flex-1 overflow-y-auto overscroll-contain px-3 py-4">
                <ul className="flex flex-col gap-1.5">
                  {siteConfig.navigation.map((item) => (
                    <MenuRow
                      key={item.href}
                      item={item}
                      active={isActiveRoute(pathname, item.href)}
                      onNavigate={close}
                    />
                  ))}
                </ul>
              </nav>

              <div className="shrink-0 space-y-4 border-t border-[rgb(var(--border))] px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                <a
                  href={siteConfig.contactEmail}
                  className="flex min-h-11 items-center gap-2.5 text-[length:var(--text-sm)] text-[rgb(var(--text-dim))] transition-colors duration-200 hover:text-[rgb(var(--accent))]"
                >
                  <Mail className="h-4 w-4 shrink-0 text-[rgb(var(--text-muted))]" aria-hidden="true" />
                  <span className="truncate">{siteConfig.email}</span>
                </a>

                <ul className="flex flex-wrap gap-x-5 gap-y-1">
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
 *
 * The whole row is one link with a 56px minimum height, so the tap target is
 * the full width of the drawer rather than the width of the word.
 */
function MenuRow({
  item,
  active,
  onNavigate,
}: {
  item: NavItem
  active: boolean
  onNavigate: () => void
}) {
  return (
    <li className={item.tone ?? 'cat-other'}>
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? 'page' : undefined}
        className={classNames(
          'flex min-h-14 items-center gap-3.5 rounded-[var(--radius-lg)] border px-3 transition-[background-color,border-color] duration-200',
          active
            ? 'border-[rgb(var(--cat)/0.55)] bg-[rgb(var(--cat)/0.14)]'
            : 'border-transparent hover:border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-elevated))]'
        )}
      >
        <span
          className={classNames(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border transition-colors duration-200',
            active
              ? 'border-transparent bg-[rgb(var(--cat))] text-[rgb(var(--bg))]'
              : 'border-[rgb(var(--cat)/0.35)] bg-[rgb(var(--cat)/0.12)] text-[rgb(var(--cat))]'
          )}
        >
          <NavIcon name={item.label} />
        </span>

        <span
          className={classNames(
            'font-display text-[length:var(--text-base)] font-bold tracking-[-0.02em] transition-colors duration-200',
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
function NavIcon({ name }: { name: string }) {
  const shared = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: 'h-5 w-5',
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
    default:
      return (
        <svg {...shared}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      )
  }
}
