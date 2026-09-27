'use client'

import Image from 'next/image'
import { classNames } from '@/lib/utils/helpers'

/**
 * Thumbnail with a graceful fallback.
 *
 * If a project has no `thumbnail_url` — or the file 404s — we render a local
 * placeholder instead of a broken image icon. A failed `next/image` load
 * swaps in the same placeholder, which also covers rows seeded with remote
 * URLs that are no longer reachable.
 *
 * This must be a Client Component. `next/image` is itself a client component,
 * so the `onError` below can only be a function if this component already runs
 * in the browser. Passing it from a Server Component is the "Event handlers
 * cannot be passed to Client Component props" error, and it is a *prerender*
 * error, not a type error — so it stays invisible until a page actually
 * renders a thumbnail. On a machine with no Supabase credentials there are no
 * projects, no thumbnails, and the build passes while the bug sits there.
 *
 * Every prop is serialisable, which is what makes it safe for the Server
 * Components that render it (project card, grid, case study, related work).
 */
export function ProjectThumbnail({
  src,
  alt,
  className,
  sizes = '(min-width: 1280px) 40vw, (min-width: 768px) 50vw, 100vw',
  priority,
  zoom = true,
}: {
  src: string | null | undefined
  alt: string
  className?: string
  sizes?: string
  priority?: boolean
  /**
   * Adds the hover scale. Driven by an enclosing `.group`, so a parent card
   * opts in by wrapping this in `group`; pass `false` for standalone images
   * such as the case-study hero, where a hover zoom would be meaningless.
   */
  zoom?: boolean
}) {
  const hasImage = typeof src === 'string' && src.length > 0
  const imageClass = zoom ? 'image-zoom object-cover' : 'object-cover'

  return (
    <div className={classNames('relative overflow-hidden bg-[rgb(var(--surface-elevated))]', className)}>
      {hasImage ? (
        <Image
          src={src as string}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={imageClass}
          onError={(event) => {
            // Swap to the bundled placeholder instead of showing a broken frame.
            const img = event.currentTarget
            if (img.dataset.fallbackApplied === 'true') return
            img.dataset.fallbackApplied = 'true'
            img.src = '/images/placeholders/project.png'
          }}
        />
      ) : (
        <Image
          src="/images/placeholders/project.png"
          alt=""
          fill
          sizes={sizes}
          className={imageClass}
        />
      )}
    </div>
  )
}
