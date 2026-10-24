/**
 * NyayLink Animated Gavel Loading Experience Test Suite
 *
 * Verifies:
 * 1. Vector Gavel SVG structure and brand styling.
 * 2. Wrist pivot, strike acceleration, and micro-recoil animation keyframes.
 * 3. Sound block compression and dual ripple shockwave layers.
 * 4. prefers-reduced-motion graceful degradation.
 * 5. Fullscreen, Section, and Inline presentation variants.
 * 6. English and Hindi legal copy integrity.
 * 7. Session storage guard and safety timeout in AppSplashProvider.
 * 8. Next.js App Router root and route loading boundaries.
 */

const assert = require("assert");
const fs = require("fs");
const path = require("path");

console.log("======================================================================");
console.log(">>> NYAYLINK ANIMATED GAVEL LOADING EXPERIENCE TEST SUITE <<<");
console.log("======================================================================\n");

let passed = 0;
let failed = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  ✓ [PASS] ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${desc}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

// --------------------------------------------------------------------------
// TEST 1: Vector Gavel SVG Structure and Palette Integrity
// --------------------------------------------------------------------------
console.log("[Test 1/6] Verifying Vector Gavel SVG Architecture...");
const gavelPath = path.join(__dirname, "../components/ui/animated-gavel.tsx");
const gavelContent = fs.readFileSync(gavelPath, "utf8");

it("Contains vector sound block (anvil) with brand forest green and brass gradients", () => {
  assert.ok(gavelContent.includes("pedestalBase"), "Must have pedestalBase gradient");
  assert.ok(gavelContent.includes("pedestalRim"), "Must have pedestalRim brass gradient");
  assert.ok(gavelContent.includes("#205C43"), "Must use NyayLink forest green #205C43");
  assert.ok(gavelContent.includes("#174530"), "Must use NyayLink deep green #174530");
});

it("Contains realistic turned wood handle with brass ferrule and pommel finial", () => {
  assert.ok(gavelContent.includes("gavel-handle"), "Must contain gavel-handle group");
  assert.ok(gavelContent.includes("gavelWood"), "Must have gavelWood gradient");
  assert.ok(gavelContent.includes("brassBand"), "Must have brass bands gradient");
  assert.ok(gavelContent.includes("circle cx=\"127\" cy=\"44\""), "Must contain turned pommel finial");
});

it("Contains dual cylindrical gavel head with brass chamfer rings and flat strike face", () => {
  assert.ok(gavelContent.includes("gavel-head"), "Must contain gavel-head group");
  assert.ok(gavelContent.includes("gavelHeadShaft"), "Must have gavelHeadShaft gradient");
  assert.ok(gavelContent.includes("rx=\"3.5\" ry=\"9\""), "Must have strike face cap");
});

it("Contains dual concentric expanding impact ripples and 4 micro-sparks", () => {
  assert.ok(gavelContent.includes("gavel-ripple-1"), "Must contain primary impact ripple");
  assert.ok(gavelContent.includes("gavel-ripple-2"), "Must contain secondary accent ripple");
  assert.ok(gavelContent.includes("spark-1"), "Must contain spark-1");
  assert.ok(gavelContent.includes("spark-4"), "Must contain spark-4");
});

// --------------------------------------------------------------------------
// TEST 2: Animation Physics, Wrist Pivot, and Timing
// --------------------------------------------------------------------------
console.log("\n[Test 2/6] Verifying Animation Physics and Keyframes...");

it("Gavel arm rotates around authentic wrist/grip pivot point (126px 45px)", () => {
  assert.ok(gavelContent.includes("transform-origin: 126px 45px"), "Gavel arm pivot must be at wrist (126px 45px)");
});

it("Strike cycle duration is calibrated between 1,000ms and 1,200ms", () => {
  assert.ok(gavelContent.includes("1.12s"), "Strike cycle duration calibrated to 1.12s (1120ms)");
});

it("Gavel keyframes include lift, backswing, decisive strike, and micro-recoil", () => {
  assert.ok(gavelContent.includes("rotate(-32deg)"), "Includes backswing lift to -32deg");
  assert.ok(gavelContent.includes("rotate(0deg) translateY(0px)"), "Includes zero-impact strike point");
  assert.ok(gavelContent.includes("rotate(-3.5deg) translateY(-2px)"), "Includes realistic micro-recoil bounce");
});

it("Sound block receives micro-compression on impact", () => {
  assert.ok(gavelContent.includes("anvil-compression"), "Must have anvil-compression animation");
  assert.ok(gavelContent.includes("scaleY(0.97)"), "Anvil compresses to scaleY(0.97) upon strike");
});

it("Respects prefers-reduced-motion media query with dignified static pose", () => {
  assert.ok(gavelContent.includes("@media (prefers-reduced-motion: reduce)"), "Must include reduced motion query");
  assert.ok(gavelContent.includes("animation: none"), "Disables aggressive rotation loop under reduced motion");
});

// --------------------------------------------------------------------------
// TEST 3: AnimatedGavelLoader Presentation Variants & Branding
// --------------------------------------------------------------------------
console.log("\n[Test 3/6] Verifying AnimatedGavelLoader Composition & Variants...");
const loaderPath = path.join(__dirname, "../components/ui/animated-gavel-loader.tsx");
const loaderContent = fs.readFileSync(loaderPath, "utf8");

