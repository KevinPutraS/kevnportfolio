import Link from 'next/link'
import { ArrowUpRight, Download } from 'lucide-react'
import { getPublishedExperiences } from '@/lib/db/experience'
import { getPublishedCertificates } from '@/lib/db/certificates'
import { getProjects } from '@/lib/db/projects'
import { siteConfig, socialLinks, technologies } from '@/config/site'
import { projectStatusLabels } from '@/config/project-status'
import { formatMonth, printableUrl } from '@/lib/utils/helpers'
import { formatDateRange } from '@/lib/validation/fields'
import { SectionShell } from '@/components/ui/section-shell'
import { PageHeader } from '@/components/ui/page-header'
import { PrintButton } from '@/components/resume/print-button'
import type { Experience } from '@/types/experience'

/**
 * ISR, like every other page that reads through the cookie-less public client.
 * Publishing an experience entry updates the CV within a minute, with no deploy.
 */
export const revalidate = 60

export const metadata = {
  title: 'Resume',
  description: `A single printable page: experience, selected work, certificates and the tools ${siteConfig.personName} works with.`,
  alternates: { canonical: '/resume' },
  openGraph: {
    title: `Resume — ${siteConfig.name}`,
    description: 'Experience, selected work and credentials on one printable page.',
    url: '/resume',
  },
}

/**
 * A CV that is the site, rather than a PDF that has to be kept in sync with it.
 *
 * Everything below is read from the same tables the rest of the public site
 * reads: the experience timeline, the published projects, the certificate list.
 * The previous plan — a hand-written PDF committed to `public/` — has a failure
 * mode this page does not: it goes stale the moment something is published in
 * the CMS, and nobody notices until a recruiter reads a CV that contradicts the
 * site. Here the CV is the site. A PDF download is offered *on top*, from
 * `siteConfig.resumeUrl`, for people who need a file — but it is a convenience,
 * not the source.
 *
 * Two things are deliberately missing:
 *
 *  - **No print stylesheet hacks in the markup.** The `@media print` block lives
 *    in `globals.css` and drops the navbar, footer, mobile tab bar and
 *    background art. Colour inversion lives there too: the site is a dark theme
 *    built on `--text`/`--bg` custom properties, and printing it as-is spends
 *    a colour ink cartridge to produce a grey page. The print block remaps the
 *    tokens to ink on white so the same markup prints correctly — that is the
 *    reason the palette is tokenised in the first place.
 *
 *  - **No skills bars or percentages.** "JavaScript 80%" is a number nobody can
 *    check and that means nothing to a reader who has seen the work. The toolkit
 *    is listed plainly; the projects are the evidence.
 *
 * A CV is also a one-column document. The two-column spread used elsewhere on
 * the site is for browsing; on paper it wastes the top third of page one and
 * pushes the experience — the part anyone actually reads — below the fold.
 */
