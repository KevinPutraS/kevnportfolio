'use client'

import { useEffect, useRef } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

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

      const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        // `offsetParent` is null for `display: none` subtrees, which is how a
        // hidden control is excluded without maintaining a parallel list.
        (element) => element.offsetParent !== null
      )

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
      const fallback = container?.querySelector<HTMLElement>(FOCUSABLE) ?? container
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
