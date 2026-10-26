const assert = require("assert");
const fs = require("fs");
const path = require("path");
const http = require("http");
const QRCode = require("qrcode");
const { PNG } = require("pngjs");
const jsQR = require("jsqr");

async function runTests() {
  console.log("======================================================================");
  console.log(">>> NYAYLINK /INSTALL LANDING PAGE & QR CODE AUDIT <<<");
  console.log("======================================================================\n");

  let totalTests = 0;
  let passedTests = 0;

  function test(name, fn) {
    totalTests++;
    try {
      fn();
      console.log(`  ✓ [PASS] ${name}`);
      passedTests++;
    } catch (err) {
      console.error(`  ✗ [FAIL] ${name}: ${err.message}`);
    }
  }

  // 1. Audit Proxy Middleware
  console.log("[Test 1/6] Auditing Proxy Whitelist for /install Route...");
  test("lib/supabase/proxy.ts allows /install without authentication redirect", () => {
    const proxyContent = fs.readFileSync(path.join(process.cwd(), "lib/supabase/proxy.ts"), "utf8");
    assert.ok(
      proxyContent.includes('!request.nextUrl.pathname.startsWith("/install")'),
      "proxy.ts must explicitly whitelist /install"
    );
  });

  // 2. HTTP Accessibility of /install
  console.log("\n[Test 2/6] Verifying Public HTTP Response for /install...");
  await new Promise((resolve) => {
    http.get("http://localhost:3000/install", (res) => {
      totalTests++;
      try {
        assert.strictEqual(res.statusCode, 200, `Expected 200 OK, got ${res.statusCode}`);
        console.log(`  ✓ [PASS] GET /install returned HTTP 200 OK (no 307/308 auth redirect)`);
        passedTests++;
      } catch (err) {
        console.error(`  ✗ [FAIL] GET /install: ${err.message}`);
      }
      resolve();
    }).on("error", (err) => {
      totalTests++;
      console.error(`  ✗ [FAIL] GET /install network request error: ${err.message}`);
      resolve();
    });
  });

  // 3. QR Code Encoding & Decoding Roundtrip
  console.log("\n[Test 3/6] Validating QR Code Generation & Decodability...");
  const CANONICAL_URL = "https://nyay.live/install";

  await new Promise((resolve) => {
    QRCode.toBuffer(CANONICAL_URL, { errorCorrectionLevel: "M", margin: 2, scale: 8 }, (err, buffer) => {
      test("QRCode successfully generates buffer for canonical URL", () => {
        assert.ifError(err);
        assert.ok(buffer.length > 500, "Buffer should have non-trivial size");
      });

      test("QR decoder (jsQR) successfully extracts canonical URL from generated image", () => {
        const png = PNG.sync.read(buffer);
        const code = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
        assert.ok(code, "jsQR must successfully detect and decode QR code");
        assert.strictEqual(
          code.data,
          CANONICAL_URL,
          `Decoded QR URL must equal '${CANONICAL_URL}', got '${code.data}'`
        );
        assert.ok(
          !code.data.includes("localhost"),
          "QR code must NEVER encode localhost"
        );
      });
      resolve();
    });
  });

  // 4. Showcase Screenshots Verification
  console.log("\n[Test 4/6] Verifying Showcase Screenshot Assets on Disk...");
  const showcaseFiles = [
    "showcase-homepage.png",
    "showcase-intake.png",
    "showcase-lawyers.png",
    "showcase-checklists.png",
  ];

  for (const filename of showcaseFiles) {
    test(`public/screenshots/${filename} exists with non-zero size`, () => {
      const fullPath = path.join(process.cwd(), "public/screenshots", filename);
      assert.ok(fs.existsSync(fullPath), `File must exist: ${filename}`);
      const stats = fs.statSync(fullPath);
      assert.ok(stats.size > 50000, `Screenshot ${filename} must be high-res (>50KB), got ${stats.size} bytes`);
    });
  }

  // 5. Audit Page Component & Metadata
  console.log("\n[Test 5/6] Auditing app/install/page.tsx Metadata & Canonical Tags...");
  test("app/install/page.tsx defines canonical URL and OpenGraph metadata", () => {
    const pageContent = fs.readFileSync(path.join(process.cwd(), "app/install/page.tsx"), "utf8");
    assert.ok(pageContent.includes('canonical: "https://nyay.live/install"'), "Must specify canonical URL");
    assert.ok(pageContent.includes("Install NyayLink"), "Must include clear title");
    assert.ok(pageContent.includes("InstallLanding"), "Must render InstallLanding component");
  });

  test("components/pwa/install-landing.tsx encodes CANONICAL_INSTALL_URL", () => {
    const componentContent = fs.readFileSync(
      path.join(process.cwd(), "components/pwa/install-landing.tsx"),
      "utf8"
    );
    assert.ok(
      componentContent.includes('const CANONICAL_INSTALL_URL = "https://nyay.live/install"'),
      "Component must use production canonical URL for QR"
    );
    assert.ok(componentContent.includes("QRCode.toDataURL"), "Component must generate QR code");
    assert.ok(componentContent.includes("usePWAInstall"), "Component must integrate PWA install hook");
    assert.ok(componentContent.includes("IOSInstallModal"), "Component must include iOS install modal");
    assert.ok(componentContent.includes("navigator.clipboard"), "Component must provide clipboard copy");
  });

  // 6. Translation Coverage
  console.log("\n[Test 6/6] Verifying Bilingual Coverage (English & Devanagari Hindi)...");
  const enDict = fs.readFileSync(path.join(process.cwd(), "lib/i18n/dictionaries/en.ts"), "utf8");
  const hiDict = fs.readFileSync(path.join(process.cwd(), "lib/i18n/dictionaries/hi.ts"), "utf8");

  test("en.ts has complete installPage dictionary", () => {
    assert.ok(enDict.includes("installPage: {"), "en.ts must include installPage dictionary");
    assert.ok(enDict.includes("Meet NyayLink. Legal access, reimagined."), "en.ts must include hero heading");
    assert.ok(enDict.includes("The Unfolding Brief"), "en.ts must include screenshot showcase copy");
    assert.ok(enDict.includes("AI Preconsultation"), "en.ts must include AI Preconsultation pillar");
  });

  test("hi.ts has complete installPage dictionary in Devanagari Hindi", () => {
    assert.ok(hiDict.includes("installPage: {"), "hi.ts must include installPage dictionary");
    assert.ok(hiDict.includes("मिलिए न्यायलिंक से। विधिक सहायता, नए रूप में।"), "hi.ts must include Hindi hero heading");
    assert.ok(hiDict.includes("विधिक पत्र (The Unfolding Brief)"), "hi.ts must include Hindi screenshot copy");
    assert.ok(hiDict.includes("एआई पूर्व-परामर्श"), "hi.ts must include Hindi AI Preconsultation pillar");
    assert.ok(hiDict.includes("सत्यापित अधिवक्ता डायरेक्टरी"), "hi.ts must include Hindi advocate directory pillar");
  });

  console.log("\n======================================================================");
  console.log(`>>> TOTAL ASSERTIONS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests} <<<`);
  console.log("======================================================================\n");

  if (totalTests !== passedTests) {
    process.exit(1);
  }
}

runTests();
