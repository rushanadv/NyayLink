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

const TEST_PASSWORD = process.env.FAKE_TEST_PASSWORD || "NyayLink#SafeFakeTest2026!";

console.log("======================================================================");
console.log(">>> NYAYLINK FAKE TEST ACCOUNTS, DISCOVERY & PROFILE VERIFICATION <<<");
console.log("======================================================================");

async function runTests() {
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

  // 1. Verify Fake Accounts naming convention (mandatory prefix 'fake ')
  console.log("\n[Test 1/7] Verifying Fake Accounts and 'fake ' literal prefix...");
  const fakeClientEmail = "fake.rohan.sharma@nyayalink.test";
  const fakeLawyerEmail1 = "fake.arjun.mehta@nyayalink.test";
  const fakeLawyerEmail2 = "fake.priya.kapoor@nyayalink.test";

  const clientUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: clientAuth, error: clientAuthErr } = await clientUser.auth.signInWithPassword({
    email: fakeClientEmail,
    password: TEST_PASSWORD,
  });

  assert(!clientAuthErr && clientAuth?.user, "Fake client 'fake.rohan.sharma' signs in successfully", clientAuthErr?.message);

  const { data: clientProf } = await clientUser
    .from("profiles")
    .select("full_name")
    .eq("id", clientAuth?.user?.id)
    .single();

  assert(
    clientProf?.full_name?.startsWith("fake "),
    `Fake client name starts with 'fake ' prefix: "${clientProf?.full_name}"`,
    clientProf?.full_name
  );

  // 2. Unauthenticated Discovery Directory
  console.log("\n[Test 2/7] Verifying Unauthenticated Visitor Discovery (public_lawyer_directory)...");
  const { data: pubLawyers, error: pubErr } = await anonClient
    .from("public_lawyer_directory")
    .select("id, professional_name, city, state, practice_areas, verification_status");

  assert(!pubErr && Array.isArray(pubLawyers), "Anonymous visitor can query public_lawyer_directory view");
  assert(
    pubLawyers?.some((l) => l.professional_name.startsWith("fake Adv. Arjun Mehta")),
    "Approved fake advocate 'fake Adv. Arjun Mehta' is discoverable in public directory"
  );
  assert(
    !pubLawyers?.some((l) => l.professional_name.includes("fake Adv. Priya Kapoor")),
    "Pending fake advocate 'fake Adv. Priya Kapoor' is withheld from public directory (BCI Rule 36)"
  );

  // 3. Authenticated Fake Client Discovery Directory
  console.log("\n[Test 3/7] Verifying Authenticated Client Discovery (client_lawyer_directory)...");
  const { data: clientLawyers, error: clientDirErr } = await clientUser
    .from("client_lawyer_directory")
    .select("id, professional_name, city, state, practice_areas, verification_status, courts_of_practice");

  assert(!clientDirErr && Array.isArray(clientLawyers), "Authenticated fake client queries client_lawyer_directory");
  assert(
    clientLawyers?.some((l) => l.professional_name.startsWith("fake Adv. Arjun Mehta") && l.verification_status === "approved"),
    "Approved advocate 'fake Adv. Arjun Mehta' discoverable with 'approved' status"
  );
  assert(
    clientLawyers?.some((l) => l.professional_name.startsWith("fake Adv. Priya Kapoor") && l.verification_status === "pending"),
    "Pending advocate 'fake Adv. Priya Kapoor' discoverable to client with 'pending' status"
  );

  // 4. Individual Profile & Education Inspection
  console.log("\n[Test 4/7] Testing Individual Profile Inspection & Education Data...");
  const arjunAdvocate = clientLawyers?.find((l) => l.professional_name.includes("Arjun Mehta"));
  assert(Boolean(arjunAdvocate?.id), "Found advocate ID for fake Adv. Arjun Mehta");

  if (arjunAdvocate?.id) {
    const { data: eduList, error: eduErr } = await clientUser
      .from("lawyer_educations")
      .select("degree, institution, graduation_year, is_public")
      .eq("lawyer_id", arjunAdvocate.id);

    assert(!eduErr && eduList && eduList.length >= 2, `Education entries returned for advocate (${eduList?.length} degrees)`);
    assert(
      eduList?.some((e) => e.degree.includes("LL.B.")),
      "Degree 'LL.B. (Hons.)' present in advocate academic history"
    );

    const { data: qualList, error: qualErr } = await clientUser
      .from("lawyer_qualifications")
      .select("title, issuing_authority, verification_status")
      .eq("lawyer_id", arjunAdvocate.id);

    assert(!qualErr && qualList && qualList.length >= 1, `Qualifications returned for advocate (${qualList?.length} qualifications)`);
    assert(
      qualList?.some((q) => q.title.includes("Advocate-on-Record")),
      "Certification 'Advocate-on-Record' present in advocate qualifications"
    );
  }

  // 5. Privacy & Storage Isolation
  console.log("\n[Test 5/7] Verifying Security Isolation & Document Privacy...");
  // Attempt to select from advocate_documents table as client
  const { data: stolenDocs, error: secErr } = await clientUser
    .from("advocate_documents")
    .select("*");

  assert(
    !stolenDocs || stolenDocs.length === 0,
    "Client cannot access private documents table of advocates under RLS",
    stolenDocs?.length ? `Leaked ${stolenDocs.length} documents` : undefined
  );

  // Attempt anonymous download from advocate-credentials bucket
  const { data: leakedDownload, error: leakErr } = await anonClient.storage
    .from("advocate-credentials")
    .download("arbitrary/test.pdf");

  assert(
    leakErr !== null,
    "Private storage bucket 'advocate-credentials' rejects unauthenticated direct download",
    leakErr?.message
  );

  // 6. Advocate Profile Completeness Calculation
  console.log("\n[Test 6/7] Testing Server-Side Profile Completeness Calculation...");
  const lawyerUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: lAuth, error: lAuthErr } = await lawyerUser.auth.signInWithPassword({
    email: fakeLawyerEmail1,
    password: TEST_PASSWORD,
  });

  assert(!lAuthErr && lAuth?.user, "Fake lawyer 'fake.arjun.mehta' signs in successfully");

  const { data: compResult, error: compErr } = await lawyerUser.rpc("get_advocate_profile_completeness");
  assert(!compErr && compResult?.success === true, "get_advocate_profile_completeness RPC executed successfully");
  assert(
    typeof compResult?.percentage === "number" && compResult.percentage === 100,
    `Profile completeness dynamically calculated as ${compResult?.percentage}% for full profile`
  );
  assert(
    compResult?.sections?.personal && compResult?.sections?.bar_council && compResult?.sections?.education,
    "All primary profile sections marked completed in score breakdown"
  );

  // 7. Verification that Genuine Advocates are completely intact
  console.log("\n[Test 7/7] Ensuring Genuine Onboarded Advocates Remain Untouched...");
  const genuineEmails = [
    "ramchou01dhary@gmail.com",
    "basantbalhara52@gmail.com",
    "nitingahlawat123@gmail.com",
    "advocate.jp83@gmail.com",
    "arunjangra180102@gmail.com",
  ];

  // Check that public directory has not exposed any genuine unapproved advocates
  const { data: allPublicLawyers } = await anonClient
    .from("public_lawyer_directory")
    .select("professional_name");

  const genuineNamesInPublic = allPublicLawyers?.filter((l) =>
    ["Jay chodhary", "basant balhara", "Adv Nitin Gahlawat", "Jp Chhikara", "Arun kumar"].includes(l.professional_name)
  );

  assert(
    !genuineNamesInPublic || genuineNamesInPublic.length === 0,
    "Genuine pending advocates have NOT been prematurely exposed to the public directory"
  );

  console.log("\n======================================================================");
  console.log(`TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("======================================================================");

  if (failed > 0) process.exit(1);
}

runTests();
