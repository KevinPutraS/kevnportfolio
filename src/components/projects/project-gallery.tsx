'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { createPortal } from 'react-dom'
import { X, ChevronLeft, ChevronRight, Expand } from 'lucide-react'
import { classNames } from '@/lib/utils/helpers'
import { useFocusTrap } from '@/lib/hooks/use-focus-trap'

/**
 * Project image gallery.
 *
 * The lightbox is a labelled modal dialog with a focus trap, Escape handling,
 * keyboard arrow navigation and touch swipe. All hooks are declared before any
 * early return — the previous version called `useState` after
 * `if (!images.length)`, which breaks the rules of hooks and crashes when the
 * gallery count changes.
 */
export function ProjectGallery({ images, title }: { images: string[]; title: string }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const close = useCallback(() => setLightboxIndex(null), [])
  const dialogRef = useFocusTrap<HTMLDivElement>(lightboxIndex !== null, close, '[data-gallery-close]')

  const showPrev = useCallback(() => {
    setLightboxIndex((current) =>
      current === null ? null : (current - 1 + images.length) % images.length
    )
  }, [images.length])
  const showNext = useCallback(() => {
    setLightboxIndex((current) => (current === null ? null : (current + 1) % images.length))
  }, [images.length])

  /*
   * Arrow keys, while the viewer is open.
   *
   * Bound to the document rather than to the dialog element so the keys work
   * wherever focus happens to be inside the trap — after tabbing to the close
   * button, arrow keys would otherwise do nothing, which is the single most
   * common way a keyboard user gets stuck in a carousel.
   *
   * Guarded on `images.length > 1` so a single-image gallery does not make
   * arrow keys scroll the page behind the overlay instead.
   */
  const isOpen = lightboxIndex !== null
  useEffect(() => {
    if (!isOpen || images.length < 2) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        showPrev()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        showNext()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, images.length, showPrev, showNext])

  // Nothing to show: render nothing at all rather than an empty section.
  if (!images.length) return null

  return (
    <section aria-label={`${title} gallery`}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {images.map((src, index) => (
          <button
            key={`${src}-${index}`}
            type="button"
            onClick={() => setLightboxIndex(index)}
            className="group relative block w-full overflow-hidden rounded-[var(--radius-lg)] border border-[rgb(var(--border))] transition-colors duration-300 hover:border-[rgb(var(--accent)/0.5)]"
            style={{ aspectRatio: index === 0 ? '16 / 9' : '4 / 3' }}
          >
            <Image
              src={src}
              alt={`${title} screenshot ${index + 1} of ${images.length}`}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.03]"
              quality={90}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgb(var(--bg)/0.6)] via-transparent to-transparent"
            />
            {/*
              Always visible rather than hover-only. `opacity-0` until hover is
              meaningless on a touch screen — there is no hover state — so the
              affordance that tells you an image opens full size was invisible to
              every phone user.
            */}
            <span
              aria-hidden="true"
              className="absolute bottom-2.5 right-2.5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgb(var(--border-strong))] bg-[rgb(var(--surface)/0.85)] text-[rgb(var(--text-dim))] backdrop-blur-sm transition-colors duration-200 group-hover:border-[rgb(var(--accent))] group-hover:bg-[rgb(var(--accent))] group-hover:text-[rgb(var(--accent-contrast))]"
            >
              <Expand className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="sr-only">View image {index + 1} full size</span>
          </button>
        ))}
      </div>

      {isOpen && typeof document !== 'undefined' &&
        createPortal(
          <Lightbox
            images={images}
            title={title}
            index={lightboxIndex}
            onClose={close}
            onPrev={showPrev}
            onNext={showNext}
            onSelect={setLightboxIndex}
            dialogRef={dialogRef}
          />,
          document.body
        )}
    </section>
  )
}