export default async function ResumePage() {
  const [experiences, certificates, projectPage] = await Promise.all([
    getPublishedExperiences(),
    getPublishedCertificates(),
    /*
     * Six, not the archive's nine. A CV that lists every project is a second
     * archive; six with their outcome attached says more than nine with a title
     * each. Read through `getProjects` rather than `getFeaturedProjects` because
     * the featured flag decides what the *homepage* leads with, and a CV is not
     * the homepage — if the strongest work is not featured on the home page, it
     * is still the strongest work here.
     */
    getProjects({ page: 1, pageSize: 6 }),
  ])

  const projects = projectPage.projects

  return (
    <>
      <div className="container-custom">
        <PageHeader
          eyebrow="Resume"
          title="The short version."
          lede="Experience, selected work and credentials on one page. It is built from the same records as the rest of this site, so it cannot disagree with it — print it, or save it as a PDF from the button below."
          tone="section-tone-app"
          meta={<span className="sr-only">Updated as records are published</span>}
          action={
            /*
             * Only when a real file exists. `siteConfig.resumeUrl` is null until
             * a PDF is actually committed to `public/` and pointed at, so this
             * button cannot 404 — a download link on a CV that 404s is worse
             * than no link at all.
             */
            <div className="flex flex-wrap items-center gap-3 print:hidden">
              {siteConfig.resumeUrl && (
                <a
                  href={siteConfig.resumeUrl}
                  download
                  className="btn btn-primary btn-lg"
                >
                  <Download className="h-5 w-5" aria-hidden="true" />
                  Download PDF
                </a>
              )}
              <PrintButton />
            </div>
          }
        />
      </div>

      <SectionShell tone="section-tone-app">
        <div className="container-custom py-14 lg:py-20">
          {/* ---- Header block ------------------------------------------------
            * Name, one line of what they do, and how to reach them. This is the
            * part a recruiter reads in the first two seconds, so it is the only
            * place on the page allowed to be a headline. In print the `.h1`
            * token drops to a sane size — a display-size name on A4 eats a
            * sixth of the page.
            */}
          {/*
            Identity on the left, contact facts on the right, from `sm` up. See
            the note on `.resume-header` in globals.css for why they are not
            stacked. The email carries the address rather than a `mailto:` label
            so the text on paper is the thing a reader would type, not the word
            "email".
          */}
          <div className="resume-header">
            <div>
              <h2 className="resume-name">{siteConfig.personName}</h2>
              <p className="resume-summary">{siteConfig.heroStatement}</p>
            </div>

            <ul className="resume-contact">
              <li>
                <a href={siteConfig.contactEmail} className="link-underline">
                  {siteConfig.email}
                </a>
              </li>
              {socialLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline"
                  >
                    {link.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
              <li className="print:hidden">
                <Link href="/contact" className="link-underline">
                  Get in touch
                </Link>
              </li>
            </ul>
          </div>

          {/* ---- Experience -------------------------------------------------
            * First, and in full. On a CV this is the section a reader is
            * scanning for, so it goes above the projects even though the projects
            * are the more interesting part of the site.
            */}
          {experiences.length > 0 && (
            <ResumeSection title="Experience">
              <ul className="space-y-7">
                {experiences.map((experience) => (
                  <ResumeEntry
                    key={experience.id}
                    heading={experience.title}
                    subheading={experience.organization}
                    meta={formatDateRange(
                      experience.start_date,
                      experience.end_date,
                      experience.current
                    )}
                    href={experience.project_url}
                    bullets={resumeBullets(experience)}
                    tags={experience.technologies}
                  />
                ))}
              </ul>
            </ResumeSection>
          )}

          {/* ---- Selected work ----------------------------------------------
            * Title, date, one line of outcome or summary, and the stack. No
            * gallery, no thumbnail, no description — a CV has no room for a
            * case study, and the links are what the reader actually wants.
            */}
          {projects.length > 0 && (
            <ResumeSection
              title="Selected work"
              action={
                <Link
                  href="/projects"
                  className="link-underline text-[length:var(--text-sm)] print:hidden"
                >
                  All projects
                </Link>
              }
            >
              <ul className="space-y-5">
                {projects.map((project) => (
                  <ResumeEntry
                    key={project.id}
                    heading={
                      <>
                        <Link href={`/projects/${project.slug}`} className="link-underline">
                          {project.title}
                        </Link>
                        {project.status && (
                          <span className="resume-status">
                            {projectStatusLabels[project.status]}
                          </span>
                        )}
                      </>
                    }
                    meta={project.project_date ? formatMonth(project.project_date) : ''}
                    summary={project.outcome ?? project.short_description}
                    tags={project.technologies}
                    href={project.project_url ?? project.repository_url}
                    hrefLabel={project.project_url ? 'Live site' : 'Repository'}
                  />
                ))}
              </ul>
            </ResumeSection>
          )}

          {/* ---- Toolkit ----------------------------------------------------
            * Grouped, matching the About page, and one line per group. The
            * "(learning)" qualifier stays: on a CV, claiming Rust as a shipped
            * skill because the word appears in a chip is exactly the kind of
            * small dishonesty that costs the interview later.
            */}
          <ResumeSection title="Tools">
            <dl className="grid gap-x-10 gap-y-3 sm:grid-cols-2">
              {technologies.map((group) => (
                <div key={group.group} className="flex gap-3">
                  <dt className="resume-dt">{group.group}</dt>
                  <dd className="resume-dd">{group.items.join(', ')}</dd>
                </div>
              ))}
            </dl>
          </ResumeSection>

          {/* ---- Credentials ------------------------------------------------ */}
          {certificates.length > 0 && (
            <ResumeSection
              title="Certificates"
              action={
                <Link
                  href="/certificates"
                  className="link-underline text-[length:var(--text-sm)] print:hidden"
                >
                  All certificates
                </Link>
              }
            >
              <ul className="grid gap-x-10 gap-y-2.5 sm:grid-cols-2">
                {certificates.map((certificate) => (
                  <li key={certificate.id} className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-medium">{certificate.title}</span>
                    <span className="text-[length:var(--text-sm)] text-[rgb(var(--text-muted))]">
                      {certificate.issuer}
                      {certificate.issue_date
                        ? `, ${formatMonth(certificate.issue_date)}`
                        : ''}
                    </span>
                    {/*
                      Left screen-only, unlike the project links above. A
                      credential URL is a long issuer-hosted verification link
                      that says nothing on paper, and the certificate line
                      already carries the title, issuer and date — which is all a
                      CV is claiming. The site URL at the foot of the page is
                      where someone goes to verify it.
                    */}
                    {certificate.credential_url && (
                      <a
                        href={certificate.credential_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[length:var(--text-sm)] underline print:hidden"
                      >
                        Verify
                        <span className="sr-only"> {certificate.title} (opens in a new tab)</span>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </ResumeSection>
          )}

          <p className="mt-14 border-t border-[rgb(var(--border))] pt-6 text-[length:var(--text-sm)] text-[rgb(var(--text-muted))]">
            Everything on this page is generated from the site’s own records.{' '}
            <Link href="/contact" className="link-underline print:hidden">
              Get in touch
            </Link>
            .
          </p>
          {/*
            The site URL, in the footer line. Printed onto paper this is the only way
            the reader can get back to the projects, and a CV that does not say where
            it came from is a CV nobody can verify.
          */}
          <p className="mt-1.5 font-mono text-[length:var(--text-xs)] text-[rgb(var(--text-muted))]">
            {siteConfig.url}
          </p>
        </div>
      </SectionShell>
    </>
  )
}

/**
 * One block of bullets for an experience entry.
 *
 * The responsibilities list is preferred and the description is the fallback,
 * because the responsibilities are the ones written as accomplishments and the
 * description is prose. Truncated to four on the page: a CV entry with nine
 * bullets stops being read, and the timeline page has the rest.
 */
function resumeBullets(experience: Experience): string[] {
  const responsibilities = experience.responsibilities ?? []
  if (responsibilities.length > 0) return responsibilities.slice(0, 4)

  if (experience.description?.trim()) {
    return experience.description
      .split('\n\n')
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .slice(0, 2)
  }

  return []
}

/** A titled block. Skipped entirely when it has nothing in it. */
function ResumeSection({
  title,
  action,
  children,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="mt-12 first:mt-0 print:mt-8 print:break-inside-avoid">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3 border-b border-[rgb(var(--border))] pb-2.5">
        <h3 className="font-display text-[length:var(--text-body-sm)] font-bold uppercase tracking-[0.12em] text-[rgb(var(--text))]">
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  )
}

/**
 * One entry. `heading` takes a node rather than a string because the project
 * variant carries a link and a status chip inside it.
 */
function ResumeEntry({
  heading,
  subheading,
  meta,
  summary,
  bullets,
  tags,
  href,
  hrefLabel,
}: {
  heading: React.ReactNode
  subheading?: string
  meta?: string
  summary?: string | null
  bullets?: string[]
  tags?: string[] | null
  href?: string | null
  hrefLabel?: string
}) {
  return (
    <li className="print:break-inside-avoid">
      {/*
        The date rail. See `.resume-entry` in globals.css — the reason this is a
        grid and not a float is that the dates then line up in one column, so
        the shape of a career is visible before any of it is read.
      */}
      <div className="resume-entry">
        {meta && <p className="resume-entry-when tabular-nums">{meta}</p>}

        <div className="resume-entry-what">
          <h4 className="font-display text-[length:var(--text-body-sm)] font-bold text-[rgb(var(--text))]">
            {heading}
            {subheading && (
              <span className="ml-2 font-sans font-normal text-[rgb(var(--text-dim))]">
                {subheading}
              </span>
            )}
          </h4>

          {href && (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex flex-wrap items-center gap-1 text-[length:var(--text-sm)] text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent))]"
            >
              {/*
                Two renderings of the same link, because paper and screen do not
                want the same thing. On screen the label is the affordance and
                the address is noise behind it. Printed, the label is a dead
                word — "Live site" on a sheet of A4 is a promise the reader
                cannot keep — so the address takes over. Hiding the URL in print
                is what made an earlier draft of this page print six projects
                and zero ways to reach any of them.
              */}
              <span className="print:hidden">
                {hrefLabel ?? 'Link'}
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </span>
              <span className="hidden break-all print:inline">{printableUrl(href)}</span>
            </a>
          )}

          {summary && (
            <p className="mt-1.5 max-w-prose text-pretty text-[length:var(--text-body-sm)] text-[rgb(var(--text-dim))]">
              {summary}
            </p>
          )}

          {bullets && bullets.length > 0 && (
            <ul className="mt-2 space-y-1">
              {bullets.map((bullet, index) => (
                <li
                  key={index}
                  className="flex gap-2.5 text-[length:var(--text-sm)] leading-relaxed text-[rgb(var(--text-dim))]"
                >
                  <span
                    aria-hidden="true"
                    className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-[rgb(var(--border-strong))]"
                  />
                  <span className="text-pretty">{bullet}</span>
                </li>
              ))}
            </ul>
          )}

          {tags && tags.length > 0 && (
            <p className="mt-2 font-mono text-[length:var(--text-xs)] text-[rgb(var(--text-muted))]">
              {tags.join(' · ')}
            </p>
          )}
        </div>
      </div>
    </li>
  )
}
