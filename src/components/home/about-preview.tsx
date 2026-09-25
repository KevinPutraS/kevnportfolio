'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function AboutPreview() {
  return (
    <section className="section" aria-labelledby="about-preview-heading">
      <div className="container-custom">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <h2 id="about-preview-heading" className="heading-2 mb-6">
              Always Learning
            </h2>
            <div className="prose prose-invert max-w-none text-[rgb(var(--text-secondary))]">
              <p className="body-lg mb-6">
                I'm not a specialist — I'm an explorer. My background spans coursework, personal experiments, 
                and collaborative projects across different areas of technology.
              </p>
              <p className="body-lg mb-6">
                This portfolio reflects that journey. You'll find web applications, API experiments, 
                networking projects, creative coding sketches, and design explorations. Some are complete, 
                some are works in progress, all represent genuine curiosity.
              </p>
              <p className="body-lg">
                The common thread? I enjoy the process of taking an idea from concept to reality, 
                learning whatever's needed along the way.
              </p>
            </div>
          </div>
          <div className="lg:pl-12">
            <Link href="/about">
              <Button variant="secondary" size="lg" className="group w-full justify-center">
                Read More About Me
                <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}