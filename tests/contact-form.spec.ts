import { expect, test, type Page } from '@playwright/test'
import { settle } from './helpers'

/**
 * The contact form has to *tell* you it worked, and it has to tell you why it did
 * not.
 *
 * Two silent-failure modes, both invisible to a passing test suite:
 *
 * - **Success.** The panel that replaces the form is mounted at the same moment
 *   as its text, so the `role="status"` had nothing to report a change to — a
 *   live region announces what appears inside an existing region, not the region
 *   itself. Worse, the button that was just pressed is unmounted with the form,
 *   and focus was on it, so focus landed on `<body>`: the keyboard user was left
 *   at the top of an empty document with no announcement of either. Focus now
 *   moves to the confirmation, which both reads the panel out and puts the user
 *   where the answer is.
 * - **Validation.** `FieldShell` used to render three mutually exclusive nodes —
 *   the error, the hint, or nothing — so a client-side error arrived as a brand
 *   new `role="alert"`, which is the one case guaranteed *not* to be announced.
 *   The server-side errors were fine, because the region was already on the page
 *   when its text changed. One always-present region per field fixes the
 *   asymmetry.
 *
 * The API is stubbed: `POST /api/contact` returns `delivered: true` when a
 * delivery channel is configured and `delivered: false` with a message when it is
 * not, so the happy path cannot be exercised on a checkout that has no Resend key
 * — the test would otherwise assert against whatever the machine happened to have.
 */

const VALID = {
  Name: 'Ada Lovelace',
  Email: 'ada@example.com',
  Subject: 'Analytical engine',
  Message: 'I have questions about the difference engine.',
}

/**
 * A field by its visible label.
 *
 * Anchored rather than exact because the label also carries the required marker
 * and a screen-reader-only " (required)", so the accessible name is
 * "Name (required)" and an exact match on "Name" finds nothing. The honeypot is
 * not reachable this way — its wrapper is `aria-hidden` — which is why filling
 * every field here cannot accidentally trip it.
 */
const field = (page: Page, label: string) => page.getByLabel(new RegExp(`^${label}\\b`))

/** Fills every field but the honeypot, which must stay empty. */
const fill = async (page: Page, values: Record<string, string> = {}) => {
  for (const [label, value] of Object.entries({ ...VALID, ...values })) {
    await field(page, label).fill(value)
  }
}

/**
 * A field's description region, resolved the way a screen reader would: through
 * the control's own `aria-describedby`.
 *
 * Not by id. The primitives generate their ids with React's `useId`, so they
 * arrive as `:r7:` and the description as `:r7:-description` — a perfectly valid
 * `id`, and not something you can put in a `#` selector without escaping.
 */
const descriptionOf = async (page: Page, label: string) => {
  const describedBy = await field(page, label).getAttribute('aria-describedby')
  expect(describedBy, `${label} has no description region`).toBeTruthy()
  return page.locator(`[id="${describedBy}"]`)
}

test.describe('contact form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact')
    await settle(page)
    // `/contact` renders the email address instead of the form when no delivery
    // channel is configured, and the harness sets a dummy one (see
    // `playwright.config.ts`). A dev server borrowed from a running `npm run dev`
    // will not have it — that is the harness's gap, not the page's, so the tests
    // skip rather than fail.
    test.skip(
      (await page.getByRole('button', { name: 'Send message' }).count()) === 0,
      'no contact form rendered: this dev server has no CONTACT_WEBHOOK_URL'
    )
  })

  test('moves focus to the confirmation and announces it', async ({ page }) => {
    await page.route('**/api/contact', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ delivered: true, message: 'Thanks — your message was received.' }),
      })
    )

    await fill(page)
    await page.getByRole('button', { name: 'Send message' }).click()

    const confirmation = page.getByRole('status').filter({ hasText: 'Message received' })
    await expect(confirmation).toBeVisible()
    // Not "the form is gone": the button that was pressed is gone, and focus with
    // it. This is the assertion that fails when the panel is only announced.
    await expect(confirmation, 'focus was dropped on <body> when the form unmounted').toBeFocused()

    // The email is genuinely not being sent anywhere in this test.
    await expect(field(page, 'Email')).toHaveCount(0)
  })

  test('shows the server message verbatim when nothing could be delivered', async ({ page }) => {
    await page.route('**/api/contact', (route) =>
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          delivered: false,
          message: 'The message could not be delivered. Please email me directly.',
        }),
      })
    )

    await fill(page)
    await page.getByRole('button', { name: 'Send message' }).click()

    // Filtered by text, not `getByRole('alert')` alone: every field carries its
    // own alert region now, so a bare role query is several nodes and the
    // strict-mode error would say nothing about which one went wrong.
    const summary = page.getByRole('alert').filter({ hasText: /could not be delivered/i })
    await expect(summary).toBeVisible()
    // The form stays put, so the values the visitor typed survive the failure.
    await expect(field(page, 'Message')).toHaveValue(VALID.Message)
  })

  test('keeps a client-side error in a live region that already exists', async ({ page }) => {
    await fill(page, { Email: 'not-an-email' })
    await page.getByRole('button', { name: 'Send message' }).click()

    const email = field(page, 'Email')
    await expect(email).toHaveAttribute('aria-invalid', 'true')

    // One permanently present description per field, pointed at by the control.
    // Before the fix this element did not exist until the error did, which is why
    // the alert went unread.
    const description = await descriptionOf(page, 'Email')
    await expect(description).toHaveAttribute('role', 'alert')
    await expect(description).toHaveText(/valid email/i)

    // Still the same node after the visitor starts fixing it: the error clears on
    // the next keystroke and the hint takes the same slot.
    await email.fill('ada@example.com')
    await expect(description).toHaveText(/Only used to reply to you/)
  })

  test('leaves no gap under a field that has nothing to say', async ({ page }) => {
    // The description is always in the DOM now. An empty node still carries the
    // `margin-top` on `.field-hint`, which would put 8px under every field in the
    // CMS and quietly change every form's rhythm.
    const gap = await field(page, 'Name')
      .locator('xpath=..')
      .locator('p')
      .evaluate((node) => {
        const style = getComputedStyle(node)
        return node.getBoundingClientRect().height + Number.parseFloat(style.marginTop)
      })

    expect(gap, 'an empty description is still taking up space').toBe(0)
    // Sanity: a field that *does* have a hint is taking up space on purpose.
    expect(await (await descriptionOf(page, 'Email')).boundingBox()).toBeTruthy()
  })
})
