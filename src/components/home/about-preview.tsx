import { ArrowLink } from '@/components/ui/arrow-link'

/**
 * Homepage teaser for /about.
 *
 * Set as a full-bleed band on a slightly lighter surface. Every other homepage
 * block sits directly on the page background, so this one visibly changes the
 * ground the reader is standing on — a cheaper and more deliberate break than
 * yet another heading-and-paragraph pair.
 */
export function AboutPreview() {
  return (
    <section className="rule-top bg-[rgb(var(--surface))]">
      <div className="container-custom">
        <div className="rhythm-xl">
          <div className="grid gap-x-10 gap-y-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="eyebrow">About</p>
              <h2 className="heading-2 mt-6 max-w-[18ch] text-balance">
                Still figuring out the shape of it — and enjoying that part.
              </h2>
            </div>

            <div className="prose-block lg:col-span-5 lg:self-end lg:text-pretty">
              <p>
                I do not have a single job title that describes what I do, and I have stopped trying
                to find one. Some weeks that is web work, some weeks networking or tooling, and
                some weeks a sketch that turns into something.
              </p>
              <p>
                What stays constant is the process: pick something that looks interesting, learn
                enough to build it, then write down what surprised me.
              </p>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-[rgb(var(--border))] pt-8">
            <ArrowLink href="/about">More about me</ArrowLink>
            <p className="caption text-[rgb(var(--text-muted))]">
              Approach, tools, current obsessions
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
