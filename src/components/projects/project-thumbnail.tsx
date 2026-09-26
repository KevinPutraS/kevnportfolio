import Image from 'next/image'
import { classNames } from '@/lib/utils/helpers'

/**
 * Thumbnail with a graceful fallback.
 *
 * If a project has no `thumbnail_url` — or the file 404s — we render a local
 * placeholder instead of a broken image icon. A failed `next/image` load
 * swaps in the same placeholder, which also covers rows seeded with remote
 * URLs that are no longer reachable.
 */
export function ProjectThumbnail({
  src,
  alt,
  className,
  sizes = '(min-width: 1280px) 40vw, (min-width: 768px) 50vw, 100vw',
  priority,
}: {
  src: string | null | undefined
  alt: string
  className?: string
  sizes?: string
  priority?: boolean
}) {
  const hasImage = typeof src === 'string' && src.length > 0

  return (
    <div className={classNames('relative overflow-hidden bg-[rgb(var(--surface-elevated))]', className)}>
      {hasImage ? (
        <Image
          src={src as string}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
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
          className="object-cover"
        />
      )}
    </div>
  )
}
