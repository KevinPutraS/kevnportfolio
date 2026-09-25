'use client'

import { currentlyExploring } from '@/config/site'

export function CurrentlyExploring() {
  return (
    <section className="section" aria-labelledby="exploring-heading">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 id="exploring-heading" className="heading-2">
            Currently Exploring
          </h2>
          <p className="mt-2 body text-[rgb(var(--text-secondary))] max-w-2xl mx-auto">
            Topics and technologies I'm currently spending time with
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {currentlyExploring.map((topic, index) => (
            <span
              key={topic}
              className="badge-primary animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {topic}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}