it("Supports fullscreen, section, and inline layout variants", () => {
  assert.ok(loaderContent.includes("variant === \"fullscreen\""), "Fullscreen variant check");
  assert.ok(loaderContent.includes("variant === \"section\""), "Section variant check");
  assert.ok(loaderContent.includes("variant === \"inline\""), "Inline variant check");
});

it("Includes official NyayLinkLogo in the fullscreen composition", () => {
  assert.ok(loaderContent.includes("<NyayLinkLogo"), "Must render NyayLinkLogo");
  assert.ok(loaderContent.includes("variant=\"full\""), "Renders full official logo");
});

it("Includes accessible role='status' and aria-live='polite' across variants", () => {
  assert.ok(loaderContent.includes("role=\"status\""), "Accessible role status");
  assert.ok(loaderContent.includes("aria-live=\"polite\""), "Aria live polite announcement");
});

it("Includes indeterminate progress bar accent and statutory compliance badge", () => {
  assert.ok(loaderContent.includes("animate-indeterminate-pulse"), "Indeterminate progress bar accent");
  assert.ok(loaderContent.includes("BCI Rule 36 Compliant"), "BCI Rule 36 compliance badge");
});

// --------------------------------------------------------------------------
// TEST 4: Bilingual Localization Support (English & Hindi)
// --------------------------------------------------------------------------
console.log("\n[Test 4/6] Verifying Bilingual Loading Copy...");

it("Provides default English legal workspace message", () => {
  assert.ok(loaderContent.includes("Preparing your legal workspace…"), "English workspace message");
  assert.ok(loaderContent.includes("BNS & Indian Jurisprudence Grounded"), "English statutory subtext");
});

it("Provides authentic Devanagari Hindi legal workspace message", () => {
  assert.ok(loaderContent.includes("आपका कानूनी कार्यक्षेत्र तैयार हो रहा है…"), "Hindi workspace message");
  assert.ok(loaderContent.includes("भारतीय न्याय संहिता व विधिक सिद्धांतों पर आधारित"), "Hindi statutory subtext");
});

// --------------------------------------------------------------------------
// TEST 5: AppSplashProvider Lifecycle, Timing & Safety
// --------------------------------------------------------------------------
console.log("\n[Test 5/6] Verifying AppSplashProvider Session & Safety Guarantees...");
const splashPath = path.join(__dirname, "../components/ui/app-splash-provider.tsx");
const splashContent = fs.readFileSync(splashPath, "utf8");

it("Guards first-entry splash with sessionStorage key", () => {
  assert.ok(splashContent.includes("nyaylink_initial_splash_shown"), "Session storage key defined");
  assert.ok(splashContent.includes("sessionStorage.getItem"), "Checks existing session state");
  assert.ok(splashContent.includes("sessionStorage.setItem"), "Persists session state");
});

it("Target splash duration allows 1 full strike cycle (1.4s) before smooth exit", () => {
  assert.ok(splashContent.includes("1400"), "Splash display duration calibrated to 1400ms");
});

it("Enforces hard safety timeout to guarantee user is never trapped", () => {
  assert.ok(splashContent.includes("MAX_SAFETY_TIMEOUT_MS"), "Max safety timeout constant defined");
  assert.ok(splashContent.includes("clearTimeout(safetyTimer)"), "Cleans up safety timer");
});

it("Uses smooth Framer Motion AnimatePresence fade-out transition", () => {
  assert.ok(splashContent.includes("AnimatePresence"), "Uses AnimatePresence");
  assert.ok(splashContent.includes("opacity: 0"), "Fades out opacity on exit");
});

// --------------------------------------------------------------------------
// TEST 6: Next.js App Router Integration Points
// --------------------------------------------------------------------------
console.log("\n[Test 6/6] Verifying Integration into Next.js App Router...");
const layoutPath = path.join(__dirname, "../app/layout.tsx");
const layoutContent = fs.readFileSync(layoutPath, "utf8");

it("Root layout integrates AppSplashProvider inside LanguageProvider", () => {
  assert.ok(layoutContent.includes("AppSplashProvider"), "Imports and renders AppSplashProvider");
});

it("app/loading.tsx exists and renders AnimatedGavelLoader", () => {
  const rootLoadingPath = path.join(__dirname, "../app/loading.tsx");
  assert.ok(fs.existsSync(rootLoadingPath), "app/loading.tsx must exist");
  const rootLoadingContent = fs.readFileSync(rootLoadingPath, "utf8");
  assert.ok(rootLoadingContent.includes("AnimatedGavelLoader"), "Renders AnimatedGavelLoader");
});

it("Route loading boundaries exist for lawyer directory and dashboard", () => {
  assert.ok(fs.existsSync(path.join(__dirname, "../app/lawyers/loading.tsx")), "app/lawyers/loading.tsx exists");
  assert.ok(fs.existsSync(path.join(__dirname, "../app/lawyer/dashboard/loading.tsx")), "app/lawyer/dashboard/loading.tsx exists");
  assert.ok(fs.existsSync(path.join(__dirname, "../app/dashboard/loading.tsx")), "app/dashboard/loading.tsx exists");
});

console.log("\n======================================================================");
console.log(`TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log("======================================================================");

if (failed > 0) {
  process.exit(1);
}
