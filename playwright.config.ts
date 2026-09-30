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
 * fought with. This matters more than it sounds: `next build` and `next dev`
 * share `.next`, so a production build leaves the dev server serving broken
 * chunks until it is restarted. Borrowing the running server avoids adding one
 * more process to that dance.
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
    // A fixed device pixel ratio keeps the contrast sampling in
    // `hero-contrast.spec.ts` comparable between runs; `devices[...]` defaults
    // vary and would make the numbers move between machines.
    deviceScaleFactor: 1,
    trace: 'retain-on-failure',
  },

  projects: [
    {
      name: 'desktop',
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
