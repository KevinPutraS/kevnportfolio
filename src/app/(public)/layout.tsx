import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'

/**
 * Public shell. The admin dashboard deliberately lives outside this group so
 * the marketing header, footer and skip link are never rendered behind it.
 *
 * `page-depth` is a fixed, pointer-events-none overlay holding the grain and a
 * single pool of light. It lives in the layout rather than per page so the
 * treatment is identical everywhere and is painted once.
 *
 * The overlay is `position: fixed` with `z-index: 0`, and positioned elements
 * paint above non-positioned ones — so every content wrapper is explicitly
 * `relative z-10`. Without that the wash would cover the text.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="page-depth" aria-hidden="true" />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-[rgb(var(--accent))] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[rgb(var(--accent-contrast))]"
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
    </div>
  )
}
