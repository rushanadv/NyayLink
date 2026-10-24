-- ==============================================================================
-- Migration: 20261024123000_grant_credentials_tables.sql
-- Grant table privileges to authenticated and service_role for credentials tables
-- ==============================================================================

GRANT ALL ON TABLE public.lawyer_educations TO authenticated, service_role;
GRANT ALL ON TABLE public.lawyer_qualifications TO authenticated, service_role;
GRANT ALL ON TABLE public.advocate_documents TO authenticated, service_role;

GRANT SELECT ON TABLE public.lawyer_educations TO anon;
GRANT SELECT ON TABLE public.lawyer_qualifications TO anon;
