import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { settle } from './helpers'

/**
 * The CMS form's save bar must sit *above* the bottom tab bar, and must get out
 * of the way entirely once the tab bar does.
 *
 * Both were `bottom: 0` on a phone and both carried a z-index, and the tab bar
 * won. The Save button ended up underneath 56px of blurred, tappable chrome:
 * present, correctly labelled, in the accessibility tree, and impossible to
 * press. Nothing logged an error and no assertion anywhere failed, because each
 * element was doing exactly what its own CSS said — the bug was in the space
 * between two elements that were each individually fine.
 *
 * The fix is a token both read (`--admin-tabbar-h`), so this file asserts the
 * resolved geometry rather than the class names: a token that the two disagree
 * about, or a `sm:` variant that stopped undoing the mobile treatment, both fail
 * here instead of on someone's phone.
 *
 * **Why this runs on public pages.** `/admin` is behind Supabase Auth, so the
 * real components cannot be rendered without a session, and a test that needs
 * credentials is a test that does not run. The class lists are therefore read
 * out of the two source files and applied to probe elements, which keeps the
 * measurement tied to the shipped class strings — if the components change,
 * this measures the change rather than a copy that was correct once. What it
 * cannot catch is markup that renders a different element than the one whose
 * classes it read; `tests/admin-chrome.spec.ts` asserting against a hardcoded
 * copy of those strings would be that test, and worse, because it would keep
 * passing.
 */

const source = (path: string) => readFileSync(join(process.cwd(), path), 'utf8')

/**
 * Every quoted class list in the JSX tag that `needle` appears in, joined.
 *
 * Read out of the source rather than copied, because a copy is a second place
 * for these classes to live and it is the one that does not change when the
 * component does. The tag is sliced whole and *all* of its strings are taken, not
 * just the one holding the needle: the phone and `sm:` treatments are separate
 * literals, so pulling out only the one with the token in it would build a probe
 * made of the mobile half alone — which then fails its own desktop assertions for
 * reasons that have nothing to do with the component. Single quotes only, so the
 * prose in the surrounding comments cannot be mistaken for markup, though note
 * that "the bar's own height" in a comment is still an apostrophe in a comment and
 * the needle has to be specific enough that no sentence can match it.
 */
const classListIn = (contents: string, needle: string): string => {
  const at = contents.indexOf(needle)
  if (at < 0) throw new Error(`no class list containing "${needle}" — has the markup moved?`)
  // Back up to the opening quote of the string the needle is inside, otherwise
  // the slice starts mid-literal and the first match is a fragment.
  const tag = contents.slice(contents.lastIndexOf("'", at), contents.indexOf('>', at))
  const lists = [...tag.matchAll(/'([^']*)'/g)].map((m) => m[1]).filter((s) => s.trim())
  if (!lists.length) throw new Error(`found "${needle}" but no class list around it`)
  return lists.join(' ')
}

const ACTIONS_NEEDLE = 'sticky bottom-[calc(var(--admin-tabbar-h)'
const TAB_ROW_NEEDLE = 'min-h-[var(--admin-tabbar-h)]'

const actions = classListIn(source('src/components/ui/form-layout.tsx'), ACTIONS_NEEDLE)
const tabRow = classListIn(source('src/components/admin/admin-tab-bar.tsx'), TAB_ROW_NEEDLE)

type Probe = {
  tokenPx: number
  tabRowHeight: number
  position: string
  bottom: number
  paddingLeft: number
  paddingRight: number
  paddingBottom: number
}

/**
 * Renders the two class lists on throwaway elements and reports the resolved
 * geometry. The sticky bar needs a scroller taller than itself to stick at all,
 * and the tab row needs to be measured on its own height rather than the nav's
 * padding.
 */
const measure = async (page: import('@playwright/test').Page): Promise<Probe> =>
  page.evaluate(
    ({ actions: actionsClasses, tabRow: tabRowClasses }) => {
      const host = document.createElement('div')
      host.style.cssText = 'position:relative;height:400px;width:320px;overflow:visible'
      document.body.appendChild(host)

      // Tall content above the bar so `position: sticky` has somewhere to travel
      // and is actually holding an offset rather than sitting at its origin.
      const filler = document.createElement('div')
      filler.style.cssText = 'height:300px'
      host.appendChild(filler)

      const bar = document.createElement('div')
      bar.className = actionsClasses
      bar.textContent = 'actions'
      host.appendChild(bar)

      const row = document.createElement('div')
      row.className = tabRowClasses
      host.appendChild(row)

      const root = getComputedStyle(document.documentElement)
      const barStyle = getComputedStyle(bar)
      const out = {
        tokenPx: Number.parseFloat(root.getPropertyValue('--admin-tabbar-h')) * 16,
        tabRowHeight: row.getBoundingClientRect().height,
        position: barStyle.position,
        bottom: Number.parseFloat(barStyle.bottom),
        paddingLeft: Number.parseFloat(barStyle.paddingLeft),
        paddingRight: Number.parseFloat(barStyle.paddingRight),
        paddingBottom: Number.parseFloat(barStyle.paddingBottom),
      }

      host.remove()
      return out
    },
    { actions, tabRow }
  )

test.describe('admin chrome', () => {
  test('both the tab bar and the form action bar are sized from one token', () => {
    const css = source('src/styles/globals.css')
    const token = /^\s*--admin-tabbar-h:\s*([^;]+);/m.exec(css)
    expect(token, '--admin-tabbar-h is not defined in globals.css').not.toBeNull()

    // Half a pixel, as everywhere else: this is about a shared source of truth,
    // not about subpixel layout, and a tolerance wider than that would hide the
    // drift this is here for.
    expect(actions).toContain(ACTIONS_NEEDLE)
    expect(tabRow).toContain(TAB_ROW_NEEDLE)
  })

  test('the sticky action bar clears the tab bar on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 780 })
    await page.goto('/')
    await settle(page)

    const probe = await measure(page)

    expect(probe.tabRowHeight, 'the tab bar no longer measures its own token').toBeCloseTo(
      probe.tokenPx,
      1
    )
    // The actual bug: equal offsets, so the bar sat on top of the button.
    expect(
      probe.bottom,
      `action bar is pinned ${probe.bottom}px from the bottom, tab bar is ${probe.tabRowHeight}px tall`
    ).toBeGreaterThanOrEqual(probe.tabRowHeight - 0.5)
    expect(probe.position, 'the action bar should be pinned below sm').toBe('sticky')
    // The gutter negation that makes it span a phone edge to edge.
    expect(probe.paddingLeft).toBeCloseTo(24, 0)
  })

  test('the action bar is back in normal flow once the tab bar is gone', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 })
    await page.goto('/')
    await settle(page)

    const probe = await measure(page)

    expect(probe.position, 'the action bar is still pinned on a desktop viewport').toBe('static')
    // `sm:p-0` has to beat `px-6`, and the padding has to come from the padding
    // utilities rather than an inline style — an inline declaration outranks
    // every class in the file, which is what left the desktop bar a floating
    // panel with a stray 1rem under it.
    expect(probe.paddingLeft, 'sm:p-0 did not undo the phone gutter').toBeCloseTo(0, 0)
    expect(probe.paddingRight, 'sm:p-0 did not undo the phone gutter').toBeCloseTo(0, 0)
    expect(probe.paddingBottom, 'safe-area padding did not survive the sm: breakpoint').toBeCloseTo(
      16,
      0
    )
  })
})
