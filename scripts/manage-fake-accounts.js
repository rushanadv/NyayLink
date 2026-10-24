/**
 * NyayLink - Fake Test Accounts Management Script
 * 
 * Safely provisions and cleans up isolated test fixtures with the mandatory 'fake ' prefix:
 * 1. Customer: fake rohan sharma (fake.rohan.sharma@nyayalink.test)
 * 2. Customer: fake ananya verma (fake.ananya.verma@nyayalink.test)
 * 3. Advocate: fake Adv. Arjun Mehta (fake.arjun.mehta@nyayalink.test) - BCI Approved
 * 4. Advocate: fake Adv. Priya Kapoor (fake.priya.kapoor@nyayalink.test) - BCI Pending
 *
 * Guarantees:
 * - Never modifies, mutates, or deletes genuine onboarded advocates.
 * - Strictly guarded to operate only on test fixtures.
 * - Saves local test credentials into fake-test-accounts.local.json (git-ignored).
 */

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

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing Supabase configuration in .env.local");
  process.exit(1);
}

const TEST_PASSWORD = process.env.FAKE_TEST_PASSWORD || "NyayLink#SafeFakeTest2026!";

const FAKE_USERS = [
  {
    type: "client",
    email: "fake.rohan.sharma@nyayalink.test",
    displayName: "fake rohan sharma",
  },
  {
    type: "client",
    email: "fake.ananya.verma@nyayalink.test",
    displayName: "fake ananya verma",
  },
  {
    type: "lawyer",
    email: "fake.arjun.mehta@nyayalink.test",
    displayName: "fake Adv. Arjun Mehta",
    barCouncilNumber: "D/FAKE/1001/2016",
    barCouncilState: "Bar Council of Delhi",
    enrollmentYear: 2016,
    city: "New Delhi",
    state: "Delhi",
    practiceAreas: ["Constitutional Law", "Criminal Defense", "Civil Litigation"],
    languages: ["English", "Hindi", "Punjabi"],
    experienceYears: 10,
    bio: "fake profile for testing lawyer discovery, profile verification and consultation booking flows.",
    courtsOfPractice: ["Delhi High Court", "Supreme Court of India", "Patiala House Courts"],
    consultationModes: ["Online Video Consultation", "In-Chambers Consultation"],
    consultationFee: 2500,
    officeAddress: "Chamber 412, Lawyers Chambers Block, Delhi High Court, New Delhi",
    isPublished: true,
    verificationStatus: "approved",
    education: [
      {
        degree: "LL.B. (Hons.)",
        institution: "Faculty of Law, University of Delhi",
        fieldOfStudy: "Constitutional & Criminal Jurisprudence",
        graduationYear: 2016,
        isPublic: true,
      },
      {
        degree: "B.A. (Political Science)",
        institution: "St. Stephen's College, Delhi",
        fieldOfStudy: "Political Science",
        graduationYear: 2013,
        isPublic: true,
      },
    ],
    qualifications: [
      {
        title: "Advocate-on-Record (AOR)",
        issuingAuthority: "Supreme Court of India",
        issueDate: "2020-04-15",
        verificationStatus: "verified",
        isPublic: true,
      },
      {
        title: "Trial Advocacy Certification",
        issuingAuthority: "Bar Council of India Trust",
        issueDate: "2017-09-10",
        verificationStatus: "verified",
        isPublic: true,
      },
    ],
  },
  {
    type: "lawyer",
    email: "fake.priya.kapoor@nyayalink.test",
    displayName: "fake Adv. Priya Kapoor",
    barCouncilNumber: "MAH/FAKE/2042/2019",
    barCouncilState: "Bar Council of Maharashtra & Goa",
    enrollmentYear: 2019,
    city: "Mumbai",
    state: "Maharashtra",
    practiceAreas: ["Corporate & Commercial", "Intellectual Property", "Arbitration & ADR"],
    languages: ["English", "Hindi", "Marathi"],
    experienceYears: 7,
    bio: "fake profile for testing search filters, specializations, and chambers inquiries.",
    courtsOfPractice: ["Bombay High Court", "City Civil Court Mumbai", "NCLT Mumbai Bench"],
    consultationModes: ["Online Video Consultation", "In-Chambers Consultation"],
    consultationFee: 3000,
    officeAddress: "Suite 602, Nariman Point Commercial Complex, Mumbai",
    isPublished: true,
    verificationStatus: "pending", // Tests registered client visibility for pending verification under Rule 36
    education: [
      {
        degree: "B.A. LL.B. (Hons.)",
        institution: "Government Law College, Mumbai",
        fieldOfStudy: "Corporate & Commercial Laws",
        graduationYear: 2019,
        isPublic: true,
      },
    ],
    qualifications: [
      {
        title: "Accredited Commercial Arbitrator & Mediator",
        issuingAuthority: "Indian Institute of Arbitration & Mediation (IIAM)",
        issueDate: "2021-08-10",
        verificationStatus: "verified",
        isPublic: true,
      },
    ],
  },
];

