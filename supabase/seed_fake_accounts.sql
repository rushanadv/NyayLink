-- ==============================================================================
-- NyayLink Isolated Fake Test Accounts Provisioning
-- File: supabase/seed_fake_accounts.sql
--
-- Provisions isolated test fixtures with the mandatory literal 'fake ' prefix:
-- 1. fake rohan sharma (Client)
-- 2. fake ananya verma (Client)
-- 3. fake Adv. Arjun Mehta (Advocate, Approved BCI Verification)
-- 4. fake Adv. Priya Kapoor (Advocate, Pending BCI Verification)
-- ==============================================================================

DO $$
DECLARE
  v_admin_id uuid := '11111111-1111-4111-8111-111111111111'::uuid;

  -- 2 Fake Customer Accounts
  v_client_1 uuid := 'f1111111-1111-4111-8111-111111111111'::uuid;
  v_client_2 uuid := 'f2222222-2222-4222-8222-222222222222'::uuid;

  -- 2 Fake Advocate Accounts
  v_lawyer_1 uuid := 'f3333333-3333-4333-8333-333333333333'::uuid;
  v_lawyer_2 uuid := 'f4444444-4444-4444-8444-444444444444'::uuid;

  -- Bcrypt hash for safe test password
  v_test_pw_hash text := crypt('NyayLink#FakeTest2026!', gen_salt('bf', 8));
