import { expect, test } from '@playwright/test'
import { FOCUSABLE, isTabStop } from '../src/lib/hooks/use-focus-trap'

/**
 * What the focus trap is willing to put focus on.
 *
 * The trap has no assertions of its own. Everything it promises — Tab stays
 * inside, Escape closes, scroll locks — is a consequence of which elements it
 * decided were tab stops, and that list is one string. A bug in it is invisible
 * from the call sites: the drawer opens, focus lands somewhere, and the failure
 * only appears as a control that swallows a keypress.
 *
 * The selector is imported rather than copied so this measures what ships. What
 * is asserted is the contract, not the text: an element is a tab stop if the
 * browser says so.
 *
 * The cases that matter are the ones easy to get wrong:
 *
 * - `tabindex="-2"`. Legal, and means the same as `-1` — focusable in script,
 *   never by Tab. A trap that counts it as a stop wraps focus onto a control the
 *   user cannot Tab away from, so the keyboard appears dead on that element. The
 *   old selector excluded only `-1`, which is right for the two surfaces that use
 *   it today and wrong for every surface that does not.
 * - `disabled`. A `disabled` button is not a tab stop, and `disabled` on an
 *   ancestor `<fieldset>` takes the descendants out of the tab order too.
 * - `tabindex="0"`. Explicitly focusable, and unlike the implicit case it is
 *   *not* matched by `a[href]` or `button` — it has to come from the
 *   `[tabindex]` clause or a `div`-with-tabindex role widget is skipped.
 */

/** Markup covering every branch of the selector, in a known order. */
const FIXTURE = `
  <a href="#" id="link">link</a>
  <button id="button">button</button>
  <button id="disabled-button" disabled>disabled</button>
  <input id="input" />
  <input id="disabled-input" disabled />
  <div id="negative-one" tabindex="-1">negative one</div>
  <div id="negative-two" tabindex="-2">negative two</div>
  <div id="negative-ten" tabindex="-10">negative ten</div>
  <div id="explicit-zero" tabindex="0">explicit zero</div>
  <div id="explicit-one" tabindex="1">explicit one</div>
  <span id="plain">not focusable at all</span>
  <fieldset disabled>
    <button id="disabled-fieldset-button">inside a disabled fieldset</button>
  </fieldset>
`

/**
 * Puts the fixture on the page and reports what the trap would call a tab stop.
 *
 * The fixture is injected rather than loaded from a URL because there is no route
 * that renders these twelve combinations and inventing one to assert a string
 * would be a worse answer than a few lines of markup. It goes in at the end of
 * `<body>`, outside the page's own chrome, so nothing the site renders can be in
 * the list.
 *
 * Both halves of the answer are shipped code: the selector is imported, and
 * `isTabStop` is evaluated from its own source string inside the page. A
 * hand-written copy of either would still be passing long after the one in the
 * hook had been rewritten.
 */
const matched = async (page: import('@playwright/test').Page) => {
  await page.evaluate((html) => {
    const root = document.createElement('div')
    root.id = 'focus-trap-fixture'
    root.innerHTML = html
    document.body.appendChild(root)
  }, FIXTURE)

  return page.evaluate(
    ({ selector, predicateSource }) => {
      const isTabStop = new Function(`return ${predicateSource}`)() as (
        element: Element
      ) => boolean
      const root = document.getElementById('focus-trap-fixture')!
      return [...root.querySelectorAll(selector)].filter(isTabStop).map((el) => el.id)
    },
    { selector: FOCUSABLE, predicateSource: isTabStop.toString() }
  )
}

test.describe('focus trap tab stops', () => {
  test('a negative tabindex is never a tab stop, whatever the number', async ({ page }) => {
    await page.goto('/')

    const ids = await matched(page)

    expect(ids, 'a negative tabindex means focusable in script, never by Tab').not.toContain(
      'negative-two'
    )
    expect(ids).not.toContain('negative-ten')
    expect(ids).not.toContain('negative-one')
    // The negative branch is not so wide that it eats the positive case: an
    // over-eager `^=` fix would silently make every `tabindex="1"` widget a
    // non-stop instead, which fails just as quietly.
    expect(ids).toContain('explicit-zero')
    expect(ids).toContain('explicit-one')
  })

  test('controls are included and disabled ones are not', async ({ page }) => {
    await page.goto('/')

    const ids = await matched(page)

    expect(ids).toContain('link')
    expect(ids).toContain('button')
    expect(ids).toContain('input')
    expect(ids).not.toContain('disabled-button')
    expect(ids).not.toContain('disabled-input')
    expect(ids, 'a disabled fieldset takes its descendants out of the tab order').not.toContain(
      'disabled-fieldset-button'
    )
    expect(ids).not.toContain('plain')
  })

  test('the order it reports is the order the eye moves in', async ({ page }) => {
    await page.goto('/')

    // The trap wraps `focusable[0]` to `focusable[last]`, so a reversed list
    // would send Shift+Tab to the wrong end of the dialog. `querySelectorAll`
    // returns document order, which is the tab order for a surface that does not
    // reorder itself with `tabindex` — so the assertion is that nothing in the
    // fixture is pulling the order out of shape.
    expect(await matched(page)).toEqual([
      'link',
      'button',
      'input',
      'explicit-zero',
      'explicit-one',
    ])
  })
})