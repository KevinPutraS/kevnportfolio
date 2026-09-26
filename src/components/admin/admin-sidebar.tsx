import { AdminHeader } from './admin-header'
import { AdminBrand, AdminNavLinks, SignOutForm } from './admin-navigation'

/** Persistent desktop sidebar. Hidden below `md`, where AdminHeader takes over. */
export function AdminSidebar({ email }: { email: string | null }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[rgb(var(--border-subtle))] bg-[rgb(var(--background))] md:flex">
      <div className="flex h-16 shrink-0 items-center border-b border-[rgb(var(--border-subtle))]">
        <AdminBrand />
      </div>

      <div className="flex-1 overflow-y-auto py-6">
        <AdminNavLinks />
      </div>

      <div className="shrink-0 border-t border-[rgb(var(--border-subtle))] py-4">
        {email && (
          <p className="truncate px-4 pb-2 font-mono text-[0.6875rem] text-[rgb(var(--text-muted))]">
            {email}
          </p>
        )}
        <SignOutForm />
      </div>
    </aside>
  )
}