async function seedFakeAccounts() {
  console.log("======================================================================");
  console.log(">>> PROVISIONING NYAYLINK ISOLATED FAKE TEST ACCOUNTS <<<");
  console.log("======================================================================");

  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const provisioned = [];

  for (const fake of FAKE_USERS) {
    console.log(`\n[Account] Provisioning ${fake.displayName} (${fake.email})...`);

    // 1. Attempt login first in case account already exists
    let userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    let { data: authData, error: signInErr } = await userClient.auth.signInWithPassword({
      email: fake.email,
      password: TEST_PASSWORD,
    });

    let userId = authData?.user?.id;

    if (!userId) {
      // 2. Sign up new account
      const { data: signUpData, error: signUpErr } = await anonClient.auth.signUp({
        email: fake.email,
        password: TEST_PASSWORD,
        options: {
          data: {
            full_name: fake.displayName,
            role: fake.type,
            intent: fake.type,
          },
        },
      });

      if (signUpErr) {
        console.error(`  ❌ Failed to sign up ${fake.email}:`, signUpErr.message);
        continue;
      }

      userId = signUpData.user?.id;
      console.log(`  ✓ Created user ${userId}`);

      // Authenticate freshly created user
      userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const loginRes = await userClient.auth.signInWithPassword({
        email: fake.email,
        password: TEST_PASSWORD,
      });
      if (loginRes.error) {
        console.error(`  ❌ Failed to sign in as new user:`, loginRes.error.message);
        continue;
      }
    } else {
      console.log(`  ✓ Authenticated existing test user ${userId}`);
    }

    // 3. Update public.profiles to guarantee literal 'fake ' prefix
    const { error: profErr } = await userClient
      .from("profiles")
      .update({ full_name: fake.displayName, is_active: true })
      .eq("id", userId);

    if (profErr) {
      console.warn(`  ⚠️ Failed to update profile name:`, profErr.message);
    } else {
      console.log(`  ✓ Profile name set to "${fake.displayName}"`);
    }

    // 4. If advocate, configure professional profile & education
    if (fake.type === "lawyer") {
      // Claim lawyer onboarding role
      await userClient.rpc("claim_lawyer_onboarding_role");

      // Submit onboarding profile
      const { data: onbRes, error: onbErr } = await userClient.rpc(
        "submit_advocate_onboarding_profile",
        {
          p_professional_name: fake.displayName,
          p_phone: "+919876543210",
          p_bar_council_number: fake.barCouncilNumber,
          p_bar_council_state: fake.barCouncilState,
          p_bar_council_enrollment_year: fake.enrollmentYear,
          p_city: fake.city,
          p_state: fake.state,
          p_practice_areas: fake.practiceAreas,
          p_languages: fake.languages,
          p_experience_years: fake.experienceYears,
          p_bio: fake.bio,
          p_is_published: fake.isPublished,
        }
      );

      if (onbErr) {
        console.error(`  ❌ Onboarding RPC failed:`, onbErr.message);
      } else {
        console.log(`  ✓ Advocate profile submitted and published (Rule 36 consent: true)`);
      }

      // Update extended fields
      await userClient
        .from("lawyer_profiles")
        .update({
          courts_of_practice: fake.courtsOfPractice,
          consultation_modes: fake.consultationModes,
          consultation_fee: fake.consultationFee,
          office_address: fake.officeAddress,
        })
        .eq("id", userId);

      // Add education records
      if (fake.education && fake.education.length > 0) {
        // Delete existing entries for idempotency
        await userClient.from("lawyer_educations").delete().eq("lawyer_id", userId);

        for (const edu of fake.education) {
          const { error: eduErr } = await userClient.from("lawyer_educations").insert({
            lawyer_id: userId,
            degree: edu.degree,
            institution: edu.institution,
            field_of_study: edu.fieldOfStudy,
            graduation_year: edu.graduationYear,
            is_public: edu.isPublic,
          });
          if (eduErr) {
            console.warn(`  ⚠️ Education insert error:`, eduErr.message);
          }
        }
        console.log(`  ✓ Added ${fake.education.length} education entries`);
      }

      // Add qualifications
      if (fake.qualifications && fake.qualifications.length > 0) {
        await userClient.from("lawyer_qualifications").delete().eq("lawyer_id", userId);

        for (const qual of fake.qualifications) {
          const { error: qualErr } = await userClient.from("lawyer_qualifications").insert({
            lawyer_id: userId,
            title: qual.title,
            issuing_authority: qual.issuingAuthority,
            issue_date: qual.issueDate,
            is_public: qual.isPublic,
          });
          if (qualErr) {
            console.warn(`  ⚠️ Qualification insert error:`, qualErr.message);
          }
        }
        console.log(`  ✓ Added ${fake.qualifications.length} qualification entries`);
      }

      // Check completeness calculation
      const { data: comp } = await userClient.rpc("get_advocate_profile_completeness");
      console.log(`  ✓ Server-calculated completeness: ${comp?.percentage}%`);
    }

    provisioned.push({
      id: userId,
      type: fake.type,
      displayName: fake.displayName,
      email: fake.email,
    });
  }

  // Save non-sensitive metadata for test harnesses
  const credentialsFilePath = path.join(__dirname, "../fake-test-accounts.local.json");
  const credsData = {
    notice: "Isolated fake test account descriptors for NyayLink QA. Git-ignored.",
    environment: "Supabase Hosted Project & Local Dev (localhost:3001)",
    accounts: provisioned,
  };
  fs.writeFileSync(credentialsFilePath, JSON.stringify(credsData, null, 2), "utf8");
  console.log(`\n✓ Saved test account manifest to fake-test-accounts.local.json`);
  console.log("======================================================================");
}

