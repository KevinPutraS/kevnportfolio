import type { Metadata } from 'next'
import { Mail } from 'lucide-react'
import { ContactForm } from '@/components/contact/contact-form'
import { ArrowLink } from '@/components/ui/arrow-link'
import { PageHeader } from '@/components/ui/page-header'
import { socialLinks, siteConfig } from '@/config/site'
import { isSupabaseConfigured } from '@/lib/supabase/config'

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
 * is not true in every deployment. `/api/contact` has two independent delivery
 * channels — the CMS inbox and `CONTACT_WEBHOOK_URL` — and with neither
 * configured it returns `delivered: false` and asks the visitor to email
 * instead. So the promise is now conditional on the same check, read here on
 * the server.
 *
 * Both channels are checked rather than just the webhook. Any deploy with
 * Supabase configured already has a working inbox, and the CMS requires
 * Supabase, so on such a deploy the form does work — it just used to refuse to
 * render because the one channel it knew about was unset.
 *
 * The webhook check is deliberately NOT a `NEXT_PUBLIC_` variable — a webhook
 * URL is a secret endpoint, and prefixing it would ship it to the browser. It
 * stays server-side, this is a Server Component, and only the resulting boolean
 * reaches the client.
 */
export default function ContactPage() {
  const formDelivers =
    Boolean(process.env.CONTACT_WEBHOOK_URL?.trim()) || isSupabaseConfigured()

  return (
    <>
      <div className="container-custom">
        <PageHeader
          eyebrow="Contact"
          title="Let&apos;s work together."
          lede="A question about something I built, an idea you want to explore, or feedback on a project — all welcome. I read everything and reply to most of it."
          tone="section-tone-design"
        />
      </div>

      <section className="rule-top">
        <div className="container-custom">
          {/*
            The layout changes shape depending on whether the form works at all,
            rather than always rendering it and apologising in prose.

            When there is no channel configured at all, the previous version
            still put a complete contact form in the primary column, seven fields
            and a send button, and then explained *below* it that nothing would
            arrive. That is the worst of both: the page's main action is a dead
            end, and the visitor has to read a paragraph to find out. With
            `formDelivers` false, the email address becomes the primary column
            and the form is not rendered at all, so there is exactly one thing to
            do and it works.
          */}
          {formDelivers ? (
            <div className="rhythm-lg grid gap-x-10 gap-y-16 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <h2 className="heading-3">Send a message</h2>
                <p className="mt-3 max-w-lg text-pretty text-[rgb(var(--text-dim))]">
                  Fill this in and it goes straight to my inbox. If you would rather not use a
                  form, the address on the right reaches the same place.
                </p>

                <div className="mt-10">
                  <ContactForm />
                </div>
              </div>

              <aside className="lg:col-span-4 lg:col-start-9">
                <DirectChannels />
              </aside>
            </div>
          ) : (
            <div className="rhythm-lg grid gap-x-10 gap-y-14 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <h2 className="heading-3">Email is the way</h2>
                <p className="mt-3 max-w-lg text-pretty text-[rgb(var(--text-dim))]">
                  This site does not have a working contact form yet, so please use the address
                  below. It reaches my inbox directly, and it is the same place the form would go.
                </p>

                <p className="mt-5 border-l-2 border-[rgb(var(--warning))] pl-4 text-[length:var(--text-body-sm)] text-pretty text-[rgb(var(--text-dim))]">
                  That is a limitation of the site, not something you did wrong.
                </p>

                <a href={siteConfig.contactEmail} className="btn btn-primary btn-lg mt-8">
                  <Mail className="h-5 w-5" aria-hidden="true" />
                  {siteConfig.email}
                </a>
              </div>

              <aside className="lg:col-span-4 lg:col-start-9">
                <DirectChannels showEmail={false} />
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

/** The always-available channels, in one block. */
function DirectChannels({ showEmail = true }: { showEmail?: boolean }) {
  return (
    <>
      <h2 className="heading-3">Or reach me directly</h2>

      <div className="mt-8">
        {showEmail && (
          <>
            <p className="label border-t border-[rgb(var(--border))] pt-5">Email</p>
            <a
              href={siteConfig.contactEmail}
              className="group mt-2 inline-flex min-h-11 items-center break-all text-[length:var(--text-body-sm)] text-[rgb(var(--text))] transition-colors duration-150 hover:text-[rgb(var(--accent))]"
            >
              {siteConfig.email}
            </a>
          </>
        )}

        <p className={showEmail ? 'label mt-8 border-t border-[rgb(var(--border))] pt-5' : 'label border-t border-[rgb(var(--border))] pt-5'}>
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

      <p className="mt-8 border-t border-[rgb(var(--border))] pt-5 text-[length:var(--text-body-sm)] text-[rgb(var(--text-muted))]">
        Expect a reply within a few days. If it is urgent, say so in the subject line.
      </p>
    </>
  )
}
