'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { classNames } from '@/lib/utils/helpers'
import { siteConfig } from '@/config/site'
import { Menu, X } from 'lucide-react'

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  return (
    <header
      className={classNames(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        isScrolled
          ? 'bg-[rgb(var(--background))/0.9] backdrop-blur-md border-b border-[rgb(var(--border-subtle))]'
          : 'bg-transparent'
      )}
      role="banner"
    >
      <nav className="container-custom" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="font-display text-xl font-bold text-[rgb(var(--text-primary))] hover:opacity-80 transition-opacity"
            aria-label={siteConfig.name}
          >
            {siteConfig.name}
          </Link>

          <div className="hidden md:flex md:items-center md:gap-8">
            {siteConfig.navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={classNames(
                  'text-sm font-medium transition-colors duration-200',
                  pathname === item.href
                    ? 'text-[rgb(var(--accent))]'
                    : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
                )}
                aria-current={pathname === item.href ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <button
            type="button"
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--surface-elevated))] transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </nav>

      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </header>
  )
}

function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname()

  if (!isOpen) return null

  return (
    <div
      id="mobile-menu"
      className="fixed inset-0 z-50 md:hidden animate-slide-down"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile menu"
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-[rgb(var(--surface))] border-l border-[rgb(var(--border-subtle))] p-6">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="font-display text-xl font-bold text-[rgb(var(--text-primary))]"
            onClick={onClose}
          >
            {siteConfig.name}
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--surface-elevated))] transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="Mobile navigation">
          <ul className="space-y-1" role="list">
            {siteConfig.navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={classNames(
                    'block px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200',
                    pathname === item.href
                      ? 'bg-[rgb(var(--accent))/0.1] text-[rgb(var(--accent))]'
                      : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--surface-elevated))]'
                  )}
                  aria-current={pathname === item.href ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}