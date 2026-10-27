-- ==============================================================================
-- Migration: 20261027190000_grant_legal_source_registry_permissions.sql
-- Project: NyayLink - Grant table-level read access for legal source registry
-- Description: Explicitly grant SELECT to anon and authenticated roles on curated
--              legal source documents and provisions, governed by existing RLS.
-- ==============================================================================

GRANT SELECT ON public.legal_source_documents TO anon, authenticated;
GRANT SELECT ON public.legal_source_provisions TO anon, authenticated;
GRANT SELECT ON public.legal_source_ingestion_runs TO authenticated;

GRANT ALL ON public.legal_source_documents TO service_role;
GRANT ALL ON public.legal_source_provisions TO service_role;
GRANT ALL ON public.legal_source_ingestion_runs TO service_role;

GRANT EXECUTE ON FUNCTION public.match_legal_provisions(text, extensions.vector, text, integer, float, float) TO anon, authenticated, service_role;
