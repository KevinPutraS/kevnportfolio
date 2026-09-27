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

  const showPrev = useCallback(() => {
    setLightboxIndex((current) =>
      current === null ? null : (current - 1 + images.length) % images.length
    )
  }, [images.length])
  const showNext = useCallback(() => {
    setLightboxIndex((current) => (current === null ? null : (current + 1) % images.length))
  }, [images.length])

  // Nothing to show: render nothing at all rather than an empty section.
  if (!images.length) return null

  return (
    <section aria-label={`${title} gallery`}>
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((src, index) => (
          <button
            key={`${src}-${index}`}
            type="button"
            onClick={() => setLightboxIndex(index)}
            className={classNames(
              'group relative block w-full overflow-hidden rounded-xl border border-[rgb(var(--border-subtle))] transition-all duration-300 hover:border-[rgb(var(--accent))]/50 hover:shadow-lg hover:shadow-[rgb(var(--accent))]/10',
            )}
            style={{ aspectRatio: index === 0 ? '16 / 9' : '4 / 3' }}
          >
            <Image
              src={src}
              alt={`${title} screenshot ${index + 1} of ${images.length}`}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.03]"
            
            quality={90}/>
            {/* Gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--background))]/60 via-transparent to-transparent pointer-events-none" />
            {/* Expand indicator */}
            <span
              aria-hidden="true"
              className="absolute right-3 bottom-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[rgb(var(--surface))]/90 backdrop-blur-sm border border-[rgb(var(--border-subtle))] text-[rgb(var(--text-secondary))] opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-[-2px]"
            >
              <Expand className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="sr-only">View image {index + 1} full size</span>
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 animate-fade-in">
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`${title} image viewer`}
            tabIndex={-1}
            className="relative w-full max-w-6xl animate-scale-in focus:outline-none"
          >
            {/* Image with smooth transitions */}
            <div className="relative overflow-hidden rounded-xl bg-black">
              <Image
                src={images[lightboxIndex]}
                alt={`${title} screenshot ${lightboxIndex + 1} of ${images.length}`}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              
            quality={90}/>
            </div>

            {/* Thumbnail strip at bottom */}
            {images.length > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2 overflow-x-auto pb-2 px-2">
                {images.map((src, index) => (
                  <button
                    key={`${src}-${index}`}
                    type="button"
                    onClick={() => setLightboxIndex(index)}
                    className={classNames(
                      'relative flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200',
                      index === lightboxIndex
                        ? 'border-[rgb(var(--accent))] opacity-100 scale-110'
                        : 'border-transparent opacity-50 hover:opacity-75 hover:scale-105'
                    )}
                    style={{ aspectRatio: '16 / 9' }}
                    aria-label={`View image ${index + 1}`}
                    aria-current={index === lightboxIndex ? 'true' : undefined}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      className="object-cover"
                    
            quality={90}/>
                  </button>
                ))}
              </div>
            )}

            <p className="mt-3 text-center font-mono text-sm text-[rgb(var(--text-secondary))]">
              {lightboxIndex + 1} / {images.length}
            </p>

            {/* Close button */}
            <button
              type="button"
              onClick={close}
              aria-label="Close image viewer"
              className="absolute -top-14 right-0 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgb(var(--surface))]/80 backdrop-blur-sm border border-[rgb(var(--border-subtle))] text-[rgb(var(--text-primary))] transition-all duration-200 hover:bg-[rgb(var(--accent))] hover:border-[rgb(var(--accent))] hover:text-[rgb(var(--accent-contrast))]"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrev}
                  aria-label="Previous image"
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[rgb(var(--surface))]/80 backdrop-blur-sm border border-[rgb(var(--border-subtle))] text-[rgb(var(--text-primary))] transition-all duration-200 hover:bg-[rgb(var(--accent))] hover:border-[rgb(var(--accent))] hover:text-[rgb(var(--accent-contrast))]"
                >
                  <ChevronLeft className="h-6 w-6" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  aria-label="Next image"
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[rgb(var(--surface))]/80 backdrop-blur-sm border border-[rgb(var(--border-subtle))] text-[rgb(var(--text-primary))] transition-all duration-200 hover:bg-[rgb(var(--accent))] hover:border-[rgb(var(--accent))] hover:text-[rgb(var(--accent-contrast))]"
                >
                  <ChevronRight className="h-6 w-6" aria-hidden="true" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
