import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { ButtonLink } from '@/components/ui/button-link'
import { siteConfig, socialLinks } from '@/config/site'

/**
 * Footer.
 *
 * The page used to end on a full-width grey wordmark, which is a nice printed
 * flourish but leaves a first-time visitor with nothing to do. It now closes
 * with the same invitation the rest of the site makes: a short "let's work
 * together" block with a real button, then the navigation, then the wordmark as
 * the final quiet beat.
 *
 * Internal pages and external profiles are separated into two groups with
 * their own labels. Before, the project pages and GitHub sat in one running
 * list distinguished only by a small arrow, so "where does this link go?" needed
 * a hover to answer.
 */
export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative border-t border-[rgb(var(--border-subtle))]">
      <div className="container-custom">
        <div className="rhythm-md flex flex-col gap-12">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
            {/* ---- Closing invitation ----------------------------------- */}
            <div className="lg:col-span-7">
              <h2 className="heading-2 max-w-lg text-balance">
                Have something in mind?{' '}
                <span className="text-[rgb(var(--accent))]">Let&apos;s talk.</span>
              </h2>
              <p className="body-lg mt-5 max-w-prose text-pretty text-[rgb(var(--text-secondary))]">
                {siteConfig.description} If you want to discuss an idea, a project or a collaboration,
                the fastest way to reach me is email.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <ButtonLink href="/contact" size="lg" className="w-full sm:w-auto">
                  Start a conversation
                </ButtonLink>
                <a
                  href={siteConfig.contactEmail}
                  className="inline-flex min-h-11 items-center gap-2 break-all py-2 text-[length:var(--text-body-sm)] font-medium text-[rgb(var(--text-secondary))] transition-colors duration-150 hover:text-[rgb(var(--accent))]"
                >
                  {siteConfig.email}
                </a>
              </div>
            </div>

            {/* ---- Navigation -------------------------------------------- */}
            <div className="grid gap-8 sm:grid-cols-2 lg:col-span-5">
              <nav aria-label="Footer pages">
                <p className="label">Pages</p>
                <ul className="mt-1 space-y-0.5">
                  {siteConfig.navigation.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="inline-flex min-h-11 items-center font-display text-base font-medium tracking-[-0.02em] text-[rgb(var(--text-secondary))] transition-colors duration-150 hover:text-[rgb(var(--text-primary))]"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div>
                <p className="label">Elsewhere</p>
                <ul className="mt-1 space-y-0.5">
                  {socialLinks.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex min-h-11 items-center gap-1.5 font-display text-base font-medium tracking-[-0.02em] text-[rgb(var(--text-secondary))] transition-colors duration-150 hover:text-[rgb(var(--text-primary))]"
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
              </div>
            </div>
          </div>

          {/*
            The wordmark at display scale is decorative repetition of the header
            logo, so it is hidden from assistive tech to avoid reading the name
            twice in a row. Kept as the last thing on the page — a deliberate
            full stop rather than a stray grey block.
          */}
          <p
            aria-hidden="true"
            className="display-1 select-none leading-[0.85] text-[rgb(var(--border))]"
          >
            {siteConfig.name}
            <span className="text-[rgb(var(--accent))]">.</span>
          </p>
        </div>

        <div className="flex flex-col gap-3 border-t border-[rgb(var(--border-subtle))] py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="caption text-[rgb(var(--text-muted))]">
            &copy; {year} {siteConfig.personName}
          </p>
          <p className="caption text-[rgb(var(--text-muted))]">
            Built with Next.js &amp; Supabase
          </p>
        </div>
      </div>
    </footer>
  )
}
