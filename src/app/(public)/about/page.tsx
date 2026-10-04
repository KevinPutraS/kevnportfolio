import type { Metadata } from 'next'
import { BackgroundSummary } from '@/components/about/background-summary'
import { ExploringList } from '@/components/about/exploring-list'
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
  openGraph: {
    title: `About — ${siteConfig.name}`,
    description: 'How I learn, what I work in, and the tools I reach for.',
    url: '/about',
  },
}

/**
 * About. The long version of the homepage, and nothing shorter than that.
 *
 * The overlap with the homepage is deliberate rather than accidental: both
 * carry the interests, the toolkit and the approach, but at different depths.
 * The homepage squeezes them into tiles, chips and a four-beat strip for a
 * visitor who is still skimming; here the same material is allowed to breathe —
 * the focus areas are one full sentence each, the toolkit sits in two columns,
 * and the approach gets a numbered section of its own.
 *
 * What About alone holds:
 *
 * - two paragraphs on how he actually learns, which is the one thing a list of
 *   projects cannot demonstrate
 * - the "right now" pills, which are too transient to earn a place on the
 *   homepage
 * - real experience and certificate records, which are facts rather than claims
 *
 * The records render through `CredentialLists`, the same component the
 * homepage's preview uses, so the two summaries cannot drift apart.
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
        Each of the three sections below uses `SectionShell`, whose hairline and
        wash mark the top edge of a distinct room. The tones used to be three
        different hues so the rooms read as different colours; they are the same
        amber now, which is exactly the point of a one-accent palette — the
        hairlines are what separate the rooms, and the accent no longer pretends
        the content inside them has its own identity.
      */}
      <SectionShell tone="section-tone-web">
        <div className="container-custom py-16 lg:py-20">
          <div className="grid gap-x-12 gap-y-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="eyebrow">Focus</p>
              <h2 className="heading-2 mt-5 text-balance">What I work in.</h2>
            </div>

            <ul className="grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:col-span-8">
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
                    {/* One line, not a paragraph. The homepage carries the
                        short form; this is where the full sentence lives,
                        once. */}
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
                        className="rounded-full border border-[rgb(var(--border))] px-2.5 py-1 font-mono text-[length:var(--text-xs)] text-[rgb(var(--text-dim))]"
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

              <ol className="mt-8 grid gap-x-8 gap-y-9 sm:grid-cols-2">
                {projectApproach.map((item, index) => (
                  <li key={item.title}>
                    <div className="border-t border-[rgb(var(--border))] pt-4">
                      <span className="font-mono text-[length:var(--text-meta)] tabular-nums text-[rgb(var(--accent))]">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <h3 className="mt-3 font-display text-[length:var(--text-sm)] font-bold tracking-[-0.01em] text-[rgb(var(--text))]">
                        {item.title}
                      </h3>
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
    </>
  )
}
