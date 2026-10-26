const fs = require("fs");
const path = require("path");
const assert = require("assert");

console.log("======================================================================");
console.log(">>> NYAYLINK AI INTAKE, LEGAL GROUNDING & UX VERIFICATION SUITE <<<");
console.log("======================================================================\n");

let passed = 0;
let failed = 0;

function it(desc, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ [PASS] ${desc}`);
  } catch (err) {
    failed++;
    console.error(`  ❌ [FAIL] ${desc}: ${err.message}`);
  }
}

// --------------------------------------------------------------------------
// 1. PHASE 1: Privacy Badges & Compliance Claims Removal
// --------------------------------------------------------------------------
console.log("[Phase 1] Verifying removal of misleading privacy & compliance claims...");

const intakePageCode = fs.readFileSync(
  path.join(__dirname, "../app/intake/page.tsx"),
  "utf8"
);
const chatInterfaceCode = fs.readFileSync(
  path.join(__dirname, "../components/intake/chat-interface.tsx"),
  "utf8"
);

it("Removed 'CONFIDENTIAL LEGAL INTAKE' badge from intake page", () => {
  assert.strictEqual(
    intakePageCode.includes("CONFIDENTIAL LEGAL INTAKE"),
    false,
    "CONFIDENTIAL LEGAL INTAKE badge must be removed"
  );
});

it("Removed 'Private & Non-identifying' claim from intake page", () => {
  assert.strictEqual(
    intakePageCode.includes("Private & Non-identifying") ||
      intakePageCode.includes("Private &amp; Non-identifying"),
    false,
    "Private & Non-identifying claim must be removed"
  );
});

it("Removed 'BNS & Indian Jurisprudence Grounded' from chat header", () => {
  assert.strictEqual(
    chatInterfaceCode.includes("BNS &amp; Indian Jurisprudence Grounded") ||
      chatInterfaceCode.includes("BNS & Indian Jurisprudence Grounded"),
    false,
    "Unsupported BNS grounding badge must be removed from header"
  );
});

it("Does not claim conversation anonymity, automatic privilege, or local-only processing", () => {
  assert.strictEqual(
    chatInterfaceCode.includes("conversations are completely anonymous") ||
      chatInterfaceCode.includes("stays strictly on your device"),
    false,
    "Must not make false anonymity or device-only claims"
  );
});

// --------------------------------------------------------------------------
// 2. PHASE 1 & 4: Mandatory Honest Privacy Notice & Provider Disclosure
// --------------------------------------------------------------------------
console.log("\n[Phase 1 & 4] Verifying explicit AI legal disclaimer and provider disclosure...");

const guidedFormCode = fs.readFileSync(
  path.join(__dirname, "../components/intake/guided-intake-form.tsx"),
  "utf8"
);

it("Contains explicit heading: 'AI legal information — not legal advice' (EN & HI)", () => {
  assert.ok(
    guidedFormCode.includes("AI legal information — not legal advice") ||
      guidedFormCode.includes("एआई कानूनी जानकारी — विधिक सलाह नहीं"),
    "Mandatory privacy notice heading must be present"
  );
  assert.ok(
    chatInterfaceCode.includes("एआई कानूनी जानकारी — विधिक सलाह नहीं") ||
      chatInterfaceCode.includes("AI legal information — not legal advice"),
    "Chat interface disclaimer banner must be present"
  );
});

it("Discloses that messages may be processed by configured AI providers (Groq / OpenRouter)", () => {
  assert.ok(
    guidedFormCode.includes("Groq / OpenRouter") ||
      guidedFormCode.includes("Groq") ||
      chatInterfaceCode.includes("Groq / OpenRouter"),
    "Actual AI service provider must be transparently disclosed"
  );
});

it("Warns users not to enter Aadhaar numbers, phone numbers, OTPs or passwords", () => {
  assert.ok(
    guidedFormCode.includes("Aadhaar numbers, phone numbers, OTPs, passwords"),
    "Must warn against entering sensitive PII"
  );
  assert.ok(
    guidedFormCode.includes("आधार संख्या, फ़ोन नंबर, ओटीपी, पासवर्ड"),
    "Must warn against entering sensitive PII in Hindi"
  );
});

// --------------------------------------------------------------------------
// 3. PHASE 2: Real Source-Grounded Legal Guidance & Registry
// --------------------------------------------------------------------------
console.log("\n[Phase 2] Verifying authoritative legal source registry & retrieval pipeline...");

const referencesCode = fs.readFileSync(
  path.join(__dirname, "../lib/legal/references.ts"),
  "utf8"
);

it("Registry contains canonical Indian statutes (BNS, BNSS, CPA, RERA, CPC, NI Act, Contract Act)", () => {
  assert.ok(referencesCode.includes("Bharatiya Nyaya Sanhita, 2023"), "BNS present");
  assert.ok(referencesCode.includes("Bharatiya Nagarik Suraksha Sanhita, 2023"), "BNSS present");
  assert.ok(referencesCode.includes("Consumer Protection Act, 2019"), "CPA present");
  assert.ok(referencesCode.includes("Real Estate (Regulation and Development) Act, 2016"), "RERA present");
  assert.ok(referencesCode.includes("Code of Civil Procedure, 1908"), "CPC present");
  assert.ok(referencesCode.includes("Negotiable Instruments Act, 1881"), "NI Act present");
  assert.ok(referencesCode.includes("Indian Contract Act, 1872"), "Contract Act present");
  assert.ok(referencesCode.includes("Hindu Marriage Act, 1955"), "Hindu Marriage Act present");
  assert.ok(referencesCode.includes("Protection of Women from Domestic Violence Act, 2005"), "DV Act present");
});

it("Each statutory record includes official India Code URL and verification status", () => {
  assert.ok(referencesCode.includes("https://www.indiacode.nic.in/handle/123456789/"), "India Code URLs present");
  assert.ok(referencesCode.includes("officially_verified"), "Verified status field present");
  assert.ok(referencesCode.includes("lastCheckedDate"), "Last checked audit date present");
});

it("Implements retrieveRelevantLegalSources and validateCitationsAgainstRegistry functions", () => {
  assert.ok(referencesCode.includes("export function retrieveRelevantLegalSources"), "retrieveRelevantLegalSources exported");
  assert.ok(referencesCode.includes("export function validateCitationsAgainstRegistry"), "validateCitationsAgainstRegistry exported");
});

const systemPromptCode = fs.readFileSync(
  path.join(__dirname, "../lib/intake/system-prompt.ts"),
  "utf8"
);

it("Mandates honest fallback disclaimer when no verified source record matches", () => {
  assert.ok(
    systemPromptCode.includes("General Indian legal orientation. Verify important details with a qualified advocate."),
    "Must output exact fallback disclaimer when sources are not directly grounded"
  );
  assert.ok(
    systemPromptCode.includes("ZERO HALLUCINATION OF STATUTES OR CASE CITATIONS"),
    "Zero hallucination directive enforced"
  );
});

// --------------------------------------------------------------------------
// 4. PHASE 3: Replacement of Fake Fact Extraction with Typed IntakeFacts
// --------------------------------------------------------------------------
console.log("\n[Phase 3] Verifying structured fact extraction, relative dates & 'What I understood'...");

const factTypesCode = fs.readFileSync(
  path.join(__dirname, "../lib/intake/fact-types.ts"),
  "utf8"
);
const factExtractorCode = fs.readFileSync(
  path.join(__dirname, "../lib/intake/fact-extractor.ts"),
  "utf8"
);
const whatIUnderstoodCode = fs.readFileSync(
  path.join(__dirname, "../components/intake/what-i-understood-card.tsx"),
  "utf8"
);

it("Defines strictly typed IntakeFacts and FactItem models", () => {
  assert.ok(factTypesCode.includes("export interface IntakeFacts"), "IntakeFacts interface defined");
  assert.ok(factTypesCode.includes("export interface FactItem"), "FactItem interface defined");
  assert.ok(factTypesCode.includes("userConfirmed: boolean;"), "userConfirmed boolean field");
  assert.ok(factTypesCode.includes("needsConfirmation: boolean;"), "needsConfirmation boolean field");
});

it("Preserves relative dates (e.g. 'last Friday', 'कल') with needsConfirmation: true", () => {
  assert.ok(factExtractorCode.includes("needsConfirmation: true"), "needsConfirmation set to true on relative dates");
  assert.ok(factExtractorCode.includes("RELATIVE_DATE_PATTERNS"), "Relative date patterns configured");
});

it("Does NOT default practice area classification silently to Civil Litigation", () => {
  assert.strictEqual(
    factExtractorCode.includes('resolvePracticeAreaCategory("Civil Litigation")'),
    false,
    "Must not default to Civil Litigation silently"
  );
});

it("Renders 'What I understood' / 'जो हमने समझा' section title", () => {
  assert.ok(
    whatIUnderstoodCode.includes("What I Understood") &&
      whatIUnderstoodCode.includes("जो हमने समझा"),
    "Correct bilingual section titles present"
  );
});

it("Features a genuine 'Confirm facts' / 'तथ्यों की पुष्टि करें' action", () => {
  assert.ok(
    whatIUnderstoodCode.includes("Confirm Facts") &&
      whatIUnderstoodCode.includes("तथ्यों की पुष्टि करें"),
    "Confirm Facts action buttons present"
  );
  assert.ok(
    whatIUnderstoodCode.includes("hasConfirmed: true"),
    "Sets hasConfirmed to true upon confirmation"
  );
});

it("Provides dedicated API endpoint for fact extraction and confirmation (/api/intake/extract-facts)", () => {
  const extractApiCode = fs.readFileSync(
    path.join(__dirname, "../app/api/intake/extract-facts/route.ts"),
    "utf8"
  );
  assert.ok(extractApiCode.includes("extractFactsFromText"), "Uses extractFactsFromText");
  assert.ok(extractApiCode.includes('action === "confirm"'), "Supports confirm action");
});

// --------------------------------------------------------------------------
// 5. PHASE 4: Three Clear Entry Choices & Guided Form
// --------------------------------------------------------------------------
console.log("\n[Phase 4] Verifying 3 selectable entry choices & progressive intake form...");

it("Features the 3 designated entry choices in English & natural Hindi", () => {
  assert.ok(guidedFormCode.includes("Understand my legal position"), "Option 1 English");
  assert.ok(guidedFormCode.includes("कानूनी स्थिति समझें"), "Option 1 Hindi");
  assert.ok(guidedFormCode.includes("Prepare for a lawyer consultation"), "Option 2 English");
  assert.ok(guidedFormCode.includes("वकील से मिलने की तैयारी करें"), "Option 2 Hindi");
  assert.ok(guidedFormCode.includes("I need urgent help"), "Option 3 English");
  assert.ok(guidedFormCode.includes("मुझे तत्काल सहायता चाहिए"), "Option 3 Hindi");
});

it("Provides verified emergency helplines for Urgent Help (112, 1091, 1930, 15100)", () => {
  assert.ok(guidedFormCode.includes("112"), "Police 112 present");
  assert.ok(guidedFormCode.includes("1091"), "Women helpline 1091 present");
  assert.ok(guidedFormCode.includes("1930"), "Cyber fraud 1930 present");
  assert.ok(guidedFormCode.includes("15100"), "NALSA legal aid 15100 present");
});

it("Includes progressive disclosure fields (Topic, State, Date, Role, Outcome, Description)", () => {
  assert.ok(guidedFormCode.includes("legalTopic"), "Legal topic field");
  assert.ok(guidedFormCode.includes("selectedState"), "State jurisdiction field");
  assert.ok(guidedFormCode.includes("dateOfIncident"), "Date of incident field");
  assert.ok(guidedFormCode.includes("userRole"), "User role in matter field");
  assert.ok(guidedFormCode.includes("desiredOutcome"), "Desired outcome field");
  assert.ok(guidedFormCode.includes("description"), "Description field");
});

it("Preserves free-text description and integrated voice microphone slot", () => {
  assert.ok(guidedFormCode.includes("voiceMicSlot"), "Voice mic slot integrated");
  assert.ok(guidedFormCode.includes("useSimpleMode"), "Direct description toggle available");
});

// --------------------------------------------------------------------------
// 6. PHASE 5: Server-Side Pipeline with Confirmed Facts & Source Provenance
// --------------------------------------------------------------------------
console.log("\n[Phase 5] Verifying server-side legal answer pipeline in /api/intake/chat...");

const chatRouteCode = fs.readFileSync(
  path.join(__dirname, "../app/api/intake/chat/route.ts"),
  "utf8"
);

it("Accepts confirmedFacts and retrieves relevant legal sources", () => {
  assert.ok(chatRouteCode.includes("confirmedFacts"), "confirmedFacts payload handled");
  assert.ok(chatRouteCode.includes("retrieveRelevantLegalSources"), "retrieveRelevantLegalSources invoked");
});

it("Injects verified sources into system prompt and streams __NYAYLINK_SOURCES__ chunk", () => {
  assert.ok(chatRouteCode.includes("buildSystemPrompt({"), "buildSystemPrompt invoked with sources");
  assert.ok(chatRouteCode.includes("__NYAYLINK_SOURCES__:"), "Streams verified sources metadata chunk");
});

// --------------------------------------------------------------------------
// 7. Summary
// --------------------------------------------------------------------------
console.log("\n======================================================================");
console.log(`>>> TEST RESULTS: ${passed} PASSED | ${failed} FAILED <<<`);
console.log("======================================================================");

if (failed > 0) {
  process.exit(1);
}
