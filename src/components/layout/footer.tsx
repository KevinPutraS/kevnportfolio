import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { siteConfig, socialLinks } from '@/config/site'

/**
 * Footer.
 *
 * Went through three versions. The first was three columns of vertical links; the
 * second replaced those with a display-scale gradient wordmark, which was worse —
 * a name blown up to 6rem is just a name, and it pushed the actual links below
 * the fold on a laptop. Both were treating the footer as a place for content.
 *
 * It is a place to stop. So it is now one band: a coloured rule that matches the
 * closing call to action so the page ends inside the section system rather than
 * dropping out of it, a name at a size that is a footer rather than a headline,
 * the links as a single running line, and the copyright. No CTA — `ContactCta`
 * is directly above this, and repeating the button and email a few hundred pixels
 * apart was the earlier duplication.
 */
export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      data-print="hide"
      className="relative isolate overflow-hidden border-t border-[rgb(var(--border))]"
    >
      {/* Final rule, same treatment as the sections above, but one accent
          colour — the three-colour gradient this replaced stopped making sense
          when the palette collapsed to a single accent. */}
      <div
        aria-hidden="true"
        className="h-[2px] w-full opacity-70"
        style={{ background: 'linear-gradient(to right, rgb(var(--accent)) 0%, rgb(var(--accent) / 0.25) 55%, transparent 100%)' }}
      />
      <div
        aria-hidden="true"
        className="section-wash pointer-events-none absolute inset-0 -z-10"
        style={{ ['--tone' as string]: 'var(--accent)' }}
      />

      {/*
        `env(safe-area-inset-bottom)` on the last thing on the page. The mobile
        drawer, the modal and the admin tab bar all cleared it already; the
        footer did not, and its copyright line is the one row a phone user can
        still be looking at when the home indicator is drawn. Padded on the inner
        container rather than the `<footer>` so the border and the coloured rule
        above still span the full width.
      */}
      <div className="container-custom pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="py-10 sm:py-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            {/* Name, plus one line. At a footer scale, not a headline scale. */}
            <div className="min-w-0">
              <Link
                href="/"
                className="-ml-1 inline-flex min-h-11 items-center font-display text-xl font-bold tracking-[-0.035em] text-[rgb(var(--text))] transition-colors duration-200 hover:text-[rgb(var(--accent))] sm:text-2xl"
              >
                {siteConfig.name}
                <span className="text-[rgb(var(--accent))]">.</span>
              </Link>
              <p className="mt-1 text-[length:var(--text-sm)] text-[rgb(var(--text-muted))]">
                {siteConfig.description}
              </p>
            </div>

            {/* Links. One running line, never a column. */}
            <nav aria-label="Footer" className="lg:shrink-0">
              <ul className="-mx-2 flex flex-wrap items-center gap-x-1 gap-y-0.5 sm:mx-0 sm:gap-x-6">
                {siteConfig.navigation.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="inline-flex min-h-10 items-center rounded-sm px-2 font-display text-[length:var(--text-sm)] font-medium tracking-[-0.01em] text-[rgb(var(--text-dim))] transition-colors duration-200 hover:text-[rgb(var(--accent))] sm:min-h-11 sm:px-0"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}

                <li
                  aria-hidden="true"
                  className="hidden h-4 w-px bg-[rgb(var(--border))] sm:block"
                />

                {socialLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex min-h-10 items-center gap-1 rounded-sm px-2 font-display text-[length:var(--text-sm)] font-medium tracking-[-0.01em] text-[rgb(var(--text-muted))] transition-colors duration-200 hover:text-[rgb(var(--accent))] sm:min-h-11 sm:px-0"
                    >
                      {link.label}
                      <ArrowUpRight
                        className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        aria-hidden="true"
                      />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="flex flex-col gap-1 border-t border-[rgb(var(--border))] py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="caption text-[rgb(var(--text-muted))]">
            &copy; {year} {siteConfig.personName}
          </p>
          <p className="caption hidden text-[rgb(var(--text-muted))] sm:block">
            Next.js &amp; Supabase
          </p>
        </div>
      </div>
    </footer>
  )
}
