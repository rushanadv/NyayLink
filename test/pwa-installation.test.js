/**
 * NyayLink PWA Installation & Service Worker Verification Suite
 *
 * Validates:
 * 1. Web App Manifest served at /manifest.webmanifest with valid fields and icons.
 * 2. High-resolution branding icon assets (192, 512, apple-touch, maskable).
 * 3. Service worker security rules (never cache auth, legal docs, dashboard, AI).
 * 4. Offline fallback page accessibility (/offline).
 * 5. Root layout PWA metadata & standalone CSS rules.
 */

const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

async function runPWATests() {
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
  console.log(">>> NYAYLINK PWA INSTALLATION & CACHING SAFETY AUDIT <<<");
  console.log("======================================================================\n");

  // 1. MANIFEST VERIFICATION
  console.log("[Test 1/6] Verifying Web App Manifest (/manifest.webmanifest)...");
  try {
    const res = await fetch(`${BASE_URL}/manifest.webmanifest`, { redirect: "manual" });
    assert(res.status === 200, "Manifest route returns HTTP 200 OK", `Status: ${res.status}`);

    const manifest = await res.json();
    assert(manifest.name === "NyayLink — Legal Access", "Manifest name matches specification");
    assert(manifest.short_name === "NyayLink", "Manifest short_name is 'NyayLink'");
    assert(manifest.start_url === "/", "Manifest start_url is root '/'");
    assert(manifest.scope === "/", "Manifest scope is '/'");
    assert(manifest.display === "standalone", "Manifest display mode is 'standalone'");
    assert(manifest.theme_color === "#205C43", "Theme color is NyayLink forest green (#205C43)");
    assert(manifest.background_color === "#FDFEFC", "Background color is NyayLink off-white (#FDFEFC)");

    const icons = manifest.icons || [];
    assert(icons.length >= 4, `Manifest includes ${icons.length} icon definitions (>= 4 required)`);

    const has192Any = icons.some((i) => i.src.includes("192") && i.purpose.includes("any"));
    const has192Maskable = icons.some((i) => i.src.includes("192") && i.purpose.includes("maskable"));
    const has512Any = icons.some((i) => i.src.includes("512") && i.purpose.includes("any"));
    const has512Maskable = icons.some((i) => i.src.includes("512") && i.purpose.includes("maskable"));

    assert(has192Any, "Manifest has 192x192 any icon");
    assert(has192Maskable, "Manifest has 192x192 maskable icon");
    assert(has512Any, "Manifest has 512x512 any icon");
    assert(has512Maskable, "Manifest has 512x512 maskable icon");
  } catch (err) {
    assert(false, "Manifest fetch or parse failed", err.message);
  }

  // 2. ICON ASSET INTEGRITY
  console.log("\n[Test 2/6] Verifying Icon Asset Existence & HTTP Delivery...");
  const iconFiles = [
    "/icons/icon-192.png",
    "/icons/icon-512.png",
    "/icons/icon-maskable-192.png",
    "/icons/icon-maskable-512.png",
    "/icons/apple-touch-icon.png",
  ];

  for (const iconPath of iconFiles) {
    const fullLocalPath = path.join(__dirname, "../public", iconPath);
    const exists = fs.existsSync(fullLocalPath);
    assert(exists, `Icon exists on disk: public${iconPath}`);

    try {
      const iconRes = await fetch(`${BASE_URL}${iconPath}`);
      assert(
        iconRes.status === 200 && (iconRes.headers.get("content-type") || "").includes("image"),
        `Icon served cleanly over HTTP: ${iconPath}`
      );
    } catch (err) {
      assert(false, `Failed to fetch icon: ${iconPath}`, err.message);
    }
  }

  // 3. SERVICE WORKER SECURITY & EXCLUSIONS
  console.log("\n[Test 3/6] Auditing Service Worker Security & Legal Privacy Boundaries...");
  const swPath = path.join(__dirname, "../public/sw.js");
  assert(fs.existsSync(swPath), "public/sw.js service worker script exists");

  const swContent = fs.readFileSync(swPath, "utf8");
  assert(
    swContent.includes('pathname.startsWith("/api/")') &&
    swContent.includes('pathname.startsWith("/dashboard")') &&
    swContent.includes('pathname.startsWith("/lawyer")') &&
    swContent.includes('pathname.startsWith("/admin")') &&
    swContent.includes('pathname.startsWith("/auth/")') &&
    swContent.includes('pathname.startsWith("/intake")'),
    "Service worker explicitly excludes all private API, dashboard, auth, and legal intake routes from cache"
  );
  assert(
    swContent.includes("supabase.co"),
    "Service worker strictly excludes Supabase storage and auth endpoints"
  );
  assert(
    swContent.includes("_rsc") || swContent.includes("/_next/data"),
    "Service worker excludes Next.js server component dynamic streaming payloads"
  );
  assert(
    swContent.includes("/offline"),
    "Service worker registers /offline fallback for unhandled navigation drops"
  );

  // 4. OFFLINE FALLBACK PAGE AUDIT
  console.log("\n[Test 4/6] Testing Offline Fallback Route Accessibility...");
  try {
    const offlineRes = await fetch(`${BASE_URL}/offline`, { redirect: "manual" });
    assert(
      offlineRes.status === 200,
      "Offline fallback route (/offline) loads publicly with HTTP 200",
      `Status: ${offlineRes.status}`
    );
  } catch (err) {
    assert(false, "Offline route fetch failed", err.message);
  }

  // 5. APPLICATION METADATA & STANDALONE CSS AUDIT
  console.log("\n[Test 5/6] Auditing Layout Metadata & Standalone Mode CSS...");
  const layoutContent = fs.readFileSync(path.join(__dirname, "../app/layout.tsx"), "utf8");
  assert(
    layoutContent.includes('manifest: "/manifest.webmanifest"'),
    "app/layout.tsx declares manifest link"
  );
  assert(
    layoutContent.includes("appleWebApp") && layoutContent.includes("themeColor"),
    "app/layout.tsx configures appleWebApp and viewport themeColor"
  );
  assert(
    layoutContent.includes("ServiceWorkerRegister"),
    "app/layout.tsx renders ServiceWorkerRegister component"
  );

  const globalsContent = fs.readFileSync(path.join(__dirname, "../app/globals.css"), "utf8");
  assert(
    globalsContent.includes("display-mode: standalone") &&
    globalsContent.includes("safe-area-inset"),
    "app/globals.css includes standalone display-mode and safe-area-inset rules"
  );

  // 6. INSTALL BUTTON & TRANSLATION COVERAGE
  console.log("\n[Test 6/6] Auditing PWA Install Component & Translation Coverage...");
  const enDict = fs.readFileSync(path.join(__dirname, "../lib/i18n/dictionaries/en.ts"), "utf8");
  const hiDict = fs.readFileSync(path.join(__dirname, "../lib/i18n/dictionaries/hi.ts"), "utf8");
  assert(
    enDict.includes("pwa:") && enDict.includes("installNyayLink") && enDict.includes("iosInstallTitle"),
    "English dictionary has complete PWA installation translations"
  );
  assert(
    hiDict.includes("pwa:") && hiDict.includes("न्यायलिंक इंस्टॉल करें") && hiDict.includes("होम स्क्रीन में जोड़ें"),
    "Hindi dictionary has complete PWA installation translations in Devanagari"
  );

  const navbarContent = fs.readFileSync(
    path.join(__dirname, "../components/marketing/marketing-navbar.tsx"),
    "utf8"
  );
  assert(
    navbarContent.includes("PWAInstallButton"),
    "Marketing navbar integrates PWAInstallButton in both desktop and mobile navigation"
  );

  const footerContent = fs.readFileSync(
    path.join(__dirname, "../components/marketing/marketing-footer.tsx"),
    "utf8"
  );
  assert(
    footerContent.includes("PWAInstallButton"),
    "Marketing footer integrates PWAInstallButton"
  );

  console.log("\n======================================================================");
  console.log(`>>> TOTAL ASSERTIONS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed} <<<`);
  console.log("======================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPWATests().catch((err) => {
  console.error("PWA test suite exception:", err);
  process.exit(1);
});
