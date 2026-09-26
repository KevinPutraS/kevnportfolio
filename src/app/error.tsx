'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

/**
 * Route-level error boundary. Catches errors thrown while rendering a page,
 * including failed database requests.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Surfaces the failure in the server log with the request digest.
    console.error('[app] render error:', error.message, error.digest ?? '')
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[rgb(var(--background))] px-5 py-20">
      <div className="w-full max-w-lg text-center">
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[rgb(var(--error))]">
          Something went wrong
        </p>
        <h1 className="heading-2 mt-6">This page failed to load</h1>
        <p className="mt-6 text-[rgb(var(--text-secondary))]">
          An unexpected error occurred while rendering this page. Trying again often fixes it — if the
          database is not configured yet, the public pages will render empty rather than fail.
        </p>

        {error.digest && (
          <p className="mt-4 font-mono text-xs text-[rgb(var(--text-muted))]">
            Reference: {error.digest}
          </p>
        )}

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Button type="button" onClick={reset} className="w-full sm:w-auto">
            Try again
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              window.location.href = '/'
            }}
            className="w-full sm:w-auto"
          >
            Back home
          </Button>
        </div>
      </div>
    </div>
  )
}
