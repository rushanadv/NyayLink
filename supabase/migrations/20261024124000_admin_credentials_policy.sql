-- ==============================================================================
-- Migration: 20261024124000_admin_credentials_policy.sql
-- Allow administrators full management of lawyer educations and qualifications
-- ==============================================================================

DROP POLICY IF EXISTS "lawyer_educations_admin_all" ON public.lawyer_educations;
CREATE POLICY "lawyer_educations_admin_all"
  ON public.lawyer_educations FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "lawyer_qualifications_admin_all" ON public.lawyer_qualifications;
CREATE POLICY "lawyer_qualifications_admin_all"
  ON public.lawyer_qualifications FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
