/**
 * The resume's presentation layer.
 *
 * Everything the site publishes is *portfolio* content: a project's
 * `description` is written to be read on a full-width project page behind a
 * thumbnail, and an experience's `description` is written to be read on a
 * timeline card. Both are the right length for that, and both are the wrong
 * length for a 140mm column in a two-column grid on a fixed A4 page. Rendering
 * the raw records is what produced a CV that read like a database dump: correct
 * facts, wrong shape.
 *
 * So this module converts records into a *resume view-model* — one entry per
 * row, already reduced to a summary, a short list of accomplishments, a stack
 * and a date range. It is a pure function over already-fetched data, with no
 * database access, so it can be reasoned about and changed without a deploy of
 * the query layer.
 *
 * Three rules govern the reduction, and all three are about what a reader
 * actually does with a CV:
 *
 *  1. **A CV is not an archive.** The caps below (`RESUME_BUDGETS`) bound how
 *     many rows reach the page at all. The rest of the site keeps them; a
 *     document with nine projects and seven roles is not thorough, it is
 *     unreadable, and the strongest three entries are the only ones that get
 *     read properly.
 *  2. **A bullet is a line, not a paragraph.** Prose is clipped to a budget
 *     sized for the measured column width, so a record written for a web card
 *     cannot push one entry past a page boundary and strand three lines of it
 *     overleaf.
 *  3. **Nothing is invented.** If a record has no responsibilities, the entry
 *     gets a summary from its description and no bullets. It does not get
 *     placeholder bullets, and it does not get a bullet synthesised from a
 *     sentence that was never a responsibility.
 */

import { projectStatusLabels } from '@/config/project-status'
import { experienceTypeLabels, siteConfig, socialLinks, technologies, type ExperienceType } from '@/config/site'
import { printableUrl } from '@/lib/utils/helpers'
import { clip, firstSentence, formatMonthShort, formatRangeShort, formatYear, takeTags } from './format'
import type { Certificate } from '@/types/certificate'
import type { Experience } from '@/types/experience'
import type { Project, ProjectStatus } from '@/types/project'

/**
 * How much reaches the page, and how long each piece is allowed to be.
 *
 * The character budgets are derived from the geometry in `globals.css`, not
 * chosen by eye. A page is 210mm wide with 15mm margins, so the content column
 * of the entry grid is about 140mm; at 10pt Inter that is roughly 95 characters
 * per line.
 *
 *  - `summary: 150` is one to two lines. It is an orientation sentence, and its
 *    job is to be read, not to be complete.
 *  - `bullet: 190` is two lines. Four two-line bullets is the longest an entry
 *    can get before it stops being scannable, and the cap of four is what keeps
 *    one entry inside a quarter of the page — which is the constraint that makes
 *    pagination behave.
 *  - `projectSummary: 220` is a little longer because a project's `outcome` is
 *    written as a result, and a result is the most persuasive sentence available.
 */
export const RESUME_BUDGETS = {
  experiences: 4,
  projects: 5,
  responsibilities: 4,
  technologies: 6,
  projectTechnologies: 5,
  summary: 150,
  bullet: 190,
  projectSummary: 220,
} as const

/** Section identifiers, in the order they are declared. */
export type ResumeSectionId = 'experience' | 'projects' | 'skills' | 'certificates'

/**
 * The document's table of contents, as data.
 *
 * Declared here rather than hard-coded in the page so §"curation" of the
 * document is a one-line change: remove an id to drop the section, move one to
 * reorder it, and the document, the pagination and the print stylesheet all
 * follow. Sections with no content are skipped at build time, so an empty
 * section never reserves a heading with nothing under it.
 *
 * The order is a reading order, not a database order. Experience leads because
 * it is the section a recruiter is scanning for; the portfolio is what
 * differentiates the candidate, so it comes immediately after; skills are last
 * because a list of tools is a claim and the entries above it are the evidence.
 */
export const RESUME_SECTION_ORDER: readonly ResumeSectionId[] = [
  'experience',
  'projects',
  'skills',
  'certificates',
] as const

