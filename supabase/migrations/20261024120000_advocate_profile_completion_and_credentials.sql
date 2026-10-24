-- ==============================================================================
-- Migration: 20261024120000_advocate_profile_completion_and_credentials.sql
-- Project: NyayLink - Indian Legal-Tech Platform
-- Description:
-- 1. Enhance lawyer_profiles with courts of practice, consultation modes, fee, office address.
-- 2. Create lawyer_educations, lawyer_qualifications, advocate_documents tables with strict RLS.
-- 3. Provision private storage bucket 'advocate-credentials' with security policies.
-- 4. Provide RPC get_advocate_profile_completeness for dynamic server-side completeness calculation.
-- 5. Update client_lawyer_directory and public_lawyer_directory views to expose authorised fields.
-- ==============================================================================

-- 1. Extend lawyer_profiles table with professional practice columns
ALTER TABLE public.lawyer_profiles
  ADD COLUMN IF NOT EXISTS courts_of_practice text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS consultation_modes text[] NOT NULL DEFAULT '{Online, In-Person}',
  ADD COLUMN IF NOT EXISTS consultation_fee numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS office_address text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS profile_photo_url text DEFAULT NULL;

-- 2. TABLE: lawyer_educations (Degrees, universities, completion years)
CREATE TABLE IF NOT EXISTS public.lawyer_educations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id uuid NOT NULL REFERENCES public.lawyer_profiles(id) ON DELETE CASCADE,
  degree text NOT NULL,
  institution text NOT NULL,
  field_of_study text,
  graduation_year integer NOT NULL CHECK (graduation_year >= 1950 AND graduation_year <= 2035),
  document_path text,
  document_name text,
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_edu_degree_len CHECK (char_length(trim(degree)) >= 2),
  CONSTRAINT chk_edu_inst_len CHECK (char_length(trim(institution)) >= 2)
);

CREATE INDEX IF NOT EXISTS idx_lawyer_educations_lawyer_id ON public.lawyer_educations(lawyer_id);
ALTER TABLE public.lawyer_educations ENABLE ROW LEVEL SECURITY;

-- Updated_at trigger for lawyer_educations
DROP TRIGGER IF EXISTS trg_lawyer_educations_updated_at ON public.lawyer_educations;
CREATE TRIGGER trg_lawyer_educations_updated_at
  BEFORE UPDATE ON public.lawyer_educations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS for lawyer_educations
DROP POLICY IF EXISTS "lawyer_educations_select" ON public.lawyer_educations;
CREATE POLICY "lawyer_educations_select"
  ON public.lawyer_educations FOR SELECT
  TO authenticated, anon
  USING (
    -- Lawyer owner can see all their education records
    (auth.uid() IS NOT NULL AND auth.uid() = lawyer_id)
    -- Admin can review all education records
    OR public.is_admin()
    -- Public / Clients can view if public display enabled and advocate is published
    OR (
      is_public = true
      AND EXISTS (
        SELECT 1 FROM public.lawyer_profiles lp
        WHERE lp.id = lawyer_educations.lawyer_id
          AND lp.is_published = true
      )
    )
  );

DROP POLICY IF EXISTS "lawyer_educations_insert" ON public.lawyer_educations;
CREATE POLICY "lawyer_educations_insert"
  ON public.lawyer_educations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = lawyer_id);

DROP POLICY IF EXISTS "lawyer_educations_update" ON public.lawyer_educations;
CREATE POLICY "lawyer_educations_update"
  ON public.lawyer_educations FOR UPDATE
  TO authenticated
  USING (auth.uid() = lawyer_id)
  WITH CHECK (auth.uid() = lawyer_id);

DROP POLICY IF EXISTS "lawyer_educations_delete" ON public.lawyer_educations;
CREATE POLICY "lawyer_educations_delete"
  ON public.lawyer_educations FOR DELETE
  TO authenticated
  USING (auth.uid() = lawyer_id);


-- 3. TABLE: lawyer_qualifications (Certifications, AOR, mediation, specialized training)
CREATE TABLE IF NOT EXISTS public.lawyer_qualifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id uuid NOT NULL REFERENCES public.lawyer_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  issuing_authority text NOT NULL,
  issue_date date,
  expiry_date date,
  document_path text,
  document_name text,
  verification_status text NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_qual_title_len CHECK (char_length(trim(title)) >= 2),
  CONSTRAINT chk_qual_auth_len CHECK (char_length(trim(issuing_authority)) >= 2)
);

