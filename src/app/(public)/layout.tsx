import { Analytics } from '@vercel/analytics/next'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'

/**
 * Public shell. The admin dashboard deliberately lives outside this group so
 * the marketing header, footer and skip link are never rendered behind it.
 *
 * `page-depth` is a fixed, pointer-events-none overlay holding the grain and
 * the pools of light. It lives in the layout rather than per page so the
 * treatment is identical everywhere and is composited once.
 *
 * The overlay is `position: fixed` with `z-index: 0`, and positioned elements
 * paint above non-positioned ones — so every content wrapper is explicitly
 * `relative z-10`. Without that the wash would cover the text.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="page-depth" aria-hidden="true" />

      {/*
        Skip link. Off-screen until focused, then pinned to the top-left above
        every layer. The `focus:` variants rather than `focus-visible:` on
        purpose: it is reachable by keyboard only, and `:focus-visible` on a
        link activated by a keyboard does match, but pinning the rule to plain
        `:focus` is the safer default for a control whose entire purpose is to
        be focused.
      */}
      <a
        href="#main-content"
        className="sr-only rounded-[var(--radius-md)] focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:bg-[rgb(var(--accent))] focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-[rgb(var(--accent-contrast))] focus:shadow-lg"
      >
        Skip to content
      </a>

      <div className="relative z-10">
        <Navbar />
      </div>

      <main id="main-content" className="relative z-10 flex-1">
        {children}
      </main>

      <div className="relative z-10">
        <Footer />
      </div>

      {/*
        The mobile tab bar (`BottomNav`) is fixed to the bottom of the viewport,
        so the footer's last row would otherwise sit underneath it. The spacer
        pays that height back on the same breakpoints the bar lives on: 4rem of
        row plus the notch inset, `lg` and up get zero.
      */}
      <div
        aria-hidden="true"
        className="lg:hidden"
        style={{ height: 'calc(env(safe-area-inset-bottom, 0px) + 4rem)' }}
      />
      <BottomNav />

      {/*
        Page views, and the reason this lives here rather than in the root
        layout.

        The only question worth answering is "which project gets opened", and
        that is only answerable from the public half of the site. Mounted in the
        root layout it would also count every page view inside /admin —
        signed-in browsing, which is by definition not a visitor, and the owner
        would out-visit every real reader and make the numbers worthless.
        Scoping it to this group drops the CMS out of the data rather than
        filtering it out afterwards.

        Vercel Analytics sets no cookies and collects no identifying data, so
        there is nothing to gate behind a consent banner. If one is ever added
        for another reason, this has to move inside the same condition.
      */}
      <Analytics />
    </div>
  )
}
