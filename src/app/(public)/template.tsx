/**
 * Public page transition.
 *
 * A `template` is re-created on every navigation within its segment, unlike a
 * `layout` which is reused. That remount is the entire mechanism: the CSS
 * animation on the wrapper replays each time a public page is entered, and
 * `template.tsx` is the only App Router primitive that can do that without a
 * client component and a state machine. Nothing here needs `'use client'` —
 * the wrapper is static markup and the animation is declarative.
 *
 * Scoped to this group on purpose:
 *
 *  - The admin dashboard is outside `(public)`, so it gets no transition. A
 *    320ms fade on every CMS navigation is latency the person editing content
 *    pays over and over, and admin screens are data-dense — a cross-fade there
 *    reads as a flash rather than as polish.
 *  - `/admin/login` sits in its own group for the same reason.
 *
 * The animation is one class. See `src/styles/globals.css` ("PAGE TRANSITION")
 * for the keyframes and for why the last keyframe resolves to `transform: none`.
 */
export default function PublicTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>
}
