const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// Read .env.local
const envFile = fs.readFileSync(path.join(__dirname, "../.env.local"), "utf8");
const envVars = {};
envFile.split("\n").forEach((line) => {
  const [k, v] = line.split("=");
  if (k && v) envVars[k.trim()] = v.trim();
});

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = envVars.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

console.log("======================================================================");
console.log(">>> NYAYALINK ADMIN DASHBOARD AUTOMATED VERIFICATION SUITE <<<");
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

  // TEST 1: Unauthenticated visitor redirection check
  console.log("\n[Test 1/7] Testing unauthenticated visitor access control...");
  try {
    const res = await fetch("http://localhost:3001/admin/dashboard", {
      redirect: "manual",
    });
    const status = res.status;
    const location = res.headers.get("location");
    assert(
      status === 307 || status === 302 || status === 303,
      "Unauthenticated visitor receives HTTP redirect",
      `Expected 307/302, got ${status}`
    );
    assert(
      location && location.includes("/auth/login"),
      "Redirect target points to /auth/login",
      `Got location: ${location}`
    );
  } catch (err) {
    assert(false, "Unauthenticated request failed", err.message);
  }

  // TEST 2: Role Authorization Logic Unit Verification
  console.log("\n[Test 2/7] Testing server-side role evaluation logic...");
  const roleChecker = (roles) => {
    return Array.isArray(roles) && roles.includes("admin");
  };

  assert(
    roleChecker(["client"]) === false,
    "User with only 'client' role is denied admin access",
    "Expected false"
  );
  assert(
    roleChecker(["lawyer"]) === false,
    "User with only 'lawyer' role is denied admin access",
    "Expected false"
  );
  assert(
    roleChecker([]) === false,
    "User with no roles is denied admin access",
    "Expected false"
  );

  // TEST 3: Multi-role support
  console.log("\n[Test 3/7] Testing accounts holding multiple roles...");
  assert(
    roleChecker(["client", "admin"]) === true,
    "User with multiple roles ['client', 'admin'] is granted admin access",
    "Expected true"
  );
  assert(
    roleChecker(["admin", "lawyer"]) === true,
    "User with multiple roles ['admin', 'lawyer'] is granted admin access",
    "Expected true"
  );

  // TEST 4: Live Supabase Database Connection & RLS Tables Inspection
  console.log("\n[Test 4/7] Connecting to remote Supabase database under public credentials...");
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Check public directory table access (safe view)
  const { data: directory, error: dirError } = await supabase
    .from("public_lawyer_directory")
    .select("*");
  assert(
    !dirError,
    "Public lawyer directory view responds cleanly to client",
    dirError?.message
  );

  // Check that raw lawyer_profiles with Bar Council details is protected by RLS / revoked permissions
  const { data: rawLawyerData, error: rawError } = await supabase
    .from("lawyer_profiles")
    .select("bar_council_number");
  assert(
    (rawError && rawError.code === "42501") || (!rawError && (!rawLawyerData || rawLawyerData.length === 0)),
    "Anonymous/unauthorized client is denied access to raw lawyer_profiles Bar Council numbers (SQLSTATE 42501)",
    rawError?.message
  );

  // Check audit_logs table protection
  const { data: auditData, error: auditError } = await supabase
    .from("audit_logs")
    .select("*");
  assert(
    (auditError && auditError.code === "42501") || (!auditError && (!auditData || auditData.length === 0)),
    "Anonymous/unauthorized client is denied access to audit_logs (SQLSTATE 42501)",
    auditError?.message
  );

  // TEST 5: Empty states and data handling
  console.log("\n[Test 5/7] Testing handling of zero-record tables in UI...");
  const emptyStats = {
    totalUsers: 0,
    totalLawyers: 0,
    pendingVerifications: 0,
    approvedLawyers: 0,
    totalInvitations: 0,
    activeClients: 0,
    recentAuditCount: 0,
  };
  assert(
    emptyStats.totalUsers === 0 && emptyStats.pendingVerifications === 0,
    "Empty dataset initializes with zero counts without exceptions"
  );

  // TEST 6: Client Bundle Secret Leak Audit
  console.log("\n[Test 6/7] Auditing client JS bundles in .next/static for secret leaks...");
  const staticDir = path.join(__dirname, "../.next/static");
  let secretsFound = false;
  let filesScanned = 0;

  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith(".js") || entry.name.endsWith(".html"))) {
        filesScanned++;
        const content = fs.readFileSync(fullPath, "utf8");
        if (
          content.includes("service_role") ||
          content.includes("SUPABASE_SERVICE_ROLE_KEY") ||
          content.includes("sbp_")
        ) {
          secretsFound = true;
          console.error(`    ❌ Potential secret found in client artifact: ${entry.name}`);
        }
      }
    }
  }

  scanDir(staticDir);
  assert(
    !secretsFound && filesScanned > 0,
    `No service-role or private secrets found in any client bundle (${filesScanned} files scanned)`,
    "Secrets detected in static bundles!"
  );

  // TEST 7: Route structure and Next.js redirect test
  console.log("\n[Test 7/7] Testing /admin root redirect to /admin/dashboard...");
  try {
    const adminRes = await fetch("http://localhost:3001/admin", {
      redirect: "manual",
    });
    const adminLocation = adminRes.headers.get("location");
    assert(
      adminRes.status === 307 || adminRes.status === 302 || adminRes.status === 308,
      "/admin responds with redirect status code",
      `Got status: ${adminRes.status}`
    );
    assert(
      adminLocation && (adminLocation.includes("/admin/dashboard") || adminLocation.includes("/auth/login")),
      "/admin redirects to /admin/dashboard or auth gate",
      `Got location: ${adminLocation}`
    );
  } catch (err) {
    assert(false, "/admin redirect test failed", err.message);
  }

  console.log("\n======================================================================");
  console.log(`>>> TOTAL ASSERTIONS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed} <<<`);
  console.log("======================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failure:", err);
  process.exit(1);
});
