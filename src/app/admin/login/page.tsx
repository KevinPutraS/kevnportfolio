import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { LoginForm } from '@/components/admin/login-form'
import { ArrowLink } from '@/components/ui/arrow-link'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: 'Admin sign in',
  description: 'Content manager sign in.',
  // Never index the admin area.
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AdminLoginPage() {
  if (isSupabaseConfigured() && (await getUser())) {
    redirect('/admin')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[rgb(var(--background))] px-5 py-16">
      <div className="w-full max-w-sm">
        {/*
          A way back out. The login page used to be a dead end: no link to the
          public site, and no visual sign you are looking at the private CMS
          rather than the portfolio. Somebody who mistyped `/admin` on a public
          URL had no indication of what they were looking at and no exit. The
          wordmark above is a link for the same reason.
        */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="font-display text-sm font-bold tracking-[-0.01em] text-[rgb(var(--text))] transition-colors hover:text-[rgb(var(--accent))]"
          >
            {siteConfig.name}
          </Link>
          <ArrowLink href="/" direction="up">
            Back to site
          </ArrowLink>
        </div>

        <div className="mt-6 rounded-[var(--radius-xl)] border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] p-6 shadow-[0_24px_60px_-32px_rgb(0_0_0/0.8)] sm:p-7">
          <p className="eyebrow">Admin</p>
          <h1 className="h2 mt-4 text-balance">Content manager</h1>
          <p className="mt-3 text-pretty text-[length:var(--text-body-sm)] text-[rgb(var(--text-dim))]">
            Sign in to manage projects, experience and certificates. Accounts are created in Supabase
            Auth.
          </p>

          {!isSupabaseConfigured() && (
            <div
              role="alert"
              className="mt-6 border border-[rgb(var(--warning)/0.4)] bg-[rgb(var(--warning)/0.05)] p-4"
            >
              <p className="text-[length:var(--text-body-sm)] text-[rgb(var(--text-dim))]">
                Supabase is not configured, so sign-in is unavailable. Add{' '}
                <code className="font-mono text-xs text-[rgb(var(--accent))]">
                  NEXT_PUBLIC_SUPABASE_URL
                </code>{' '}
                and{' '}
                <code className="font-mono text-xs text-[rgb(var(--accent))]">
                  NEXT_PUBLIC_SUPABASE_ANON_KEY
                </code>{' '}
                to <code className="font-mono text-xs">.env.local</code>.
              </p>
            </div>
          )}

          <div className="mt-7">
            <Suspense fallback={<div className="h-64" aria-hidden="true" />}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
