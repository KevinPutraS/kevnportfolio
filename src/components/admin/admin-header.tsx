'use client'

import { siteConfig } from '@/config/site'
import { SignOutForm, ViewSiteLink, useAdminSection } from './admin-navigation'

/**
 * The mobile admin header, below `md`. On desktop the sidebar carries the
 * navigation and this component is not rendered at all.
 *
 * It used to be the entire mobile navigation: a hamburger opened a portalled
 * sheet at `z-[70]`, holding the brand, the five sections, the account email,
 * "View site" and "Sign out". With a bottom tab bar doing the navigation, that
 * sheet had nothing left to justify it — it was a second route to the same five
 * links, reachable only by opening something first. It is gone, along with its
 * overlay, focus trap and portal, and the two actions it was hiding moved up
 * here into the bar.
 *
 * The header still answers "where am I", which is the part a tab bar alone does
 * not: the name of the current section sits in the sticky bar, so it stays
 * visible when a long form scrolls its own title away.
 */
export function AdminHeader() {
  const section = useAdminSection()

  return (
    <header className="sticky top-0 z-40 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg)/0.9)] backdrop-blur-xl md:hidden">
      <div className="flex h-16 items-center justify-between gap-2 px-3">
        <div className="min-w-0">
          <p className="truncate font-mono text-[0.625rem] uppercase tracking-[0.14em] text-[rgb(var(--text-muted))]">
            {siteConfig.name} · Admin
          </p>
          <p className="mt-0.5 truncate font-display text-[length:var(--text-base)] font-bold tracking-[-0.02em] text-[rgb(var(--text))]">
            {section}
          </p>
        </div>

        {/*
          Both actions are icon-only at this width, and both are labelled by
          `aria-label` rather than by text. They are 44px square so they clear
          the 44px touch target minimum, which is the whole reason they are
          buttons of this size and not of the 16px glyph's size.
        */}
        <div className="flex shrink-0 items-center">
          <ViewSiteLink compact />
          <SignOutForm compact />
        </div>
      </div>
    </header>
  )
}
