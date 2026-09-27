'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ExternalLink, FileBadge, Maximize2, X } from 'lucide-react'
import { classNames, formatMonth, isMonthCurrent } from '@/lib/utils/helpers'
import { useFocusTrap } from '@/lib/hooks/use-focus-trap'
import type { Certificate } from '@/types/certificate'

/**
 * A certificate in the public list.
 *
 * A Client Component because the image opens in a lightbox, which needs state.
 * Everything else is plain markup, so the split is kept to this one card rather
 * than turning the whole page into a client render.
 */
export function CertificateCard({ certificate }: { certificate: Certificate }) {
  const [isLightboxOpen, setLightboxOpen] = useState(false)

  const skills = certificate.skills ?? []
  const hasImage = Boolean(certificate.certificate_image_url)
  const isExpired = !isMonthCurrent(certificate.expiration_date)
  /*
   * A URL that 404s is treated exactly like a missing one. Hiding the broken
   * <img> with inline styles would leave an empty frame that still opened a
   * lightbox pointing at the same dead file, so the failure flips real state
   * and the card falls through to the text-only badge below.
   */
  const [imageFailed, setImageFailed] = useState(false)
  const showsImage = hasImage && !imageFailed

  return (
    <article className="group flex h-full flex-col border border-[rgb(var(--border-subtle))] bg-[rgb(var(--surface))] transition-colors duration-300 hover:border-[rgb(var(--border))]">
      {showsImage ? (
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="relative block aspect-[16/10] w-full cursor-zoom-in overflow-hidden border-b border-[rgb(var(--border-subtle))] bg-[rgb(var(--surface-elevated))]"
        >
          <Image
            src={certificate.certificate_image_url as string}
            alt={`Certificate: ${certificate.title}`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.03]"
            onError={() => setImageFailed(true)}
          />
          <span className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center border border-[rgb(var(--border))] bg-[rgb(var(--surface))] text-[rgb(var(--text-secondary))] opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100">
            <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <span className="sr-only">View a larger image of this certificate</span>
        </button>
      ) : (
        <div className="flex aspect-[16/10] w-full items-center justify-center border-b border-[rgb(var(--border-subtle))] bg-[rgb(var(--surface-elevated))] text-[rgb(var(--text-muted))]">
          <FileBadge className="h-8 w-8" aria-hidden="true" />
        </div>
      )}

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-[rgb(var(--text-muted))]">
            {certificate.issuer}
          </p>
          {certificate.issue_date ? (
            <time
              dateTime={certificate.issue_date}
              className="font-mono text-xs text-[rgb(var(--text-muted))]"
            >
              {formatMonth(certificate.issue_date)}
            </time>
          ) : null}
        </div>

        <h3 className="heading-4 mt-3 text-balance">{certificate.title}</h3>

        {certificate.description ? (
          <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--text-secondary))]">
            {certificate.description}
          </p>
        ) : null}

        {/* Metadata that only exists on some records, so it is listed last. */}
        <dl className="mt-5 space-y-1.5 text-xs">
          {certificate.credential_id ? (
            <div className="flex gap-2">
              <dt className="text-[rgb(var(--text-muted))]">Credential ID</dt>
              <dd className="font-mono text-[rgb(var(--text-secondary))]">
                {certificate.credential_id}
              </dd>
            </div>
          ) : null}
          {certificate.expiration_date ? (
            <div className="flex gap-2">
              <dt className="text-[rgb(var(--text-muted))]">
                {isExpired ? 'Expired' : 'Valid until'}
              </dt>
              <dd
                className={classNames(
                  'font-mono',
                  isExpired
                    ? 'text-[rgb(var(--text-muted))]'
                    : 'text-[rgb(var(--text-secondary))]'
                )}
              >
                {formatMonth(certificate.expiration_date)}
              </dd>
            </div>
          ) : null}
        </dl>

        {skills.length > 0 ? (
          <ul className="mt-5 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <li key={skill} className="badge-secondary">
                {skill}
              </li>
            ))}
          </ul>
        ) : null}

        {/*
          Pushed to the bottom with `mt-auto` so cards of different content
          height still line their actions up across the grid.
        */}
        <div className="mt-auto flex flex-wrap gap-x-6 gap-y-2 pt-6">
          {certificate.credential_url ? (
            <a
              href={certificate.credential_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[rgb(var(--text-secondary))] transition-colors hover:text-[rgb(var(--accent))]"
            >
              Verify
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="sr-only">the {certificate.title} credential (opens in a new tab)</span>
            </a>
          ) : null}
          {hasImage ? (
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="inline-flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[rgb(var(--text-secondary))] transition-colors hover:text-[rgb(var(--accent))]"
            >
              <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
              Preview
            </button>
          ) : null}
        </div>
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
      <div className="fixed inset-0 animate-fade-in bg-black/85" onClick={onClose} aria-hidden="true" />

      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${title} certificate issued by ${issuer}`}
        tabIndex={-1}
        className="relative z-10 flex max-h-full w-full max-w-3xl animate-fade-in flex-col focus:outline-none"
      >
        <div className="mb-3 flex items-center justify-between gap-4">
          <p className="min-w-0 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-white/70">
            <span className="text-white">{title}</span> · {issuer}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center border border-white/25 text-white/80 transition-colors hover:border-white/60 hover:text-white"
            aria-label="Close preview"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="relative min-h-0 flex-1 overflow-auto border border-white/15 bg-[rgb(var(--surface-elevated))]">
          <Image
            src={src}
            alt={`Certificate: ${title}`}
            width={1600}
            height={1100}
            sizes="(min-width: 768px) 48rem, 100vw"
            className="h-auto w-full"
            priority
          />
        </div>
      </div>
    </div>
  )
}
