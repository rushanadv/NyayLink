-- Migration: Add office_address to public_lawyer_directory view
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
