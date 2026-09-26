import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { siteConfig, socialLinks } from '@/config/site'

/**
 * Colophon-style footer.
 *
 * Two deliberate choices make this read as the end of a printed piece rather
 * than the bottom of a web page: the wordmark is set at display scale as the
 * last thing on the page, and everything below it collapses to a single hairline
 * metadata row. Navigation is laid out horizontally as running text instead of
 * a link column, which removes the SaaS-footer silhouette.
 */
export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative border-t border-[rgb(var(--border-subtle))]">
      <div className="container-custom">
        <div className="rhythm-md flex flex-col gap-10">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <p className="body-lg max-w-md text-pretty text-[rgb(var(--text-secondary))] lg:col-span-5">
              {siteConfig.description}
            </p>

            <nav aria-label="Footer" className="lg:col-span-7 lg:justify-self-end">
              <p className="meta-label">Index</p>
              <ul className="mt-5 flex flex-wrap items-baseline gap-x-7 gap-y-3">
                {siteConfig.navigation.map((item, index) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group inline-flex items-baseline gap-2 font-display text-lg font-medium tracking-[-0.02em] text-[rgb(var(--text-secondary))] transition-colors duration-150 hover:text-[rgb(var(--text-primary))]"
                    >
                      <span className="index-marker transition-colors group-hover:text-[rgb(var(--accent))]">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      {item.label}
                    </Link>
                  </li>
                ))}

                {socialLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-baseline gap-1 font-display text-lg font-medium tracking-[-0.02em] text-[rgb(var(--text-secondary))] transition-colors duration-150 hover:text-[rgb(var(--text-primary))]"
                    >
                      {link.label}
                      <ArrowUpRight
                        className="h-3.5 w-3.5 text-[rgb(var(--text-muted))] transition-colors duration-150 group-hover:text-[rgb(var(--accent))]"
                        aria-hidden="true"
                      />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/*
            * The wordmark at display scale. It is decorative repetition of the
            * header logo, so it is hidden from assistive tech to avoid reading
            * the name twice in a row.
            */}
          <p
            aria-hidden="true"
            className="display-1 select-none leading-[0.8] text-[rgb(var(--border))]"
          >
            {siteConfig.shortName}
            <span className="text-[rgb(var(--accent))]">.</span>
          </p>
        </div>

        <div className="flex flex-col gap-2 border-t border-[rgb(var(--border-subtle))] py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="caption text-[rgb(var(--text-muted))]">
            © {year} {siteConfig.shortName}
          </p>
          <p className="caption text-[rgb(var(--text-muted))]">
            Built with Next.js &amp; Supabase
          </p>
        </div>
      </div>
    </footer>
  )
}
