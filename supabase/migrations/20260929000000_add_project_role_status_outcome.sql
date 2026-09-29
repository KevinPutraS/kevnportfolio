-- ===========================================================================
-- Project role, status and outcome
--
-- Three columns that answer questions the existing row cannot.
--
-- The projects page already claims, in its own copy, that "not everything here
-- is finished — that is part of the point" (`src/app/(public)/projects/page.tsx`).
-- Before this migration nothing in the data could express that: `featured` and
-- `published` control *where* a project appears, and `project_date` is when it
-- was. None of them say how it went. So the copy was making a promise the
-- schema had no way to keep.
--
-- Design notes
--   * All three are nullable, and `status` is the only one with a CHECK. That
--     asymmetry is deliberate — see below.
--   * `role` and `outcome` are free text, not enums. The useful values differ
--     per project ("built the front end alone", "took over the API after the
--     original author left"), and an enum would either be too coarse to be
--     true or so long it is a text field with extra steps.
--   * `status` *is* an enum, because the whole value of it is that a reader can
--     rely on the four values meaning the same thing across the archive. The
--     public page styles these, so a free-text value there would render as an
--     unstyled string.
--
-- Why `status` is nullable rather than defaulted
--   The tempting version is `NOT NULL DEFAULT 'shipped'`. It would make the
--   column impossible to forget and every existing row would read "shipped",
--   which is a claim nobody has verified. Five projects are currently published
--   from placeholder seed data; asserting a status on them would put five
--   unfounded statements on a public page, and nothing in the UI could correct
--   a default the author never chose. NULL means "not stated", which the page
--   renders by omitting the badge — an honest gap instead of a wrong fact.
--
-- The same reasoning keeps `role` and `outcome` nullable: a project with no
-- outcome yet should show no outcome section, not an empty one.
--
-- Applying this
--   `supabase db reset` replays every migration and the seed from scratch, which
--   is what a local development database wants. A deployed database should use
--   `supabase db push` so existing rows are preserved.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Guard.
--
-- Run against a database that has never had the base schema applied, every
-- `ALTER TABLE` below fails with `42P01: relation "public.projects" does not
-- exist` — which does not say *why*, and the usual cause is a different Supabase
-- project being open in the dashboard. Fail here instead, with the reason, so the
-- cause is the first thing on screen rather than something to deduce from the
-- first error line.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.projects') IS NULL THEN
    RAISE EXCEPTION
      'public.projects does not exist in this database. Apply the earlier migrations first (20240101000000_initial_schema.sql, 20240102000000_harden_security.sql, 20240103000000_add_experience_certificates.sql) — with `supabase db push` if they are managed by the migration history, or check that the dashboard is open on the same project as NEXT_PUBLIC_SUPABASE_URL and the schema already exists there.';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- role: what you actually did on it
-- ---------------------------------------------------------------------------
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS role TEXT
    CHECK (role IS NULL OR char_length(role) BETWEEN 1 AND 200);

-- ---------------------------------------------------------------------------
-- outcome: what came of it
--
-- 600 characters, not 10,000 like `description`. This is a closing statement —
-- a result, a lesson, a number — and it is rendered in a block roughly the size
-- of a paragraph. A 10,000-character field here would only ever be filled with
-- prose that belongs in `description` instead, and the length cap is the only
-- thing that keeps the two fields distinct.
-- ---------------------------------------------------------------------------
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS outcome TEXT
    CHECK (outcome IS NULL OR char_length(outcome) BETWEEN 1 AND 600);

-- ---------------------------------------------------------------------------
-- status: how finished it is
--
-- Ordered from most to least complete so the public page can sort or badge on
-- it later without a lookup table. The values are the ones the site copy
-- already uses in prose.
-- ---------------------------------------------------------------------------
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS status TEXT
    CHECK (
      status IS NULL
      OR status IN ('shipped', 'in_progress', 'experiment', 'archived')
    );

-- ---------------------------------------------------------------------------
-- Index.
--
-- Only if the public archive ever filters on it. A partial index on published
-- rows, matching `idx_projects_public_feed`, so the index stays proportional to
-- the visible set rather than to drafts. Cheap at this table size, and it means
-- adding a status filter later is not also a migration.
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_projects_status
  ON public.projects(status)
  WHERE published = true;

-- ---------------------------------------------------------------------------
-- Seed data.
--
-- Left entirely alone on purpose. The five seeded projects are placeholders
-- whose descriptions say so, and the two seeded experience/certificate tables
-- have no equivalent column here. A status on a row that reads "This is
-- placeholder content" is a claim about nothing.
--
-- To set a status on existing rows once real content replaces the seed:
--
--   UPDATE public.projects SET status = 'shipped' WHERE slug = 'my-real-project';
--
-- ---------------------------------------------------------------------------

COMMENT ON COLUMN public.projects.role IS
  'What the owner actually did on this project. Free text, short. NULL means not stated.';

COMMENT ON COLUMN public.projects.outcome IS
  'What came of the project: a result, a lesson, a number. Max 600 chars. NULL hides the section.';

COMMENT ON COLUMN public.projects.status IS
  'One of shipped, in_progress, experiment, archived. NULL means not stated and no badge is rendered.';
