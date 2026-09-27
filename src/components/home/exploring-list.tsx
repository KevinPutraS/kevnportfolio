import { ArrowUpRight } from 'lucide-react'
import { classNames } from '@/lib/utils/helpers'
import { currentlyExploring } from '@/config/site'

/**
 * The list of things currently being explored.
 *
 * A running line rather than cards. "In progress" should read as continuous, and
 * a grid of boxes turns a loose set of interests into a syllabus.
 *
 * Previously this had a hover arrow, which implied the rows were links. They are
 * not — there is no per-item URL — so an arrow was a promise the component could
 * not keep. Plain text instead.
 */
export function ExploringList({ className }: { className?: string }) {
  return (
    <ul className={classNames('flex flex-wrap gap-2.5', className)} role="list">
      {currentlyExploring.map((item) => (
        <li
          key={item}
          className="inline-flex items-center rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] px-4 py-2 text-[length:var(--text-sm)] text-[rgb(var(--text-dim))]"
        >
          {item}
        </li>
      ))}
    </ul>
  )
}

/** With per-item links, for a section that knows the destinations. */
export function ExploringLinks({
  items,
  className,
}: {
  items: ReadonlyArray<{ label: string; href: string }>
  className?: string
}) {
  return (
    <ul className={classNames('space-y-1', className)} role="list">
      {items.map((item) => (
        <li key={item.href}>
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex min-h-11 items-center gap-2 text-[length:var(--text-sm)] font-medium text-[rgb(var(--text))] transition-colors hover:text-[rgb(var(--accent))]"
          >
            {item.label}
            <ArrowUpRight
              className="h-3.5 w-3.5 shrink-0 text-[rgb(var(--text-muted))] transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[rgb(var(--accent))]"
              aria-hidden="true"
            />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  )
}
