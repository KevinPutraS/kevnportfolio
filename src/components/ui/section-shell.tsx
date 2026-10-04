import { classNames } from '@/lib/utils/helpers'

/**
 * Section opening.
 *
 * One component so the five homepage sections cannot drift apart. It carries the
 * three signals that make a section feel like a distinct room rather than
 * another grey band: a coloured hairline that fades to the right, a tinted
 * background wash, and an eyebrow in the section's own hue.
 *
 * The parent supplies the tone with `section-tone-*`; everything else is here.
 */
export function SectionShell({
  tone,
  className,
  children,
}: {
  /** A `section-tone-*` class, e.g. `section-tone-web`. */
  tone: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <section className={classNames('relative isolate', tone, className)}>
      {/* Hairline first, so it sits above the wash and reads as a top edge. */}
      <div aria-hidden="true" className="section-rule w-full" />
      <div aria-hidden="true" className="section-wash absolute inset-0 -z-10" />
      {children}
    </section>
  )
}

/** Eyebrow with the section's colour chip in front of it. */
export function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <p className="section-eyebrow">{children}</p>
}

/** Eyebrow on the left, action on the right. Collapses to a stack on mobile. */
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
    <div className={classNames('flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8', className)}>
      <div className="min-w-0">
        <SectionEyebrow>{eyebrow}</SectionEyebrow>
        <h2 className="heading-2 mt-5 max-w-2xl text-balance">{title}</h2>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
