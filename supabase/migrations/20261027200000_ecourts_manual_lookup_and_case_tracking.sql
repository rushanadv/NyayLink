-- ==============================================================================
-- Migration: 20261027200000_ecourts_manual_lookup_and_case_tracking.sql
-- Project: NyayLink - Official eCourts Linkage & Manual CNR Case Lookup
-- Description: Additive schema enhancements to link CNR records and manual eCourts
--              case status updates to legal_matters and tracked_court_cases,
--              maintaining strict source provenance and authenticated RLS boundaries.
-- ==============================================================================

-- 1. ENHANCE public.legal_matters
-- Add optional case docket, CNR, and manual court status tracking fields
ALTER TABLE public.legal_matters
  ADD COLUMN IF NOT EXISTS cnr_number text,
  ADD COLUMN IF NOT EXISTS court_complex text,
  ADD COLUMN IF NOT EXISTS case_type text,
  ADD COLUMN IF NOT EXISTS case_number text,
  ADD COLUMN IF NOT EXISTS case_year integer,
  ADD COLUMN IF NOT EXISTS court_hearing_date date,
  ADD COLUMN IF NOT EXISTS court_status text,
  ADD COLUMN IF NOT EXISTS court_status_source text DEFAULT 'user_manual_entry',
  ADD COLUMN IF NOT EXISTS court_last_checked_at timestamptz,
  ADD COLUMN IF NOT EXISTS court_provenance jsonb DEFAULT '{}'::jsonb;

-- Index for CNR search within authorized matters
CREATE INDEX IF NOT EXISTS idx_legal_matters_cnr ON public.legal_matters(cnr_number);

-- 2. ENHANCE public.tracked_court_cases
-- Link tracked cases to legal matters and add outcome notes
ALTER TABLE public.tracked_court_cases
  ADD COLUMN IF NOT EXISTS matter_id uuid REFERENCES public.legal_matters(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS outcome_summary text;

CREATE INDEX IF NOT EXISTS idx_tracked_cases_matter_id ON public.tracked_court_cases(matter_id);

-- 3. UPDATE RLS ON public.tracked_court_cases
-- Allow the matter's client or assigned lawyer to view and manage tracked cases
DROP POLICY IF EXISTS "tracked_court_cases_owner" ON public.tracked_court_cases;
CREATE POLICY "tracked_court_cases_owner"
  ON public.tracked_court_cases
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = user_id
    OR public.is_admin()
    OR (
      matter_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.legal_matters m
        WHERE m.id = tracked_court_cases.matter_id
          AND (m.assigned_lawyer_id = auth.uid() OR m.client_id = auth.uid())
      )
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR public.is_admin()
    OR (
      matter_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.legal_matters m
        WHERE m.id = tracked_court_cases.matter_id
          AND (m.assigned_lawyer_id = auth.uid() OR m.client_id = auth.uid())
      )
    )
  );

GRANT ALL ON TABLE public.tracked_court_cases TO authenticated, service_role;
