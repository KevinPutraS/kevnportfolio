import type { Metadata } from 'next'
import { ButtonLink } from '@/components/ui/button-link'
import { ArrowLink } from '@/components/ui/arrow-link'
import { PageHeader } from '@/components/ui/page-header'
import { BackgroundSummary } from '@/components/about/background-summary'
import { ExploringList } from '@/components/home/exploring-list'
import { projectApproach, technologies, siteConfig } from '@/config/site'

/** ISR, so published records reach this page without a redeploy. */
export const revalidate = 60

export const metadata: Metadata = {
  title: 'About',
  description: `How ${siteConfig.personName} works, what he likes building, and the areas of technology he is still exploring. No inflated claims — an honest picture of the process.`,
  alternates: { canonical: '/about' },
  openGraph: {
    title: `About — ${siteConfig.name}`,
    description: 'How I work, what I like building, and what I am still exploring.',
    url: '/about',
  },
}

/**
 * About.
 *
 * Not a résumé. Every section answers one question and nothing is repeated from
 * a CV: what I build, what I am exploring, what I have used, what I am doing
 * now, and how I work. No employment, clients, dates or credentials appear
 * because none are known.
 *
 * Two things were deliberately removed while restructuring this page:
 *
 * - A self-assessed proficiency column ("Comfortable", "Intermediate"). Ratings
 *   are unverifiable and read as a claim of seniority the rest of the site
 *   deliberately avoids making. The descriptions carry the same information
 *   honestly — "slower going, but it changes how you reason" says more than
 *   "Intermediate" does.
 * - Numbering on the motivations list. It is a `<ul>` of parallel reasons, not a
 *   sequence, so the numbers implied an order that does not exist. The approach
 *   list below is a real `<ol>` and keeps its numbers.
 */

const motivations = [
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
    body: 'Shaders, generative sketches, small simulations. Pure curiosity, and where most of my ideas start.',
  },
  {
    title: 'Coursework with a real brief',
    body: 'School and university projects are a useful constraint — someone else sets the scope, and you find out what you can do inside it.',
  },
]

const focusAreas = [
  {
    title: 'Web & interfaces',
    body: 'Browser rendering, state management, accessibility, and the endless details that separate a working page from a good one. This is where most of my projects end up.',
  },
  {
    title: 'Networking & infrastructure',
    body: 'How services find each other and keep talking. Servers, protocols, deployment, and enough systems thinking to debug things properly.',
  },
  {
    title: 'Systems & low-level',
    body: 'Operating systems, compilers, and what actually happens below the abstraction. Slower going, but it changes how you reason about everything above it.',
  },
  {
    title: 'Graphics & generative work',
    body: 'Shaders, simulation and procedural generation. A side interest that keeps expanding and occasionally leaks back into interface work.',
  },
]

