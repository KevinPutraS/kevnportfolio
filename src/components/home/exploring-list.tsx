import { currentlyExploring } from '@/config/site'

/**
 * The current-focus list, shared by the homepage and /about.
 *
 * Rendered as a table of hairlines rather than cards: the number, the topic and
 * a hover marker. Items are not links — they are topics, so anything that looks
 * clickable would be misleading.
 */
export function ExploringList({ className }: { className?: string }) {
  return (
    <ul className={className}>
      {currentlyExploring.map((item, index) => (
        <li key={item}>
          <div className="group flex items-center gap-4 border-t border-[rgb(var(--border-subtle))] py-4 last:border-b sm:gap-6 sm:py-5">
            <span className="index-marker transition-colors duration-150 group-hover:text-[rgb(var(--accent))]">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="flex-1 font-display text-lg font-medium tracking-[-0.02em] text-[rgb(var(--text-primary))] sm:text-xl">
              {item}
            </span>
            <span
              aria-hidden="true"
              className="hidden shrink-0 -translate-x-1 text-[rgb(var(--accent))] opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100 sm:block"
            >
              &rarr;
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}
