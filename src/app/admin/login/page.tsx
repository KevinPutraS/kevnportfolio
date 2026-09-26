import { Suspense } from 'react'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { LoginForm } from '@/components/admin/login-form'
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
        <p className="caption text-[rgb(var(--accent))]">{siteConfig.name}</p>
        <h1 className="heading-3 mt-3">Content manager</h1>
        <p className="mt-3 text-[rgb(var(--text-secondary))]">
          Sign in to manage projects. Accounts are created in Supabase Auth.
        </p>

        {!isSupabaseConfigured() && (
          <div
            role="alert"
            className="mt-8 border border-[rgb(var(--warning))]/40 bg-[rgb(var(--warning))]/5 p-4"
          >
            <p className="text-sm text-[rgb(var(--text-primary))]">
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

        <div className="mt-8">
          <Suspense fallback={<div className="h-64" aria-hidden="true" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
