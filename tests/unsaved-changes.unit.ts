import { expect, test } from '@playwright/test'
import { willLeaveDocument, type NavigationCandidate } from '../src/lib/hooks/use-unsaved-changes'
import { codeOf, sourceOf } from './helpers'

/**
 * The unsaved-changes guard on the three CMS editors.
 *
 * Losing an evening's case study to a stray click is the kind of failure that gets
 * described as "the CMS is unreliable" rather than as a bug, and nothing in the
 * browser surfaces it: the editors are not `<form method="post">`, so there is no
 * native unsaved-work protection to fall back on and no error anywhere. The whole
 * guard is two event listeners and a boolean.
 *
 * `willLeaveDocument` is a separate export for exactly one reason: it holds every
 * decision that can be wrong, and pulling it out of the listener makes those
 * decisions testable without a browser and without re-implementing them here. A
 * test that copied the conditions would pass while the real function drifted,
 * which is worse than no test.
 *
 * **What is not covered here.** The listeners themselves — that `beforeunload`
 * is registered only while dirty, that the click handler is capture-phase so it
 * can cancel the router, that `confirm` is actually called — need a rendered form
 * and a session, which this suite does not have. The wiring assertions at the
 * bottom cover that the guard is attached to all three editors and armed against
 * the right baseline, and they are the part a well-meaning refactor is most likely
 * to drop: a hook that is imported but called with `null` looks identical from the
 * outside and protects nothing.
 */

const PAGE = 'https://kevn.dev/admin/projects/6f1c2b3a-0000-4000-8000-000000000000/edit'

/** A left-click with no modifiers: the default the guard has to get right. */
function click(href: string, overrides: Partial<NavigationCandidate> = {}): NavigationCandidate {
  return {
    href,
    target: '',
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    currentUrl: PAGE,
    ...overrides,
  }
}

test.describe('the click guard asks about the right clicks', () => {
  test('prompts for a same-origin link to another page', () => {
    // The whole reason the listener exists. `beforeunload` never fires for this:
    // it is a client-side transition inside the admin shell.
    expect(willLeaveDocument(click('/admin/projects'))).toBe(true)
    expect(willLeaveDocument(click('https://kevn.dev/admin/certificates'))).toBe(true)
  })

  test('resolves a relative href against the current page', () => {
    /*
     * The bug this case was written for. An earlier draft resolved against a
     * placeholder origin, which handed every relative link a different origin than
     * the page had — so every in-app link was classified as leaving the site and
     * the click guard declined to guard anything. Both forms must be answered
     * against the real location.
     */
    expect(willLeaveDocument(click('../../experience'))).toBe(true)
    expect(willLeaveDocument(click('?category=web'))).toBe(true)
    expect(willLeaveDocument(click('subdir/'))).toBe(true)
  })

  test('stays quiet for a link back to the page already open', () => {
    // Cancel buttons and self-links. A prompt here would be noise, and a dialog
    // that can appear without leaving is a dialog people learn to dismiss.
    expect(willLeaveDocument(click(new URL(PAGE).pathname))).toBe(false)
    expect(willLeaveDocument(click(new URL(PAGE).pathname + new URL(PAGE).search))).toBe(false)
  })

  test('treats a query change as leaving, since the page reloads', () => {
    // Same path, different search: a different render, and the editor is gone.
    expect(willLeaveDocument(click(`${new URL(PAGE).pathname}?page=2`))).toBe(true)
  })

  test('stays quiet for a fragment', () => {
    // The jump list in the long editors is all `href="#section"`.
    expect(willLeaveDocument(click('#overview'))).toBe(false)
  })

  test('leaves another origin to beforeunload', () => {
    // Two dialogs for one navigation is worse than either one alone, and
    // `beforeunload` is the handler that actually fires here.
    expect(willLeaveDocument(click('https://example.com/anything'))).toBe(false)
    expect(willLeaveDocument(click('https://kevn.dev.evil.test/admin'))).toBe(false)
  })

  test('stays quiet for a link that opens elsewhere', () => {
    // The document survives, so there is nothing to protect.
    expect(willLeaveDocument(click('/projects', { target: '_blank' }))).toBe(false)
    expect(willLeaveDocument(click('/projects', { target: 'preview' }))).toBe(false)
    // `_self` is the same window, so it does leave.
    expect(willLeaveDocument(click('/projects', { target: '_self' }))).toBe(true)
  })

  test('stays quiet for a modified or non-primary click', () => {
    // All of these open a new tab or a context menu. The editor is still there
    // when the user comes back.
    for (const button of [1, 2]) {
      expect(willLeaveDocument(click('/admin/projects', { button })), `button ${button}`).toBe(false)
    }
    for (const modifier of ['metaKey', 'ctrlKey', 'shiftKey', 'altKey'] as const) {
      expect(
        willLeaveDocument(click('/admin/projects', { [modifier]: true })),
        modifier
      ).toBe(false)
    }
  })

  test('stays quiet for a scheme that is not a navigation at all', () => {
    // `mailto:` and `tel:` resolve with a null origin. They must not read as a
    // cross-origin unload either, or the contact page's own email link would
    // prompt on a form that is dirty — and for a click that unloads nothing.
    expect(willLeaveDocument(click('mailto:hello@example.com'))).toBe(false)
    expect(willLeaveDocument(click('tel:+15550100'))).toBe(false)
  })

  test('stays quiet rather than throwing on an unresolvable href', () => {
    // Must not become a 500 in the listener: an exception here would leave the
    // navigation half-cancelled and the user on a page that did not change.
    expect(willLeaveDocument(click('http://['))).toBe(false)
  })
})

