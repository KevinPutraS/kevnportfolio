import { ArrowLink } from '@/components/ui/arrow-link'
import { ButtonLink } from '@/components/ui/button-link'
import { getProjects } from '@/lib/db/projects'
import { siteConfig, currentlyExploring } from '@/config/site'

/**
 * Hero.
 *
 * Answers four questions in the first screen: whose site, what it is, what is
 * inside, where to start. The name is the largest element because it is the only
 * thing a visitor cannot infer.
 *
 * Server Component, async so the counters below can read real row counts. The
 * type scale is fluid, so the headline holds at 320px and at 1440px with no
 * breakpoint of its own.
 */
export async function Hero() {
  // The `total` is a COUNT from the same query, so the number in the hero is
  // the real number of published projects rather than the length of a page of
  // them — the old version showed `03` forever because it counted a slice.
  const { total: projectCount } = await getProjects({ page: 1 })

  const year = new Date().getFullYear()

  return (
    <section className="relative overflow-hidden">
      {/*
        Depth: three soft pools of colour light plus a fading grid.

        `-z-10` is safe here and only here because `main` is `relative z-10` and
        therefore establishes a stacking context. The pools are painted behind
        the hero's own content but still above the layout's fixed `page-depth`
        overlay, so the two layers never fight.
      */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/4 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[rgb(var(--accent)/0.1)] blur-[130px]" />
        <div className="absolute -right-24 top-1/4 h-[28rem] w-[28rem] rounded-full bg-[rgb(var(--cat-design)/0.1)] blur-[130px]" />
        <div className="absolute -left-24 bottom-0 h-[24rem] w-[24rem] rounded-full bg-[rgb(var(--cat-app)/0.08)] blur-[120px]" />
        <div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgb(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--border)) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)',
          }}
        />
      </div>

      <div className="container-custom">
        <div className="flex items-center justify-between gap-6 border-b border-[rgb(var(--border))] py-4">
          <p className="eyebrow">
            {siteConfig.descriptor}
            <span aria-hidden="true" className="px-2 text-[rgb(var(--border-strong))]">
              /
            </span>
            {year}
          </p>
          <p className="meta hidden sm:block">Projects · Experience · Certificates</p>
        </div>

        {/*
          Name, statement, preview, then the longer copy.

          On desktop the headline and the panel sit side by side. On mobile the
          order is explicit: headline, then the panel, then the buttons — the
          previous version put three paragraphs of text and two buttons before
          the first image, so on a phone the hero was a wall of words with the
          work buried below the fold.

          `order` is doing real work here and is not incidental: it is the whole
          reason the mobile hero is not a reading exercise.
        */}
        <div className="grid gap-x-12 gap-y-8 py-12 sm:gap-y-10 sm:py-20 lg:grid-cols-12 lg:py-24">
          <div className="order-1 lg:col-span-7">
            <h1 className="display-1 animate-fade-in">
              <span className="block bg-gradient-to-r from-[rgb(var(--accent))] via-[rgb(var(--cat-design))] to-[rgb(var(--cat-app))] bg-clip-text text-transparent">
                {siteConfig.personName}
              </span>
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
            <div className="order-3 mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 lg:mt-10">
              <ButtonLink href="/projects" size="lg" className="w-full sm:w-auto">
                View projects
              </ButtonLink>
              <ArrowLink href="/about" className="justify-center sm:justify-start">
                About me
              </ArrowLink>
            </div>
          </div>

          {/*
            The visual, visible at every width.

            It was `hidden lg:block` for a while, which left the mobile hero as
            nothing but a name and two buttons — text with no image, which read
            as an unfinished screen. It is back on mobile, redesigned: a colour
            field built from the category palette with the "right now" chips
            sitting on it.

            Deliberately not a project screenshot. With one project published,
            any project image here would be the same tile again a few hundred
            pixels below in the featured grid — a visible duplicate, which is
            worse than no image at all. This carries the only thing the grid
            cannot: what is in progress.
          */}
          <aside className="order-2 lg:order-none lg:col-span-5">
            <div className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-[rgb(var(--border))] p-5 sm:p-6">
              {/* Colour field. Four overlapping radial washes in the category
                  hues, so the panel has depth and colour without an image. */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[rgb(var(--accent)/0.25)] blur-3xl" />
                <div className="absolute -right-8 top-8 h-36 w-36 rounded-full bg-[rgb(var(--cat-design)/0.25)] blur-3xl" />
                <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-[rgb(var(--cat-app)/0.25)] blur-3xl" />
                <div className="absolute bottom-6 right-6 h-24 w-24 rounded-full bg-[rgb(var(--cat-networking)/0.2)] blur-2xl" />
              </div>

              <div className="relative">
                <p className="eyebrow">Right now</p>

                <ul className="mt-3.5 flex flex-wrap gap-1.5" role="list">
                  {currentlyExploring.slice(0, 3).map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-[rgb(var(--border-strong))] bg-[rgb(var(--bg)/0.7)] px-3 py-1.5 text-[length:var(--text-xs)] text-[rgb(var(--text-dim))] backdrop-blur-sm"
                    >
                      {item}
                    </li>
                  ))}
                </ul>

                {/*
                  One real number instead of three decorative ones.

                  The previous panel had "Projects / 03", a truncated project
                  title under a "Latest" label that overflowed its own column,
                  and "Focus / Open" — a word that means nothing as a statistic.
                  Only the project count survives, because it is the one figure
                  here that is actually true and actually interesting. A single
                  figure gets a full-width row rather than a third of a
                  three-column grid, so it is not visually competing with two
                  things that are not there.
                */}
                <div className="mt-6 flex items-baseline justify-between gap-4 border-t border-[rgb(var(--border))] pt-5">
                  <span className="meta">Published projects</span>
                  <span className="font-display text-3xl font-bold tracking-[-0.03em] tabular-nums text-[rgb(var(--text))]">
                    {String(projectCount).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
