#!/usr/bin/env node
/**
 * Generates `public/resume.pdf` from `/resume`.
 *
 * The problem this solves
 * -----------------------
 * The resume has been printable for a while, but "printable" meant `window.print()`
 * — which hands the reader a browser dialog they have to configure themselves:
 * header and footer on, margins on "Default", background graphics off, and a
 * filename invented by the browser. Every one of those is a step between a
 * candidate and sending the document. The one-click download button already in
 * `src/components/resume/resume-actions.tsx` has been dead code, because
 * `NEXT_PUBLIC_RESUME_URL` points at a file nobody had produced.
 *
 * Why a browser, and not a PDF library
 * ------------------------------------
 * The obvious answer is `@react-pdf/renderer`, and it is the wrong one for this
 * repository. `/resume` is the one route that is a *measuring machine*: its
 * geometry is a set of CSS custom properties in `globals.css` under
 * `RESUME DOCUMENT` (210×297mm, 15mm margins, a 32mm date rail), `ResumePreview`
 * reads those back out of the DOM, and `paginateResume` decides the page breaks
 * from heights measured with `getBoundingClientRect`. Browser CSS is not a
 * styling choice here, it *is* the layout engine.
 *
 * A second layout engine cannot reproduce the first, and if the numbers match it
 * still will not: `@react-pdf/renderer` paginates with yoga/flexbox while this
 * document is a millimetre grid. The PDF would be a near-miss that looks correct
 * at a glance and is subtly wrong in the margins — which is precisely the drift
 * `src/components/resume/document.tsx` and `src/lib/resume/paginate.ts` are both
 * written at length to explain cannot happen. So this renders the actual document
 * in an actual browser and asks the browser for its PDF. `preferCSSPageSize` then
 * honours the `@page { size: A4; margin: 0 }` already in the print block, and the
 * result is byte-for-byte the same rendering path the on-screen preview uses.
 *
 * It costs a Chromium and a running server, which is why this is a build step and
 * not an API route: Chromium does not belong on a serverless request path, and
 * the output is committed to `public/` so the download button works on a plain
 * deploy with no credentials at all.
 *
 * Usage
 * -----
 *   npm run build && npm run resume:pdf
 *
 * Requires `npm run build` first, because a committed PDF should be generated
 * from the production render rather than from a dev server's first-compile. If
 * something is already listening on `RESUME_PDF_BASE_URL` it is reused instead of
 * starting a second server, mirroring `reuseExistingServer` in
 * `playwright.config.ts`.
 */

import { chromium } from '@playwright/test'
import { execFileSync, spawn } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { platform } from 'node:process'

const BASE_URL = process.env.RESUME_PDF_BASE_URL?.trim() || 'http://localhost:3000'
const OUTPUT = join(process.cwd(), 'public', 'resume.pdf')

/** Matches `playwright.config.ts`'s `webServer.timeout`. */
const SERVER_TIMEOUT_MS = 120_000
const RENDER_TIMEOUT_MS = 60_000

/**
 * Kills a process and its entire tree, platform-aware.
 *
 * Windows: `taskkill /PID <pid> /T /F` — `/T` is the critical flag that
 * recurses into children. Without it only the immediate process dies and
 * descendants (npm → cross-env → next) become orphans holding pipe handles,
 * which is exactly the hang this function exists to prevent.
 *
 * POSIX: spawn with `detached: true` so the child gets its own process group,
 * then `process.kill(-pid, 'SIGTERM')` signals the whole group. Negative PID
 * means "process group" in POSIX.
 *
 * Both paths are best-effort: if the kill fails we still return, because the
 * caller also sets `child.unref()` so the parent can exit regardless.
 */
