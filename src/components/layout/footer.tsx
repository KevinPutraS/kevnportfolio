import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { siteConfig, socialLinks } from '@/config/site'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-[rgb(var(--border-subtle))]">
      <div className="container-custom py-12 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="font-display text-lg font-bold tracking-tight">{siteConfig.name}</p>
            <p className="mt-2 max-w-sm text-sm text-[rgb(var(--text-secondary))]">
              {siteConfig.description}
            </p>
          </div>

          <nav aria-label="Footer">
            <p className="eyebrow">Navigate</p>
            <ul className="mt-4 space-y-2.5">
              {siteConfig.navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-[rgb(var(--text-secondary))] transition-colors hover:text-[rgb(var(--text-primary))]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="eyebrow">Elsewhere</p>
            <ul className="mt-4 space-y-2.5">
              {socialLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1 text-sm text-[rgb(var(--text-secondary))] transition-colors hover:text-[rgb(var(--text-primary))]"
                  >
                    {link.label}
                    <ArrowUpRight
                      className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[rgb(var(--border-subtle))] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="caption text-[rgb(var(--text-muted))]">
            © {year} {siteConfig.shortName}. All rights reserved.
          </p>
          <p className="caption text-[rgb(var(--text-muted))]">Built with Next.js &amp; Supabase</p>
        </div>
      </div>
    </footer>
  )
}
