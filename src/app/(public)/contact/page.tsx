import type { Metadata } from 'next'
import { Mail } from 'lucide-react'
import { ContactForm } from '@/components/contact/contact-form'
import { socialLinks, siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Questions about a project, an idea to collaborate on, or just to say hello.',
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  return (
    <>
      <section className="border-b border-[rgb(var(--border-subtle))]">
        <div className="container-custom py-16 sm:py-20 lg:py-24">
          <p className="eyebrow">Contact</p>
          <h1 className="heading-1 mt-5 max-w-3xl text-balance">Let&apos;s talk.</h1>
          <p className="body mt-6 max-w-2xl text-[rgb(var(--text-secondary))]">
            A question about something I built, an idea you want to explore, or feedback on a
            project — all welcome. I read everything and reply to most of it.
          </p>
        </div>
      </section>

      <section className="section-sm">
        <div className="container-custom">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            {/* ---- Form -------------------------------------------------- */}
            <div className="lg:col-span-7">
              <h2 className="heading-3">Send a message</h2>
              <p className="mt-3 max-w-lg text-[rgb(var(--text-secondary))]">
                Fill in the form and it will land in my inbox.
              </p>
              <div className="mt-8">
                <ContactForm />
              </div>
            </div>

            {/* ---- Direct channels ---------------------------------------- */}
            <aside className="lg:col-span-4 lg:col-start-9">
              <h2 className="heading-3">Or reach me directly</h2>

              <div className="mt-8 space-y-8">
                <div>
                  <p className="eyebrow">Email</p>
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="group mt-3 flex items-center gap-3 font-mono text-sm text-[rgb(var(--text-primary))] transition-colors hover:text-[rgb(var(--accent))]"
                  >
                    <Mail className="h-4 w-4 shrink-0 text-[rgb(var(--text-muted))]" aria-hidden="true" />
                    {siteConfig.email}
                  </a>
                </div>

                <div>
                  <p className="eyebrow">Social</p>
                  <ul className="mt-3 space-y-2.5">
                    {socialLinks.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[rgb(var(--text-secondary))] transition-colors hover:text-[rgb(var(--text-primary))]"
                        >
                          {link.label}
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-l border-[rgb(var(--border))] pl-5">
                  <p className="text-sm text-[rgb(var(--text-secondary))]">
                    Expect a reply within a few days. If it is urgent, say so in the subject line.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
