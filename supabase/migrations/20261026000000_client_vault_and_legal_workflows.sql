-- ==============================================================================
-- Migration: 20261026000000_client_vault_and_legal_workflows.sql
-- Description: Client document vault, cause-list tracking, and eSign audit tables
-- Complies with: DPDP Act 2023, Bar Council of India Rule 36, and Information Technology Act 2000
-- ==============================================================================

-- 1. TABLE: client_vault_documents
-- Private cryptographic vault for client pleadings, notices, evidence, and court orders
CREATE TABLE IF NOT EXISTS public.client_vault_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  matter_id uuid REFERENCES public.legal_matters(id) ON DELETE SET NULL,
  title text NOT NULL,
  category text NOT NULL CHECK (category IN ('pleading', 'evidence', 'notice', 'order', 'contract', 'general')),
  file_name text NOT NULL,
  file_size integer NOT NULL,
  mime_type text NOT NULL,
  storage_path text NOT NULL,
  sha256_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_vault_documents_user_id ON public.client_vault_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_client_vault_documents_matter_id ON public.client_vault_documents(matter_id);

ALTER TABLE public.client_vault_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "client_vault_documents_owner" ON public.client_vault_documents;
CREATE POLICY "client_vault_documents_owner"
  ON public.client_vault_documents
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = user_id
    OR (
      matter_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.legal_matters
        WHERE public.legal_matters.id = client_vault_documents.matter_id
          AND public.legal_matters.assigned_lawyer_id = auth.uid()
      )
    )
    OR public.is_admin()
  )
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

GRANT ALL ON TABLE public.client_vault_documents TO authenticated, service_role;

-- 2. TABLE: tracked_court_cases
-- Advocate & client cause-list tracking with official source provenance
CREATE TABLE IF NOT EXISTS public.tracked_court_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cnr_number text,
  court_complex text NOT NULL,
  case_type text NOT NULL,
  case_number text NOT NULL,
  case_year integer NOT NULL,
  petitioner text,
  respondent text,
  next_hearing_date date,
  purpose_of_hearing text,
  court_hall text,
  source_type text NOT NULL CHECK (source_type IN ('ecourts_portal', 'cause_list_manual', 'advocate_diary')),
  verification_status text NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('officially_verified', 'manual_unverified', 'sync_failed')),
  last_checked_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tracked_cases_user_id ON public.tracked_court_cases(user_id);
ALTER TABLE public.tracked_court_cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tracked_court_cases_owner" ON public.tracked_court_cases;
CREATE POLICY "tracked_court_cases_owner"
  ON public.tracked_court_cases
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

GRANT ALL ON TABLE public.tracked_court_cases TO authenticated, service_role;

-- 3. TABLE: vakalatnama_drafts & esign_audit_ledger
-- Vakalatnama execution under Section 30 of Advocates Act, 1961
CREATE TABLE IF NOT EXISTS public.vakalatnama_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lawyer_id uuid NOT NULL REFERENCES public.lawyer_profiles(id) ON DELETE CASCADE,
  matter_id uuid REFERENCES public.legal_matters(id) ON DELETE SET NULL,
  court_name text NOT NULL,
  case_title text NOT NULL,
  suit_number text,
  client_name text NOT NULL,
  advocate_name text NOT NULL,
  advocate_enrolment_no text NOT NULL,
  terms_agreed boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_advocate_review', 'ready_for_signing', 'provider_pending', 'executed', 'cancelled')),
  document_hash text,
  provider_transaction_id text,
  signed_pdf_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vakalatnama_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vakalatnama_drafts_parties" ON public.vakalatnama_drafts;
CREATE POLICY "vakalatnama_drafts_parties"
  ON public.vakalatnama_drafts
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = client_id
    OR auth.uid() = lawyer_id
    OR public.is_admin()
  )
  WITH CHECK (
    auth.uid() = client_id
    OR auth.uid() = lawyer_id
    OR public.is_admin()
  );

GRANT ALL ON TABLE public.vakalatnama_drafts TO authenticated, service_role;
