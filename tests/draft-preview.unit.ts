import { existsSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { codeOf, sourceOf } from './helpers'

/**
 * The admin's draft preview: what it is allowed to read, and what must stay shut.
 *
 * A preview that renders the public route for an unpublished project does not
 * work at all — that route filters on `published = true`, so the preview would
 * 404 on exactly the projects it exists to show. The obvious "fix" from there is
 * to drop the filter, which publishes every draft.
 *
 * So this feature is held together by one small, load-bearing asymmetry:
 * `getProjectBySlug` filters, `getProjectById` does not, and the public route
 * only ever calls the first. That asymmetry lives in a query builder rather than
 * in a permission check, which means nothing at runtime stops the next edit from
 * tidying it away — no error, no failed test, drafts quietly on the public site.
 * These assertions are the tripwire.
 *
 * **Why these read source instead of driving a browser.** `/admin` sits behind
 * Supabase Auth, so the preview route cannot be rendered without a session, and a
 * test that needs credentials is a test that does not run. Reading the files
 * keeps the guarantee tied to the shipped code, but it cannot see rendered
 * output: it will not catch a preview that imports the right function and then
 * ignores its result. What it does catch is the class of mistake that actually
 * happens here — the filter removed, the route moved out of the protected group,
 * the shared body copied back into one of the pages.
 */

const DB = sourceOf('src/lib/db/projects.ts')
const PUBLIC_PAGE = sourceOf('src/app/(public)/projects/[slug]/page.tsx')
const PREVIEW_PAGE = sourceOf('src/app/admin/(protected)/preview/project/[id]/page.tsx')
const DETAIL = sourceOf('src/components/projects/project-detail.tsx')

/**
 * One exported function, sliced out by name and code.
 *
 * Slicing to the next top-level `export` rather than by brace count, because these
 * bodies nest — a `.eq()` chain inside an `if (error)` inside the function — and
 * counting braces to find the end of one is a way to be wrong quietly.
 */
function bodyOf(source: string, name: string): string {
  const start = source.indexOf(`export async function ${name}(`)
  if (start < 0) throw new Error(`no ${name} in src/lib/db/projects.ts — has it been renamed?`)
  const next = source.indexOf('\nexport ', start + 1)
  return codeOf(source.slice(start, next < 0 ? source.length : next))
}

/**
 * The default-exported component, which is where the guard order actually lives.
 *
 * Needed because `getProjectById` appears at the top of the file as an import, so
 * comparing its index against the guard's measures the import statement.
 */
function componentOf(source: string): string {
  const start = source.indexOf('export default')
  if (start < 0) throw new Error('no default export — has the page been restructured?')
  return codeOf(source.slice(start))
}

test.describe('drafts stay off the public site', () => {
  test('the public lookup filters on published, the admin lookup does not', () => {
    /*
     * The asymmetry, asserted on both halves. `getProjectById` is what makes the
     * preview possible at all — drafts and all — so "the admin one filters" would
     * break the feature just as thoroughly as the other half breaking privacy.
     *
     * Matched on `published` and not on `.eq(`: the admin lookup does filter, on
     * `id`. What must be absent is the publication filter specifically.
     */
    expect(bodyOf(DB, 'getProjectBySlug'), 'public lookups stopped filtering on published').toContain(
      ".eq('published', true)"
    )
    expect(bodyOf(DB, 'getProjectById'), 'the admin lookup must return drafts').not.toContain(
      "'published'"
    )
  })

  test('the public route reads only through the filtering lookup', () => {
    expect(PUBLIC_PAGE).toContain('getProjectBySlug')
    // The one call that would let a draft through the front door.
    expect(codeOf(PUBLIC_PAGE), 'the public route reaches for the unfiltered lookup').not.toContain(
      'getProjectById'
    )
  })

  test('the public route stays dynamic so a draft 404 is never cached as a 200', () => {
    /*
     * `force-dynamic` is not a performance setting here. With the Full Route Cache
     * on, a project requested while it was a draft has its 404 written to the
     * cache, and publishing it then changes nothing — the page stays 404 until
     * the cache is discarded. The preview does not depend on this, but the
     * publish button does.
     */
    expect(PUBLIC_PAGE).toMatch(/export const dynamic = 'force-dynamic'/)
  })

  test('the preview route lives inside the protected group', () => {
    /*
     * A draft's whole value is that it is unpublished. This route is the one place
     * in the app that renders one, so its path is the difference between a draft
     * and a leak: outside `(protected)` the admin layout's `getUser()` check never
     * runs, and the route would answer to anyone who guessed a UUID.
     */
    expect(
      existsSync('src/app/admin/(protected)/preview/project/[id]/page.tsx'),
      'the preview page moved out of the admin (protected) group'
    ).toBe(true)
    expect(PREVIEW_PAGE).toContain('getProjectById')
    expect(PREVIEW_PAGE).toContain('robots: { index: false, follow: false }')
  })

  test('the preview rejects a malformed id before touching the database', () => {
    // Postgres raises `invalid input syntax for type uuid` on a bad id, which is a
    // 500 from what should be a 404.
    const component = componentOf(PREVIEW_PAGE)
    expect(component).toContain('isUuid')
    expect(component.indexOf('isUuid')).toBeLessThan(component.indexOf('getProjectById'))
  })
})

test.describe('the preview shows the real page, not a copy of it', () => {
  test('both routes render the shared body', () => {
    // The whole reason for extracting `ProjectDetail`. A preview assembled by
    // copying the public page would drift from it silently: still rendering a
    // plausible older design, so the mistake would read as "the preview looks
    // fine" all the way to publish.
    expect(PUBLIC_PAGE).toContain('<ProjectDetail project={project} related={related} />')
    expect(PREVIEW_PAGE).toContain(
      '<ProjectDetail project={project} related={related} isPreview />'
    )
  })

  test('the case-study body exists in exactly one file', () => {
    /*
     * Markers chosen from parts that are awkward to re-derive: the sticky
     * metadata rail, the tinted outcome panel, and the related-projects rail at
     * the end. If either page grows its own copy of the body, these stop being
     * unique and the test fails.
     */
    const markers = ['lg:sticky lg:top-24', 'Outcome', 'RelatedProjects projects={related}']

    for (const marker of markers) {
      expect(codeOf(DETAIL), `"${marker}" left the shared component`).toContain(marker)
      expect(
        codeOf(PUBLIC_PAGE),
        `"${marker}" was copied back into the public page`
      ).not.toContain(marker)
      expect(
        codeOf(PREVIEW_PAGE),
        `"${marker}" was copied into the preview route`
      ).not.toContain(marker)
    }
  })

  test('the banner is opt-in, so the public page cannot grow one by accident', () => {
    // `isPreview` defaults to false. Defaulting it the other way would put a
    // "Not published" bar on every live case study.
    expect(DETAIL).toMatch(/isPreview = false/)
    expect(DETAIL).toContain('{isPreview && <DraftBanner project={project} />}')
  })

  test('the banner names the state it is in, for both draft and published', () => {
    /*
     * The case that is easy to skip: previewing a project that is *already*
     * published. Draft and live look identical below the banner, so without the
     * "Published preview" wording an admin who has already published has no way
     * to tell that the page in front of them is the live one.
     */
    expect(DETAIL).toContain("project.published ? 'Published preview' : 'Draft preview'")
  })

  test('the related rail in a preview still shows published neighbours', () => {
    /*
     * `getRelatedProjects` filters on `published = true` and reads through the
     * public client. That is correct here: the rail is not under review, and
     * filling it with drafts would misrepresent the published page.
     */
    expect(bodyOf(DB, 'getRelatedProjects')).toContain(".eq('published', true)")
    expect(PREVIEW_PAGE).toContain('getRelatedProjects')
  })

  test('the projects table links to the preview', () => {
    // Otherwise the route exists and nothing can reach it.
    expect(sourceOf('src/components/admin/project-table-client.tsx')).toContain(
      '/admin/preview/project/${project.id}'
    )
  })

  test('the editor does not, because it would show the saved row', () => {
    /*
     * The trap this placement avoids. A preview button beside an open form reads
     * the database, not the form's state, so it would render the previous title
     * directly above the one being typed — confidently wrong, and more confusing
     * than having no such button. Save, then preview from the list.
     */
    expect(sourceOf('src/components/admin/project-form.tsx')).not.toContain(
      '/admin/preview'
    )
  })
})