export default function AboutPage() {
  return (
    <>
      {/* ---- Intro ------------------------------------------------------- */}
      <div className="container-custom">
        <PageHeader
          eyebrow="About"
          title="I build things to find out how they work."
          lede={
            <>
              <span className="block">
                I&apos;m {siteConfig.personName}. Most of what I know came from picking something
                specific to make, hitting a wall, and reading documentation until the wall
                disappeared.
              </span>
              <span className="mt-4 block">
                I deliberately do not label myself with a single role. A stretch of web work and a
                month of networking experiments are both just ways of learning how computers fit
                together — pretending otherwise would narrow the work for no reason.
              </span>
            </>
          }
          action={
            <ArrowLink href="/contact" direction="up">
              Work with me
            </ArrowLink>
          }
        />
      </div>

      {/* ---- What I like building ---------------------------------------- */}
      <section className="rule-top">
        <div className="container-custom">
          <div className="rhythm-lg grid gap-x-10 gap-y-10 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <p className="eyebrow">Motivations</p>
              <h2 className="heading-2 mt-5 max-w-[12ch] text-balance">What I like building</h2>
            </div>

            <ul className="lg:col-span-9">
              {motivations.map((item) => (
                <li
                  key={item.title}
                  className="grid gap-x-10 gap-y-2 border-t border-[rgb(var(--border-subtle))] py-6 last:border-b sm:grid-cols-[minmax(0,14rem)_1fr]"
                >
                  <h3 className="font-display text-base font-semibold tracking-[-0.02em] text-[rgb(var(--text-primary))] sm:text-lg">
                    {item.title}
                  </h3>
                  <p className="text-pretty text-[rgb(var(--text-secondary))]">{item.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/*
        ---- Areas I'm exploring -------------------------------------------
        A list, not a tile grid. Each row pairs a named area with an honest
        description of where that relationship actually stands.
      */}
      <section className="rule-top">
        <div className="container-custom">
          <div className="rhythm-sm grid gap-x-10 gap-y-10 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <p className="eyebrow">Focus</p>
            </div>

            <div className="lg:col-span-9">
              <h2 className="heading-2 max-w-[16ch] text-balance">Areas I&apos;m exploring</h2>

              <ul className="mt-10">
                {focusAreas.map((item) => (
                  <li
                    key={item.title}
                    className="grid gap-x-10 gap-y-2 border-t border-[rgb(var(--border-subtle))] py-5 sm:grid-cols-[14rem_1fr] sm:items-baseline"
                  >
                    <h3 className="font-display text-base font-semibold tracking-[-0.02em] text-[rgb(var(--text-primary))]">
                      {item.title}
                    </h3>
                    <p className="text-pretty text-[length:var(--text-body-sm)] text-[rgb(var(--text-secondary))]">
                      {item.body}
                    </p>
                  </li>
                ))}
              </ul>

              <p className="mt-5 text-[length:var(--text-body-sm)] text-[rgb(var(--text-muted))]">
                These are areas I am actively working in, not a claim of expertise. Depth varies a
                lot between them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/*
        ---- Technologies -------------------------------------------------
        Running mono lists instead of chips. A wrapped row of bordered boxes
        is the most recognisable "skills" component on the web; plain type with
        a middot reads as part of the page and scans faster.
      */}
      <section className="rule-top">
        <div className="container-custom">
          <div className="rhythm-lg grid gap-x-10 gap-y-10 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <p className="eyebrow">Toolkit</p>
              <h2 className="heading-2 mt-5 max-w-[12ch] text-balance">
                Technologies I&apos;ve worked with
              </h2>
            </div>

            <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:col-span-9">
              {technologies.map((group) => (
                <div key={group.group} className="border-t border-[rgb(var(--border-subtle))] pt-4">
                  <dt className="label">{group.group}</dt>
                  <dd className="tech-list mt-3 leading-[1.9] text-[rgb(var(--text-secondary))]">
                    {group.items.join(' · ')}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="text-[length:var(--text-body-sm)] text-[rgb(var(--text-muted))] lg:col-span-9 lg:col-start-4">
              Tools I have actually used on something. Not an exhaustive list, and not a ranking.
            </p>
          </div>
        </div>
      </section>

      {/*
        Real records only. This renders nothing until something is published, so
        the page never implies experience or credentials it does not have.
      */}
      <BackgroundSummary />

      {/* ---- Currently exploring ------------------------------------------ */}
      <section className="rule-top">
        <div className="container-custom">
          <div className="rhythm-md grid gap-x-10 gap-y-10 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <p className="eyebrow">Right now</p>
            </div>
            <div className="lg:col-span-9">
              <h2 className="heading-2 text-balance">Currently exploring</h2>
              <ExploringList className="mt-10" />
            </div>
          </div>
        </div>
      </section>

      {/* ---- Approach ---------------------------------------------------- */}
      <section className="rule-top">
        <div className="container-custom">
          <div className="rhythm-lg grid gap-x-10 gap-y-10 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <p className="eyebrow">Method</p>
              <h2 className="heading-2 mt-5 max-w-[12ch] text-balance">
                My approach to projects
              </h2>
            </div>

            {/*
              A genuine sequence, so the numbers stay: these describe the order
              the work actually happens in, not a set of parallel benefits.
            */}
            <ol className="lg:col-span-9">
              {projectApproach.map((item, index) => (
                <li
                  key={item.title}
                  className="grid gap-x-10 gap-y-2 border-t border-[rgb(var(--border-subtle))] py-6 last:border-b sm:grid-cols-[3rem_5rem_1fr]"
                >
                  <span className="index-marker" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-display text-base font-semibold tracking-[-0.02em] text-[rgb(var(--text-primary))] sm:text-lg">
                    {item.title}
                  </h3>
                  <p className="text-pretty text-[rgb(var(--text-secondary))]">{item.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ---- CTA --------------------------------------------------------- */}
      <section className="rule-top">
        <div className="container-custom">
          <div className="rhythm-xl flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="heading-1 max-w-[18ch] text-balance">
              Want to see what came out of it?
            </h2>

            <div className="flex shrink-0 flex-col items-start gap-5">
              <ButtonLink href="/projects" size="lg">
                Browse the projects
              </ButtonLink>
              <ArrowLink href="/contact">Get in touch</ArrowLink>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
