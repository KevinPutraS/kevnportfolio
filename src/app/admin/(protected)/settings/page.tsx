import type { Metadata } from 'next'
import { Database, HardDrive, KeyRound, ShieldCheck } from 'lucide-react'
import { getUser } from '@/lib/auth'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { ALLOWED_UPLOAD_FOLDERS, MAX_IMAGE_BYTES } from '@/lib/storage/image-types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Settings',
  robots: { index: false, follow: false },
}

/**
 * A read-only status page, not a preferences screen.
 *
 * Site-level text (name, bio, email, social links) lives in
 * `src/config/site.ts` and is deployed with the code, so there is nothing for a
 * database-backed editor to save here. Rather than ship form controls that
 * appear to work but do nothing, this reports the configuration that actually
 * governs the site and points at the file to change.
 */
export default async function AdminSettingsPage() {
  const user = await getUser()
  const configured = isSupabaseConfigured()

  const checks = [
    {
      label: 'Supabase connection',
      ok: configured,
      detail: configured
        ? 'Environment variables are present and public reads are live.'
        : 'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.',
    },
    {
      label: 'Authentication',
      ok: Boolean(user),
      detail: user ? `Signed in as ${user.email}.` : 'No active session.',
    },
    {
      label: 'Row Level Security',
      ok: configured,
      detail:
        'Enforced in the database, not in the UI. Anonymous visitors can only read published rows.',
    },
    {
      label: 'Image storage',
      ok: configured,
      detail: `Uploads are limited to ${Math.round(MAX_IMAGE_BYTES / 1024 / 1024)}MB in: ${ALLOWED_UPLOAD_FOLDERS.join(', ')}.`,
    },
  ]

  return (
    <div className="space-y-10">
      <header>
        <p className="eyebrow">Settings</p>
        <h1 className="heading-2 mt-3">Configuration</h1>
        <p className="mt-3 max-w-prose text-[rgb(var(--text-secondary))]">
          This portfolio keeps its site-wide text in the codebase, so there are no editable
          preferences to save here. What follows is the live status of the configuration that
          actually governs the site.
        </p>
      </header>

      <section aria-label="Configuration status">
        <ul className="grid gap-px border border-[rgb(var(--border-subtle))] bg-[rgb(var(--border-subtle))]">
          {checks.map((check) => (
            <li key={check.label} className="flex flex-wrap items-start gap-4 bg-[rgb(var(--surface))] p-5">
              <span
                className={
                  check.ok
                    ? 'mt-0.5 text-[rgb(var(--success))]'
                    : 'mt-0.5 text-[rgb(var(--error))]'
                }
              >
                {check.ok ? (
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Database className="h-4 w-4" aria-hidden="true" />
                )}
                <span className="sr-only">{check.ok ? 'OK' : 'Needs attention'}</span>
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {check.label}
                  <span className="sr-only">: {check.ok ? 'ok' : 'needs attention'}</span>
                </p>
                <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">{check.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="heading-3">Where to change things</h2>
        <ul className="space-y-3 text-sm text-[rgb(var(--text-secondary))]">
          <li className="flex items-start gap-3">
            <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-[rgb(var(--text-muted))]" aria-hidden="true" />
            <span>
              Name, bio, email and social links: <code className="font-mono text-xs">src/config/site.ts</code>.
              Adding a new Supabase admin user is done in the Supabase dashboard, then their email is
              added to the admin allowlist in a migration.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Database className="mt-0.5 h-4 w-4 shrink-0 text-[rgb(var(--text-muted))]" aria-hidden="true" />
            <span>
              Database schema and policies: <code className="font-mono text-xs">supabase/migrations</code>.
              Columns are constrained in Postgres, so invalid content is rejected even if it bypasses
              this interface.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <HardDrive className="mt-0.5 h-4 w-4 shrink-0 text-[rgb(var(--text-muted))]" aria-hidden="true" />
            <span>
              Uploaded images: Supabase Storage bucket <code className="font-mono text-xs">portfolio-images</code>.
              Files are kept when a record is deleted, so clean up unused ones there.
            </span>
          </li>
        </ul>
      </section>
    </div>
  )
}
