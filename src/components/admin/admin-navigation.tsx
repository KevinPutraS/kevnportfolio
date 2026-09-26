'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ExternalLink, LogOut } from 'lucide-react'
import { siteConfig } from '@/config/site'

export const adminNavigation = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Projects', href: '/admin/projects' },
  { label: 'New project', href: '/admin/projects/new' },
] as const

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
        {adminNavigation.map((item, index) => {
          const current = isCurrent(item.href)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={current ? 'page' : undefined}
                className={`flex items-baseline gap-3 border-l-2 py-3 pl-4 pr-4 text-sm transition-colors ${
                  current
                    ? 'border-[rgb(var(--accent))] bg-[rgb(var(--surface))] text-[rgb(var(--text-primary))]'
                    : 'border-transparent text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--surface))] hover:text-[rgb(var(--text-primary))]'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`font-mono text-[0.625rem] tabular-nums ${
                    current
                      ? 'text-[rgb(var(--accent))]'
                      : 'text-[rgb(var(--text-muted))]'
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
        className="flex w-full items-center gap-3 border-l-2 border-transparent py-3 pl-4 pr-4 text-left text-sm text-[rgb(var(--text-muted))] transition-colors hover:bg-[rgb(var(--surface))] hover:text-[rgb(var(--text-primary))] focus-visible:border-[rgb(var(--accent))]"
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
      <p className="font-display text-sm font-bold tracking-tight">{siteConfig.name}</p>
      <p className="caption mt-0.5 text-[rgb(var(--accent))]">Content manager</p>
    </Link>
  )
}

/** Escape hatch back to the public site, which the sidebar otherwise blocks. */
export function ViewSiteLink({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onNavigate}
      className="flex items-center gap-3 px-4 py-3 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[rgb(var(--text-muted))] transition-colors hover:text-[rgb(var(--accent))]"
    >
      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      View site
    </Link>
  )
}
