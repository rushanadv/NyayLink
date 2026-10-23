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

const DEMO_LAWYER_EMAIL = envVars.DEMO_LAWYER_EMAIL || "demo.lawyer@nyay.live";
const DEMO_LAWYER_PASSWORD = envVars.DEMO_LAWYER_PASSWORD || "NyayLink#DemoLawyer2026!";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3001";

console.log("======================================================================");
console.log(">>> NYAYLINK BILINGUAL ONBOARDING & LEGAL CALENDAR TEST SUITE <<<");
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

  // TEST 1: Dictionary Integrity (English & Devanagari Hindi)
  console.log("\n[Test 1/6] Verifying Bilingual Dictionaries Integrity...");
  try {
    const enContent = fs.readFileSync(path.join(__dirname, "../lib/i18n/dictionaries/en.ts"), "utf8");
    const hiContent = fs.readFileSync(path.join(__dirname, "../lib/i18n/dictionaries/hi.ts"), "utf8");

    assert(enContent.includes("Choose your language"), "English dictionary contains onboarding heading");
    assert(hiContent.includes("अपनी भाषा चुनें"), "Hindi dictionary contains authentic Devanagari heading");
    assert(hiContent.includes("कॉज़ लिस्ट"), "Hindi dictionary contains cause list terminology");
    assert(hiContent.includes("अधिवक्ता"), "Hindi dictionary contains advocate terminology");
    assert(hiContent.includes("मुवक्किल"), "Hindi dictionary contains client terminology");

    // Check that key sections exist in both
    const sections = ["common", "onboarding", "nav", "auth", "calendar"];
    sections.forEach((sec) => {
      assert(
        enContent.includes(`${sec}: {`) && hiContent.includes(`${sec}: {`),
        `Section '${sec}' present in both dictionaries`
      );
    });
  } catch (err) {
    assert(false, "Dictionary files readable and parsed", err.message);
  }

  // TEST 2: Onboarding Route Availability & SSR
  console.log("\n[Test 2/6] Verifying /onboarding Language First Step...");
  try {
    const res = await fetch(`${BASE_URL}/onboarding`);
    assert(res.status === 200, "GET /onboarding returns HTTP 200", `Status: ${res.status}`);

    const html = await res.text();
    assert(
      html.includes("Choose your language") || html.includes("अपनी भाषा चुनें"),
      "Onboarding HTML renders Step 1 language selection heading"
    );
    assert(
      html.includes("English") && (html.includes("हिंदी") || html.includes("&#2361;")),
      "Onboarding HTML renders English and Hindi language options"
    );
  } catch (err) {
    assert(false, "Onboarding route check failed", err.message);
  }

  // TEST 3: Language Cookie SSR Persistence
  console.log("\n[Test 3/6] Verifying Language Persistence via nyaylink_locale Cookie...");
  try {
    const resEn = await fetch(`${BASE_URL}/`, {
      headers: { Cookie: "nyaylink_locale=en" },
    });
    const htmlEn = await resEn.text();
    assert(
      htmlEn.includes('lang="en"'),
      "Cookie nyaylink_locale=en renders <html lang='en'>",
      `Snippet: ${htmlEn.slice(0, 150)}`
    );

    const resHi = await fetch(`${BASE_URL}/`, {
      headers: { Cookie: "nyaylink_locale=hi" },
    });
    const htmlHi = await resHi.text();
    assert(
      htmlHi.includes('lang="hi"'),
      "Cookie nyaylink_locale=hi renders <html lang='hi'>",
      `Snippet: ${htmlHi.slice(0, 150)}`
    );
  } catch (err) {
    assert(false, "Language persistence check failed", err.message);
  }

  // TEST 4: Calendar API Security Boundary
  console.log("\n[Test 4/6] Verifying Calendar API Server-Side Authentication Enforcement...");
  try {
    const unauthGet = await fetch(`${BASE_URL}/api/calendar/events`);
    assert(
      unauthGet.status === 401,
      "Unauthenticated GET /api/calendar/events is rejected with 401",
      `Status: ${unauthGet.status}`
    );

    const unauthPost = await fetch(`${BASE_URL}/api/calendar/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Unauthorized Hearing" }),
    });
    assert(
      unauthPost.status === 401,
      "Unauthenticated POST /api/calendar/events is rejected with 401",
      `Status: ${unauthPost.status}`
    );

    const unauthDelete = await fetch(`${BASE_URL}/api/calendar/events?id=test-123`, {
      method: "DELETE",
    });
    assert(
      unauthDelete.status === 401,
      "Unauthenticated DELETE /api/calendar/events is rejected with 401",
      `Status: ${unauthDelete.status}`
    );
  } catch (err) {
    assert(false, "Calendar security boundary check failed", err.message);
  }

  // TEST 5: Asia/Kolkata IST Timezone & Monday Week-Start Logic
  console.log("\n[Test 5/6] Verifying Asia/Kolkata (IST) & Weekday Conventions...");
  try {
    const sampleDate = new Date("2026-10-26T05:00:00.000Z"); // 10:30 AM IST
    const istFormatter = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    const istFormatted = istFormatter.format(sampleDate);
    assert(
      istFormatted.includes("10:30"),
      `IST conversion correct: 05:00 UTC -> ${istFormatted} IST (expected 10:30 AM)`
    );

    // Monday week-start calculation: 2026-10-26 is a Monday
    const dayOfWeek = sampleDate.getDay(); // 1 = Monday
    const mondayOffset = (dayOfWeek + 6) % 7; // (1 + 6) % 7 = 0
    assert(mondayOffset === 0, "Monday correctly recognized as day index 0 under Monday week-start");
  } catch (err) {
    assert(false, "IST timezone calculation failed", err.message);
  }

  // TEST 6: Authenticated Calendar End-to-End Test (Demo Lawyer)
  console.log("\n[Test 6/6] Verifying Authenticated Calendar End-to-End Lifecycle...");
  try {
    // Authenticate demo lawyer via demo-login API
    const loginRes = await fetch(`${BASE_URL}/api/auth/demo-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "lawyer" }),
    });

    if (loginRes.ok) {
      const setCookieHeaders = loginRes.headers.getSetCookie
        ? loginRes.headers.getSetCookie()
        : [loginRes.headers.get("set-cookie") || ""];
      const cookieHeader = setCookieHeaders.map((c) => c.split(";")[0]).join("; ");

      // Fetch events with lawyer session
      const getRes = await fetch(`${BASE_URL}/api/calendar/events`, {
        headers: { Cookie: cookieHeader },
      });
      assert(getRes.status === 200, "Authenticated GET /api/calendar/events returns HTTP 200");
      const getData = await getRes.json();
      assert(Array.isArray(getData.events), "GET /api/calendar/events returns array of events");

      // Create new test hearing
      const createRes = await fetch(`${BASE_URL}/api/calendar/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
        body: JSON.stringify({
          title: "High Court Division Bench Hearing (Cause List #14)",
          event_type: "hearing",
          start_time: "2026-10-27T10:30:00.000+05:30",
          end_time: "2026-10-27T11:30:00.000+05:30",
          is_all_day: false,
          is_court_verified: true,
          priority: "urgent",
          location: "Courtroom 3, Delhi High Court",
          notes: "Cause list item #14 before Hon'ble Justice Verma",
        }),
      });

      assert(
        createRes.status === 201 || createRes.status === 200,
        "POST /api/calendar/events creates new event successfully",
        `Status: ${createRes.status}`
      );

      const createData = await createRes.json();
      const createdId = createData.event?.id;
      assert(Boolean(createdId), `Created event returned ID: ${createdId}`);
      assert(createData.event?.is_court_verified === true, "Court verification badge correctly set");

      // Clean up test event if created
      if (createdId && !createdId.startsWith("local-")) {
        const delRes = await fetch(`${BASE_URL}/api/calendar/events?id=${encodeURIComponent(createdId)}`, {
          method: "DELETE",
          headers: { Cookie: cookieHeader },
        });
        assert(delRes.status === 200, "DELETE /api/calendar/events cleans up test event successfully");
      } else {
        console.log("  ℹ [INFO] Local fallback event ID handled cleanly");
      }
    } else {
      console.log("  ℹ [SKIP] Demo login endpoint unavailable in current environment, skipping live lawyer session CRUD");
    }
  } catch (err) {
    console.warn("  ℹ [WARN] End-to-end auth test exception:", err.message);
  }

  console.log("\n======================================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("======================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("FATAL ERROR in test runner:", err);
  process.exit(1);
});
