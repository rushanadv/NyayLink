-- ==============================================================================
-- Migration: 20261023160000_client_lawyer_directory_and_consent.sql
-- Project: NyayLink - Legal Services Marketplace
-- Description:
-- 1. Create client_lawyer_directory view for authenticated clients to discover
--    eligible advocates (both verified and newly onboarded pending-verification advocates)
--    who have completed their minimum profile and consented to client publication.
-- 2. Upgrade submit_advocate_onboarding_profile to accept p_is_published boolean.
-- 3. Provide set_advocate_publication_consent RPC for advocates to toggle client visibility.
-- ==============================================================================

-- 1. Client Lawyer Directory View (Secured with security barrier)
-- Accessible exclusively to authenticated users with client, lawyer, or admin role
CREATE OR REPLACE VIEW public.client_lawyer_directory
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
  lv.status AS verification_status,
  lp.is_published,
  lp.is_profile_completed,
  lp.created_at
FROM public.lawyer_profiles lp
INNER JOIN public.lawyer_verifications lv ON lv.lawyer_id = lp.id
INNER JOIN public.profiles p ON p.id = lp.id
WHERE (
    -- Access control: Caller must be authenticated and possess client, lawyer, or admin role
    auth.uid() IS NOT NULL
    AND (
      public.has_role(auth.uid(), 'client')
      OR public.has_role(auth.uid(), 'lawyer')
      OR public.is_admin()
    )
  )
  -- Minimum profile eligibility and publication consent guards
  AND lp.is_profile_completed = true
  AND lp.is_published = true
  AND p.is_active = true
  -- Only approved or pending verifications (rejected and changes_requested are excluded)
  AND lv.status IN ('approved', 'pending');

-- 2. Grants: Explicitly revoke from anon/public, grant SELECT only to authenticated
REVOKE ALL ON public.client_lawyer_directory FROM PUBLIC, anon;
GRANT SELECT ON public.client_lawyer_directory TO authenticated;

-- 3. Support publication consent parameter in submit_advocate_onboarding_profile
-- Drop previous signature to allow clean overload/replacement
DROP FUNCTION IF EXISTS public.submit_advocate_onboarding_profile(
  text, text, text, text, integer, text, text, text[], text[], integer, text
);
DROP FUNCTION IF EXISTS public.submit_advocate_onboarding_profile(
  text, text, text, text, integer, text, text, text[], text[], integer, text, boolean
);

CREATE OR REPLACE FUNCTION public.submit_advocate_onboarding_profile(
  p_professional_name text,
  p_phone text,
  p_bar_council_number text,
  p_bar_council_state text,
  p_bar_council_enrollment_year integer,
  p_city text,
  p_state text,
  p_practice_areas text[],
  p_languages text[],
  p_experience_years integer,
  p_bio text DEFAULT NULL,
  p_is_published boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _clean_name text;
  _clean_bar_num text;
  _clean_phone text;
  _publish_choice boolean := COALESCE(p_is_published, false);
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required.');
  END IF;

  _clean_name := btrim(p_professional_name);
  _clean_bar_num := upper(btrim(p_bar_council_number));
  _clean_phone := btrim(p_phone);

  IF _clean_name IS NULL OR length(_clean_name) < 2 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Valid advocate name is required.');
  END IF;

  IF _clean_bar_num IS NULL OR length(_clean_bar_num) < 3 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentic Bar Council enrollment number is required.');
  END IF;

  IF p_bar_council_enrollment_year IS NULL OR p_bar_council_enrollment_year < 1950 OR p_bar_council_enrollment_year > 2026 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Valid enrollment year between 1950 and 2026 is required.');
  END IF;

  IF btrim(p_city) IS NULL OR length(btrim(p_city)) < 2 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Primary court district/city is required.');
  END IF;

  -- Ensure role 'lawyer' is present for caller
  INSERT INTO public.user_roles (user_id, role, assigned_by)
  VALUES (_uid, 'lawyer', _uid)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Update profiles table
  UPDATE public.profiles
  SET
    full_name = COALESCE(NULLIF(_clean_name, ''), full_name),
    phone = COALESCE(NULLIF(_clean_phone, ''), phone),
    updated_at = now()
  WHERE id = _uid;

  -- Upsert lawyer_profiles with explicit publication consent
  INSERT INTO public.lawyer_profiles (
    id,
    professional_name,
    bar_council_number,
    bar_council_state,
    bar_council_enrollment_year,
    city,
    state,
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
    p_bar_council_state,
    p_bar_council_enrollment_year,
    btrim(p_city),
    btrim(p_state),
    COALESCE(p_practice_areas, ARRAY['Civil Litigation']::text[]),
    COALESCE(p_languages, ARRAY['English', 'Hindi']::text[]),
    GREATEST(0, COALESCE(p_experience_years, 1)),
    p_bio,
    true,
    _publish_choice,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    professional_name = EXCLUDED.professional_name,
    bar_council_number = EXCLUDED.bar_council_number,
    bar_council_state = EXCLUDED.bar_council_state,
    bar_council_enrollment_year = EXCLUDED.bar_council_enrollment_year,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    practice_areas = EXCLUDED.practice_areas,
    languages = EXCLUDED.languages,
    experience_years = EXCLUDED.experience_years,
    bio = EXCLUDED.bio,
    is_profile_completed = true,
    is_published = _publish_choice,
    updated_at = now();

  -- Upsert lawyer_verifications (initial or refresh pending)
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
  ON CONFLICT (lawyer_id) DO UPDATE
  SET
    status = 'pending',
    submitted_at = now(),
    updated_at = now();

  RETURN jsonb_build_object(
    'success', true,
    'lawyer_id', _uid,
    'status', 'pending',
    'is_profile_completed', true,
    'is_published', _publish_choice
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_advocate_onboarding_profile(
  text, text, text, text, integer, text, text, text[], text[], integer, text, boolean
) TO authenticated;

-- 4. RPC to allow an advocate to independently toggle / withdraw their publication consent
CREATE OR REPLACE FUNCTION public.set_advocate_publication_consent(p_published boolean)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _is_completed boolean;
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required.');
  END IF;

  -- Ensure profile exists and check completion
  SELECT is_profile_completed INTO _is_completed
  FROM public.lawyer_profiles
  WHERE id = _uid;

  IF _is_completed IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Advocate profile record not found.');
  END IF;

  IF p_published = true AND _is_completed = false THEN
    RETURN jsonb_build_object('success', false, 'error', 'Minimum professional profile must be completed before enabling visibility.');
  END IF;

  UPDATE public.lawyer_profiles
  SET is_published = p_published,
      updated_at = now()
  WHERE id = _uid;

  RETURN jsonb_build_object(
    'success', true,
    'lawyer_id', _uid,
    'is_published', p_published
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_advocate_publication_consent(boolean) TO authenticated;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
