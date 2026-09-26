import { ButtonLink } from '@/components/ui/button-link'
import { ArrowLink } from '@/components/ui/arrow-link'
import Link from 'next/link'

/**
 * Not-found boundary for a single project.
 *
 * Scoped to this segment on purpose: a missing project slug should not send a
 * visitor to the generic site-wide 404 with no way forward. Declaring the
 * boundary here lets Next resolve `notFound()` from the page body against this
 * segment, so the public layout (navbar, footer, page depth) still applies.
 */
export default function ProjectNotFound() {
  return (
    <div className="container-custom">
      <div className="grid gap-x-10 gap-y-12 py-20 sm:py-28 lg:grid-cols-12 lg:py-32">
        <div className="lg:col-span-7">
          <p className="eyebrow">
            Error <span className="text-[rgb(var(--accent))]">404</span>
          </p>
          <h1 className="heading-1 mt-6 max-w-[18ch] text-balance">That project is not here.</h1>
          <p className="body-lg mt-8 max-w-xl text-pretty text-[rgb(var(--text-secondary))]">
            The address may have changed, or the project may not be published. Everything currently
            public is listed in the archive.
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

        <div className="lg:col-span-4 lg:col-start-9">
          <p className="meta-label border-t border-[rgb(var(--border-subtle))] pt-5">Elsewhere</p>
          <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--text-muted))]">
            If a link to this project is broken somewhere else, please{' '}
            <Link href="/contact" className="link">
              let me know
            </Link>{' '}
            so I can point it somewhere useful.
          </p>
        </div>
      </div>
    </div>
  )
}
