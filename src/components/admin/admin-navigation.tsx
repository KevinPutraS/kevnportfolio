'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ExternalLink,
  LogOut,
  LayoutDashboard,
  FolderKanban,
  Briefcase,
  Award,
  Settings2,
  type LucideIcon,
} from 'lucide-react'
import { siteConfig } from '@/config/site'
import { classNames, isActiveRoute } from '@/lib/utils/helpers'

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
export const adminItems = siteConfig.adminNavigation.filter((item) => !item.href.endsWith('/new'))

/**
 * Section icon, keyed by the `icon` name in `siteConfig.adminNavigation`.
 *
 * Exported because the mobile tab bar maps the same five sections. Desktop gets
 * a sidebar list, mobile gets a bottom bar, and neither is allowed to invent its
 * own items or its own glyphs.
 *
 * A map with a `Record` type rather than a bare object so that adding a section
 * to the config without adding its glyph here is a type error instead of a
 * section that renders with no icon.
 */
export const ICONS: Record<(typeof adminItems)[number]['icon'], LucideIcon> = {
  dashboard: LayoutDashboard,
  projects: FolderKanban,
  experience: Briefcase,
  certificates: Award,
  settings: Settings2,
}

/**
 * Sidebar links, for the desktop shell only.
 *
 * Below `md` the same five sections are rendered by `AdminTabBar` as a bottom
 * bar, so this list no longer needs an `onNavigate` callback to close a drawer
 * behind it.
 *
 * The active section is marked with `aria-current`, an accent rule and a filled
 * tile behind the icon — three signals, so it does not depend on colour alone.
 * The admin is a working surface, not a showcase: a hairline that turns accent
 * plus one tinted tile is enough orientation and does not compete with the
 * primary action on the page.
 *
 * The `01`–`05` markers that used to lead each row are gone. On a desktop
 * sidebar they looked like an index, but the same list also had to serve a
 * phone, where they were a two-character ornament in front of a five-word
 * label. An icon is recognisable at both sizes.
 */
export function AdminNavLinks() {
  const pathname = usePathname()

  return (
    <nav aria-label="Admin">
      <ul>
        {adminItems.map((item) => {
          const current = isActiveRoute(pathname, item.href)
          const Icon = ICONS[item.icon]

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={current ? 'page' : undefined}
                className={classNames(
                  'group relative flex min-h-11 items-center gap-3 border-l-2 py-2.5 pl-3 pr-4 text-[length:var(--text-sm)] transition-colors',
                  current
                    ? 'border-[rgb(var(--accent))] bg-[rgb(var(--bg-elevated))] font-medium text-[rgb(var(--text))]'
                    : 'border-transparent text-[rgb(var(--text-dim))] hover:bg-[rgb(var(--bg-elevated))] hover:text-[rgb(var(--text))]'
                )}
              >
                <span
                  aria-hidden="true"
                  className={classNames(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] border transition-colors',
                    current
                      ? 'border-transparent bg-[rgb(var(--accent))] text-[rgb(var(--accent-contrast))]'
                      : 'border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-muted))] group-hover:border-[rgb(var(--border-strong))] group-hover:text-[rgb(var(--text-dim))]'
                  )}
                >
                  <Icon className="h-4 w-4" />
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
 * The section currently being viewed, for the mobile header.
 *
 * The longest-prefix match is what makes this correct: on
 * `/admin/projects/abc/edit` the section is "Projects", not "Dashboard". Walking
 * the list in order and keeping the last item whose href prefixes the pathname
 * does that without a special case for the index route — the naive
 * "first match wins" version would return Dashboard for every sub-page, because
 * `isActiveRoute('/admin', '/admin/projects/abc')` is true.
 */
export function useAdminSection(): string {
  const pathname = usePathname()

  let label = adminItems[0]?.label ?? 'Admin'
  for (const item of adminItems) {
    if (isActiveRoute(pathname, item.href)) label = item.label
  }
  return label
}

/**
 * Sign-out is a POST form, not a link, so the session cannot be cleared by a
 * prefetch or a cross-site request.
 *
 * `compact` is the header variant for small screens: a labelled row is the
 * right affordance in the sidebar, where it is one of three stacked actions, but
 * in a 64px bar the label is the first thing to be sacrificed so the current
 * section and the two icons fit on a 360px line. The `aria-label` keeps the
 * button's name for assistive tech after the text is gone.
 */
export function SignOutForm({ compact = false }: { compact?: boolean }) {
  return (
    <form action="/api/auth/signout" method="POST" className={compact ? 'shrink-0' : 'w-full'}>
      <button
        type="submit"
        aria-label={compact ? 'Sign out' : undefined}
        className={classNames(
          'flex w-full items-center rounded-[var(--radius-md)] text-left text-[length:var(--text-sm)] transition-colors',
          compact
            ? 'h-11 w-11 justify-center text-[rgb(var(--text-dim))] hover:bg-[rgb(var(--error)/0.12)] hover:text-[rgb(var(--error))]'
            : 'min-h-11 gap-3 px-3 py-2.5 text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--error)/0.12)] hover:text-[rgb(var(--error))]'
        )}
      >
        <LogOut className={compact ? 'h-5 w-5' : 'h-4 w-4'} aria-hidden="true" />
        {compact ? null : 'Sign out'}
      </button>
    </form>
  )
}

export function AdminBrand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/admin" className="flex min-h-11 items-center px-4">
      <p className="font-display text-base font-bold tracking-[-0.03em] text-[rgb(var(--text))]">
        {siteConfig.name}
        <span className="text-[rgb(var(--accent))]">.</span>
      </p>
      {!compact && (
        <p className="ml-2 text-[length:var(--text-xs)] uppercase tracking-[0.14em] text-[rgb(var(--accent))]">
          Admin
        </p>
      )}
    </Link>
  )
}

/** Escape hatch back to the public site, which the sidebar otherwise blocks. */
export function ViewSiteLink({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      aria-label={compact ? 'View public site' : undefined}
      className={classNames(
        'flex items-center rounded-[var(--radius-md)] text-[length:var(--text-sm)] transition-colors',
        compact
          ? 'h-11 w-11 justify-center text-[rgb(var(--text-dim))] hover:bg-[rgb(var(--bg-highlight))] hover:text-[rgb(var(--accent))]'
          : 'min-h-11 gap-2.5 px-3 py-2.5 text-[rgb(var(--text-dim))] hover:bg-[rgb(var(--bg-elevated))] hover:text-[rgb(var(--accent))]'
      )}
    >
      <ExternalLink className={compact ? 'h-5 w-5' : 'h-4 w-4'} aria-hidden="true" />
      {compact ? null : 'View site'}
      {compact ? null : (
        <span className="sr-only">(opens the public site in this tab)</span>
      )}
    </Link>
  )
}
