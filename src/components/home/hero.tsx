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

        Both sit below the words, and both are `aria-hidden`. Their intensity,
        framing and drift live in CSS rather than here, because the measurements
        that justify them are about luminance against the page background and
        there is no way to express that as a class list on the element.

        `--composed` is the asymmetric treatment: subject pushed right, opacity
        down to 0.28, and a scrim split so the plate is hidden behind the type
        column and left visible behind the index. The base `.hero-backdrop` and
        `.hero-veil` are the centred version and stay in the stylesheet for the
        measurement notes that justify them; see HERO — COMPOSED VARIANT in
        `globals.css`.
      */}
      <div
        aria-hidden="true"
        className="hero-backdrop hero-backdrop--composed hidden md:block"
        style={{ backgroundImage: "url('/images/bgdesktop.webp')" }}
      />
      <div
        aria-hidden="true"
        className="hero-backdrop hero-backdrop--composed md:hidden"
        style={{ backgroundImage: "url('/images/bgmobile.webp')" }}
      />
      <div aria-hidden="true" className="hero-veil hero-veil--composed" />

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
            `meta-strong` rather than `eyebrow`/`meta`, because `--text-muted`
            measures 5.29:1 against `--bg` and this bar is real text at the small
            end of the scale. Both sides carry content, so both are moved
            together; the border between them is what separates them, not a
            weight difference. Reusing the token also avoids a specificity fight:
            `eyebrow` and `meta` are unlayered classes, so a `text-[...]`
            utility would silently lose to them.
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
          MASTHEAD.

          The name sits alone across the full trim at `.display-0`, and everything
          else — statement, calls to action, site index — is set below it in a
          ruled row. That is the structural change in the redesign: this used to
          be a left-hand column with the name inside it and the index filling the
          right, which is the shape of a SaaS hero and reads as one however the
          type is set. A masthead is a different object. The nameplate is the
          first thing on the page and the largest, and the supporting matter is
          subordinate to it by position rather than by weight — the name is not
          competing with a sidebar, because there is no sidebar.

          The `border-t` on the row below is the hinge: it is the same 1px
          hairline that separates every other section on the site, used once here
          to say "the nameplate ends here".
        */}
        <div className="flex flex-1 flex-col justify-center py-12 sm:py-16 lg:py-0">
          <h1 className="display-0 animate-fade-in">
            {/*
              Solid, not a gradient. A gradient fill across a display-size name is
              the loudest "generated" signal there is, and it cost legibility as
              well: the middle stop landed near the background, so the centre of
              the name was the dimmest part of it.
            */}
            <span className="text-[rgb(var(--text))]">
              {siteConfig.personName}
              {/*
                The accent full stop. Punctuation on the name, not decoration on
                the layout, so every width gets it — it used to be `hidden` below
                `lg`, and a missing full stop on the one element the site is named
                after reads as an oversight. Sized in `em` so it tracks the fluid
                masthead, and square rather than round because every radius token
                on the site is now zero except the shapes that are round as
                shapes.
              */}
              <span
                aria-hidden="true"
                className="ml-[0.06em] inline-block h-[0.16em] w-[0.16em] bg-[rgb(var(--accent))] align-baseline"
              />
            </span>
          </h1>

          {/*
            Three tracks under the nameplate: the statement, the calls to action,
            and the site index. 5 / 3 / 4 of twelve.

            The split is not arbitrary. The statement is the widest because it is
            the longest thing here and the only one written in prose; the actions
            are narrow because a button does not need room; the index keeps four
            tracks because its rows are a number, a label and a line of
            description, and at three it wrapped every description to two lines.
          */}
          <div className="mt-10 grid gap-x-10 gap-y-10 border-t border-[rgb(var(--border))] pt-8 lg:mt-14 lg:grid-cols-12 lg:gap-y-0">
            {/*
              `max-w-[26ch]` rather than `max-w-xl`. The statement is set at the
              open end of the scale on desktop, and at 5 tracks `max-w-xl` capped
              it well short of the column — which left the statement looking
              narrower than the space it was given, the exact complaint that
              applies to every centred hero ever shipped.
            */}
            <div className="lg:col-span-5">
              <p className="max-w-[26ch] font-sans text-[length:var(--text-lead)] font-normal leading-[1.32] tracking-[-0.012em] text-[rgb(var(--text-dim))] text-pretty lg:text-[length:var(--text-h3)] lg:leading-[1.26]">
                {siteConfig.heroStatement}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 lg:mt-10">
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
              cards, because these rows read as a table of contents and identical
              cards would read as shapes.

              The row is a three-track grid — number, text, arrow — so the
              description starts under the section title at any viewport without a
              hand-tuned left padding pretending to know how wide "01" is.
            */}
            <aside className="lg:col-span-4 lg:col-start-9">
              <p className="meta-strong">On this site</p>

              <nav aria-label="Site sections" className="mt-4">
                <ol>
                  {siteConfig.sections.map((section, i) => (
                    <li key={section.href} className="border-t border-[rgb(var(--border))]">
                      <Link
                        href={section.href}
                        className="group grid grid-cols-[2ch_1fr_auto] items-baseline gap-x-4 py-3"
                      >
                        {/*
                          `--text-dim` rather than `--text-muted`: these are
                          body-size labels, and the hierarchy is recovered by size
                          and face instead — sans at 15px against a mono numeral
                          at 12px.
                        */}
                        <span className="font-mono text-[length:var(--text-meta)] tabular-nums text-[rgb(var(--text-dim))]">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="text-[length:var(--text-body-sm)] font-medium text-[rgb(var(--text))] transition-colors duration-200 group-hover:text-[rgb(var(--accent))]">
                          {section.label}
                        </span>
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
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}
