'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { classNames, isActiveRoute } from '@/lib/utils/helpers'
import { ICONS, adminItems } from './admin-navigation'

/**
 * Bottom tab bar — the entire admin navigation below `md`.
 *
 * Until now a phone had to open a drawer, scroll to the list, and tap, for every
 * single section change. Five taps to reach Certificates. The drawer was also
 * the only mobile carrier for "View site" and "Sign out", so those two actions
 * were buried at the bottom of a panel the user had to open to do anything at
 * all. They live in the header now, and the bar is free to be just navigation.
 *
 * A bottom bar is the right shape for this data: a small, fixed, flat set of
 * peers where every item is a destination of equal weight. That is the exact
 * opposite of a drill-down hierarchy, which is what a drawer implies.
 *
 * Three details that decide whether a bar this small is usable:
 *
 *  - The items are `flex-1` rather than a fixed width, so the bar fills 320px
 *    and 430px alike instead of leaving a gap or clipping "Certificates".
 *  - `min-h-14` plus `env(safe-area-inset-bottom)` padding. 56px is a
 *    comfortable target, and on a home-indicator device the extra inset has to
 *    be padding on the bar or the home gesture sits on top of the last item.
 *  - The active item is marked three ways: a 2px accent rule at the top of the
 *    item, the accent hue on icon and label, and `aria-current="page"`. Colour
 *    alone is not enough, and the rule is what actually reads at a glance.
 *
 * The icons come from the same `ICONS` map the sidebar uses, and the items from
 * the same `siteConfig.adminNavigation`, so neither surface can drift.
 *
 * The row height is `var(--admin-tabbar-h)` rather than a literal, because
 * `FormStickyActions` pins itself to the bottom of the viewport on a phone and
 * has to clear this bar to stay usable. Two numbers written down twice is a
 * number that will drift; one token read by both cannot.
 */
export function AdminTabBar() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Admin sections"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated)/0.94)] pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <ul className="mx-auto flex w-full max-w-lg">
        {adminItems.map((item) => {
          const current = isActiveRoute(pathname, item.href)
          const Icon = ICONS[item.icon]

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={current ? 'page' : undefined}
                className={classNames(
                  'relative flex min-h-[var(--admin-tabbar-h)] flex-col items-center justify-center gap-1 px-0.5 pt-1.5 text-center transition-colors',
                  current
                    ? 'text-[rgb(var(--accent))]'
                    : 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]'
                )}
              >
                {/*
                  The active rule is a pseudo-element rather than a border so it
                  can sit on the very top edge of the bar without nudging the
                  content down by 2px on every re-render.
                */}
                <span
                  aria-hidden="true"
                  className={classNames(
                    'absolute inset-x-2 top-0 h-0.5 rounded-full bg-[rgb(var(--accent))] transition-opacity',
                    current ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <Icon
                  className={classNames('h-5 w-5', current ? 'stroke-[2.25]' : 'stroke-[1.75]')}
                  aria-hidden="true"
                />
                <span className="text-[0.625rem] font-medium leading-none tracking-[-0.01em]">
                  {item.label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
