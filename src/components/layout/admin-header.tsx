'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { classNames } from '@/lib/utils/helpers'
import { Menu, ChevronLeft } from 'lucide-react'

interface AdminHeaderProps {
  onMenuClick: () => void
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname()

  const getPageTitle = () => {
    if (pathname === '/admin') return 'Dashboard'
    if (pathname === '/admin/projects') return 'Projects'
    if (pathname === '/admin/projects/new') return 'New Project'
    if (pathname.startsWith('/admin/projects/') && pathname.endsWith('/edit')) return 'Edit Project'
    return 'Admin'
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-[rgb(var(--border-subtle))] bg-[rgb(var(--surface))] px-6 lg:ml-64" role="banner">
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--surface-elevated))] transition-colors"
          onClick={onMenuClick}
          aria-label="Toggle menu"
          aria-expanded="false"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <Link href="/" className="font-display text-xl font-bold text-[rgb(var(--text-primary))]">
          Portfolio
        </Link>
        <span className="hidden lg:inline-flex h-6 w-px bg-[rgb(var(--border-subtle))]" aria-hidden="true" />
        <h1 className="text-lg font-semibold text-[rgb(var(--text-primary))]">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="hidden sm:inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--surface-elevated))] transition-colors"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          View Site
        </Link>
      </div>
    </header>
  )
}