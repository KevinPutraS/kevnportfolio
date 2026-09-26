import { PageSkeleton, SkeletonRegion } from '@/components/ui/skeletons'

/**
 * Loading state for the authenticated CMS.
 *
 * Every admin request runs an auth check and a database query, so a skeleton
 * here is genuinely useful. The `(protected)` group is the right boundary: the
 * login page must render immediately, and an unauthenticated visit is
 * redirected rather than streamed.
 */
export default function Loading() {
  return (
    <SkeletonRegion>
      <PageSkeleton />
    </SkeletonRegion>
  )
}
