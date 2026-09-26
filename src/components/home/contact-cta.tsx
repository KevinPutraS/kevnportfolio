import { ButtonLink } from '@/components/ui/button-link'
import { ArrowLink } from '@/components/ui/arrow-link'
import { siteConfig, socialLinks } from '@/config/site'

/**
 * Closing call to action.
 *
 * One primary action, the email as a low-weight fallback, and the social links
 * demoted to a running line. The earlier version gave "Elsewhere" a full column
 * with its own heading, which made the end of the page compete with the
 * projects above it.
 */
export function ContactCta() {
  return (
    <section className="rule-top">
      <div className="container-custom">
        <div className="rhythm-xl">
          <p className="eyebrow">Get in touch</p>

          <div className="mt-8 grid gap-x-10 gap-y-12 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <h2 className="heading-1 max-w-[16ch] text-balance">
                Got a project, a question, or a half-formed idea?
              </h2>
            </div>

            <div className="lg:col-span-4">
              <p className="body text-pretty text-[rgb(var(--text-secondary))]">
                I&apos;m always happy to talk about what I&apos;m building, swap notes on a problem I&apos;m
                stuck on, or dig into something interesting together.
              </p>

              <div className="mt-8 flex flex-col items-start gap-5">
                <ButtonLink href="/contact" size="lg" className="w-full sm:w-auto">
                  Start a conversation
                </ButtonLink>

                <ArrowLink href={siteConfig.contactEmail} direction="up">
                  {siteConfig.email}
                </ArrowLink>
              </div>
            </div>
          </div>

          <ul className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-[rgb(var(--border-subtle))] pt-8">
            <li className="caption text-[rgb(var(--text-muted))]">Elsewhere</li>
            {socialLinks.map((link) => (
              <li key={link.href}>
                <ArrowLink href={link.href} direction="up" external>
                  {link.label}
                </ArrowLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
