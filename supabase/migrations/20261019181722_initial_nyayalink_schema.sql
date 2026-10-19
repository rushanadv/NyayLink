-- ==============================================================================
-- Migration: 20261019181722_initial_nyayalink_schema.sql
-- Project: NyayaLink - Legal Services Marketplace
-- Description: Production-grade schema with 6 core tables, strict Row Level
--              Security (RLS), trustworthy audit trails, self-review guards,
--              safe user backfill, publication consent, and separated review notes.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. EXTENSIONS & PREREQUISITES
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. BASE UTILITY FUNCTIONS
-- ------------------------------------------------------------------------------

-- Generic timestamp updater (search_path pinned to pg_catalog, public)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Name sanitization helper: Guarantees full_name length >= 2 without constraint violations
CREATE OR REPLACE FUNCTION public.clean_initial_name(_raw_name text, _email text, _user_id uuid)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = pg_catalog, public
AS $$
  SELECT CASE
    WHEN _raw_name IS NOT NULL AND char_length(trim(_raw_name)) >= 2 THEN trim(_raw_name)
    WHEN _email IS NOT NULL AND char_length(trim(split_part(_email, '@', 1))) >= 2 THEN trim(split_part(_email, '@', 1))
    ELSE 'User ' || substr(replace(_user_id::text, '-', ''), 1, 8)
  END;
$$;

-- ------------------------------------------------------------------------------
-- 2. TABLE: profiles
-- Basic user account information referencing auth.users
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  avatar_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_profiles_full_name_length CHECK (char_length(trim(full_name)) >= 2)
);

CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 3. TABLE: user_roles
-- Role-based access control supporting multiple roles per user
-- Roles: 'client', 'lawyer', 'admin'
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('client', 'lawyer', 'admin')),
  assigned_at timestamptz NOT NULL DEFAULT now(),
  assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT uq_user_roles_user_role UNIQUE (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Security Definer: Check if user has administrative privileges
-- Denies check immediately if auth.uid() is null
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN false
    ELSE EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  END;
$$;

-- Security Definer: Check roles with Anti-Enumeration Guard
-- Denies query if unauthenticated (auth.uid() is null) or probing another user's role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  -- Deny role queries when caller is unauthenticated
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  -- Anti-enumeration: Users can only query their own roles unless they are an admin
  IF auth.uid() <> _user_id THEN
    IF NOT public.is_admin() THEN
      RETURN false;
    END IF;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
END;
$$;

-- Column protection trigger on profiles: prevent mutating id, created_at, or is_active
CREATE OR REPLACE FUNCTION public.protect_profiles_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF NEW.id <> OLD.id THEN
    RAISE EXCEPTION 'Immutable Field: User profile ID cannot be modified';
  END IF;
  IF NEW.created_at <> OLD.created_at THEN
    NEW.created_at = OLD.created_at;
  END IF;
  IF NEW.is_active <> OLD.is_active AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Permission Denied: Account status can only be modified by administrators';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_protect_profiles_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profiles_columns();

-- ------------------------------------------------------------------------------
-- 4. TABLE: lawyer_profiles
-- Lawyer details with Bar Council enrollment stored securely in private columns
-- Private by default (is_published = false) with lawyer-only consent recording
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lawyer_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_name text NOT NULL,
  bio text,
  practice_areas text[] NOT NULL DEFAULT '{}',
  experience_years integer NOT NULL DEFAULT 0 CHECK (experience_years >= 0 AND experience_years <= 75),
  city text NOT NULL,
  state text NOT NULL,
  languages text[] NOT NULL DEFAULT '{English}',
  is_profile_completed boolean NOT NULL DEFAULT false,
  
  -- Publication consent: independently auditable, lawyer-only consent
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  published_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Sensitive Bar Council enrollment information (isolated from public view)
  bar_council_number text NOT NULL,
  bar_council_state text NOT NULL,
  bar_council_enrollment_year integer NOT NULL CHECK (bar_council_enrollment_year >= 1950 AND bar_council_enrollment_year <= 2100),
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_lawyer_professional_name CHECK (char_length(trim(professional_name)) >= 2),
  CONSTRAINT uq_lawyer_bar_council_registration UNIQUE (bar_council_number, bar_council_state)
);

