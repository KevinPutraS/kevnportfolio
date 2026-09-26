import { ButtonLink } from '@/components/ui/button-link'
import { ArrowLink } from '@/components/ui/arrow-link'
import { siteConfig, currentlyExploring } from '@/config/site'

/**
 * Hero.
 *
 * Composed as a magazine cover in three bands: a masthead row, a two-column
 * body (headline + contents rail), and a footer bar. The vertical margin rule
 * and the offset second line are what give it the asymmetric, printed feel —
 * a centred stack with a pill button underneath would read as a landing page.
 *
 * Server Component, zero client JavaScript. The headline size comes from the
 * fluid `--text-display` token rather than fixed steps, so it stays correct at
 * 320px and at 1440px without a single breakpoint.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="container-custom relative">
        {/* ---- Masthead ------------------------------------------------- */}
        <div className="flex items-center justify-between gap-6 border-b border-[rgb(var(--border-subtle))] py-4">
          <p className="eyebrow animate-fade-in">
            Portfolio{' '}
            <span aria-hidden="true" className="px-1 text-[rgb(var(--border))]">
              /
            </span>{' '}
            {new Date().getFullYear()}
          </p>
          <p className="caption hidden text-[rgb(var(--text-muted))] sm:block">
            Selected work &amp; experiments
          </p>
        </div>

        {/* ---- Body ------------------------------------------------------ */}
        {/*
          The headline runs the full container width rather than sitting in
          eight of twelve columns. That is what buys the type its size: at
          1440px the longest line fits on a single row at ~130px, and the copy
          and index move underneath where they get a proper measure instead of
          a squeezed one.
        */}
        <div className="relative py-14 sm:py-20 lg:py-24">
          <div
            aria-hidden="true"
            className="absolute -left-6 top-2 hidden h-[calc(100%-1rem)] w-px bg-[rgb(var(--border-subtle))] lg:block"
          />

          <h1 className="display-1 lg:pl-8">
            <span className="block animate-fade-in stagger-1">Building things.</span>
            <span className="block animate-fade-in stagger-2 text-[rgb(var(--text-secondary))]">
              Exploring ideas.
            </span>
          </h1>
        </div>

        <div className="grid gap-x-10 gap-y-10 border-t border-[rgb(var(--border-subtle))] py-10 lg:grid-cols-12 lg:py-12">
          <div className="lg:col-span-4">
            <p className="body-lg animate-slide-up text-pretty text-[rgb(var(--text-secondary))] stagger-3">
              I make websites, applications, tools and experiments — usually to find out how
              something works, then to see how far I can push it.
            </p>
          </div>

          <p className="animate-slide-up text-pretty text-[rgb(var(--text-muted))] stagger-4 lg:col-span-3">
            There is no single lane here. Web work, networking, tooling and design all end up on this
            site eventually.
          </p>

          {/*
            Contents rail. Replaces the previous decorative blur blobs with
            something structural: a printed table of contents that is also
            useful navigation, plus a live status block.
          */}
          <aside className="animate-fade-in stagger-5 lg:col-span-4 lg:col-start-9">
            <p className="meta-label">Index</p>
            <ul className="mt-5 border-t border-[rgb(var(--border-subtle))]">
              {siteConfig.navigation.map((item, index) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="group -mx-3 flex items-baseline gap-3 border-b border-[rgb(var(--border-subtle))] px-3 py-3 transition-colors duration-150 hover:bg-[rgb(var(--surface))]"
                  >
                    <span className="index-marker transition-colors duration-150 group-hover:text-[rgb(var(--accent))]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1 font-display text-base font-medium tracking-[-0.01em] text-[rgb(var(--text-secondary))] transition-colors duration-150 group-hover:text-[rgb(var(--text-primary))]">
                      {item.label}
                    </span>
                    <span
                      aria-hidden="true"
                      className="arrow-shift text-[rgb(var(--text-muted))] transition-colors duration-150 group-hover:text-[rgb(var(--accent))]"
                    >
                      &rarr;
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <p className="meta-label mt-8">Right now</p>
            <ul className="mt-4 space-y-2">
              {currentlyExploring.slice(0, 3).map((item) => (
                <li key={item} className="flex gap-2.5 text-sm text-[rgb(var(--text-secondary))]">
                  <span
                    aria-hidden="true"
                    className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-[rgb(var(--accent))]"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </aside>
        </div>

        {/* ---- Footer bar ------------------------------------------------ */}
        <div className="flex flex-col gap-6 border-t border-[rgb(var(--border-subtle))] py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex animate-slide-up flex-col gap-3 stagger-5 sm:flex-row sm:items-center">
            <ButtonLink href="/projects" size="lg" className="w-full sm:w-auto">
              Explore work
            </ButtonLink>
            <ArrowLink href="/about" className="justify-center sm:justify-start">
              About me
            </ArrowLink>
          </div>

          <p className="animate-fade-in stagger-6">
            <ArrowLink href={siteConfig.contactEmail} direction="up" external={false}>
              {siteConfig.email}
            </ArrowLink>
          </p>
        </div>
      </div>
    </section>
  )
}
