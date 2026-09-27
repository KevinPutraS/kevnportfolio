import Link from 'next/link'
import { ButtonLink } from '@/components/ui/button-link'
import { ArrowLink } from '@/components/ui/arrow-link'
import { siteConfig } from '@/config/site'

/**
 * Hero.
 *
 * The job of this section is to answer four questions in the first few seconds:
 * whose site is this, what is it, what is inside, and where do I start. The
 * previous version answered none of them clearly — it opened with an abstract
 * statement ("Building things. Exploring ideas."), never showed the name, and
 * called the project list "Work".
 *
 * The order below is deliberate and matches the order a visitor reads:
 *
 *   1. descriptor  — "Personal Digital Portfolio", so the category is stated
 *   2. name        — the single largest element, as an <h1>
 *   3. statement   — what the person actually does, at a size you can read
 *   4. support     — one paragraph of reassurance about the contents
 *   5. two CTAs    — the primary next step and a secondary one
 *   6. section map — all four sections with a line about what each contains
 *
 * The section map is what replaces the old decorative contents rail. It is real
 * navigation, it is built from `siteConfig.sections` so it cannot fall out of
 * sync with the header, and the one-line descriptions mean a visitor can pick a
 * destination without opening it first.
 *
 * Server Component — no client JavaScript. The type scale comes from the fluid
 * `--text-display` token, so it holds up at 320px and at 1440px with no
 * breakpoint of its own.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="container-custom relative">
        {/* ---- Masthead: the category, stated plainly --------------------- */}
        <div className="flex items-center justify-between gap-6 border-b border-[rgb(var(--border-subtle))] py-4">
          <p className="eyebrow animate-fade-in">
            {siteConfig.descriptor}
            <span aria-hidden="true" className="px-2 text-[rgb(var(--border))]">
              /
            </span>
            {new Date().getFullYear()}
          </p>
          <p className="caption hidden text-[rgb(var(--text-muted))] sm:block">
            Projects, experience &amp; certificates
          </p>
        </div>

        {/* ---- Name + statement ------------------------------------------ */}
        <div className="relative py-12 sm:py-16 lg:py-20">
          <div
            aria-hidden="true"
            className="absolute -left-6 top-4 hidden h-[calc(100%-2rem)] w-px bg-[rgb(var(--border-subtle))] lg:block"
          />

          <h1 className="display-1 animate-fade-in lg:pl-8">
            {siteConfig.personName}
            <span className="mt-5 block max-w-3xl font-sans text-[length:var(--text-h3)] font-normal tracking-[-0.02em] text-[rgb(var(--text-secondary))] text-balance sm:mt-6">
              {siteConfig.heroStatement}
            </span>
          </h1>
        </div>

        {/* ---- Support copy + primary actions ----------------------------- */}
        <div className="grid gap-x-10 gap-y-10 border-t border-[rgb(var(--border-subtle))] py-10 lg:grid-cols-12 lg:py-12">
          <div className="lg:col-span-6">
            <p className="body-lg animate-slide-up text-pretty text-[rgb(var(--text-secondary))] stagger-2">
              {siteConfig.heroSupport}
            </p>

            <div className="animate-slide-up stagger-4 mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <ButtonLink href="/projects" size="lg" className="w-full sm:w-auto">
                View projects
              </ButtonLink>
              <ArrowLink href="/about" className="justify-center sm:justify-start">
                About me
              </ArrowLink>
            </div>
          </div>

          <p className="animate-slide-up text-pretty text-[rgb(var(--text-muted))] stagger-3 lg:col-span-4 lg:col-start-9 lg:pt-1">
            Not sure where to start?{' '}
            <ArrowLink href="/contact" className="whitespace-nowrap">
              Get in touch
            </ArrowLink>{' '}
            and tell me what you are looking for.
          </p>
        </div>

        {/* ---- Section map: what is actually on this site ----------------- */}
        <div className="border-t border-[rgb(var(--border-subtle))] py-10 lg:py-12">
          <div className="flex items-baseline justify-between gap-6">
            <h2 className="eyebrow">What&apos;s on this site</h2>
            <p className="meta hidden sm:block">Four sections</p>
          </div>

          <ul className="mt-6 grid gap-x-8 sm:grid-cols-2">
            {siteConfig.sections.map((section, index) => (
              <li
                key={section.href}
                className="animate-fade-in border-t border-[rgb(var(--border-subtle))]"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <Link
                  href={section.href}
                  className="group flex min-h-28 flex-col justify-center gap-1.5 py-5"
                >
                  <span className="flex items-center gap-2">
                    <span className="font-display text-lg font-bold tracking-[-0.025em] text-[rgb(var(--text-primary))] transition-colors duration-150 group-hover:text-[rgb(var(--accent))]">
                      {section.label}
                    </span>
                    <span
                      aria-hidden="true"
                      className="arrow-shift text-[rgb(var(--text-muted))] transition-colors duration-150 group-hover:text-[rgb(var(--accent))]"
                    >
                      &rarr;
                    </span>
                  </span>
                  <span className="max-w-prose text-[length:var(--text-body-sm)] leading-relaxed text-[rgb(var(--text-secondary))]">
                    {section.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