CREATE INDEX IF NOT EXISTS idx_lawyer_qualifications_lawyer_id ON public.lawyer_qualifications(lawyer_id);
ALTER TABLE public.lawyer_qualifications ENABLE ROW LEVEL SECURITY;

-- Updated_at trigger for lawyer_qualifications
DROP TRIGGER IF EXISTS trg_lawyer_qualifications_updated_at ON public.lawyer_qualifications;
CREATE TRIGGER trg_lawyer_qualifications_updated_at
  BEFORE UPDATE ON public.lawyer_qualifications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS for lawyer_qualifications
DROP POLICY IF EXISTS "lawyer_qualifications_select" ON public.lawyer_qualifications;
CREATE POLICY "lawyer_qualifications_select"
  ON public.lawyer_qualifications FOR SELECT
  TO authenticated, anon
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = lawyer_id)
    OR public.is_admin()
    OR (
      is_public = true
      AND EXISTS (
        SELECT 1 FROM public.lawyer_profiles lp
        WHERE lp.id = lawyer_qualifications.lawyer_id
          AND lp.is_published = true
      )
    )
  );

DROP POLICY IF EXISTS "lawyer_qualifications_insert" ON public.lawyer_qualifications;
CREATE POLICY "lawyer_qualifications_insert"
  ON public.lawyer_qualifications FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = lawyer_id
    -- Lawyer cannot self-verify credentials upon insertion
    AND verification_status IN ('unverified', 'pending')
  );

DROP POLICY IF EXISTS "lawyer_qualifications_update" ON public.lawyer_qualifications;
CREATE POLICY "lawyer_qualifications_update"
  ON public.lawyer_qualifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = lawyer_id OR public.is_admin())
  WITH CHECK (
    public.is_admin()
    OR (
      auth.uid() = lawyer_id
      -- Lawyers cannot self-approve verification_status
      AND verification_status IN ('unverified', 'pending')
    )
  );

DROP POLICY IF EXISTS "lawyer_qualifications_delete" ON public.lawyer_qualifications;
CREATE POLICY "lawyer_qualifications_delete"
  ON public.lawyer_qualifications FOR DELETE
  TO authenticated
  USING (auth.uid() = lawyer_id OR public.is_admin());


-- 4. TABLE: advocate_documents (Enrolment certificates, degrees, verified records)
CREATE TABLE IF NOT EXISTS public.advocate_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id uuid NOT NULL REFERENCES public.lawyer_profiles(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('bar_council_id', 'degree_certificate', 'certificate_of_practice', 'other_qualification')),
  file_name text NOT NULL,
  file_size integer NOT NULL,
  mime_type text NOT NULL,
  storage_path text NOT NULL,
  is_verified boolean NOT NULL DEFAULT false,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_advocate_documents_lawyer_id ON public.advocate_documents(lawyer_id);
ALTER TABLE public.advocate_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "advocate_documents_owner_and_admin" ON public.advocate_documents;
CREATE POLICY "advocate_documents_owner_and_admin"
  ON public.advocate_documents
  FOR ALL
  TO authenticated
  USING (auth.uid() = lawyer_id OR public.is_admin())
  WITH CHECK (auth.uid() = lawyer_id OR public.is_admin());


-- 5. STORAGE BUCKET: advocate-credentials (Private storage)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'advocate-credentials',
  'advocate-credentials',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']::text[];

-- Storage Policies for advocate-credentials bucket
DROP POLICY IF EXISTS "Advocate credentials owner select" ON storage.objects;
CREATE POLICY "Advocate credentials owner select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'advocate-credentials'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin()
    )
  );

DROP POLICY IF EXISTS "Advocate credentials owner insert" ON storage.objects;
CREATE POLICY "Advocate credentials owner insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'advocate-credentials'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Advocate credentials owner update" ON storage.objects;
CREATE POLICY "Advocate credentials owner update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'advocate-credentials'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'advocate-credentials'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Advocate credentials owner delete" ON storage.objects;
CREATE POLICY "Advocate credentials owner delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'advocate-credentials'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin()
    )
  );


