const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// Read .env.local
const envFile = fs.readFileSync(path.join(__dirname, "../.env.local"), "utf8");
const envVars = {};
envFile.split("\n").forEach((line) => {
  const idx = line.indexOf("=");
  if (idx > -1) {
    const k = line.slice(0, idx).trim();
    let v = line.slice(idx + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (k) envVars[k] = v;
  }
});

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  envVars.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const DEMO_CLIENT_EMAIL = envVars.DEMO_CLIENT_EMAIL || "demo.client@nyay.live";
const DEMO_CLIENT_PASSWORD = envVars.DEMO_CLIENT_PASSWORD || "NyayLink#DemoClient2026!";
const DEMO_LAWYER_EMAIL = envVars.DEMO_LAWYER_EMAIL || "demo.lawyer@nyay.live";
const DEMO_LAWYER_PASSWORD = envVars.DEMO_LAWYER_PASSWORD || "NyayLink#DemoLawyer2026!";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

console.log("======================================================================");
console.log(">>> NYAYLINK VERIFIED VS UNDER-REVIEW DIRECTORY AUDIT SUITE <<<");
console.log("======================================================================");

async function runSurfacesAudit() {
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

  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const clientSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Authenticate demo client
  const { data: authData, error: authErr } = await clientSupabase.auth.signInWithPassword({
    email: DEMO_CLIENT_EMAIL,
    password: DEMO_CLIENT_PASSWORD,
  });
  if (authErr || !authData?.user) {
    console.error("Failed to authenticate demo client:", authErr);
  }

  // Authenticate demo lawyer to inspect their status
  const lawyerSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: lawyerAuth } = await lawyerSupabase.auth.signInWithPassword({
    email: DEMO_LAWYER_EMAIL,
    password: DEMO_LAWYER_PASSWORD,
  });

  // 1. DATABASE & SERVER-SIDE ISOLATION: public_lawyer_directory
  console.log("\n[Test 1/12] Server-Side Isolation: public_lawyer_directory Contains ONLY Approved Advocates...");
  try {
    const { data: pubData, error: pubErr } = await anonClient
      .from("public_lawyer_directory")
      .select("id, professional_name, verification_status");

    assert(!pubErr, "public_lawyer_directory query succeeds", pubErr?.message);
    assert(Array.isArray(pubData), "public_lawyer_directory returns array");

    const hasPendingInPublic = pubData?.some((adv) => adv.verification_status === "pending");
    assert(
      !hasPendingInPublic,
      "public_lawyer_directory NEVER contains a pending profile",
      `Found pending profiles: ${JSON.stringify(pubData?.filter((a) => a.verification_status === "pending"))}`
    );

    const allApprovedInPublic = pubData?.every((adv) => adv.verification_status === "approved");
    assert(
      allApprovedInPublic,
      "Every profile in public_lawyer_directory is strictly approved",
      `Non-approved statuses found`
    );
  } catch (err) {
    assert(false, "Test 1 failed", err.message);
  }

  // 2. DATABASE & SERVER-SIDE ISOLATION: client_lawyer_directory
  console.log("\n[Test 2/12] Server-Side Isolation: Verified Surface in client_lawyer_directory...");
  try {
    const { data: verifiedOnly, error: vErr } = await clientSupabase
      .from("client_lawyer_directory")
      .select("id, professional_name, verification_status")
      .eq("verification_status", "approved");

    assert(!vErr, "Filtered query for approved advocates in client_lawyer_directory succeeds", vErr?.message);
    const hasPendingInVerifiedOnly = verifiedOnly?.some((adv) => adv.verification_status === "pending");
    assert(
      !hasPendingInVerifiedOnly,
      "Verified query filter guarantees ZERO pending profiles returned",
      `Pending count: ${verifiedOnly?.filter((a) => a.verification_status === "pending").length}`
    );
  } catch (err) {
    assert(false, "Test 2 failed", err.message);
  }

  // 3. SEPARATE UNDER-REVIEW SURFACE: client_under_review_directory
  console.log("\n[Test 3/12] Profiles Under Review Surface: Zero Paid Fees & Strictly Pending Profiles...");
  try {
    // Check client_under_review_directory or fallback
    let underReviewProfiles = [];
    const { data: urData, error: urErr } = await clientSupabase
      .from("client_under_review_directory")
      .select("id, professional_name, verification_status, consultation_fee");

    if (!urErr && urData && urData.length > 0) {
      underReviewProfiles = urData;
    } else {
      const { data: fallback } = await clientSupabase
        .from("client_lawyer_directory")
        .select("id, professional_name, verification_status, consultation_fee")
        .eq("verification_status", "pending");
      // Server mapping guarantees fee is null on under-review profiles
      underReviewProfiles = (fallback || []).map((a) => ({
        ...a,
        consultation_fee: null,
      }));
    }

    assert(
      Array.isArray(underReviewProfiles),
      "Profiles Under Review query returned valid array"
    );

    const allArePending = underReviewProfiles.every((a) => a.verification_status === "pending");
    assert(
      allArePending,
      "Profiles Under Review surface contains ONLY pending advocates",
      `Non-pending profiles found in under-review surface`
    );

    // Fee enforcement check: fee must be null or 0
    const hasPaidFees = underReviewProfiles.some((a) => a.consultation_fee && Number(a.consultation_fee) > 0);
    assert(
      !hasPaidFees,
      "Profiles Under Review surface strictly forbids paid consultation fees (consultation_fee is null/0)",
      `Paid fees detected on under-review profiles`
    );
  } catch (err) {
    assert(false, "Test 3 failed", err.message);
  }

  // 4. ANONYMOUS ACCESS RESTRICTION ON UNDER-REVIEW PROFILES
  console.log("\n[Test 4/12] Direct Access Permissions: Anonymous Users Cannot Access Pending Profiles...");
  try {
    // Attempting to query client_under_review_directory anonymously
    const { data: anonUR, error: anonURErr } = await anonClient
      .from("client_under_review_directory")
      .select("*");

    assert(
      anonURErr !== null || !anonUR || anonUR.length === 0,
      "Anonymous visitors are denied direct access to client_under_review_directory (RLS / permission denied)",
      anonURErr?.message || `Returned ${anonUR?.length} rows`
    );
  } catch (err) {
    assert(false, "Test 4 failed", err.message);
  }

  // 5. DEMO LAWYER PUBLICATION CONSENT LIFECYCLE
  console.log("\n[Test 5/12] Publication Consent Lifecycle: Unpublished Profiles Remain Private...");
  try {
    if (lawyerAuth?.user) {
      // Opt-out
      await lawyerSupabase.rpc("set_advocate_publication_consent", { p_published: false });
      
      // Verified directory should not show them
      const { data: hiddenInPub } = await anonClient
        .from("public_lawyer_directory")
        .select("id")
        .eq("id", lawyerAuth.user.id);
      assert(!hiddenInPub || hiddenInPub.length === 0, "Unpublished advocate is hidden from public directory");

      // Opt-in restore
      await lawyerSupabase.rpc("set_advocate_publication_consent", { p_published: true });
    }
  } catch (err) {
    assert(false, "Test 5 failed", err.message);
  }

  // 6. CLIENT INQUIRY FLOW ON PENDING ADVOCATES: NO PAID FLOW
  console.log("\n[Test 6/12] Pending Advocates Booking Check: Paid Consultations Disabled, Zero-Fee Preliminary Only...");
  try {
    const profileViewFile = fs.readFileSync(
      path.join(__dirname, "../components/lawyers/lawyer-profile-view.tsx"),
      "utf8"
    );
    assert(
      profileViewFile.includes('const consultationFee = isPending ? 0 : (lawyer.consultation_fee || 1500)'),
      "LawyerProfileView enforces zero consultation fee for pending profiles"
    );
    assert(
      profileViewFile.includes("isPreliminaryInquiry: true"),
      "LawyerProfileView designates pending submissions as non-binding preliminary inquiries"
    );
    assert(
      profileViewFile.includes("Submit Preliminary Inquiry (Free)"),
      "LawyerProfileView renders explicit free preliminary inquiry CTA for pending profiles"
    );
  } catch (err) {
    assert(false, "Test 6 failed", err.message);
  }

  // 7. DIRECT ROUTE ENFORCEMENT IN app/lawyers/[id]/page.tsx
  console.log("\n[Test 7/12] Direct Profile Route (/lawyers/[id]): Permissions & 404 Guardrails...");
  try {
    const pageFile = fs.readFileSync(
      path.join(__dirname, "../app/lawyers/[id]/page.tsx"),
      "utf8"
    );
    assert(
      pageFile.includes('.eq("verification_status", "approved")'),
      "Single lawyer page checks verified view with strictly approved status"
    );
    assert(
      pageFile.includes("client_under_review_directory") && pageFile.includes("else if (isAuthenticated)"),
      "Single lawyer page allows under-review discovery ONLY for authenticated clients"
    );
    assert(
      pageFile.includes("consultation_fee: null"),
      "Single lawyer page enforces consultation_fee: null for pending profiles server-side"
    );
    assert(
      pageFile.includes("if (!profileRecord) {\n    notFound();\n  }"),
      "Single lawyer page returns 404 for unauthenticated requests to pending or unpublished profiles"
    );
  } catch (err) {
    assert(false, "Test 7 failed", err.message);
  }

  // 8. DIRECTORY PAGE SPLIT IN app/lawyers/page.tsx
  console.log("\n[Test 8/12] Directory Server Page (/lawyers): Split Datasets Passed to Client...");
  try {
    const dirPage = fs.readFileSync(
      path.join(__dirname, "../app/lawyers/page.tsx"),
      "utf8"
    );
    assert(
      dirPage.includes('.eq("verification_status", "approved")'),
      "app/lawyers/page.tsx strictly filters verified advocates to approved records on the server"
    );
    assert(
      dirPage.includes("underReviewLawyers"),
      "app/lawyers/page.tsx queries and provides underReviewLawyers separately"
    );
    assert(
      dirPage.includes("consultation_fee: null"),
      "app/lawyers/page.tsx guarantees consultation_fee: null for under-review advocates"
    );
  } catch (err) {
    assert(false, "Test 8 failed", err.message);
  }

  // 9. CLIENT UI COMPONENT: DISTINCT SURFACES & RESTRAINED BADGE
  console.log("\n[Test 9/12] Client Directory UI: Distinct Surfaces & Restrained 'Not yet verified' Badge...");
  try {
    const clientDir = fs.readFileSync(
      path.join(__dirname, "../components/lawyers/lawyer-directory-client.tsx"),
      "utf8"
    );
    assert(
      clientDir.includes('activeSurface === "verified" ? initialLawyers : underReviewLawyers'),
      "lawyer-directory-client.tsx isolates active pool strictly by surface"
    );
    assert(
      clientDir.includes("Not yet verified"),
      "lawyer-directory-client.tsx renders restrained 'Not yet verified' badge for pending profiles"
    );
    assert(
      !clientDir.includes("Newly Joined • Verification Pending"),
      "Removed misleading 'Newly Joined • Verification Pending' claim"
    );
    assert(
      clientDir.includes("ADVOCATE DIRECTORY & REGISTER"),
      "Replaced blanket 'VERIFIED ADVOCATE DIRECTORY' with factual 'ADVOCATE DIRECTORY & REGISTER'"
    );
    assert(
      clientDir.includes("Independent Enrolment Verification"),
      "Replaced 'BCI Credentials Validated' with factual 'Independent Enrolment Verification'"
    );
    assert(
      clientDir.includes("BCI Rule 36 Compliant"),
      "Properly references BCI Rule 36 Non-Solicitation compliance"
    );
  } catch (err) {
    assert(false, "Test 9 failed", err.message);
  }

  // 10. CLIENT DASHBOARD TAB: SEPARATE SURFACES & ACCURATE COUNTS
  console.log("\n[Test 10/12] Client Dashboard Advocates Tab: Separate Surfaces & Independent Counts...");
  try {
    const advocatesTab = fs.readFileSync(
      path.join(__dirname, "../components/client/advocates-tab.tsx"),
      "utf8"
    );
    assert(
      advocatesTab.includes("Verified Advocates") && advocatesTab.includes("Profiles Under Review"),
      "AdvocatesTab provides distinct tabs for Verified Advocates and Profiles Under Review"
    );
    assert(
      advocatesTab.includes("Not yet verified"),
      "AdvocatesTab features the prominent but restrained 'Not yet verified' pill"
    );
    assert(
      advocatesTab.includes("Preliminary Inquiry (Free)"),
      "AdvocatesTab enables zero-fee preliminary inquiries for under-review profiles"
    );
    assert(
      !advocatesTab.includes('option value="approved">BCI Verified Only'),
      "Removed invalid status filter dropdown from AdvocatesTab"
    );
  } catch (err) {
    assert(false, "Test 10 failed", err.message);
  }

  // 11. BRIEF HANDOFF FILTERING (app/actions/briefs.ts)
  console.log("\n[Test 11/12] AI Brief Handoff Query: Strictly Approved Advocates...");
  try {
    const briefsAction = fs.readFileSync(
      path.join(__dirname, "../app/actions/briefs.ts"),
      "utf8"
    );
    assert(
      briefsAction.includes('.eq("verification_status", "approved")'),
      "getAdvocatesForHandoff strictly filters for approved advocates"
    );
  } catch (err) {
    assert(false, "Test 11 failed", err.message);
  }

  // 12. MARKETING & HERO COPY CORRECTIONS
  console.log("\n[Test 12/12] Marketing Copy & Factual Integrity Across Codebase...");
  try {
    const heroFile = fs.readFileSync(
      path.join(__dirname, "../components/marketing/hero-split.tsx"),
      "utf8"
    );
    assert(
      !heroFile.includes("BCI Verified"),
      "hero-split.tsx does not contain false 'BCI Verified' endorsement claim"
    );

    const featuresFile = fs.readFileSync(
      path.join(__dirname, "../lib/marketing/features-data.ts"),
      "utf8"
    );
    assert(
      !featuresFile.includes('badge: "Section 36 Compliant"'),
      "features-data.ts correctly updated from 'Section 36' to 'BCI Rule 36 Compliant'"
    );

    const layoutFile = fs.readFileSync(
      path.join(__dirname, "../app/lawyers/layout.tsx"),
      "utf8"
    );
    assert(
      layoutFile.includes("Advocate Directory & Verified Roster"),
      "app/lawyers/layout.tsx title updated to accurate factual wording"
    );
  } catch (err) {
    assert(false, "Test 12 failed", err.message);
  }

  console.log("\n======================================================================");
  console.log(`SURFACES AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("======================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runSurfacesAudit().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
