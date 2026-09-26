import { ArrowUpRight, Cpu, FlaskConical, Globe, Network, Palette } from 'lucide-react'
import { interests } from '@/config/site'

/**
 * Areas of interest. Framed as exploration rather than expertise: no years,
 * no proficiency levels, no claims of specialisation.
 */
const ICONS = {
  globe: Globe,
  cpu: Cpu,
  network: Network,
  palette: Palette,
  flask: FlaskConical,
} as const

export function Interests() {
  return (
    <section className="section border-t border-[rgb(var(--border-subtle))]">
      <div className="container-custom">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow">What draws me in</p>
            <h2 className="heading-2 mt-4 text-balance">Areas of interest</h2>
            <p className="mt-6 max-w-sm text-[rgb(var(--text-secondary))]">
              There is no single lane here. These are the areas I keep circling back to — some with
              more depth than others, all of them still in progress.
            </p>
          </div>

          <ul className="grid gap-px border border-[rgb(var(--border-subtle))] bg-[rgb(var(--border-subtle))] sm:grid-cols-2 lg:col-span-8">
            {interests.map((interest) => {
              const Icon = ICONS[interest.icon as keyof typeof ICONS] ?? Globe
              return (
                <li
                  key={interest.title}
                  className="group bg-[rgb(var(--background))] p-6 transition-colors duration-200 hover:bg-[rgb(var(--surface))] sm:p-8"
                >
                  <Icon
                    className="h-5 w-5 text-[rgb(var(--accent))]"
                    aria-hidden="true"
                  />
                  <h3 className="mt-5 font-display text-lg font-semibold tracking-tight">
                    {interest.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[rgb(var(--text-secondary))]">
                    {interest.description}
                  </p>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
