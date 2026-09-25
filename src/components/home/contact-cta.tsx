'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Mail, ArrowRight } from 'lucide-react'

export function ContactCTA() {
  return (
    <section className="section bg-[rgb(var(--surface))] border-y border-[rgb(var(--border-subtle))]" aria-labelledby="contact-cta-heading">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto text-center">
          <h2 id="contact-cta-heading" className="heading-2 mb-4">
            Let's Build Something
          </h2>
          <p className="body text-[rgb(var(--text-secondary))] mb-8">
            Have a project in mind? Questions about my work? Just want to say hello?
            I'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact">
              <Button size="lg" className="group w-full sm:w-auto">
                <Mail className="h-4 w-4 mr-2" aria-hidden="true" />
                Get in Touch
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/projects">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                View Projects
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}