CREATE INDEX IF NOT EXISTS idx_lawyer_profiles_city_state ON public.lawyer_profiles(state, city);
CREATE INDEX IF NOT EXISTS idx_lawyer_profiles_practice_areas ON public.lawyer_profiles USING GIN(practice_areas);
CREATE INDEX IF NOT EXISTS idx_lawyer_profiles_completed ON public.lawyer_profiles(is_profile_completed);
CREATE INDEX IF NOT EXISTS idx_lawyer_profiles_published ON public.lawyer_profiles(is_published);

CREATE TRIGGER trg_lawyer_profiles_updated_at
  BEFORE UPDATE ON public.lawyer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Column protection trigger on lawyer_profiles (Enforces INSERT & UPDATE rules):
-- 1. Lawyer-only publication consent (admins cannot consent on lawyer's behalf)
-- 2. Publication metadata cannot be modified independently of consent transitions
-- 3. Automatic invalidation of approval when Bar credentials change (fresh verification required)
CREATE OR REPLACE FUNCTION public.protect_lawyer_profiles_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  _current_status text;
BEGIN
  -- Handling INSERT:
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_published = true THEN
      IF auth.uid() IS NULL OR auth.uid() <> NEW.id THEN
        RAISE EXCEPTION 'Security Violation: Only the lawyer can grant consent to publish their profile (Admin consent on lawyer behalf prohibited)';
      END IF;
      NEW.published_at = now();
      NEW.published_by = NEW.id;
    ELSE
      NEW.is_published = false;
      NEW.published_at = NULL;
      NEW.published_by = NULL;
    END IF;
    RETURN NEW;
  END IF;

  -- Handling UPDATE:
  IF NEW.id <> OLD.id THEN
    RAISE EXCEPTION 'Immutable Field: Lawyer profile ID cannot be modified';
  END IF;
  IF NEW.created_at <> OLD.created_at THEN
    NEW.created_at = OLD.created_at;
  END IF;

  -- Publication Consent Transition Guard:
  IF (NEW.is_published = OLD.is_published) THEN
    -- Prevent independent modification of consent metadata without an authorized status change
    IF (NEW.published_at IS DISTINCT FROM OLD.published_at OR NEW.published_by IS DISTINCT FROM OLD.published_by) THEN
      RAISE EXCEPTION 'Security Violation: Publication consent metadata cannot be modified independently of consent status transition';
    END IF;
  ELSE
    IF NEW.is_published = true THEN
      IF auth.uid() IS NULL OR auth.uid() <> NEW.id THEN
        RAISE EXCEPTION 'Security Violation: Only the lawyer can grant consent to publish their profile (Admin consent on lawyer behalf prohibited)';
      END IF;
      NEW.published_at = now();
      NEW.published_by = NEW.id;
    ELSE
      -- Revoking publication: Lawyer can unpublish, or Admin can suspend publication
      IF auth.uid() IS NULL OR (auth.uid() <> NEW.id AND NOT public.is_admin()) THEN
        RAISE EXCEPTION 'Permission Denied: Only the lawyer or an administrator can revoke publication';
      END IF;
      NEW.published_at = NULL;
      NEW.published_by = NULL;
    END IF;
  END IF;

  -- Credential Modification Guard: Never leave altered credentials approved without fresh verification
  IF (NEW.bar_council_number IS DISTINCT FROM OLD.bar_council_number OR
      NEW.bar_council_state IS DISTINCT FROM OLD.bar_council_state OR
      NEW.bar_council_enrollment_year IS DISTINCT FROM OLD.bar_council_enrollment_year) THEN
    
    SELECT status INTO _current_status
    FROM public.lawyer_verifications
    WHERE lawyer_id = NEW.id;

    IF _current_status = 'approved' THEN
      IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Action Prohibited: Verified Bar Council credentials cannot be directly modified. Please contact an administrator.';
      ELSE
        -- Admin altered credentials: Automatically invalidate existing approval and force re-verification
        UPDATE public.lawyer_verifications
        SET status = 'pending',
            reviewed_by = NULL,
            reviewed_at = NULL,
            internal_notes = concat_ws(E'\n', internal_notes, '[System]: Bar Council credentials updated by administrator. Previous approval invalidated; fresh re-verification required.'),
            updated_at = now()
        WHERE lawyer_id = NEW.id;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_protect_lawyer_profiles_columns
  BEFORE INSERT OR UPDATE ON public.lawyer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_lawyer_profiles_columns();

-- ------------------------------------------------------------------------------
-- 5. TABLE: lawyer_verifications
-- Verification lifecycle with separated lawyer_feedback (visible) vs internal_notes (admin-only)
-- Statuses: 'pending', 'approved', 'rejected', 'changes_requested'
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lawyer_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id uuid NOT NULL UNIQUE REFERENCES public.lawyer_profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'changes_requested')),
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  lawyer_feedback text,
  internal_notes text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Database constraint: Reviewer cannot be the lawyer under review
  CONSTRAINT chk_no_self_review CHECK (reviewed_by IS NULL OR reviewed_by <> lawyer_id)
);

