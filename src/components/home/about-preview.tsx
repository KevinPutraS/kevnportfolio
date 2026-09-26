import { ButtonLink } from '@/components/ui/button-link'

/** Short teaser for /about with a single clear next step. */
export function AboutPreview() {
  return (
    <section className="section border-t border-[rgb(var(--border-subtle))]">
      <div className="container-custom">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow">About</p>
          </div>

          <div className="lg:col-span-8">
            <h2 className="heading-2 text-balance">
              Still figuring out the shape of it — and enjoying that part.
            </h2>

            <div className="prose-block mt-8 max-w-2xl">
              <p>
                I do not have a single job title that describes what I do, and I have stopped trying
                to find one. Some weeks that is web work, some weeks it is networking or tooling,
                and some weeks it is a sketch that turns into something.
              </p>
              <p>
                What stays constant is the process: pick something that looks interesting, learn
                enough to build it, then write down what surprised me.
              </p>
            </div>

            <div className="mt-10">
              <ButtonLink href="/about" variant="secondary">
                More about me
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
