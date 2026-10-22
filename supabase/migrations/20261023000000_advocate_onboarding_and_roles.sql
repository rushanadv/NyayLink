-- ==============================================================================
-- Migration: 20261023000000_advocate_onboarding_and_roles.sql
-- Project: NyayaLink - Legal Services Marketplace
-- Description: Production advocate onboarding hardening:
--              1. Support 'lawyer' intent in handle_new_user_registration()
--              2. Allow authenticated users to claim 'lawyer' role for their own account
--              3. Secure onboarding submission function with full input validation
-- ==============================================================================

-- 1. Upgrade handle_new_user_registration to assign 'lawyer' role when intent is lawyer
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  _cleaned_name text;
  _intent text;
BEGIN
  _cleaned_name := public.clean_initial_name(
    coalesce(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.email,
    NEW.id
  );

  _intent := lower(coalesce(NEW.raw_user_meta_data->>'role', NEW.raw_user_meta_data->>'intent', 'client'));

  -- 1. Insert initial profile
  INSERT INTO public.profiles (id, full_name, is_active)
  VALUES (NEW.id, _cleaned_name, true)
  ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name
    WHERE profiles.full_name IS NULL OR profiles.full_name = '';

  -- 2. Always assign base 'client' role
  INSERT INTO public.user_roles (user_id, role, assigned_by)
  VALUES (NEW.id, 'client', NEW.id)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- 3. If signed up as lawyer/advocate, assign 'lawyer' role immediately
  IF _intent IN ('lawyer', 'advocate') THEN
    INSERT INTO public.user_roles (user_id, role, assigned_by)
    VALUES (NEW.id, 'lawyer', NEW.id)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- 2. Safe self-assignment policy: Authenticated users can claim 'lawyer' role for their own user_id
-- (Admin role remains strictly protected by existing admin-only policies)
DROP POLICY IF EXISTS "user_roles_self_insert_lawyer" ON public.user_roles;
CREATE POLICY "user_roles_self_insert_lawyer"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id 
    AND role IN ('client', 'lawyer')
  );

-- 3. RPC: Explicit function for an authenticated advocate to claim the lawyer role
CREATE OR REPLACE FUNCTION public.claim_lawyer_onboarding_role()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthenticated';
  END IF;

  INSERT INTO public.user_roles (user_id, role, assigned_by)
  VALUES (auth.uid(), 'lawyer', auth.uid())
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_lawyer_onboarding_role() TO authenticated;

-- 4. Complete Onboarding Submission RPC (Transaction-safe)
CREATE OR REPLACE FUNCTION public.submit_advocate_onboarding_profile(
  _professional_name text,
  _phone text,
  _bar_council_state text,
  _bar_council_number text,
  _bar_council_enrollment_year integer,
  _state text,
  _city text,
  _practice_areas text[],
  _languages text[],
  _experience_years integer,
  _bio text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _profile_id uuid;
  _clean_name text;
  _clean_bar_num text;
  _clean_phone text;
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required.');
  END IF;

  _clean_name := trim(_professional_name);
  _clean_bar_num := trim(upper(_bar_council_number));
  _clean_phone := trim(_phone);

  IF char_length(_clean_name) < 2 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Professional name must be at least 2 characters.');
  END IF;

  IF char_length(_clean_bar_num) < 3 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Bar Council Enrollment Number must be at least 3 characters.');
  END IF;

  IF _bar_council_enrollment_year < 1950 OR _bar_council_enrollment_year > 2026 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Please enter a valid enrollment year between 1950 and 2026.');
  END IF;

  IF char_length(trim(_state)) < 2 OR char_length(trim(_city)) < 2 THEN
    RETURN jsonb_build_object('success', false, 'error', 'State and primary court/district city are required.');
  END IF;

  -- Ensure 'lawyer' role exists for this user
  INSERT INTO public.user_roles (user_id, role, assigned_by)
  VALUES (_uid, 'lawyer', _uid)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Update user contact phone and name in base profiles
  UPDATE public.profiles
  SET full_name = _clean_name,
      phone = nullif(_clean_phone, ''),
      updated_at = now()
  WHERE id = _uid;

  -- Upsert lawyer_profiles
  INSERT INTO public.lawyer_profiles (
    id,
    professional_name,
    bar_council_number,
    bar_council_state,
    bar_council_enrollment_year,
    state,
    city,
    practice_areas,
    languages,
    experience_years,
    bio,
    is_profile_completed,
    is_published,
    created_at,
    updated_at
  )
  VALUES (
    _uid,
    _clean_name,
    _clean_bar_num,
    trim(_bar_council_state),
    _bar_council_enrollment_year,
    trim(_state),
    trim(_city),
    coalesce(_practice_areas, ARRAY['Civil Appeals']::text[]),
    coalesce(_languages, ARRAY['English', 'Hindi']::text[]),
    greatest(0, least(_experience_years, 75)),
    nullif(trim(_bio), ''),
    true,
    false, -- Pending admin review under BCI Rule 36 before public directory listing
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    professional_name = EXCLUDED.professional_name,
    bar_council_number = EXCLUDED.bar_council_number,
    bar_council_state = EXCLUDED.bar_council_state,
    bar_council_enrollment_year = EXCLUDED.bar_council_enrollment_year,
    state = EXCLUDED.state,
    city = EXCLUDED.city,
    practice_areas = EXCLUDED.practice_areas,
    languages = EXCLUDED.languages,
    experience_years = EXCLUDED.experience_years,
    bio = EXCLUDED.bio,
    is_profile_completed = true,
    updated_at = now();

  -- Initialize or refresh lawyer_verifications record with status 'pending'
  INSERT INTO public.lawyer_verifications (
    lawyer_id,
    status,
    submitted_at,
    created_at,
    updated_at
  )
  VALUES (
    _uid,
    'pending',
    now(),
    now(),
    now()
  )
  ON CONFLICT (lawyer_id) DO UPDATE SET
    status = 'pending',
    submitted_at = now(),
    updated_at = now()
  WHERE lawyer_verifications.status = 'changes_requested';

  RETURN jsonb_build_object(
    'success', true,
    'userId', _uid,
    'status', 'pending'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_advocate_onboarding_profile(text, text, text, text, integer, text, text, text[], text[], integer, text) TO authenticated;
