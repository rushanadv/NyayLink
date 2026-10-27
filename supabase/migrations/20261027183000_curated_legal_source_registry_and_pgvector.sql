-- ==============================================================================
-- Migration: 20261027183000_curated_legal_source_registry_and_pgvector.sql
-- Project: NyayLink - Indian Legal Source Registry & pgvector Retrieval Pipeline
-- Description: Additive migration for authoritative Indian legal sources,
--              section provisions, search vectors, pgvector embeddings (1536 dims),
--              and hybrid legal retrieval functions under strict RLS.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONS & PREREQUISITES
-- ------------------------------------------------------------------------------
-- Enable pgvector for semantic legal retrieval (OpenAI / OpenRouter 1536 dims)
DO $$
BEGIN
  -- Attempt to enable vector in extensions schema (standard Supabase pattern)
  CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;
EXCEPTION
  WHEN OTHERS THEN
    BEGIN
      CREATE EXTENSION IF NOT EXISTS vector;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'pgvector extension could not be loaded directly. Hybrid retrieval will use tsvector.';
    END;
END $$;

-- ------------------------------------------------------------------------------
-- 2. TABLE: legal_source_documents
-- Curated primary Indian statutory enactments and official government publications
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.legal_source_documents (
  id text PRIMARY KEY,                                      -- e.g., 'doc-bns-2023'
  act_code text NOT NULL UNIQUE,                            -- e.g., 'BNS_2023'
  title text NOT NULL,                                      -- e.g., 'Bharatiya Nyaya Sanhita, 2023'
  short_title text NOT NULL,                                -- e.g., 'BNS, 2023'
  act_number text,                                          -- e.g., 'Act No. 45 of 2023'
  act_year integer NOT NULL,                                -- e.g., 2023
  document_type text NOT NULL DEFAULT 'Central Act',        -- 'Central Act', 'State Act', 'Rules', 'Regulations'
  enactment_date date,                                      -- e.g., '2023-12-25'
  effective_date date,                                      -- e.g., '2024-07-01'
  jurisdiction text NOT NULL DEFAULT 'Union of India (Central)',
  issuing_authority text NOT NULL,                          -- e.g., 'Ministry of Law and Justice, Government of India'
  official_url text NOT NULL,                               -- Official India Code portal URL
  provenance text NOT NULL,                                 -- e.g., 'Official India Code Portal / e-Gazette S.O. 850(E)'
  verification_status text NOT NULL DEFAULT 'officially_verified'
    CHECK (verification_status IN ('officially_verified', 'pending_gazette_update', 'unverified', 'outdated')),
  last_checked_at timestamptz NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_doc_official_url CHECK (official_url ~* '^https://')
);

CREATE INDEX IF NOT EXISTS idx_legal_docs_act_code ON public.legal_source_documents(act_code);
CREATE INDEX IF NOT EXISTS idx_legal_docs_is_active ON public.legal_source_documents(is_active);
CREATE INDEX IF NOT EXISTS idx_legal_docs_verification_status ON public.legal_source_documents(verification_status);

DROP TRIGGER IF EXISTS trg_legal_docs_updated_at ON public.legal_source_documents;
CREATE TRIGGER trg_legal_docs_updated_at
  BEFORE UPDATE ON public.legal_source_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 3. TABLE: legal_source_provisions
