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
 *
 * This lived in `components/home/` while being used by exactly one page, the
 * about page; the homepage shows the same interests as three chips inside the
 * hero, which is a different component for a different job. It is here now so
 * the folder it sits in is the one that imports it.
 */
export function ExploringList({ className }: { className?: string }) {
  return (
    <ul className={classNames('flex flex-wrap gap-2.5', className)} role="list">
      {currentlyExploring.map((item) => (
        // A hairline pill, flat — the raised chip background was the last echo
        // of the old card system.
        <li
          key={item}
          className="inline-flex items-center rounded-full border border-[rgb(var(--border))] px-4 py-2 font-mono text-[length:var(--text-xs)] uppercase tracking-[0.08em] text-[rgb(var(--text-dim))]"
        >
          {item}
        </li>
      ))}
    </ul>
  )
}