export interface ResumeContactLink {
  /** What the reader reads, e.g. the address itself rather than the word "Email". */
  value: string
  href: string
  external: boolean
}

export interface ResumeExperienceEntry {
  id: string
  title: string
  organization: string
  period: { from: string; to: string | null } | null
  /** Short employment type, shown under the date in the rail. */
  typeLabel: string
  summary: string | null
  responsibilities: string[]
  technologies: string[]
}

export interface ResumeProjectEntry {
  id: string
  title: string
  slug: string
  period: string | null
  status: string | null
  summary: string | null
  technologies: string[]
  url: string | null
  urlLabel: string
}

export interface ResumeCertificateEntry {
  id: string
  title: string
  issuer: string
  year: string
  credentialUrl: string | null
}

export interface ResumeSkillGroup {
  label: string
  items: string[]
}

export type ResumeSection =
  | { id: 'experience'; title: string; entries: ResumeExperienceEntry[] }
  | { id: 'projects'; title: string; entries: ResumeProjectEntry[] }
  | { id: 'skills'; title: string; groups: ResumeSkillGroup[] }
  | { id: 'certificates'; title: string; entries: ResumeCertificateEntry[] }

export interface ResumeContent {
  name: string
  /** The one-line descriptor under the name: "Digital Projects · Technology · Experiments". */
  role: string
  /** Two sentences, third person, written for a reader who has two seconds. */
  summary: string
  /**
   * Contact facts as printable addresses.
   *
   * The email is stored as the bare address rather than as a `mailto:` label,
   * because on paper the label is the least useful part of the line and the
   * address is the whole of it.
   */
  contact: ResumeContactLink[]
  /** The site the CV came from, in the footer. */
  site: string
  sections: ResumeSection[]
}

/** Section headings, in one place so the document never hard-codes a string. */
const SECTION_TITLES: Record<ResumeSectionId, string> = {
  experience: 'Experience',
  projects: 'Selected work',
  skills: 'Tools',
  certificates: 'Certifications',
}

/**
 * A role's bullets.
 *
 * `responsibilities` is preferred because those are the rows an owner writes as
 * accomplishments, one per line, which is already the shape a bullet wants. The
 * `description` is the fallback for older records that predate that column, and
 * it is split on blank lines and clipped — a paragraph is not a bullet, but
 * dropping it entirely would leave a role with a title and nothing under it.
 */
function buildResponsibilities(experience: Experience): string[] {
  const written = experience.responsibilities ?? []
  if (written.length > 0) {
    return written
      .map((item) => clip(item, RESUME_BUDGETS.bullet))
      .filter(Boolean)
      .slice(0, RESUME_BUDGETS.responsibilities)
  }

  const description = experience.description?.trim()
  if (!description) return []

  return description
    .split(/\n\s*\n/)
    .map((paragraph) => clip(paragraph, RESUME_BUDGETS.bullet))
    .filter(Boolean)
    .slice(0, RESUME_BUDGETS.responsibilities)
}

/**
 * The one-line orientation sentence for a role.
 *
 * Sourced from the description rather than written, because a generated sentence
 * about someone's internship is worse than their own prose shortened. Clipped to
 * one or two lines so it cannot grow into a second paragraph beside the rail.
 */
function buildExperienceSummary(experience: Experience): string | null {
  return firstSentence(experience.description, RESUME_BUDGETS.summary)
}

function buildExperienceEntry(experience: Experience): ResumeExperienceEntry {
  const responsibilities = buildResponsibilities(experience)
  const period = formatRangeShort(experience.start_date, experience.end_date, experience.current)

  return {
    id: experience.id,
    title: experience.title.trim(),
    organization: experience.organization.trim(),
    period: period.from || period.to ? period : null,
    typeLabel: experienceTypeLabels[experience.employment_type as ExperienceType] ?? 'Experience',
    summary: buildExperienceSummary(experience),
    responsibilities,
    technologies: takeTags(experience.technologies, RESUME_BUDGETS.technologies),
  }
}

