import { classNames } from '@/lib/utils/helpers'

/**
 * Section opening.
 *
 * One component so the sections across the site cannot drift apart. It carries the
 * two signals that mark a distinct part of the page: a hairline aligned to the
 * text column, and — where a section is given an `index` — that section's number
 * hanging in the left margin.
 *
 * Both are borrowings from print. The previous version drew a 2px accent gradient
 * bar across the full viewport width on an accent-tinted wash, and applied it to
 * every section on the site; that is what made the pages read as a stack of
 * panels rather than as one continuous document.
 *
 * The parent supplies the tone with `section-tone-*`; everything else is here.
 */
export function SectionShell({
  tone,
  index,
  className,
  children,
}: {
  /** A `section-tone-*` class, e.g. `section-tone-web`. */
  tone: string
  /**
   * Zero-padded position in the page's running order, e.g. `"02"`. Rendered
   * `aria-hidden`: it is print wayfinding, and announcing a bare number ahead of
   * the section's real content is noise rather than navigation.
   */
  index?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <section className={classNames('relative isolate', tone, className)}>
      <div className="container-custom">
        <div aria-hidden="true" className="section-break">
          {index ? <span className="section-index">{index}</span> : null}
          <span className="section-rule grow" />
        </div>
      </div>
      {children}
    </section>
  )
}

/** Eyebrow for the section's kind — mono, uppercase, preceded by a short tick. */
export function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <p className="section-eyebrow">{children}</p>
}

/**
 * Eyebrow and title on the left, action on the right.
 *
 * The title is capped at `--measure-prose` rather than at a fixed `max-w-2xl`: a
 * display heading set across the full 72rem trim wraps into three or four words
 * per line at the top of the scale, and a heading that measures that wide stops
 * being scannable.
 */
export function SectionHeader({
  eyebrow,
  title,
  action,
  className,
}: {
  eyebrow: string
  title: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={classNames(
        'flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8',
        className
      )}
    >
      <div className="min-w-0">
        <SectionEyebrow>{eyebrow}</SectionEyebrow>
        <h2 className="heading-2 mt-5 max-w-[24ch] text-balance">{title}</h2>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
