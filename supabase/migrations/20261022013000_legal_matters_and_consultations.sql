-- ==============================================================================
-- Migration: 20261022013000_legal_matters_and_consultations.sql
-- Project: NyayLink - Legal Services Marketplace
-- Description: Additive migration establishing core legal matters, consultation
--              requests, and matter timeline updates with strict Row Level Security.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABLE: legal_matters
-- Structured legal proceedings and inquiries owned by clients
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.legal_matters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'General Legal Inquiry',
  description text NOT NULL,
  status text NOT NULL DEFAULT 'intake' CHECK (status IN ('intake', 'review', 'assigned', 'in_progress', 'resolved', 'closed')),
  assigned_lawyer_id uuid REFERENCES public.lawyer_profiles(id) ON DELETE SET NULL,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_matter_title_length CHECK (char_length(trim(title)) >= 3),
  CONSTRAINT chk_matter_description_length CHECK (char_length(trim(description)) >= 10)
);

CREATE INDEX IF NOT EXISTS idx_legal_matters_client_id ON public.legal_matters(client_id);
CREATE INDEX IF NOT EXISTS idx_legal_matters_assigned_lawyer_id ON public.legal_matters(assigned_lawyer_id);
CREATE INDEX IF NOT EXISTS idx_legal_matters_status ON public.legal_matters(status);
CREATE INDEX IF NOT EXISTS idx_legal_matters_created_at ON public.legal_matters(created_at DESC);

DROP TRIGGER IF EXISTS trg_legal_matters_updated_at ON public.legal_matters;
CREATE TRIGGER trg_legal_matters_updated_at
  BEFORE UPDATE ON public.legal_matters
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 2. TABLE: consultation_requests
-- Direct consultation bookings between clients and advocates
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.consultation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lawyer_id uuid NOT NULL REFERENCES public.lawyer_profiles(id) ON DELETE CASCADE,
  matter_id uuid REFERENCES public.legal_matters(id) ON DELETE SET NULL,
  subject text NOT NULL,
  message text NOT NULL,
  preferred_date date,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'scheduled', 'completed', 'cancelled')),
  lawyer_response text,
  scheduled_at timestamptz,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_consultation_subject_length CHECK (char_length(trim(subject)) >= 3)
);

CREATE INDEX IF NOT EXISTS idx_consultation_requests_client_id ON public.consultation_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_lawyer_id ON public.consultation_requests(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_matter_id ON public.consultation_requests(matter_id);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_status ON public.consultation_requests(status);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_created_at ON public.consultation_requests(created_at DESC);

DROP TRIGGER IF EXISTS trg_consultation_requests_updated_at ON public.consultation_requests;
CREATE TRIGGER trg_consultation_requests_updated_at
  BEFORE UPDATE ON public.consultation_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 3. TABLE: matter_updates
-- Immutable chronological event trail for a matter
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.matter_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id uuid NOT NULL REFERENCES public.legal_matters(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  update_type text NOT NULL DEFAULT 'note' CHECK (update_type IN ('status_change', 'note', 'milestone', 'document')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_matter_update_content CHECK (char_length(trim(content)) >= 2)
);

CREATE INDEX IF NOT EXISTS idx_matter_updates_matter_id ON public.matter_updates(matter_id);
CREATE INDEX IF NOT EXISTS idx_matter_updates_created_at ON public.matter_updates(created_at ASC);

-- ------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS
ALTER TABLE public.legal_matters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matter_updates ENABLE ROW LEVEL SECURITY;

-- 4.1. legal_matters Policies
DROP POLICY IF EXISTS "Clients can view own matters" ON public.legal_matters;
CREATE POLICY "Clients can view own matters"
  ON public.legal_matters FOR SELECT
  TO authenticated
  USING (
    auth.uid() = client_id
    OR auth.uid() = assigned_lawyer_id
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Clients can create own matters" ON public.legal_matters;
CREATE POLICY "Clients can create own matters"
  ON public.legal_matters FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = client_id
  );

DROP POLICY IF EXISTS "Clients and assigned lawyers can update matters" ON public.legal_matters;
CREATE POLICY "Clients and assigned lawyers can update matters"
  ON public.legal_matters FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = client_id
    OR auth.uid() = assigned_lawyer_id
    OR public.is_admin()
  )
  WITH CHECK (
    auth.uid() = client_id
    OR auth.uid() = assigned_lawyer_id
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Clients can delete pending matters" ON public.legal_matters;
CREATE POLICY "Clients can delete pending matters"
  ON public.legal_matters FOR DELETE
  TO authenticated
  USING (
    (auth.uid() = client_id AND status IN ('intake', 'closed'))
    OR public.is_admin()
  );

-- 4.2. consultation_requests Policies
DROP POLICY IF EXISTS "Users can view relevant consultation requests" ON public.consultation_requests;
CREATE POLICY "Users can view relevant consultation requests"
  ON public.consultation_requests FOR SELECT
  TO authenticated
  USING (
    auth.uid() = client_id
    OR auth.uid() = lawyer_id
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Clients can create consultation requests" ON public.consultation_requests;
CREATE POLICY "Clients can create consultation requests"
  ON public.consultation_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = client_id
  );

DROP POLICY IF EXISTS "Lawyers and clients can update their consultation requests" ON public.consultation_requests;
CREATE POLICY "Lawyers and clients can update their consultation requests"
  ON public.consultation_requests FOR UPDATE
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

-- 4.3. matter_updates Policies
DROP POLICY IF EXISTS "Authorized users can view matter updates" ON public.matter_updates;
CREATE POLICY "Authorized users can view matter updates"
  ON public.matter_updates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.legal_matters m
      WHERE m.id = matter_id
        AND (m.client_id = auth.uid() OR m.assigned_lawyer_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Authorized users can insert matter updates" ON public.matter_updates;
CREATE POLICY "Authorized users can insert matter updates"
  ON public.matter_updates FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM public.legal_matters m
      WHERE m.id = matter_id
        AND (m.client_id = auth.uid() OR m.assigned_lawyer_id = auth.uid() OR public.is_admin())
    )
  );

-- ------------------------------------------------------------------------------
-- 5. TABLE PERMISSIONS FOR AUTHENTICATED USERS
-- (Required in PostgreSQL 17 so RLS policies can evaluate)
-- ------------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON public.legal_matters TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.consultation_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.matter_updates TO authenticated;

-- ------------------------------------------------------------------------------
-- 6. COUNTERPARTY PROFILE ACCESS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_counterparty" ON public.profiles;
CREATE POLICY "profiles_select_counterparty"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.legal_matters m
      WHERE (m.client_id = profiles.id AND m.assigned_lawyer_id = auth.uid())
         OR (m.assigned_lawyer_id = profiles.id AND m.client_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.consultation_requests c
      WHERE (c.client_id = profiles.id AND c.lawyer_id = auth.uid())
         OR (c.lawyer_id = profiles.id AND c.client_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "lawyer_profiles_select_counterparty" ON public.lawyer_profiles;
CREATE POLICY "lawyer_profiles_select_counterparty"
  ON public.lawyer_profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR public.is_admin()
    OR is_published = true
    OR EXISTS (
      SELECT 1 FROM public.legal_matters m
      WHERE m.assigned_lawyer_id = lawyer_profiles.id AND m.client_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.consultation_requests c
      WHERE c.lawyer_id = lawyer_profiles.id AND c.client_id = auth.uid()
    )
  );