BEGIN
  -- ----------------------------------------------------------------------------
  -- 0. Ensure Admin user exists for verification review attribution
  -- ----------------------------------------------------------------------------
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) VALUES (
    v_admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'admin@nyayalink.test', v_test_pw_hash, now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"full_name": "Justice Admin Officer"}'::jsonb, now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    encrypted_password = v_test_pw_hash,
    email_confirmed_at = now(),
    raw_app_meta_data = '{"provider": "email", "providers": ["email"]}'::jsonb;

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_admin_id, v_admin_id,
    json_build_object('sub', v_admin_id::text, 'email', 'admin@nyayalink.test', 'email_verified', true)::jsonb,
    'email', v_admin_id::text, now(), now(), now()
  ) ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, full_name, is_active, created_at, updated_at)
  VALUES (v_admin_id, 'Justice Admin Officer', true, now(), now())
  ON CONFLICT (id) DO UPDATE SET is_active = true;

  INSERT INTO public.user_roles (user_id, role, assigned_by)
  VALUES (v_admin_id, 'admin', v_admin_id)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- ----------------------------------------------------------------------------
  -- 1. AUTH USERS (with literal prefix 'fake ' in names and distinct test emails)
  -- ----------------------------------------------------------------------------
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) VALUES 
    (v_client_1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fake.rohan.sharma@nyayalink.test', v_test_pw_hash, now(), '{"provider": "email", "providers": ["email"]}'::jsonb, '{"full_name": "fake rohan sharma", "role": "client"}'::jsonb, now(), now()),
    (v_client_2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fake.ananya.verma@nyayalink.test', v_test_pw_hash, now(), '{"provider": "email", "providers": ["email"]}'::jsonb, '{"full_name": "fake ananya verma", "role": "client"}'::jsonb, now(), now()),
    (v_lawyer_1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fake.arjun.mehta@nyayalink.test', v_test_pw_hash, now(), '{"provider": "email", "providers": ["email"]}'::jsonb, '{"full_name": "fake arjun mehta", "role": "lawyer"}'::jsonb, now(), now()),
    (v_lawyer_2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fake.priya.kapoor@nyayalink.test', v_test_pw_hash, now(), '{"provider": "email", "providers": ["email"]}'::jsonb, '{"full_name": "fake priya kapoor", "role": "lawyer"}'::jsonb, now(), now())
  ON CONFLICT (id) DO UPDATE SET
    encrypted_password = v_test_pw_hash,
    email_confirmed_at = now(),
    raw_app_meta_data = '{"provider": "email", "providers": ["email"]}'::jsonb,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data,
    updated_at = now();

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES 
    (v_client_1, v_client_1, json_build_object('sub', v_client_1::text, 'email', 'fake.rohan.sharma@nyayalink.test', 'email_verified', true)::jsonb, 'email', v_client_1::text, now(), now(), now()),
    (v_client_2, v_client_2, json_build_object('sub', v_client_2::text, 'email', 'fake.ananya.verma@nyayalink.test', 'email_verified', true)::jsonb, 'email', v_client_2::text, now(), now(), now()),
    (v_lawyer_1, v_lawyer_1, json_build_object('sub', v_lawyer_1::text, 'email', 'fake.arjun.mehta@nyayalink.test', 'email_verified', true)::jsonb, 'email', v_lawyer_1::text, now(), now(), now()),
    (v_lawyer_2, v_lawyer_2, json_build_object('sub', v_lawyer_2::text, 'email', 'fake.priya.kapoor@nyayalink.test', 'email_verified', true)::jsonb, 'email', v_lawyer_2::text, now(), now(), now())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  -- ----------------------------------------------------------------------------
  -- 2. PUBLIC PROFILES
  -- ----------------------------------------------------------------------------
  INSERT INTO public.profiles (id, full_name, is_active, created_at, updated_at)
  VALUES 
    (v_client_1, 'fake rohan sharma', true, now(), now()),
    (v_client_2, 'fake ananya verma', true, now(), now()),
    (v_lawyer_1, 'fake arjun mehta', true, now(), now()),
    (v_lawyer_2, 'fake priya kapoor', true, now(), now())
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    is_active = true,
    updated_at = now();

  -- ----------------------------------------------------------------------------
  -- 3. USER ROLES
  -- ----------------------------------------------------------------------------
  INSERT INTO public.user_roles (user_id, role, assigned_by)
  VALUES 
    (v_client_1, 'client', v_admin_id),
    (v_client_2, 'client', v_admin_id),
    (v_lawyer_1, 'lawyer', v_admin_id),
    (v_lawyer_2, 'lawyer', v_admin_id)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- ----------------------------------------------------------------------------
  -- 4. LAWYER PROFILES (Context switch to satisfy lawyer publication consent trigger)
  -- ----------------------------------------------------------------------------

  -- Fake Advocate 1: fake Adv. Arjun Mehta (New Delhi - Constitutional / Criminal / Civil)
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_lawyer_1::text, 'role', 'authenticated')::text, true);
  PERFORM set_config('request.jwt.claim.sub', v_lawyer_1::text, true);

  INSERT INTO public.lawyer_profiles (
    id, professional_name, bio, practice_areas, experience_years, city, state, languages,
    courts_of_practice, consultation_modes, consultation_fee, office_address,
    is_profile_completed, is_published, bar_council_number, bar_council_state, bar_council_enrollment_year
  ) VALUES (
    v_lawyer_1,
    'fake Adv. Arjun Mehta',
    'Specialist advocate practicing before Delhi High Court and Supreme Court of India. Experienced in commercial writs, civil litigation, and criminal defense matters.',
    ARRAY['Constitutional Law', 'Criminal Defense', 'Civil Litigation'],
    12,
    'New Delhi',
    'Delhi',
    ARRAY['English', 'Hindi', 'Punjabi'],
    ARRAY['Delhi High Court', 'Supreme Court of India', 'Patiala House Courts'],
    ARRAY['Online Video Consultation', 'In-Chambers Consultation'],
    2500,
    'Chamber 412, Lawyers Chambers Block, Delhi High Court, New Delhi',
    true,
    true,
    'D/FAKE/1001/2014',
    'Bar Council of Delhi',
    2014
  ) ON CONFLICT (id) DO UPDATE SET
    professional_name = EXCLUDED.professional_name,
    bio = EXCLUDED.bio,
    practice_areas = EXCLUDED.practice_areas,
    experience_years = EXCLUDED.experience_years,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    languages = EXCLUDED.languages,
    courts_of_practice = EXCLUDED.courts_of_practice,
    consultation_modes = EXCLUDED.consultation_modes,
    consultation_fee = EXCLUDED.consultation_fee,
    office_address = EXCLUDED.office_address,
    is_profile_completed = true,
    is_published = true,
    bar_council_number = EXCLUDED.bar_council_number,
    bar_council_state = EXCLUDED.bar_council_state,
    bar_council_enrollment_year = EXCLUDED.bar_council_enrollment_year,
    updated_at = now();

  -- Fake Advocate 2: fake Adv. Priya Kapoor (Mumbai - Corporate / IP / Arbitration)
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_lawyer_2::text, 'role', 'authenticated')::text, true);
  PERFORM set_config('request.jwt.claim.sub', v_lawyer_2::text, true);

  INSERT INTO public.lawyer_profiles (
    id, professional_name, bio, practice_areas, experience_years, city, state, languages,
    courts_of_practice, consultation_modes, consultation_fee, office_address,
    is_profile_completed, is_published, bar_council_number, bar_council_state, bar_council_enrollment_year
  ) VALUES (
    v_lawyer_2,
    'fake Adv. Priya Kapoor',
    'Commercial dispute resolution and intellectual property counsel appearing before the Bombay High Court and NCLT Mumbai bench.',
    ARRAY['Corporate & Commercial', 'Intellectual Property', 'Arbitration & ADR', 'Banking & DRT / IBC'],
    9,
    'Mumbai',
    'Maharashtra',
    ARRAY['English', 'Hindi', 'Marathi'],
    ARRAY['Bombay High Court', 'City Civil Court Mumbai', 'NCLT Mumbai Bench'],
    ARRAY['Online Video Consultation', 'In-Chambers Consultation'],
    3000,
    'Suite 602, Nariman Point Commercial Complex, Mumbai',
    true,
    true,
    'MAH/FAKE/2042/2017',
    'Bar Council of Maharashtra & Goa',
    2017
  ) ON CONFLICT (id) DO UPDATE SET
    professional_name = EXCLUDED.professional_name,
    bio = EXCLUDED.bio,
    practice_areas = EXCLUDED.practice_areas,
    experience_years = EXCLUDED.experience_years,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    languages = EXCLUDED.languages,
    courts_of_practice = EXCLUDED.courts_of_practice,
    consultation_modes = EXCLUDED.consultation_modes,
    consultation_fee = EXCLUDED.consultation_fee,
    office_address = EXCLUDED.office_address,
    is_profile_completed = true,
    is_published = true,
    bar_council_number = EXCLUDED.bar_council_number,
    bar_council_state = EXCLUDED.bar_council_state,
    bar_council_enrollment_year = EXCLUDED.bar_council_enrollment_year,
    updated_at = now();

  -- ----------------------------------------------------------------------------
  -- 5. VERIFICATIONS
  -- ----------------------------------------------------------------------------

  -- fake Adv. Arjun Mehta: Approved by Admin
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_admin_id::text, 'role', 'authenticated')::text, true);
  PERFORM set_config('request.jwt.claim.sub', v_admin_id::text, true);

  INSERT INTO public.lawyer_verifications (
    lawyer_id, status, reviewed_by, reviewed_at, lawyer_feedback, internal_notes, submitted_at
  ) VALUES (
    v_lawyer_1,
    'approved',
    v_admin_id,
    now(),
    'Bar Council credentials authenticated against Delhi Bar roll.',
    'Test fixture: Verified advocate for discovery and full profile inspection.',
    now() - interval '14 days'
  ) ON CONFLICT (lawyer_id) DO UPDATE SET
    status = 'approved',
    reviewed_by = v_admin_id,
    reviewed_at = now(),
    updated_at = now();

  -- fake Adv. Priya Kapoor: Pending verification (tests client directory "Verification Pending" flow)
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_admin_id::text, 'role', 'authenticated')::text, true);
  PERFORM set_config('request.jwt.claim.sub', v_admin_id::text, true);

  INSERT INTO public.lawyer_verifications (
    lawyer_id, status, reviewed_by, reviewed_at, lawyer_feedback, internal_notes, submitted_at
  ) VALUES (
    v_lawyer_2,
    'pending',
    NULL,
    NULL,
    NULL,
    'Test fixture: Pending verification advocate for discovery testing.',
    now() - interval '2 days'
  ) ON CONFLICT (lawyer_id) DO UPDATE SET
    status = 'pending',
    reviewed_by = NULL,
    reviewed_at = NULL,
    updated_at = now();

  -- ----------------------------------------------------------------------------
  -- 6. LAWYER EDUCATION ENTRIES (Using Admin Context)
  -- ----------------------------------------------------------------------------
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_admin_id::text, 'role', 'authenticated')::text, true);
  PERFORM set_config('request.jwt.claim.sub', v_admin_id::text, true);

  DELETE FROM public.lawyer_educations WHERE lawyer_id IN (v_lawyer_1, v_lawyer_2);

  INSERT INTO public.lawyer_educations (
    lawyer_id, degree, institution, field_of_study, graduation_year, is_public
  ) VALUES 
    (v_lawyer_1, 'LL.B. (Hons.)', 'Faculty of Law, University of Delhi', 'Constitutional & Criminal Law', 2014, true),
    (v_lawyer_1, 'B.A. (Political Science)', 'St. Stephen''s College, Delhi', 'Political Science & Public Administration', 2011, true),
    (v_lawyer_2, 'B.A. LL.B. (Hons.)', 'Government Law College, Mumbai', 'Corporate & Commercial Laws', 2017, true),
    (v_lawyer_2, 'LL.M.', 'National Law School of India University (NLSIU)', 'Intellectual Property Law', 2018, true);

  -- ----------------------------------------------------------------------------
  -- 7. LAWYER QUALIFICATIONS & CERTIFICATIONS
  -- ----------------------------------------------------------------------------
  DELETE FROM public.lawyer_qualifications WHERE lawyer_id IN (v_lawyer_1, v_lawyer_2);

  INSERT INTO public.lawyer_qualifications (
    lawyer_id, title, issuing_authority, issue_date, verification_status, is_public
  ) VALUES 
    (v_lawyer_1, 'Advocate-on-Record (AOR)', 'Supreme Court of India', '2020-04-15'::date, 'verified', true),
    (v_lawyer_1, 'Certified Trial Advocacy Practitioner', 'Bar Council of India Legal Education Committee', '2016-11-20'::date, 'verified', true),
    (v_lawyer_2, 'Accredited Commercial Arbitrator & Mediator', 'Indian Institute of Arbitration & Mediation (IIAM)', '2021-08-10'::date, 'verified', true),
    (v_lawyer_2, 'WIPO Advanced Certificate in Intellectual Property', 'World Intellectual Property Organization (WIPO)', '2019-06-30'::date, 'verified', true);

END $$;