-- 6. RPC: Dynamic profile completeness calculation
CREATE OR REPLACE FUNCTION public.get_advocate_profile_completeness(p_lawyer_id uuid DEFAULT auth.uid())
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  _target_id uuid := COALESCE(p_lawyer_id, auth.uid());
  _lp public.lawyer_profiles%ROWTYPE;
  _prof public.profiles%ROWTYPE;
  _verif_status text := 'unsubmitted';
  _edu_count integer := 0;
  _doc_count integer := 0;
  _qual_count integer := 0;
  
  _score integer := 0;
  _missing text[] := '{}';
  _completed text[] := '{}';
  
  _sec_personal boolean := false;
  _sec_bar boolean := false;
  _sec_practice boolean := false;
  _sec_education boolean := false;
  _sec_documents boolean := false;
BEGIN
  IF _target_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required.');
  END IF;

  -- Only self or admin can query completeness
  IF auth.uid() IS DISTINCT FROM _target_id AND NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized.');
  END IF;

  SELECT * INTO _lp FROM public.lawyer_profiles WHERE id = _target_id;
  SELECT * INTO _prof FROM public.profiles WHERE id = _target_id;
  
  SELECT status INTO _verif_status
  FROM public.lawyer_verifications
  WHERE lawyer_id = _target_id;
  _verif_status := COALESCE(_verif_status, 'unsubmitted');

  SELECT COUNT(*) INTO _edu_count FROM public.lawyer_educations WHERE lawyer_id = _target_id;
  SELECT COUNT(*) INTO _doc_count FROM public.advocate_documents WHERE lawyer_id = _target_id;
  SELECT COUNT(*) INTO _qual_count FROM public.lawyer_qualifications WHERE lawyer_id = _target_id;

  -- 1. Personal & Contact (20 points)
  IF _lp.professional_name IS NOT NULL AND length(trim(_lp.professional_name)) >= 2 THEN
    _score := _score + 10;
    _completed := array_append(_completed, 'professional_name');
  ELSE
    _missing := array_append(_missing, 'professional_name');
  END IF;

  IF _prof.phone IS NOT NULL AND length(trim(_prof.phone)) >= 10 THEN
    _score := _score + 5;
    _completed := array_append(_completed, 'phone');
  ELSE
    _missing := array_append(_missing, 'phone');
  END IF;

  IF _lp.city IS NOT NULL AND length(trim(_lp.city)) >= 2 THEN
    _score := _score + 5;
    _completed := array_append(_completed, 'city');
  ELSE
    _missing := array_append(_missing, 'city');
  END IF;

  IF ('professional_name' = ANY(_completed)) AND ('city' = ANY(_completed)) THEN
    _sec_personal := true;
  END IF;

  -- 2. Bar Council Credentials (25 points)
  IF _lp.bar_council_number IS NOT NULL AND length(trim(_lp.bar_council_number)) >= 3 THEN
    _score := _score + 10;
    _completed := array_append(_completed, 'bar_council_number');
  ELSE
    _missing := array_append(_missing, 'bar_council_number');
  END IF;

  IF _lp.bar_council_state IS NOT NULL AND length(trim(_lp.bar_council_state)) >= 3 THEN
    _score := _score + 10;
    _completed := array_append(_completed, 'bar_council_state');
  ELSE
    _missing := array_append(_missing, 'bar_council_state');
  END IF;

  IF _lp.bar_council_enrollment_year IS NOT NULL AND _lp.bar_council_enrollment_year >= 1950 THEN
    _score := _score + 5;
    _completed := array_append(_completed, 'bar_council_enrollment_year');
  ELSE
    _missing := array_append(_missing, 'bar_council_enrollment_year');
  END IF;

  IF ('bar_council_number' = ANY(_completed)) AND ('bar_council_state' = ANY(_completed)) AND ('bar_council_enrollment_year' = ANY(_completed)) THEN
    _sec_bar := true;
  END IF;

  -- 3. Practice, Courts & Bio (25 points)
  IF _lp.practice_areas IS NOT NULL AND array_length(_lp.practice_areas, 1) >= 1 THEN
    _score := _score + 10;
    _completed := array_append(_completed, 'practice_areas');
  ELSE
    _missing := array_append(_missing, 'practice_areas');
  END IF;

  IF _lp.languages IS NOT NULL AND array_length(_lp.languages, 1) >= 1 THEN
    _score := _score + 5;
    _completed := array_append(_completed, 'languages');
  ELSE
    _missing := array_append(_missing, 'languages');
  END IF;

  IF _lp.bio IS NOT NULL AND length(trim(_lp.bio)) >= 30 THEN
    _score := _score + 5;
    _completed := array_append(_completed, 'bio');
  ELSE
    _missing := array_append(_missing, 'bio');
  END IF;

  IF _lp.courts_of_practice IS NOT NULL AND array_length(_lp.courts_of_practice, 1) >= 1 THEN
    _score := _score + 5;
    _completed := array_append(_completed, 'courts_of_practice');
  ELSE
    _missing := array_append(_missing, 'courts_of_practice');
  END IF;

  IF ('practice_areas' = ANY(_completed)) AND ('languages' = ANY(_completed)) THEN
    _sec_practice := true;
  END IF;

  -- 4. Education (15 points)
  IF _edu_count >= 1 THEN
    _score := _score + 15;
    _completed := array_append(_completed, 'education_history');
    _sec_education := true;
  ELSE
    _missing := array_append(_missing, 'education_history');
  END IF;

  -- 5. Supporting Documents / Certifications (15 points)
  IF _doc_count >= 1 OR _qual_count >= 1 THEN
    _score := _score + 15;
    _completed := array_append(_completed, 'supporting_documents');
    _sec_documents := true;
  ELSE
    _missing := array_append(_missing, 'supporting_documents');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'percentage', LEAST(100, _score),
    'is_published', COALESCE(_lp.is_published, false),
    'is_profile_completed', COALESCE(_lp.is_profile_completed, false),
    'verification_status', _verif_status,
    'sections', jsonb_build_object(
      'personal', _sec_personal,
      'bar_council', _sec_bar,
      'practice', _sec_practice,
      'education', _sec_education,
      'documents', _sec_documents
    ),
    'counts', jsonb_build_object(
      'education', _edu_count,
      'qualifications', _qual_count,
      'documents', _doc_count
    ),
    'completed_fields', _completed,
    'missing_fields', _missing,
    'can_submit', (_score >= 70 AND _sec_bar AND _sec_personal)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_advocate_profile_completeness(uuid) TO authenticated;


