import { AdminBrand, AdminNavLinks, SignOutForm, ViewSiteLink } from './admin-navigation'

/**
 * Persistent desktop sidebar. Hidden below `md`, where `AdminHeader` takes over.
 *
 * Fixed to the left edge and `w-64`, matched by the `md:pl-64` on the content
 * column in the admin layout. Those two numbers are a pair — `--nav-w` does not
 * exist yet and adding one would mean threading a value through two files in
 * two different directories for a single constant, so the shared figure is
 * documented here instead.
 */
export function AdminSidebar({ email }: { email: string | null }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[rgb(var(--border))] bg-[rgb(var(--bg))] md:flex">
      <div className="flex h-16 shrink-0 items-center border-b border-[rgb(var(--border))]">
        <AdminBrand />
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <AdminNavLinks />
      </div>

      <div className="shrink-0 space-y-1 border-t border-[rgb(var(--border))] p-3">
        {email && (
          <p className="truncate px-3 pb-1.5 font-mono text-[length:var(--text-xs)] text-[rgb(var(--text-muted))]">
            {email}
          </p>
        )}
        <ViewSiteLink />
        <SignOutForm />
      </div>
    </aside>
  )
}
