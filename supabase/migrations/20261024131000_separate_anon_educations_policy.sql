-- Migration: Separate SELECT policies for anon and authenticated on credentials tables
-- This avoids anon attempting to evaluate public.is_admin() which is restricted to authenticated.

-- 1. lawyer_educations
DROP POLICY IF EXISTS "lawyer_educations_select" ON public.lawyer_educations;
DROP POLICY IF EXISTS "lawyer_educations_anon_select" ON public.lawyer_educations;
DROP POLICY IF EXISTS "lawyer_educations_auth_select" ON public.lawyer_educations;

CREATE POLICY "lawyer_educations_anon_select"
  ON public.lawyer_educations FOR SELECT
  TO anon
  USING (
    is_public = true
    AND EXISTS (
      SELECT 1 FROM public.lawyer_profiles lp
      WHERE lp.id = lawyer_educations.lawyer_id
        AND lp.is_published = true
    )
  );

CREATE POLICY "lawyer_educations_auth_select"
  ON public.lawyer_educations FOR SELECT
  TO authenticated
  USING (
    auth.uid() = lawyer_id
    OR public.is_admin()
    OR (
      is_public = true
      AND EXISTS (
        SELECT 1 FROM public.lawyer_profiles lp
        WHERE lp.id = lawyer_educations.lawyer_id
          AND lp.is_published = true
      )
    )
  );

-- 2. lawyer_qualifications
DROP POLICY IF EXISTS "lawyer_qualifications_select" ON public.lawyer_qualifications;
DROP POLICY IF EXISTS "lawyer_qualifications_anon_select" ON public.lawyer_qualifications;
DROP POLICY IF EXISTS "lawyer_qualifications_auth_select" ON public.lawyer_qualifications;

CREATE POLICY "lawyer_qualifications_anon_select"
  ON public.lawyer_qualifications FOR SELECT
  TO anon
  USING (
    is_public = true
    AND EXISTS (
      SELECT 1 FROM public.lawyer_profiles lp
      WHERE lp.id = lawyer_qualifications.lawyer_id
        AND lp.is_published = true
    )
  );

CREATE POLICY "lawyer_qualifications_auth_select"
  ON public.lawyer_qualifications FOR SELECT
  TO authenticated
  USING (
    auth.uid() = lawyer_id
    OR public.is_admin()
    OR (
      is_public = true
      AND EXISTS (
        SELECT 1 FROM public.lawyer_profiles lp
        WHERE lp.id = lawyer_qualifications.lawyer_id
          AND lp.is_published = true
      )
    )
  );
