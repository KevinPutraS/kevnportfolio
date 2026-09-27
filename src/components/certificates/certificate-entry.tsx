'use client'

import { useState } from 'react'
import Image from 'next/image'
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

  const skills = certificate.skills ?? []
  const hasImage = Boolean(certificate.certificate_image_url)
  const isExpired = !isMonthCurrent(certificate.expiration_date)
  /*
   * A URL that 404s is treated exactly like a missing one. Hiding the broken
   * <img> with inline styles would leave an empty frame that still opened a
   * lightbox pointing at the same dead file, so the failure flips real state
   * and the row falls through to the placeholder icon.
   */
  const [imageFailed, setImageFailed] = useState(false)
  const showsImage = hasImage && !imageFailed

  return (
    <article className="group relative grid gap-6 border-t border-[rgb(var(--border-subtle))] py-9 md:grid-cols-12 md:gap-8">
      {showsImage ? (
        <div className="md:col-span-3 lg:col-span-2">
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="group/thumb relative block aspect-[4/3] w-full overflow-hidden rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--surface-elevated))] transition-all duration-300 hover:border-[rgb(var(--accent))]/50 hover:shadow-lg hover:shadow-[rgb(var(--accent))]/10"
          >
            <Image
              src={certificate.certificate_image_url as string}
              alt={`Certificate: ${certificate.title}`}
              fill
              sizes="(min-width: 768px) 18rem, 60vw"
              className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover/thumb:scale-[1.03]"
              onError={() => setImageFailed(true)}
            
            quality={90}/>
            {/* Gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--background))]/60 via-transparent to-transparent pointer-events-none" />
            {/* Always visible zoom indicator */}
            <span className="absolute bottom-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[rgb(var(--surface))]/90 backdrop-blur-sm border border-[rgb(var(--border-subtle))] text-[rgb(var(--text-secondary))] transition-all duration-200 group-hover/thumb:bg-[rgb(var(--accent))] group-hover/thumb:border-[rgb(var(--accent))] group-hover/thumb:text-[rgb(var(--accent-contrast))]">
              <Maximize2 className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="sr-only">Open a larger image of this certificate</span>
          </button>
        </div>
      ) : (
        <div className="hidden md:col-span-3 lg:col-span-2">
          <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--surface))] text-[rgb(var(--text-muted))]">
            <FileBadge className="h-10 w-10" aria-hidden="true" />
          </div>
        </div>
      )}

      <div className={classNames(showsImage ? 'md:col-span-9 lg:col-span-10' : 'md:col-span-12')}>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1.5">
          <p className="meta-strong text-[rgb(var(--text-primary))]">{certificate.issuer}</p>
          {certificate.issue_date ? (
            <time dateTime={certificate.issue_date} className="meta tabular-nums text-[rgb(var(--text-secondary))]">
              {formatMonth(certificate.issue_date)}
            </time>
          ) : null}
          {isExpired ? (
            <span className="badge-error">Expired</span>
          ) : certificate.expiration_date ? (
            <span className="badge-success">Valid until {formatMonth(certificate.expiration_date)}</span>
          ) : null}
        </div>

        <h3 className="heading-3 mt-3 text-balance text-[rgb(var(--text-primary))]">{certificate.title}</h3>

        {certificate.description ? (
          <p className="mt-3 max-w-prose text-pretty text-[length:var(--text-body-sm)] leading-relaxed text-[rgb(var(--text-secondary))]">
            {certificate.description}
          </p>
        ) : null}

        {/* Metadata that only exists on some records, so it is listed last. */}
        {(certificate.credential_id || certificate.expiration_date) && (
          <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-1.5">
            {certificate.credential_id ? (
              <div className="flex gap-2">
                <dt className="meta text-[rgb(var(--text-muted))]">Credential ID</dt>
                <dd className="tech-list tabular-nums text-[rgb(var(--text-secondary))]">{certificate.credential_id}</dd>
              </div>
            ) : null}
            {certificate.expiration_date ? (
              <div className="flex gap-2">
                <dt className="meta text-[rgb(var(--text-muted))]">{isExpired ? 'Expired' : 'Valid until'}</dt>
                <dd className="tech-list tabular-nums text-[rgb(var(--text-secondary))]">
                  {formatMonth(certificate.expiration_date)}
                </dd>
              </div>
            ) : null}
          </dl>
        )}

        {skills.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5" role="list" aria-label="Topics covered">
            <span className="sr-only">Topics covered: </span>
            {skills.map((skill, i) => (
              <span
                key={skill}
                className="badge-neutral"
                role="listitem"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {/*
          Actions, always visible and always labelled. Each is rendered only when
          the underlying data exists, so the row never offers a dead end.
        */}
        {(certificate.credential_url || showsImage) && (
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 pt-5 border-t border-[rgb(var(--border-subtle))]">
            {showsImage ? (
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="group inline-flex min-h-11 items-center gap-2 text-[length:var(--text-body-sm)] font-medium text-[rgb(var(--text-primary))] transition-colors duration-150"
              >
                <span className="relative">
                  View certificate
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-0.5 left-0 h-px w-full bg-[rgb(var(--border))] transition-colors duration-150 group-hover:bg-[rgb(var(--accent))]"
                  />
                </span>
                <Maximize2
                  className="h-4 w-4 shrink-0 text-[rgb(var(--text-muted))] transition-colors duration-150 group-hover:text-[rgb(var(--accent))]"
                  aria-hidden="true"
                />
              </button>
            ) : null}

            {certificate.credential_url ? (
              <a
                href={certificate.credential_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex min-h-11 items-center gap-2 text-[length:var(--text-body-sm)] font-medium text-[rgb(var(--text-primary))] transition-colors duration-150"
              >
                <span className="relative">
                  Verify credential
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-0.5 left-0 h-px w-full bg-[rgb(var(--border))] transition-colors duration-150 group-hover:bg-[rgb(var(--accent))]"
                  />
                </span>
                <ExternalLink
                  className="h-4 w-4 shrink-0 text-[rgb(var(--text-muted))] transition-colors duration-150 group-hover:text-[rgb(var(--accent))]"
                  aria-hidden="true"
                />
                <span className="sr-only">
                  the {certificate.title} credential (opens in a new tab)
                </span>
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
 * the Escape-to-close behaviour come from the same hooks, so the accessibility
 * contract is identical.
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
  const containerRef = useFocusTrap<HTMLDivElement>(true, onClose)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
      <div className="fixed inset-0 animate-fade-in bg-black/90" onClick={onClose} aria-hidden="true" />

      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${title} certificate issued by ${issuer}`}
        tabIndex={-1}
        className="relative z-10 flex max-h-full w-full max-w-4xl animate-fade-in flex-col focus:outline-none"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="min-w-0 font-mono text-[length:var(--text-meta)] uppercase tracking-[0.14em] text-white/70">
            <span className="text-white">{title}</span> · {issuer}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 text-white/80 transition-all duration-200 hover:border-white/40 hover:text-white hover:bg-white/5"
            aria-label="Close preview"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="relative min-h-0 flex-1 overflow-auto rounded-xl border border-white/15 bg-[rgb(var(--surface-elevated))]">
          <Image
            src={src}
            alt={`Certificate: ${title}`}
            width={1600}
            height={1100}
            sizes="(min-width: 768px) 48rem, 100vw"
            className="h-auto w-full"
            priority
          
            quality={90}/>
        </div>
      </div>
    </div>
  )
}
