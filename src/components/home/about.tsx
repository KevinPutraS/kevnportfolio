import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ArrowLink } from '@/components/ui/arrow-link'
import { SectionShell, SectionEyebrow } from '@/components/ui/section-shell'
import { interests, technologies, projectApproach } from '@/config/site'

/**
 * About, as a visual summary rather than an essay.
 *
 * This section used to open with two paragraphs of prose and then repeat the
 * same information again as lists — roughly 250 words on the homepage saying
 * things the hero, the project index and the experience timeline already show.
 * That is the failure mode this replaces: a portfolio should demonstrate, and
 * prose is the weakest possible demonstration of technical work.
 *
 * What is left is only what cannot be seen elsewhere:
 *
 * - what draws me in, as six numbered index columns (the *shape* of the
 *   interests)
 * - what I work with, as grouped chips (the actual tools, no adjectives)
 * - how I work, as four numbered beats (process, which no project reveals)
 *
 * The sentences went; the meaning stayed. Every remaining line is either a
 * label, a proper noun, or a number.
 *
 * The six interest tiles used to be cards — a rounded box, their own background,
 * an icon tile, a lift and a shadow on hover. This version is a column of
 * hairlines: number, title, tagline, in the same index language as the projects
 * page, so the homepage and the archive read as one site.
 */
export function About() {
  return (
    <SectionShell tone="section-tone-experiment" index="02">
      <div className="container-custom">
        <div className="py-16 lg:py-24">
          <SectionEyebrow>What draws me in</SectionEyebrow>

          <ul className="mt-6 grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {interests.map((interest, index) => (
              <li key={interest.title} className="group">
                <div className="border-t border-[rgb(var(--border))] pt-4 transition-colors duration-300 group-hover:border-[rgb(var(--accent)/0.55)]">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-[length:var(--text-body-sm)] font-bold tracking-[-0.01em] text-[rgb(var(--text))]">
                      {interest.title}
                    </h3>
                    <span className="font-mono text-[length:var(--text-meta)] tabular-nums text-[rgb(var(--text-muted))]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[length:var(--text-xs)] leading-relaxed text-[rgb(var(--text-muted))]">
                    {interest.tagline}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-14 grid gap-x-12 gap-y-12 lg:grid-cols-12">
            {/* Toolkit. Full width now that the interest strip has its own row —
                four groups side by side is one band instead of a tall column. */}
            <div className="lg:col-span-12">
              <SectionEyebrow>What I work with</SectionEyebrow>

              <dl className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
                {technologies.map((group) => (
                  <div key={group.group}>
                    <dt className="meta-strong">{group.group}</dt>
                    <dd className="mt-2.5 flex flex-wrap gap-1.5">
                      {group.items.map((item) => (
                        <span
                          key={item}
                          className="border border-[rgb(var(--border))] px-2.5 py-1 font-mono text-[length:var(--text-xs)] text-[rgb(var(--text-dim))]"
                        >
                          {item}
                        </span>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-8">
                <ArrowLink href="/about">More about me</ArrowLink>
              </div>
            </div>
          </div>

          {/* How I work. Four beats, numbered. */}
          <div className="mt-16 border-t border-[rgb(var(--border))] pt-10">
            <div className="flex flex-wrap items-baseline justify-between gap-6">
              <h2 className="font-display text-xl font-bold tracking-[-0.025em] text-[rgb(var(--text))]">
                How I work
              </h2>
              <Link
                href="/projects"
                className="group inline-flex items-center gap-1.5 text-[length:var(--text-sm)] font-semibold text-[rgb(var(--text))] transition-colors hover:text-[rgb(var(--accent))]"
              >
                See it applied
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>

            <ol className="mt-6 grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
              {projectApproach.map((item, index) => (
                <li key={item.title}>
                  <div className="border-t border-[rgb(var(--border))] pt-4">
                    <span className="font-mono text-[length:var(--text-meta)] tabular-nums text-[rgb(var(--accent))]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <p className="mt-3 font-display text-[length:var(--text-sm)] font-bold tracking-[-0.01em] text-[rgb(var(--text))]">
                      {item.title}
                    </p>
                    <p className="mt-1 text-[length:var(--text-xs)] leading-relaxed text-[rgb(var(--text-muted))]">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </SectionShell>
  )
}