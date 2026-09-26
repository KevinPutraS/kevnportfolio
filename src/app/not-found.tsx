import Link from 'next/link'
import { ButtonLink } from '@/components/ui/button-link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[rgb(var(--background))] px-5 py-20">
      <div className="w-full max-w-lg text-center">
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[rgb(var(--accent))]">
          Error 404
        </p>
        <h1 className="heading-2 mt-6">This page does not exist</h1>
        <p className="mt-6 text-[rgb(var(--text-secondary))]">
          The link may be out of date, or the project may have been unpublished. Everything that is
          currently published is listed in the project archive.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/projects" className="w-full sm:w-auto">
            Browse projects
          </ButtonLink>
          <ButtonLink href="/" variant="secondary" className="w-full sm:w-auto">
            Back home
          </ButtonLink>
        </div>

        <p className="mt-10 text-sm text-[rgb(var(--text-muted))]">
          Think something is broken?{' '}
          <Link href="/contact" className="link">
            Let me know
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