CREATE INDEX IF NOT EXISTS idx_lawyer_verifications_status ON public.lawyer_verifications(status);
CREATE INDEX IF NOT EXISTS idx_lawyer_verifications_lawyer_id ON public.lawyer_verifications(lawyer_id);

CREATE TRIGGER trg_lawyer_verifications_updated_at
  BEFORE UPDATE ON public.lawyer_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Guard Trigger: Hard prevent self-approval, forged reviewer IDs, and protect immutable identifiers
CREATE OR REPLACE FUNCTION public.check_lawyer_verification_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  -- Strict Check 1: Reviewer cannot be the lawyer under review
  IF NEW.reviewed_by IS NOT NULL AND NEW.reviewed_by = NEW.lawyer_id THEN
    RAISE EXCEPTION 'Security Violation: Self-review prohibited. Reviewer cannot be the lawyer under review.';
  END IF;

  -- Handling INSERT:
  IF TG_OP = 'INSERT' THEN
    IF NOT public.is_admin() THEN
      -- Regular lawyer inserting initial verification record
      NEW.status = 'pending';
      NEW.reviewed_by = NULL;
      NEW.reviewed_at = NULL;
      NEW.lawyer_feedback = NULL;
      NEW.internal_notes = NULL;
      NEW.submitted_at = now();
    ELSE
      -- Admin inserting verification record: Trustworthy reviewer bound to authenticated admin
      IF NEW.status IN ('approved', 'rejected', 'changes_requested') THEN
        NEW.reviewed_by = auth.uid();
        IF NEW.reviewed_by = NEW.lawyer_id THEN
          RAISE EXCEPTION 'Security Violation: Administrator cannot approve their own lawyer profile';
        END IF;
        NEW.reviewed_at = now();
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  -- Handling UPDATE:
  IF TG_OP = 'UPDATE' THEN
    -- Protect immutable verification identifiers across all updates
    IF NEW.id <> OLD.id THEN
      RAISE EXCEPTION 'Immutable Field: Verification ID cannot be modified';
    END IF;
    IF NEW.lawyer_id <> OLD.lawyer_id THEN
      RAISE EXCEPTION 'Immutable Field: Verification lawyer_id cannot be modified';
    END IF;
    IF NEW.created_at <> OLD.created_at THEN
      NEW.created_at = OLD.created_at;
    END IF;

    IF NOT public.is_admin() THEN
      -- A lawyer can only update their record to resubmit ('pending') after 'changes_requested'
      IF OLD.status = 'changes_requested' AND NEW.status = 'pending' THEN
        NEW.reviewed_by = NULL;
        NEW.reviewed_at = NULL;
        NEW.submitted_at = now();
        -- Preserve previous feedback and internal notes
        NEW.lawyer_feedback = OLD.lawyer_feedback;
        NEW.internal_notes = OLD.internal_notes;
      ELSE
        RAISE EXCEPTION 'Permission Denied: Only administrators can modify verification statuses or review records';
      END IF;
    ELSE
      -- Admin updating the record
      IF NEW.status IN ('approved', 'rejected', 'changes_requested') THEN
        -- Trustworthy Reviewer Identity: Always bind reviewed_by to the actual authenticated admin
        NEW.reviewed_by = auth.uid();
        IF NEW.reviewed_by = NEW.lawyer_id THEN
          RAISE EXCEPTION 'Security Violation: Administrator cannot approve their own lawyer profile';
        END IF;
        NEW.reviewed_at = now();
      ELSIF NEW.status = 'pending' THEN
        NEW.reviewed_by = NULL;
        NEW.reviewed_at = NULL;
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_lawyer_verification_integrity
  BEFORE INSERT OR UPDATE ON public.lawyer_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.check_lawyer_verification_integrity();

