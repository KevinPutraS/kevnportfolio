-- ===========================================================================
-- Hardening migration
--
-- Idempotent, and safe to run against a database that already has an older
-- version of `20240101000000_initial_schema.sql` applied. Its only job is to
-- remove the original "any authenticated user can write" policies and replace
-- them with the admin-allowlist model.
--
-- After applying this, grant yourself admin access with:
--   INSERT INTO public.admins (user_id, note)
--   VALUES ('<your-auth-user-uuid>', 'owner');
-- ===========================================================================

-- 1. Remove the permissive policies from the original migration.
DROP POLICY IF EXISTS "Authenticated users can read all projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can update projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can delete projects" ON public.projects;

-- 2. Ensure the allowlist table and helper exist even on an old database.
CREATE TABLE IF NOT EXISTS public.admins (
  user_id     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  note        TEXT
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read their own admin record" ON public.admins;
CREATE POLICY "Admins can read their own admin record"
  ON public.admins
  FOR SELECT
  USING (auth.uid() = user_id);

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

-- 3. Recreate the write policies, gated on the allowlist.
DROP POLICY IF EXISTS "Admins can read all projects" ON public.projects;
CREATE POLICY "Admins can read all projects"
  ON public.projects
  FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert projects" ON public.projects;
CREATE POLICY "Admins can insert projects"
  ON public.projects
  FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update projects" ON public.projects;
CREATE POLICY "Admins can update projects"
  ON public.projects
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete projects" ON public.projects;
CREATE POLICY "Admins can delete projects"
  ON public.projects
  FOR DELETE
  USING (public.is_admin());

-- 4. Make sure the public read policy exists and is publication-scoped.
DROP POLICY IF EXISTS "Public can read published projects" ON public.projects;
CREATE POLICY "Public can read published projects"
  ON public.projects
  FOR SELECT
  USING (published = true);

-- 5. Storage: drop the original "authenticated" policies, add admin-gated ones.
DROP POLICY IF EXISTS "Authenticated users can upload portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete portfolio images" ON storage.objects;

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

-- 6. Tighten an older `projects` table that may be missing NOT NULL defaults.
ALTER TABLE public.projects
  ALTER COLUMN technologies SET DEFAULT '{}',
  ALTER COLUMN gallery     SET DEFAULT '{}',
  ALTER COLUMN featured    SET DEFAULT FALSE,
  ALTER COLUMN published   SET DEFAULT FALSE;

-- 7. Backfill the NOT NULLs that the original table did not declare.
UPDATE public.projects SET technologies = '{}' WHERE technologies IS NULL;
UPDATE public.projects SET gallery     = '{}' WHERE gallery     IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'projects'
      AND column_name = 'technologies' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.projects ALTER COLUMN technologies SET NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'projects'
      AND column_name = 'gallery' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.projects ALTER COLUMN gallery SET NOT NULL;
  END IF;
END;
$$;
