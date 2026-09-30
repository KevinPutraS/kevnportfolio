'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { siteConfig } from '@/config/site'
import { classNames, isActiveRoute } from '@/lib/utils/helpers'
import { NavIcon } from './nav-icons'

/**
 * Bottom tab bar for the public site, below `lg`.
 *
 * The admin already ships this pattern (`AdminTabBar`), a small, fixed, flat set
 * of peers where every item is a destination of equal weight. The public site
 * has the same geometry — a phone held in one hand, thumb at the bottom — and
 * the top bar alone hides its five destinations behind the drawer. So the
 * hamburger stays (the drawer owns "everything and then some": Certificates,
 * email and social links), and the bar earns a spot for the journeys a visitor
 * actually makes.
 *
 * Five items, and the cap is arithmetic rather than taste. The navigation has
 * seven destinations; six peers at 320px leaves each slot roughly 53px wide and
 * the long labels end up clipped or set in type too small to read. So two ride
 * in the drawer instead: About and Resume.
 *
 * About was already the case that decided this. Resume is the same kind of
 * decision for the same reason — a CV is something a visitor goes to *deliberately*,
 * once, usually after they have already looked at the work, and it is reachable
 * from the drawer, the desktop nav and the footer. Certificates stays, because a
 * credential is something a thumb reaches for on its own. The list is *derived*
 * from the nav so labels and tones cannot drift, and the pair that rides in the
 * drawer is one filter below.
 *
 * The ticket for being "prettier than the admin bar":
 *  - the active icon sits in a filled amber pill (`--accent` on
 *    `--accent-contrast`), the same tile language as the drawer and sidebar,
 *    instead of the admin's bare hairline + hue change
 *  - the 2px accent rule still rides the top edge, so the active state never
 *    depends on colour alone
 *  - `min-h-16` matches the top bar's row height, so a bar at the top and a
 *    bar at the bottom of the viewport agree on scale
 *  - `env(safe-area-inset-bottom)` is padding on the bar, or the home gesture
 *    sits on top of the last item on a notched phone
 *
 * Portable and prefetch-friendly: plain `<Link>`s, no drawer to open.
 */
/** The two destinations that live in the drawer instead — see the note above. */
const DRAWER_ONLY = new Set(['/about', '/resume'])

export function BottomNav() {
  const pathname = usePathname()
  const items = siteConfig.navigation.filter((item) => !DRAWER_ONLY.has(item.href))

  return (
    <nav aria-label="Main" data-print="hide" className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
      <div className="border-t border-[rgb(var(--border))] bg-[rgb(var(--bg)/0.85)] pb-[env(safe-area-inset-bottom)] shadow-[0_-14px_40px_-24px_rgb(0_0_0/0.9)] backdrop-blur-xl">
        <ul className="flex w-full">
          {items.map((item) => {
            const current = isActiveRoute(pathname, item.href)

            return (
              <li key={item.href} className="group flex-1">
                <Link
                  href={item.href}
                  aria-current={current ? 'page' : undefined}
                  className="relative flex min-h-16 flex-col items-center justify-center gap-1 pt-1"
                >
                  <span
                    aria-hidden="true"
                    className={classNames(
                      'absolute inset-x-4 top-0 h-0.5 rounded-full bg-[rgb(var(--accent))] transition-opacity duration-200',
                      current ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <span
                    className={classNames(
                      'flex h-6 min-w-10 items-center justify-center rounded-full border px-2 transition-[background-color,color] duration-200',
                      current
                        ? 'border-transparent bg-[rgb(var(--accent))] text-[rgb(var(--accent-contrast))]'
                        : 'border-transparent text-[rgb(var(--text-muted))] group-hover:bg-[rgb(var(--bg-highlight))] group-hover:text-[rgb(var(--text-dim))]'
                    )}
                  >
                    <NavIcon
                      name={item.label}
                      className={current ? 'h-5 w-5 stroke-[2.25]' : 'h-5 w-5'}
                    />
                  </span>
                  <span
                    className={classNames(
                      'text-[0.625rem] font-medium leading-none tracking-[-0.01em] transition-colors duration-200',
                      current ? 'text-[rgb(var(--accent))]' : 'text-[rgb(var(--text-muted))] group-hover:text-[rgb(var(--text-dim))]'
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}