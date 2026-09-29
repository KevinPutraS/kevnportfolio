'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Image from 'next/image'
import { createPortal } from 'react-dom'
import { ChevronDown, ExternalLink, FileBadge, Maximize2, X } from 'lucide-react'
import { classNames, formatMonth, isMonthCurrent } from '@/lib/utils/helpers'
import { useFocusTrap } from '@/lib/hooks/use-focus-trap'
import type { Certificate } from '@/types/certificate'

/** Lines of description shown before the row offers to expand it. */
const CLAMPED_LINES = 3

/**
 * One certificate, as a row in a list rather than a card in a grid.
 *
 * The scan is a small box, not a screenshot that owns the row. A certificate
 * page is read as a list of credentials, and at 4:3 full width the page became
 * a stack of scans with the issuer, the date and the title — the parts a visitor
 * actually scans for — pushed underneath each one. A fixed small thumbnail keeps
 * the text as the subject and leaves the document one tap away.
 *
 * The disclosure is scoped to the description and nothing else. The earlier
 * version hid the credential ID, the topics and the two actions behind one
 * toggle, which turned a certificate into a locked box: the visitor who came to
 * check a credential ID had to open a panel to read a single line, and a
 * certificate with no description got a button labelled "Details" that opened
 * nothing but metadata. Only the description is long enough to need a
 * disclosure, so only the description goes behind one, and the toggle is
 * rendered only when the text is genuinely clipped.
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
  /* Whether the clamped description is really hiding text, or merely close to
   * the limit. Measured rather than guessed — see the effect below. */
  const [isDescriptionClipped, setDescriptionClipped] = useState(false)

  const descriptionRef = useRef<HTMLParagraphElement>(null)
  const descriptionId = useId()

  const skills = certificate.skills ?? []
  const hasImage = Boolean(certificate.certificate_image_url)
  const isExpired = !isMonthCurrent(certificate.expiration_date)
  const showsImage = hasImage && !imageFailed

  /*
   * "Too long to show" is a layout fact, not a character count. The same 260
   * characters clear three lines on a laptop and clip on a phone, so a
   * threshold would show a toggle for text that fits on half the viewports and
   * hide one for text that does not fit on the other half. Instead the clamped
   * paragraph is measured: `scrollHeight` is the whole text, `clientHeight` the
   * lines actually visible, and the answer is only true when the former exceeds
   * the latter.
   *
   * A `ResizeObserver` re-checks because width is the only thing that changes
   * the answer after the first paint — a viewport resize, a rotation, a webfont
   * swapping in. The early return while expanded is deliberate: with the clamp
   * released there is nothing left to measure, and the last result has to
   * persist so the collapsed control stays on screen to close it again.
   *
   * `useEffect` rather than `useLayoutEffect`, so the server and the first
   * client render agree. The cost is that the toggle appears one frame after
   * the clamped text, which shifts the block below it very slightly; the
   * alternative is a hydration warning on every certificate on the page.
   */
  useEffect(() => {
    const element = descriptionRef.current
    if (!element || isExpanded) return

    const measure = () => {
      setDescriptionClipped(element.scrollHeight > element.clientHeight + 1)
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [isExpanded, certificate.description])

  return (
    <article className="flex flex-col gap-4 border-t border-[rgb(var(--border))] py-6 sm:flex-row sm:gap-6 sm:py-7">
      {/*
        The thumbnail is a lead-in block on a phone and a narrow column from
        `sm`. Below `sm` it is moved to the top with `order-first` on the
        wrapper instead, so a phone leads with the document the way a directory
        does — but at 80px it costs two lines, not the 180px a full-width scan
        would have taken.
      */}
      {showsImage ? (
        <div className="order-first w-20 shrink-0 sm:w-24">
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
              className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover/thumb:scale-[1.05]"
              onError={() => setImageFailed(true)}
              quality={90}
            />
            {/* Fade so the zoom chip stays readable over a light scan. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgb(var(--bg)/0.55)] to-transparent"
            />
            <span className="absolute bottom-1.5 right-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[rgb(var(--border-strong))] bg-[rgb(var(--surface)/0.85)] text-[rgb(var(--text-dim))] backdrop-blur-sm transition-colors duration-200 group-hover/thumb:border-[rgb(var(--accent))] group-hover/thumb:bg-[rgb(var(--accent))] group-hover/thumb:text-[rgb(var(--accent-contrast))]">
              <Maximize2 className="h-3 w-3" aria-hidden="true" />
            </span>
            <span className="sr-only">Open a larger image of this certificate</span>
          </button>
        </div>
      ) : null}

      <div className="min-w-0 flex-1">
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

        <h3 className="heading-3 mt-2.5 text-balance">{certificate.title}</h3>

        {/* Topics, always visible: short, and they say what the course covered. */}
        {skills.length > 0 && (
          <p className="tech-list mt-2.5">
            <span className="sr-only">Topics covered: </span>
            {skills.join(' · ')}
          </p>
        )}

        {/*
          The only thing behind a toggle. The clamp is released when expanded, so
          the same element is measured in its collapsed state and shown in full
          in its expanded one rather than being rendered twice and swapped.
        */}
        {certificate.description ? (
          <>
            <p
              id={descriptionId}
              ref={descriptionRef}
              className={classNames(
                'mt-3 max-w-prose text-pretty text-[length:var(--text-body-sm)] leading-relaxed text-[rgb(var(--text-dim))]',
                !isExpanded && 'line-clamp-3'
              )}
            >
              {certificate.description}
            </p>

            {isDescriptionClipped && (
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                aria-expanded={isExpanded}
                aria-controls={descriptionId}
                className="-ml-2 mt-1.5 inline-flex min-h-9 items-center gap-1 rounded-[var(--radius-sm)] px-2 text-[length:var(--text-sm)] font-medium text-[rgb(var(--text-dim))] transition-colors duration-200 hover:text-[rgb(var(--accent))]"
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
            )}
          </>
        ) : null}

        {/*
          Metadata that only exists on some records. Left in the open row: it is
          one line, it is the fastest way to check a credential, and putting it
          behind a toggle would cost a tap to read a value that fits on screen.
        */}
        {certificate.credential_id ? (
          <dl className="mt-4">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <dt className="meta">Credential ID</dt>
              <dd className="tech-list break-all tabular-nums text-[rgb(var(--text-dim))]">
                {certificate.credential_id}
              </dd>
            </div>
          </dl>
        ) : null}

        {/*
          Actions, always visible and always labelled, and only rendered when
          the underlying data exists so the row never offers a dead end. Buttons
          and links with real icons rather than underlined text: an underline is
          not a reliable affordance on a touch screen.
        */}
        {(certificate.credential_url || showsImage) && (
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            {showsImage ? (
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="btn btn-secondary btn-sm"
              >
                <Maximize2 className="h-4 w-4" aria-hidden="true" />
                View
                <span className="sr-only"> a larger image of the {certificate.title} certificate</span>
              </button>
            ) : null}

            {certificate.credential_url ? (
              <a
                href={certificate.credential_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Verify
                <span className="sr-only">
                  {' '}
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
