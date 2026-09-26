'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { siteConfig } from '@/config/site'
import { classNames } from '@/lib/utils/helpers'
import { MobileMenu } from './mobile-menu'

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-[rgb(var(--border-subtle))] bg-[rgb(var(--background))]/85 backdrop-blur-md">
      <div className="container-custom flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-2.5 font-display text-sm font-bold tracking-tight"
        >
          <span
            aria-hidden="true"
            className="flex h-7 w-7 shrink-0 items-center justify-center border border-[rgb(var(--border))] font-mono text-[0.625rem] font-semibold text-[rgb(var(--accent))] transition-colors group-hover:border-[rgb(var(--accent))]"
          >
            KV
          </span>
          <span className="truncate text-[rgb(var(--text-primary))]">
            {siteConfig.shortName}
            <span className="hidden text-[rgb(var(--text-muted))] sm:inline"> / portfolio</span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {siteConfig.navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={classNames(
                      'relative inline-flex h-9 items-center px-3 text-sm transition-colors',
                      isActive
                        ? 'text-[rgb(var(--text-primary))]'
                        : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
                    )}
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className={classNames(
                        'absolute inset-x-3 -bottom-px h-px transition-colors',
                        isActive ? 'bg-[rgb(var(--accent))]' : 'bg-transparent'
                      )}
                    />
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <MobileMenu />
      </div>
    </header>
  )
}
