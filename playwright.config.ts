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
     * Pinned, and it was missing for a reason worth recording.
     *
     * Playwright's default is `light`. That was invisible while the site was
     * dark-only, and it became visible the moment the theme followed the system:
     * `layering.spec.ts` asserts against literal dark token values such as
     * `rgb(245, 158, 11)`, and it started reading `rgb(146, 92, 6)` — the light
     * accent — because the test browser now reported a light system.
     *
     * The deeper problem is that those assertions would otherwise depend on the
     * developer's OS. A machine set to dark would have kept them passing while a
     * machine set to light failed, which is the worst shape for a test: it
     * reports a rendering bug that is really an environment difference. Pinning
     * the baseline makes the dark assertions mean the same thing everywhere.
     *
     * Tests that care about theme choice opt in explicitly — `emulateMedia` in
     * `theme.spec.ts`, or a seeded `localStorage` in `palette-contrast.spec.ts` —
     * so this only sets the starting point, it does not constrain them.
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
  },
})
