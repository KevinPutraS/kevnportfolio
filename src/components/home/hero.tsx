import Link from 'next/link'
import { ButtonLink } from '@/components/ui/button-link'
import { ArrowLink } from '@/components/ui/arrow-link'
import { getProjects } from '@/lib/db/projects'
import { siteConfig, currentlyExploring } from '@/config/site'

/**
 * Hero.
 *
 * Answers four questions in the first screen: whose site, what it is, what is
 * inside, where to start. The name is the largest element because it is the only
 * thing a visitor cannot infer.
 *
 * The section map underneath is real navigation built from
 * `siteConfig.sections`, so it cannot drift from the header, and each entry gets
 * one line about what is actually in that section — a visitor can pick a
 * destination without opening it first.
 *
 * Server Component, async so the preview tiles below can read real projects. The
 * type scale is fluid, so the headline holds at 320px and at 1440px with no
 * breakpoint of its own.
 */
export async function Hero() {
  // Three projects: one wide tile across the top, two beneath. Three is the
  // smallest number that fills the block without an orphan row.
  const { projects: preview, total: previewTotal } = await getProjects({ page: 1 })
  const tiles = preview.slice(0, 3)
  return (
    <section className="relative overflow-hidden">
      {/* Depth. Two soft pools of accent light and a fine grid, all decorative. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/4 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[rgb(var(--accent))]/10 blur-[130px]" />
        <div className="absolute -right-24 top-1/4 h-[28rem] w-[28rem] rounded-full bg-[rgb(var(--cat-design))]/10 blur-[130px]" />
        <div className="absolute -left-24 bottom-0 h-[24rem] w-[24rem] rounded-full bg-[rgb(var(--cat-app))]/8 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
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
          <p className="eyebrow animate-fade-in">
            {siteConfig.descriptor}
            <span aria-hidden="true" className="px-2 text-[rgb(var(--border-strong))]">
              /
            </span>
            {new Date().getFullYear()}
          </p>
          <p className="meta hidden sm:block">Projects · Experience · Certificates</p>
        </div>

        {/* Name, statement and a preview of the work.
          *
          * The previous version ran the name across the full width with nothing
          * beside it, which left the right half of the first screen empty on a
          * desktop and made the hero read as a title card rather than an
          * introduction. The work itself is the best thing that can fill it, so
          * the newest projects sit here as a stacked preview.
          *
          * On mobile the images drop below the text: the name is the priority at
          * every width, and a photo above it would push the headline down the
          * screen.
          */}
        {/* Name, statement, preview, then the longer copy.
          *
          * On desktop the headline and the preview sit side by side. On mobile
          * the order is explicit: headline, then the preview, then the support
          * copy — the previous version put three paragraphs of text and two
          * buttons before the first image, so on a phone the hero was a wall of
          * words with the work buried below the fold.
          *
          * `order` is doing real work here and is not incidental: it is the
          * whole reason the mobile hero is not a reading exercise.
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

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 lg:mt-10">
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
            <div className="relative overflow-hidden rounded-2xl border border-[rgb(var(--border))] p-5 sm:p-6">
              {/* Colour field. Four overlapping radial washes in the category
                  hues, so the panel has depth and colour without an image. */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[rgb(var(--accent))]/25 blur-3xl" />
                <div className="absolute -right-8 top-8 h-36 w-36 rounded-full bg-[rgb(var(--cat-design))]/25 blur-3xl" />
                <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-[rgb(var(--cat-app))]/25 blur-3xl" />
                <div className="absolute bottom-6 right-6 h-24 w-24 rounded-full bg-[rgb(var(--cat-networking))]/20 blur-2xl" />
              </div>

              <div className="relative">
                <p className="eyebrow">Right now</p>

                <ul className="mt-3.5 flex flex-wrap gap-1.5" role="list">
                  {currentlyExploring.slice(0, 3).map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-[rgb(var(--border-strong))] bg-[rgb(var(--bg))]/70 px-3 py-1.5 text-[length:var(--text-xs)] text-[rgb(var(--text-dim))] backdrop-blur-sm"
                    >
                      {item}
                    </li>
                  ))}
                </ul>

                <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-[rgb(var(--border))] pt-5">
                  <div>
                    <dt className="meta">Projects</dt>
                    <dd className="mt-1 font-display text-2xl font-bold tracking-[-0.03em] text-[rgb(var(--text))] tabular-nums">
                      {String(previewTotal).padStart(2, '0')}
                    </dd>
                  </div>
                  {preview.length > 0 && (
                    <div className="min-w-0">
                      <dt className="meta">Latest</dt>
                      <dd className="mt-1 truncate font-display text-2xl font-bold tracking-[-0.03em] text-[rgb(var(--cat-app))]">
                        {preview[0].title}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="meta">Focus</dt>
                    <dd className="mt-1 font-display text-2xl font-bold tracking-[-0.03em] text-[rgb(var(--cat-design))]">
                      Open
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </aside>
        </div>

      </div>
    </section>
  )
}
