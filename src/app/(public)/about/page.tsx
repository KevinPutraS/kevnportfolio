import type { Metadata } from 'next'
import { BackgroundSummary } from '@/components/about/background-summary'
import { ExploringList } from '@/components/home/exploring-list'
import { ArrowLink } from '@/components/ui/arrow-link'
import { SectionShell } from '@/components/ui/section-shell'
import { siteConfig, interests, technologies, projectApproach } from '@/config/site'

/**
 * ISR, so published records reach this page without a redeploy. Safe because the
 * reads use the cookie-less public client.
 */
export const revalidate = 60

export const metadata: Metadata = {
  title: 'About',
  description: `How ${siteConfig.personName} works, what he builds, and the areas of technology he is exploring.`,
  alternates: { canonical: '/about' },
}

/**
 * About.
 *
 * The long version of the homepage, and only that.
 *
 * This page previously ran to about 500 words and repeated the homepage almost
 * item for item — the same motivations as longer sentences, the same focus areas,
 * the same toolkit, the same approach steps. A visitor who read the homepage and
 * then opened this one found nothing new for the first three screens.
 *
 * So the overlap is gone. What stays is what a homepage cannot hold:
 *
 * - two paragraphs on how he actually learns, which is the one thing a list of
 *   projects cannot demonstrate
 * - the focus areas in one line each, instead of a paragraph per area
 * - real experience and certificate records, which are facts rather than claims
 *
 * Interests and the toolkit are not repeated either: the homepage already renders
 * them as tiles and chips, and a second copy on this page is pure duplication.
 */
/**
 * The page fetches nothing. Experience and certificates are read inside
 * `BackgroundSummary`, which is the only section that needs them — the rest is
 * static content, so the route stays cheap and the component owns its own
 * "nothing published" decision.
 */
export default function AboutPage() {
  return (
    <>
      {/* ---- Opening ------------------------------------------------------ */}
      <section className="container-custom">
        <div className="grid gap-x-12 gap-y-10 py-16 lg:grid-cols-12 lg:py-24">
          <div className="lg:col-span-4">
            <p className="eyebrow">About</p>
            <p className="meta mt-3">The long version</p>
          </div>

          <div className="lg:col-span-8">
            <h1 className="heading-1 text-balance">
              I build things to find out how they work.
            </h1>

            <div className="prose-block mt-8 max-w-2xl text-pretty">
              <p>
                Most of what I know came from picking something specific to make, hitting a wall,
                and reading documentation until the wall disappeared. The wall is the useful part.
              </p>
              <p>
                I do not label myself with a single role. A stretch of web work and a month of
                networking experiments are both just ways of learning how computers fit together —
                pretending otherwise would narrow the work for no reason.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <ArrowLink href="/projects" direction="up">
                See the work
              </ArrowLink>
              <ArrowLink href="/contact" direction="up">
                Get in touch
              </ArrowLink>
            </div>
          </div>
        </div>
      </section>

      {/*
        ---- Focus areas, one line each -----------------------------------
        The three sections below this point each take a *different* tone. They
        were all `section-tone-experiment`, which meant three consecutive tinted
        washes with a hairline between them — one long band that reads as a
        single section, and quietly undoes the point of `SectionShell`. Varying
        the hue is what makes each read as its own room.
      */}
      <SectionShell tone="section-tone-web">
        <div className="container-custom py-16 lg:py-20">
          <div className="grid gap-x-12 gap-y-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="eyebrow">Focus</p>
              <h2 className="heading-2 mt-5 text-balance">What I work in.</h2>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2 lg:col-span-8">
              {interests.map((interest, index) => (
                <li
                  key={interest.title}
                  className={[
                    'cat-web',
                    'cat-app',
                    'cat-design',
                    'cat-networking',
                    'cat-experiment',
                    'cat-school',
                  ][index % 6]}
                >
                  <div className="h-full rounded-2xl border bg-[rgb(var(--bg-elevated))] p-5 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-[rgb(var(--cat)/0.5)]">
                    <h3 className="font-display text-[length:var(--text-sm)] font-bold tracking-[-0.01em] text-[rgb(var(--text))]">
                      {interest.title}
                    </h3>
                    {/* One line, not a paragraph. The homepage carries the
                        short form; this is where the full sentence lives, once. */}
                    <p className="mt-2 text-[length:var(--text-sm)] leading-relaxed text-[rgb(var(--text-muted))]">
                      {interest.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SectionShell>

      {/* ---- Toolkit, as chips -------------------------------------------- */}
      <SectionShell tone="section-tone-networking">
        <div className="container-custom py-16 lg:py-20">
          <div className="grid gap-x-12 gap-y-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="eyebrow">Toolkit</p>
              <h2 className="heading-2 mt-5 text-balance">What I have used.</h2>
            </div>

            <dl className="grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:col-span-8">
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
          </div>
        </div>
      </SectionShell>

      {/*
        ---- Background: real records ---------------------------------------
        `BackgroundSummary` fetches its own data and renders null when there is
        nothing published, so it needs no guard here and no props.
      */}
      <BackgroundSummary />

      {/* ---- Right now + method ------------------------------------------- */}
      <SectionShell tone="section-tone-experiment">
        <div className="container-custom py-16 lg:py-20">
          <div className="grid gap-x-12 gap-y-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="eyebrow">Right now</p>
              <h2 className="heading-2 mt-5 text-balance">Currently exploring.</h2>
              <ExploringList className="mt-6" />
            </div>

            <div className="lg:col-span-7">
              <p className="eyebrow">Method</p>
              <h2 className="heading-2 mt-5 text-balance">How I work.</h2>

              <ol className="mt-8 grid gap-6 sm:grid-cols-2">
                {projectApproach.map((item, index) => (
                  <li
                    key={item.title}
                    className={[
                      'cat-web',
                      'cat-app',
                      'cat-design',
                      'cat-networking',
                    ][index % 4]}
                  >
                    <span className="font-display text-3xl font-bold leading-none tracking-[-0.04em] text-[rgb(var(--cat))]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mt-3 font-display text-[length:var(--text-sm)] font-bold tracking-[-0.01em] text-[rgb(var(--text))]">
                      {item.title}
                    </h3>
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
    </>
  )
}
