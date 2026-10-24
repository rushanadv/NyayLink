-- Migration: Grant anon SELECT permissions for public educations and qualifications
GRANT SELECT (id, is_published) ON public.lawyer_profiles TO anon;
GRANT SELECT ON public.lawyer_educations TO anon;
GRANT SELECT ON public.lawyer_qualifications TO anon;
