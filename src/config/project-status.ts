/**
 * How finished a project is.
 *
 * The order is most complete to least, and it is an array rather than a union of
 * plain strings so the public page can render the list as a legend, the project
 * form can render a `<Select>`, and the Postgres CHECK constraint in
 * `supabase/migrations/20260929000000_add_project_role_status_outcome.sql` can
 * be checked against this list in a test. Three places, one list.
 *
 * `shipped` is what the site is really about, so it leads. `archived` is for
 * something that was finished and then retired, and it is deliberately not
 * called `abandoned` — a project that was learned from and set down is not a
 * failure, and the label on a public page is read as a verdict.
 *
 * The values are storage format, not display copy. The labels are what a visitor
 * sees, and they are allowed to change without a migration.
 */
export const projectStatuses = [
  { value: 'shipped', label: 'Shipped', description: 'Finished and released.' },
  { value: 'in_progress', label: 'In progress', description: 'Actively being worked on.' },
  { value: 'experiment', label: 'Experiment', description: 'Built to find something out.' },
  { value: 'archived', label: 'Archived', description: 'Finished, then put aside.' },
] as const

export type ProjectStatus = (typeof projectStatuses)[number]['value']

export const projectStatusLabels: Record<ProjectStatus, string> = Object.fromEntries(
  projectStatuses.map((status) => [status.value, status.label])
) as Record<ProjectStatus, string>

export function isProjectStatus(value: unknown): value is ProjectStatus {
  return typeof value === 'string' && value in projectStatusLabels
}