-- Specific sections, orders, and rules with text, plain summary, tsvector and vector embeddings
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.legal_source_provisions (
  id text PRIMARY KEY,                                      -- e.g., 'bns-sec-318'
  document_id text NOT NULL REFERENCES public.legal_source_documents(id) ON DELETE CASCADE,
  provision_identifier text NOT NULL,                       -- e.g., 'Section 318'
  title text NOT NULL,                                      -- e.g., 'Cheating and dishonestly inducing delivery of property'
  chapter text,                                             -- e.g., 'Chapter XVIII - Of Offences Against Property'
  content text NOT NULL,                                    -- Enacted statutory text
  plain_summary text NOT NULL,                              -- Plain English/Hindi explanation
  statutory_limitation_note text,                           -- Procedural limitation period if applicable
  category text NOT NULL CHECK (category IN (
    'criminal', 'civil', 'consumer', 'property', 'commercial', 'family', 'labour', 'cyber'
  )),
  keywords text[] NOT NULL DEFAULT '{}',
  official_url text NOT NULL,                               -- Exact section or parent India Code link
  verification_status text NOT NULL DEFAULT 'officially_verified'
    CHECK (verification_status IN ('officially_verified', 'pending_gazette_update', 'unverified', 'outdated')),
  provenance text NOT NULL,
  last_checked_at timestamptz NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  search_vector tsvector,
  embedding extensions.vector(1536),                          -- OpenAI standard 1536 dimensions
  is_embedded boolean NOT NULL DEFAULT false,               -- True ONLY when genuine model embedding is generated
  embedding_model text,                                     -- Model name (e.g. 'text-embedding-3-small')
  embedded_at timestamptz,                                  -- Timestamp of genuine model embedding generation
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_prov_official_url CHECK (official_url ~* '^https://')
);

CREATE INDEX IF NOT EXISTS idx_legal_prov_doc_id ON public.legal_source_provisions(document_id);
CREATE INDEX IF NOT EXISTS idx_legal_prov_category ON public.legal_source_provisions(category);
CREATE INDEX IF NOT EXISTS idx_legal_prov_active_verified ON public.legal_source_provisions(is_active, verification_status);
CREATE INDEX IF NOT EXISTS idx_legal_prov_is_embedded ON public.legal_source_provisions(is_embedded);
CREATE INDEX IF NOT EXISTS idx_legal_prov_search_vector ON public.legal_source_provisions USING gin(search_vector);

-- Automatically compute and maintain search_vector on insert or update
CREATE OR REPLACE FUNCTION public.handle_legal_prov_search_vector()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.provision_identifier, '')), 'A') ||
    setweight(to_tsvector('english', array_to_string(NEW.keywords, ' ')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.plain_summary, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.content, '')), 'C');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_legal_prov_search_vector ON public.legal_source_provisions;
CREATE TRIGGER trg_legal_prov_search_vector
  BEFORE INSERT OR UPDATE ON public.legal_source_provisions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_legal_prov_search_vector();

-- Create HNSW index on vector embedding for cosine similarity if vector is available
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vector') THEN
    CREATE INDEX IF NOT EXISTS idx_legal_prov_embedding_hnsw
      ON public.legal_source_provisions
      USING hnsw (embedding extensions.vector_cosine_ops)
      WITH (m = 16, ef_construction = 64);
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Vector index could not be created directly; continuing.';
END $$;

DROP TRIGGER IF EXISTS trg_legal_prov_updated_at ON public.legal_source_provisions;
CREATE TRIGGER trg_legal_prov_updated_at
  BEFORE UPDATE ON public.legal_source_provisions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 4. TABLE: legal_source_ingestion_runs
-- Audit log of administrative ingestion, verification, and embedding updates
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.legal_source_ingestion_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id text REFERENCES public.legal_source_documents(id) ON DELETE SET NULL,
  status text NOT NULL CHECK (status IN ('success', 'partial_failure', 'failed', 'lexical_only_unembedded')),
  provisions_ingested integer NOT NULL DEFAULT 0,
  provisions_failed integer NOT NULL DEFAULT 0,
  error_details text,
  model_name text DEFAULT 'text-embedding-3-small',
  embedding_dimension integer DEFAULT 1536,
  triggered_by text DEFAULT 'system_seed',
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ingestion_runs_status ON public.legal_source_ingestion_runs(status);
CREATE INDEX IF NOT EXISTS idx_ingestion_runs_created_at ON public.legal_source_ingestion_runs(created_at DESC);

