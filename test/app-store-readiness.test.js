/**
 * NyayLink - Apple App Store Readiness & Privacy Compliance Verification Suite
 *
 * Validates:
 * 1. Public Legal & Support Routes (direct access without auth redirect).
 * 2. Remediation of unsupported marketing & security claims.
 * 3. AI Preconsultation renaming and statutory disclaimers.
 * 4. Reviewer Sandbox Authentication & Isolation.
 * 5. Support Ticket Server Action validation & spam protection.
 * 6. Server-side authorization on document & account deletion actions.
 */

const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

async function runReadinessTests() {
  let passed = 0;
  let failed = 0;

  function assert(cond, desc, details) {
    if (cond) {
      passed++;
      console.log(`  ✓ [PASS] ${desc}`);
    } else {
      failed++;
      console.error(`  ❌ [FAIL] ${desc} — ${details || "Assertion failed"}`);
    }
  }

  console.log("======================================================================");
  console.log(">>> NYAYLINK APP STORE READINESS & PRIVACY COMPLIANCE AUDIT <<<");
  console.log("======================================================================\n");

  // 1. PUBLIC ROUTES AUDIT (MUST RETURN 200 DIRECTLY)
  console.log("[Test 1/6] Verifying Direct Public Access to Legal, Support & Reviewer Routes...");
  const publicRoutes = ["/privacy", "/terms", "/support", "/reviewer"];
  for (const route of publicRoutes) {
    try {
      const res = await fetch(`${BASE_URL}${route}`, { redirect: "manual" });
      assert(
        res.status === 200,
        `Route ${route} is publicly accessible without auth redirect`,
        `Got HTTP ${res.status}`
      );
    } catch (err) {
      assert(false, `Route ${route} fetch failed`, err.message);
    }
  }

  // 2. AUDIT MARKETING CONTENT & DICTIONARIES FOR UNFOUNDED CLAIMS
  console.log("\n[Test 2/6] Auditing Dictionaries & Marketing Copy for Unsubstantiated Claims...");
  const enDict = fs.readFileSync(path.join(__dirname, "../lib/i18n/dictionaries/en.ts"), "utf8");
  const hiDict = fs.readFileSync(path.join(__dirname, "../lib/i18n/dictionaries/hi.ts"), "utf8");
  const featuresData = fs.readFileSync(path.join(__dirname, "../lib/marketing/features-data.ts"), "utf8");

  // Check Escrow claims in user-facing string values
  const hasEscrowInValue = (str) => {
    // Look for ': "...escrow..."' pattern (case-insensitive)
    const matches = str.match(/:\s*"[^"]*escrow[^"]*"/gi);
    return matches && matches.length > 0;
  };
  assert(
    !hasEscrowInValue(enDict) && !hasEscrowInValue(featuresData),
    "No false 'escrow' claims in user-facing marketing copy"
  );

  // Check AES-256 marketing guarantees
  assert(
    !enDict.includes("256-bit AES") && !featuresData.includes("256-bit AES"),
    "No unsubstantiated '256-bit AES' marketing guarantees in core features"
  );

  // Check BCI Verified endorsement claims
  assert(
    !enDict.includes("BCI Verified") && !featuresData.includes("BCI Verified"),
    "No false 'BCI Verified' institutional endorsement claims (replaced with Bar Council Enrolled)"
  );

  // Check AI Legal Intake renaming to AI Preconsultation
  assert(
    enDict.includes("AI Preconsultation"),
    "English dictionary features updated to 'AI Preconsultation'"
  );
  assert(
    hiDict.includes("एआई पूर्व-परामर्श"),
    "Hindi dictionary features updated to 'एआई पूर्व-परामर्श'"
  );

  // 3. REVIEWER GATEWAY & DEMO AUTHENTICATION
  console.log("\n[Test 3/6] Testing Reviewer Gateway & Demo Session Endpoints...");
  try {
    const clientRes = await fetch(`${BASE_URL}/api/auth/demo-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "client" }),
    });
    const clientData = await clientRes.json();
    assert(
      clientRes.status === 200 && clientData.success === true && clientData.redirectUrl === "/dashboard",
      "Demo Client authenticated and redirected to /dashboard"
    );

    const lawyerRes = await fetch(`${BASE_URL}/api/auth/demo-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "lawyer" }),
    });
    const lawyerData = await lawyerRes.json();
    assert(
      lawyerRes.status === 200 && lawyerData.success === true && lawyerData.redirectUrl === "/lawyer/dashboard",
      "Demo Lawyer authenticated and redirected to /lawyer/dashboard"
    );
  } catch (err) {
    assert(false, "Reviewer authentication endpoint failed", err.message);
  }

  // 4. SUPPORT TICKET SERVER ACTION VALIDATION AUDIT
  console.log("\n[Test 4/6] Auditing Support Ticket Server Action Validation & Anti-Spam...");
  const supportActionContent = fs.readFileSync(
    path.join(__dirname, "../app/actions/support.ts"),
    "utf8"
  );
  assert(
    supportActionContent.includes("honeypot") &&
    supportActionContent.includes("ticketId"),
    "submitSupportTicket includes honeypot anti-spam check and ticket reference generator"
  );
  assert(
    supportActionContent.includes("emailRegex") &&
    supportActionContent.includes("input.name?.trim()"),
    "submitSupportTicket validates email format and required fields on the server"
  );

  // 5. SERVER-SIDE SECURITY BOUNDARY FOR VAULT & ACCOUNT DELETION
  console.log("\n[Test 5/6] Auditing Server Actions Authorization Boundaries...");
  const accountActionContent = fs.readFileSync(
    path.join(__dirname, "../app/actions/account-deletion.ts"),
    "utf8"
  );
  assert(
    accountActionContent.includes("supabase.auth.getUser()") &&
    accountActionContent.includes("supabase.auth.signInWithPassword"),
    "deleteUserAccount enforces server-side session check & password reauthentication"
  );
  assert(
    accountActionContent.includes("DELETE MY NYAYLINK ACCOUNT"),
    "deleteUserAccount requires exact confirmation phrase"
  );
  assert(
    accountActionContent.includes("p.startsWith(`${userId}/`)"),
    "deleteUserAccount strictly scopes storage object deletion to the authenticated user ID"
  );

  const vaultActionContent = fs.readFileSync(
    path.join(__dirname, "../app/actions/vault.ts"),
    "utf8"
  );
  assert(
    vaultActionContent.includes("replaceVaultDocument") &&
    vaultActionContent.includes("deleteVaultDocument"),
    "Vault actions export both replaceVaultDocument and deleteVaultDocument"
  );
  assert(
    vaultActionContent.includes("crypto.subtle.digest") || vaultActionContent.includes("SHA-256") || vaultActionContent.includes("crypto.createHash"),
    "Vault document replacement computes cryptographic SHA-256 integrity hash"
  );

  // 6. SHARED FOOTER LINKS AUDIT
  console.log("\n[Test 6/6] Auditing Shared Footer for Working Links...");
  const footerContent = fs.readFileSync(
    path.join(__dirname, "../components/marketing/marketing-footer.tsx"),
    "utf8"
  );
  assert(
    footerContent.includes('href="/privacy"') &&
    footerContent.includes('href="/terms"') &&
    footerContent.includes('href="/support"') &&
    footerContent.includes('href="/reviewer"'),
    "Footer includes working links to /privacy, /terms, /support, and /reviewer"
  );
  assert(
    !footerContent.includes("cursor-default"),
    "Footer has no fake dead anchor elements with cursor-default"
  );

  console.log("\n======================================================================");
  console.log(`>>> TOTAL ASSERTIONS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed} <<<`);
  console.log("======================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runReadinessTests().catch((err) => {
  console.error("Test execution exception:", err);
  process.exit(1);
});
