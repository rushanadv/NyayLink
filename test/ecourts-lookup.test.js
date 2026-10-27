/**
 * NyayLink - Official eCourts Links & Manual CNR Case Lookup Test Suite
 *
 * Verifies:
 * 1. 16-character CNR format validation (valid, invalid, spaces, hyphens, lowercase)
 * 2. Copy action string purity (strips hyphens and separators)
 * 3. Official eCourts Services portal routing (services.ecourts.gov.in)
 * 4. Anti-deception guarantees: unverified status, never claiming fake sync
 * 5. Safe calendar integration (no silent overwriting, is_court_verified = false)
 * 6. Database schema & additive migration safety (legal_matters, tracked_court_cases)
 * 7. Provider adapter boundary & documented institutional prerequisites
 */

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const jiti = require("jiti")(process.cwd(), { alias: { "@": process.cwd() } });
const {
  validateCNRNumber,
  cleanCNR,
  formatCNR,
  getOfficialPortalLink,
  getOfficialECourtsUrl,
  getProvenanceLabel,
  ManualECourtsAdapter,
  OFFICIAL_ECOURTS_PORTAL_URL,
  OFFICIAL_HIGH_COURT_PORTAL_URL,
  OFFICIAL_SUPREME_COURT_PORTAL_URL,
} = jiti("./lib/court-data/ecourts-adapter.ts");

console.log("======================================================================");
console.log(">>> NYAYLINK OFFICIAL ECOURTS & CNR LOOKUP TEST SUITE <<<");
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

// ----------------------------------------------------------------------------
// 1. CNR VALIDATION & CLEANING
// ----------------------------------------------------------------------------
console.log("[Phase 1] Verifying 16-Character CNR Format Validation & Tolerant Parsing...");

it("Accepts valid 16-character alphanumeric CNR without separators", () => {
  const res = validateCNRNumber("DLHC010012342024");
  assert.strictEqual(res.isValid, true);
  assert.strictEqual(res.cleanCNR, "DLHC010012342024");
  assert.strictEqual(res.formattedCNR, "DLHC01-001234-2024");
  assert.strictEqual(res.stateCode, "DL");
  assert.strictEqual(res.establishmentCode, "HC");
  assert.strictEqual(res.year, 2024);
  assert.strictEqual(res.isVerifiedWithRegistry, false);
});

it("Tolerates user input with spaces, hyphens, and mixed casing", () => {
  const inputs = [
    "dlhc01-001234-2024",
    "MHCC 02 005678 2023",
    "ka-hc-01-009999-2022",
    "  UPHC01-000456-2025  ",
  ];

  for (const raw of inputs) {
    const res = validateCNRNumber(raw);
    assert.strictEqual(res.isValid, true, `Expected '${raw}' to be valid after cleaning`);
    assert.strictEqual(res.cleanCNR.length, 16);
    assert.strictEqual(res.cleanCNR, res.cleanCNR.toUpperCase());
    assert.ok(!res.cleanCNR.includes("-"));
    assert.ok(!res.cleanCNR.includes(" "));
  }
});

it("Rejects invalid length CNR numbers", () => {
  const tooShort = validateCNRNumber("DLHC01001234");
  assert.strictEqual(tooShort.isValid, false);
  assert.ok(tooShort.error.includes("exactly 16 alphanumeric characters"));

  const tooLong = validateCNRNumber("DLHC010012342024EXTRA");
  assert.strictEqual(tooLong.isValid, false);
  assert.ok(tooLong.error.includes("exactly 16 alphanumeric characters"));
});

it("Rejects invalid state codes and invalid serial/year formats", () => {
  // Numeric state code (invalid)
  const badState = validateCNRNumber("12HC010012342024");
  assert.strictEqual(badState.isValid, false);
  assert.ok(badState.error.includes("state code"));

  // Non-numeric case registration number
  const badNumber = validateCNRNumber("DLHC01ABCDEF2024");
  assert.strictEqual(badNumber.isValid, false);
  assert.ok(badNumber.error.includes("6-digit numeric"));

  // Out of range year (1800 or 2500)
  const badYear = validateCNRNumber("DLHC010012341850");
  assert.strictEqual(badYear.isValid, false);
  assert.ok(badYear.error.includes("valid registration year"));
});

it("Handles empty or missing CNR without crashing", () => {
  const emptyRes = validateCNRNumber("");
  assert.strictEqual(emptyRes.isValid, false);
  assert.strictEqual(emptyRes.cleanCNR, "");
  assert.ok(emptyRes.error.includes("required"));
});

// ----------------------------------------------------------------------------
// 2. 1-CLICK COPY & CLEAN FORMAT
// ----------------------------------------------------------------------------
console.log("\n[Phase 2] Verifying Copy Action Logic & Output...");

