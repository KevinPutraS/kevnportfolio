-- ===========================================================================
-- Initial schema
--
-- Design notes
--   * `category` is constrained to the same list used by the UI
--     (`src/config/site.ts`) so the filter, the form and the database can
--     never drift apart.
--   * `technologies` and `gallery` are native `text[]`, not JSON: they are
--     only ever read as whole arrays, and `text[]` gets GIN indexing and
--     real column validation for free.
--   * `project_date` is month precision, stored as a DATE pinned to the first
--     of the month. The editor uses <input type="month">, and a CHECK keeps
--     stray days out of the column.
--   * Write access is NOT granted to every signed-in user. It is gated on
--     `public.is_admin()`, which checks the `public.admins` allowlist.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS public.projects (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  title             TEXT NOT NULL
                      CHECK (char_length(title) BETWEEN 1 AND 100),
  -- Lowercase kebab-case. The form generates this, and the CHECK means a
  -- malformed slug can never be written even by a direct API call.
  slug              TEXT NOT NULL UNIQUE
                      CHECK (
                        char_length(slug) BETWEEN 1 AND 100
                        AND slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
                      ),

  short_description TEXT NOT NULL
                      CHECK (char_length(short_description) BETWEEN 1 AND 300),
  description       TEXT
                      CHECK (description IS NULL OR char_length(description) <= 10000),

  category          TEXT NOT NULL
                      CHECK (category IN (
                        'web', 'app', 'design', 'networking',
                        'experiment', 'school', 'other'
                      )),

  technologies      TEXT[] NOT NULL DEFAULT '{}'
                      CHECK (array_length(technologies, 1) IS NULL OR array_length(technologies, 1) <= 20),
  thumbnail_url     TEXT,
  gallery           TEXT[] NOT NULL DEFAULT '{}'
                      CHECK (array_length(gallery, 1) IS NULL OR array_length(gallery, 1) <= 12),

  project_url       TEXT,
  repository_url    TEXT,

  featured          BOOLEAN NOT NULL DEFAULT FALSE,
  published         BOOLEAN NOT NULL DEFAULT FALSE,

  -- Month precision: day is always 01.
  project_date      DATE
                      CHECK (project_date IS NULL OR EXTRACT(DAY FROM project_date) = 1),

  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Indexes. The UNIQUE constraint on `slug` already creates a btree index, so
-- no separate slug index is added here.
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_projects_category        ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_published       ON public.projects(published);
CREATE INDEX IF NOT EXISTS idx_projects_featured        ON public.projects(featured);
CREATE INDEX IF NOT EXISTS idx_projects_project_date    ON public.projects(project_date DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_projects_created_at      ON public.projects(created_at DESC);
-- Supports the public archive query: published rows, newest first.
CREATE INDEX IF NOT EXISTS idx_projects_public_feed
  ON public.projects(project_date DESC NULLS LAST, created_at DESC)
  WHERE published = true;

-- ---------------------------------------------------------------------------
-- Keep updated_at honest. SECURITY DEFINER is unnecessary here (the trigger
-- runs as the table owner) but search_path is pinned regardless.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS handle_updated_at ON public.projects;
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ===========================================================================
-- Admin allowlist
--
-- A signed-in Supabase Auth user is NOT automatically an admin. Anyone who
-- could self-register must not be able to publish content, so every write
-- policy below is gated on this table.
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.admins (
  user_id     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  note        TEXT
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Reads its own admin row so the client could show a badge if it wanted to.
-- No INSERT/UPDATE/DELETE policy exists: rows are only ever added manually by
-- a project owner via the SQL editor.
CREATE POLICY "Admins can read their own admin record"
  ON public.admins
  FOR SELECT
  USING (auth.uid() = user_id);

-- SECURITY DEFINER is required: without it this function would be subject to
-- the RLS policy above and could not read the row it is checking.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- ===========================================================================
-- Row Level Security for projects
-- ===========================================================================
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Anonymous visitors may only ever read published rows. This is what keeps
-- drafts out of the public site even if a route handler tried to request them.
CREATE POLICY "Public can read published projects"
  ON public.projects
  FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can read all projects"
  ON public.projects
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can insert projects"
  ON public.projects
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update projects"
  ON public.projects
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete projects"
  ON public.projects
  FOR DELETE
  USING (public.is_admin());

-- ===========================================================================
-- Storage
--
-- The bucket is public-read so thumbnails can be served through next/image,
-- but only admins may write. `file_size_limit` and `allowed_mime_types` are
-- duplicated in the application layer (`src/lib/storage/images.ts`) as
-- defence in depth: the API validates magic numbers too.
-- ===========================================================================
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

-- ---------------------------------------------------------------------------
-- Optional: restrict uploads to the two folders the editor writes to.
-- Uncomment once you have verified the seed and editor uploads still work.
-- ---------------------------------------------------------------------------
-- ALTER POLICY "Admins can upload portfolio images" ON storage.objects
--   ADD WITH CHECK (
--     bucket_id = 'portfolio-images'
--     AND public.is_admin()
--     AND (storage.foldername(name))[1] IN ('projects')
--   );
