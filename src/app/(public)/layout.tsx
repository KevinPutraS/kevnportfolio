import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'

/**
 * Public shell. The admin dashboard deliberately lives outside this group so
 * the marketing header, footer and skip link are never rendered behind it.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-[rgb(var(--accent))] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[rgb(var(--accent-contrast))]"
      >
        Skip to content
      </a>

      <Navbar />

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  )
}
