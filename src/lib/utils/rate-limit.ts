/**
 * Minimal fixed-window rate limiter.
 *
 * In-memory by design: it avoids adding a dependency or requiring Redis for a
 * single-endpoint abuse guard. It is per-instance, so on serverless platforms it
 * limits each warm instance rather than the whole deployment — documented as a
 * known limitation in the README rather than over-engineered away.
 */

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

/** Keeps the map from growing without bound on a long-lived server. */
const MAX_BUCKETS = 5000

export interface RateLimitOptions {
  limit: number
  windowMs: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterMs: number
}

export function checkRateLimit(key: string, { limit, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now()

  if (buckets.size > MAX_BUCKETS) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(bucketKey)
    }
  }

  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, retryAfterMs: 0 }
  }

  bucket.count += 1

  if (bucket.count > limit) {
    return { allowed: false, remaining: 0, retryAfterMs: bucket.resetAt - now }
  }

  return { allowed: true, remaining: limit - bucket.count, retryAfterMs: 0 }
}

/** Exposed for tests and for the admin API if a limit is ever needed there. */
export function resetRateLimit(): void {
  buckets.clear()
}
