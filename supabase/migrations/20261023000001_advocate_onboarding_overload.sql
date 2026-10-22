-- ==============================================================================
-- NyayLink Advocate Onboarding RPC Overloads & Direct Fallbacks
-- ==============================================================================

-- Drop existing function to allow renaming parameter names
DROP FUNCTION IF EXISTS public.submit_advocate_onboarding_profile(
  text, text, text, text, integer, text, text, text[], text[], integer, text
);

-- 1. Create with p_ parameter names matching client calls
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
  p_bio text DEFAULT NULL
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

  -- Ensure role 'lawyer' is present
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

  -- Upsert lawyer_profiles
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
    false, -- BCI compliance: Never automatically publish until reviewed
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
    updated_at = now();

  -- Upsert lawyer_verifications
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
    'is_profile_completed', true
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_advocate_onboarding_profile(
  text, text, text, text, integer, text, text, text[], text[], integer, text
) TO authenticated;

-- Also refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
