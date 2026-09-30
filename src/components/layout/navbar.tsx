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
 * layout or paint work per frame. The listener is passive and the value is
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
      className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left bg-[rgb(var(--accent))]"
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
   * `lifted` becomes true once the page has moved, at which point the bar
   * gains a near-opaque background and a shadow. A `useState` boolean rather
   * than the raw scroll offset: the header only needs to know *whether* it is
   * detached, and a threshold means the class string does not change on every
   * frame of a slow scroll.
   *
   * The translucent states are written as `rgb(var(--bg) / 0.7)` — the slash
   * inside the brackets. The `bg-[rgb(var(--bg))]/70` spelling looks equivalent
   * and compiles to *nothing at all*, which is why this bar used to be fully
   * transparent: content slid visibly behind it and the header read as part of
   * the page rather than a surface floating above it.
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
      /*
        `data-print="hide"` rather than a `header { display: none }` rule in the
        print block. Element selectors in a print stylesheet are a trap on a site
        this shape: the public shell's nav is a `<header>`, and so is the resume's
        own document header, and so is the page header on every route. A blanket
        rule deleted the resume's name and summary along with the navbar, and it
        did so silently. An explicit opt-in cannot match a document.
      */
      data-print="hide"
      className={classNames(
        /*
         * No `sticky top-0` here. It used to be on this element, where it could
         * never do anything: the sticky was resolved against this header's
         * containing block, which is the shell's wrapper div sized to its own
         * content, so the travel was 0px and the bar scrolled away like a
         * static one. The `sticky top-0` now lives on that wrapper, whose
         * containing block is the full-height page column. See the comment in
         * `(public)/layout.tsx`.
         *
         * `z-50` stays because the wrapper claims the same value, and the header
         * is positioned within it.
         */
        'z-50 h-[var(--nav-h)] border-b transition-[background-color,border-color,box-shadow] duration-300',
        lifted
          ? 'border-[rgb(var(--border))] bg-[rgb(var(--bg)/0.85)] shadow-[0_10px_30px_-18px_rgb(0_0_0/0.9)] backdrop-blur-xl'
          : 'border-transparent bg-[rgb(var(--bg)/0.6)] backdrop-blur-md'
      )}
    >
      {/*
        `h-full`, not `h-16`. The height lives on the <header> so that `--nav-h`
        and the bar's real height cannot drift apart: the token is what sets it,
        so the two are the same number by construction. The `border-b` below
        sits on the header too, and Tailwind's border-box sizing keeps that 1px
        *inside* `--nav-h` rather than adding to it — which is the entire reason
        this element owns the height. When the height was on this div instead,
        the bar measured 65px against a 64px token and `scroll-padding-top` was
        a pixel short with it, permanently, because nothing failed.
      */}
      <div className="container-custom flex h-full items-center justify-between gap-3">
        {/*
          The wordmark is the name and nothing else. It used to carry a small
          "portfolio" label beside it, which was both below the readable size
          floor and redundant — the hero already states what kind of site this
          is, and a visitor inside the site does not need to be told twice.
        */}
        <Link
          href="/"
          className="-ml-1 flex min-h-11 min-w-0 items-center gap-1.5 px-1"
          aria-label={`${siteConfig.name} — home`}
        >
          <span className="font-display text-lg font-bold tracking-[-0.04em] text-[rgb(var(--text))]">
            {wordmark.slice(0, -1)}
          </span>
          <span aria-hidden="true" className="text-[rgb(var(--accent))]">
            .
          </span>
        </Link>

        {/*
          The desktop bar appears at `lg`, not `md`. Seven items plus the
          wordmark and the contact button need roughly 1024px before labels
          start colliding, and a tablet-width bar squeezed to fit reads worse
          than the drawer, which has room for the same list at a comfortable
          touch size.
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
                      className={buttonStyles({ variant: 'primary', size: 'sm', className: 'h-10 px-4' })}
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
