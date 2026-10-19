-- ==============================================================================
-- Schema Access & Security Test Suite (NyayaLink)
-- File: supabase/tests/schema_access_tests.sql
-- Description: Custom Transaction-Isolated PL/pgSQL Security & Access-Control
--              Assertion Suite. Validates RLS policies, minimal grants,
--              publication consent metadata protection, immutable identifiers,
--              separated review notes, and specific error SQLSTATEs.
--              Executed within a transaction and rolled back to maintain pristine state.
-- ==============================================================================

BEGIN;

CREATE TEMPORARY TABLE _test_results (
  id serial PRIMARY KEY,
  assertion text NOT NULL,
  passed boolean NOT NULL,
  details text
);

GRANT ALL ON TABLE _test_results TO PUBLIC, anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE _test_results_id_seq TO PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION pg_temp.assert_ok(cond boolean, descr text, detail_msg text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO _test_results (assertion, passed, details)
  VALUES (descr, cond, detail_msg);
  IF NOT cond THEN
    RAISE EXCEPTION 'TEST FAILED: % (Details: %)', descr, coalesce(detail_msg, 'none');
  END IF;
END;
$$;

DO $$
DECLARE
  v_admin_id uuid := '11111111-1111-4111-8111-111111111111'::uuid;
  v_lawyer_id uuid := '22222222-2222-4222-8222-222222222222'::uuid;
  v_client_id uuid := '33333333-3333-4333-8333-333333333333'::uuid;
  v_other_client_id uuid := '44444444-4444-4444-8444-444444444444'::uuid;
  v_stranger_id uuid := '55555555-5555-4555-8555-555555555555'::uuid;
  v_other_lawyer_id uuid := '66666666-6666-4666-8666-666666666666'::uuid;
  
  v_count integer;
  v_check_passed boolean;
  v_error_occurred boolean;
  v_record_id uuid;
  v_actual_reviewer uuid;
  v_status text;
  v_sqlstate text;
BEGIN
  -- ----------------------------------------------------------------------------
  -- FIXTURE SETUP: Create legitimate auth.users rows
  -- ----------------------------------------------------------------------------
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at
  ) VALUES 
    (v_admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@nyayalink.test', 'mock_pw', now(), '{"full_name": "System Administrator"}'::jsonb, now(), now()),
    (v_lawyer_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'advocate.sharma@nyayalink.test', 'mock_pw', now(), '{"full_name": "Advocate Priya Sharma"}'::jsonb, now(), now()),
    (v_client_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'client1@nyayalink.test', 'mock_pw', now(), '{"full_name": "Rohan Verma"}'::jsonb, now(), now()),
    (v_other_client_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'patel@nyayalink.test', 'mock_pw', now(), '{"full_name": "   "}'::jsonb, now(), now()),
    (v_stranger_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'stranger@nyayalink.test', 'mock_pw', now(), '{"full_name": "Stranger User"}'::jsonb, now(), now()),
    (v_other_lawyer_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lawyer2@nyayalink.test', 'mock_pw', now(), '{"full_name": "Advocate Ramesh Gupta"}'::jsonb, now(), now());

  -- Grant explicit admin and lawyer roles via trusted setup
  INSERT INTO public.user_roles (user_id, role, assigned_by) VALUES (v_admin_id, 'admin', v_admin_id);
  INSERT INTO public.user_roles (user_id, role, assigned_by) VALUES (v_lawyer_id, 'lawyer', v_admin_id);
  INSERT INTO public.user_roles (user_id, role, assigned_by) VALUES (v_other_lawyer_id, 'lawyer', v_admin_id);

  -- ----------------------------------------------------------------------------
  -- TEST 1: Auth Trigger Auto-Provisioning & Name Sanitization
  -- ----------------------------------------------------------------------------
  SELECT count(*) INTO v_count FROM public.profiles WHERE id IN (v_admin_id, v_lawyer_id, v_client_id, v_other_client_id, v_stranger_id, v_other_lawyer_id);
  PERFORM pg_temp.assert_ok(v_count = 6, '1.1 Auth trigger provisions profiles for all created users');

  SELECT (char_length(full_name) >= 2 AND full_name <> '   ') INTO v_check_passed
  FROM public.profiles WHERE id = v_other_client_id;
  PERFORM pg_temp.assert_ok(v_check_passed, '1.2 Whitespace names safely sanitized by clean_initial_name');

  SELECT count(*) INTO v_count FROM public.user_roles WHERE user_id = v_client_id AND role = 'client';
  PERFORM pg_temp.assert_ok(v_count = 1, '1.3 Default client role assigned to new client');

  -- ----------------------------------------------------------------------------
  -- TEST 2: Role Anti-Enumeration & Unauthenticated Denial
  -- ----------------------------------------------------------------------------
  -- 2.1 Unauthenticated (anon)
  PERFORM set_config('role', 'anon', true);
  PERFORM set_config('request.jwt.claims', '{"role": "anon"}', true);
  PERFORM set_config('request.jwt.claim.sub', '', true);

  v_error_occurred := false;
  BEGIN
    PERFORM public.has_role(v_admin_id, 'admin');
  EXCEPTION 
    WHEN SQLSTATE '42501' THEN  -- insufficient_privilege
      v_error_occurred := true;
  END;
  PERFORM pg_temp.assert_ok(v_error_occurred, '2.1 Anonymous role cannot execute has_role (SQLSTATE 42501)');

  -- 2.2 Client checking own vs other roles
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_client_id::text, 'role', 'authenticated')::text, true);
  PERFORM set_config('request.jwt.claim.sub', v_client_id::text, true);

  PERFORM pg_temp.assert_ok(public.has_role(v_client_id, 'client') = true, '2.2 Client can inspect their own role');
  PERFORM pg_temp.assert_ok(public.has_role(v_admin_id, 'admin') = false, '2.3 Role anti-enumeration prevents client from probing admin role');

  -- ----------------------------------------------------------------------------
  -- TEST 3: Privilege Elevation Prevention
  -- ----------------------------------------------------------------------------
  v_error_occurred := false;
  BEGIN
    INSERT INTO public.user_roles (user_id, role) VALUES (v_client_id, 'admin');
  EXCEPTION 
    WHEN SQLSTATE '42501' OR SQLSTATE '23514' THEN  -- insufficient_privilege or check_violation
      v_error_occurred := true;
  END;
  PERFORM pg_temp.assert_ok(v_error_occurred, '3.1 Self-assigning admin role is blocked by RLS');

  -- ----------------------------------------------------------------------------
  -- TEST 4: Direct Audit Logs Write Prevention
  -- ----------------------------------------------------------------------------
  v_error_occurred := false;
  BEGIN
    INSERT INTO public.audit_logs (actor_id, action, target_table)
    VALUES (v_client_id, 'FORGED_AUDIT', 'profiles');
  EXCEPTION 
    WHEN SQLSTATE '42501' THEN  -- insufficient_privilege
      v_error_occurred := true;
  END;
  PERFORM pg_temp.assert_ok(v_error_occurred, '4.1 Authenticated client direct INSERT into audit_logs is denied (SQLSTATE 42501)');

  -- ----------------------------------------------------------------------------
  -- TEST 5: Lawyer Profile Creation & Restricted Bar Council Data
  -- ----------------------------------------------------------------------------
  -- Switch to Lawyer session
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_lawyer_id::text, 'role', 'authenticated')::text, true);
  PERFORM set_config('request.jwt.claim.sub', v_lawyer_id::text, true);

  INSERT INTO public.lawyer_profiles (
    id, professional_name, bio, practice_areas, experience_years, city, state, languages,
    is_profile_completed, is_published, bar_council_number, bar_council_state, bar_council_enrollment_year
  ) VALUES (
    v_lawyer_id, 'Adv. Priya Sharma', 'Commercial Litigation',
    ARRAY['Commercial Law'], 8, 'Mumbai', 'Maharashtra', ARRAY['English', 'Hindi'],
    true, false, 'MAH/5678/2016', 'Maharashtra', 2016
  );

  -- Switch to Client session: verify raw lawyer_profiles table is protected
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_client_id::text, 'role', 'authenticated')::text, true);
  PERFORM set_config('request.jwt.claim.sub', v_client_id::text, true);

  SELECT count(*) INTO v_count FROM public.lawyer_profiles WHERE id = v_lawyer_id;
  PERFORM pg_temp.assert_ok(v_count = 0, '5.1 Client cannot query raw lawyer_profiles (Bar Council numbers protected by RLS)');

  -- Switch to Anon session: verify raw lawyer_profiles table raises permission denied
  PERFORM set_config('role', 'anon', true);
  PERFORM set_config('request.jwt.claims', '{"role": "anon"}', true);
  PERFORM set_config('request.jwt.claim.sub', '', true);

  v_error_occurred := false;
  BEGIN
    PERFORM count(*) FROM public.lawyer_profiles WHERE id = v_lawyer_id;
  EXCEPTION 
    WHEN SQLSTATE '42501' THEN  -- insufficient_privilege
      v_error_occurred := true;
  END;
  PERFORM pg_temp.assert_ok(v_error_occurred, '5.2 Anonymous query to raw lawyer_profiles raises permission denied (SQLSTATE 42501)');

  -- ----------------------------------------------------------------------------
  -- TEST 6: Lawyer Verification Lifecycle, Reviewer Binding & Immutable Identifiers
  -- ----------------------------------------------------------------------------
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_lawyer_id::text, 'role', 'authenticated')::text, true);
  PERFORM set_config('request.jwt.claim.sub', v_lawyer_id::text, true);

  -- 6.1 Self-review on submission rejected
  v_error_occurred := false;
  BEGIN
    INSERT INTO public.lawyer_verifications (lawyer_id, status, reviewed_by)
    VALUES (v_lawyer_id, 'approved', v_lawyer_id);
  EXCEPTION 
    WHEN SQLSTATE '23514' OR SQLSTATE 'P0001' THEN  -- check_violation or raise_exception
      v_error_occurred := true;
  END;
  PERFORM pg_temp.assert_ok(v_error_occurred, '6.1 Self-review during submission blocked by constraint & trigger');

  -- 6.2 Forged approval status neutralized to pending
  INSERT INTO public.lawyer_verifications (lawyer_id, status, reviewed_by)
  VALUES (v_lawyer_id, 'approved', NULL)
  RETURNING id INTO v_record_id;

  PERFORM set_config('role', 'postgres', true);
  SELECT status, reviewed_by INTO STRICT v_status, v_actual_reviewer
  FROM public.lawyer_verifications WHERE id = v_record_id;
  PERFORM pg_temp.assert_ok(v_status = 'pending' AND v_actual_reviewer IS NULL, '6.2 Forged lawyer approval properly neutralized to pending');

  -- 6.3 Admin review: Forged reviewer ID overridden with authenticated admin
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_admin_id::text, 'role', 'authenticated')::text, true);
  PERFORM set_config('request.jwt.claim.sub', v_admin_id::text, true);

  UPDATE public.lawyer_verifications
  SET status = 'approved',
      reviewed_by = v_stranger_id,
      lawyer_feedback = 'Documents verified successfully',
      internal_notes = 'Bar Council database confirmed MAH/5678/2016'
  WHERE id = v_record_id;

  PERFORM set_config('role', 'postgres', true);
  SELECT reviewed_by INTO v_actual_reviewer FROM public.lawyer_verifications WHERE id = v_record_id;
  PERFORM pg_temp.assert_ok(v_actual_reviewer = v_admin_id, '6.3 Verification reviewer identity strictly bound to authenticated admin');

  -- 6.4 Protection of immutable verification fields (id, lawyer_id, created_at)
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_admin_id::text, 'role', 'authenticated')::text, true);
  PERFORM set_config('request.jwt.claim.sub', v_admin_id::text, true);

  v_error_occurred := false;
  BEGIN
    UPDATE public.lawyer_verifications
    SET lawyer_id = v_other_client_id
    WHERE id = v_record_id;
  EXCEPTION 
    WHEN SQLSTATE 'P0001' THEN  -- raise_exception: Immutable Field
      v_error_occurred := true;
  END;
  PERFORM pg_temp.assert_ok(v_error_occurred, '6.4 Immutable verification lawyer_id cannot be modified (SQLSTATE P0001)');

  -- ----------------------------------------------------------------------------
  -- TEST 7: Review Notes Separation (Feedback Visible vs Internal Notes Hidden)
  -- ----------------------------------------------------------------------------
  -- Switch to Lawyer identity: Lawyer queries lawyer_verifications
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_lawyer_id::text, 'role', 'authenticated')::text, true);
  PERFORM set_config('request.jwt.claim.sub', v_lawyer_id::text, true);

  -- 7.1 Lawyer can read lawyer_feedback
  SELECT count(*) INTO v_count FROM public.lawyer_verifications WHERE lawyer_id = v_lawyer_id AND lawyer_feedback IS NOT NULL;
  PERFORM pg_temp.assert_ok(v_count = 1, '7.1 Lawyer can read lawyer_feedback');

  -- 7.2 Lawyer is DENIED reading internal_notes column (table-level SELECT revoked, column omitted)
  v_error_occurred := false;
  BEGIN
    PERFORM internal_notes FROM public.lawyer_verifications WHERE lawyer_id = v_lawyer_id;
  EXCEPTION 
    WHEN SQLSTATE '42501' THEN  -- insufficient_privilege
      v_error_occurred := true;
  END;
  PERFORM pg_temp.assert_ok(v_error_occurred, '7.2 Lawyer is denied reading internal_notes column (SQLSTATE 42501)');

  -- 7.3 Admin can read internal_notes via admin_lawyer_verifications view
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_admin_id::text, 'role', 'authenticated')::text, true);
  PERFORM set_config('request.jwt.claim.sub', v_admin_id::text, true);

  SELECT count(*) INTO v_count FROM public.admin_lawyer_verifications WHERE lawyer_id = v_lawyer_id AND internal_notes IS NOT NULL;
  PERFORM pg_temp.assert_ok(v_count = 1, '7.3 Administrator can read internal_notes via admin_lawyer_verifications view');

  -- ----------------------------------------------------------------------------
  -- TEST 8: Public-Profile Consent & Publication Restrictions (INSERT & UPDATE)
  -- ----------------------------------------------------------------------------
  -- 8.1 Admin attempts to insert a pre-published profile on behalf of another lawyer -> REJECTED
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_admin_id::text, 'role', 'authenticated')::text, true);
  PERFORM set_config('request.jwt.claim.sub', v_admin_id::text, true);

  v_error_occurred := false;
  BEGIN
    INSERT INTO public.lawyer_profiles (
      id, professional_name, city, state, bar_council_number, bar_council_state, bar_council_enrollment_year,
      is_published
    ) VALUES (
      v_other_lawyer_id, 'Adv. Ramesh Gupta', 'Delhi', 'Delhi', 'D/1234/2015', 'Delhi', 2015,
      true
    );
  EXCEPTION 
    WHEN SQLSTATE 'P0001' THEN  -- raise_exception
      v_error_occurred := true;
  END;
  PERFORM pg_temp.assert_ok(v_error_occurred, '8.1 Admin cannot insert pre-published profile on lawyer behalf (SQLSTATE P0001)');

  -- 8.2 Admin attempts to update is_published = true on existing profile -> REJECTED
  v_error_occurred := false;
  BEGIN
    UPDATE public.lawyer_profiles SET is_published = true WHERE id = v_lawyer_id;
  EXCEPTION 
    WHEN SQLSTATE 'P0001' THEN
      v_error_occurred := true;
  END;
  PERFORM pg_temp.assert_ok(v_error_occurred, '8.2 Admin cannot update is_published = true on lawyer profile (SQLSTATE P0001)');

  -- 8.3 Lawyer attempts to alter published_at or published_by without status change -> REJECTED
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_lawyer_id::text, 'role', 'authenticated')::text, true);
  PERFORM set_config('request.jwt.claim.sub', v_lawyer_id::text, true);

  v_error_occurred := false;
  BEGIN
    UPDATE public.lawyer_profiles SET published_at = '2000-01-01'::timestamptz WHERE id = v_lawyer_id;
  EXCEPTION 
    WHEN SQLSTATE 'P0001' THEN
      v_error_occurred := true;
  END;
  PERFORM pg_temp.assert_ok(v_error_occurred, '8.3 Consent metadata cannot be altered independently of status change (SQLSTATE P0001)');

  -- 8.4 While is_published = false: Anon cannot see profile in public_lawyer_directory
  PERFORM set_config('role', 'anon', true);
  PERFORM set_config('request.jwt.claims', '{"role": "anon"}', true);
  PERFORM set_config('request.jwt.claim.sub', '', true);

  SELECT count(*) INTO v_count FROM public.public_lawyer_directory WHERE id = v_lawyer_id;
  PERFORM pg_temp.assert_ok(v_count = 0, '8.4 Unconsented profile (is_published = false) hidden from public directory');

  -- 8.5 Lawyer explicitly grants consent -> Recorded with published_at and published_by
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_lawyer_id::text, 'role', 'authenticated')::text, true);
  PERFORM set_config('request.jwt.claim.sub', v_lawyer_id::text, true);

  UPDATE public.lawyer_profiles SET is_published = true WHERE id = v_lawyer_id;

  PERFORM set_config('role', 'postgres', true);
  SELECT (published_at IS NOT NULL AND published_by = v_lawyer_id) INTO v_check_passed
  FROM public.lawyer_profiles WHERE id = v_lawyer_id;
  PERFORM pg_temp.assert_ok(v_check_passed, '8.5 Lawyer publication consent records published_at and published_by');

  -- 8.6 Audit log captured PUBLICATION_CONSENT_GRANTED
  SELECT count(*) INTO v_count FROM public.audit_logs WHERE target_table = 'lawyer_profiles' AND action = 'PUBLICATION_CONSENT_GRANTED';
  PERFORM pg_temp.assert_ok(v_count >= 1, '8.6 Audit log recorded PUBLICATION_CONSENT_GRANTED event');

  -- 8.7 Now profile is visible in public directory
  PERFORM set_config('role', 'anon', true);
  PERFORM set_config('request.jwt.claims', '{"role": "anon"}', true);
  PERFORM set_config('request.jwt.claim.sub', '', true);

  SELECT count(*) INTO v_count FROM public.public_lawyer_directory WHERE id = v_lawyer_id;
  PERFORM pg_temp.assert_ok(v_count = 1, '8.7 Approved and published lawyer is visible in public directory');

  -- ----------------------------------------------------------------------------
  -- TEST 9: Automatic Invalidation of Approval on Credential Changes
  -- ----------------------------------------------------------------------------
  -- 9.1 Lawyer cannot directly modify verified credentials
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_lawyer_id::text, 'role', 'authenticated')::text, true);
  PERFORM set_config('request.jwt.claim.sub', v_lawyer_id::text, true);

  v_error_occurred := false;
  BEGIN
    UPDATE public.lawyer_profiles SET bar_council_number = 'MAH/9999/2026' WHERE id = v_lawyer_id;
  EXCEPTION 
    WHEN SQLSTATE 'P0001' THEN
      v_error_occurred := true;
  END;
  PERFORM pg_temp.assert_ok(v_error_occurred, '9.1 Lawyer cannot modify verified Bar credentials directly (SQLSTATE P0001)');

  -- 9.2 Admin modifies Bar Council number -> Existing approval MUST be invalidated (reset to pending)
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_admin_id::text, 'role', 'authenticated')::text, true);
  PERFORM set_config('request.jwt.claim.sub', v_admin_id::text, true);

  UPDATE public.lawyer_profiles SET bar_council_number = 'MAH/5678/2016-AMENDED' WHERE id = v_lawyer_id;

  PERFORM set_config('role', 'postgres', true);
  SELECT status, reviewed_by INTO STRICT v_status, v_actual_reviewer
  FROM public.lawyer_verifications WHERE lawyer_id = v_lawyer_id;
  PERFORM pg_temp.assert_ok(v_status = 'pending' AND v_actual_reviewer IS NULL, '9.2 Admin credential change automatically invalidates approval (status reset to pending)');

  -- 9.3 Lawyer is automatically hidden from public directory until re-verified
  PERFORM set_config('role', 'anon', true);
  PERFORM set_config('request.jwt.claims', '{"role": "anon"}', true);
  PERFORM set_config('request.jwt.claim.sub', '', true);

  SELECT count(*) INTO v_count FROM public.public_lawyer_directory WHERE id = v_lawyer_id;
  PERFORM pg_temp.assert_ok(v_count = 0, '9.3 Invalidated lawyer immediately removed from public directory');

  -- ----------------------------------------------------------------------------
  -- TEST 10: Invitations RLS & Hashed Token Security
  -- ----------------------------------------------------------------------------
  -- 10.1 Client insert denied
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_client_id::text, 'role', 'authenticated')::text, true);
  PERFORM set_config('request.jwt.claim.sub', v_client_id::text, true);

  v_error_occurred := false;
  BEGIN
    INSERT INTO public.invitations (email, token_hash, invited_by)
    VALUES ('invitee@nyayalink.test', 'token_123', v_client_id);
  EXCEPTION 
    WHEN SQLSTATE '42501' OR SQLSTATE '23514' THEN
      v_error_occurred := true;
  END;
  PERFORM pg_temp.assert_ok(v_error_occurred, '10.1 Client cannot create invitations (RLS check)');

  -- 10.2 Admin creates invitation with hashed token
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_admin_id::text, 'role', 'authenticated')::text, true);
  PERFORM set_config('request.jwt.claim.sub', v_admin_id::text, true);

  INSERT INTO public.invitations (email, token_hash, invited_by)
  VALUES ('partner@lawfirm.test', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', v_admin_id);

  SELECT count(*) INTO v_count FROM public.invitations WHERE email = 'partner@lawfirm.test';
  PERFORM pg_temp.assert_ok(v_count = 1, '10.2 Admin creates and reads invitations with SHA-256 token hash');

  -- ----------------------------------------------------------------------------
  -- TEST 11: Audit Log Immutability
  -- ----------------------------------------------------------------------------
  -- 11.1 Authenticated client role is genuinely used and denied DELETE by SQL permissions (SQLSTATE 42501)
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_client_id::text, 'role', 'authenticated')::text, true);
  PERFORM set_config('request.jwt.claim.sub', v_client_id::text, true);

  v_error_occurred := false;
  BEGIN
    DELETE FROM public.audit_logs WHERE target_table = 'lawyer_profiles';
  EXCEPTION 
    WHEN SQLSTATE '42501' THEN  -- insufficient_privilege
      v_error_occurred := true;
  END;
  PERFORM pg_temp.assert_ok(v_error_occurred, '11.1 Authenticated role genuinely cannot delete audit logs (SQLSTATE 42501)');

  -- 11.2 Superuser attempting DELETE is blocked by immutability trigger (SQLSTATE P0001)
  PERFORM set_config('role', 'postgres', true);
  v_error_occurred := false;
  BEGIN
    DELETE FROM public.audit_logs WHERE target_table = 'lawyer_profiles';
  EXCEPTION 
    WHEN SQLSTATE 'P0001' THEN  -- raise_exception
      v_error_occurred := true;
  END;
  PERFORM pg_temp.assert_ok(v_error_occurred, '11.2 Superuser mutation blocked by audit log immutability trigger (SQLSTATE P0001)');

END;
$$;

SELECT id, assertion, passed, details FROM _test_results ORDER BY id;

ROLLBACK;
