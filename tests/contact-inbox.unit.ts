import { expect, test } from '@playwright/test'
import { sourceOf } from './helpers'

/**
 * The contact inbox's security boundary, asserted against the migration that
 * defines it.
 *
 * `/api/contact` runs unauthenticated, and this codebase deliberately has no
 * service-role client, so the `anon` role is the one inserting visitor
 * submissions. That makes the grants on this table the only thing standing
 * between a public form and a readable list of names, email addresses and
 * message bodies.
 *
 * The reason this reads the SQL rather than exercising the endpoint: the
 * endpoint cannot show you what the `anon` role is *able* to do, only what it
 * chose to do. A future `GRANT SELECT` or a policy edited to `USING (true)`
 * passes every behavioural test in the suite and quietly publishes the inbox.
 * This reads the statements themselves, so it fails on the change rather than on
 * the day somebody uses it.
 */
const sql = sourceOf('supabase/migrations/20261002000000_add_contact_messages.sql')

/** Every `GRANT`/`REVOKE` statement for this table, one per entry, semicolon stripped. */
function statements(keyword: 'GRANT' | 'REVOKE'): string[] {
  return sql
    .split('\n')
    .map((line) => line.trim().replace(/;$/, ''))
    .filter((line) => line.startsWith(`${keyword} `) && line.includes('contact_messages'))
}

test.describe('contact_messages grants', () => {
  test('revokes the default Supabase privileges from both roles first', () => {
    // Without this, the narrow INSERT grant below is just one row in a table the
    // roles still hold everything on.
    expect(statements('REVOKE')).toContain(
      'REVOKE ALL ON public.contact_messages FROM anon, authenticated'
    )
  })

  test('gives anon nothing beyond inserting the four visitor-supplied columns', () => {
    const grants = statements('GRANT').filter((line) => line.includes(' TO anon'))
    expect(grants).toEqual(['GRANT INSERT (name, email, subject, message) ON public.contact_messages TO anon'])

    // The specific regression worth naming: a table-level `GRANT INSERT` also
    // covers `created_at` and `is_read`, so a bot could backdate a submission or
    // file one that looks already read.
    for (const column of ['created_at', 'is_read', 'id']) {
      expect(grants.join(' '), `anon must not be granted ${column}`).not.toContain(column)
    }
  })

  test('never grants anon a way to read, change or remove a message', () => {
    const grants = statements('GRANT').filter((line) => line.includes(' TO anon'))
    for (const privilege of ['SELECT', 'UPDATE', 'DELETE', 'ALL']) {
      expect(grants.join(' '), `anon must not hold ${privilege}`).not.toContain(privilege)
    }
  })

  test('bounds every column the public can write', () => {
    /*
     * These caps are duplicated in `contactFormSchema`, and the pair has to stay
     * together: the schema keeps the bound out of the database, the CHECK keeps
     * it out of a direct PostgREST write. The email bound is named here because
     * it is the one the form schema did not originally have.
     *
     * Matched loosely on purpose. The checks are written to read well rather than
     * to parse — `email` carries an extra `position('@' …)` condition, `name` a
     * `btrim` — so pinning the exact shape of each one would fail on a harmless
     * reformat of a file whose whole job is to be read by a person.
     */
    for (const [column, low, high] of [
      ['name', '1', '100'],
      ['email', '3', '254'],
      ['subject', '1', '200'],
      ['message', '10', '5000'],
    ]) {
      const at = sql.search(new RegExp(`\\b${column}\\s+TEXT NOT NULL`))
      expect(at, `no TEXT column for ${column}`).toBeGreaterThan(-1)

      const constraint = sql.slice(at, at + 160)
      expect(constraint, `${column} must be bounded to ${low}..${high}`).toContain(
        `BETWEEN ${low} AND ${high}`
      )
    }
  })

  test('leaves the read and triage surface with authenticated admins only', () => {
    expect(statements('GRANT')).toContain(
      'GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated'
    )
  })
})

test.describe('contact_messages row level security', () => {
  test('is enabled', () => {
    expect(sql).toContain('ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY')
  })

  test('has no public SELECT policy at all', () => {
    // There is no "public can read published messages" policy here, and there
    // must never be one: nothing in this table is publishable.
    const selectPolicies = sql.match(/CREATE POLICY[^;]*?FOR SELECT[^;]*?;/g) ?? []
    expect(selectPolicies).toHaveLength(1)
    expect(selectPolicies[0]).toContain('public.is_admin()')
  })

  test('gates UPDATE and DELETE on is_admin, not on being signed in', () => {
    for (const command of ['UPDATE', 'DELETE']) {
      const policy = sql.match(new RegExp(`CREATE POLICY[^;]*?FOR ${command}[^;]*?;`))
      expect(policy, `no ${command} policy found`).not.toBeNull()
      expect(policy![0], `${command} must require is_admin()`).toContain('public.is_admin()')
    }
  })

  test('lets anyone insert, but only an unread message', () => {
    // The insert is public by definition — that is what a contact form is. The
    // `WITH CHECK` is what keeps a bot from filing triaged or backdated mail.
    const policy = sql.match(/CREATE POLICY[^;]*?FOR INSERT[^;]*?;/)
    expect(policy, 'no INSERT policy found').not.toBeNull()
    expect(policy![0]).toContain('TO anon, authenticated')
    expect(policy![0]).toContain('WITH CHECK (is_read = false)')
  })
})