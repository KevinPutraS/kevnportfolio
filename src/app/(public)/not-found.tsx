import { NotFoundContent } from '@/components/ui/not-found-content'

/**
 * 404 for unmatched URLs inside the public route group.
 *
 * Lives here rather than only at the root so it inherits the public shell —
 * navbar, footer and background — instead of dropping the visitor on a bare
 * page with no way back into the site. The root `not-found.tsx` still covers
 * everything outside this group (admin, for example) and stays self-contained.
 * Both share `NotFoundContent`.
 */
export default function PublicNotFound() {
  return <NotFoundContent />
}
