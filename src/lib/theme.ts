/**
 * Theme selection.
 *
 * The whole implementation is one attribute on `<html>`. `:root` is the dark
 * palette, `:root[data-theme='light']` is the light one, and there is no rule for
 * "dark" because not needing one is the point.
 *
 * The stored preference is `'light' | 'dark' | 'system'`, and `data-theme` holds
 * the *resolved* value rather than the preference. Resolving in script rather than
 * in CSS is what lets the stylesheet stay at one light block and no dark block,
 * and it is why a visitor whose system flips at sunset sees the site follow
 * without a reload.
 */

/** Shared with the pre-paint script below, so the key exists in exactly one place. */
export const THEME_STORAGE_KEY = 'theme'

export type Theme = 'light' | 'dark'
export type ThemePreference = Theme | 'system'

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system'
}

/**
 * What a preference resolves to on this machine right now.
 *
 * Exported so the toggle, the listener and the pre-paint script agree on one
 * definition. `matchMedia` is checked for existence because it is absent in the
 * handful of non-browser environments that import this file during a build.
 */
export function resolveTheme(preference: ThemePreference, prefersLight: boolean): Theme {
  if (preference === 'light' || preference === 'dark') return preference
  return prefersLight ? 'light' : 'dark'
}

/**
 * The pre-paint script, as source text.
 *
 * This runs as the first thing in `<body>`, which is early enough: nothing has
 * painted yet, so setting the attribute here means the light palette is in force
 * for the very first frame and there is no flash of the wrong theme. Doing it
 * after hydration instead would be a white page appearing before a black one, on
 * every navigation to a page with a fresh document.
 *
 * It is a string rather than a component because it has to be self-contained
 * JavaScript that runs before any module has loaded — no imports, no helpers from
 * this file, nothing to bundle.
 *
 * Every access is guarded. `localStorage` throws outright in some privacy modes
 * and in a sandboxed frame, and an uncaught throw here would leave the document
 * with no `data-theme` at all, which reads as the dark palette by accident rather
 * than by choice.
 */
export const THEME_SCRIPT = `(function(){try{var d=document.documentElement;var s=null;try{s=window.localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY
)})}catch(e){}var t=(s==='light'||s==='dark')?s:((window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches)?'light':'dark');d.setAttribute('data-theme',t);d.style.colorScheme=t}catch(e){document.documentElement.setAttribute('data-theme','dark')}})();`
