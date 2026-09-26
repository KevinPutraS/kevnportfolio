import type { Metadata } from 'next'
import Link from 'next/link'
import { projectApproach, technologies } from '@/config/site'
import { currentlyExploring } from '@/config/site'

export const metadata: Metadata = {
  title: 'About',
  description:
    'How I work, what I like building, and the areas of technology I am still exploring. No job titles, no inflated claims — just an honest picture of the process.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <>
      {/* ---- Intro ------------------------------------------------------- */}
      <section className="border-b border-[rgb(var(--border-subtle))]">
        <div className="container-custom py-16 sm:py-20 lg:py-28">
          <p className="eyebrow">About</p>
          <h1 className="heading-1 mt-5 max-w-4xl text-balance">
            I build things to find out how they work.
          </h1>

          <div className="prose-block mt-10 max-w-2xl text-lg text-[rgb(var(--text-secondary))]">
            <p>
              I am a self-directed builder. Most of my knowledge came from picking something
              specific to make, hitting a wall, and going back to the documentation until the wall
              disappeared.
            </p>
            <p>
              I deliberately do not label myself with a single role. A year of web work and a month
              of networking experiments are both just ways of learning how computers fit together,
              and pretending otherwise would narrow the work for no reason.
            </p>
          </div>
        </div>
      </section>

      {/* ---- What I like building --------------------------------------- */}
      <section className="section">
        <div className="container-custom">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="eyebrow">Motivations</p>
              <h2 className="heading-2 mt-4 text-balance">What I like building</h2>
            </div>

            <div className="lg:col-span-8">
              <ul className="space-y-8">
                {[
                  {
                    title: 'Tools that remove a small annoyance',
                    body: 'A script that saves ten seconds, a page that loads instantly, a CLI flag that makes something readable. Small wins add up.',
                  },
                  {
                    title: 'Things I can see working',
                    body: 'A multiplayer board where two cursors actually sync. A render that responds to input. Visible feedback is what keeps me going.',
                  },
                  {
                    title: 'Experiments with no obvious purpose',
                    body: 'Shaders, generative sketches, small simulations. These are pure curiosity, and they are where most of my ideas start.',
                  },
                  {
                    title: 'Coursework with a real brief',
                    body: 'School and university projects are a useful constraint — someone else decides the scope, and you find out what you can do inside it.',
                  },
                ].map((item, index) => (
                  <li key={item.title} className="grid gap-3 border-t border-[rgb(var(--border-subtle))] pt-6 sm:grid-cols-[3rem_1fr] sm:gap-6">
                    <span className="font-mono text-[0.6875rem] text-[rgb(var(--text-muted))]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="heading-4">{item.title}</h3>
                      <p className="mt-2 max-w-xl text-[rgb(var(--text-secondary))]">{item.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Areas I'm exploring ----------------------------------------- */}
      <section className="section border-t border-[rgb(var(--border-subtle))]">
        <div className="container-custom">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="eyebrow">Focus</p>
              <h2 className="heading-2 mt-4 text-balance">Areas I&apos;m exploring</h2>
            </div>

            <div className="lg:col-span-8">
              <ul className="grid gap-px border border-[rgb(var(--border-subtle))] bg-[rgb(var(--border-subtle))] sm:grid-cols-2">
                {[
                  {
                    title: 'Web & interfaces',
                    body: 'The most familiar area: browser rendering, state management, accessibility, and the endless details that separate a working page from a good one.',
                    level: 'Comfortable',
                  },
                  {
                    title: 'Networking & infrastructure',
                    body: 'How services find each other and keep talking. Servers, protocols, deployment, and enough systems thinking to debug things properly.',
                    level: 'Intermediate',
                  },
                  {
                    title: 'Systems & low-level',
                    body: 'Operating systems, compilers, and what is actually happening below the abstraction. Slower going, but it changes how you reason about everything above it.',
                    level: 'Learning',
                  },
                  {
                    title: 'Graphics & generative work',
                    body: 'Shaders, simulation and procedural generation. A side interest that keeps expanding.',
                    level: 'Experimenting',
                  },
                ].map((item) => (
                  <li
                    key={item.title}
                    className="bg-[rgb(var(--background))] p-6 transition-colors duration-200 hover:bg-[rgb(var(--surface))] sm:p-8"
                  >
                    <h3 className="heading-4">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--text-secondary))]">
                      {item.body}
                    </p>
                    <p className="caption mt-5 text-[rgb(var(--text-muted))]">
                      <span className="text-[rgb(var(--accent))]">{item.level}</span>
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-[rgb(var(--text-muted))]">
                These levels are rough self-assessments, not qualifications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Technologies ------------------------------------------------ */}
      <section className="section border-t border-[rgb(var(--border-subtle))]">
        <div className="container-custom">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="eyebrow">Toolkit</p>
              <h2 className="heading-2 mt-4 text-balance">Technologies I&apos;ve worked with</h2>
              <p className="mt-6 max-w-sm text-[rgb(var(--text-secondary))]">
                Tools I have actually used on something. Not an exhaustive list, and not a ranking.
              </p>
            </div>

            <div className="lg:col-span-8">
              <dl className="grid gap-8 sm:grid-cols-2">
                {technologies.map((group) => (
                  <div key={group.group}>
                    <dt className="eyebrow">{group.group}</dt>
                    <dd className="mt-4 flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <span
                          key={item}
                          className="border border-[rgb(var(--border-subtle))] px-2.5 py-1 font-mono text-xs text-[rgb(var(--text-secondary))]"
                        >
                          {item}
                        </span>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Currently exploring ----------------------------------------- */}
      <section className="section border-t border-[rgb(var(--border-subtle))]">
        <div className="container-custom">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="eyebrow">Right now</p>
              <h2 className="heading-2 mt-4 text-balance">Currently exploring</h2>
            </div>
            <ul className="lg:col-span-8">
              {currentlyExploring.map((item, index) => (
                <li
                  key={item}
                  className="flex items-center gap-4 border-t border-[rgb(var(--border-subtle))] py-4 last:border-b"
                >
                  <span className="font-mono text-[0.6875rem] text-[rgb(var(--text-muted))]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="font-display text-lg font-medium tracking-tight sm:text-xl">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---- Approach ---------------------------------------------------- */}
      <section className="section border-t border-[rgb(var(--border-subtle))]">
        <div className="container-custom">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="eyebrow">Method</p>
              <h2 className="heading-2 mt-4 text-balance">My approach to projects</h2>
            </div>

            <ol className="lg:col-span-8">
              {projectApproach.map((item, index) => (
                <li
                  key={item.title}
                  className="grid gap-3 border-t border-[rgb(var(--border-subtle))] py-6 last:border-b sm:grid-cols-[3rem_1fr] sm:gap-6"
                >
                  <span className="font-mono text-[0.6875rem] text-[rgb(var(--text-muted))]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="heading-4">{item.title}</h3>
                    <p className="mt-2 max-w-xl text-[rgb(var(--text-secondary))]">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ---- CTA --------------------------------------------------------- */}
      <section className="border-t border-[rgb(var(--border-subtle))] py-20 sm:py-24">
        <div className="container-custom">
          <h2 className="heading-2 max-w-2xl text-balance">Want to see what came out of it?</h2>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/projects"
              className="inline-flex h-12 items-center justify-center border border-[rgb(var(--accent))] bg-[rgb(var(--accent))] px-6 text-base font-medium text-[rgb(var(--accent-contrast))] transition-colors hover:bg-[rgb(var(--accent-hover))]"
            >
              Browse the projects
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center border border-[rgb(var(--border))] bg-[rgb(var(--surface-elevated))] px-6 text-base font-medium transition-colors hover:border-[rgb(var(--text-muted))]"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
