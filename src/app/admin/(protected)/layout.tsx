import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'

/**
 * Guards every admin route except /admin/login, which sits in its own route
 * group so it never inherits this shell.
 *
 * The redirect is not the security boundary — it is convenience. Even if a
 * request reached a page here, the Supabase client used to read data carries
 * the caller's session and Row Level Security blocks unauthenticated reads.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[rgb(var(--background))] p-6">
        <div className="card max-w-lg p-8">
          <h1 className="heading-3">Supabase is not configured</h1>
          <p className="mt-4 text-[rgb(var(--text-secondary))]">
            The admin dashboard needs a Supabase project. Add the following to{' '}
            <code className="font-mono text-sm text-[rgb(var(--accent))]">.env.local</code> and restart
            the dev server:
          </p>
          <pre className="mt-6 overflow-x-auto border border-[rgb(var(--border-subtle))] bg-[rgb(var(--surface))] p-4 font-mono text-xs leading-relaxed">
            <code>{`NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>`}</code>
          </pre>
          <p className="mt-6 text-sm text-[rgb(var(--text-muted))]">
            See the README for the full setup, including how to create the first admin account.
          </p>
        </div>
      </div>
    )
  }

  const user = await getUser()

  if (!user) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-[rgb(var(--accent))] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[rgb(var(--accent-contrast))]"
      >
        Skip to content
      </a>
      <AdminSidebar email={user.email} />
      <div className="md:pl-64">
        <AdminHeader email={user.email} />
        <main id="main-content" className="px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  )
}
