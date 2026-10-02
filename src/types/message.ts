/**
 * Domain shape of a stored contact submission.
 *
 * The mirror of this in `src/types/database.ts` is the generated row type; the
 * split matches projects, experiences and certificates, where `Row` is what
 * Postgres returns and this is what components are allowed to know about.
 *
 * Every field is non-null by construction. The public insert policy pins
 * `is_read` to `false` and the database defaults supply the timestamps, so there
 * is no "partially written message" state for the inbox to render.
 */
export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  is_read: boolean
  created_at: string
}

/**
 * A message dressed for the admin table.
 *
 * `title` is what the shared row-action machinery calls a row's human label, and
 * `published` has to be optional on its side because a message has no publish
 * state — `is_read` is the switch this table exposes instead.
 */
export interface ContactMessageRow extends ContactMessage {
  title: string
}