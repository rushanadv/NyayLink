/**
 * NyayLink - Comprehensive SQL Migration & Safety Auditor
 *
 * Validates:
 * 1. Schema compatibility (additive-only, non-destructive, no DROP TABLE)
 * 2. pgvector syntax, dimensions (1536), extension schema and search_path
 * 3. Table definitions & column types
 * 4. GIN tsvector generated column & HNSW cosine index
 * 5. Idempotent seed operations (ON CONFLICT clauses)
 * 6. Row Level Security policies (public read-only, admin-only mutation)
 * 7. Privacy boundary (no user/client data in legal source tables)
 * 8. Authoritative provenance & official URL validation
 */

const fs = require("fs");
const path = require("path");
const assert = require("assert");

console.log("======================================================================");
console.log(">>> NYAYLINK SQL MIGRATION & SAFETY AUDIT SUITE <<<");
console.log("======================================================================\n");

let passed = 0;
let failed = 0;

function it(desc, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ [PASS] ${desc}`);
  } catch (err) {
    failed++;
    console.error(`  ❌ [FAIL] ${desc}: ${err.message}`);
  }
}

const migrationPath = path.join(
  __dirname,
  "../supabase/migrations/20261027183000_curated_legal_source_registry_and_pgvector.sql"
);

assert.ok(fs.existsSync(migrationPath), `Migration file must exist at ${migrationPath}`);
const sql = fs.readFileSync(migrationPath, "utf8");

// ----------------------------------------------------------------------------
// 1. NON-DESTRUCTIVE & ADDITIVE SAFETY CHECKS
// ----------------------------------------------------------------------------
console.log("[Audit 1] Verifying additive, non-destructive safety guarantees...");

it("Does NOT drop any existing tables or schemas", () => {
  const destructiveDrop = /DROP\s+TABLE\s+(?!IF\s+EXISTS\s+(temporary|scratch))\b/i;
  assert.ok(!destructiveDrop.test(sql), "Migration must not contain destructive DROP TABLE statements");
  assert.ok(!/DROP\s+SCHEMA\b/i.test(sql), "Migration must not drop any schema");
  assert.ok(!/TRUNCATE\b/i.test(sql), "Migration must not truncate any tables");
});

it("Uses IF NOT EXISTS for all table creations", () => {
  const createTableMatches = [...sql.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([^\s(]+)/gi)];
  assert.ok(createTableMatches.length >= 3, "Expected at least 3 CREATE TABLE statements");
  for (const match of createTableMatches) {
    assert.ok(
      match[0].toUpperCase().includes("IF NOT EXISTS"),
      `CREATE TABLE statement '${match[0]}' must use IF NOT EXISTS`
    );
  }
});

// ----------------------------------------------------------------------------
// 2. PGVECTOR EXTENSION & SCHEMA CONVENTIONS
// ----------------------------------------------------------------------------
console.log("\n[Audit 2] Verifying pgvector extension, dimensions & search_path...");

it("Configures pgvector with Supabase 'extensions' schema compatibility", () => {
  assert.ok(
    sql.includes("CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions") ||
    sql.includes("CREATE EXTENSION IF NOT EXISTS vector"),
    "Must create vector extension safely"
  );
});

it("Specifies exact vector dimension 1536 matching text-embedding-3-small", () => {
  assert.ok(
    sql.includes("embedding extensions.vector(1536)") || sql.includes("embedding vector(1536)"),
    "Embedding column must be extensions.vector(1536) or vector(1536)"
  );
  assert.ok(
    sql.includes("query_embedding extensions.vector(1536)") || sql.includes("query_embedding vector(1536)"),
    "Function parameter must be extensions.vector(1536) or vector(1536)"
  );
});

it("Includes is_embedded boolean indicator to exclude placeholder vectors", () => {
  assert.ok(sql.includes("is_embedded boolean NOT NULL DEFAULT false"), "Must include is_embedded column");
  assert.ok(sql.includes("idx_legal_prov_is_embedded"), "Must index is_embedded");
  assert.ok(
    sql.includes("p.is_embedded = true"),
    "match_legal_provisions must strictly require p.is_embedded = true for semantic distance"
  );
});

it("View migration 20261027120000 uses safe RESTRICT instead of destructive CASCADE", () => {
  const viewMigrationPath = path.join(
    __dirname,
    "../supabase/migrations/20261027120000_separate_verified_and_under_review_directories.sql"
  );
  assert.ok(fs.existsSync(viewMigrationPath), "View migration file must exist");
  const viewSql = fs.readFileSync(viewMigrationPath, "utf8");
  // Strip comments before analyzing DDL statements
  const codeOnly = viewSql.replace(/--.*$/gm, "");
  assert.ok(!/DROP\s+VIEW[^\n;]+CASCADE/i.test(codeOnly), "Must not use DROP VIEW ... CASCADE in DDL");
  assert.ok(/DROP\s+VIEW[^\n;]+RESTRICT/i.test(codeOnly), "Must use safe DROP VIEW ... RESTRICT");
});

it("Pins match_legal_provisions search_path to pg_catalog, public, extensions", () => {
  assert.ok(
    sql.includes("SET search_path = pg_catalog, public, extensions"),
    "match_legal_provisions must include 'extensions' in search_path to resolve vector operators"
  );
});

it("Creates HNSW cosine similarity index (vector_cosine_ops)", () => {
  assert.ok(
    sql.includes("USING hnsw (embedding extensions.vector_cosine_ops)") ||
    sql.includes("USING hnsw (embedding vector_cosine_ops)"),
    "Must use HNSW index with vector_cosine_ops"
  );
});

it("Creates GIN index on search_vector generated column", () => {
  assert.ok(sql.includes("USING gin(search_vector)"), "Must use GIN index on search_vector");
});

// ----------------------------------------------------------------------------
// 3. IDEMPOTENT SEED OPERATIONS
// ----------------------------------------------------------------------------
console.log("\n[Audit 3] Verifying seed operations idempotency & repeatable execution...");

it("Documents seed uses ON CONFLICT (id) DO UPDATE", () => {
  assert.ok(
    sql.includes("ON CONFLICT (id) DO UPDATE SET"),
    "Seeds must handle conflicts idempotently on primary key id"
  );
});

it("Every seeded document contains a valid HTTPS official URL", () => {
  const docUrls = [...sql.matchAll(/https:\/\/www\.indiacode\.nic\.in[^\s',)]+/g)].map((m) => m[0]);
  assert.ok(docUrls.length >= 9, "Expected at least 9 official India Code URLs");
  for (const url of docUrls) {
    assert.ok(url.startsWith("https://"), `URL ${url} must use HTTPS`);
    assert.ok(url.includes("indiacode.nic.in"), `URL ${url} must belong to indiacode.nic.in`);
  }
});

// ----------------------------------------------------------------------------
// 4. ROW LEVEL SECURITY & PRIVACY SEPARATION
// ----------------------------------------------------------------------------
console.log("\n[Audit 4] Verifying Row Level Security (RLS) & Privacy Boundary...");

it("Enables Row Level Security on all 3 created tables", () => {
  assert.ok(sql.includes("ALTER TABLE public.legal_source_documents ENABLE ROW LEVEL SECURITY;"));
  assert.ok(sql.includes("ALTER TABLE public.legal_source_provisions ENABLE ROW LEVEL SECURITY;"));
  assert.ok(sql.includes("ALTER TABLE public.legal_source_ingestion_runs ENABLE ROW LEVEL SECURITY;"));
});

it("Grants public read only to officially_verified and active records", () => {
  assert.ok(sql.includes("is_active = true AND verification_status = 'officially_verified'"));
});

it("Restricts INSERT, UPDATE, DELETE strictly to administrators via public.is_admin()", () => {
  assert.ok(sql.includes("CREATE POLICY \"Admins have full access to legal documents\""));
  assert.ok(sql.includes("CREATE POLICY \"Admins have full access to legal provisions\""));
  assert.ok(sql.includes("CREATE POLICY \"Admins have full access to ingestion runs\""));
  assert.ok(sql.includes("public.is_admin()"));
});

it("Strict separation: Never references or inserts confidential client tables", () => {
  assert.ok(!sql.includes("client_briefs"), "Legal sources migration must not touch client_briefs");
  assert.ok(!sql.includes("client_vault_records"), "Legal sources migration must not touch client_vault_records");
  assert.ok(!sql.includes("consultation_requests"), "Legal sources migration must not touch consultation_requests");
});

// ----------------------------------------------------------------------------
// 5. STATUTORY COVERAGE AUDIT
// ----------------------------------------------------------------------------
console.log("\n[Audit 5] Verifying 9 Central Enactments & Key Provisions...");

const expectedActs = [
  "Bharatiya Nyaya Sanhita, 2023",
  "Bharatiya Nagarik Suraksha Sanhita, 2023",
  "Bharatiya Sakshya Adhiniyam, 2023",
  "Code of Civil Procedure, 1908",
  "Consumer Protection Act, 2019",
  "Real Estate (Regulation and Development) Act, 2016",
  "Negotiable Instruments Act, 1881",
  "Indian Contract Act, 1872",
  "Transfer of Property Act, 1882",
];

for (const act of expectedActs) {
  it(`Includes canonical enactment: ${act}`, () => {
    assert.ok(sql.includes(act), `Migration must contain enactment: ${act}`);
  });
}

const expectedSections = [
  "Section 318", // BNS Cheating
  "Section 316", // BNS Breach of trust
  "Section 173", // BNSS FIR
  "Section 480", // BNSS Regular bail
  "Section 482", // BNSS Anticipatory bail
  "Section 144", // BNSS Maintenance
  "Section 61",  // BSA Electronic records
  "Order XXXIX, Rules 1 & 2", // CPC Injunctions
  "Section 35",  // CPA Complaint
  "Section 69",  // CPA Limitation
  "Section 18",  // RERA Delay compensation
  "Section 31",  // RERA Authority complaint
  "Section 138", // NI Act Cheque bounce
  "Section 73",  // Contract Act Damages
  "Section 106", // TPA Lease termination
];

for (const sec of expectedSections) {
  it(`Includes verified provision: ${sec}`, () => {
    assert.ok(sql.includes(sec), `Migration must seed provision: ${sec}`);
  });
}

console.log("\n======================================================================");
console.log(`>>> MIGRATION AUDIT RESULTS: ${passed} PASSED | ${failed} FAILED <<<`);
console.log("======================================================================\n");

if (failed > 0) process.exit(1);
