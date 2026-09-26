import { ExploringList } from '@/components/home/exploring-list'

/**
 * Live snapshot of current rabbit holes — no dates, no commitments.
 *
 * Intentionally the quietest block on the page (`rhythm-md`): it sits between
 * the two loud sections so the page breathes. The list itself is shared with
 * /about so the two pages can never show different topics.
 */
export function CurrentlyExploring() {
  return (
    <section className="rhythm-md rule-top">
      <div className="container-custom">
        <div className="grid gap-x-10 gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <p className="eyebrow">Right now</p>
            <p className="mt-4 max-w-xs text-pretty text-sm text-[rgb(var(--text-muted))]">
              It changes whenever something else gets interesting.
            </p>
          </div>

          <div className="lg:col-span-9">
            <h2 className="heading-3 text-balance">Currently exploring</h2>
            <ExploringList className="mt-8" />
          </div>
        </div>
      </div>
    </section>
  )
}
