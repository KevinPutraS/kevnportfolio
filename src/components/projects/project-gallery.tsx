'use client'

import { useCallback, useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Expand } from 'lucide-react'
import { classNames } from '@/lib/utils/helpers'
import { useFocusTrap } from '@/lib/hooks/use-focus-trap'

/**
 * Project image gallery.
 *
 * The lightbox is a labelled modal dialog with a focus trap, Escape handling
 * and keyboard arrow navigation. All hooks are declared before any early
 * return — the previous version called `useState` after `if (!images.length)`
 * which breaks the rules of hooks and crashes when the gallery count changes.
 */
export function ProjectGallery({ images, title }: { images: string[]; title: string }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const close = useCallback(() => setLightboxIndex(null), [])
  const dialogRef = useFocusTrap<HTMLDivElement>(lightboxIndex !== null, close)

  const hasImages = images.length > 0
  const showPrev = useCallback(() => {
    setLightboxIndex((current) =>
      current === null ? null : (current - 1 + images.length) % images.length
    )
  }, [images.length])
  const showNext = useCallback(() => {
    setLightboxIndex((current) => (current === null ? null : (current + 1) % images.length))
  }, [images.length])

  // Nothing to show: render nothing at all rather than an empty section.
  if (!hasImages) return null

  return (
    <section aria-label={`${title} gallery`}>
      <div className="grid gap-4 sm:grid-cols-2">
        {images.map((src, index) => (
          <button
            key={`${src}-${index}`}
            type="button"
            onClick={() => setLightboxIndex(index)}
            className={classNames(
              'group relative block w-full overflow-hidden border border-[rgb(var(--border-subtle))] transition-colors hover:border-[rgb(var(--border))]',
              index === 0 ? 'sm:col-span-2' : ''
            )}
            style={{ aspectRatio: index === 0 ? '16 / 9' : '4 / 3' }}
          >
            <Image
              src={src}
              alt={`${title} screenshot ${index + 1} of ${images.length}`}
              fill
              sizes={index === 0 ? '(min-width: 768px) 66vw, 100vw' : '(min-width: 768px) 33vw, 100vw'}
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <span
              aria-hidden="true"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center border border-[rgb(var(--border))] bg-[rgb(var(--background))]/80 text-[rgb(var(--text-primary))] opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Expand className="h-4 w-4" />
            </span>
            <span className="sr-only">View image {index + 1} full size</span>
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={`${title} image viewer`} tabIndex={-1} className="relative w-full max-w-5xl focus:outline-none">
            <div className="relative aspect-[16/10] w-full">
              <Image
                src={images[lightboxIndex]}
                alt={`${title} screenshot ${lightboxIndex + 1} of ${images.length}`}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>

            <p className="mt-4 text-center font-mono text-xs text-[rgb(var(--text-secondary))]">
              {lightboxIndex + 1} / {images.length}
            </p>

            <button
              type="button"
              onClick={close}
              aria-label="Close image viewer"
              className="absolute -top-2 right-0 inline-flex h-10 w-10 items-center justify-center text-[rgb(var(--text-primary))] transition-colors hover:text-[rgb(var(--accent))] sm:-right-12 sm:-top-12"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrev}
                  aria-label="Previous image"
                  className="absolute left-0 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-[rgb(var(--border))] bg-[rgb(var(--background))]/80 text-[rgb(var(--text-primary))] transition-colors hover:border-[rgb(var(--accent))] sm:-left-14"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  aria-label="Next image"
                  className="absolute right-0 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-[rgb(var(--border))] bg-[rgb(var(--background))]/80 text-[rgb(var(--text-primary))] transition-colors hover:border-[rgb(var(--accent))] sm:-right-14"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