-- ------------------------------------------------------------------------------
-- 6. TABLE: invitations
-- Admin-issued invitations for lawyers with hashed tokens (no plaintext storage)
-- Statuses: 'pending', 'accepted', 'revoked', 'expired'
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  token_hash text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
  invited_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  accepted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_invitation_expiry CHECK (expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token_hash ON public.invitations(token_hash);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.invitations(status);

CREATE TRIGGER trg_invitations_updated_at
  BEFORE UPDATE ON public.invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 7. TABLE: audit_logs
-- Append-only system audit log written strictly by trusted triggers & service operations
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_table text NOT NULL,
  target_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON public.audit_logs(target_table, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Guard Trigger: Hard guarantee that audit_logs is strictly append-only (No UPDATE, No DELETE)
CREATE OR REPLACE FUNCTION public.prevent_audit_log_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  RAISE EXCEPTION 'Audit Log Violation: Audit records are immutable and cannot be updated or deleted';
END;
$$;

CREATE TRIGGER trg_audit_logs_no_update
  BEFORE UPDATE ON public.audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_audit_log_mutation();

CREATE TRIGGER trg_audit_logs_no_delete
  BEFORE DELETE ON public.audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_audit_log_mutation();

-- ------------------------------------------------------------------------------
-- 8. TRUSTED AUDITING TRIGGER
-- Automatically records role, verification, and publication consent changes
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.log_role_and_verification_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  _actor uuid := auth.uid();
BEGIN
  IF TG_TABLE_NAME = 'user_roles' THEN
    IF TG_OP = 'INSERT' THEN
      INSERT INTO public.audit_logs (actor_id, action, target_table, target_id, metadata)
      VALUES (_actor, 'ROLE_ASSIGNED', 'user_roles', NEW.id, jsonb_build_object('user_id', NEW.user_id, 'role', NEW.role, 'assigned_by', NEW.assigned_by));
    ELSIF TG_OP = 'DELETE' THEN
      INSERT INTO public.audit_logs (actor_id, action, target_table, target_id, metadata)
      VALUES (_actor, 'ROLE_REVOKED', 'user_roles', OLD.id, jsonb_build_object('user_id', OLD.user_id, 'role', OLD.role));
    END IF;
  ELSIF TG_TABLE_NAME = 'lawyer_verifications' THEN
    IF TG_OP = 'UPDATE' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
      INSERT INTO public.audit_logs (actor_id, action, target_table, target_id, metadata)
      VALUES (_actor, 'VERIFICATION_STATUS_CHANGED', 'lawyer_verifications', NEW.id,
              jsonb_build_object('lawyer_id', NEW.lawyer_id, 'old_status', OLD.status, 'new_status', NEW.status, 'reviewed_by', NEW.reviewed_by));
    END IF;
  ELSIF TG_TABLE_NAME = 'lawyer_profiles' THEN
    IF TG_OP = 'UPDATE' AND (OLD.is_published IS DISTINCT FROM NEW.is_published) THEN
      IF NEW.is_published = true THEN
        INSERT INTO public.audit_logs (actor_id, action, target_table, target_id, metadata)
        VALUES (_actor, 'PUBLICATION_CONSENT_GRANTED', 'lawyer_profiles', NEW.id,
                jsonb_build_object('lawyer_id', NEW.id, 'published_at', NEW.published_at, 'consented_by', NEW.published_by));
      ELSE
        INSERT INTO public.audit_logs (actor_id, action, target_table, target_id, metadata)
        VALUES (_actor, 'PUBLICATION_CONSENT_REVOKED', 'lawyer_profiles', NEW.id,
                jsonb_build_object('lawyer_id', NEW.id, 'revoked_by', _actor));
      END IF;
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_audit_user_roles_change
  AFTER INSERT OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_role_and_verification_changes();

CREATE TRIGGER trg_audit_lawyer_verification_change
  AFTER UPDATE ON public.lawyer_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.log_role_and_verification_changes();

CREATE TRIGGER trg_audit_lawyer_profiles_change
  AFTER UPDATE ON public.lawyer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_role_and_verification_changes();

-- ------------------------------------------------------------------------------
-- 9. USER SIGNUP AUTH TRIGGER
-- Automatically creates profile and assigns default 'client' role on signup
-- Uses clean_initial_name to guarantee valid full_name without constraint errors
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  _cleaned_name text;
BEGIN
  _cleaned_name := public.clean_initial_name(
    coalesce(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.email,
    NEW.id
  );

  -- 1. Insert initial profile
  INSERT INTO public.profiles (id, full_name, is_active)
  VALUES (NEW.id, _cleaned_name, true)
  ON CONFLICT (id) DO NOTHING;

  -- 2. Assign default client role
  INSERT INTO public.user_roles (user_id, role, assigned_by)
  VALUES (NEW.id, 'client', NEW.id)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_registration();

-- ------------------------------------------------------------------------------
-- 10. IDEMPOTENT BACKFILL FOR PRE-EXISTING AUTH.USERS
-- Uses clean_initial_name to safely handle empty or missing names
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  -- Backfill profiles for existing users missing a profile record
  INSERT INTO public.profiles (id, full_name, is_active)
  SELECT
    u.id,
    public.clean_initial_name(
      coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
      u.email,
      u.id
    ) AS full_name,
    true AS is_active
  FROM auth.users u
  ON CONFLICT (id) DO NOTHING;

  -- Backfill default 'client' role for existing users missing any role record
  INSERT INTO public.user_roles (user_id, role, assigned_by)
  SELECT
    u.id,
    'client',
    u.id
  FROM auth.users u
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- ------------------------------------------------------------------------------
-- 11. VIEWS: PUBLIC DIRECTORY & ADMIN VERIFICATIONS
-- ------------------------------------------------------------------------------

-- Public Lawyer Directory: Hardened with security barrier, explicit publication consent & active account
CREATE OR REPLACE VIEW public.public_lawyer_directory
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
  lp.created_at
FROM public.lawyer_profiles lp
INNER JOIN public.lawyer_verifications lv ON lv.lawyer_id = lp.id
INNER JOIN public.profiles p ON p.id = lp.id
WHERE lv.status = 'approved'
  AND lp.is_profile_completed = true
  AND lp.is_published = true
  AND p.is_active = true;

-- Admin-Only Verification View: Exposes internal notes exclusively to administrators
CREATE OR REPLACE VIEW public.admin_lawyer_verifications
WITH (security_barrier = true)
AS
SELECT
  id,
  lawyer_id,
  status,
  reviewed_by,
  reviewed_at,
  lawyer_feedback,
  internal_notes,
  submitted_at,
  created_at,
  updated_at
FROM public.lawyer_verifications
WHERE public.is_admin();

-- ------------------------------------------------------------------------------
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- Explicitly enabled on ALL SIX tables
-- ------------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lawyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lawyer_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 12.1 RLS: profiles
CREATE POLICY "profiles_select_own_or_admin"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_admin_manage"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 12.2 RLS: user_roles
CREATE POLICY "user_roles_select_own_or_admin"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "user_roles_admin_insert"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "user_roles_admin_update"
  ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "user_roles_admin_delete"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 12.3 RLS: lawyer_profiles
CREATE POLICY "lawyer_profiles_select_own_or_admin"
  ON public.lawyer_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "lawyer_profiles_insert_lawyer_role_only"
  ON public.lawyer_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id 
    AND (public.has_role(auth.uid(), 'lawyer') OR public.is_admin())
  );

CREATE POLICY "lawyer_profiles_update_own"
  ON public.lawyer_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- 12.4 RLS: lawyer_verifications
CREATE POLICY "lawyer_verifications_select_own_or_admin"
  ON public.lawyer_verifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = lawyer_id OR public.is_admin());

CREATE POLICY "lawyer_verifications_insert_pending_only"
  ON public.lawyer_verifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.uid() = lawyer_id AND status = 'pending' AND reviewed_by IS NULL)
    OR public.is_admin()
  );

