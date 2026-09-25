'use client'

import { interests } from '@/config/site'
import { Globe, Cpu, Network, Palette, FlaskConical } from 'lucide-react'

const interestIcons = {
  globe: Globe,
  cpu: Cpu,
  network: Network,
  palette: Palette,
  flask: FlaskConical,
}

export function Interests() {
  return (
    <section className="section bg-[rgb(var(--surface))] border-y border-[rgb(var(--border-subtle))]" aria-labelledby="interests-heading">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 id="interests-heading" className="heading-2">
            Areas of Interest
          </h2>
          <p className="mt-2 body text-[rgb(var(--text-secondary))] max-w-2xl mx-auto">
            Things I enjoy exploring and building with. These represent curiosity, not claimed expertise.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {interests.map((interest, index) => {
            const Icon = interestIcons[interest.icon as keyof typeof interestIcons] || Globe
            return (
              <article
                key={interest.title}
                className="card-hover p-6 text-center group animate-fade-in"
                style={{ animationDelay: `${(index + 1) * 0.1}s` }}
              >
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[rgb(var(--accent))/0.1] text-[rgb(var(--accent))] mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="h-7 w-7" aria-hidden="true" />
                </div>
                <h3 className="heading-4 mb-2">{interest.title}</h3>
                <p className="text-sm text-[rgb(var(--text-secondary))]">{interest.description}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}