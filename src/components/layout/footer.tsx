import Link from 'next/link'
import { siteConfig } from '@/config/site'
import { Github, Twitter, Linkedin, Mail } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-[rgb(var(--border-subtle))] bg-[rgb(var(--surface))]" role="contentinfo">
      <div className="container-custom py-12 lg:py-16">
        <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href="/" className="font-display text-xl font-bold text-[rgb(var(--text-primary))]">
              {siteConfig.name}
            </Link>
            <p className="mt-4 max-w-xs text-[rgb(var(--text-secondary))] text-sm leading-relaxed">
              {siteConfig.description}
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Navigate</h3>
            <ul className="mt-4 space-y-3" role="list">
              {siteConfig.navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent))] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Connect</h3>
            <ul className="mt-4 space-y-3" role="list">
              <li>
                <a
                  href={siteConfig.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent))] transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" aria-hidden="true" />
                  <span>GitHub</span>
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.links.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent))] transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" aria-hidden="true" />
                  <span>Twitter</span>
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent))] transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" aria-hidden="true" />
                  <span>LinkedIn</span>
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.links.email}
                  className="flex items-center gap-3 text-sm text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent))] transition-colors"
                  aria-label="Email"
                >
                  <Mail className="h-5 w-5" aria-hidden="true" />
                  <span>Email</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[rgb(var(--border-subtle))] pt-8 md:flex-row">
          <p className="text-sm text-[rgb(var(--text-muted))]">
            © {currentYear} {siteConfig.name}. All rights reserved.
          </p>
          <p className="text-sm text-[rgb(var(--text-muted))]">
            Built with Next.js, Tailwind CSS, and Supabase
          </p>
        </div>
      </div>
    </footer>
  )
}