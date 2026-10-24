-- Migration: Security definer helper for checking public lawyer listing status in credentials RLS

CREATE OR REPLACE FUNCTION public.is_lawyer_publicly_listed(_lawyer_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.lawyer_profiles lp
    INNER JOIN public.lawyer_verifications lv ON lv.lawyer_id = lp.id
    WHERE lp.id = _lawyer_id
      AND lp.is_published = true
      AND lv.status = 'approved'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_lawyer_publicly_listed(uuid) TO anon, authenticated;

DROP POLICY IF EXISTS "lawyer_educations_anon_select" ON public.lawyer_educations;
CREATE POLICY "lawyer_educations_anon_select"
  ON public.lawyer_educations FOR SELECT
  TO anon
  USING (
    is_public = true
    AND public.is_lawyer_publicly_listed(lawyer_id)
  );

DROP POLICY IF EXISTS "lawyer_qualifications_anon_select" ON public.lawyer_qualifications;
CREATE POLICY "lawyer_qualifications_anon_select"
  ON public.lawyer_qualifications FOR SELECT
  TO anon
  USING (
    is_public = true
    AND public.is_lawyer_publicly_listed(lawyer_id)
  );
