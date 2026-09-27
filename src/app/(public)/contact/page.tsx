import type { Metadata } from 'next'
import { ContactForm } from '@/components/contact/contact-form'
import { ArrowLink } from '@/components/ui/arrow-link'
import { PageHeader } from '@/components/ui/page-header'
import { socialLinks, siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Questions about a project, an idea to collaborate on, or just to say hello.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: `Contact — ${siteConfig.name}`,
    description: 'Questions, collaborations, or just to say hello.',
    url: '/contact',
  },
}

/**
 * Read at request time, not build time.
 *
 * Without this the page is statically prerendered, `formDelivers` is frozen at
 * build, and adding `CONTACT_WEBHOOK_URL` later without a rebuild leaves the
 * page asserting the form is broken when it is not — the exact failure this
 * copy change exists to prevent. One server-rendered page is a cheap price for
 * a promise that stays true.
 */
export const dynamic = 'force-dynamic'

/**
 * Contact.
 *
 * The form is the primary column, not an afterthought, so it gets the wider
 * half of the spread. Direct channels collapse to a single hairline table
 * instead of two stacked cards with their own headings.
 *
 * On the copy: this page used to promise the form "goes straight to me", which
 * is not true in every deployment. `/api/contact` only forwards when
 * `CONTACT_WEBHOOK_URL` is configured; otherwise it returns `delivered: false`
 * and asks the visitor to email instead. So the promise is now conditional on
 * the same check, read here on the server.
 *
 * The check is deliberately NOT a `NEXT_PUBLIC_` variable — a webhook URL is a
 * secret endpoint, and prefixing it would ship it to the browser. It stays
 * server-side, this is a Server Component, and only the resulting boolean
 * reaches the client.
 */
export default function ContactPage() {
  const formDelivers = Boolean(process.env.CONTACT_WEBHOOK_URL?.trim())
  return (
    <>
      <div className="container-custom">
        <PageHeader
          eyebrow="Contact"
          title="Let&apos;s work together."
          lede="A question about something I built, an idea you want to explore, or feedback on a project — all welcome. I read everything and reply to most of it."
        />
      </div>

      <section className="rule-top">
        <div className="container-custom">
          <div className="rhythm-lg grid gap-x-10 gap-y-16 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h2 className="heading-3">Send a message</h2>
              <p className="mt-3 max-w-lg text-pretty text-[rgb(var(--text-secondary))]">
                {formDelivers
                  ? 'Fill this in and it goes straight to me. If you would rather not use a form, the email address on the right reaches the same place.'
                  : 'Email is the most reliable way to reach me — the address on the right goes straight to my inbox. The form below is not connected to an inbox yet, so nothing sent through it will arrive; please use email for now.'}
              </p>

              {!formDelivers && (
                <p
                  className="mt-5 border-l-2 border-[rgb(var(--warning))] pl-4 text-[length:var(--text-body-sm)] text-pretty text-[rgb(var(--text-secondary))]"
                >
                  This is a limitation of the site, not something you did wrong.
                </p>
              )}

              <div className="mt-10">
                <ContactForm />
              </div>
            </div>

            <aside className="lg:col-span-4 lg:col-start-9">
              <h2 className="heading-3">Or reach me directly</h2>

              <div className="mt-8">
                <p className="label border-t border-[rgb(var(--border-subtle))] pt-5">Email</p>
                <a
                  href={siteConfig.contactEmail}
                  className="group mt-2 inline-flex min-h-11 items-center break-all text-[length:var(--text-body-sm)] text-[rgb(var(--text-primary))] transition-colors duration-150 hover:text-[rgb(var(--accent))]"
                >
                  {siteConfig.email}
                </a>

                <p className="label mt-8 border-t border-[rgb(var(--border-subtle))] pt-5">
                  Social
                </p>
                <ul className="mt-1 space-y-1">
                  {socialLinks.map((link) => (
                    <li key={link.href}>
                      <ArrowLink href={link.href} direction="up" external>
                        {link.label}
                      </ArrowLink>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-8 border-t border-[rgb(var(--border-subtle))] pt-5 text-[length:var(--text-body-sm)] text-[rgb(var(--text-muted))]">
                Expect a reply within a few days. If it is urgent, say so in the subject line.
              </p>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
