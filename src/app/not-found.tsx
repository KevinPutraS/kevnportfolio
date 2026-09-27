import { NotFoundContent } from '@/components/ui/not-found-content'

/**
 * Root 404.
 *
 * Covers everything outside the `(public)` route group, including the admin
 * area, so it has to stand alone without the public shell. The body is shared
 * with `app/(public)/not-found.tsx` via `NotFoundContent`.
 */
export default function NotFound() {
  return <NotFoundContent />
}
