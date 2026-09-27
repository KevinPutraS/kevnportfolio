-- ===========================================================================
-- Experience and certificates
--
-- Design notes
--   * Both tables follow the same contract as `projects`:
--       - UUID primary keys (the project's existing convention)
--       - month-precision dates stored as DATE pinned to day 01, because the
--         editors use <input type="month"> and a Postgres `date` will not parse
--         `2026-01` (22007 invalid input syntax)
--       - `published` gates every public read through RLS, so a draft can never
--         leak even if a route handler asks for it
--       - writes are gated on `public.is_admin()`, not on "is signed in"
--   * `sort_order` is a manual override. Both lists are ordered by
--     `sort_order` first so the CMS can pin an entry to the top, and fall back
--     to the natural date order when `sort_order` ties (every new row starts at
--     0, so ties are the normal case rather than the exception).
--   * `current` is a reserved-ish word in Postgres, so it is always quoted.
--     It marks an experience that has no end date yet. The public timeline
--     reads it to print "Present" instead of an end month.
--   * `responsibilities` and `skills` are `text[]` for the same reason
--     `projects.technologies` is: they are only ever read as whole lists.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Experiences
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.experiences (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  title                 TEXT NOT NULL
                          CHECK (char_length(title) BETWEEN 1 AND 120),
  organization          TEXT NOT NULL
                          CHECK (char_length(organization) BETWEEN 1 AND 120),
  location              TEXT
                          CHECK (location IS NULL OR char_length(location) <= 120),

  employment_type       TEXT NOT NULL
                          CHECK (employment_type IN (
                            'internship', 'part_time', 'freelance', 'organization',
                            'school_project', 'volunteer', 'other'
                          )),

  -- Month precision: day is always 01. Required, because an experience with no
  -- start month cannot be placed on a timeline at all.
  start_date            DATE NOT NULL
                          CHECK (EXTRACT(DAY FROM start_date) = 1),
  end_date              DATE
                          CHECK (end_date IS NULL OR EXTRACT(DAY FROM end_date) = 1),

  "current"             BOOLEAN NOT NULL DEFAULT FALSE,

  description           TEXT
                          CHECK (description IS NULL OR char_length(description) <= 2000),

  responsibilities      TEXT[] NOT NULL DEFAULT '{}'
                          CHECK (
                            array_length(responsibilities, 1) IS NULL
                            OR array_length(responsibilities, 1) <= 20
                          ),
  technologies          TEXT[] NOT NULL DEFAULT '{}'
                          CHECK (
                            array_length(technologies, 1) IS NULL
                            OR array_length(technologies, 1) <= 20
                          ),

  organization_logo_url TEXT,
  project_url           TEXT,

  sort_order            INTEGER NOT NULL DEFAULT 0,
  published             BOOLEAN NOT NULL DEFAULT FALSE,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- A current role cannot also have an end date; keeps "Jan 2026 — Mar 2026,
-- current" from being storable.
ALTER TABLE public.experiences DROP CONSTRAINT IF EXISTS experiences_current_end_date;
ALTER TABLE public.experiences
  ADD CONSTRAINT experiences_current_end_date
  CHECK (NOT "current" OR end_date IS NULL);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_experiences_published    ON public.experiences(published);
CREATE INDEX IF NOT EXISTS idx_experiences_current      ON public.experiences("current");
CREATE INDEX IF NOT EXISTS idx_experiences_sort_order   ON public.experiences(sort_order);
CREATE INDEX IF NOT EXISTS idx_experiences_start_date   ON public.experiences(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_experiences_created_at   ON public.experiences(created_at DESC);
-- The public timeline: manual order first, newest first as the tiebreak.
CREATE INDEX IF NOT EXISTS idx_experiences_public_feed
  ON public.experiences(sort_order ASC, start_date DESC, created_at DESC)
  WHERE published = true;

DROP TRIGGER IF EXISTS handle_updated_at ON public.experiences;
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.experiences
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published experiences" ON public.experiences;
CREATE POLICY "Public can read published experiences"
  ON public.experiences
  FOR SELECT
  USING (published = true);

DROP POLICY IF EXISTS "Admins can read all experiences" ON public.experiences;
CREATE POLICY "Admins can read all experiences"
  ON public.experiences
  FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert experiences" ON public.experiences;
CREATE POLICY "Admins can insert experiences"
  ON public.experiences
  FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update experiences" ON public.experiences;
CREATE POLICY "Admins can update experiences"
  ON public.experiences
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete experiences" ON public.experiences;
CREATE POLICY "Admins can delete experiences"
  ON public.experiences
  FOR DELETE
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- Certificates
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.certificates (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  title                 TEXT NOT NULL
                          CHECK (char_length(title) BETWEEN 1 AND 150),
  issuer                TEXT NOT NULL
                          CHECK (char_length(issuer) BETWEEN 1 AND 120),

  -- Month precision: day is always 01. Required, because it is the default
  -- sort key for the certificate list.
  issue_date            DATE NOT NULL
                          CHECK (EXTRACT(DAY FROM issue_date) = 1),
  expiration_date       DATE
                          CHECK (expiration_date IS NULL OR EXTRACT(DAY FROM expiration_date) = 1),

  credential_id         TEXT
                          CHECK (credential_id IS NULL OR char_length(credential_id) <= 120),
  credential_url        TEXT,
  certificate_image_url TEXT,

  description           TEXT
                          CHECK (description IS NULL OR char_length(description) <= 1000),

  skills                TEXT[] NOT NULL DEFAULT '{}'
                          CHECK (
                            array_length(skills, 1) IS NULL
                            OR array_length(skills, 1) <= 20
                          ),

  sort_order            INTEGER NOT NULL DEFAULT 0,
  published             BOOLEAN NOT NULL DEFAULT FALSE,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- An expiry date before the issue date is always a data-entry mistake.
ALTER TABLE public.certificates DROP CONSTRAINT IF EXISTS certificates_date_order;
ALTER TABLE public.certificates
  ADD CONSTRAINT certificates_date_order
  CHECK (expiration_date IS NULL OR expiration_date >= issue_date);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_certificates_published  ON public.certificates(published);
CREATE INDEX IF NOT EXISTS idx_certificates_sort_order ON public.certificates(sort_order);
CREATE INDEX IF NOT EXISTS idx_certificates_issue_date  ON public.certificates(issue_date DESC);
CREATE INDEX IF NOT EXISTS idx_certificates_created_at  ON public.certificates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_certificates_public_feed
  ON public.certificates(sort_order ASC, issue_date DESC, created_at DESC)
  WHERE published = true;

DROP TRIGGER IF EXISTS handle_updated_at ON public.certificates;
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.certificates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published certificates" ON public.certificates;
CREATE POLICY "Public can read published certificates"
  ON public.certificates
  FOR SELECT
  USING (published = true);

DROP POLICY IF EXISTS "Admins can read all certificates" ON public.certificates;
CREATE POLICY "Admins can read all certificates"
  ON public.certificates
  FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert certificates" ON public.certificates;
CREATE POLICY "Admins can insert certificates"
  ON public.certificates
  FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update certificates" ON public.certificates;
CREATE POLICY "Admins can update certificates"
  ON public.certificates
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete certificates" ON public.certificates;
CREATE POLICY "Admins can delete certificates"
  ON public.certificates
  FOR DELETE
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage
--
-- The bucket already exists from the initial migration and is public-read.
-- Only the policies that scope uploads to specific folders are added here, so
-- the certificate and organisation-logo uploads land in their own prefixes
-- instead of mixing with project images.
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-images',
  'portfolio-images',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view portfolio images" ON storage.objects;
CREATE POLICY "Public can view portfolio images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'portfolio-images');

DROP POLICY IF EXISTS "Admins can upload portfolio images" ON storage.objects;
CREATE POLICY "Admins can upload portfolio images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'portfolio-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can update portfolio images" ON storage.objects;
CREATE POLICY "Admins can update portfolio images"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'portfolio-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can delete portfolio images" ON storage.objects;
CREATE POLICY "Admins can delete portfolio images"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'portfolio-images' AND public.is_admin());
