import { Metadata } from 'next'
import { interests, currentlyExploring } from '@/config/site'
import { Globe, Cpu, Network, Palette, FlaskConical } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn more about me — a builder, explorer, and creator of digital projects.',
}

const interestIcons = {
  globe: Globe,
  cpu: Cpu,
  network: Network,
  palette: Palette,
  flask: FlaskConical,
}

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <section className="section border-b border-[rgb(var(--border-subtle))]">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="heading-1 mb-6">About Me</h1>
            <div className="prose prose-invert max-w-none text-[rgb(var(--text-secondary))] space-y-6">
              <p className="body-lg">
                Hi, I'm Kevin. I enjoy building things, exploring technology, and creating digital projects.
              </p>
              <p className="body-lg">
                This portfolio is a collection of experiments, applications, and ideas I've worked on over the years. 
                I don't position myself as a specialist in any single domain — I'm still exploring my direction. 
                What you'll find here are projects spanning web development, software, networking, design, 
                and various experiments. Some are polished, some are rough proofs of concept, all were built out of curiosity.
              </p>
              <p className="body-lg">
                My approach to projects is simple: start with curiosity, learn what's needed, build something tangible, 
                and share what I learned. I value clean code, thoughtful design, and the satisfaction of seeing an 
                idea become real.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="what-i-build-heading">
        <div className="container-custom">
          <h2 id="what-i-build-heading" className="heading-2 mb-10 text-center">
            What I Like Building
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {interests.map((interest, index) => {
              const Icon = interestIcons[interest.icon as keyof typeof interestIcons] || Globe
              return (
                <article key={interest.title} className="card-hover p-6 group animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[rgb(var(--accent))/0.1] text-[rgb(var(--accent))] mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="heading-4 mb-2">{interest.title}</h3>
                  <p className="text-sm text-[rgb(var(--text-secondary))]">{interest.description}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="section bg-[rgb(var(--surface))] border-y border-[rgb(var(--border-subtle))]" aria-labelledby="exploring-heading">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 id="exploring-heading" className="heading-2 mb-4">
              Currently Exploring
            </h2>
            <p className="body text-[rgb(var(--text-secondary))]">
              Topics and technologies I'm currently spending time with
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {currentlyExploring.map((topic, index) => (
              <span key={topic} className="badge-primary animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                {topic}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="approach-heading">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <h2 id="approach-heading" className="heading-2 mb-8 text-center">Personal Approach</h2>
            <div className="space-y-6">
              {[
                {
                  title: 'Curiosity First',
                  description: 'I follow what interests me. The best projects come from genuine curiosity, not external pressure.'
                },
                {
                  title: 'Learn by Building',
                  description: 'Theory is useful, but nothing teaches like shipping. I build to understand.'
                },
                {
                  title: 'Iterate Publicly',
                  description: 'Share work early, get feedback, improve. Perfect is the enemy of done.'
                },
                {
                  title: 'Cross-Pollinate Ideas',
                  description: 'The best insights come from connecting unrelated domains. I explore broadly on purpose.'
                },
              ].map((item, index) => (
                <article key={item.title} className="card p-6 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <h3 className="heading-4 mb-2">{item.title}</h3>
                  <p className="text-[rgb(var(--text-secondary))]">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}