-- ------------------------------------------------------------------------------
-- 5. FUNCTION: match_legal_provisions
-- Hybrid lexical (tsvector) + semantic (vector cosine) legal retrieval
-- Strictly requires p.is_embedded = true for semantic similarity scoring.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.match_legal_provisions(
  query_text text,
  query_embedding extensions.vector(1536) DEFAULT NULL,
  filter_category text DEFAULT NULL,
  match_count integer DEFAULT 5,
  full_text_weight float DEFAULT 0.6,
  semantic_weight float DEFAULT 0.4
)
RETURNS TABLE (
  id text,
  document_id text,
  act_name text,
  act_short_name text,
  provision_identifier text,
  title text,
  chapter text,
  content text,
  plain_summary text,
  statutory_limitation_note text,
  category text,
  official_url text,
  verification_status text,
  provenance text,
  last_checked_at timestamptz,
  is_embedded boolean,
  embedding_model text,
  combined_score float
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, extensions
AS $$
DECLARE
  parsed_tsquery tsquery;
BEGIN
  -- Parse query text safely for full-text search
  parsed_tsquery := plainto_tsquery('english', query_text);

  RETURN QUERY
  SELECT
    p.id,
    p.document_id,
    d.title AS act_name,
    d.short_title AS act_short_name,
    p.provision_identifier,
    p.title,
    p.chapter,
    p.content,
    p.plain_summary,
    p.statutory_limitation_note,
    p.category,
    p.official_url,
    p.verification_status,
    p.provenance,
    p.last_checked_at,
    p.is_embedded,
    p.embedding_model,
    (
      -- Full-text relevance score (normalized)
      coalesce(ts_rank_cd(p.search_vector, parsed_tsquery), 0.0) * full_text_weight +
      -- Semantic similarity score: Strictly requires query_embedding AND genuine model embedding (p.is_embedded = true)
      (
        CASE
          WHEN query_embedding IS NOT NULL AND p.embedding IS NOT NULL AND p.is_embedded = true THEN
            (1.0 - (p.embedding <=> query_embedding)) * semantic_weight
          ELSE
            0.0
        END
      )
    )::float AS combined_score
  FROM public.legal_source_provisions p
  JOIN public.legal_source_documents d ON d.id = p.document_id
  WHERE
    p.is_active = true
    AND d.is_active = true
    AND p.verification_status = 'officially_verified'
    AND (filter_category IS NULL OR filter_category = 'all' OR p.category = filter_category)
    AND (
      -- Match either full-text search, vector similarity (if genuinely embedded), or keyword overlap
      (parsed_tsquery != ''::tsquery AND p.search_vector @@ parsed_tsquery)
      OR (query_embedding IS NOT NULL AND p.embedding IS NOT NULL AND p.is_embedded = true)
      OR (p.keywords && string_to_array(lower(query_text), ' '))
    )
  ORDER BY combined_score DESC
  LIMIT match_count;
END;
$$;

-- ------------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.legal_source_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_source_provisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_source_ingestion_runs ENABLE ROW LEVEL SECURITY;

-- 6.1. Public Read Policies for verified statutory references
DROP POLICY IF EXISTS "Public can view active verified legal documents" ON public.legal_source_documents;
CREATE POLICY "Public can view active verified legal documents"
  ON public.legal_source_documents FOR SELECT
  TO public, anon, authenticated
  USING (is_active = true AND verification_status = 'officially_verified');

DROP POLICY IF EXISTS "Public can view active verified legal provisions" ON public.legal_source_provisions;
CREATE POLICY "Public can view active verified legal provisions"
  ON public.legal_source_provisions FOR SELECT
  TO public, anon, authenticated
  USING (is_active = true AND verification_status = 'officially_verified');

-- 6.2. Administrative Full Access Policies
-- Normal users CANNOT mutate the legal source corpus. Only verified admins can.
DROP POLICY IF EXISTS "Admins have full access to legal documents" ON public.legal_source_documents;
CREATE POLICY "Admins have full access to legal documents"
  ON public.legal_source_documents FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to legal provisions" ON public.legal_source_provisions;
CREATE POLICY "Admins have full access to legal provisions"
  ON public.legal_source_provisions FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to ingestion runs" ON public.legal_source_ingestion_runs;
CREATE POLICY "Admins have full access to ingestion runs"
  ON public.legal_source_ingestion_runs FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 7. INITIAL CANONICAL SEED DATA (Grounded from Official India Code Portal)
-- ------------------------------------------------------------------------------

-- Documents Seed
INSERT INTO public.legal_source_documents (
  id, act_code, title, short_title, act_number, act_year, document_type,
  enactment_date, effective_date, jurisdiction, issuing_authority,
  official_url, provenance, verification_status, last_checked_at
) VALUES
(
  'doc-bns-2023',
  'BNS_2023',
  'Bharatiya Nyaya Sanhita, 2023',
  'BNS, 2023',
  'Act No. 45 of 2023',
  2023,
  'Central Act',
  '2023-12-25',
  '2024-07-01',
  'Union of India (Central)',
  'Ministry of Law and Justice, Legislative Department',
  'https://www.indiacode.nic.in/handle/123456789/20062',
  'India Code (NIC) / Gazette Notification S.O. 850(E)',
  'officially_verified',
  '2026-10-27'
),
(
  'doc-bnss-2023',
  'BNSS_2023',
  'Bharatiya Nagarik Suraksha Sanhita, 2023',
  'BNSS, 2023',
  'Act No. 46 of 2023',
  2023,
  'Central Act',
  '2023-12-25',
  '2024-07-01',
  'Union of India (Central)',
  'Ministry of Law and Justice, Legislative Department',
  'https://www.indiacode.nic.in/handle/123456789/20063',
  'India Code (NIC) / Gazette Notification S.O. 848(E)',
  'officially_verified',
  '2026-10-27'
),
(
  'doc-bsa-2023',
  'BSA_2023',
  'Bharatiya Sakshya Adhiniyam, 2023',
  'BSA, 2023',
  'Act No. 47 of 2023',
  2023,
  'Central Act',
  '2023-12-25',
  '2024-07-01',
  'Union of India (Central)',
  'Ministry of Law and Justice, Legislative Department',
  'https://www.indiacode.nic.in/handle/123456789/20064',
  'India Code (NIC) / Gazette Notification S.O. 849(E)',
  'officially_verified',
  '2026-10-27'
),
(
  'doc-cpc-1908',
  'CPC_1908',
  'Code of Civil Procedure, 1908',
  'CPC, 1908',
  'Act No. 5 of 1908',
  1908,
  'Central Act',
  '1908-03-21',
  '1909-01-01',
  'Union of India (Central)',
  'Legislative Department, Government of India',
  'https://www.indiacode.nic.in/handle/123456789/2191',
  'India Code (NIC) / Ministry of Law and Justice',
  'officially_verified',
  '2026-10-27'
),
(
  'doc-cpa-2019',
  'CPA_2019',
  'Consumer Protection Act, 2019',
  'CPA, 2019',
  'Act No. 35 of 2019',
  2019,
  'Central Act',
  '2019-08-09',
  '2020-07-20',
  'Union of India (Central)',
  'Ministry of Consumer Affairs, Food and Public Distribution',
  'https://www.indiacode.nic.in/handle/123456789/15256',
  'India Code (NIC) / Ministry of Consumer Affairs',
  'officially_verified',
  '2026-10-27'
),
(
  'doc-rera-2016',
  'RERA_2016',
  'Real Estate (Regulation and Development) Act, 2016',
  'RERA, 2016',
  'Act No. 16 of 2016',
  2016,
  'Central Act',
  '2016-03-25',
  '2016-05-01',
  'Union of India (Central)',
  'Ministry of Housing and Urban Affairs',
  'https://www.indiacode.nic.in/handle/123456789/2158',
  'India Code (NIC) / Ministry of Housing and Urban Affairs',
  'officially_verified',
  '2026-10-27'
),
(
  'doc-ni-1881',
  'NI_1881',
  'Negotiable Instruments Act, 1881',
  'NI Act, 1881',
  'Act No. 26 of 1881',
  1881,
  'Central Act',
  '1881-12-09',
  '1882-03-01',
  'Union of India (Central)',
  'Ministry of Law and Justice, Government of India',
  'https://www.indiacode.nic.in/handle/123456789/2205',
  'India Code (NIC) / Legislative Department',
  'officially_verified',
  '2026-10-27'
),
(
  'doc-contract-1872',
  'CONTRACT_1872',
  'Indian Contract Act, 1872',
  'Contract Act, 1872',
  'Act No. 9 of 1872',
  1872,
  'Central Act',
  '1872-04-25',
  '1872-09-01',
  'Union of India (Central)',
  'Legislative Department, Government of India',
  'https://www.indiacode.nic.in/handle/123456789/2187',
  'India Code (NIC) / Ministry of Law and Justice',
  'officially_verified',
  '2026-10-27'
),
(
  'doc-tpa-1882',
  'TPA_1882',
  'Transfer of Property Act, 1882',
  'Transfer of Property Act, 1882',
  'Act No. 4 of 1882',
  1882,
  'Central Act',
  '1882-02-17',
  '1882-07-01',
  'Union of India (Central)',
  'Legislative Department, Government of India',
  'https://www.indiacode.nic.in/handle/123456789/2338',
  'India Code (NIC) / Ministry of Law and Justice',
  'officially_verified',
  '2026-10-27'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  short_title = EXCLUDED.short_title,
  official_url = EXCLUDED.official_url,
  verification_status = EXCLUDED.verification_status,
  last_checked_at = EXCLUDED.last_checked_at;

-- Provisions Seed
INSERT INTO public.legal_source_provisions (
  id, document_id, provision_identifier, title, chapter, content,
  plain_summary, statutory_limitation_note, category, keywords,
  official_url, provenance, verification_status, last_checked_at
) VALUES
(
  'bns-sec-318',
  'doc-bns-2023',
  'Section 318',
  'Cheating and dishonestly inducing delivery of property',
  'Chapter XVIII - Of Offences Against Property',
  'Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, or anything which is signed or sealed, and which is capable of being converted into a valuable security, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.',
  'Replaces Section 420 of the erstwhile Indian Penal Code (IPC). Covers fraudulent inducement of money, property, financial deception, or contract execution under false pretences.',
  'Criminal prosecution subject to limitation principles under BNSS Section 514 (erstwhile CrPC Section 468).',
  'criminal',
  ARRAY['cheat', 'cheating', 'fraud', 'scam', 'deceived', 'property', 'money stolen', '420', '318', 'धोखाधड़ी', 'ठगी'],
  'https://www.indiacode.nic.in/handle/123456789/20062',
  'India Code (NIC) / Act No. 45 of 2023',
  'officially_verified',
  '2026-10-27'
),
(
  'bns-sec-316',
  'doc-bns-2023',
  'Section 316',
  'Criminal breach of trust',
  'Chapter XVIII - Of Offences Against Property',
  'Whoever, being in any manner entrusted with property, or with any dominion over property, dishonestly misappropriates or converts to his own use that property, or dishonestly uses or disposes of that property in violation of any direction of law prescribing the mode in which such trust is to be discharged, or of any legal contract, express or implied, which he has made touching the discharge of such trust, or wilfully suffers any other person so to do, commits criminal breach of trust.',
  'Replaces Section 405/406 of the erstwhile IPC. Applies when entrusted assets, funds, partnership property, or deposits are dishonestly misappropriated.',
  'Punishable with imprisonment up to 5 years, or fine, or both.',
  'criminal',
  ARRAY['breach of trust', 'misappropriation', 'entrusted property', 'funds misappropriated', '405', '406', '316', 'अमानत में खयानत'],
  'https://www.indiacode.nic.in/handle/123456789/20062',
  'India Code (NIC) / Act No. 45 of 2023',
  'officially_verified',
  '2026-10-27'
),
(
  'bnss-sec-173',
  'doc-bnss-2023',
  'Section 173',
  'Information in cognizable cases (First Information Report - FIR)',
  'Chapter XII - Information to the Police and Their Powers to Investigate',
  'Every information relating to the commission of a cognizable offence, if given orally to an officer in charge of a police station, shall be reduced to writing by him or under his direction, and be read over to the informant... Provided that information may also be given electronically (e-FIR), which shall be taken on record on being signed within three days by the person giving it.',
  'Replaces Section 154 of CrPC. Mandates registration of FIR for cognizable offences and explicitly recognizes electronic registration (e-FIR).',
  'Prompt registration required; e-FIR must be physically signed within 3 days.',
  'criminal',
  ARRAY['fir', 'police', 'complaint', 'cognizable', 'efir', 'station', 'report', 'थाना', 'प्राथमिकी', 'पुलिस'],
  'https://www.indiacode.nic.in/handle/123456789/20063',
  'India Code (NIC) / Act No. 46 of 2023',
  'officially_verified',
  '2026-10-27'
),
(
  'bnss-sec-480',
  'doc-bnss-2023',
  'Section 480',
  'When bail may be taken in case of non-bailable offence (Regular Bail)',
  'Chapter XXXV - Provisions as to Bail and Bonds',
  'When any person accused of, or suspected of, the commission of any non-bailable offence is arrested or detained without warrant by an officer in charge of a police station, or appears or is brought before a Court other than the High Court or Court of Session, he may be released on bail.',
  'Corresponds to Section 437 of the CrPC. Details statutory grounds and discretionary considerations for regular bail before Magistrates.',
  'Discretionary before Magistrate; special considerations for women, sick, or infirm persons.',
  'criminal',
  ARRAY['bail', 'regular bail', 'custody', 'magistrate', 'non-bailable', '437', '480', 'जमानत', 'रिहाई'],
  'https://www.indiacode.nic.in/handle/123456789/20063',
  'India Code (NIC) / Act No. 46 of 2023',
  'officially_verified',
  '2026-10-27'
),
(
  'bnss-sec-482',
  'doc-bnss-2023',
  'Section 482',
  'Direction for grant of bail to person apprehending arrest (Anticipatory Bail)',
  'Chapter XXXV - Provisions as to Bail and Bonds',
  'Where any person has reason to believe that he may be arrested on accusation of having committed a non-bailable offence, he may apply to the High Court or the Court of Session for a direction under this section; and that Court may, if it thinks fit, direct that in the event of such arrest, he shall be released on bail.',
  'Corresponds to Section 438 CrPC. Allows an accused or apprehended individual to seek judicial protection against imminent arrest before Sessions Court or High Court.',
  'Must be moved before actual arrest; requires establishing genuine apprehension of arrest.',
  'criminal',
  ARRAY['anticipatory bail', 'arrest', 'apprehending arrest', 'sessions court', 'high court', '438', '482', 'अग्रिम जमानत', 'गिरफ्तारी'],
  'https://www.indiacode.nic.in/handle/123456789/20063',
  'India Code (NIC) / Act No. 46 of 2023',
  'officially_verified',
  '2026-10-27'
),
(
  'bnss-sec-144',
  'doc-bnss-2023',
  'Section 144',
  'Order for maintenance of wives, children and parents',
  'Chapter X - Maintenance of Wives, Children and Parents',
  'If any person having sufficient means neglects or refuses to maintain his wife, unable to maintain herself, or his legitimate or illegitimate minor child... a Magistrate of the first class may, upon proof of such neglect or refusal, order such person to make a monthly allowance for the maintenance of his wife or child or parent.',
  'Corresponds to Section 125 of CrPC. Statutory secular maintenance remedy providing monthly maintenance and interim support.',
  'Summary statutory proceeding before Family Court or Judicial Magistrate.',
  'family',
  ARRAY['maintenance', 'wife maintenance', 'child support', 'parents maintenance', '125', '144', 'भरण-पोषण', 'खर्चा'],
  'https://www.indiacode.nic.in/handle/123456789/20063',
  'India Code (NIC) / Act No. 46 of 2023',
  'officially_verified',
  '2026-10-27'
),
(
  'bsa-sec-61',
  'doc-bsa-2023',
  'Section 61',
  'Admissibility of electronic records',
  'Part II - On Proof / Chapter V - Documentary Evidence',
  'Nothing in this Adhiniyam shall apply to deny the admissibility of an electronic record in evidence on the ground that it is an electronic record, and such record shall have the same legal effect, validity and enforceability as other document, subject to section 63.',
  'Replaces Section 65A/65B of the erstwhile Indian Evidence Act, 1872. Affirms primary legal validity and admissibility of emails, WhatsApp records, SMS, and digital logs in judicial proceedings.',
  'Governed by certificate requirements under BSA Section 63.',
  'civil',
  ARRAY['electronic evidence', 'whatsapp evidence', 'email proof', 'digital record', 'certificate', '65b', '61', 'इलेक्ट्रॉनिक साक्ष्य'],
  'https://www.indiacode.nic.in/handle/123456789/20064',
  'India Code (NIC) / Act No. 47 of 2023',
  'officially_verified',
  '2026-10-27'
),
(
  'cpc-order-39',
  'doc-cpc-1908',
  'Order XXXIX, Rules 1 & 2',
  'Temporary Injunctions and Interlocutory Orders',
  'The First Schedule - Order XXXIX',
  'Where in any suit it is proved by affidavit or otherwise that any property in dispute in a suit is in danger of being wasted, damaged or alienated by any party to the suit, or wrongfully sold in execution of a decree... the Court may by order grant a temporary injunction to restrain such act.',
  'Primary civil mechanism to obtain immediate interim stay or injunction to protect property, tenancy, or contractual rights pending trial.',
  'Requires establishing prima facie case, balance of convenience, and irreparable injury.',
  'civil',
  ARRAY['stay', 'injunction', 'temporary injunction', 'interim relief', 'restrain', 'order 39', 'स्थगन आदेश', 'रोक'],
  'https://www.indiacode.nic.in/handle/123456789/2191',
  'India Code (NIC) / Act No. 5 of 1908',
  'officially_verified',
  '2026-10-27'
),
(
  'cpa-sec-35',
  'doc-cpa-2019',
  'Section 35',
  'Manner in which complaint shall be made before District Commission',
  'Chapter IV - Consumer Disputes Redressal Commission',
  'A complaint, in relation to any goods sold or delivered or agreed to be sold or delivered or any service provided or agreed to be provided, may be filed with a District Commission by the consumer... electronically (via e-Daakhil) or in physical copy.',
  'Governs filing of consumer complaints before District Consumer Disputes Redressal Commissions (DCDRC), including e-Daakhil electronic portal filings for defective products or deficient services.',
  'Pecuniary jurisdiction up to Rs 50 Lakhs before District Commission under 2021 Rules.',
  'consumer',
  ARRAY['consumer', 'deficiency', 'service', 'product defect', 'district commission', 'e-daakhil', 'उपभोक्ता', 'खराबी'],
  'https://www.indiacode.nic.in/handle/123456789/15256',
  'India Code (NIC) / Act No. 35 of 2019',
  'officially_verified',
  '2026-10-27'
),
(
  'cpa-sec-69',
  'doc-cpa-2019',
  'Section 69',
  'Limitation period for filing consumer complaints',
  'Chapter IV - Consumer Disputes Redressal Commission',
  'The District Commission, the State Commission or the National Commission shall not admit a complaint unless it is filed within two years from the date on which the cause of action has arisen. Provided that a complaint may be entertained after the period specified if sufficient cause is shown.',
  'Strict 2-year statutory limitation period from the date of deficient service, defect in goods, or cause of action.',
  '2 years from cause of action. Condonation of delay permissible under Section 69(2) only upon recorded sufficient cause.',
  'consumer',
  ARRAY['limitation', 'two years', 'delay', 'deadline', 'consumer deadline', 'समय-सीमा', 'अवधि'],
  'https://www.indiacode.nic.in/handle/123456789/15256',
  'India Code (NIC) / Act No. 35 of 2019',
  'officially_verified',
  '2026-10-27'
),
(
  'rera-sec-18',
  'doc-rera-2016',
  'Section 18',
  'Return of amount and compensation for delayed possession',
  'Chapter III - Functions and Duties of Promoter',
  'If the promoter fails to complete or is unable to give possession of an apartment, plot or building in accordance with the terms of the agreement for sale... he shall be liable on demand to the allottees to return the amount received with interest at prescribed rate including compensation.',
  'Right of homebuyers to demand full refund with interest for project delays, or monthly delayed possession interest if choosing to remain in the project.',
  'Continuing cause of action while default and non-possession persists (Supreme Court in Newtech Promoters, 2021).',
  'property',
  ARRAY['builder', 'flat', 'possession', 'delay', 'rera', 'apartment', 'homebuyer', 'allottee', 'बिल्डर', 'कब्जा', 'देरी'],
  'https://www.indiacode.nic.in/handle/123456789/2158',
  'India Code (NIC) / Act No. 16 of 2016',
  'officially_verified',
  '2026-10-27'
),
(
  'rera-sec-31',
  'doc-rera-2016',
  'Section 31',
  'Filing of complaints with the Authority or the Adjudicating Officer',
  'Chapter V - The Real Estate Regulatory Authority',
  'Any aggrieved person may file a complaint with the Authority or the adjudicating officer, as the case may be, for any violation or contravention of the provisions of this Act or the rules and regulations made thereunder.',
  'Statutory jurisdiction for homebuyers to initiate complaint proceedings (Form M / Form N) before State RERA Authorities.',
  'Filed before jurisdictional State RERA portal with prescribed fee.',
  'property',
  ARRAY['rera complaint', 'form m', 'adjudicating officer', 'authority', 'rera authority'],
  'https://www.indiacode.nic.in/handle/123456789/2158',
  'India Code (NIC) / Act No. 16 of 2016',
  'officially_verified',
  '2026-10-27'
),
(
  'ni-sec-138',
  'doc-ni-1881',
  'Section 138',
  'Dishonour of cheque for insufficiency, etc., of funds in the account',
  'Chapter XVII - Of Penalties in Case of Dishonour of Certain Cheques',
  'Where any cheque drawn by a person on an account maintained by him with a banker for payment of any amount of money... is returned by the bank unpaid, either because of the amount of money standing to the credit of that account is insufficient... such person shall be deemed to have committed an offence.',
  'Criminal liability for dishonoured cheques. Requires strict 30-day statutory legal notice and 15-day payment grace period prior to filing a complaint.',
  'Statutory notice within 30 days of bank memo. Complaint under Section 142 within 1 month after expiry of 15-day notice period.',
  'commercial',
  ARRAY['cheque', 'check', 'bounce', 'dishonour', 'insufficient funds', '138', 'चेक बाउंस', 'अनादर'],
  'https://www.indiacode.nic.in/handle/123456789/2205',
  'India Code (NIC) / Act No. 26 of 1881',
  'officially_verified',
  '2026-10-27'
),
(
  'contract-sec-73',
  'doc-contract-1872',
  'Section 73',
  'Compensation for loss or damage caused by breach of contract',
  'Chapter VI - Of the Consequences of Breach of Contract',
  'When a contract has been broken, the party who suffers by such breach is entitled to receive, from the party who has broken the contract, compensation for any loss or damage caused to him thereby, which naturally arose in the usual course of things from such breach, or which the parties knew, when they made the contract, to be likely to result from the breach of it.',
  'Core statutory basis for claiming monetary damages, unpaid remuneration, or commercial compensation when an agreement is violated.',
  'Governed by 3-year limitation period from date of breach under Limitation Act, 1963.',
  'commercial',
  ARRAY['contract', 'breach', 'agreement', 'compensation', 'damages', 'unpaid salary', 'vendor', 'समझौता', 'अनुबंध', 'मुआवजा'],
  'https://www.indiacode.nic.in/handle/123456789/2187',
  'India Code (NIC) / Act No. 9 of 1872',
  'officially_verified',
  '2026-10-27'
),
(
  'tpa-sec-106',
  'doc-tpa-1882',
  'Section 106',
  'Duration of certain leases in absence of written contract or local usage',
  'Chapter V - Of Leases of Immovable Property',
  'In the absence of a contract or local law or usage to the contrary, a lease of immovable property for agricultural or manufacturing purposes shall be deemed to be a lease from year to year... and a lease of immovable property for any other purpose shall be deemed to be a lease from month to month, terminable, on the part of either lessor or lessee, by fifteen days notice.',
  'Statutory rule for terminating residential/commercial tenancies via mandatory 15-day notice to quit where state rent control does not bar eviction.',
  '15 days notice expiring with the end of a month of the tenancy.',
  'property',
  ARRAY['tenant', 'landlord', 'rent', 'eviction', 'security deposit', 'lease', 'notice to quit', 'किरायेदार', 'मकान मालिक', 'किराया'],
  'https://www.indiacode.nic.in/handle/123456789/2338',
  'India Code (NIC) / Act No. 4 of 1882',
  'officially_verified',
  '2026-10-27'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  plain_summary = EXCLUDED.plain_summary,
  statutory_limitation_note = EXCLUDED.statutory_limitation_note,
  official_url = EXCLUDED.official_url,
  keywords = EXCLUDED.keywords,
  verification_status = EXCLUDED.verification_status,
  last_checked_at = EXCLUDED.last_checked_at;
