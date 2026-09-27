'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

/**
 * Error boundary for the public route group.
 *
 * Scoped to this group so a failed public page keeps the site chrome — the
 * navbar and footer still render, so the visitor has somewhere to go. The root
 * `error.tsx` catches everything else and remains self-contained.
 */
export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Surfaces the failure in the server log with the request digest.
    console.error('[public] render error:', error.message, error.digest ?? '')
  }, [error])

  return (
    <div className="container-custom">
      <div className="grid gap-x-10 gap-y-12 py-20 sm:py-28 lg:grid-cols-12 lg:py-32">
        <div className="lg:col-span-7">
          <p className="eyebrow text-[rgb(var(--error))]">Something went wrong</p>
          <h1 className="heading-1 mt-6 max-w-[14ch] text-balance">This page failed to load.</h1>
          <p className="body-lg mt-8 max-w-xl text-pretty text-[rgb(var(--text-secondary))]">
            Something went wrong while putting this page together. Trying again usually fixes it.
            If it keeps happening, please let me know and I will fix it.
          </p>

          {error.digest && (
            <p className="meta mt-6">
              Reference: {error.digest}
            </p>
          )}

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button type="button" onClick={reset} size="lg" className="w-full sm:w-auto">
              Try again
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                window.location.href = '/'
              }}
              size="lg"
              className="w-full sm:w-auto"
            >
              Back home
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
