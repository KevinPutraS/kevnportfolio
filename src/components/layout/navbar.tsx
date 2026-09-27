'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { siteConfig } from '@/config/site'
import { classNames, isActiveRoute } from '@/lib/utils/helpers'
import { buttonStyles } from '@/components/ui/button-styles'
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
  const wordmark = `${siteConfig.name}.`

  /*
   * Scroll-aware chrome.
   *
   * The header was already `sticky top-0`, but at `bg/80` with a
   * `--border-subtle` hairline there was nothing to see: content slid behind a
   * 20%-transparent blur and the bar read as part of the page rather than a
   * surface floating above it. So the state is now explicit — a solid background
   * and a shadow once the page has scrolled, which is what a sticky bar is
   * supposed to look like when it engages.
   *
   * A `useState` boolean rather than the raw scroll position: the header only
   * needs to know *whether* it is detached, and a threshold boolean means the
   * class string does not change on every frame of a slow scroll.
   */
  const [lifted, setLifted] = useState(false)

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      data-lifted={lifted ? 'true' : undefined}
      className={classNames(
        'sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300',
        lifted
          ? 'border-[rgb(var(--border))] bg-[rgb(var(--background))]/95 shadow-[0_10px_30px_-18px_rgb(0_0_0/0.9)] backdrop-blur-xl'
          : 'border-[rgb(var(--border-subtle))] bg-[rgb(var(--background))]/70 backdrop-blur-md'
      )}
    >
      <div className="container-custom flex h-16 items-center justify-between gap-4">
        {/*
          The wordmark is the name and nothing else. It used to carry a small
          "portfolio" label beside it, which was both below the readable size
          floor and redundant — the hero already states what kind of site this
          is, and a visitor inside the site does not need to be told twice.
        */}
        <Link
          href="/"
          className="-ml-1 flex min-h-11 min-w-0 items-center px-1"
          aria-label={`${siteConfig.name} — home`}
        >
          <span className="font-display text-lg font-bold tracking-[-0.035em] text-[rgb(var(--text-primary))]">
            {wordmark}
          </span>
        </Link>

        {/*
          The desktop bar appears at `lg`, not `md`. Six items plus the wordmark
          and the contact button need roughly 1024px before labels start
          colliding, and a tablet-width bar squeezed to fit reads worse than the
          drawer, which has room for the same list at a comfortable touch size.
        */}
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-0.5">
            {siteConfig.navigation.map((item) => {
              const isActive = isActiveRoute(pathname, item.href)

              // The primary action is a filled button rather than a link, so
              // there is one obvious next step instead of six equal-looking
              // options. `aria-current` still marks it, so assistive tech
              // reports the active page the same way for every item.
              if (item.emphasis === 'primary') {
                return (
                  <li key={item.href} className="ml-1.5">
                    <Link
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      className={buttonStyles({ variant: 'primary', size: 'md' })}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              }

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={classNames('nav-link', isActive ? 'nav-link-active' : 'nav-link-idle')}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <MobileMenu />
      </div>

      <ScrollProgress />
    </header>
  )
}
