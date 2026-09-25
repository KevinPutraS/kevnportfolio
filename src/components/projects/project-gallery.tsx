'use client'

import Image from 'next/image'
import { useState } from 'react'
import { classNames } from '@/lib/utils/helpers'
import { X, ChevronLeft, ChevronRight, Expand } from 'lucide-react'

interface ProjectGalleryProps {
  images: string[]
  alt?: string
}

export function ProjectGallery({ images, alt = 'Project screenshot' }: ProjectGalleryProps) {
  if (!images.length) return null

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrevious()
    if (e.key === 'ArrowRight') goToNext()
    if (e.key === 'Escape') setIsFullscreen(false)
  }

  if (isFullscreen) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
        role="dialog"
        aria-modal="true"
        aria-label="Image gallery"
        onKeyDown={handleKeyDown}
      >
        <button
          type="button"
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 right-4 z-10 rounded-lg p-2 text-white/70 hover:text-white transition-colors"
          aria-label="Close gallery"
        >
          <X className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={goToPrevious}
          className="absolute left-4 z-10 rounded-lg p-2 text-white/70 hover:text-white transition-colors hidden sm:block"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
        <button
          type="button"
          onClick={goToNext}
          className="absolute right-4 z-10 rounded-lg p-2 text-white/70 hover:text-white transition-colors hidden sm:block"
          aria-label="Next image"
        >
          <ChevronRight className="h-8 w-8" />
        </button>
        <div className="relative max-w-[90vw] max-h-[90vh]">
          <Image
            src={images[currentIndex]}
            alt={`${alt} ${currentIndex + 1} of ${images.length}`}
            width={1920}
            height={1080}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            priority
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-white/60 text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="relative aspect-video rounded-lg overflow-hidden bg-[rgb(var(--surface-elevated))]">
        <Image
          src={images[currentIndex]}
          alt={`${alt} ${currentIndex + 1} of ${images.length}`}
          fill
          sizes="(max-width: 768px) 100vw, 800px"
          priority
          className="object-cover"
          onClick={() => setIsFullscreen(true)}
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 hidden sm:block rounded-lg bg-black/50 p-2 text-white/70 hover:text-white hover:bg-black/70 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:block rounded-lg bg-black/50 p-2 text-white/70 hover:text-white hover:bg-black/70 transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  className={classNames(
                    'h-2 w-2 rounded-full transition-all duration-200',
                    index === currentIndex
                      ? 'bg-white w-6'
                      : 'bg-white/40 hover:bg-white/60'
                  )}
                  aria-label={`Go to image ${index + 1}`}
                  aria-current={index === currentIndex ? 'true' : 'false'}
                />
              ))}
            </div>
          </>
        )}
        <button
          type="button"
          onClick={() => setIsFullscreen(true)}
          className="absolute top-4 right-4 rounded-lg bg-black/50 p-2 text-white/70 hover:text-white hover:bg-black/70 transition-colors sm:hidden"
          aria-label="Open fullscreen gallery"
        >
          <Expand className="h-5 w-5" />
        </button>
      </div>
      {images.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2 overflow-x-auto pb-2 snap-x" role="tablist" aria-label="Gallery thumbnails">
          {images.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={classNames(
                'relative h-16 w-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 snap-center',
                index === currentIndex
                  ? 'border-[rgb(var(--accent))]'
                  : 'border-transparent hover:border-[rgb(var(--border))]'
              )}
              role="tab"
              aria-selected={index === currentIndex}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}