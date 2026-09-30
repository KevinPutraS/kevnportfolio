import Link from 'next/link'
import type {
  ResumeCertificateEntry,
  ResumeContent,
  ResumeExperienceEntry,
  ResumeProjectEntry,
  ResumeSection,
  ResumeSectionId,
  ResumeSkillGroup,
} from '@/lib/resume/content'

/**
 * The document.
 *
 * Everything in this file is *paper*: a fixed 210×297mm page, a type scale in
 * points, a two-column grid with a fixed date rail. No breakpoints, no
 * `clamp()`, no viewport units, no `rem`.
 *
 * The previous version of this page had all of those, which is the whole reason
 * it looked like a web page printed onto a sheet. `clamp(1.5rem, 1.22rem + 1.4vw,
 * 2.25rem)` has no relationship to a 210mm page, so what the author reviewed at
 * 1440px and what the reader received on A4 were two different documents, and
 * the second one was the one that mattered.
 *
 * This document renders identically everywhere. What changes between a 390px
 * phone and a 1920px monitor is only the *scale* it is presented at, applied by
 * a transform on its wrapper — never its own proportions. A resume that reflows
 * into one narrow column on a phone stops being the same document as the PDF,
 * which means the preview is no longer a preview of anything.
 *
 * All geometry lives in `globals.css` under `RESUME DOCUMENT`. This file supplies
 * structure and the `data-rb` hooks the paginator measures; it sets no sizes.
 */

/** Marks a measurable, unbreakable unit. Read by the measurement pass. */
export const RUN_ATTRIBUTE = 'data-rb'

/* ---------------------------------------------------------------------------
 * Page chrome
 * ------------------------------------------------------------------------ */

/** One sheet. `index` is 1-based and drives the continuation rule. */
export function ResumeSheet({
  index,
  continuationName,
  children,
}: {
  index: number
  continuationName: string
  children: React.ReactNode
}) {
  return (
    <div className="resume-sheet" data-sheet={index}>
      {/*
        The continuation rule. Page one carries the full header, so it does not
        need this; every page after it restates the name and its own number in
        the same place, so a loose page two is never a mystery document.

        It is 8pt in the muted tone on purpose: present, not decorative. The
        version of this that was worth adding is the one a reader notices when
        page two comes apart from the rest; making it louder than that turns a
        document into a brochure.
      */}
      {index > 1 && (
        <div className="resume-cont">
          <span className="resume-cont__name">{continuationName}</span>
          <span className="resume-cont__folio">
            <span className="resume-cont__rule" aria-hidden="true" />
            <span className="resume-cont__label">Resume</span>
            <span className="resume-cont__number tabular-nums">{String(index).padStart(2, '0')}</span>
          </span>
        </div>
      )}

      <div className="resume-body">{children}</div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Header
 * ------------------------------------------------------------------------ */

/**
 * The document header.
 *
 * Name dominant, contact separated from it and clearly readable, and a role line
 * that says what the reader is looking at before they read a single date.
 *
 * The contact block sits in its own column rather than in a row under the
 * summary, and that is a space decision as much as a design one. A full-width
 * contact line beneath the name spends the top third of page one on the three
 * facts a reader already expects to find and pushes the first date below the
 * fold; beside the name, the same facts cost nothing.
 */
function DocumentHeader({ content }: { content: ResumeContent }) {
  return (
    <header className="resume-header" {...{ [RUN_ATTRIBUTE]: 'header' }}>
      <div className="resume-header__id">
        <h1 className="resume-name">{content.name}</h1>
        <p className="resume-role">{content.role}</p>
      </div>

      {/*
        `tabular-nums` on the contact list is not a detail. Proportional digits
        make two addresses on consecutive lines look misaligned, and the eye
        reads that as a rendering fault rather than as a typeface choice.
      */}
      <ul className="resume-contact tabular-nums">
        {content.contact.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="resume-contact__link"
            >
              {link.value}
              {link.external && <span className="sr-only"> (opens in a new tab)</span>}
            </a>
          </li>
        ))}
      </ul>

      {/*
        The summary gets a full-width band under a rule rather than sitting in
        the left column. Constrained to the column beside the name it is forty
        characters wide and becomes four lines; full width under the rule it is
        two — and the rule is what tells the reader the identity block above it
        is finished, so the eye stops looking for more of it.
      */}
      <div className="resume-summary">
        <p className="resume-summary__label">Profile</p>
        <p className="resume-summary__text">{content.summary}</p>
      </div>
    </header>
  )
}

/* ---------------------------------------------------------------------------
 * Section heading
 * ------------------------------------------------------------------------ */

