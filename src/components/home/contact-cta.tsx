import { ButtonLink } from '@/components/ui/button-link'
import { ArrowLink } from '@/components/ui/arrow-link'
import { SectionShell, SectionEyebrow } from '@/components/ui/section-shell'
import { siteConfig, socialLinks } from '@/config/site'

/**
 * Closing call to action.
 *
 * Heading, one action, and the social links as a running line. The previous
 * version added a paragraph explaining that I am happy to talk about things —
 * which is what the heading already says, and what a visitor who wants to talk
 * already decided. The page ends; it does not need to be talked into it.
 */
export function ContactCta() {
  return (
    <SectionShell tone="section-tone-design" index="04">
      <div className="container-custom">
        <div className="py-16 lg:py-24">
          <div className="grid gap-x-12 gap-y-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <SectionEyebrow>Get in touch</SectionEyebrow>
              <h2 className="heading-1 mt-6 max-w-[16ch] text-balance">
                Got a project, a question, or a half-formed idea?
              </h2>
            </div>

            <div className="lg:col-span-5">
              <div className="flex flex-col items-start gap-5">
                <ButtonLink href="/contact" size="lg" className="w-full sm:w-auto">
                  Start a conversation
                </ButtonLink>

                <ArrowLink href={siteConfig.contactEmail} direction="up">
                  {siteConfig.email}
                </ArrowLink>
              </div>
            </div>
          </div>

          <ul className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-[rgb(var(--border))] pt-8">
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
    </SectionShell>
  )
}