CREATE POLICY "lawyer_verifications_lawyer_resubmit"
  ON public.lawyer_verifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = lawyer_id AND status = 'changes_requested')
  WITH CHECK (auth.uid() = lawyer_id AND status = 'pending' AND reviewed_by IS NULL);

CREATE POLICY "lawyer_verifications_admin_manage"
  ON public.lawyer_verifications
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin() AND (reviewed_by IS NULL OR reviewed_by <> lawyer_id));

-- 12.5 RLS: invitations
CREATE POLICY "invitations_admin_all"
  ON public.invitations
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 12.6 RLS: audit_logs
CREATE POLICY "audit_logs_admin_select"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 13. PRECISE SQL PRIVILEGES & MINIMAL GRANTS
-- Explicitly revokes ALL on our six application tables from PUBLIC, anon, and authenticated
-- before applying precise, minimal grants. Prevents table-level SELECT from overriding
-- column-level internal_notes restrictions. Unrelated Supabase tables are NOT touched.
-- ------------------------------------------------------------------------------

-- 1. Explicitly revoke ALL existing privileges on each of the six tables
REVOKE ALL ON TABLE public.profiles FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.user_roles FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.lawyer_profiles FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.lawyer_verifications FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.invitations FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.audit_logs FROM PUBLIC, anon, authenticated;

-- 2. anon permissions: ONLY read approved, published lawyers via security barrier view
GRANT SELECT ON public.public_lawyer_directory TO anon;

-- 3. authenticated permissions:
-- Base table access governed strictly by Row Level Security
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.lawyer_profiles TO authenticated;

-- Precise Column Grants on lawyer_verifications:
-- Table-level SELECT remains REVOKED. internal_notes is strictly excluded from authenticated role.
GRANT SELECT (id, lawyer_id, status, reviewed_by, reviewed_at, lawyer_feedback, submitted_at, created_at, updated_at) ON public.lawyer_verifications TO authenticated;
GRANT INSERT, UPDATE ON public.lawyer_verifications TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.invitations TO authenticated;
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT SELECT ON public.public_lawyer_directory TO authenticated;
GRANT SELECT ON public.admin_lawyer_verifications TO authenticated;

-- 4. Explicit Function Execution Permissions (No blanket revoke)
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.clean_initial_name(text, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.protect_profiles_columns() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_lawyer_profiles_columns() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_lawyer_verification_integrity() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_audit_log_mutation() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_role_and_verification_changes() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_registration() FROM PUBLIC, anon, authenticated;

-- Grant execute exclusively on safe helper functions to authenticated role
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;
