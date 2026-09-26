'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { siteConfig, currentlyExploring } from '@/config/site'
import { classNames } from '@/lib/utils/helpers'
import { MobileMenu } from './mobile-menu'

/**
 * Scroll progress hairline.
 *
 * Rendered as a 1px rule pinned to the bottom edge of the header and scaled
 * horizontally, so the whole thing is a single compositor transform with no
 * layout or paint work per frame. The listener is passive and the state is
 * written straight to the element through a ref, so scrolling never triggers a
 * React render.
 */
function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    let frame = 0

    const update = () => {
      frame = 0
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 0
      bar.style.transform = `scaleX(${Math.min(Math.max(ratio, 0), 1)})`
    }

    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left bg-[rgb(var(--accent))] opacity-70"
      style={{ transform: 'scaleX(0)' }}
      ref={barRef}
    />
  )
}

export function Navbar() {
  const pathname = usePathname()
  const wordmark = `${siteConfig.shortName}.`

  return (
    <header className="sticky top-0 z-50 border-b border-[rgb(var(--border-subtle))] bg-[rgb(var(--background))]/80 backdrop-blur-md">
      <div className="container-custom flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="group flex min-w-0 items-baseline gap-2.5"
          aria-label={`${siteConfig.name} — home`}
        >
          <span className="font-display text-base font-bold tracking-[-0.03em] text-[rgb(var(--text-primary))]">
            {wordmark}
          </span>
          <span className="hidden font-mono text-[0.625rem] uppercase tracking-[0.18em] text-[rgb(var(--text-muted))] sm:inline">
            portfolio
          </span>
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {siteConfig.navigation.map((item, index) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={classNames(
                      'group relative inline-flex h-9 items-center gap-2 px-2.5 font-mono text-[0.6875rem] uppercase tracking-[0.14em] transition-colors duration-150 sm:px-3',
                      isActive
                        ? 'text-[rgb(var(--text-primary))]'
                        : 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-secondary))]'
                    )}
                  >
                    <span className="text-[0.5625rem] tabular-nums opacity-60">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {item.label}
                    <span
                      aria-hidden="true"
                      className={classNames(
                        'absolute inset-x-2.5 bottom-0 h-px transition-colors duration-150 sm:inset-x-3',
                        isActive
                          ? 'bg-[rgb(var(--accent))]'
                          : 'bg-transparent group-hover:bg-[rgb(var(--border))]'
                      )}
                    />
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/*
         * Live context line. Sourced from config rather than hard-coded, so it
         * always describes something real, and hidden below 2xl where there is
         * not enough room to add information without crowding the bar.
         */}
        <p className="hidden min-w-0 items-center gap-2.5 2xl:flex">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-[rgb(var(--accent))]"
          />
          <span className="truncate font-mono text-[0.625rem] uppercase tracking-[0.16em] text-[rgb(var(--text-muted))]">
            <span className="sr-only">Currently exploring: </span>
            {currentlyExploring[0]}
          </span>
        </p>

        <MobileMenu />
      </div>

      <ScrollProgress />
    </header>
  )
}