test.describe('the guard is wired to all three editors', () => {
  const forms = [
    ['project', 'src/components/admin/project-form.tsx', 'toFormData(project)'],
    ['certificate', 'src/components/admin/certificate-form.tsx', 'toFormData(certificate)'],
    ['experience', 'src/components/admin/experience-form.tsx', 'toFormData(experience)'],
  ] as const

  for (const [name, path, baselineCall] of forms) {
    test(`${name}: guarded, with a baseline and a visible marker`, () => {
      const code = codeOf(sourceOf(path))
      expect(code, `${name} does not use the guard`).toContain('useUnsavedChanges')
      // The baseline has to come from the saved row. Comparing against the
      // form's own current state would always read as clean and never prompt.
      expect(code, `${name} lost its baseline`).toContain(baselineCall)
      // Silent guards are the failure mode nobody notices, so the state is shown
      // next to the Save button rather than only appearing as a surprise dialog.
      expect(code, `${name} does not show the unsaved state`).toContain(
        "status={isDirty ? 'Unsaved changes' : ''}"
      )
    })
  }

  test('a create form has no baseline, because a blank one is not worth a dialog', () => {
    /*
     * The `null` in `project ? toFormData(project) : null`. Without it the first
     * keystroke on a new project arms a confirm for a form that has nothing in it
     * — and the person who typed it has not lost anything by navigating away.
     */
    expect(codeOf(sourceOf('src/components/admin/project-form.tsx'))).toContain(
      'project ? toFormData(project) : null'
    )
  })

  test('the status slot exists, and the pending label still wins over it', () => {
    const code = codeOf(sourceOf('src/components/ui/form-layout.tsx'))
    expect(code, 'FormStickyActions grew no status slot').toContain('status')
    // "Saving…" next to a button reading "Saving…" is fine; "Unsaved changes" next
    // to it would assert the opposite of what is happening.
    expect(code).toMatch(/isPending \? 'Saving…' : status/)
  })

  test('the sign-out form is left alone on purpose', () => {
    /*
     * The guard does not intercept submits, because intercepting them would also
     * intercept the editor's own Save. Sign-out with unsaved work is therefore a
     * known gap rather than a handled case — recorded here so the decision is not
     * mistaken for an oversight and "fixed" by prompting on Save.
     */
    expect(codeOf(sourceOf('src/lib/hooks/use-unsaved-changes.ts'))).not.toContain(
      "addEventListener('submit'"
    )
    expect(codeOf(sourceOf('src/lib/hooks/use-unsaved-changes.ts'))).toContain(
      "addEventListener('beforeunload'"
    )
  })
})