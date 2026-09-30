import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
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
 * From `lg` the hero is a deliberate two-column sheet: the statement column is
 * ~58% wide, the index ~42%, split by a vertical rule at the index's left edge.
 * The sheet fills the viewport below the header (`min-h-[calc(100svh-4rem)]`,
 * with the columns centred in it) and caps itself at 84rem, so at 1440px the
 * columns stop growing and the composition stays tight. All of it is `lg:`-
 * prefixed: phones and tablets keep the stacked, padded-layout hero untouched.
 *
 * Server Component, but synchronous — no database call — so it is trivially
 * static. The type scale is fluid, so the headline holds at 320px and at 1440px
 * with no breakpoint of its own.
 *
 * The hero also sets the reading order for the whole page, and the brief it has
 * to satisfy is that the visitor's eye lands on the name first and the
 * decoration last. That is a measurable property rather than a matter of taste,
 * so the backdrop is not tuned by eye: see the HERO BACKDROP block in
 * `globals.css`, where the plate's measured luminance under each column is the
 * number that decides whether the scrims are strong enough.
 */
export function Hero() {
  return (
    <section className="relative">
      {/*
        The backdrop is work by the site's owner, mounted in two cuts. The swap is
        at `md`, not `lg`: it follows the shape of the box rather than the number
        of columns. The hero is already 704px wide at 768px, and `cover` on a
        portrait plate in a wide, short box crops it to a narrow centre slice —
        which measured *less* texture at 768px than at 390px. The wide plate goes
        with the wide box; the two-column layout still begins at `lg`.

        Both sit below the words. Their intensity, framing and drift live in
        `.hero-backdrop` rather than here, because the measurements that justify
        them are about luminance against the page background and there is no way
        to express that as a class list on the element. `.hero-veil` is the second
        layer: the scrim that keeps the artwork out from under the two text
        columns without flattening the margins where it is meant to be seen, and
        `.hero-column` carries that per column.
      */}
      <div
        aria-hidden="true"
        className="hero-backdrop hidden md:block"
        style={{ backgroundImage: "url('/images/bgdesktop.webp')" }}
      />
      <div
        aria-hidden="true"
        className="hero-backdrop md:hidden"
        style={{ backgroundImage: "url('/images/bgmobile.webp')" }}
      />
      <div aria-hidden="true" className="hero-veil" />

      {/*
        The container is `container-custom` and nothing else. It used to carry
        `lg:max-w-[84rem]`, which made the hero a wider sheet than every section
        below it: at 1440px the hero's text began at x=104 while Featured
        Projects, About and the contact CTA all began at x=200, a 96px step in
        the left edge directly under the fold. Two columns of that composition
        did not need the extra 192px, and the misalignment was the more expensive
        of the two. Sharing the page's own 72rem also does the large-desktop work
        for free — the columns stop growing at 1152px and stay a fixed distance
        apart out to 1920px instead of drifting apart.
      */}
      <div className="container-custom relative z-10 lg:flex lg:min-h-[calc(100svh-4rem)] lg:flex-col">
        <div className="flex items-center justify-between gap-6 border-b border-[rgb(var(--border))] py-4">
          {/*
            `meta-strong` rather than `eyebrow`/`meta`, and the reason is the one
            measurement that matters here: `--text-muted` (116 117 136) is 4.37:1
            against `--bg` (9 9 15), just under the 4.5:1 WCAG AA asks of text
            this size, so a label set in it is not passing contrast, however
            quiet it looks. `--text-dim` (169 170 186) is 8.6:1.

            Both sides of this bar carry real text, so both are moved together;
            the border between them is what separates them, not a weight
            difference. Reusing the existing token is also what keeps this from
            becoming a specificity fight: `eyebrow` and `meta` are unlayered
            classes, so a `text-[...]` utility would silently lose.
          */}
          <p className="meta-strong">
            {siteConfig.descriptor}
            <span aria-hidden="true" className="px-2 text-[rgb(var(--border-strong))]">
              /
            </span>
            {new Date().getFullYear()}
          </p>
          <p className="meta-strong hidden sm:block">Web · Software · Design · Experiments</p>
        </div>

        {/*
          Name, statement, then the site index.

          On desktop the headline and the index sit side by side. On mobile the
          index is pushed below both columns with `order-2`, which gives the
          order the brief asks for: metadata, name, statement, primary call to
          action, secondary call to action, and only then the index. The two
          calls to action are the last thing between a phone visitor and the
          work, and the index is the answer to a question they can still ask
          after tapping one of them.

          The track split is 7/5 of a 12-column grid. That is 57% to the
          statement and 39% to the index, with a 48px gutter between them, so
          the left column stays the wider and louder of the two without the
          index being squeezed into a sidebar.
        */}
        <div className="grid gap-x-12 gap-y-10 py-12 sm:py-20 lg:grid-cols-12 lg:flex-1 lg:items-center lg:gap-y-0 lg:py-0">
          <div className="hero-column lg:col-span-7">
            <h1 className="display-1 animate-fade-in">
              {/*
                Solid, not a gradient. A gradient fill across a display-size name
                is the single loudest "generated" signal there is, and it cost
                more legibility than it bought: the middle stop landed near the
                background, so the centre of the name was the dimmest part of it.
              */}
              <span className="block text-[rgb(var(--text))]">
                {siteConfig.personName}
                {/*
                  The accent mark after the name. Present on desktop only, where
                  the two-column hero is the centrepiece: a small solid square
                  that echoes the sculpture's single accent hue. `em`-sized so it
                  scales with the fluid display type, and aligned to the text
                  baseline so it does not float in the cap height.
                */}
                <span
                  aria-hidden="true"
                  className="hidden text-[rgb(var(--accent))] lg:ml-4 lg:inline-block lg:h-[0.3em] lg:w-[0.3em] lg:rounded-[3px] lg:bg-[rgb(var(--accent))] lg:align-baseline"
                />
              </span>
              {/*
                `max-w-xl` is a measure, not a size. At the 26px the fluid
                `--text-h3` resolves to on a desktop, the statement sets on two
                lines of roughly 44 characters — inside the 45–75 that reads
                without effort, and well short of running the full 587px column
                and becoming a line the eye has to travel back along.

                Deliberately *not* narrowed to a single line and deliberately
                still the broad positioning sentence it has always been. "Full-
                Stack Developer" would be narrower information in more type.
              */}
              <span className="mt-6 block max-w-xl font-sans text-[length:var(--text-lead)] font-normal leading-[1.35] tracking-[-0.01em] text-[rgb(var(--text-dim))] text-balance sm:mt-7 sm:text-[length:var(--text-h3)] sm:leading-[1.28]">
                {siteConfig.heroStatement}
              </span>
            </h1>

            {/*
              Both buttons are full width on a phone and sit side by side from
              `sm`. Stacked full-width controls are the right call at 360px and
              the wrong one from 480px up, where a half-empty column of buttons
              reads as a layout that has not finished.

              The hierarchy is carried by the fill rather than by an added
              effect: the primary is the only solid accent on the page, and the
              secondary is a quiet raised surface. The arrow is on the primary
              alone, so the two are distinguishable by their silhouette at a
              glance and not only by colour.
            */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 lg:mt-12">
              <ButtonLink href="/projects" size="lg" className="w-full sm:w-auto">
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
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

            The row is a three-track grid — number, text, arrow — so the
            description starts under the section title at any viewport without a
            hand-tuned left padding pretending to know how wide "01" is. It used
            to carry `pl-[2.125rem]`, which is the width of two mono digits plus
            a 1rem gap on one font size and wrong on every other.
          */}
          <aside className="hero-column order-2 lg:order-none lg:col-span-5 lg:col-start-8">
            {/*
              The index's frame changes with the layout. Below `lg` it is a
              section of its own with a rule above it. From `lg` the rule moves
              to the left edge and becomes the vertical divider between the two
              hero columns, and `lg:pt-0 lg:pl-10` trades the old top padding
              for room against the new edge.
            */}
            <div className="border-t border-[rgb(var(--border))] pt-6 lg:mt-0 lg:border-l lg:border-t-0 lg:pb-0 lg:pl-10 lg:pt-0">
              <p className="meta-strong">On this site</p>

              <nav aria-label="Site sections" className="mt-5">
                <ol>
                  {siteConfig.sections.map((section, i) => (
                    <li key={section.href} className="border-t border-[rgb(var(--border))]">
                      <Link
                        href={section.href}
                        className="group grid grid-cols-[2ch_1fr_auto] items-baseline gap-x-4 py-3.5"
                      >
                        {/*
                          The number is `--text-dim` rather than `--text-muted`.
                          The muted token measures 4.39:1 against the page
                          background, just under the 4.5:1 that WCAG AA asks of
                          body text, and these are body-size labels. `--text-dim`
                          is 8.6:1, and the hierarchy it would have cost is
                          recovered by size and face instead: the title is sans
                          at 15px against a mono numeral at 12px.
                        */}
                        <span className="font-mono text-[length:var(--text-meta)] tabular-nums text-[rgb(var(--text-dim))]">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="text-[length:var(--text-body-sm)] font-medium text-[rgb(var(--text))] transition-colors duration-200 group-hover:text-[rgb(var(--accent))]">
                          {section.label}
                        </span>
                        {/*
                          Small and out of the way. It grows and travels on
                          hover, which is the whole affordance: a static arrow
                          competes with the title for the same line.
                        */}
                        <ArrowUpRight
                          className="h-3 w-3 shrink-0 translate-y-0.5 text-[rgb(var(--text-muted))] transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[rgb(var(--accent))]"
                          aria-hidden="true"
                        />
                        <span className="col-start-2 text-[length:var(--text-xs)] leading-[1.55] text-[rgb(var(--text-dim))]">
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