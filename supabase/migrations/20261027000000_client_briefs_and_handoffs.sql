-- ==============================================================================
-- Migration: 20261027000000_client_briefs_and_handoffs.sql
-- Project: NyayLink - Legal Services Marketplace
-- Description: Additive migration for secure AI Preconsultation Lawyer-Ready Briefs,
--              consent-based advocate handoffs, and audit trails under strict RLS.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABLE: client_briefs
-- Structured AI Preconsultation briefs created and saved by clients
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.client_briefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  matter_id uuid REFERENCES public.legal_matters(id) ON DELETE SET NULL,
  title text NOT NULL,
  brief_data jsonb NOT NULL,
  facts_confirmed boolean NOT NULL DEFAULT false,
  locale text NOT NULL DEFAULT 'en' CHECK (locale IN ('en', 'hi')),
  version integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_brief_title_length CHECK (char_length(trim(title)) >= 2)
);

CREATE INDEX IF NOT EXISTS idx_client_briefs_client_id ON public.client_briefs(client_id);
CREATE INDEX IF NOT EXISTS idx_client_briefs_matter_id ON public.client_briefs(matter_id);
CREATE INDEX IF NOT EXISTS idx_client_briefs_created_at ON public.client_briefs(created_at DESC);

DROP TRIGGER IF EXISTS trg_client_briefs_updated_at ON public.client_briefs;
CREATE TRIGGER trg_client_briefs_updated_at
  BEFORE UPDATE ON public.client_briefs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 2. TABLE: brief_handoffs
-- Explicit, consent-based handoff records between clients and verified advocates
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.brief_handoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_brief_id uuid REFERENCES public.client_briefs(id) ON DELETE SET NULL,
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lawyer_id uuid NOT NULL REFERENCES public.lawyer_profiles(id) ON DELETE CASCADE,
  consultation_request_id uuid REFERENCES public.consultation_requests(id) ON DELETE SET NULL,
  exact_brief_snapshot jsonb NOT NULL,
  consent_given boolean NOT NULL DEFAULT false,
  consent_timestamp timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'revoked')),
  revoked_at timestamptz,
  revocation_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_brief_handoff_consent CHECK (consent_given = true)
);

CREATE INDEX IF NOT EXISTS idx_brief_handoffs_client_id ON public.brief_handoffs(client_id);
CREATE INDEX IF NOT EXISTS idx_brief_handoffs_lawyer_id ON public.brief_handoffs(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_brief_handoffs_status ON public.brief_handoffs(status);
CREATE INDEX IF NOT EXISTS idx_brief_handoffs_created_at ON public.brief_handoffs(created_at DESC);

DROP TRIGGER IF EXISTS trg_brief_handoffs_updated_at ON public.brief_handoffs;
CREATE TRIGGER trg_brief_handoffs_updated_at
  BEFORE UPDATE ON public.brief_handoffs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 3. EXTEND consultation_requests with brief handoff metadata
-- ------------------------------------------------------------------------------
ALTER TABLE public.consultation_requests 
  ADD COLUMN IF NOT EXISTS brief_handoff_id uuid REFERENCES public.brief_handoffs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS has_ai_brief boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_consultation_requests_brief_handoff ON public.consultation_requests(brief_handoff_id);

-- ------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

ALTER TABLE public.client_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brief_handoffs ENABLE ROW LEVEL SECURITY;

-- 4.1. client_briefs Policies
-- Strictly client-only ownership: no advocate or third-party can see unshared briefs
DROP POLICY IF EXISTS "Clients can view own briefs" ON public.client_briefs;
CREATE POLICY "Clients can view own briefs"
  ON public.client_briefs FOR SELECT
  TO authenticated
  USING (
    auth.uid() = client_id
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Clients can create own briefs" ON public.client_briefs;
CREATE POLICY "Clients can create own briefs"
  ON public.client_briefs FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = client_id
  );

DROP POLICY IF EXISTS "Clients can update own briefs" ON public.client_briefs;
CREATE POLICY "Clients can update own briefs"
  ON public.client_briefs FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = client_id
    OR public.is_admin()
  )
  WITH CHECK (
    auth.uid() = client_id
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Clients can delete own briefs" ON public.client_briefs;
CREATE POLICY "Clients can delete own briefs"
  ON public.client_briefs FOR DELETE
  TO authenticated
  USING (
    auth.uid() = client_id
    OR public.is_admin()
  );

-- 4.2. brief_handoffs Policies
-- Cross-boundary access: only the creating client and the designated advocate have access
DROP POLICY IF EXISTS "Clients and designated advocates can view handoffs" ON public.brief_handoffs;
CREATE POLICY "Clients and designated advocates can view handoffs"
  ON public.brief_handoffs FOR SELECT
  TO authenticated
  USING (
    auth.uid() = client_id
    OR auth.uid() = lawyer_id
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Clients can insert consented handoffs" ON public.brief_handoffs;
CREATE POLICY "Clients can insert consented handoffs"
  ON public.brief_handoffs FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = client_id
    AND consent_given = true
  );

DROP POLICY IF EXISTS "Authorized users can update handoffs" ON public.brief_handoffs;
CREATE POLICY "Authorized users can update handoffs"
  ON public.brief_handoffs FOR UPDATE
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

DROP POLICY IF EXISTS "Clients can delete own unaccepted handoffs" ON public.brief_handoffs;
CREATE POLICY "Clients can delete own unaccepted handoffs"
  ON public.brief_handoffs FOR DELETE
  TO authenticated
  USING (
    (auth.uid() = client_id AND status = 'pending')
    OR public.is_admin()
  );
