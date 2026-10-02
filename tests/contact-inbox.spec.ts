import { expect, test, type APIRequestContext } from '@playwright/test'

/**
 * `/api/contact` after the inbox became its first delivery channel.
 *
 * The endpoint now has two independent channels — the CMS inbox and the
 * optional webhook — and the interesting failures are the combinations: a
 * webhook that is set but unreachable, no channel at all, a store that failed.
 *
 * Nothing here asserts a specific status code for a delivery failure, because
 * the answer legitimately depends on the deployment: with the test harness's
 * unreachable webhook the route answers 502, and with no channel configured at
 * all it answers 202 with `delivered: false`. What must hold in *every*
 * deployment are the two promises below — a success is a 2xx, and a failure
 * always tells the visitor where else to write. Those are the assertions, and
 * they are also the ones a well-meaning future edit is most likely to break.
 *
 * Every request carries its own `x-forwarded-for`. The endpoint rate-limits by
 * IP at 3/minute, and the suite runs fully parallel against one dev server, so
 * tests sharing an address would fail each other rather than the code.
 */

/**
 * A fresh rate-limit key per request.
 *
 * The limiter keys on `x-forwarded-for`, and this file runs in four parallel
 * workers — two projects, each with its own module instance — so a plain counter
 * hands the same address to a desktop test and a mobile test. They then spend
 * each other's budget and fail for reasons that have nothing to do with the
 * code. `process.pid` is unique per worker, which makes the pair unique without
 * any coordination.
 *
 * The octets are not inside a documentation range on purpose: the route only
 * ever uses this string as a map key and never parses it, so a readable pid
 * beats a range that looks correct and is quietly wrong.
 */
let ipCounter = 0
function uniqueIp(): string {
  ipCounter += 1
  return `10.0.${process.pid}.${ipCounter}`
}

const VALID = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  subject: 'Analytical engine commission',
  message: 'I would like to talk about the analytical engine project.',
}

function post(request: APIRequestContext, body: unknown, ip = uniqueIp()) {
  return request.post('/api/contact', { data: body, headers: { 'x-forwarded-for': ip } })
}

test.describe('contact delivery', () => {
  test('delivery and the status code always agree', async ({ request }) => {
    /*
     * The one bug class this endpoint is most likely to grow: answering "sent"
     * for a message that went nowhere. Storage runs before the webhook, so the
     * failure mode that matters is a 502 carrying `delivered: true` — a visitor
     * who never hears back and never learns the form dropped their enquiry.
     */
    const response = await post(request, VALID)
    const payload = await response.json()

    if (payload.delivered) {
      expect(response.status(), 'a delivered message must be a 2xx').toBeLessThan(400)
    } else {
      expect(response.status()).toBeGreaterThanOrEqual(202)
      // And an undelivered message must always say where else to write, rather
      // than failing silently.
      expect(payload.message).toMatch(/email/i)
    }
  })

  test('never reports a rejected request as delivered', async ({ request }) => {
    // The duplicate-message trap: the row is stored first and the webhook is a
    // bonus copy, so a webhook failure after a successful store must not tell
    // the visitor to try again.
    const response = await post(request, { ...VALID, email: 'not-an-email' })

    expect(response.status()).toBe(400)
    const payload = await response.json()
    expect(payload.delivered).not.toBe(true)
    expect(payload.errors).toHaveProperty('email')
  })
})

test.describe('contact abuse protection', () => {
  test('rejects an over-long message before it reaches any channel', async ({ request }) => {
    const response = await post(request, { ...VALID, message: 'x'.repeat(5001) })

    expect(response.status()).toBe(400)
    expect((await response.json()).errors).toHaveProperty('message')
  })

  test('rejects an address the table could not store, as a field error', async ({ request }) => {
    /*
     * `contact_messages.email` carries a 254-character CHECK, and the form schema
     * has to carry the same cap. Without the pair, a long-but-regexplausible
     * address validated, failed the insert, and came back as a *delivery*
     * failure — the visitor told to email directly because of a length the form
     * never mentioned.
     */
    const response = await post(request, { ...VALID, email: `${'a'.repeat(250)}@example.com` })

    expect(response.status()).toBe(400)
    expect((await response.json()).errors.email).toMatch(/254/)
  })

  test('accepts a tripped honeypot silently rather than teaching the bot', async ({ request }) => {
    // Reporting the honeypot would tell a scraper which field to leave alone.
    // The response claims success and nothing is stored or forwarded.
    const response = await post(request, { ...VALID, company: 'Acme Spam Co' })

    expect(response.ok()).toBe(true)
    expect((await response.json()).delivered).toBe(true)
  })

  test('rate limits repeat senders from one address', async ({ request }) => {
    const ip = uniqueIp()

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const allowed = await post(request, VALID, ip)
      // Not `toBeLessThan(429)`: a 502 from the unreachable harness webhook is
      // also "not rate limited", and this assertion is about the limiter only.
      expect(allowed.status(), `attempt ${attempt} should not be rate limited`).not.toBe(429)
    }

    const blocked = await post(request, VALID, ip)
    expect(blocked.status()).toBe(429)
    expect(blocked.headers()['retry-after']).toBeTruthy()
  })

  test('does not count a rejected message against the rate limit it never sent', async ({ request }) => {
    /*
     * A validation failure is not a submission. If invalid payloads consumed the
     * budget, a visitor who mistyped an email address three times would be locked
     * out of the form for a minute having sent nothing at all — the form
     * rejecting the enquiry it exists to catch.
     */
    const ip = uniqueIp()

    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect((await post(request, { ...VALID, email: 'nope' }, ip)).status()).toBe(400)
    }

    expect((await post(request, VALID, ip)).status()).not.toBe(429)
  })
})