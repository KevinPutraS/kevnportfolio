import { ButtonLink } from '@/components/ui/button-link'
import { siteConfig } from '@/config/site'

/**
 * Hero.
 *
 * Server Component with no client JavaScript. The headline uses
 * `clamp()`-based Tailwind steps plus `break-words` so it never causes a
 * horizontal scrollbar at 320px.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[rgb(var(--border-subtle))]">
      <div className="grid-backdrop pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="container-custom relative py-20 sm:py-28 lg:py-36">
        <div className="grid items-end gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-8">
            <p className="eyebrow animate-fade-in">
              Portfolio <span className="text-[rgb(var(--accent))]">/</span> {new Date().getFullYear()}
            </p>

            <h1 className="heading-1 mt-6 text-balance">
              <span className="block animate-fade-in stagger-1">Building things.</span>
              <span className="block animate-fade-in stagger-2 text-[rgb(var(--text-secondary))]">
                Exploring ideas.
              </span>
            </h1>

            <p className="body mt-8 max-w-xl text-pretty text-[rgb(var(--text-secondary))] animate-slide-up stagger-3">
              I make websites, applications, tools and experiments — mostly to understand how something
              works, and then to see how far I can push it. This is where the interesting ones end up.
            </p>

            <div className="mt-10 flex animate-slide-up flex-col gap-3 stagger-4 sm:flex-row sm:items-center">
              <ButtonLink href="/projects" size="lg" className="w-full sm:w-auto">
                Explore work
              </ButtonLink>
              <ButtonLink href="/about" size="lg" variant="secondary" className="w-full sm:w-auto">
                About me
              </ButtonLink>
            </div>
          </div>

          {/*
            Editorial "contents" column. Replaces the previous decorative blur
            blobs with something that reads like a printed table of contents.
          */}
          <aside className="animate-fade-in stagger-5 lg:col-span-4">
            <div className="border-l border-[rgb(var(--border))] pl-6">
              <p className="eyebrow">Currently</p>
              <ul className="mt-4 space-y-3">
                {[
                  'Web apps & interfaces',
                  'Networking experiments',
                  'Generative sketches',
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-[rgb(var(--text-secondary))]">
                    <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 bg-[rgb(var(--accent))]" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href={`mailto:${siteConfig.email}`}
                className="mt-6 inline-block font-mono text-xs text-[rgb(var(--text-muted))] transition-colors hover:text-[rgb(var(--accent))]"
              >
                {siteConfig.email}
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
