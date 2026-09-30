import { Analytics } from '@vercel/analytics/next'
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
      <div className="page-depth" data-print="hide" aria-hidden="true" />

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

      {/*
        The sticky chrome lives on this wrapper, not on the `<header>` inside
        it, and the reason is a trap worth writing down.

        `position: sticky` is resolved against an element's *containing block*,
        and the header's containing block used to be this div — which is exactly
        as tall as the header, because the header is all it contains. A sticky
        box can only travel inside its containing block, so the travel was 0px:
        the moment the page moved one pixel the navbar left with it, exactly as
        if it had been `static`. Nothing looked broken, which is what made it
        survive. Three things that were written to depend on a sticky header
        had never once run: the `lifted` state that swaps the bar's translucent
        background for a near-opaque one and adds a shadow, the `ScrollProgress`
        hairline, and the `--nav-h` / `scroll-padding-top` pair in
        `globals.css` that keeps an anchor target from landing under the bar.
        The last one was the tell: the token existed and was correct, describing
        a sticky bar that was not sticky.

        The parent is a full-height `flex-col`, so moving `sticky top-0` up one
        level gives the containing block the whole page to travel through.

        `z-50` rather than the `z-10` every other content wrapper here carries.
        `main` and the footer are also `z-10`, and equal z-indexes are resolved
        by DOM order, so with this wrapper at `z-10` the later `main` painted
        *over* the navbar's stacking context. It was invisible only because
        nothing overlapped; the moment the bar became genuinely sticky and
        started overlapping the page, `main` would have drawn over it. `z-50` is
        the header's own index, so the wrapper now claims that same value.
      */}
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>

      <main id="main-content" className="relative z-10 flex-1">
        {children}
      </main>

      <div className="relative z-10">
        <Footer />
      </div>

      {/*
        No bottom tab bar, and the 4rem spacer that paid for it goes with it.

        The bar existed because the top bar was unusable on a phone: five
        destinations sat behind the hamburger, and the top bar itself never
        stayed on screen. It was declared `sticky top-0` for as long as it was
        here, but its containing block was this shell's own wrapper, sized to
        the header's content, so the travel was 0px and the bar scrolled away
        the moment the page moved. The header is genuinely sticky now, so the
        reason the bar was built no longer exists.

        What it cost, measured on a 780px phone: 65px of top bar plus 64px of
        tab bar plus the safe-area inset is about 16.5% of the viewport
        permanently occupied by navigation, most of it duplicating the drawer
        that is already one tap away. The top bar is also nearly empty on mobile
        by design — a wordmark and one button.

        It is the wrong register for this site as well. The hero calls the whole
        idea restraint and treats printing the same four titles twice in one
        screen as filler; a fixed app-shell bar is the opposite of that. The
        component survives as `admin-tab-bar.tsx` in the dashboard, which is an
        app and wants one.

        The footer's own `env(safe-area-inset-bottom)` padding is unrelated and
        stays: that is the iOS home indicator, not the bar.
      */}

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
