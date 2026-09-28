'use client'

import { useId, useState } from 'react'
import Image from 'next/image'
import { createPortal } from 'react-dom'
import { ChevronDown, ExternalLink, FileBadge, Maximize2, X } from 'lucide-react'
import { classNames, formatMonth, isMonthCurrent } from '@/lib/utils/helpers'
import { useFocusTrap } from '@/lib/hooks/use-focus-trap'
import type { Certificate } from '@/types/certificate'

/** Topics shown in the collapsed row before the rest move behind the toggle. */
const COLLAPSED_SKILL_COUNT = 3

/**
 * One certificate, as a compact row that expands in place.
 *
 * The row used to render everything at once: a 4:3 scan, the issuer, the date,
 * the title, a description, a credential ID, an expiry, a row of topic badges
 * and two buttons — around 280px of vertical space per certificate. Twelve of
 * them is a page nobody scrolls to the end of, and the reason was never
 * information: the issuer, the date and the title are what a visitor is
 * scanning for, and they take 100px.
 *
 * So the row now shows the identity of the credential and stops. The
 * description, the credential ID and the actions live behind a disclosure, and
 * a certificate with nothing extra to reveal does not get a toggle at all —
 * there is no button that opens nothing.
 *
 * The collapsed state is a conditional render rather than a collapsed box with
 * zero height. A zero-height `overflow-hidden` wrapper leaves its links in the
 * accessibility tree and in the tab order while looking absent, so an invisible
 * "Verify" link would still be reachable; not rendering the panel removes the
 * problem instead of hiding it.
 *
 * A Client Component for the disclosure and the lightbox, both of which need
 * state.
 */