function Lightbox({
  images,
  title,
  index,
  onClose,
  onPrev,
  onNext,
  onSelect,
  dialogRef,
}: {
  images: string[]
  title: string
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  onSelect: (index: number) => void
  dialogRef: React.RefObject<HTMLDivElement>
}) {
  /*
   * Horizontal swipe.
   *
   * A phone user expects to flick between gallery images, and without it every
   * step needs a tap on a 48px arrow that is fighting the image for space.
   *
   * `touch-action: pan-y` on the surface is what makes this possible: the
   * browser keeps ownership of vertical scrolling and hands horizontal movement
   * to us, so the viewer never fights the page for a gesture. A swipe is only
   * committed past `SWIPE_THRESHOLD_PX` *and* once the gesture is more
   * horizontal than vertical, otherwise a diagonal scroll becomes an accidental
   * image change.
   */
  const surfaceRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const SWIPE_THRESHOLD_PX = 48

  function onTouchStart(event: React.TouchEvent) {
    const touch = event.touches[0]
    touchStartX.current = touch.clientX
    touchStartY.current = touch.clientY
  }

  function onTouchEnd(event: React.TouchEvent) {
    const startX = touchStartX.current
    const startY = touchStartY.current
    touchStartX.current = null
    touchStartY.current = null
    if (startX === null || startY === null) return

    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - startX
    const deltaY = touch.clientY - startY

    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return
    if (Math.abs(deltaX) <= Math.abs(deltaY)) return

    if (deltaX < 0) onNext()
    else onPrev()
  }

  return (
    <div className="fixed inset-0 z-[80] flex flex-col p-3 sm:p-6">
      <div
        className="animate-fade-in absolute inset-0 bg-[rgb(0_0_0/0.92)] backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/*
        Top bar. `shrink-0` matters: the image area is the flexible child, and
        without it the bar is what gets squeezed when the viewport is short.
      */}
      <div className="relative z-10 mb-3 flex shrink-0 items-center justify-between gap-4 sm:mb-4">
        <p className="min-w-0 truncate font-mono text-[length:var(--text-meta)] uppercase tracking-[0.14em] text-[rgb(244_244_250/0.65)]">
          <span className="text-white">{title}</span>
        </p>

        <div className="flex shrink-0 items-center gap-2">
          <p className="font-mono text-[length:var(--text-sm)] tabular-nums text-[rgb(244_244_250/0.65)]">
            {index + 1} / {images.length}
          </p>
          <button
            type="button"
            onClick={onClose}
            data-gallery-close
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-[rgb(0_0_0/0.4)] text-white/85 transition-colors duration-200 hover:border-white/40 hover:bg-white/10 hover:text-white"
            aria-label="Close image viewer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${title} image viewer`}
        tabIndex={-1}
        className="relative z-10 flex min-h-0 flex-1 flex-col focus:outline-none"
      >
        {/*
          `relative` with an explicit height. This container previously held only
          a `next/image` with `fill`, which is `position: absolute` — with no
          height of its own the box collapsed to 0 and the full-size image was
          invisible. `min-h-0` lets the flex child actually shrink on a short
          screen instead of pushing the thumbnail strip off the bottom.
        */}
        <div
          ref={surfaceRef}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          style={{ touchAction: 'pan-y' }}
          className="relative min-h-0 flex-1 overflow-hidden rounded-[var(--radius-lg)]"
        >
          <Image
            src={images[index]}
            alt={`${title} screenshot ${index + 1} of ${images.length}`}
            fill
            sizes="100vw"
            className="object-contain"
            priority
            quality={90}
          />

          {/*
            Arrows sit *inside* the image area, at its edges.

            They used to be positioned at `-translate-x-12` / `translate-x-12`
            from a `max-w-6xl` box, which is correct on a desktop and completely
            off-screen on a phone: the dialog is only ~360px wide there, so
            pushing 48px outward puts each arrow beyond the viewport edge. Inside
            the frame they are always reachable, and the translucent backing
            keeps them legible over any image.
          */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={onPrev}
                aria-label="Previous image"
                className="absolute left-1 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[rgb(0_0_0/0.55)] text-white/90 backdrop-blur transition-colors duration-200 hover:bg-[rgb(var(--accent))] hover:text-[rgb(var(--accent-contrast))] sm:left-3"
              >
                <ChevronLeft className="h-6 w-6" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onNext}
                aria-label="Next image"
                className="absolute right-1 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[rgb(0_0_0/0.55)] text-white/90 backdrop-blur transition-colors duration-200 hover:bg-[rgb(var(--accent))] hover:text-[rgb(var(--accent-contrast))] sm:right-3"
              >
                <ChevronRight className="h-6 w-6" aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="mt-3 flex shrink-0 items-center justify-start gap-2 overflow-x-auto overscroll-x-contain scrollbar-hide px-0.5 pb-1 sm:justify-center">
            {images.map((src, thumbIndex) => (
              <button
                key={`${src}-${thumbIndex}`}
                type="button"
                onClick={() => onSelect(thumbIndex)}
                className={classNames(
                  'relative h-12 w-[4.5rem] shrink-0 overflow-hidden rounded-[var(--radius-sm)] border-2 transition-[border-color,opacity] duration-200 sm:h-11 sm:w-16',
                  thumbIndex === index
                    ? 'border-[rgb(var(--accent))] opacity-100'
                    : 'border-transparent opacity-55 hover:opacity-90'
                )}
                style={{ aspectRatio: '16 / 9' }}
                aria-label={`View image ${thumbIndex + 1}`}
                aria-current={thumbIndex === index ? 'true' : undefined}
              >
                <Image src={src} alt="" fill sizes="80px" className="object-cover" quality={90} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