/**
 * A project's one-line description.
 *
 * `outcome` wins over `short_description` because it is written as a result and
 * a result is the sentence a reader can do something with; `short_description` is
 * written as a category. `description` is never used — it is the long-form case
 * study, and the project's own page is where that belongs.
 */
function buildProjectEntry(project: Project): ResumeProjectEntry {
  const href = project.project_url ?? project.repository_url

  return {
    id: project.id,
    title: project.title.trim(),
    slug: project.slug,
    period: formatMonthShort(project.project_date) || null,
    status: project.status ? projectStatusLabels[project.status as ProjectStatus] : null,
    summary: clip(
      project.outcome?.trim() || project.short_description,
      RESUME_BUDGETS.projectSummary
    ),
    technologies: takeTags(project.technologies, RESUME_BUDGETS.projectTechnologies),
    url: href ? printableUrl(href) : null,
    urlLabel: project.project_url ? 'Live' : 'Source',
  }
}

function buildCertificateEntry(certificate: Certificate): ResumeCertificateEntry {
  return {
    id: certificate.id,
    title: certificate.title.trim(),
    issuer: certificate.issuer.trim(),
    year: formatYear(certificate.issue_date),
    /*
     * Kept off the page. A credential URL is a long issuer-hosted address that
     * says nothing to a reader holding a sheet of paper, and the row already
     * carries the title, the issuer and the year — which is everything the
     * document is claiming. The site URL in the footer is where verification
     * happens; `credential_url` is still rendered on /certificates.
     */
    credentialUrl: null,
  }
}

/**
 * Contact facts, as the addresses they should be read as.
 *
 * Ordered by how a reader uses them: an address they can reply to, the code they
 * can read, then the profile. The site origin is last because it is the fallback
 * rather than a channel.
 */
function buildContact(): ResumeContactLink[] {
  const social = socialLinks.map((link) => ({
    value: printableUrl(link.href),
    href: link.href,
    external: true,
  }))

  return [
    { value: siteConfig.email, href: siteConfig.contactEmail, external: false },
    ...social,
    { value: printableUrl(siteConfig.url), href: siteConfig.url, external: true },
  ]
}

function buildSkillGroups(): ResumeSkillGroup[] {
  return technologies.map((group) => ({
    label: group.group,
    items: [...group.items],
  }))
}

/**
 * Builds the document's content from the site's published records.
 *
 * Order of arguments is the order of the page, not of the database. The caller
 * has already fetched; this only decides what survives.
 */
export function buildResumeContent(input: {
  experiences: Experience[]
  projects: Project[]
  certificates: Certificate[]
  order?: readonly ResumeSectionId[]
}): ResumeContent {
  const order = input.order ?? RESUME_SECTION_ORDER

  const experienceEntries = input.experiences
    .slice(0, RESUME_BUDGETS.experiences)
    .map(buildExperienceEntry)

  const projectEntries = input.projects.slice(0, RESUME_BUDGETS.projects).map(buildProjectEntry)

  const certificateEntries = input.certificates.map(buildCertificateEntry)

  const available: Record<ResumeSectionId, ResumeSection | null> = {
    experience:
      experienceEntries.length > 0
        ? { id: 'experience', title: SECTION_TITLES.experience, entries: experienceEntries }
        : null,
    projects:
      projectEntries.length > 0
        ? { id: 'projects', title: SECTION_TITLES.projects, entries: projectEntries }
        : null,
    skills: { id: 'skills', title: SECTION_TITLES.skills, groups: buildSkillGroups() },
    certificates:
      certificateEntries.length > 0
        ? { id: 'certificates', title: SECTION_TITLES.certificates, entries: certificateEntries }
        : null,
  }

  const sections = order
    .map((id) => available[id])
    .filter((section): section is ResumeSection => section !== null)

  return {
    name: siteConfig.personName,
    role: siteConfig.resumeRole,
    summary: siteConfig.resumeSummary,
    contact: buildContact(),
    site: printableUrl(siteConfig.url),
    sections,
  }
}
