/**
 * Shared loading skeletons.
 *
 * These live in their own file so the `loading.tsx` boundaries can stay tiny and
 * so the public archive and the CMS do not drift apart visually.
 *
 * Why the skeletons are not wrapped in a root-level `loading.tsx`
 * --------------------------------------------------------------
 * A `loading.tsx` puts the route in a Suspense boundary, which makes Next.js
 * start streaming the response immediately. Once the first byte is flushed the
 * HTTP status is locked in — so a `notFound()` thrown a moment later renders the
 * correct 404 markup but is still served as **HTTP 200**. Search engines then
 * treat every unknown project URL as a real page.
 *
 * The boundaries are therefore scoped to the routes that genuinely query per
 * request (the archive and the CMS), and `projects/[slug]` renders atomically so
 * it can return a genuine 404 status.
 */
export function PageSkeleton() {
  return (
    <div className="container-custom py-20 sm:py-28">
      <div className="h-3 w-32 animate-pulse bg-[rgb(var(--surface-elevated))]" />
      <div className="mt-8 h-12 w-full max-w-2xl animate-pulse bg-[rgb(var(--surface-elevated))]" />
      <div className="mt-4 h-12 w-full max-w-xl animate-pulse bg-[rgb(var(--surface-elevated))]" />
    </div>
  )
}

export function GridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>
          <div className="aspect-[4/3] w-full animate-pulse bg-[rgb(var(--surface-elevated))]" />
          <div className="mt-4 h-4 w-2/3 animate-pulse bg-[rgb(var(--surface-elevated))]" />
          <div className="mt-2 h-3 w-full animate-pulse bg-[rgb(var(--surface))]" />
        </div>
      ))}
    </div>
  )
}

/** Announced once for the whole skeleton, not once per bar. */
export function SkeletonRegion({ children }: { children: React.ReactNode }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading…</span>
      {children}
    </div>
  )
}
