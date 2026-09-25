export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center" role="status" aria-label="Loading">
      <div className="text-center">
        <div className="inline-flex h-10 w-10 animate-spin rounded-full border-3 border-[rgb(var(--border))] border-t-[rgb(var(--accent))]" aria-hidden="true" />
        <p className="mt-4 text-[rgb(var(--text-secondary))]">Loading...</p>
      </div>
    </div>
  )
}