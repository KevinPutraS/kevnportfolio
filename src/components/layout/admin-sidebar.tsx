'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { classNames } from '@/lib/utils/helpers'
import { siteConfig } from '@/config/site'
import { LayoutDashboard, FolderKanban, PlusCircle, LogOut } from 'lucide-react'

export function AdminSidebar() {
  const pathname = usePathname()

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/projects', label: 'Projects', icon: FolderKanban },
    { href: '/admin/projects/new', label: 'New Project', icon: PlusCircle },
  ]

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-[rgb(var(--border-subtle))] bg-[rgb(var(--surface))] hidden lg:block" aria-label="Admin sidebar">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between border-b border-[rgb(var(--border-subtle))] px-6">
          <Link href="/admin" className="font-display text-xl font-bold text-[rgb(var(--text-primary))]">
            {siteConfig.name}
          </Link>
          <span className="rounded-full bg-[rgb(var(--accent))/0.15] px-3 py-1 text-xs font-medium text-[rgb(var(--accent-hover))] border border-[rgb(var(--accent))/0.3]">
            Admin
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1" aria-label="Admin navigation">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={classNames(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-200',
                  isActive
                    ? 'bg-[rgb(var(--accent))/0.1] text-[rgb(var(--accent))]'
                    : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--surface-elevated))]'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon className="h-5 w-5" aria-hidden="true" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-[rgb(var(--border-subtle))] p-4">
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--error))] hover:bg-[rgb(var(--surface-elevated))] transition-colors"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}