it("cleanCNR yields pure 16-character string suitable for clipboard pasting into eCourts", () => {
  const formatted = "DLHC01-001234-2024";
  const pure = cleanCNR(formatted);
  assert.strictEqual(pure, "DLHC010012342024");
  assert.strictEqual(pure.length, 16);
  assert.ok(!/[^A-Z0-9]/.test(pure));
});

it("formatCNR formats 16-character string into canonical human-readable structure", () => {
  const formatted = formatCNR("MHCC020056782023");
  assert.strictEqual(formatted, "MHCC02-005678-2023");
});

// ----------------------------------------------------------------------------
// 3. OFFICIAL ECOURTS SERVICES DESTINATIONS & CAPTCHA DISCLOSURE
// ----------------------------------------------------------------------------
console.log("\n[Phase 3] Verifying Official eCourts Portal Linkage & Anti-Deception...");

it("Primary external destination is official eCourts Services portal", () => {
  const link = getOfficialPortalLink();
  assert.strictEqual(link.url, OFFICIAL_ECOURTS_PORTAL_URL);
  assert.strictEqual(link.url, "https://services.ecourts.gov.in/ecourtindia_v6/");
  assert.strictEqual(link.requiresCaptcha, true);
  assert.strictEqual(link.supportsDirectQueryPrefill, false);
});

it("Routes High Court complexes to official High Court eCourts Services", () => {
  const link = getOfficialPortalLink("Delhi High Court (Sher Shah Road, New Delhi)");
  assert.strictEqual(link.url, OFFICIAL_HIGH_COURT_PORTAL_URL);
  assert.strictEqual(link.url, "https://hcservices.ecourts.gov.in/hcservices/");
  assert.strictEqual(link.searchType, "high_court");
});

it("Routes Supreme Court to official Supreme Court registry case status", () => {
  const link = getOfficialPortalLink("Supreme Court of India (New Delhi)");
  assert.strictEqual(link.url, OFFICIAL_SUPREME_COURT_PORTAL_URL);
  assert.strictEqual(link.url, "https://registry.sci.gov.in/case-status");
  assert.strictEqual(link.searchType, "supreme_court");
});

it("Truthfully states in disclaimer that user must enter CAPTCHA on government server", () => {
  const link = getOfficialPortalLink();
  assert.ok(link.disclaimer.toLowerCase().includes("captcha"));
  assert.ok(link.hindiDisclaimer.includes("कैप्चा"));
});

// ----------------------------------------------------------------------------
// 4. TRUTHFUL PROVENANCE & BADGES
// ----------------------------------------------------------------------------
console.log("\n[Phase 4] Verifying Truthful Provenance & Badge Behavior...");

it("Labels user-entered manual checks as unverified (no fake synced badges)", () => {
  const prov = getProvenanceLabel("user_manual_entry", "user_entered", false);
  assert.ok(prov.badgeText.includes("Unverified"));
  assert.ok(!prov.badgeText.includes("Officially"));
  assert.ok(!prov.badgeText.toLowerCase().includes("synced"));

  const hindiProv = getProvenanceLabel("user_manual_entry", "user_entered", true);
  assert.ok(hindiProv.badgeText.includes("अपुष्ट"));
});

it("Labels advocate manual entries with chamber provenance", () => {
  const prov = getProvenanceLabel("advocate_manual_entry", "user_entered", false);
  assert.ok(prov.badgeText.includes("Advocate Entered"));
  assert.ok(prov.badgeText.includes("Unverified with Registry"));
});

it("Reserves officially verified badges strictly for authorized provider APIs", () => {
  const prov = getProvenanceLabel("authorized_provider", "officially_verified", false);
  assert.ok(prov.badgeText.includes("Officially Registry Verified"));
});

// ----------------------------------------------------------------------------
// 5. DATABASE SCHEMA & ADDITIVE MIGRATION AUDIT
// ----------------------------------------------------------------------------
console.log("\n[Phase 5] Verifying Additive Database Migration & RLS Security...");

it("Migration file 20261027200000 exists and contains additive schema changes", () => {
  const migrationPath = path.join(
    __dirname,
    "../supabase/migrations/20261027200000_ecourts_manual_lookup_and_case_tracking.sql"
  );
  assert.ok(fs.existsSync(migrationPath), "Migration file must exist");
  const sql = fs.readFileSync(migrationPath, "utf8");

  assert.ok(sql.includes("ALTER TABLE public.legal_matters"), "Alters legal_matters");
  assert.ok(sql.includes("ADD COLUMN IF NOT EXISTS cnr_number text"), "Adds cnr_number");
  assert.ok(sql.includes("ADD COLUMN IF NOT EXISTS court_complex text"), "Adds court_complex");
  assert.ok(sql.includes("ADD COLUMN IF NOT EXISTS court_status text"), "Adds court_status");
  assert.ok(sql.includes("ADD COLUMN IF NOT EXISTS court_hearing_date date"), "Adds court_hearing_date");
  assert.ok(sql.includes("ADD COLUMN IF NOT EXISTS court_status_source text"), "Adds court_status_source");
  assert.ok(sql.includes("ALTER TABLE public.tracked_court_cases"), "Alters tracked_court_cases");
  assert.ok(sql.includes("ADD COLUMN IF NOT EXISTS matter_id uuid"), "Adds matter_id foreign key");
  assert.ok(sql.includes("CREATE INDEX IF NOT EXISTS idx_legal_matters_cnr"), "Indexes cnr_number");
});

