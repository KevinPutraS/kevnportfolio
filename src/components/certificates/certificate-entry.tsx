'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createPortal } from 'react-dom'
import { ExternalLink, FileBadge, Maximize2, X } from 'lucide-react'
import { classNames, formatMonth, isMonthCurrent } from '@/lib/utils/helpers'
import { useFocusTrap } from '@/lib/hooks/use-focus-trap'
import type { Certificate } from '@/types/certificate'

/**
 * One certificate, as a row in a list rather than a card in a grid.
 *
 * The previous version put a 16:10 image across the top of every card, so a
 * grid of certificates was mostly screenshots. The information a visitor
 * actually reads — what it is, who issued it, when, what it covered — sat
 * underneath, and the two real actions ("Verify", "Preview") were 11px mono
 * links in the corner.
 *
 * Now the text leads and the image is an optional small thumbnail on the left,
 * which is the right priority: most visitors arrive to check the issuer and the
 * date, and a certificate scan is a secondary check for the sceptically
 * inclined. The lightbox is kept because opening the full-size document is
 * genuinely useful, it is just no longer the headline.
 *
 * A Client Component only because the lightbox needs state.
 */
export function CertificateEntry({ certificate }: { certificate: Certificate }) {
  const [isLightboxOpen, setLightboxOpen] = useState(false)
  /*
   * A URL that 404s is treated exactly like a missing one. Hiding the broken
   * <img> with inline styles would leave an empty frame that still opened a
   * lightbox pointing at the same dead file, so the failure flips real state
   * and the row falls through to the placeholder icon.
   */
  const [imageFailed, setImageFailed] = useState(false)

  const skills = certificate.skills ?? []
  const hasImage = Boolean(certificate.certificate_image_url)
  const isExpired = !isMonthCurrent(certificate.expiration_date)
  const showsImage = hasImage && !imageFailed

  return (
    <article className="group relative grid gap-5 border-t border-[rgb(var(--border))] py-8 sm:gap-6 md:grid-cols-12 md:gap-8 md:py-9">
      {/*
        The thumbnail is a column from `md` and a lead-in block above it. Below
        `md` it sits *after* the title in the DOM and is moved up with
        `order-first` on the wrapper instead, so a phone shows the text the
        visitor came for and the image as supporting evidence — the reverse
        order would put a 4:3 screenshot above the certificate's own name.
      */}
      <div className={classNames('md:col-span-3 lg:col-span-2', showsImage ? 'order-first' : 'hidden')}>
        {showsImage ? (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="group/thumb relative block aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-lg)] border border-[rgb(var(--border))] bg-[rgb(var(--bg-highlight))] transition-colors duration-300 hover:border-[rgb(var(--accent)/0.5)]"
          >
            <Image
              src={certificate.certificate_image_url as string}
              alt={`Certificate: ${certificate.title}`}
              fill
              sizes="(min-width: 1024px) 12rem, (min-width: 768px) 18rem, 100vw"
              className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover/thumb:scale-[1.03]"
              onError={() => setImageFailed(true)}
              quality={90}
            />
            {/* Bottom fade so the zoom chip stays readable over a light scan. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgb(var(--bg)/0.6)] via-transparent to-transparent"
            />
            <span className="absolute bottom-2.5 right-2.5 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgb(var(--border-strong))] bg-[rgb(var(--surface)/0.85)] text-[rgb(var(--text-dim))] backdrop-blur-sm transition-colors duration-200 group-hover/thumb:border-[rgb(var(--accent))] group-hover/thumb:bg-[rgb(var(--accent))] group-hover/thumb:text-[rgb(var(--accent-contrast))]">
              <Maximize2 className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="sr-only">Open a larger image of this certificate</span>
          </button>
        ) : (
          <div className="hidden aspect-[4/3] w-full items-center justify-center rounded-[var(--radius-lg)] border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-muted))] md:flex">
            <FileBadge className="h-9 w-9" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className={classNames(showsImage ? 'md:col-span-9 lg:col-span-10' : 'md:col-span-12')}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="meta-strong">{certificate.issuer}</span>
          {certificate.issue_date ? (
            <time dateTime={certificate.issue_date} className="meta tabular-nums">
              {formatMonth(certificate.issue_date)}
            </time>
          ) : null}
          {isExpired ? (
            <span className="badge-error">Expired</span>
          ) : certificate.expiration_date ? (
            <span className="badge-success">Valid until {formatMonth(certificate.expiration_date)}</span>
          ) : null}
        </div>

        <h3 className="heading-3 mt-3 text-balance">{certificate.title}</h3>

        {certificate.description ? (
          <p className="mt-3 max-w-prose text-pretty text-[length:var(--text-body-sm)] leading-relaxed text-[rgb(var(--text-dim))]">
            {certificate.description}
          </p>
        ) : null}

        {/* Metadata that only exists on some records, so it is listed last. */}
        {(certificate.credential_id || certificate.expiration_date) && (
          <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-1.5">
            {certificate.credential_id ? (
              <div className="flex gap-2">
                <dt className="meta">Credential ID</dt>
                <dd className="tech-list tabular-nums text-[rgb(var(--text-dim))]">{certificate.credential_id}</dd>
              </div>
            ) : null}
            {certificate.expiration_date ? (
              <div className="flex gap-2">
                <dt className="meta">Expiry</dt>
                <dd className="tech-list tabular-nums text-[rgb(var(--text-dim))]">
                  {formatMonth(certificate.expiration_date)}
                </dd>
              </div>
            ) : null}
          </dl>
        )}

        {skills.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5" role="list" aria-label="Topics covered">
            <span className="sr-only">Topics covered: </span>
            {skills.map((skill) => (
              <span key={skill} className="badge-neutral" role="listitem">
                {skill}
              </span>
            ))}
          </div>
        )}

        {/*
          Actions, always visible and always labelled. Each is rendered only when
          the underlying data exists, so the row never offers a dead end. They
          are buttons and links with real icons rather than underlined text: an
          underline is not a reliable affordance on a touch screen, and the two
          verbs here are destructive-adjacent enough to deserve a target you can
          see before tapping.
        */}
        {(certificate.credential_url || showsImage) && (
          <div className="mt-6 flex flex-wrap items-center gap-2.5 border-t border-[rgb(var(--border))] pt-5">
            {showsImage ? (
              <button type="button" onClick={() => setLightboxOpen(true)} className="btn btn-secondary btn-sm">
                <Maximize2 className="h-4 w-4" aria-hidden="true" />
                View
                <span className="sr-only"> a larger image of the {certificate.title} certificate</span>
              </button>
            ) : null}

            {certificate.credential_url ? (
              <a href={certificate.credential_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Verify
                <span className="sr-only"> the {certificate.title} credential (opens in a new tab)</span>
              </a>
            ) : null}
          </div>
        )}
      </div>

      {isLightboxOpen && showsImage ? (
        <CertificateLightbox
          src={certificate.certificate_image_url as string}
          title={certificate.title}
          issuer={certificate.issuer}
          onClose={() => setLightboxOpen(false)}
        />
      ) : null}
    </article>
  )
}

/**
 * Full-image overlay for a certificate.
 *
 * Separate from the shared `Modal` because that one is sized and padded for a
 * form dialog, and a squeezed certificate image is useless. The focus trap and
 * the Escape-to-close behaviour come from the same hook, so the accessibility
 * contract is identical.
 *
 * Portalled to `<body>` and layered at `z-[80]`, above the sticky header. It
 * used to render in place at `z-50` — the same layer as the header — so a
 * certificate scrolled anywhere other than the top of the list produced a
 * lightbox with the nav bar drawn over it.
 */
function CertificateLightbox({
  src,
  title,
  issuer,
  onClose,
}: {
  src: string
  title: string
  issuer: string
  onClose: () => void
}) {
  // Mounted only while open, so the hook's `active` flag is simply `true`.
  const containerRef = useFocusTrap<HTMLDivElement>(true, onClose, '[data-lightbox-close]')

  if (typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-8">
      <div
        className="animate-fade-in absolute inset-0 bg-[rgb(0_0_0/0.9)] backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${title} certificate issued by ${issuer}`}
        tabIndex={-1}
        className="relative flex max-h-full w-full max-w-4xl animate-fade-in flex-col focus:outline-none"
      >
        <div className="mb-3 flex items-center justify-between gap-4 sm:mb-4">
          <p className="min-w-0 truncate font-mono text-[length:var(--text-meta)] uppercase tracking-[0.14em] text-[rgb(244_244_250/0.7)]">
            <span className="text-white">{title}</span> · {issuer}
          </p>
          <button
            type="button"
            onClick={onClose}
            data-lightbox-close
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 bg-[rgb(0_0_0/0.4)] text-white/80 transition-colors duration-200 hover:border-white/40 hover:bg-white/10 hover:text-white"
            aria-label="Close preview"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/*
          `overscroll-contain` on the scroll container. Without it, scrolling
          past the end of a tall certificate image keeps chaining to the page
          behind, and on a touch device the image appears to be stuck.
        */}
        <div className="relative min-h-0 flex-1 overflow-auto overscroll-contain rounded-[var(--radius-lg)] border border-white/15 bg-[rgb(var(--bg-elevated))]">
          <Image
            src={src}
            alt={`Certificate: ${title}`}
            width={1600}
            height={1100}
            sizes="(min-width: 768px) 48rem, 100vw"
            className="h-auto w-full"
            priority
            quality={90}
          />
        </div>
      </div>
    </div>,
    document.body
  )
}
