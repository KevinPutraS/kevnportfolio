'use client'

import { useEffect } from 'react'
import { THEME_STORAGE_KEY, isThemePreference, resolveTheme } from '@/lib/theme'
import { NavIcon } from './nav-icons'

/**
 * Light / dark switch.
 *
 * Reads the current theme from the DOM on click rather than holding it in state.
 * That is not a shortcut: the server cannot know the visitor's preference, so a
 * component rendering from `useState` would hydrate against dark, show the wrong
 * icon to light-theme visitors, and log a hydration mismatch on every page load.
 * Reading the attribute the pre-paint script already set means server and client
 * emit identical markup and the icon is correct on the first paint.
 *
 * The same reason both icons and both labels are in the DOM at once and CSS
 * decides which is visible. The stylesheet hides the inactive pair with
 * `display: none` — not opacity, not `sr-only` — so exactly one of them is in
 * the accessibility tree. Two `sr-only` labels would be read aloud twice, and a
 * screen-reader user would be told to switch to the theme they are already in.
 */
export function ThemeToggle() {
  function readPreference(): 'light' | 'dark' | 'system' {
    try {
      const raw = window.localStorage.getItem(THEME_STORAGE_KEY)
      if (isThemePreference(raw)) return raw
    } catch {
      // Storage blocked. The toggle still works for this page view.
    }
    return 'system'
  }

  function apply(preference: 'light' | 'dark' | 'system') {
    const theme = resolveTheme(preference, window.matchMedia('(prefers-color-scheme: light)').matches)
    document.documentElement.setAttribute('data-theme', theme)
    // Mirrors the pre-paint script, which sets this inline for the first frame.
    // Without it the property would only change when the stylesheet
    // recalculates, a beat after the attribute and visible as a colour jump.
    document.documentElement.style.colorScheme = theme
  }

  function toggle() {
    const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light'
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Nothing to do: the theme applies to this document either way.
    }
    apply(next)
  }

  /*
   * Follow the system only while the visitor has not chosen. Once they have, a
   * flip in the OS must not override an explicit decision — but someone who
   * never chose should see the site track their system without reloading.
   *
   * No dependency array on purpose: this must listen to whichever preference is
   * current, and re-subscribing is the only way to notice it changing. It also
   * runs only after hydration by definition, so there is no window in which it
   * can write an attribute the server did not render.
   */
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = () => {
      if (readPreference() === 'system') apply('system')
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return (
    <button
      type="button"
      onClick={toggle}
      data-testid="theme-toggle"
      className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] text-[rgb(var(--text-dim))] transition-colors duration-200 hover:bg-[rgb(var(--bg-highlight))] hover:text-[rgb(var(--text))]"
    >
      <span className="sr-only" data-theme-label="light">
        Switch to dark theme
      </span>
      <span className="sr-only" data-theme-label="dark">
        Switch to light theme
      </span>

      <span data-theme-icon="light">
        <NavIcon name="Sun" />
      </span>
      <span data-theme-icon="dark">
        <NavIcon name="Moon" />
      </span>
    </button>
  )
}
