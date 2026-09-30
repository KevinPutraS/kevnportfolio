import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { settle } from './helpers'

/**
 * A Tailwind utility on an element beats a class declared in globals.css.
 *
 * For a long time the classes after `@layer base` in globals.css were plain
 * unlayered CSS sitting *after* `@tailwind utilities` in that file, so Tailwind
 * emitted them after the utilities and, at equal specificity, later won. So
 * `px-4` on an element that also had `.btn-sm` did nothing, and
 * `text-[…--error]` on something with `.eyebrow` did nothing. Three of those
 * were shipping bugs: both error pages rendered their eyebrow grey instead of
 * red, the contact form's "Sent" confirmation was never green, and a button
 * written `rounded-[var(--radius-full)]` was not a pill.
 *
 * Wrapping them in `@layer components` fixed it, and this file is here because
 * that failure is invisible. Nothing errors, nothing warns, the class list in the
 * JSX reads correctly, and the only symptom is a colour or a radius that is
 * subtly not what the file says. It is easy to write `text-[rgb(var(--error))]`,
 * see it in the markup, and never notice that the error page is grey.
 *
 * The pairs below are the ones that actually occur in the source. Each is
 * asserted on the *resolved* value, so this fails again the moment precedence
 * goes back to the component class.
 *
 * Expected values are read out of globals.css in Node rather than measured
 * through the CSSOM: `element.style.color = '248 113 113'` does not parse in
 * Chrome's setter, the value is silently dropped, and the probe then inherits the
 * body's colour and the assertion passes for the wrong reason.
 */

const css = readFileSync(join(process.cwd(), 'src/styles/globals.css'), 'utf8')

/** Reads a token that holds either an `r g b` triplet or a single length. */
const token = (name: string): string => {
  const m = css.match(new RegExp(`^\\s*${name}:\\s*([^;]+);`, 'm'))
  if (!m) throw new Error(`${name} is not defined in globals.css`)
  const raw = m[1].trim()
  const nums = raw.match(/[\d.]+/g)
  if (nums && nums.length === 3) return `rgb(${nums[0]}, ${nums[1]}, ${nums[2]})`
  return raw
}

type Case = {
  what: string
  className: string
  prop: string
  /** A colour token, or a literal resolved value for everything else. */
  expectToken?: string
  expectValue?: string
}

const CASES: Case[] = [
  // Three of these were live bugs: an error page that was never red, a contact
  // form confirmation that was never green, and a button marked as a pill that
  // was not one.
  { what: 'an error eyebrow renders red', className: 'eyebrow text-[rgb(var(--error))]', prop: 'color', expectToken: '--error' },
  { what: 'a success eyebrow renders green', className: 'eyebrow text-[rgb(var(--success))]', prop: 'color', expectToken: '--success' },
  { what: 'a pill button is actually a pill', className: 'btn btn-outline btn-sm rounded-[var(--radius-full)]', prop: 'borderRadius', expectToken: '--radius-full' },
  { what: 'a size class does not override the padding asked for', className: 'btn btn-sm px-4', prop: 'paddingLeft', expectValue: '16px' },
  { what: 'a tech list takes the colour asked for', className: 'tech-list text-[rgb(var(--text-dim))]', prop: 'color', expectToken: '--text-dim' },
  { what: 'a caption takes the colour asked for', className: 'caption text-[rgb(var(--accent))]', prop: 'color', expectToken: '--accent' },
  { what: 'a label takes the colour asked for', className: 'label text-[rgb(var(--accent))]', prop: 'color', expectToken: '--accent' },
  { what: 'a meta label takes the colour asked for', className: 'meta text-[rgb(var(--text-dim))]', prop: 'color', expectToken: '--text-dim' },
  { what: 'a prose block honours its max-w utility', className: 'prose-block max-w-2xl', prop: 'maxWidth', expectValue: '672px' },
  // The class must still win where the utility is not in play. A test that only
  // checked overrides would pass on a stylesheet where the classes had stopped
  // applying altogether.
  { what: 'a component class still applies with no utility beside it', className: 'eyebrow', prop: 'color', expectToken: '--text-muted' },
  { what: 'a component class still sets its own size', className: 'meta-strong', prop: 'textTransform', expectValue: 'uppercase' },
]

test.describe('cascade layering', () => {
  test('a utility on an element beats a class from globals.css', async ({ page }) => {
    await page.goto('/')
    await settle(page)

    const resolved = await page.evaluate((cases) => {
      const host = document.createElement('div')
      host.style.cssText = 'position:absolute;left:-9999px;top:0'
      document.body.appendChild(host)

      const out: Array<{ what: string; prop: string; value: string }> = []
      for (const c of cases) {
        const el = document.createElement('p')
        el.className = c.className
        el.textContent = 'probe'
        host.appendChild(el)
        // getComputedStyle is indexable by property name, but TypeScript needs to
        // be told the key is a string rather than a numeric index.
        const value = (getComputedStyle(el) as unknown as Record<string, string>)[c.prop]
        out.push({ what: c.what, prop: c.prop, value })
        el.remove()
      }
      host.remove()
      return out
    }, CASES)

    const failures: string[] = []
    for (let i = 0; i < CASES.length; i++) {
      const c = CASES[i]
      const got = resolved[i].value.trim()
      const want = c.expectValue ?? token(c.expectToken!)
      if (got !== want) failures.push(`${c.what}: ${c.className} { ${c.prop} } is "${got}", expected "${want}"`)
    }

    expect(failures, `utilities must win over globals.css component classes:\n  ${failures.join('\n  ')}`).toEqual([])
  })

  test('the component classes are emitted before Tailwind utilities', async ({ page }) => {
    // The mechanism, checked directly, and deliberately *not* a check for
    // `@layer`. Tailwind consumes `@layer` in your own CSS as a build-time
    // directive: it hoists the block into the `components` slot of its own output
    // and drops the keyword. The served stylesheet contains no `@layer` at all —
    // checked, after assuming otherwise and being wrong about it. What makes the
    // utilities win is source order in the emitted sheet, so that is what is
    // asserted here.
    await page.goto('/')
    await settle(page)

    const found = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets)
      for (const sheet of sheets) {
        let text: string
        try {
          text = Array.from(sheet.cssRules)
            .map((r) => r.cssText)
            .join('\n')
        } catch {
          continue // cross-origin sheet
        }
        // Match on a rule, not a substring: `.container` also matches Tailwind's
        // own container utility, and `-webkit-` prefixed echoes are noise.
        const ruleIndex = (selector: string) => {
          for (const r of Array.from(sheet.cssRules)) {
            if (r instanceof CSSStyleRule && r.selectorText?.split(',').some((s) => s.trim() === selector)) {
              return text.indexOf(r.cssText)
            }
          }
          return -1
        }
        const component = ruleIndex('.eyebrow')
        const utility = ruleIndex('.px-4')
        if (component >= 0 && utility >= 0) return { component, utility, hasLayerKeyword: /@layer/.test(text) }
      }
      return null
    })

    expect(found, 'could not locate both .eyebrow and .px-4 in any readable stylesheet').not.toBeNull()
    expect(
      found!.component,
      '.eyebrow must be emitted before .px-4, or utilities cannot override the component class'
    ).toBeLessThan(found!.utility)
    // Guards the assumption this file is built on, so a future Tailwind upgrade
    // that starts emitting real cascade layers is noticed here rather than
    // silently changing what these assertions mean.
    expect(found!.hasLayerKeyword, 'Tailwind now emits real @layer rules; re-check the mechanism in globals.css').toBe(false)
  })
})