function killTree(pid) {
  if (pid === undefined) return

  try {
    if (platform === 'win32') {
      /*
       * `execFileSync` with an argv array, not `execSync` with a command string.
       * `taskkill` resolves to `taskkill.exe` on Windows and to a *shell builtin*
       * or a `zsh: command not found` on macOS, so the binary is named
       * explicitly. The previous version called it through `require()` — which is
       * `undefined` in an ES module, so every call threw a `ReferenceError` that
       * the `catch` below swallowed. The server was never killed, the pipes stayed
       * open, and the script hung after writing a correct PDF. Silent failure is
       * the whole reason the error is not ignored here.
       */
      execFileSync('taskkill.exe', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' })
    } else {
      process.kill(-pid, 'SIGTERM')
    }
  } catch {
    // Only a process that is already gone lands here, which is the wanted state.
  }
}

/**
 * Whether anything answers on `url`.
 *
 * The status code is deliberately ignored. The question here is "is a server
 * listening", not "is this route healthy" — a 500 from the dev server still means
 * the port is bound and there is no reason to start a second one, and treating it
 * as "not up" would produce the exact port collision this is meant to avoid.
 */
async function listening(url) {
  try {
    await fetch(url, { signal: AbortSignal.timeout(2_000) })
    return true
  } catch {
    return false
  }
}

/** Starts `next start` and resolves once the port answers. */
async function startServer() {
  if (!(await listening(BASE_URL))) {
    /*
     * `npm run start` rather than `next dev`, because this writes a committed
     * artifact. A dev render carries development overhead and, more to the point,
     * is not the build anyone deploys, so a PDF made from it is a PDF of a page
     * that does not exist.
     */
    const child = spawn('npm', ['run', 'start'], {
      shell: true,
      /*
       * POSIX only. `detached` puts the child in its own process group, which is
       * what makes `process.kill(-pid)` in `killTree` reach the whole npm →
       * cross-env → next chain. Harmless and unused on Windows, where
       * `taskkill /T` walks the tree itself.
       */
      detached: platform !== 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
    })

    /*
     * Detaches the child *process handle* from the event loop. It does not cover
     * the three stdio pipes, which are separate handles and still ref the loop —
     * so they are destroyed explicitly in `stop`. Between the two, nothing this
     * function started can keep the process alive, which is the property that
     * stops the script hanging after a successful run.
     */
    child.unref()

    let output = ''
    child.stdout?.on('data', (chunk) => {
      output += chunk
    })
    child.stderr?.on('data', (chunk) => {
      output += chunk
    })

    /*
     * No `exit` handler here on purpose.
     *
     * One was, and it reported "the server exited with code 1 before it was
     * ready" at the *end of every successful run* — because the only way that
     * server exits is the `taskkill` in `killTree`, provoked deliberately. The
     * check that matters already lives in the readiness loop below, which
     * detects a dead child before it can spin the full timeout and throws with
     * the captured output attached. A second reporter that cannot tell an
     * intentional kill from a crash is worse than none.
     */

    const deadline = Date.now() + SERVER_TIMEOUT_MS
    while (Date.now() < deadline) {
      /*
       * Fail fast if the child died — no point waiting 120s for a port that
       * will never open. The captured output explains why.
       */
      if (child.exitCode !== null) {
        throw new Error(
          `server process exited with code ${child.exitCode} before it was ready.\n${output.trim()}`
        )
      }
      if (await listening(BASE_URL)) break
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    if (!(await listening(BASE_URL))) {
      killTree(child.pid)
      throw new Error(
        `no server on ${BASE_URL} after ${SERVER_TIMEOUT_MS / 1000}s. ` +
          `Is there a build to serve? Run \`npm run build\` first.`
      )
    }

    console.log(`[resume:pdf] started a server on ${BASE_URL}`)
    return () => {
      killTree(child.pid)
      child.stdout?.destroy()
      child.stderr?.destroy()
    }
  }

  console.log(`[resume:pdf] reusing the server already on ${BASE_URL}`)
  return () => {}
}

/**
 * Waits for the document to finish paginating.
 *
 * `/resume` renders nothing until `ResumePreview` has laid the document out
 * off-screen and read every run's height back. A PDF captured before that
 * resolves is not a shorter resume — it is an empty page, because in print the
 * measuring host is `display: none` and the sheets do not exist yet. The
 * appearance of a `[data-sheet]` element is the same signal
 * `tests/resume-stability.spec.ts` waits on, so the generator and the suite agree
 * on what "ready" means instead of each inventing its own.
 */
async function waitForDocument(page) {
  await page.waitForFunction(() => document.querySelectorAll('[data-sheet]').length > 0, null, {
    timeout: RENDER_TIMEOUT_MS,
  })

  return page.evaluate(() => {
    const sheets = [...document.querySelectorAll('[data-sheet]')].map(
      (sheet) => sheet.getBoundingClientRect().height
    )

    /*
     * A sheet taller than A4 means content was pushed past the page box, which is
     * a line someone will never see. The packer reports such units as `oversized`,
     * and the budgets in `lib/resume/content.ts` exist to keep that list empty, so
     * this is reported rather than tolerated: a PDF that silently clips is the one
     * failure mode this generator must not have.
     */
    return { count: sheets.length, maxHeight: Math.max(...sheets, 0) }
  })
}

/** Page count from a Chromium PDF, for the log line and the spec to cross-check. */
function countPdfPages(buffer) {
  const text = buffer.toString('latin1')
  const matches = text.match(/\/Type\s*\/Page[^s]/g)
  return matches ? matches.length : 0
}

async function main() {
  const stop = await startServer()

  try {
    const browser = await chromium.launch({ channel: 'chrome' })

    try {
      /*
       * A fixed viewport, for the same reason `playwright.config.ts` pins one:
       * the document is sized in millimetres and never consults the viewport, so
       * this cannot change the output — but an arbitrary window size would make
       * the run's screenshots and diagnostics non-reproducible for no benefit.
       */
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

      await page.goto(`${BASE_URL}/resume`, {
        waitUntil: 'networkidle',
        timeout: RENDER_TIMEOUT_MS,
      })

      /*
       * `next/font` self-hosts Inter, and every height in the document was measured
       * against whichever version of it had loaded at the time. Capturing against
       * a fallback face and a capturing against the real one are different
       * documents with the same page count, so the fonts are resolved explicitly
       * before anything is measured.
       */
      await page.evaluate(() => document.fonts.ready)

      const sheets = await waitForDocument(page)

      /*
       * Print media. `page.pdf()` already defaults to it, but stating it makes the
       * generator's contract readable at the call site rather than dependent on a
       * Playwright default, and it is what causes the palette to flip to ink on
       * paper and the viewer chrome to be torn down.
       */
      await page.emulateMedia({ media: 'print' })

      const pdf = await page.pdf({
        /*
         * The three settings that are the whole difference between this and the
         * browser dialog:
         *
         *  - `printBackground`, off by default, drops the document's own rules and
         *    borders — the sheet renders as an unstyled wall of black text.
         *  - `preferCSSPageSize`, so the `@page { size: A4; margin: 0 }` already
         *    in the print block decides the paper. Without it the page is US
         *    Letter and Chromium scales the document down to fit, which shrinks the
         *    type below its intended size.
         *  - Zero margins, rather than Chromium's default, which would inset the
         *    sheet inside the sheet.
         */
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
        displayHeaderFooter: false,
      })

      mkdirSync(dirname(OUTPUT), { recursive: true })
      writeFileSync(OUTPUT, pdf)

      const pages = countPdfPages(pdf)

      console.log(`[resume:pdf] wrote ${OUTPUT}`)
      console.log(`[resume:pdf]   ${pages} page(s) in the PDF, ${sheets.count} sheet(s) in the document`)
      console.log(`[resume:pdf]   ${(pdf.length / 1024).toFixed(1)} KB`)

      if (pages !== sheets.count) {
        throw new Error(
          `the PDF has ${pages} page(s) but the document paginated to ${sheets.count}. ` +
            `The two are produced from the same page, so they cannot legitimately differ.`
        )
      }

      /*
       * 297mm at the print viewport's 96dpi is about 1123px. A sheet much beyond
       * that is content past the page box — a clipped line on someone's CV, which
       * is exactly what the packer's `oversized` list exists to prevent.
       */
      const A4_HEIGHT_PX = 1123
      if (sheets.maxHeight > A4_HEIGHT_PX + 2) {
        throw new Error(
          `a sheet measures ${Math.round(sheets.maxHeight)}px, past A4's ~${A4_HEIGHT_PX}px. ` +
            `Content is being pushed outside the page box.`
        )
      }

      console.log('[resume:pdf] set NEXT_PUBLIC_RESUME_URL=/resume.pdf for the download button')
    } finally {
      await browser.close()
    }
  } finally {
    stop()
  }
}

main().catch((error) => {
  console.error(`\n[resume:pdf] ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
})