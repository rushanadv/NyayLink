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

console.log("======================================================================");
console.log(">>> NYAYLINK CLIENT ADVOCATE DISCOVERY & CONSENT TEST SUITE <<<");
console.log("======================================================================");

async function runDiscoveryTests() {
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

  // 1. Unauthenticated / Anonymous Access to client_lawyer_directory
  console.log("\n[Test 1/6] Testing Anonymous Access Denial on client_lawyer_directory...");
  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  try {
    const { data: anonData, error: anonErr } = await anonClient
      .from("client_lawyer_directory")
      .select("*");

    assert(
      anonErr !== null && (anonErr.code === "42501" || anonErr.message.toLowerCase().includes("permission denied")),
      "Anonymous query to client_lawyer_directory is rejected with 42501 permission denied",
      anonErr ? `Code: ${anonErr.code}, Msg: ${anonErr.message}` : "Unexpectedly succeeded"
    );

    // Public directory should still be accessible to anon, but strictly approved only
    const { data: pubData, error: pubErr } = await anonClient
      .from("public_lawyer_directory")
      .select("*");

    assert(
      pubErr === null,
      "Anonymous query to public_lawyer_directory succeeds",
      pubErr?.message
    );
  } catch (err) {
    assert(false, "Anon access check failed", err.message);
  }

  // 2. Client Authentication & Directory Access
  console.log("\n[Test 2/6] Testing Authenticated Client Access to client_lawyer_directory...");
  const clientSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  let clientUser = null;
  try {
    const { data: authData, error: authErr } =
      await clientSupabase.auth.signInWithPassword({
        email: DEMO_CLIENT_EMAIL,
        password: DEMO_CLIENT_PASSWORD,
      });

    assert(!authErr && authData.user, "Demo Client authenticated successfully", authErr?.message);
    clientUser = authData?.user;

    const { data: clientDirData, error: clientDirErr } = await clientSupabase
      .from("client_lawyer_directory")
      .select("*");

    assert(
      clientDirErr === null,
      "Authenticated Client successfully queries client_lawyer_directory view",
      clientDirErr?.message
    );
    assert(
      Array.isArray(clientDirData),
      "client_lawyer_directory returned valid array response"
    );
  } catch (err) {
    assert(false, "Client access check failed", err.message);
  }

  // 3. Privacy Safeguards Verification (BCI Rule 36)
  console.log("\n[Test 3/6] Verifying Absence of Confidential PII in View Columns...");
  try {
    // Attempting to select restricted columns: phone, internal_notes, reviewer_id
    const { error: phoneErr } = await clientSupabase
      .from("client_lawyer_directory")
      .select("id, phone");

    assert(
      phoneErr !== null && phoneErr.message.includes("phone"),
      "Phone number column is not exposed in client_lawyer_directory view",
      phoneErr?.message
    );

    const { error: notesErr } = await clientSupabase
      .from("client_lawyer_directory")
      .select("id, internal_notes");

    assert(
      notesErr !== null && notesErr.message.includes("internal_notes"),
      "Internal verification notes column is not exposed in client_lawyer_directory view",
      notesErr?.message
    );
  } catch (err) {
    assert(false, "Privacy safeguard column check failed", err.message);
  }

  // 4. Lawyer Publication Consent Toggle & Dynamic Visibility
  console.log("\n[Test 4/6] Testing Publication Consent Toggle and Client Discoverability...");
  const lawyerSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  let lawyerUser = null;
  try {
    const { data: authData, error: authErr } =
      await lawyerSupabase.auth.signInWithPassword({
        email: DEMO_LAWYER_EMAIL,
        password: DEMO_LAWYER_PASSWORD,
      });

    assert(!authErr && authData.user, "Demo Lawyer authenticated successfully", authErr?.message);
    lawyerUser = authData?.user;

    if (lawyerUser) {
      // Step A: Set publication consent to FALSE
      const { data: optOutRes, error: optOutErr } = await lawyerSupabase.rpc(
        "set_advocate_publication_consent",
        { p_published: false }
      );

      assert(
        !optOutErr && optOutRes?.success === true && optOutRes?.is_published === false,
        "Lawyer successfully revokes publication consent (is_published = false)",
        optOutErr?.message || JSON.stringify(optOutRes)
      );

      // Verify Client CANNOT see lawyer in directory
      const { data: hiddenCheck } = await clientSupabase
        .from("client_lawyer_directory")
        .select("id, professional_name")
        .eq("id", lawyerUser.id);

      assert(
        !hiddenCheck || hiddenCheck.length === 0,
        "Unpublished advocate is immediately hidden from client_lawyer_directory",
        `Expected 0 rows, got ${hiddenCheck?.length}`
      );

      // Step B: Set publication consent to TRUE
      const { data: optInRes, error: optInErr } = await lawyerSupabase.rpc(
        "set_advocate_publication_consent",
        { p_published: true }
      );

      assert(
        !optInErr && optInRes?.success === true && optInRes?.is_published === true,
        "Lawyer successfully grants publication consent (is_published = true)",
        optInErr?.message || JSON.stringify(optInRes)
      );

      // Verify Client CAN now see lawyer with pending status
      const { data: visibleCheck, error: visErr } = await clientSupabase
        .from("client_lawyer_directory")
        .select("id, professional_name, verification_status, is_published, practice_areas, city")
        .eq("id", lawyerUser.id);

      assert(
        !visErr && visibleCheck && visibleCheck.length === 1,
        "Published advocate with pending verification is now discoverable to registered clients",
        visErr?.message || `Found ${visibleCheck?.length} rows`
      );

      if (visibleCheck && visibleCheck.length === 1) {
        const adv = visibleCheck[0];
        assert(
          adv.verification_status === "pending" || adv.verification_status === "approved",
          `Advocate returns valid verification_status: '${adv.verification_status}'`
        );
        assert(
          adv.is_published === true,
          "Advocate profile has is_published = true"
        );
        assert(
          Array.isArray(adv.practice_areas) && adv.practice_areas.length > 0,
          "Advocate practice_areas correctly returned"
        );
      }

      // Step C: Restore publication consent to original state (false) for test idempotency
      await lawyerSupabase.rpc("set_advocate_publication_consent", { p_published: false });
    }
  } catch (err) {
    assert(false, "Publication consent toggle check failed", err.message);
  } finally {
    if (lawyerUser) {
      await lawyerSupabase.rpc("set_advocate_publication_consent", { p_published: false });
    }
  }

  // 5. Unauthorized Caller Publication Attempt Check
  console.log("\n[Test 5/6] Testing Non-Owner / Client Publication Consent Rejection...");
  try {
    const { data: clientRpcData, error: clientRpcErr } = await clientSupabase.rpc(
      "set_advocate_publication_consent",
      { p_published: true }
    );

    assert(
      clientRpcErr !== null || (clientRpcData && clientRpcData.success === false),
      "Client account cannot publish as an advocate (requires completed lawyer profile)",
      clientRpcErr?.message || JSON.stringify(clientRpcData)
    );
  } catch (err) {
    assert(false, "Unauthorized publication check failed", err.message);
  }

  // 6. Source Code Audit for Zero Fake Profile Fallbacks
  console.log("\n[Test 6/6] Verifying Zero Hardcoded Demo Fallbacks in Directory Pages...");
  const lawyersPageCode = fs.readFileSync(path.join(__dirname, "../app/lawyers/page.tsx"), "utf8");
  const dashboardPageCode = fs.readFileSync(path.join(__dirname, "../app/dashboard/page.tsx"), "utf8");

  assert(
    !lawyersPageCode.includes("FALLBACK_DEMO_LAWYERS"),
    "app/lawyers/page.tsx does not contain FALLBACK_DEMO_LAWYERS"
  );
  assert(
    !dashboardPageCode.includes("FALLBACK_DEMO_LAWYERS"),
    "app/dashboard/page.tsx does not contain FALLBACK_DEMO_LAWYERS"
  );
  assert(
    lawyersPageCode.includes("client_lawyer_directory"),
    "app/lawyers/page.tsx routes authenticated clients to client_lawyer_directory"
  );
  assert(
    dashboardPageCode.includes("client_lawyer_directory"),
    "app/dashboard/page.tsx queries client_lawyer_directory for registered clients"
  );

  console.log("\n======================================================================");
  console.log(`TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("======================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runDiscoveryTests().catch((err) => {
  console.error("Test runner encountered fatal error:", err);
  process.exit(1);
});
