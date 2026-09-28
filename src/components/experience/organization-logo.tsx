'use client'

import { useState } from 'react'
import { classNames } from '@/lib/utils/helpers'

/**
 * Company logo tile for an experience entry.
 *
 * This is the one logo on the site that is not under the author's control, and
 * it was rendering as a dark-grey smudge. Two independent reasons, and the tile
 * only had to get one of them wrong to fail:
 *
 *  1. The tile was `bg-[rgb(var(--bg-highlight))]` — a dark surface — behind
 *     `object-contain`. Company marks are overwhelmingly distributed as dark or
 *     full-colour art on a transparent background, because that is what a
 *     letterhead and a PDF need. A black wordmark on a #191924 tile is not low
 *     contrast, it is absent. The 16px of padding then cut what little was left
 *     of a mark that is often a wide wordmark rather than a square icon.
 *  2. A bare `<img>` with a dead URL renders the browser's broken-image glyph,
 *     so a logo that 404s looked broken rather than absent.
 *
 * The fix is a light tile, which is the surface company logos are actually drawn
 * for. `mix-blend-multiply` is what makes it safe to assume that: white and
 * transparent-keyed artwork merges into the tile instead of floating on it as a
 * white box, mid-grey lines darken enough to read, and full-colour marks are
 * unchanged, because multiplying by white is a no-op. The one artwork that
 * still disappears is a white logo on a white tile — invisible on any light
 * surface, and rare, since a white mark has no background to sit on.
 *
 * `initials` covers both the empty and the failed case. An initials tile is a
 * deliberate-looking placeholder; a broken-image box is not.
 *
 * Deliberately a raw `<img>` and not `next/image`: `mediaReferenceSchema` accepts
 * any absolute http(s) URL, while `next.config.mjs` only whitelists
 * `**.supabase.co` storage paths. An off-Supabase logo URL would make
 * `next/image` throw a config error for a page that renders fine today. It is a
 * Client Component for the same reason `ProjectThumbnail` is — the `onError`
 * handler is a function, and functions cannot cross the server/client boundary.
 */
export function OrganizationLogo({
  src,
  name,
  className,
}: {
  src: string | null | undefined
  name: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const hasImage = typeof src === 'string' && src.length > 0 && !failed

  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase() || '?'

  return (
    <span
      className={classNames(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[rgb(250_250_252)] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)]',
        className
      )}
    >
      {hasImage ? (
        /*
          `alt=""` and `aria-hidden` because the organization name is rendered
          as text immediately beside this tile. Naming the image would make a
          screen reader announce "Acme logo" and then "Acme Inc" for the same
          fact, one after the other.
        */
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src as string}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-contain p-2.5 mix-blend-multiply"
        />
      ) : (
        <span
          aria-hidden="true"
          className="select-none font-display text-lg font-bold tracking-[-0.04em] text-[rgb(0_0_0/0.32)]"
        >
          {initials}
        </span>
      )}
    </span>
  )
}
