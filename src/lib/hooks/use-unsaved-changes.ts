'use client'

import { useEffect } from 'react'

/** The parts of a click and the current location that decide whether it navigates away. */
export interface NavigationCandidate {
  /** The anchor's literal `href`, not resolved. */
  href: string
  /** The anchor's `target` attribute, or `''` when it has none. */
  target: string
  /** `MouseEvent.button`. 0 is the primary button. */
  button: number
  metaKey: boolean
  ctrlKey: boolean
  shiftKey: boolean
  altKey: boolean
  /**
   * `window.location.href`, passed in rather than read so this stays a pure
   * function of its arguments and can be tested without a browser.
   */
  currentUrl: string
}

/**
 * Whether this click would take the current document away from this page.
 *
 * The guard has to be quiet about every click that is not that, because a prompt
 * on a harmless click is worse than no prompt at all: it teaches people to click
 * through dialogs, and the one time it matters they will do the same. So each
 * exclusion is a different way the document survives:
 *
 * - **Not the primary button.** Middle and right clicks are not this hook's
 *   navigation.
 * - **A modifier held.** Ctrl-click and middle-click open a new tab, leaving this
 *   document loaded and intact. Cmd-click on macOS does the same.
 * - **A target that is not this window.** `target="_blank"` and named targets open
 *   elsewhere.
 * - **A fragment.** `#overview` moves within the page.
 * - **Another origin.** Handled by `beforeunload`, which is the correct tool for an
 *   unload. Two dialogs for one navigation is worse than either alone.
 * - **The page already open.** A self-link, or a Cancel that closes a dialog.
 *
 * `href` is taken as written rather than resolved, so a relative link is compared
 * as a relative link. Callers pass `anchor.getAttribute('href')`.
 */
export function willLeaveDocument({
  href,
  target,
  button,
  metaKey,
  ctrlKey,
  shiftKey,
  altKey,
  currentUrl,
}: NavigationCandidate): boolean {
  if (button !== 0) return false
  if (metaKey || ctrlKey || shiftKey || altKey) return false
  if (target && target !== '_self') return false
  if (href.startsWith('#')) return false

  let current: URL
  let destination: URL
  try {
    /*
     * Relative against the *current* URL, not a placeholder. A fake base would
     * give every relative href the placeholder's origin, which reads as
     * cross-origin and sends every in-app link down the `beforeunload` path —
     * leaving the click guard to protect nothing at all, and passing a test that
     * only used absolute hrefs.
     */
    current = new URL(currentUrl)
    destination = new URL(href, current)
  } catch {
    // Unresolvable, so not something to reason about.
    return false
  }

  if (destination.origin !== current.origin) return false

  return destination.pathname !== current.pathname || destination.search !== current.search
}

/**
 * Warns before unsaved work is thrown away.
 *
 * The forms in the CMS hold everything in React state and write on submit, so
 * anything that unmounts them loses the edit: the back button, a link in the
 * sidebar, a refresh, closing the tab. The work at risk is a case study body
 * somebody spent an evening on, and nothing warns about it — the editor is not a
 * `<form method="post">`, so the browser has no unsaved-work protection of its own
 * to fall back on.
 *
 * The comparison is against `baseline`, the values the form opened with, so
 * navigating away from an untouched edit page is silent. That is the reason this
 * is not a `useEffect` with a hardcoded "always on".
 *
 * `baseline` is passed in rather than captured on mount so that a form which
 * populates its state from a prop in an effect can still be guarded from its
 * first render: capture-on-mount would read the empty form one tick before the
 * real values arrive and call the page dirty before anyone had touched it. It is
 * also what makes "nothing to lose" expressible — a create form passes `null`,
 * and an empty new form is not worth a dialog.
 *
 * **Two handlers, because there are two kinds of leaving.**
 *
 * 1. `beforeunload` — refresh, close, address bar, external link. The browser
 *    supplies its own wording; current browsers ignore the text, so all that
 *    matters is that `preventDefault` is called.
 * 2. A capture-phase click listener on `document` — the admin's own navigation is
 *    client-side, and a client-side transition never fires `beforeunload`. Without
 *    this the guard covers leaving the site but not leaving the page, which is the
 *    common case: "All projects" is a `<Link>` one tap away.
 *
 * Capture phase so the question is asked before the router's own handler runs;
 * `stopPropagation` then genuinely cancels the navigation instead of racing it.
 *
 * **Known gaps**, so nobody assumes otherwise:
 *
 * - Back/forward within the session is a `popstate`: not a `beforeunload`, not an
 *   anchor click. Covering it means pushing and watching a sentinel history entry,
 *   which fights the App Router's own history management and breaks the back
 *   button when it guesses wrong.
 * - Programmatic `router.push` is not covered, which is exactly what the forms do
 *   after a successful save. Prompting on the save that just worked would be the
 *   guard breaking the thing it protects.
 * - A `<form>` submit, such as sign-out, is neither a click nor an unload.
 *   Intercepting submits would also intercept the editor's own Save button, which
 *   is the one submission that must never be second-guessed.
 *
 * @param values The form's current state.
 * @param baseline The state the form opened with, or `null` for nothing worth
 *   protecting. Compared by JSON, so it must be serialisable and structurally
 *   stable — key order included.
 * @returns Whether `values` has moved away from `baseline`.
 */
export function useUnsavedChanges<T>(values: T, baseline: T | null): boolean {
  const isDirty = baseline !== null && JSON.stringify(values) !== JSON.stringify(baseline)

  useEffect(() => {
    if (!isDirty) return

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      // Required by older browsers and ignored by current ones, which show their
      // own wording. `''` rather than a string because assigning text is
      // deprecated — but it still has to be assigned for the prompt to appear.
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isDirty])

  useEffect(() => {
    if (!isDirty) return

    const onClick = (event: MouseEvent) => {
      // Someone already handled this click. Asking again would put a dialog on
      // top of a decision that has been made.
      if (event.defaultPrevented) return

      // `closest` is typed as returning `Element`, and `target` only exists on the
      // anchor subtype — which the `a[href]` selector has already guaranteed, so
      // the narrowing here is a formality rather than a second check.
      const anchor = (event.target as Element | null)?.closest('a[href]')
      if (!(anchor instanceof HTMLAnchorElement)) return

      const leaves = willLeaveDocument({
        href: anchor.getAttribute('href') ?? '',
        target: anchor.target,
        button: event.button,
        metaKey: event.metaKey,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        currentUrl: window.location.href,
      })

      if (!leaves) return

      if (!window.confirm('You have unsaved changes. Leave this page and discard them?')) {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [isDirty])

  return isDirty
}