function SectionHeading({ title, id }: { title: string; id: ResumeSectionId }) {
  return (
    <div className="resume-section__head" {...{ [RUN_ATTRIBUTE]: `head:${id}` }}>
      <h2 className="resume-section__title">{title}</h2>
      <span aria-hidden="true" className="resume-section__rule" />
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Experience
 * ------------------------------------------------------------------------ */

/**
 * One role.
 *
 * The grid is `32mm minmax(0, 1fr)`, and both halves of that are load-bearing.
 *
 * **Fixed** rail, so every range starts at the same x and the reader can see the
 * shape of the history — overlaps, gaps, how long each role lasted — before
 * reading any of it. A `min-content` or `auto` rail sizes itself to the longest
 * date range and leaves every other row floating at an arbitrary position, which
 * is the layout the first version of this page had.
 *
 * **`minmax(0, 1fr)`** on the content track, so a long organisation name takes
 * space from the content column and never from the rail. "Inspectorate General,
 * Ministry of Marine Affairs and Fisheries" is the exact row that breaks a naive
 * grid: with an `auto` first track, that one entry widens the rail for every row
 * beneath it and squeezes the bullets into a 60mm ribbon. That collision — not
 * the font size — was what made the old page unreadable.
 */
function ExperienceEntry({ entry }: { entry: ResumeExperienceEntry }) {
  return (
    <div className="resume-entry" {...{ [RUN_ATTRIBUTE]: `exp:${entry.id}` }}>
      <div className="resume-entry__rail">
        {entry.period && (
          <p className="resume-entry__period">
            <span className="resume-entry__from">{entry.period.from}</span>
            {entry.period.to ? (
              <span className="resume-entry__to">
                <span aria-hidden="true">— </span>
                {entry.period.to}
              </span>
            ) : (
              <span className="resume-entry__to resume-entry__to--current">Present</span>
            )}
          </p>
        )}
        {entry.typeLabel && <p className="resume-entry__kind">{entry.typeLabel}</p>}
      </div>

      <div className="resume-entry__content">
        <h3 className="resume-entry__title">{entry.title}</h3>
        <p className="resume-entry__org">{entry.organization}</p>

        {entry.summary && <p className="resume-entry__summary">{entry.summary}</p>}

        {entry.responsibilities.length > 0 && (
          <ul className="resume-bullets">
            {entry.responsibilities.map((bullet, index) => (
              <li key={index} className="resume-bullet">
                {bullet}
              </li>
            ))}
          </ul>
        )}

        {entry.technologies.length > 0 && (
          <p className="resume-tech">
            <span className="resume-tech__label">Technologies</span>
            <span className="resume-tech__items">{entry.technologies.join(' · ')}</span>
          </p>
        )}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Projects
 * ------------------------------------------------------------------------ */

/**
 * One project, on the same grid as a role.
 *
 * The sections read as one system because they *are* one system — the same
 * rails, the same content column, the same stack row. A project simply has a URL
 * where a role has an employment type. Two independently designed entry layouts
 * sharing a page is the thing that makes a generated document look generated.
 */
function ProjectEntry({ entry }: { entry: ResumeProjectEntry }) {
  return (
    <div className="resume-entry" {...{ [RUN_ATTRIBUTE]: `prj:${entry.id}` }}>
      <div className="resume-entry__rail">
        {entry.period && <p className="resume-entry__period">{entry.period}</p>}
      </div>

      <div className="resume-entry__content">
        {/*
          The title and its status share a line, with the status pushed to the
          right of the content column rather than sitting inline after the text.
          Inline, a long title pushes the status onto a second line at an
          arbitrary x, and a two-word status chip is not worth a ragged line.
        */}
        <div className="resume-entry__headline">
          <h3 className="resume-entry__title">
            <Link href={`/projects/${entry.slug}`} className="resume-entry__link">
              {entry.title}
            </Link>
          </h3>
          {entry.status && <span className="resume-entry__status">{entry.status}</span>}
        </div>

        {/*
          The address, not the word "Live site". On paper a link label is a
          promise the reader cannot keep — there is nothing to click — so the
          label is dead weight and the address is the entire value. It is set in
          the mono face at the metadata size, secondary to the title and never
          underlined: a row of underlined addresses turns the page into a
          directory.
        */}
        {entry.url && (
          <p className="resume-entry__url">
            <a href={`https://${entry.url}`} target="_blank" rel="noopener noreferrer" className="resume-url">
              {entry.url}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        )}

        {entry.summary && <p className="resume-entry__summary">{entry.summary}</p>}

        {entry.technologies.length > 0 && (
          <p className="resume-tech">
            <span className="resume-tech__label">Technologies</span>
            <span className="resume-tech__items">{entry.technologies.join(' · ')}</span>
          </p>
        )}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Certificates
 * ------------------------------------------------------------------------ */

/**
 * The certificate list, as a single unbreakable run.
 *
 * One run rather than one per certificate, and that is a considered choice. Each
 * row is three short lines, and four of them fit in roughly 45mm — so the block
 * moves to the next page as a unit or stays whole, and never leaves one orphan
 * certificate stranded under a heading at a page foot. Splitting a reference
 * list across a break buys nothing: unlike a role, a certificate carries no
 * argument that needs the next one to make sense.
 *
 * No images. A certificate screenshot is bitmap, and printed at 40mm it is an
 * unreadable grey rectangle costing a quarter of a page to say nothing the three
 * lines already say. The rows carry the title, the issuer and the year, which is
 * the whole of the claim; the credential link lives on /certificates, where
 * there is room for it.
 */
function CertificateList({ entries, runId }: { entries: ResumeCertificateEntry[]; runId: string }) {
  return (
    <ul className="resume-certs" {...{ [RUN_ATTRIBUTE]: runId }}>
      {entries.map((entry) => (
        <li key={entry.id} className="resume-cert">
          <span className="resume-cert__title">{entry.title}</span>
          <span className="resume-cert__issuer">{entry.issuer}</span>
          {entry.year && <span className="resume-cert__year tabular-nums">{entry.year}</span>}
        </li>
      ))}
    </ul>
  )
}

/* ---------------------------------------------------------------------------
 * Skills
 * ------------------------------------------------------------------------ */

/**
 * The tool groups, as a single unbreakable run and a real `<dl>`.
 *
 * The list-of-terms gives a screen-reader user a document outline to jump by,
 * which a grid of `<div>`s does not. The label is fixed-width so the four groups
 * align into columns of consistent width instead of four ragged lines, and the
 * fixed track is safe here precisely because these labels are two words — the
 * failure that forced `minmax(0, 1fr)` on the entry grid cannot happen with a
 * known, bounded set of strings.
 */
function SkillList({ groups, runId }: { groups: ResumeSkillGroup[]; runId: string }) {
  return (
    <dl className="resume-skills" {...{ [RUN_ATTRIBUTE]: runId }}>
      {groups.map((group) => (
        <div key={group.label} className="resume-skill">
          <dt className="resume-skill__label">{group.label}</dt>
          <dd className="resume-skill__items">{group.items.join(' · ')}</dd>
        </div>
      ))}
    </dl>
  )
}

/* ---------------------------------------------------------------------------
 * Section bodies
 * ------------------------------------------------------------------------ */

/** The run nodes for one section, with the ids the paginator refers to. */
function buildSectionRuns(section: ResumeSection): { id: string; node: React.ReactNode }[] {
  switch (section.id) {
    case 'experience':
      return section.entries.map((entry) => ({
        id: `exp:${entry.id}`,
        node: <ExperienceEntry key={entry.id} entry={entry} />,
      }))

    case 'projects':
      return section.entries.map((entry) => ({
        id: `prj:${entry.id}`,
        node: <ProjectEntry key={entry.id} entry={entry} />,
      }))

    case 'certificates':
      return [
        {
          id: 'cert:list',
          node: <CertificateList key="certs" entries={section.entries} runId="cert:list" />,
        },
      ]

    case 'skills':
      return [{ id: 'skill:list', node: <SkillList key="skills" groups={section.groups} runId="skill:list" /> }]
  }
}

export interface DocumentRun {
  id: string
  section: string
  node: React.ReactNode
}

export interface DocumentSection {
  id: ResumeSectionId
  title: string
  headingNode: React.ReactNode
  runs: { id: string; node: React.ReactNode }[]
}

export interface BuiltDocument {
  headerId: string
  headerNode: React.ReactNode
  sections: DocumentSection[]
}

/**
 * Flattens the content into the runs the paginator measures.
 *
 * Returned rather than rendered directly because the same tree is needed twice:
 * once laid out off-screen at the exact content width to be measured, and once
 * distributed across real pages. Both come from this one function, so the
 * measured heights and the printed heights are the same elements — which is the
 * only reason the preview and the PDF agree.
 */
export function buildDocument(content: ResumeContent): BuiltDocument {
  return {
    headerId: 'header',
    headerNode: <DocumentHeader content={content} />,
    sections: content.sections.map((section) => ({
      id: section.id,
      title: section.title,
      headingNode: <SectionHeading key={section.title} title={section.title} id={section.id} />,
      runs: buildSectionRuns(section),
    })),
  }
}
