import { ArrowUpRight } from 'lucide-react'
import { currentlyExploring } from '@/config/site'

/** Short, honest snapshot of current rabbit holes. No dates, no commitments. */
export function CurrentlyExploring() {
  return (
    <section className="section border-t border-[rgb(var(--border-subtle))]">
      <div className="container-custom">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow">Right now</p>
            <h2 className="heading-2 mt-4 text-balance">Currently exploring</h2>
            <p className="mt-6 max-w-sm text-[rgb(var(--text-secondary))]">
              A snapshot of the current rabbit holes. It changes whenever something else gets
              interesting.
            </p>
          </div>

          <ul className="lg:col-span-8">
            {currentlyExploring.map((item, index) => (
              <li
                key={item}
                className="group flex items-center gap-4 border-t border-[rgb(var(--border-subtle))] py-4 last:border-b sm:py-5"
              >
                <span className="font-mono text-[0.6875rem] text-[rgb(var(--text-muted))]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="flex-1 font-display text-lg font-medium tracking-tight transition-colors group-hover:text-[rgb(var(--accent))] sm:text-xl">
                  {item}
                </span>
                <ArrowUpRight
                  className="h-4 w-4 shrink-0 text-[rgb(var(--text-muted))] opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden="true"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
