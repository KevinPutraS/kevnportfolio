import { currentlyExploring } from '@/config/site'

/**
 * The current-focus list, shared by the homepage and /about.
 *
 * Rendered as a plain list of topics with no interaction whatsoever.
 *
 * The previous version did the opposite of what its own comment said: it drew a
 * slide-in arrow on hover and turned the number to the accent colour, so every
 * item looked like a link. None of them are links — they are topics — so a
 * visitor would hover, see the affordance, click, and nothing would happen.
 * That is worse than no affordance at all, and it also spent the accent colour,
 * which this site reserves for things that mean something, on decoration.
 *
 * The list is therefore inert: no cursor change, no hover state, no arrow. The
 * hierarchy comes from the type and the hairlines.
 */
export function ExploringList({ className }: { className?: string }) {
  return (
    <ul className={className}>
      {currentlyExploring.map((item) => (
        <li
          key={item}
          className="flex items-baseline gap-4 border-t border-[rgb(var(--border-subtle))] py-4 last:border-b sm:gap-6 sm:py-5"
        >
          <span
            aria-hidden="true"
            className="mt-2.5 h-px w-4 shrink-0 bg-[rgb(var(--border))]"
          />
          <span className="font-display text-lg font-medium tracking-[-0.02em] text-[rgb(var(--text-primary))] sm:text-xl">
            {item}
          </span>
        </li>
      ))}
    </ul>
  )
}
