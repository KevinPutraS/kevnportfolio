import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { siteConfig } from '@/config/site'

export const adminNavigation = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Projects', href: '/admin/projects' },
  { label: 'New project', href: '/admin/projects/new' },
] as const

/**
 * Sidebar links. Rendered inside the admin shell on desktop and inside the
 * mobile drawer on small screens, so the list is defined once.
 */
export function AdminNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Admin">
      <ul className="space-y-1">
        {adminNavigation.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className="flex items-center gap-3 border-l-2 border-transparent px-4 py-2.5 text-sm text-[rgb(var(--text-secondary))] transition-colors hover:border-[rgb(var(--border))] hover:bg-[rgb(var(--surface))] hover:text-[rgb(var(--text-primary))]"
            >
              {item.label}
            </Link>
          </li>
        ))}
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
        className="flex w-full items-center gap-3 border-l-2 border-transparent px-4 py-2.5 text-left text-sm text-[rgb(var(--text-muted))] transition-colors hover:border-[rgb(var(--border))] hover:bg-[rgb(var(--surface))] hover:text-[rgb(var(--text-primary))]"
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