-- 7. Update client_lawyer_directory view with courts, consultation modes and fees
DROP VIEW IF EXISTS public.client_lawyer_directory CASCADE;

CREATE VIEW public.client_lawyer_directory
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
  lp.created_at,
  lp.courts_of_practice,
  lp.consultation_modes,
  lp.consultation_fee,
  lp.office_address
FROM public.lawyer_profiles lp
INNER JOIN public.lawyer_verifications lv ON lv.lawyer_id = lp.id
INNER JOIN public.profiles p ON p.id = lp.id
WHERE (
    auth.uid() IS NOT NULL
    AND (
      public.has_role(auth.uid(), 'client')
      OR public.has_role(auth.uid(), 'lawyer')
      OR public.is_admin()
    )
  )
  AND lp.is_profile_completed = true
  AND lp.is_published = true
  AND p.is_active = true
  AND lv.status IN ('approved', 'pending');

REVOKE ALL ON public.client_lawyer_directory FROM PUBLIC, anon;
GRANT SELECT ON public.client_lawyer_directory TO authenticated;


-- 8. Update public_lawyer_directory view (Rule 36 BCI compliance)
DROP VIEW IF EXISTS public.public_lawyer_directory CASCADE;

CREATE VIEW public.public_lawyer_directory AS
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
  lp.created_at,
  lp.courts_of_practice,
  lp.consultation_modes,
  lp.consultation_fee
FROM public.lawyer_profiles lp
INNER JOIN public.lawyer_verifications lv ON lv.lawyer_id = lp.id
INNER JOIN public.profiles p ON p.id = lp.id
WHERE lv.status = 'approved'
  AND lp.is_published = true
  AND lp.is_profile_completed = true
  AND p.is_active = true;

GRANT SELECT ON public.public_lawyer_directory TO anon, authenticated;
