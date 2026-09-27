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
 * things the hero, the project cards and the experience timeline already show.
 * That is the failure mode this replaces: a portfolio should demonstrate, and
 * prose is the weakest possible demonstration of technical work.
 *
 * What is left is only what cannot be seen elsewhere:
 *
 * - what draws me in, as six icon tiles (the *shape* of the interests)
 * - what I work with, as grouped chips (the actual tools, no adjectives)
 * - how I work, as four numbered beats (process, which no project reveals)
 *
 * The sentences went; the meaning stayed. Every remaining line is either a
 * label, a proper noun, or a number.
 */
const interestTone = [
  'cat-web',
  'cat-app',
  'cat-design',
  'cat-networking',
  'cat-experiment',
  'cat-school',
] as const

export function About() {
  return (
    <SectionShell tone="section-tone-experiment">
      <div className="container-custom">
        <div className="py-16 lg:py-24">
          {/*
            What draws me in.

            Two attempts bracketed this. Six tiles in a two-column grid ran to
            three rows and pushed everything below it off the first screen. The
            fix over-corrected: a single six-across strip with the tagline
            dropped was so terse it said nothing beyond the labels.

            Three columns is the middle. Two rows instead of three, and — the
            part that actually matters — each tile is wide enough for its tagline
            to sit on one or two lines instead of wrapping into a paragraph, so
            the copy earns its space rather than inflating it.
          */}
          <SectionEyebrow>What draws me in</SectionEyebrow>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {interests.map((interest, index) => (
              <li key={interest.title} className={interestTone[index % interestTone.length]}>
                <div className="group flex h-full items-start gap-3.5 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] p-4 transition-[transform,border-color,background-color] duration-300 hover:-translate-y-1 hover:border-[rgb(var(--cat)/0.5)] hover:bg-[rgb(var(--cat)/0.07)]">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[rgb(var(--cat)/0.35)] bg-[rgb(var(--cat)/0.14)] text-[rgb(var(--cat))] transition-transform duration-300 group-hover:scale-110">
                    <InterestIcon name={interest.title} />
                  </span>

                  <div className="min-w-0">
                    <h3 className="font-display text-[length:var(--text-sm)] font-bold tracking-[-0.01em] text-[rgb(var(--text))]">
                      {interest.title}
                    </h3>
                    <p className="mt-1 text-[length:var(--text-xs)] leading-relaxed text-[rgb(var(--text-muted))]">
                      {interest.tagline}
                    </p>
                  </div>
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
                          className="rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] px-2.5 py-1 font-mono text-[length:var(--text-xs)] text-[rgb(var(--text-dim))]"
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

            <ol className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {projectApproach.map((item, index) => (
                <li key={item.title} className={interestTone[index % interestTone.length]}>
                  <span className="font-display text-3xl font-bold leading-none tracking-[-0.04em] text-[rgb(var(--cat))]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p className="mt-3 font-display text-[length:var(--text-sm)] font-bold tracking-[-0.01em] text-[rgb(var(--text))]">
                    {item.title}
                  </p>
                  <p className="mt-1 text-[length:var(--text-xs)] leading-relaxed text-[rgb(var(--text-muted))]">
                    {item.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </SectionShell>
  )
}

/**
 * Icons carry the interest descriptions now, so the tiles can drop a sentence
 * each without losing meaning. `tagline` in the config is the short form.
 */
function InterestIcon({ name }: { name: string }) {
  const shared = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: 'h-[18px] w-[18px]',
    'aria-hidden': true,
  }

  switch (name) {
    case 'Web':
      return (
        <svg {...shared}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18Z" />
        </svg>
      )
    case 'Software':
      return (
        <svg {...shared}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="m7 9 2.5 2.5L7 14" />
          <path d="M13 14h4" />
        </svg>
      )
    case 'Networking':
      return (
        <svg {...shared}>
          <rect x="9" y="3" width="6" height="6" rx="1.5" />
          <rect x="2" y="16" width="6" height="5" rx="1.5" />
          <rect x="16" y="16" width="6" height="5" rx="1.5" />
          <path d="M12 9v3M5 16v-2h14v2" />
        </svg>
      )
    case 'Design':
      return (
        <svg {...shared}>
          <path d="M12 3a9 9 0 1 0 0 18 2.5 2.5 0 0 0 2.5-2.5c0-.7-.3-1.3-.7-1.7a2.5 2.5 0 0 1 2-4.3H18a3 3 0 0 0 3-3A9 9 0 0 0 12 3Z" />
          <circle cx="7.5" cy="11" r="1" fill="currentColor" />
          <circle cx="11" cy="7.5" r="1" fill="currentColor" />
          <circle cx="15.5" cy="9" r="1" fill="currentColor" />
        </svg>
      )
    case 'Experiments':
      return (
        <svg {...shared}>
          <path d="M9 3h6" />
          <path d="M10 3v6L5 19a1.5 1.5 0 0 0 1.3 2.2h11.4A1.5 1.5 0 0 0 19 19l-5-10V3" />
          <path d="M7.5 15h9" />
        </svg>
      )
    default:
      return (
        <svg {...shared}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      )
  }
}
