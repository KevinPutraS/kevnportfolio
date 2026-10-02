'use client'

import { useEffect, useRef } from 'react'

/**
 * What counts as a tab stop inside a trapped surface.
 *
 * The negative-`tabindex` clause is `[tabindex^="-"]`, not `[tabindex="-1"]`,
 * and the difference is the whole reason this constant is exported rather than
 * inlined where it is used.
 *
 * `tabindex` is not a binary. Any negative value means "focusable in script,
 * never by Tab" — `-1` is the convention for exactly that, and there is no
 * reason for a component to stop at `-1`: `-2`, `-3` are all legal and mean the
 * same. The trap would count `[tabindex="-2"]` as a stop, wrap focus onto it, and
 * then move focus to an element the user cannot Tab back to. `Tab` would appear
 * to do nothing on that control, with no indication of why.
 *
 * `tests/focus-trap.spec.ts` runs this selector in a real browser against a
 * fixture containing every one of those cases, so a regression here is a failing
 * assertion rather than a control nobody can leave.
 */
export const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex^="-"])'

/**
 * Whether a candidate element can actually take focus right now.
 *
 * `:disabled`, and not the `[disabled]` attribute the selector above uses. The
 * two disagree about one case that matters here: a button inside a
 * `<fieldset disabled>` has no attribute of its own and is still not a tab stop.
 * The trap would count it, wrap focus onto it, and `.focus()` on a disabled
 * control silently does nothing — the same freeze this list exists to prevent,
 * reached one level up from where the attribute check is looking.
 *
 * It lives in a filter rather than in the selector because `:disabled` is the
 * browser's own answer to "can this be focused" and covers every element kind
 * at once, instead of four selectors each guessing at it. `offsetParent` is null
 * for `display: none` subtrees, which is how a hidden control is excluded
 * without maintaining a parallel list.
 *
 * Free of module scope on purpose: `tests/focus-trap.spec.ts` evaluates this
 * function's own source in the browser against a fixture, so it asserts shipped
 * behaviour instead of a transcription of it.
 */
export function isTabStop(element: HTMLElement): boolean {
  return element.offsetParent !== null && !element.matches(':disabled')
}

/** The tab stops inside `container`, in tab order. */
function getTabStops(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(isTabStop)
}

/**
 * Traps Tab focus inside a container while `active`, closes on Escape, locks
 * body scroll, and restores focus to the previously focused element on close.
 *
 * Shared by the navigation drawer and the dialog so the keyboard behaviour is
 * identical everywhere.
 *
 * `initialFocus` selects which control receives focus when the surface opens.
 * It matters most on a destructive dialog: landing on "Delete" as the first
 * stop means a stray Enter confirms the deletion, whereas landing on "Cancel"
 * makes the safe choice the easy one. It is a CSS selector so the caller does
 * not need a ref for a button it is already rendering.
 */
export function useFocusTrap<T extends HTMLElement>(
  active: boolean,
  onClose: () => void,
  initialFocus?: string
) {
  const containerRef = useRef<T>(null)
  /*
   * `onClose` is read through a ref rather than listed as an effect dependency.
   *
   * Dependence is the trap: most call sites pass something like
   * `() => setIsOpen(false)`, which is a new function on every render, so listing
   * it would tear the effect down and rebuild it each time — re-locking the
   * scroll, re-binding the listener, and re-running the deferred `.focus()`,
   * which yanks focus out from under whoever the user Tab just moved to. That
   * makes the hook correct only if every caller remembers `useCallback`, which
   * is a rule nobody can check by reading the hook.
   *
   * Holding it in a ref means the effect depends on `active` alone, so it runs
   * exactly when the surface opens and when it closes. Escape still calls the
   * newest `onClose`, which is the behaviour you actually want.
   */
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const initialFocusRef = useRef(initialFocus)
  initialFocusRef.current = initialFocus

  useEffect(() => {
    if (!active) return

    const container = containerRef.current
    const previouslyFocused = document.activeElement as HTMLElement | null

    /*
     * Scroll lock.
     *
     * `overflow: hidden` on the body is the portable part. The scrollbar-width
     * compensation matters on desktop: hiding the body's scrollbar without
     * reserving its width makes the page jump sideways by ~15px at the exact
     * moment the overlay appears.
     */
    const previousOverflow = document.body.style.overflow
    const previousPadding = document.body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab' || !container) return

      /*
       * Counted once per Tab, which is the only moment the answer can change:
       * a control can be disabled, hidden or swapped out by whatever re-rendered
       * the surface since the last keystroke.
       */
      const focusable = getTabStops(container)

      if (focusable.length === 0) {
        /*
         * Close rather than swallow.
         *
         * An empty candidate list used to mean "keep the Tab", which is the worst
         * possible response: the trap stayed mounted, the page stayed locked, and
         * every keypress was consumed. That is what happened when the navigation
         * drawer's overlay was hidden by a breakpoint change while the trap was
         * still active — the container was `display: none`, so all of its
         * children had a null `offsetParent`, so nothing was focusable and the
         * keyboard simply stopped working. Closing hands the page back, which is
         * the correct outcome whenever there is nothing left to trap.
         */
        onCloseRef.current()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const activeElement = document.activeElement

      if (event.shiftKey && (activeElement === first || activeElement === container)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    // Deferred one frame so the element exists and the entry animation has
    // begun; focusing mid-transition can scroll a just-mounted surface.
    const focusTimer = window.setTimeout(() => {
      const preferred = initialFocusRef.current
        ? container?.querySelector<HTMLElement>(initialFocusRef.current)
        : null
      /*
       * The fallback is a real tab stop rather than the selector's first match,
       * so the surface cannot open with its focus request swallowed by a control
       * that cannot hold it — which leaves focus on the page behind the overlay
       * while the page is scroll-locked, with Tab intercepted by the trap.
       */
      const fallback = container ? (getTabStops(container)[0] ?? container) : container
      ;(preferred ?? fallback)?.focus()
    }, 20)

    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPadding
      // Restoring focus can scroll the page if the trigger has moved, so it is
      // suppressed; the browser's own scroll position is not disturbed.
      previouslyFocused?.focus?.({ preventScroll: true })
    }
  }, [active])

  return containerRef
}
