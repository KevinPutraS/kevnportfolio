-- ===========================================================================
-- Contact messages
--
-- Why this table exists
--   * The contact endpoint previously had no storage at all: with no
--     `CONTACT_WEBHOOK_URL` set it answered `delivered: false` and the visitor
--     was told to email directly. A submission was therefore only kept if
--     somebody had already configured a third-party webhook. This table makes
--     the CMS the inbox, so the form works on a bare deploy.
--   * Nothing here is editable content. A message is written once by a visitor,
--     then only marked read/unread or deleted by an admin. There is no
--     `published`, no `sort_order`, and no `updated_at` — the only mutating
--     columns are `is_read` and deletion.
--
-- The anonymous-insert problem
--   * There is deliberately no service-role client in this codebase (see
--     README "Security"). `POST /api/contact` runs unauthenticated, so the
--     `anon` role has to be the one inserting the row.
--   * That is safe here because the table is *write-only for the public*:
--       - `anon` is granted INSERT on four named columns and nothing else, so it
--         cannot read a single row back, cannot choose its own `created_at` to
--         backdate a row, and cannot pre-tick `is_read`.
--       - `anon` is granted no UPDATE or DELETE, so a stored row cannot be
--         tampered with or suppressed after the fact.
--       - every read, flip and delete is `public.is_admin()`, i.e. the same
--         allowlist that gates the rest of the CMS.
--       - the INSERT policy's `WITH CHECK` additionally pins `is_read = false`,
--         so even a caller who somehow acquired the column cannot fabricate a
--         message that already looks triaged.
--   * What abuse protection remains is the app layer, which already existed for
--     the webhook path: honeypot field, IP rate limit and the schema length
--     caps. The CHECK constraints below mirror those caps at the database so a
--     direct PostgREST call cannot write an unbounded row either.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Mirrors `contactFormSchema` in src/lib/validation/contact.ts. The lengths
  -- are repeated as CHECK constraints on purpose: the schema protects the
  -- route, these protect the table from anything that bypasses it.
  name        TEXT NOT NULL
                CHECK (char_length(btrim(name)) BETWEEN 1 AND 100),
  email       TEXT NOT NULL
                CHECK (char_length(email) BETWEEN 3 AND 254 AND position('@' IN email) > 1),
  subject     TEXT NOT NULL
                CHECK (char_length(btrim(subject)) BETWEEN 1 AND 200),
  message     TEXT NOT NULL
                CHECK (char_length(btrim(message)) BETWEEN 10 AND 5000),

  is_read     BOOLEAN NOT NULL DEFAULT FALSE,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The inbox is newest-first, and the unread filter is the tab it defaults to.
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_unread
  ON public.contact_messages(created_at DESC)
  WHERE is_read = false;

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Grants first, policies second. RLS decides *which rows*; the privilege decides
-- *which statements are even possible*. Narrowing both means a mistake in one
-- layer is not a data breach on its own.
--
-- `REVOKE ALL` first because Supabase grants ALL on public tables to both roles
-- by default, which would hand `anon` a SELECT it must never have.
--
-- The `anon` grant names its four columns rather than the table. A table-level
-- INSERT grant covers every column, including `created_at` and `is_read`, which
-- would let a bot post a backdated row or one that arrives already triaged. It
-- also means `RETURNING` is unavailable to `anon`, which is what the public
-- insert in `/api/contact` relies on: it checks for an error and nothing else.
REVOKE ALL ON public.contact_messages FROM anon, authenticated;

GRANT INSERT (name, email, subject, message) ON public.contact_messages TO anon;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;

-- ---------------------------------------------------------------------------
-- Policies
-- ---------------------------------------------------------------------------

-- Admins read the inbox. There is intentionally no public SELECT policy: the
-- table holds names, email addresses and message bodies.
DROP POLICY IF EXISTS "Admins can read contact messages" ON public.contact_messages;
CREATE POLICY "Admins can read contact messages"
  ON public.contact_messages
  FOR SELECT
  USING (public.is_admin());

-- Visitors may submit. `WITH CHECK` pins the two columns that would let an
-- anonymous caller lie about triage state or timing.
DROP POLICY IF EXISTS "Anyone can submit a contact message" ON public.contact_messages;
CREATE POLICY "Anyone can submit a contact message"
  ON public.contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (is_read = false);

DROP POLICY IF EXISTS "Admins can update contact messages" ON public.contact_messages;
CREATE POLICY "Admins can update contact messages"
  ON public.contact_messages
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete contact messages" ON public.contact_messages;
CREATE POLICY "Admins can delete contact messages"
  ON public.contact_messages
  FOR DELETE
  USING (public.is_admin());