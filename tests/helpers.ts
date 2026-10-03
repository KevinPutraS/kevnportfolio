import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Freeze the page before measuring anything.
 *
 * The hero fades in on mount and the backdrop drifts on a long animation, so a
 * measurement taken during either one is a measurement of a different page than
 * the one that ships. `waitForLoadState` does not help: both animations are
 * CSS, already running by the time it resolves.
 */
export async function settle(page: import('@playwright/test').Page) {
  await page.waitForLoadState('domcontentloaded')
  // `networkidle` because the suite runs these in parallel against one dev
  // server: a section can still be streaming in when the assertions run, and a
  // measurement that depends on how much of the page exists is a measurement of
  // the machine's load rather than of the layout. Observed as exactly that — a
  // pass at 111 elements in isolation and a different count under 50 workers.
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
  await page.addStyleTag({
    content:
      '*,*::before,*::after{animation:none !important;transition:none !important;transform:none !important;will-change:auto !important}',
  })
  // One frame so the style above has been applied and layout has recalculated.
  await page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  )
}

/** The public shell's `<header>`. Kept as a helper so a selector change is one edit. */
export function header(page: import('@playwright/test').Page) {
  return page.locator('header').first()
}

/**
 * Every class list in the JSX tag that `needle` appears in, joined.
 *
 * Read out of the source rather than copied, because a copy is a second place
 * for these classes to live and it is the one that does not change when the
 * component does. The tag is sliced whole and *all* of its literals are taken,
 * not just the one holding the needle: the phone and `sm:` treatments are
 * separate strings, so pulling out only the one with the token in it would build
 * a probe made of the mobile half alone — which then fails its own desktop
 * assertions for reasons that have nothing to do with the component.
 *
 * The tag is bounded by markup, not by quotes. Backing up to the nearest quote
 * instead is wrong whenever an earlier attribute holds an apostrophe: the slice
 * starts mid-literal, the quotes stop pairing up, and three attributes come
 * back as one class list.
 *
 * Both quote styles are read, because the two halves of one control are not
 * written the same way: a `classNames(...)` call holds its literals in single
 * quotes, a plain `className="…"` holds them in double, and reading only one
 * style concludes that half the components under test have no classes at all.
 * Values of other attributes ride along, which costs nothing — an unrecognised
 * class name changes no computed style, and the probe only needs the ones the
 * browser knows.
 */
export const classListIn = (contents: string, needle: string): string => {
  const at = contents.indexOf(needle)
  if (at < 0) throw new Error(`no class list containing "${needle}" — has the markup moved?`)
  /*
   * The slice starts at whichever comes later: the tag's `<`, or the quote that
   * opens the literal.
   *
   * Neither anchor works alone. Backing up to the nearest `<` runs the slice
   * through the comment above the markup, whose apostrophes then pair up into
   * prose ("…1.5rem gutter so the bar spans"). Backing up to the nearest quote
   * starts mid-literal whenever an earlier attribute holds one of its own —
   * `aria-label={`Remove ${technology}`}` — and the quotes stop pairing up from
   * there. The later of the two is the right edge of whichever of those is
   * nearer the needle, which is what every case above comes down to.
   */
  const start = Math.max(contents.lastIndexOf('<', at), contents.lastIndexOf("'", at))
  const tag = contents.slice(start, contents.indexOf('>', at))
  const lists = [...tag.matchAll(/'([^']*)'|"([^"]*)"/g)]
    .map((m) => m[1] ?? m[2])
    .filter((s) => s.trim() && !s.includes('${'))
  if (!lists.length) throw new Error(`found "${needle}" but no class list around it`)
  return lists.join(' ')
}

/** Reads a workspace source file, for specs that measure markup they cannot render. */
export const sourceOf = (path: string) => readFileSync(join(process.cwd(), path), 'utf8')

/**
 * A source file with its comments removed.
 *
 * For assertions about what code *does*, as opposed to what it says. Written after
 * a first draft failed three assertions against prose it had itself written: the
 * comment explaining why the public route never calls `getProjectById` contains
 * the string `getProjectById`, so the assertion failed on the explanation of the
 * rule it was checking.
 *
 * A test that breaks when a comment is reworded gets deleted rather than fixed,
 * and these files are heavily commented on purpose — so the needles are matched
 * against code and the comments stay free to explain.
 *
 * Block comments first: a `//` inside one would otherwise truncate the line and
 * leave the tail of that block looking like code.
 */
export const codeOf = (source: string): string =>
  source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
