import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { ButtonLink } from '@/components/ui/button-link'
import { siteConfig } from '@/config/site'

/**
 * Hero.
 *
 * Answers four questions in the first screen: whose site, what it is, what is
 * inside, where to start. The name is the largest element because it is the only
 * thing a visitor cannot infer.
 *
 * This used to be the most decorated thing on the site and the reason it looked
 * generated: the name carried a three-stop gradient from the accent through two
 * category hues, behind it sat three blurred colour pools and a masked grid, and
 * the panel beside it held four more. That is a lot of light for a page whose
 * whole idea is restraint, and none of it carried information.
 *
 * What replaced it carries information instead. The name is solid off-white at
 * display scale, the statement sits under it in the dim text colour, and the
 * panel is a site index: the four sections, numbered, with one line each — the
 * answer to "what is this site?" that `siteConfig.sections` was written for. It
 * is deliberately *not* a list of recent projects: the featured rail directly
 * below already shows the work, and printing the same four titles twice inside
 * one screen is filler.
 *
 * Server Component, but synchronous — no database call — so it is trivially
 * static. The type scale is fluid, so the headline holds at 320px and at 1440px
 * with no breakpoint of its own.
 */
export function Hero() {
  return (
    <section className="relative">
      {/*
        The backdrop is work by the site's owner, mounted in two cuts - the grid
        lives side by side from lg, so above lg a wide banner fills the sheet,
        and below it a portrait field is designed for the phone's centred slice
        that `cover` would otherwise cut a wide banner down to. Both sit below
        the words; the artwork is dark enough to need no scrim of ours.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-cover bg-bottom hidden lg:block"
        style={{ backgroundImage: "url('/images/bgdesktop.png')" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-cover bg-bottom lg:hidden"
        style={{ backgroundImage: "url('/images/bgmobile.png')" }}
      />

      <div className="container-custom relative z-10">
        <div className="flex items-center justify-between gap-6 border-b border-[rgb(var(--border))] py-4">
          <p className="eyebrow">
            {siteConfig.descriptor}
            <span aria-hidden="true" className="px-2 text-[rgb(var(--border-strong))]">
              /
            </span>
            {new Date().getFullYear()}
          </p>
          <p className="meta hidden sm:block">Web · Software · Design · Experiments</p>
        </div>

        {/*
          Name, statement, then the site index.

          On desktop the headline and the index sit side by side. On mobile the
          order is explicit: headline, index, buttons — nothing stands between a
          phone visitor and the two calls to action, and the index still answers
          "what is this site?" before the buttons answer "where do I go?".
        */}
        <div className="grid gap-x-12 gap-y-10 py-12 sm:py-20 lg:grid-cols-12 lg:gap-y-0 lg:py-24">
          <div className="lg:col-span-7">
            <h1 className="display-1 animate-fade-in">
              {/*
                Solid, not a gradient. A gradient fill across a display-size name
                is the single loudest "generated" signal there is, and it cost
                more legibility than it bought: the middle stop landed near the
                background, so the centre of the name was the dimmest part of it.
              */}
              <span className="block text-[rgb(var(--text))]">{siteConfig.personName}</span>
              <span className="mt-5 block max-w-xl font-sans text-[length:var(--text-lead)] font-normal leading-[1.35] tracking-[-0.01em] text-[rgb(var(--text-dim))] text-balance sm:mt-7 sm:text-[length:var(--text-h3)] sm:leading-[1.25]">
                {siteConfig.heroStatement}
              </span>
            </h1>

            {/*
              Both buttons are full width on a phone and sit side by side from
              `sm`. Stacked full-width controls are the right call at 360px and
              the wrong one from 480px up, where a half-empty column of buttons
              reads as a layout that has not finished.
            */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 lg:mt-10">
              <ButtonLink href="/projects" size="lg" className="w-full sm:w-auto">
                View projects
              </ButtonLink>
              <ButtonLink href="/about" variant="secondary" size="lg" className="w-full sm:w-auto">
                About me
              </ButtonLink>
            </div>
          </div>

          {/*
            The site index. Four hairlined rows, one per content section, each
            with a number and a single description line. A list rather than
            cards, for the same reason the projects index is one: the hero panel
            is allowed a fixed height, and a set of identical cards would read as
            shapes where these rows read as a table of contents.
          */}
          <aside className="order-2 lg:order-none lg:col-span-4 lg:col-start-9">
            <div className="border-t border-[rgb(var(--border))] pt-5 lg:mt-1">
              <p className="eyebrow">On this site</p>

              <nav aria-label="Site sections" className="mt-4">
                <ol>
                  {siteConfig.sections.map((section, i) => (
                    <li key={section.href} className="border-t border-[rgb(var(--border))]">
                      <Link
                        href={section.href}
                        className="group block py-3"
                      >
                        <span className="flex items-baseline gap-4">
                          <span className="font-mono text-[length:var(--text-meta)] tabular-nums text-[rgb(var(--text-muted))]">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span className="text-[length:var(--text-body-sm)] font-medium text-[rgb(var(--text))] transition-colors duration-200 group-hover:text-[rgb(var(--accent))]">
                            {section.label}
                          </span>
                          <ArrowUpRight
                            className="ml-auto h-3.5 w-3.5 shrink-0 self-center text-[rgb(var(--text-muted))] transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[rgb(var(--accent))]"
                            aria-hidden="true"
                          />
                        </span>
                        <span className="mt-1 block pl-[2.125rem] text-[length:var(--text-xs)] leading-snug text-[rgb(var(--text-dim))] sm:pl-[2.25rem]">
                          {section.description}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}