it("Migration strictly protects tracked_court_cases under RLS with matter authorization", () => {
  const migrationPath = path.join(
    __dirname,
    "../supabase/migrations/20261027200000_ecourts_manual_lookup_and_case_tracking.sql"
  );
  const sql = fs.readFileSync(migrationPath, "utf8");

  assert.ok(sql.includes("CREATE POLICY \"tracked_court_cases_owner\""), "Defines RLS policy");
  assert.ok(sql.includes("m.assigned_lawyer_id = auth.uid() OR m.client_id = auth.uid()"), "Authorizes matter counsel/client");
  assert.ok(sql.includes("public.is_admin()"), "Authorizes admin");
  assert.ok(!sql.includes("DROP TABLE"), "Must not drop tables");
});

// ----------------------------------------------------------------------------
// 6. PROVIDER ADAPTER BOUNDARY & DOCUMENTED PREREQUISITES
// ----------------------------------------------------------------------------
console.log("\n[Phase 6] Verifying Adapter Architecture & Documented Requirements...");

it("ManualECourtsAdapter clearly reports automated sync is disabled", () => {
  const adapter = new ManualECourtsAdapter();
  assert.strictEqual(adapter.isAutomatedSyncSupported(), false);
  const status = adapter.getProviderStatus();
  assert.strictEqual(status.isConfigured, true);
  assert.ok(status.statusMessage.includes("Automated synchronisation is disabled"));
});

it("Documents specific institutional credentials required for automated sync", () => {
  const adapter = new ManualECourtsAdapter();
  const credentials = adapter.getRequiredCredentials();
  assert.ok(credentials.length >= 3);
  assert.ok(credentials.some((c) => c.includes("e-Committee")));
  assert.ok(credentials.some((c) => c.includes("NJDG")));
  assert.ok(credentials.some((c) => c.includes("Court Registry")));
});

// ----------------------------------------------------------------------------
// 7. UI COMPONENT & ACTIONS INTEGRATION
// ----------------------------------------------------------------------------
console.log("\n[Phase 7] Verifying Component & Server Action Integration...");

it("ECourtsCaseLookupPanel component file exists and exports valid React component", () => {
  const panelPath = path.join(__dirname, "../components/court/ecourts-case-lookup-panel.tsx");
  assert.ok(fs.existsSync(panelPath), "Component must exist");
  const code = fs.readFileSync(panelPath, "utf8");

  assert.ok(code.includes("export function ECourtsCaseLookupPanel"), "Exports component");
  assert.ok(code.includes("Open official eCourts case search"), "Includes exact action label");
  assert.ok(code.includes("Copy CNR"), "Includes copy button");
  assert.ok(code.includes("validateCNRNumber"), "Uses CNR validator");
  assert.ok(code.includes("getOfficialPortalLink"), "Uses portal router");
});

it("Server action updateMatterECourtsDetails exists and implements security checks", () => {
  const actionPath = path.join(__dirname, "../app/actions/ecourts.ts");
  assert.ok(fs.existsSync(actionPath), "Action file must exist");
  const code = fs.readFileSync(actionPath, "utf8");

  assert.ok(code.includes("export async function updateMatterECourtsDetails"), "Exports server action");
  assert.ok(code.includes("matter.client_id === user.id"), "Checks client ownership");
  assert.ok(code.includes("matter.assigned_lawyer_id === user.id"), "Checks assigned lawyer");
  assert.ok(code.includes("is_court_verified: false"), "Ensures calendar event is unverified");
  assert.ok(code.includes("existingHearing"), "Checks for existing hearing to avoid silent overwrites");
});

it("Client MattersTab and Lawyer MattersTab embed ECourtsCaseLookupPanel", () => {
  const clientTab = fs.readFileSync(
    path.join(__dirname, "../components/client/matters-tab.tsx"),
    "utf8"
  );
  assert.ok(clientTab.includes("<ECourtsCaseLookupPanel"), "Client tab embeds panel");

  const lawyerTab = fs.readFileSync(
    path.join(__dirname, "../components/lawyer/matters-tab.tsx"),
    "utf8"
  );
  assert.ok(lawyerTab.includes("<ECourtsCaseLookupPanel"), "Lawyer tab embeds panel");
});

console.log("\n======================================================================");
console.log(`>>> ECOURTS LOOKUP TEST RESULTS: ${passed} PASSED | ${failed} FAILED <<<`);
console.log("======================================================================\n");

if (failed > 0) process.exit(1);