export function CertificateEntry({ certificate }: { certificate: Certificate }) {
  const [isExpanded, setExpanded] = useState(false)
  const [isLightboxOpen, setLightboxOpen] = useState(false)
  /*
   * A URL that 404s is treated exactly like a missing one. Hiding the broken
   * <img> with inline styles would leave an empty frame that still opened a
   * lightbox pointing at the same dead file, so the failure flips real state
   * and the row falls through to the placeholder icon.
   */
  const [imageFailed, setImageFailed] = useState(false)
  const panelId = useId()

  const skills = certificate.skills ?? []
  const hasImage = Boolean(certificate.certificate_image_url)
  const isExpired = !isMonthCurrent(certificate.expiration_date)
  const showsImage = hasImage && !imageFailed
  const isActive = Boolean(certificate.credential_url) || showsImage

  /*
   * The toggle is rendered only when the collapsed row is genuinely hiding
   * something. `isActive` is in that list because it decides where the two
   * actions live: if a credential URL were the only hidden content and the row
   * offered no toggle, "Verify" would become unreachable.
   */
  const hasDetails = Boolean(
    certificate.description ||
      certificate.credential_id ||
      skills.length > COLLAPSED_SKILL_COUNT ||
      isActive
  )
  const collapsedSkills = skills.slice(0, COLLAPSED_SKILL_COUNT)
  const hiddenSkillCount = skills.length - collapsedSkills.length

  return (
    <article className="group relative border-t border-[rgb(var(--border))]">
      <div className="grid grid-cols-1 items-start gap-x-5 gap-y-4 py-5 sm:grid-cols-[auto_1fr_auto] sm:py-6">
        {/*
          The scan is a column from `sm` and a lead-in block above the text
          below it, sized to a thumbnail rather than a screenshot. Below `sm` it
          is moved up with `order-first` on the wrapper instead, so a phone shows
          the title the visitor came for and the image as supporting evidence —
          the reverse order would put a 4:3 scan above the certificate's name.
        */}
        <div className={classNames('w-20 shrink-0 sm:w-24', showsImage ? 'order-first' : 'hidden')}>
          {showsImage ? (
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="group/thumb relative block aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-md)] border border-[rgb(var(--border))] bg-[rgb(var(--bg-highlight))] transition-colors duration-300 hover:border-[rgb(var(--accent)/0.5)]"
            >
              <Image
                src={certificate.certificate_image_url as string}
                alt={`Certificate: ${certificate.title}`}
                fill
                sizes="6rem"
                className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover/thumb:scale-[1.04]"
                onError={() => setImageFailed(true)}
                quality={90}
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--bg)/0.55)] to-transparent"
              />
              <span className="absolute bottom-1.5 right-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[rgb(var(--border-strong))] bg-[rgb(var(--surface)/0.85)] text-[rgb(var(--text-dim))] backdrop-blur-sm transition-colors duration-200 group-hover/thumb:border-[rgb(var(--accent))] group-hover/thumb:bg-[rgb(var(--accent))] group-hover/thumb:text-[rgb(var(--accent-contrast))]">
                <Maximize2 className="h-3 w-3" aria-hidden="true" />
              </span>
              <span className="sr-only">Open a larger image of this certificate</span>
            </button>
          ) : (
            <div className="hidden aspect-[4/3] w-full items-center justify-center rounded-[var(--radius-md)] border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-muted))] sm:flex">
              <FileBadge className="h-6 w-6" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="min-w-0">
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

          <h3 className="heading-3 mt-2 text-balance">{certificate.title}</h3>

          {collapsedSkills.length > 0 && (
            <p className="tech-list mt-2">
              <span className="sr-only">Topics covered: </span>
              {collapsedSkills.join(' · ')}
              {hiddenSkillCount > 0 && <span> · +{hiddenSkillCount}</span>}
            </p>
          )}
        </div>

        {/*
          Only rendered when the row is genuinely hiding something. On a phone it
          falls below the text and aligns right; from `sm` it becomes a third
          column, bottom-aligned with the topics line.
        */}
        {hasDetails ? (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={isExpanded}
            aria-controls={panelId}
            className="inline-flex min-h-9 shrink-0 items-center gap-1 justify-self-end self-end text-[length:var(--text-sm)] font-medium text-[rgb(var(--text-dim))] transition-colors duration-200 hover:text-[rgb(var(--accent))] sm:col-start-3 sm:row-start-1"
          >
            {isExpanded ? 'Less' : 'Details'}
            <ChevronDown
              className={classNames(
                'h-4 w-4 transition-transform duration-200',
                isExpanded && 'rotate-180'
              )}
              aria-hidden="true"
            />
            <span className="sr-only"> about the {certificate.title} certificate</span>
          </button>
        ) : null}
      </div>

      {isExpanded && hasDetails && (
        <div id={panelId} className="animate-fade-in pb-6 sm:pl-[7.25rem]">
          {certificate.description ? (
            <p className="max-w-prose text-pretty text-[length:var(--text-body-sm)] leading-relaxed text-[rgb(var(--text-dim))]">
              {certificate.description}
            </p>
          ) : null}

          {/*
            Metadata that only exists on some records. The expiry is not repeated
            here when it is already in the header line above.
          */}
          {(certificate.credential_id || (certificate.expiration_date && isExpired)) && (
            <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-1.5">
              {certificate.credential_id ? (
                <div className="flex gap-2">
                  <dt className="meta">Credential ID</dt>
                  <dd className="tech-list tabular-nums text-[rgb(var(--text-dim))]">{certificate.credential_id}</dd>
                </div>
              ) : null}
              {certificate.expiration_date && isExpired ? (
                <div className="flex gap-2">
                  <dt className="meta">Expired</dt>
                  <dd className="tech-list tabular-nums text-[rgb(var(--text-dim))]">
                    {formatMonth(certificate.expiration_date)}
                  </dd>
                </div>
              ) : null}
            </dl>
          )}

          {hiddenSkillCount > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5" role="list" aria-label="Topics covered">
              {skills.map((skill) => (
                <span key={skill} className="badge-neutral" role="listitem">
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/*
            Actions, always visible and always labelled, and only rendered when
            the underlying data exists so the row never offers a dead end.
          */}
          {isActive && (
            <div className="mt-5 flex flex-wrap items-center gap-2.5 border-t border-[rgb(var(--border))] pt-5">
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
      )}

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
