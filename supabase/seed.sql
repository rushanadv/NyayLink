-- ==============================================================================
-- NyayaLink Platform Demo Seed Data
-- File: supabase/seed.sql
-- 
-- DEMO / SEED DATA ONLY — NOT MEANT FOR PRODUCTION
--
-- Populates 6 realistic, verified, and published advocate profiles across India
-- along with 1 reviewing system administrator.
--
-- Security Mechanism & Trigger Compliance:
-- The 'lawyer_profiles' publication trigger (trg_check_lawyer_profile_publication)
-- requires auth.uid() = lawyer_id when is_published = true.
-- The 'lawyer_verifications' verification trigger (trg_check_lawyer_verification_integrity)
-- requires auth.uid() = admin_id and auth.uid() <> lawyer_id when status = 'approved'.
--
-- To legitimately satisfy these triggers without modifying, bypassing, or disabling
-- them, this seed script uses PostgreSQL runtime configuration variables
-- (request.jwt.claims and request.jwt.claim.sub) to simulate the authenticated
-- context of each respective lawyer and admin during insertion.
-- ==============================================================================

DO $$
DECLARE
  -- 1 System Administrator
  v_admin_id uuid := '11111111-1111-4111-8111-111111111111'::uuid;

  -- 6 Mock Advocates across Diverse Indian States and High Courts
  v_lawyer_1 uuid := 'a1111111-1111-4111-8111-111111111111'::uuid;
  v_lawyer_2 uuid := 'a2222222-2222-4222-8222-222222222222'::uuid;
  v_lawyer_3 uuid := 'a3333333-3333-4333-8333-333333333333'::uuid;
  v_lawyer_4 uuid := 'a4444444-4444-4444-8444-444444444444'::uuid;
  v_lawyer_5 uuid := 'a5555555-5555-4555-8555-555555555555'::uuid;
  v_lawyer_6 uuid := 'a6666666-6666-4666-8666-666666666666'::uuid;
