'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ExternalLink, LogOut } from 'lucide-react'
import { siteConfig } from '@/config/site'

/**
 * Built from `siteConfig.adminNavigation`, which is the same list the CMS uses
 * everywhere else. This used to be a second, hand-written array of three items
 * — Dashboard, Projects, New project — so Experience and Certificates were
 * unreachable from the sidebar and had to be typed as a URL. Two lists, and the
 * stale one is always the one a visitor sees.
 *
 * "New project" is dropped deliberately: it is a duplicate of the button that
 * already sits at the top of the projects page, and a nav entry that is only
 * sometimes relevant is noise.
 */
const adminItems = siteConfig.adminNavigation.filter(
  (item) => !item.href.endsWith('/new')
)

/**
 * Sidebar links. Rendered inside the admin shell on desktop and inside the
 * mobile drawer on small screens, so the list is defined once.
 *
 * Current section is marked with `aria-current` and a filled accent rule rather
 * than a filled pill. The admin is a working surface, not a showcase: a hairline
 * that turns accent is enough orientation and does not compete with the primary
 * action on the page.
 */
export function AdminNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  /**
   * Exact match for the dashboard, prefix match for the rest, so `/admin`
   * does not stay highlighted while browsing `/admin/projects`. `/admin/projects/new`
   * would otherwise light up "Projects" too, hence the longest-prefix check.
   */
  const isCurrent = (href: string) =>
    href === '/admin' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <nav aria-label="Admin">
      <ul>
        {adminItems.map((item, index) => {
          const current = isCurrent(item.href)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={current ? 'page' : undefined}
                className={`flex min-h-11 items-baseline gap-3 border-l-2 py-3 pl-4 pr-4 text-[length:var(--text-sm)] transition-colors ${
                  current
                    ? 'border-[rgb(var(--accent))] bg-[rgb(var(--bg-elevated))] font-medium text-[rgb(var(--text))]'
                    : 'border-transparent text-[rgb(var(--text-dim))] hover:bg-[rgb(var(--bg-elevated))] hover:text-[rgb(var(--text))]'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`font-mono text-[length:var(--text-xs)] tabular-nums ${
                    current ? 'text-[rgb(var(--accent))]' : 'text-[rgb(var(--text-muted))]'
                  }`}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/**
 * Sign-out is a POST form, not a link, so the session cannot be cleared by a
 * prefetch or a cross-site request.
 */
export function SignOutForm() {
  return (
    <form action="/api/auth/signout" method="POST" className="w-full">
      <button
        type="submit"
        className="flex min-h-11 w-full items-center gap-3 border-l-2 border-transparent py-3 pl-4 pr-4 text-left text-[length:var(--text-sm)] text-[rgb(var(--text-muted))] transition-colors hover:bg-[rgb(var(--bg-elevated))] hover:text-[rgb(var(--text))] focus-visible:border-[rgb(var(--accent))]"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Sign out
      </button>
    </form>
  )
}

export function AdminBrand() {
  return (
    <Link href="/admin" className="block px-4">
      <p className="font-display text-base font-bold tracking-[-0.03em] text-[rgb(var(--text))]">
        {siteConfig.name}
        <span className="text-[rgb(var(--accent))]">.</span>
      </p>
      <p className="mt-0.5 text-[length:var(--text-xs)] uppercase tracking-[0.14em] text-[rgb(var(--accent))]">
        Content manager
      </p>
    </Link>
  )
}

/** Escape hatch back to the public site, which the sidebar otherwise blocks. */
export function ViewSiteLink({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onNavigate}
      className="flex min-h-11 items-center gap-2.5 px-4 font-mono text-[length:var(--text-xs)] uppercase tracking-[0.14em] text-[rgb(var(--text-muted))] transition-colors hover:text-[rgb(var(--accent))]"
    >
      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      View site
    </Link>
  )
}
