import { siteConfig } from '@/config/site'

/** Short personal introduction. Sets expectations without over-claiming. */
export function Intro() {
  return (
    <section className="section">
      <div className="container-custom">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow">Introduction</p>
          </div>

          <div className="lg:col-span-8">
            <p className="heading-3 text-balance">
              I like taking an idea from nothing to something that actually runs.
            </p>

            <div className="prose-block mt-8 max-w-2xl text-[rgb(var(--text-secondary))]">
              <p>
                Most of what I make starts as a question: how does a real-time multiplayer game keep
                state in sync, what happens under the hood when a page loads, can a weekend of
                curiosity produce something worth keeping.
              </p>
              <p>
                The answers usually end up as a project. Some of them are polished, some are rough
                experiments that taught me something and then sat on a hard drive. I keep both, and
                I write about the ones I learned the most from.
              </p>
            </div>

            <p className="mt-8 max-w-2xl text-[rgb(var(--text-secondary))]">
              I&apos;m not settled on a single specialisation yet — and I think that&apos;s the point.
              A networking tool teaches me something a dashboard never would. Have a look at{' '}
              <a href="/projects" className="link">
                the work
              </a>{' '}
              or read more on{' '}
              <a href="/about" className="link">
                how I approach projects
              </a>
              .
            </p>

            <p className="caption mt-10 text-[rgb(var(--text-muted))]">
              {siteConfig.name} — updated regularly
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
