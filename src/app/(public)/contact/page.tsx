import type { Metadata } from 'next'
import { ContactForm } from '@/components/contact/contact-form'
import { ArrowLink } from '@/components/ui/arrow-link'
import { socialLinks, siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Questions about a project, an idea to collaborate on, or just to say hello.',
  alternates: { canonical: '/contact' },
}

/**
 * Contact.
 *
 * The form is the primary column, not an afterthought, so it gets the wider
 * half of the spread. Direct channels collapse to a single hairline table
 * instead of two stacked cards with their own headings.
 */
export default function ContactPage() {
  return (
    <>
      <section>
        <div className="container-custom">
          <div className="grid gap-x-10 gap-y-10 py-14 sm:py-20 lg:grid-cols-12 lg:py-24">
            <div className="lg:col-span-7">
              <p className="eyebrow">Contact</p>
              <h1 className="heading-1 mt-6 max-w-[12ch] text-balance">Let&apos;s talk.</h1>
            </div>

            <p className="body-lg text-pretty text-[rgb(var(--text-secondary))] lg:col-span-5 lg:self-end">
              A question about something I built, an idea you want to explore, or feedback on a
              project — all welcome. I read everything and reply to most of it.
            </p>
          </div>
        </div>
      </section>

      <section className="rule-top">
        <div className="container-custom">
          <div className="rhythm-lg grid gap-x-10 gap-y-16 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h2 className="heading-3">Send a message</h2>
              <p className="mt-3 max-w-lg text-pretty text-[rgb(var(--text-secondary))]">
                Fill in the form and it will land in my inbox.
              </p>

              <div className="mt-10">
                <ContactForm />
              </div>
            </div>

            <aside className="lg:col-span-4 lg:col-start-9">
              <h2 className="heading-3">Or reach me directly</h2>

              <div className="mt-8">
                <p className="meta-label border-t border-[rgb(var(--border-subtle))] pt-5">Email</p>
                <a
                  href={siteConfig.contactEmail}
                  className="group mt-3 inline-block break-all font-mono text-sm text-[rgb(var(--text-primary))] transition-colors duration-150 hover:text-[rgb(var(--accent))]"
                >
                  {siteConfig.email}
                </a>

                <p className="meta-label mt-8 border-t border-[rgb(var(--border-subtle))] pt-5">
                  Social
                </p>
                <ul className="mt-4 space-y-3">
                  {socialLinks.map((link) => (
                    <li key={link.href}>
                      <ArrowLink href={link.href} direction="up" external>
                        {link.label}
                      </ArrowLink>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-8 border-t border-[rgb(var(--border-subtle))] pt-5 text-sm text-[rgb(var(--text-muted))]">
                Expect a reply within a few days. If it is urgent, say so in the subject line.
              </p>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
