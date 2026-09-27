import { interests } from '@/config/site'
import { ArrowLink } from '@/components/ui/arrow-link'

/**
 * Areas of interest.
 *
 * Framed as exploration, not expertise: no proficiency bars, no years, no
 * claims of specialisation.
 *
 * Typographic rather than an icon grid. A grid of bordered tiles with a coloured
 * icon in each corner is the most recognisable "skills section" layout, and it
 * competes with the projects above it. Numbers, hairlines and a wide measure do
 * the same job quietly, and the fifth item deliberately breaks the two-column
 * rhythm so the block does not read as a table.
 */
export function Interests() {
  return (
    <section className="rhythm-xl rule-top">
      <div className="container-custom">
        <div className="grid gap-x-10 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <p className="eyebrow">What draws me in</p>
          </div>

          <div className="lg:col-span-9">
            <h2 className="heading-2 max-w-[20ch] text-balance">
              No single lane. Just things worth a long look.
            </h2>

            <ul className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2">
              {interests.map((interest, index) => (
                <li
                  key={interest.title}
                  className={index === interests.length - 1 ? 'sm:col-span-2' : undefined}
                >
                  {/*
                    No index numerals. These five areas are parallel curiosities,
                    not a sequence, so "03" implied an order and a depth ranking
                    that does not exist. The hairline is enough to separate them.
                  */}
                  <h3 className="border-t border-[rgb(var(--border-subtle))] pt-4 font-display text-lg font-semibold tracking-[-0.02em] text-[rgb(var(--text-primary))]">
                    {interest.title}
                  </h3>
                  <p className="mt-3 text-pretty text-[rgb(var(--text-secondary))]">
                    {interest.description}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-12 border-t border-[rgb(var(--border-subtle))] pt-8">
              <ArrowLink href="/about">How I work</ArrowLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
