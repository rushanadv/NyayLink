-- ==============================================================================
-- Migration: 20261027120000_separate_verified_and_under_review_directories.sql
-- Project: NyayLink - Legal Services Marketplace
-- Description:
-- 1. Redefine client_lawyer_directory view to strictly return APPROVED advocates.
--    Pending profiles are completely removed from this verified view.
-- 2. Create client_under_review_directory view exclusively for pending-verification
--    profiles that have completed onboarding and consented to publication.
--    Consultation fees are nullified to prevent unauthorized paid bookings.
-- 3. Update public_lawyer_directory view to include substantiated verified_at.
-- ==============================================================================

-- 1. Redefine client_lawyer_directory (Strictly Approved Advocates)
DROP VIEW IF EXISTS public.client_lawyer_directory CASCADE;

CREATE VIEW public.client_lawyer_directory
WITH (security_barrier = true)
AS
SELECT
  lp.id,
  lp.professional_name,
  lp.bio,
  lp.practice_areas,
  lp.experience_years,
  lp.city,
  lp.state,
  lp.languages,
  lv.status AS verification_status,
  lv.reviewed_at AS verified_at,
  lp.is_published,
  lp.is_profile_completed,
  lp.created_at,
  lp.courts_of_practice,
  lp.consultation_modes,
  lp.consultation_fee,
  lp.office_address
FROM public.lawyer_profiles lp
INNER JOIN public.lawyer_verifications lv ON lv.lawyer_id = lp.id
INNER JOIN public.profiles p ON p.id = lp.id
WHERE (
    auth.uid() IS NOT NULL
    AND (
      public.has_role(auth.uid(), 'client')
      OR public.has_role(auth.uid(), 'lawyer')
      OR public.is_admin()
    )
  )
  AND lp.is_profile_completed = true
  AND lp.is_published = true
  AND p.is_active = true
  AND lv.status = 'approved';

REVOKE ALL ON public.client_lawyer_directory FROM PUBLIC, anon;
GRANT SELECT ON public.client_lawyer_directory TO authenticated;


-- 2. Create client_under_review_directory (Strictly Profiles Under Review)
-- Accessible exclusively to authenticated clients, lawyers, and admins.
-- Shows advocates who have completed minimum onboarding and opted into publication consent,
-- but whose Bar Council credentials have not yet been independently verified.
-- Note: consultation_fee is deliberately NULL to forbid paid consultations.
DROP VIEW IF EXISTS public.client_under_review_directory CASCADE;

CREATE VIEW public.client_under_review_directory
WITH (security_barrier = true)
AS
SELECT
  lp.id,
  lp.professional_name,
  lp.bio,
  lp.practice_areas,
  lp.experience_years,
  lp.city,
  lp.state,
  lp.languages,
  lv.status AS verification_status,
  NULL::timestamptz AS verified_at,
  lv.submitted_at AS submitted_at,
  lp.is_published,
  lp.is_profile_completed,
  lp.created_at,
  lp.courts_of_practice,
  lp.consultation_modes,
  NULL::numeric AS consultation_fee,
  lp.office_address
FROM public.lawyer_profiles lp
INNER JOIN public.lawyer_verifications lv ON lv.lawyer_id = lp.id
INNER JOIN public.profiles p ON p.id = lp.id
WHERE (
    auth.uid() IS NOT NULL
    AND (
      public.has_role(auth.uid(), 'client')
      OR public.has_role(auth.uid(), 'lawyer')
      OR public.is_admin()
    )
  )
  AND lp.is_profile_completed = true
  AND lp.is_published = true
  AND p.is_active = true
  AND lv.status = 'pending';

REVOKE ALL ON public.client_under_review_directory FROM PUBLIC, anon;
GRANT SELECT ON public.client_under_review_directory TO authenticated;


-- 3. Redefine public_lawyer_directory (Strictly Approved Advocates for Public Visitors)
DROP VIEW IF EXISTS public.public_lawyer_directory CASCADE;

CREATE VIEW public.public_lawyer_directory AS
SELECT
  lp.id,
  lp.professional_name,
  lp.bio,
  lp.practice_areas,
  lp.experience_years,
  lp.city,
  lp.state,
  lp.languages,
  lv.status AS verification_status,
  lv.reviewed_at AS verified_at,
  lp.created_at,
  lp.courts_of_practice,
  lp.consultation_modes,
  lp.consultation_fee,
  lp.office_address
FROM public.lawyer_profiles lp
INNER JOIN public.lawyer_verifications lv ON lv.lawyer_id = lp.id
INNER JOIN public.profiles p ON p.id = lp.id
WHERE lv.status = 'approved'
  AND lp.is_published = true
  AND lp.is_profile_completed = true
  AND p.is_active = true;

GRANT SELECT ON public.public_lawyer_directory TO anon, authenticated;

-- Notify PostgREST to refresh schema cache
NOTIFY pgrst, 'reload schema';
