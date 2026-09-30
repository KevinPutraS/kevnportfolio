import { expect, test } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * The build output has to be where the host looks for it.
 *
 * Added after a deploy failed on a commit where the build itself was fine: all 22
 * pages generated, then Vercel reported it could not find
 * `.next/routes-manifest.json`. The build had written to `.next-build`, because
 * `next.config.mjs` moves it there so a production build cannot clobber the dev
 * server's manifest. Nothing in the repo told Vercel that, so the project setting
 * fell back to the framework default of `.next` and the deploy died at the last
 * step, after the expensive part had already succeeded.
 *
 * This is not the kind of break a test suite catches by itself. `next build`
 * succeeding locally is true and was true; what failed was an agreement between
 * the build and a host config that is not in the repository by default. The
 * assertion below is that agreement, checked as data rather than inferred from a
 * green build.
 *
 * It reads `vercel.json` and `package.json` and needs neither a build nor a server.
 * That matters: the failure it guards is only observable on a deploy, and a check
 * that required a build would itself cost a build on every run.
 */

type PackageJson = {
  scripts?: Record<string, string>
}

const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as PackageJson

/** The distDir the build actually uses, or null if it is left at the default. */
function distDirFromNextConfig(): string | null {
  const source = readFileSync('next.config.mjs', 'utf8')
  const match = source.match(/distDir:\s*process\.env\.NEXT_DIST_DIR\s*\|\|\s*'([^']+)'/)
  return match ? match[1] : null
}

test.describe('deploy output directory', () => {
  test('the build script pins a distDir at all', () => {
    // The whole failure traces back to this. Worth asserting on its own, because
    // if someone drops the env var the deploy breaks again and the reason is not
    // obvious from the error, which only ever mentions `.next`.
    const build = pkg.scripts?.build ?? ''
    expect(build, 'the build script should pin NEXT_DIST_DIR explicitly').toContain('NEXT_DIST_DIR=')
  })

  test('start reads the same directory the build wrote to', () => {
    const build = pkg.scripts?.build ?? ''
    const start = pkg.scripts?.start ?? ''
    const built = build.match(/NEXT_DIST_DIR=(\S+)/)?.[1]
    expect(built, 'could not read the distDir out of the build script').toBeTruthy()
    expect(
      start,
      '`start` must serve the directory `build` produced; a mismatch is a production server with no output'
    ).toContain(`NEXT_DIST_DIR=${built}`)
  })

  test('vercel.json points at the same distDir', () => {
    expect(existsSync('vercel.json'), 'vercel.json is required to override the host output directory').toBe(true)
    const config = JSON.parse(readFileSync('vercel.json', 'utf8')) as {
      outputDirectory?: string
      framework?: string
      buildCommand?: string
    }

    const built = pkg.scripts?.build?.match(/NEXT_DIST_DIR=(\S+)/)?.[1]
    expect(
      config.outputDirectory,
      `outputDirectory must be "${built}". Vercel defaults to ".next" for Next.js, and a build that ` +
        `writes anywhere else fails at routes-manifest.json after the whole build has succeeded.`
    ).toBe(built)

    // Without `framework`, Vercel may treat the project as a static build and skip
    // the Next.js adapter entirely, which fails differently and just as late.
    expect(config.framework, 'framework should be declared so the Next.js builder is used').toBe('nextjs')
  })

  test('the default distDir in next.config keeps the dev server on .next', () => {
    // The two directories are the entire point of the split. If the fallback
    // became `.next-build` as well, `next dev` and `next build` would share a
    // directory again and the original bug — a build silently 404ing the dev
    // server's stylesheet — would return.
    expect(
      distDirFromNextConfig(),
      'the no-environment fallback must stay .next so `next dev` needs no env var'
    ).toBe('.next')
  })

  test('both build directories are gitignored', () => {
    // Not cosmetic: a committed `.next-build` would be a stale build in the
    // repository, and the deploy would clone it.
    const ignore = readFileSync('.gitignore', 'utf8')
    expect(ignore, '.next should be ignored').toMatch(/^\.next$/m)
    expect(ignore, '.next-build should be ignored').toMatch(/^\.next-build$/m)
  })
})

/*
 * The checks above read configuration, not artefacts, so they cannot see the case
 * where the configuration and the filesystem have drifted — a `vercel.json` that
 * names a directory nothing writes to. That case is only worth a test once a
 * build exists, and it must not trigger one: `npm run check` builds, and a spec
 * that built the project would double the cost of every run.
 *
 * So this one is opportunistic. If a build is already on disk from a previous run
 * it is checked; if not, it reports that it had nothing to check and passes. A
 * skipped assertion that is visible in the output beats an assertion that quietly
 * rebuilds the world.
 */
test.describe('deploy output, if a build is present', () => {
  test('the directory vercel.json names actually holds a build', () => {
    const config = JSON.parse(readFileSync('vercel.json', 'utf8')) as { outputDirectory?: string }
    const dir = config.outputDirectory ?? '.next'

    if (!existsSync(dir)) {
      console.log(`  no build at "${dir}" right now, so nothing to verify`)
      return
    }

    const files = readdirSync(dir)
    for (const required of ['routes-manifest.json', 'BUILD_ID']) {
      expect(
        files,
        `"${dir}" exists but has no ${required}, so it is not a finished build. Vercel fails on exactly this.`
      ).toContain(required)
    }

    // Cheap positive control: if this throws, the working directory is not the
    // repo root and every other relative path in this file is wrong too.
    expect(existsSync('package.json')).toBe(true)
    expect(() => execFileSync('git', ['rev-parse', '--git-dir'])).not.toThrow()
  })
})

test.describe('a build is never required to run the suite', () => {
  test('this spec does not invoke a production build', () => {
    // Stated as a test because the tempting fix for the drift case above is to
    // just run the build, and that would make the suite depend on a full
    // production compile to check a string.
    //
    // Scans for an invocation, not the words. The prose in this file discusses
    // `next build` several times and a keyword match would flag the comment that
    // explains the rule, which is the opposite of useful. Only executable calls
    // count, and the one allowlisted below is `git rev-parse`, which reads
    // `.git` and costs nothing.
    const source = readFileSync(join('tests', 'deploy-output.unit.ts'), 'utf8')
    const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')

    expect(code, 'this spec must not shell out to a build').not.toMatch(
      /execFileSync\([^)]*['"`](npm|npx|yarn|pnpm|next)['"`][^)]*\)/,
    )
    expect(code, 'this spec must not run next build').not.toMatch(/['"`]build['"`]\s*\]/)
  })
})