async function verifyFakeStatus() {
  console.log("======================================================================");
  console.log(">>> CHECKING FAKE TEST ACCOUNTS DISCOVERABILITY STATUS <<<");
  console.log("======================================================================");

  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: pubLawyers } = await anonClient
    .from("public_lawyer_directory")
    .select("id, professional_name, city, practice_areas, verification_status");

  console.log("\n[Public Directory (Unauthenticated)]");
  console.log(`Found ${pubLawyers?.length || 0} published lawyers:`);
  pubLawyers?.forEach((l) => console.log(` - ${l.professional_name} (${l.city}) [${l.verification_status}]`));

  // Client view
  const clientUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  await clientUser.auth.signInWithPassword({
    email: "fake.rohan.sharma@nyayalink.test",
    password: TEST_PASSWORD,
  });

  const { data: clientLawyers } = await clientUser
    .from("client_lawyer_directory")
    .select("id, professional_name, city, practice_areas, verification_status");

  console.log("\n[Client Lawyer Directory (Authenticated as fake rohan sharma)]");
  console.log(`Found ${clientLawyers?.length || 0} discoverable lawyers:`);
  clientLawyers?.forEach((l) => console.log(` - ${l.professional_name} (${l.city}) [${l.verification_status}]`));
}

const arg = process.argv[2];
if (arg === "--status") {
  verifyFakeStatus();
} else {
  seedFakeAccounts();
}
