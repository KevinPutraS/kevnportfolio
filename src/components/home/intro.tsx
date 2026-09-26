import { siteConfig } from '@/config/site'

/**
 * Opening statement.
 *
 * Deliberately *not* the 4/8 label-plus-body split used by the other homepage
 * sections. Two columns of different width, with the pull-quote offset into the
 * second one, breaks the repetition and gives the page a wider, quieter moment
 * right after the dense hero.
 */
export function Intro() {
  return (
    <section className="rhythm-lg">
      <div className="container-custom">
        <div className="grid gap-x-10 gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <p className="eyebrow">Introduction</p>
          </div>

          <div className="lg:col-span-9">
            {/*
              Oversized pull-quote. `max-w-[26ch]` keeps the measure short
              enough that the last line is never a single orphaned word.
            */}
            <p className="heading-2 max-w-[26ch] text-balance">
              I like taking an idea from nothing to something that actually runs.
            </p>

            <div className="mt-10 grid gap-x-10 gap-y-6 sm:grid-cols-2">
              <div className="prose-block text-pretty">
                <p>
                  Most of what I make starts as a question: how a real-time game keeps state in
                  sync, what actually happens when a page loads, whether a weekend of curiosity
                  can produce something worth keeping.
                </p>
                <p>
                  The answers usually end up as a project. Some are polished, some are rough
                  experiments that taught me something and then sat on a hard drive.
                </p>
              </div>

              <div className="prose-block text-pretty">
                <p>
                  I keep both, and I write about the ones I learned the most from. I am not settled
                  on a single specialisation — a networking tool teaches me something a dashboard
                  never would.
                </p>
                <p>
                  Start with{' '}
                  <a href="/projects" className="link">
                    the work
                  </a>{' '}
                  or read{' '}
                  <a href="/about" className="link">
                    how I approach projects
                  </a>
                  .
                </p>
              </div>
            </div>

            <p className="caption mt-12 text-[rgb(var(--text-muted))]">
              {siteConfig.name} — updated as things get made
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
