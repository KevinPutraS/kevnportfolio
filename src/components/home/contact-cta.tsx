import { ArrowUpRight } from 'lucide-react'
import { ButtonLink } from '@/components/ui/button-link'
import { siteConfig, socialLinks } from '@/config/site'

/** Final call to action: one primary action, email as a fallback. */
export function ContactCta() {
  return (
    <section className="border-t border-[rgb(var(--border-subtle))]">
      <div className="container-custom py-20 sm:py-28">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="eyebrow">Get in touch</p>
            <h2 className="heading-2 mt-4 text-balance">
              Got a project, a question, or a half-formed idea?
            </h2>
            <p className="body mt-6 max-w-xl text-[rgb(var(--text-secondary))]">
              I&apos;m always happy to talk about what I&apos;m building, swap notes on a problem I&apos;m
              stuck on, or dig into something interesting together.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink href="/contact" size="lg" className="w-full sm:w-auto">
                Start a conversation
              </ButtonLink>
              <a
                href={`mailto:${siteConfig.email}`}
                className="inline-flex h-12 items-center justify-center gap-2 px-2 text-sm text-[rgb(var(--text-secondary))] transition-colors hover:text-[rgb(var(--text-primary))] sm:justify-start"
              >
                <span className="font-mono">{siteConfig.email}</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-4">
            <p className="eyebrow">Elsewhere</p>
            <ul className="mt-5 space-y-3">
              {socialLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 text-[rgb(var(--text-secondary))] transition-colors hover:text-[rgb(var(--accent))]"
                  >
                    {link.label}
                    <ArrowUpRight
                      className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
