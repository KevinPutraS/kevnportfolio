import { defineConfig, devices } from '@playwright/test'

/**
 * The suite drives the Chrome already installed on the machine
 * (`channel: 'chrome'`) rather than a Playwright-managed build.
 *
 * Downloading a second browser was not worth it here: this repo is a single
 * developer machine, the checks are layout and contrast questions that Chromium
 * answers, and a 150MB install that has to be repeated per machine is a tax on
 * anyone who clones it. The cost is that `npx playwright install` is not needed
 * and `channel: 'chrome'` will fail on a machine without Chrome, which is
 * honest — the suite is a development tool, not something CI runs unattended.
 *
 * `webServer` starts the dev server only if it is not already up, and
 * `reuseExistingServer` means a running `npm run dev` is borrowed rather than
 * fought with. It used to matter more than that: `next build` and `next dev`
 * shared `.next`, so a production build left the dev server answering 200 for the
 * HTML with a 404 for its stylesheet until it was restarted. The build now writes
 * to `.next-build` (see `next.config.mjs`), so the two no longer collide and this
 * dance is only about not starting a second server.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  // Layout assertions occasionally race a webfont swap, and a failure here reads
  // as "the site is broken" when it is a measurement that ran early.
  reporter: [['list']],

  use: {
    baseURL: 'http://localhost:3000',
    channel: 'chrome',
    /*
     * Pinned, and it matters for a reason that is easy to forget.
     *
     * The site is dark-only, but the *test browser* still reports whatever system
     * it is standing on. Playwright's default is `light`, and `theme.spec.ts`
     * asserts that a light system does not change the page — an assertion that
     * would be vacuous if the suite already agreed with what it is checking.
     * Everything else that reads a literal token value (`layering.spec.ts` and the
     * `rgb(245, 158, 11)` accent, for one) then means the same thing on every
     * machine rather than passing on a dark OS and failing on a light one.
     */
    colorScheme: 'dark',
    // A fixed device pixel ratio keeps the contrast sampling in
    // `hero-contrast.spec.ts` comparable between runs; `devices[...]` defaults
    // vary and would make the numbers move between machines.
    deviceScaleFactor: 1,
    trace: 'retain-on-failure',
  },

  projects: [
    {
      /*
       * Pure functions, no browser.
       *
       * `*.unit.ts` is arithmetic over plain data — it needs neither a viewport
       * nor a dev server, and running it under both the desktop and mobile
       * projects would execute every assertion twice to learn nothing, because
       * the answers do not depend on the viewport. It is separated so a failure
       * in it is unambiguously a logic error and not a rendering one.
       *
       * The `webServer` above is still global, so the dev server starts for this
       * project too. That is the cost of one shared config and it buys a suite
       * that stays in one runner; a second `defineConfig` would duplicate the
       * whole file to avoid it.
       */
      name: 'unit',
      testMatch: '**/*.unit.ts',
    },
    {
      name: 'desktop',
      testIgnore: '**/*.unit.ts',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
    },
    {
      /*
       * 390x780 is an iPhone 14-ish logical viewport: the width the layout is
       * most likely to break at, not a placeholder.
       *
       * Written out rather than `devices['iPhone 13']`, because that descriptor
       * carries `defaultBrowserType: 'webkit'`, which overrode `channel: 'chrome'`
       * and sent every mobile test at a browser this machine does not have. The
       * viewport, the touch flag and the DPR are all that is wanted from it.
       */
      name: 'mobile',
      testIgnore: '**/*.unit.ts',
      use: {
        viewport: { width: 390, height: 780 },
        deviceScaleFactor: 1,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
    /*
     * The contact page renders the form only when a delivery channel exists —
     * `process.env.CONTACT_WEBHOOK_URL` is read per request, and with nothing set
     * the page shows the email address instead of the form. Left to the machine's
     * own environment, `tests/contact-form.spec.ts` would pass by skipping itself
     * on a checkout without a webhook and run on the one with it, which is a
     * suite whose coverage depends on which developer is running it.
     *
     * A URL that resolves nowhere is enough: the page only checks that it is set,
     * and the tests that submit intercept the contact API request themselves, so
     * nothing is ever actually delivered.
     *
     * Note the interaction with `reuseExistingServer`: a dev server the developer
     * started by hand was not launched with this, so the form will not be there.
     * The spec skips with an explanation rather than failing when it finds no
     * form, because the page is behaving correctly — it is the harness that
     * cannot supply the variable.
     */
    env: {
      CONTACT_WEBHOOK_URL: 'https://webhook.invalid/contact-form-test',
      /*
       * Keeps `tests/contact-inbox.spec.ts` from writing to a real inbox.
       *
       * The suite posts valid payloads to `/api/contact`, and once the inbox
       * table exists those writes succeed — against whichever project
       * `.env.local` points at. Without this, every `npm run test` would add a
       * handful of undeletable-by-the-test "Ada Lovelace" rows to a live inbox,
       * and the unread count that the feature exists to provide would be
       * measuring the test suite.
       *
       * Note the same `reuseExistingServer` caveat as above: a dev server
       * started by hand did not get this variable, so run the suite against a
       * server this config started, or export it yourself.
       */
      CONTACT_INBOX_DISABLED: '1',
    },
  },
})
