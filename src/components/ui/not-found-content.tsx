import Link from 'next/link'
import { ButtonLink } from '@/components/ui/button-link'
import { ArrowLink } from '@/components/ui/arrow-link'
import { siteConfig } from '@/config/site'

/**
 * Shared 404 body.
 *
 * Extracted because `app/not-found.tsx` and `app/(public)/not-found.tsx` were
 * byte-for-byte identical — two copies of the same page that would drift the
 * moment either was edited. The wrapper still differs: the public one inherits
 * the navbar, footer and background, the root one covers everything outside that
 * group (the admin area, for example) and stands alone. Only the content is
 * shared.
 */
export function NotFoundContent() {
  return (
    <div className="container-custom">
      <div className="grid gap-x-10 gap-y-12 py-20 sm:py-28 lg:grid-cols-12 lg:py-32">
        <div className="lg:col-span-7">
          <p className="eyebrow">
            Error <span className="text-[rgb(var(--accent))]">404</span>
          </p>
          <h1 className="heading-1 mt-6 max-w-[14ch] text-balance">This page does not exist.</h1>
          <p className="body-lg mt-8 max-w-xl text-pretty text-[rgb(var(--text-secondary))]">
            The link may be out of date, or the project it pointed at may have been unpublished.
            Everything currently published is on the projects page.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <ButtonLink href="/projects" size="lg" className="w-full sm:w-auto">
              Browse projects
            </ButtonLink>
            <ArrowLink href="/" className="justify-center sm:justify-start">
              Back home
            </ArrowLink>
          </div>
        </div>

        <nav aria-label="Site sections" className="lg:col-span-4 lg:col-start-9">
          <p className="label border-t border-[rgb(var(--border-subtle))] pt-5">Pages</p>
          <ul className="mt-2">
            {siteConfig.navigation.map((item) => (
              <li key={item.href} className="border-b border-[rgb(var(--border-subtle))]">
                <Link
                  href={item.href}
                  className="group flex min-h-12 items-baseline gap-4 py-3 transition-colors duration-150"
                >
                  <span className="flex-1 font-display text-lg font-medium tracking-[-0.02em] text-[rgb(var(--text-secondary))] transition-colors duration-150 group-hover:text-[rgb(var(--text-primary))]">
                    {item.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className="arrow-shift self-center text-[rgb(var(--text-muted))] transition-colors duration-150 group-hover:text-[rgb(var(--accent))]"
                  >
                    &rarr;
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-[length:var(--text-body-sm)] text-[rgb(var(--text-muted))]">
            Think something is broken? <Link href="/contact" className="link">Let me know</Link>.
          </p>
        </nav>
      </div>
    </div>
  )
}
