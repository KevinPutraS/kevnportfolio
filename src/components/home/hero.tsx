'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, MousePointer2 } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden" aria-labelledby="hero-heading">
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[rgb(var(--accent))/0.05] blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[rgb(var(--accent))/0.03] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.03)_0%,_transparent_70%)]" />
      </div>

      <div className="relative container-custom py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in stagger-1">
            <h1 id="hero-heading" className="heading-1 gradient-text mb-6">
              BUILDING THINGS.<br />
              <span className="gradient-accent">EXPLORING IDEAS.</span>
            </h1>
          </div>
          <div className="animate-fade-in stagger-2">
            <p className="body-lg text-[rgb(var(--text-secondary))] max-w-2xl mx-auto mb-10 text-balance">
              I create digital projects — web applications, experiments, tools, and creative coding explorations. 
              Currently learning across the stack and building things that interest me.
            </p>
          </div>
          <div className="animate-fade-in stagger-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/projects">
              <Button size="lg" className="group">
                Explore Work
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="secondary" size="lg">
                About Me
              </Button>
            </Link>
          </div>
        </div>

        <div className="animate-fade-in stagger-4 mt-20">
          <div className="relative max-w-2xl mx-auto">
            <div className="relative aspect-video rounded-xl bg-[rgb(var(--surface))] border border-[rgb(var(--border-subtle))] overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[rgb(var(--accent))/0.1] mb-4">
                    <MousePointer2 className="h-8 w-8 text-[rgb(var(--accent))]" aria-hidden="true" />
                  </div>
                  <p className="text-[rgb(var(--text-muted))]">Interactive project showcase</p>
                  <p className="text-xs text-[rgb(var(--text-muted))] mt-2">Click to explore projects</p>
                </div>
              </div>
            </div>
            <Link 
              href="/projects" 
              className="absolute inset-0"
              aria-label="View all projects"
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce" aria-hidden="true">
        <MousePointer2 className="h-6 w-6 text-[rgb(var(--text-muted))]" />
      </div>
    </section>
  )
}