BEGIN
  -- ----------------------------------------------------------------------------
  -- 1. SEED AUTH USERS
  -- ----------------------------------------------------------------------------
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at
  ) VALUES 
    (v_admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@nyayalink.test', 'mock_pw_hash', now(), '{"full_name": "Justice Admin Officer"}'::jsonb, now(), now()),
    (v_lawyer_1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rajesh.sharma@nyayalink.test', 'mock_pw_hash', now(), '{"full_name": "Adv. Rajesh Sharma"}'::jsonb, now(), now()),
    (v_lawyer_2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'meera.sen@nyayalink.test', 'mock_pw_hash', now(), '{"full_name": "Adv. Meera Sen"}'::jsonb, now(), now()),
    (v_lawyer_3, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'arvind.swaminathan@nyayalink.test', 'mock_pw_hash', now(), '{"full_name": "Adv. Arvind Swaminathan"}'::jsonb, now(), now()),
    (v_lawyer_4, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'kk.venugopalan@nyayalink.test', 'mock_pw_hash', now(), '{"full_name": "Adv. K. K. Venugopalan"}'::jsonb, now(), now()),
    (v_lawyer_5, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ananya.roy@nyayalink.test', 'mock_pw_hash', now(), '{"full_name": "Adv. Ananya Roy"}'::jsonb, now(), now()),
    (v_lawyer_6, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'vikram.reddy@nyayalink.test', 'mock_pw_hash', now(), '{"full_name": "Adv. Vikramaditya Reddy"}'::jsonb, now(), now())
  ON CONFLICT (id) DO NOTHING;

  -- Ensure public.profiles have active status
  UPDATE public.profiles SET is_active = true WHERE id IN (v_admin_id, v_lawyer_1, v_lawyer_2, v_lawyer_3, v_lawyer_4, v_lawyer_5, v_lawyer_6);

  -- ----------------------------------------------------------------------------
  -- 2. SEED SYSTEM ROLES
  -- ----------------------------------------------------------------------------
  INSERT INTO public.user_roles (user_id, role, assigned_by)
  VALUES 
    (v_admin_id, 'admin', v_admin_id),
    (v_lawyer_1, 'lawyer', v_admin_id),
    (v_lawyer_2, 'lawyer', v_admin_id),
    (v_lawyer_3, 'lawyer', v_admin_id),
    (v_lawyer_4, 'lawyer', v_admin_id),
    (v_lawyer_5, 'lawyer', v_admin_id),
    (v_lawyer_6, 'lawyer', v_admin_id)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- ----------------------------------------------------------------------------
  -- 3. SEED LAWYER PROFILES (Using Lawyer-Scoped Auth Context for Publication Consent)
  -- ----------------------------------------------------------------------------

  -- Advocate 1: Adv. Rajesh Sharma (New Delhi)
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_lawyer_1::text, 'role', 'authenticated')::text, true);
  PERFORM set_config('request.jwt.claim.sub', v_lawyer_1::text, true);

  INSERT INTO public.lawyer_profiles (
    id, professional_name, bio, practice_areas, experience_years, city, state, languages,
    is_profile_completed, is_published, bar_council_number, bar_council_state, bar_council_enrollment_year
  ) VALUES (
    v_lawyer_1,
    'Adv. Rajesh Sharma',
    'Senior litigator practicing before the Supreme Court of India and Delhi High Court. Specialized in commercial disputes, criminal appeals, and fundamental rights writs.',
    ARRAY['Constitutional Law', 'Criminal Defense', 'Civil Appeals'],
    18,
    'New Delhi',
    'Delhi',
    ARRAY['English', 'Hindi', 'Punjabi'],
    true,
    true,
    'D/1429/2006',
    'Delhi',
    2006
  ) ON CONFLICT (id) DO UPDATE SET
    professional_name = EXCLUDED.professional_name,
    bio = EXCLUDED.bio,
    practice_areas = EXCLUDED.practice_areas,
    experience_years = EXCLUDED.experience_years,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    languages = EXCLUDED.languages,
    is_profile_completed = true,
    is_published = true;

  -- Advocate 2: Adv. Meera Sen (Mumbai)
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_lawyer_2::text, 'role', 'authenticated')::text, true);
  PERFORM set_config('request.jwt.claim.sub', v_lawyer_2::text, true);

  INSERT INTO public.lawyer_profiles (
    id, professional_name, bio, practice_areas, experience_years, city, state, languages,
    is_profile_completed, is_published, bar_council_number, bar_council_state, bar_council_enrollment_year
  ) VALUES (
    v_lawyer_2,
    'Adv. Meera Sen',
    'Chambers lead focusing on cross-border arbitration, NCLT corporate insolvency proceedings, and company law before the Bombay High Court.',
    ARRAY['Corporate & Commercial', 'Insolvency & Bankruptcy (NCLT)', 'Arbitration'],
    12,
    'Mumbai',
    'Maharashtra',
    ARRAY['English', 'Hindi', 'Marathi', 'Bengali'],
    true,
    true,
    'MAH/3820/2012',
    'Maharashtra',
    2012
  ) ON CONFLICT (id) DO UPDATE SET
    professional_name = EXCLUDED.professional_name,
    bio = EXCLUDED.bio,
    practice_areas = EXCLUDED.practice_areas,
    experience_years = EXCLUDED.experience_years,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    languages = EXCLUDED.languages,
    is_profile_completed = true,
    is_published = true;

  -- Advocate 3: Adv. Arvind Swaminathan (Bengaluru)
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_lawyer_3::text, 'role', 'authenticated')::text, true);
  PERFORM set_config('request.jwt.claim.sub', v_lawyer_3::text, true);

  INSERT INTO public.lawyer_profiles (
    id, professional_name, bio, practice_areas, experience_years, city, state, languages,
    is_profile_completed, is_published, bar_council_number, bar_council_state, bar_council_enrollment_year
  ) VALUES (
    v_lawyer_3,
    'Adv. Arvind Swaminathan',
    'Advising founders, product engineers, and enterprises on software patent litigation, digital copyright, and technology contract enforcement before Karnataka High Court.',
    ARRAY['Technology & IP', 'Cyber Crime', 'Contract Disputes'],
    9,
    'Bengaluru',
    'Karnataka',
    ARRAY['English', 'Kannada', 'Tamil', 'Hindi'],
    true,
    true,
    'KAR/1942/2015',
    'Karnataka',
    2015
  ) ON CONFLICT (id) DO UPDATE SET
    professional_name = EXCLUDED.professional_name,
    bio = EXCLUDED.bio,
    practice_areas = EXCLUDED.practice_areas,
    experience_years = EXCLUDED.experience_years,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    languages = EXCLUDED.languages,
    is_profile_completed = true,
    is_published = true;

  -- Advocate 4: Adv. K. K. Venugopalan (Chennai)
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_lawyer_4::text, 'role', 'authenticated')::text, true);
  PERFORM set_config('request.jwt.claim.sub', v_lawyer_4::text, true);

  INSERT INTO public.lawyer_profiles (
    id, professional_name, bio, practice_areas, experience_years, city, state, languages,
    is_profile_completed, is_published, bar_council_number, bar_council_state, bar_council_enrollment_year
  ) VALUES (
    v_lawyer_4,
    'Adv. K. K. Venugopalan',
    'Over two decades of trial and appellate practice at Madras High Court and National Consumer Disputes Redressal Commission (NCDRC). Expert in consumer class litigation.',
    ARRAY['Consumer Protection', 'Civil Litigation', 'Maritime Law'],
    24,
    'Chennai',
    'Tamil Nadu',
    ARRAY['English', 'Tamil', 'Malayalam'],
    true,
    true,
    'MS/0812/2000',
    'Tamil Nadu',
    2000
  ) ON CONFLICT (id) DO UPDATE SET
    professional_name = EXCLUDED.professional_name,
    bio = EXCLUDED.bio,
    practice_areas = EXCLUDED.practice_areas,
    experience_years = EXCLUDED.experience_years,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    languages = EXCLUDED.languages,
    is_profile_completed = true,
    is_published = true;

  -- Advocate 5: Adv. Ananya Roy (Kolkata)
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_lawyer_5::text, 'role', 'authenticated')::text, true);
  PERFORM set_config('request.jwt.claim.sub', v_lawyer_5::text, true);

  INSERT INTO public.lawyer_profiles (
    id, professional_name, bio, practice_areas, experience_years, city, state, languages,
    is_profile_completed, is_published, bar_council_number, bar_council_state, bar_council_enrollment_year
  ) VALUES (
    v_lawyer_5,
    'Adv. Ananya Roy',
    'Counsel dedicated to family dispute resolution, probate and estate administration, and matrimonial property partition before Calcutta High Court.',
    ARRAY['Family Law', 'Matrimonial Disputes', 'Property Partition'],
    14,
    'Kolkata',
    'West Bengal',
    ARRAY['English', 'Bengali', 'Hindi'],
    true,
    true,
    'WB/2301/2010',
    'West Bengal',
    2010
  ) ON CONFLICT (id) DO UPDATE SET
    professional_name = EXCLUDED.professional_name,
    bio = EXCLUDED.bio,
    practice_areas = EXCLUDED.practice_areas,
    experience_years = EXCLUDED.experience_years,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    languages = EXCLUDED.languages,
    is_profile_completed = true,
    is_published = true;

  -- Advocate 6: Adv. Vikramaditya Reddy (Hyderabad)
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_lawyer_6::text, 'role', 'authenticated')::text, true);
  PERFORM set_config('request.jwt.claim.sub', v_lawyer_6::text, true);

  INSERT INTO public.lawyer_profiles (
    id, professional_name, bio, practice_areas, experience_years, city, state, languages,
    is_profile_completed, is_published, bar_council_number, bar_council_state, bar_council_enrollment_year
  ) VALUES (
    v_lawyer_6,
    'Adv. Vikramaditya Reddy',
    'Specialist in Telangana RERA appeals, land title scrutinies, infrastructure lease structuring, and Debts Recovery Tribunal proceedings.',
    ARRAY['Real Estate & RERA', 'Banking & DRT', 'Revenue Litigation'],
    11,
    'Hyderabad',
    'Telangana',
    ARRAY['English', 'Telugu', 'Hindi'],
    true,
    true,
    'AP/3419/2013',
    'Telangana',
    2013
  ) ON CONFLICT (id) DO UPDATE SET
    professional_name = EXCLUDED.professional_name,
    bio = EXCLUDED.bio,
    practice_areas = EXCLUDED.practice_areas,
    experience_years = EXCLUDED.experience_years,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    languages = EXCLUDED.languages,
    is_profile_completed = true,
    is_published = true;

  -- ----------------------------------------------------------------------------
  -- 4. SEED LAWYER VERIFICATIONS (Using Admin Auth Context for Valid Approval)
  -- ----------------------------------------------------------------------------
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_admin_id::text, 'role', 'authenticated')::text, true);
  PERFORM set_config('request.jwt.claim.sub', v_admin_id::text, true);

  -- Verification 1
  INSERT INTO public.lawyer_verifications (
    lawyer_id, status, reviewed_by, reviewed_at, lawyer_feedback, internal_notes
  ) VALUES (
    v_lawyer_1, 'approved', v_admin_id, now(), 'Bar Council of Delhi enrollment verified against BCI registry.', 'Verified ID D/1429/2006.'
  ) ON CONFLICT (lawyer_id) DO UPDATE SET status = 'approved', reviewed_by = v_admin_id, reviewed_at = now();

  -- Verification 2
  INSERT INTO public.lawyer_verifications (
    lawyer_id, status, reviewed_by, reviewed_at, lawyer_feedback, internal_notes
  ) VALUES (
    v_lawyer_2, 'approved', v_admin_id, now(), 'Bar Council of Maharashtra & Goa enrollment verified.', 'Verified ID MAH/3820/2012.'
  ) ON CONFLICT (lawyer_id) DO UPDATE SET status = 'approved', reviewed_by = v_admin_id, reviewed_at = now();

  -- Verification 3
  INSERT INTO public.lawyer_verifications (
    lawyer_id, status, reviewed_by, reviewed_at, lawyer_feedback, internal_notes
  ) VALUES (
    v_lawyer_3, 'approved', v_admin_id, now(), 'Karnataka State Bar Council credentials validated.', 'Verified ID KAR/1942/2015.'
  ) ON CONFLICT (lawyer_id) DO UPDATE SET status = 'approved', reviewed_by = v_admin_id, reviewed_at = now();

  -- Verification 4
  INSERT INTO public.lawyer_verifications (
    lawyer_id, status, reviewed_by, reviewed_at, lawyer_feedback, internal_notes
  ) VALUES (
    v_lawyer_4, 'approved', v_admin_id, now(), 'Bar Council of Tamil Nadu & Puducherry enrollment confirmed.', 'Verified ID MS/0812/2000.'
  ) ON CONFLICT (lawyer_id) DO UPDATE SET status = 'approved', reviewed_by = v_admin_id, reviewed_at = now();

  -- Verification 5
  INSERT INTO public.lawyer_verifications (
    lawyer_id, status, reviewed_by, reviewed_at, lawyer_feedback, internal_notes
  ) VALUES (
    v_lawyer_5, 'approved', v_admin_id, now(), 'Bar Council of West Bengal verification complete.', 'Verified ID WB/2301/2010.'
  ) ON CONFLICT (lawyer_id) DO UPDATE SET status = 'approved', reviewed_by = v_admin_id, reviewed_at = now();

  -- Verification 6
  INSERT INTO public.lawyer_verifications (
    lawyer_id, status, reviewed_by, reviewed_at, lawyer_feedback, internal_notes
  ) VALUES (
    v_lawyer_6, 'approved', v_admin_id, now(), 'Bar Council of Telangana records validated.', 'Verified ID AP/3419/2013.'
  ) ON CONFLICT (lawyer_id) DO UPDATE SET status = 'approved', reviewed_by = v_admin_id, reviewed_at = now();

  -- ----------------------------------------------------------------------------
  -- 5. TEARDOWN: RESET DATABASE RUNTIME CONFIGURATION TO POSTGRES
  -- ----------------------------------------------------------------------------
  PERFORM set_config('role', 'postgres', true);
  PERFORM set_config('request.jwt.claims', '', true);
  PERFORM set_config('request.jwt.claim.sub', '', true);
END;
$$;
