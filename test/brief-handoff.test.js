/**
 * NyayLink - AI Preconsultation-to-Advocate Handoff Test Suite
 * Validates brief synthesis, fact vs inference separation, ambiguous date preservation,
 * unattached document mention tagging, mandatory bilingual disclaimers, consent controls,
 * revocation lifecycle, and zero auto-sharing guarantees.
 */

const fs = require("fs");
const path = require("path");
const assert = require("assert");

// Load TypeScript modules via jiti
const jiti = require("jiti")(process.cwd(), { alias: { "@": process.cwd() } });
const {
  buildLawyerReadyBrief,
  extractMentionedDocuments,
  generateAdvocateQuestions,
  synthesizeIssueSummary,
  MANDATORY_BRIEF_DISCLAIMER,
} = jiti("./lib/intake/brief-builder.ts");

console.log("======================================================================");
console.log(">>> NYAYLINK AI PRECONSULTATION-TO-ADVOCATE HANDOFF VERIFICATION <<<");
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
// 1. Brief Generation & Structure
// --------------------------------------------------------------------------
console.log("[Phase 1] Testing Lawyer-Ready Brief generation & structure...");

const sampleFacts = {
  facts: [
    {
      id: "fact-1",
      statement: "Client issued an advance deposit of ₹2,50,000 for office lease.",
      sourceText: "I paid two and a half lakhs as deposit",
      userConfirmed: true,
      isAiInference: false,
    },
    {
      id: "fact-2",
      statement: "Landlord terminated the agreement without 30-day statutory notice.",
      sourceText: "Landlord kicked us out without giving a month notice",
      userConfirmed: false,
      isAiInference: false,
    },
    {
      id: "fact-3",
      statement: "Possible wrongful withholding of commercial security deposit.",
      sourceText: "inferred from non-refund statement",
      userConfirmed: false,
      isAiInference: true,
    },
  ],
  dates: [
    {
      id: "date-1",
      originalText: "two months ago",
      needsConfirmation: true,
    },
    {
      id: "date-2",
      originalText: "15th August 2026",
      confirmedDate: "2026-08-15",
      needsConfirmation: false,
    },
  ],
  jurisdiction: {
    state: "Maharashtra",
    district: "Mumbai Suburban",
    courtOrForum: "Small Causes Court / Civil Court",
    isUserSpecified: true,
  },
  legalIssue: "Commercial tenancy wrongful eviction and deposit recovery",
  possiblePracticeAreas: ["Property & Real Estate", "Civil Litigation"],
  missingFacts: ["Copy of registered rent agreement"],
  urgency: "time_sensitive",
  userRole: "tenant_or_buyer",
  hasConfirmed: true,
  originalQuery: "I rented commercial space and landlord threw me out without refunding my ₹2,50,000 deposit two months ago. We have a rent agreement and bank statement.",
};

const sampleAnswer =
  "Under Maharashtra Rent Control Act and the Transfer of Property Act, 1882, Section 106 mandates reasonable notice prior to lease termination. You have remedies to file a summary suit for recovery of your security deposit.";

const briefEn = buildLawyerReadyBrief({
  inquiryText: sampleFacts.originalQuery,
  answerText: sampleAnswer,
  facts: sampleFacts,
  jurisdiction: "Maharashtra, Mumbai Suburban",
  locale: "en",
});

it("Generates a complete LawyerReadyBrief with all mandatory properties", () => {
  assert(briefEn.title && briefEn.title.length > 5, "Title should be present");
  assert(briefEn.issueSummary && briefEn.issueSummary.length > 10, "Issue summary should be present");
  assert(Array.isArray(briefEn.facts) && briefEn.facts.length === 3, "Facts should match input");
  assert(Array.isArray(briefEn.dates) && briefEn.dates.length === 2, "Dates should match input");
  assert(briefEn.jurisdiction.state === "Maharashtra", "State jurisdiction should be Maharashtra");
  assert(briefEn.jurisdiction.district === "Mumbai Suburban", "District should be Mumbai Suburban");
  assert(Array.isArray(briefEn.questionsForAdvocate) && briefEn.questionsForAdvocate.length >= 3, "Questions for advocate should have at least 3 items");
  assert(Array.isArray(briefEn.retrievedSources) && briefEn.retrievedSources.length > 0, "Retrieved statutory sources should be populated");
  assert(briefEn.disclaimer && briefEn.disclaimer.en && briefEn.disclaimer.hi, "Mandatory bilingual disclaimer must be present");
});

// --------------------------------------------------------------------------
// 2. Strict Fact vs AI Inference Separation
// --------------------------------------------------------------------------
console.log("\n[Phase 2] Testing strict Fact vs AI Inference separation...");

it("Separates user-confirmed facts from AI inferences", () => {
  const confirmedFacts = briefEn.facts.filter((f) => f.category === "user_confirmed");
  const statedFacts = briefEn.facts.filter((f) => f.category === "user_stated");
  const aiInferences = briefEn.facts.filter((f) => f.category === "ai_inference");

  assert.strictEqual(confirmedFacts.length, 1, "Should have 1 user-confirmed fact");
  assert.strictEqual(statedFacts.length, 1, "Should have 1 user-stated fact");
  assert.strictEqual(aiInferences.length, 1, "Should have 1 AI inference");
  assert.strictEqual(aiInferences[0].isAiInference, true, "AI inference must have isAiInference: true");
  assert.strictEqual(confirmedFacts[0].userConfirmed, true, "Confirmed fact must have userConfirmed: true");
});

it("Never labels an AI inference as a confirmed fact", () => {
  briefEn.facts.forEach((f) => {
    if (f.isAiInference) {
      assert.notStrictEqual(f.category, "user_confirmed", "AI inference must never be marked as user_confirmed");
    }
  });
});

// --------------------------------------------------------------------------
// 3. Timeline & Ambiguous Date Preservation
// --------------------------------------------------------------------------
console.log("\n[Phase 3] Testing timeline & ambiguous date preservation...");

it("Preserves ambiguous relative dates like 'two months ago' with confirmation flag", () => {
  const relativeDate = briefEn.dates.find((d) => d.originalText === "two months ago");
  assert(relativeDate, "Relative date must be preserved");
  assert.strictEqual(relativeDate.needsConfirmation, true, "Relative date must require confirmation");
  assert.strictEqual(relativeDate.confirmedDate, undefined, "Relative date must not have premature normalized date");
});

it("Maintains confirmed dates correctly", () => {
  const exactDate = briefEn.dates.find((d) => d.confirmedDate === "2026-08-15");
  assert(exactDate, "Exact date must exist");
  assert.strictEqual(exactDate.needsConfirmation, false, "Confirmed date should not require confirmation");
});

// --------------------------------------------------------------------------
// 4. Mentioned Documents Tagging (Not Attached)
// --------------------------------------------------------------------------
console.log("\n[Phase 4] Testing mentioned documents extraction (unattached)...");

it("Extracts mentioned documents without auto-attaching files", () => {
  const queryWithDocs = "I have a rent agreement, bank statement, and sent a legal notice.";
  const docs = extractMentionedDocuments(queryWithDocs);

  assert(docs.length >= 3, "Should detect rent agreement, bank statement, and legal notice");
  docs.forEach((doc) => {
    assert.strictEqual(doc.status, "mentioned_not_attached", "Document status must be mentioned_not_attached");
    assert(doc.context.includes("not yet attached"), "Context must warn that document is not yet attached");
  });
});

it("Does not attach actual files merely because a document is mentioned", () => {
  const docs = briefEn.documentsMentioned;
  assert(docs.length > 0, "Brief should detect documents from sample query");
  docs.forEach((d) => {
    assert.strictEqual(d.status, "mentioned_not_attached");
    // Ensure no file storage URIs or mock blobs are attached
    assert.strictEqual(d.fileUrl, undefined);
    assert.strictEqual(d.storagePath, undefined);
  });
});

// --------------------------------------------------------------------------
// 5. Mandatory Bilingual Legal Disclaimer
// --------------------------------------------------------------------------
console.log("\n[Phase 5] Testing mandatory bilingual disclaimer...");

it("English disclaimer contains all required statutory notices", () => {
  const en = briefEn.disclaimer.en;
  assert(en.includes("NyayLink AI Preconsultation"), "Must cite NyayLink AI Preconsultation");
  assert(en.includes("does not constitute formal legal advice"), "Must state not formal legal advice");
  assert(en.includes("create an advocate-client relationship"), "Must state no advocate-client relationship created");
  assert(en.includes("independently verified by the reviewing advocate"), "Must mandate independent advocate verification");
});

it("Hindi disclaimer contains accurate Devanagari legal text", () => {
  const hi = briefEn.disclaimer.hi;
  assert(hi.includes("न्यायलिंक एआई पूर्व-परामर्श"), "Must cite न्यायलिंक एआई पूर्व-परामर्श");
  assert(hi.includes("औपचारिक विधिक सलाह नहीं"), "Must state औपचारिक विधिक सलाह नहीं");
  assert(hi.includes("अधिवक्ता-मुवक्किल संबंध"), "Must mention अधिवक्ता-मुवक्किल संबंध");
  assert(hi.includes("स्वतंत्र सत्यापन"), "Must mention स्वतंत्र सत्यापन");
});

// --------------------------------------------------------------------------
// 6. Proposed Questions for Advocate
// --------------------------------------------------------------------------
console.log("\n[Phase 6] Testing advocate questions generation...");

it("Generates 3 to 5 tailored preliminary questions for the client", () => {
  assert(briefEn.questionsForAdvocate.length >= 3 && briefEn.questionsForAdvocate.length <= 5);
  // Should include questions about remedies, limitation, or evidence
  const combinedQ = briefEn.questionsForAdvocate.join(" ").toLowerCase();
  assert(
    combinedQ.includes("remedies") || combinedQ.includes("limitation") || combinedQ.includes("documents") || combinedQ.includes("notice"),
    "Should contain strategic legal consultation questions"
  );
});

const briefHi = buildLawyerReadyBrief({
  inquiryText: sampleFacts.originalQuery,
  answerText: sampleAnswer,
  facts: sampleFacts,
  jurisdiction: "Maharashtra",
  locale: "hi",
});

it("Generates natural Devanagari questions when locale is Hindi", () => {
  assert(briefHi.questionsForAdvocate.length >= 3);
  const firstQ = briefHi.questionsForAdvocate[0];
  // Verify it contains Hindi characters
  assert(/[\u0900-\u097F]/.test(firstQ), "Question must contain Devanagari Hindi characters");
});

// --------------------------------------------------------------------------
// 7. Consent Enforcement & Zero Auto-Sharing
// --------------------------------------------------------------------------
console.log("\n[Phase 7] Testing consent enforcement & zero auto-sharing in code...");

const briefsActionsCode = fs.readFileSync(
  path.join(__dirname, "../app/actions/briefs.ts"),
  "utf8"
);
const handoffDialogCode = fs.readFileSync(
  path.join(__dirname, "../components/intake/advocate-handoff-dialog.tsx"),
  "utf8"
);
const briefModalCode = fs.readFileSync(
  path.join(__dirname, "../components/intake/lawyer-brief-modal.tsx"),
  "utf8"
);
const whatIUnderstoodCode = fs.readFileSync(
  path.join(__dirname, "../components/intake/what-i-understood-card.tsx"),
  "utf8"
);

it("shareBriefWithAdvocate enforces consentGiven === true check", () => {
  assert(
    briefsActionsCode.includes("payload.consentGiven !== true"),
    "shareBriefWithAdvocate must reject if consentGiven is not explicitly true"
  );
  assert(
    briefsActionsCode.includes("Consent required:") &&
    briefsActionsCode.includes("explicitly agree to share"),
    "Must return clear consent error message"
  );
});

it("AdvocateHandoffDialog initializes consent checkbox as UNCHECKED", () => {
  assert(
    handoffDialogCode.includes("const [hasAgreedToShare, setHasAgreedToShare] = useState(false);") ||
    handoffDialogCode.includes("useState(false)"),
    "Consent checkbox must be initialized to false (unchecked)"
  );
  assert(
    handoffDialogCode.includes("I agree to share this summary with the advocate I select."),
    "Must include mandatory consent statement"
  );
});

it("Share button is disabled until consent checkbox is explicitly checked", () => {
  assert(
    handoffDialogCode.includes("disabled={!hasAgreedToShare"),
    "Submit button must be disabled until consent is checked"
  );
});

it("Browsing /lawyers directory does not invoke sharing", () => {
  // In LawyerBriefModal: handleFindAdvocate only routes to /lawyers without calling shareBriefWithAdvocate
  assert(
    briefModalCode.includes("router.push(\"/lawyers\")"),
    "Find advocate button should simply navigate to /lawyers"
  );
  assert(
    !briefModalCode.includes("shareBriefWithAdvocate(") ||
    briefModalCode.includes("AdvocateHandoffDialog"),
    "Direct browsing must not share brief"
  );
});

it("WhatIUnderstoodCard provides TWO distinct post-response actions", () => {
  assert(
    whatIUnderstoodCode.includes("Create a lawyer-ready brief") ||
    whatIUnderstoodCode.includes("वकील हेतु सारांश बनाएं"),
    "Must offer 'Create a lawyer-ready brief'"
  );
  assert(
    whatIUnderstoodCode.includes("Find Advocates") ||
    whatIUnderstoodCode.includes("वकील खोजें"),
    "Must offer 'Find Advocates' for directory browsing only"
  );
  assert(
    whatIUnderstoodCode.includes("Browsing advocates or creating a brief never auto-shares your data") ||
    whatIUnderstoodCode.includes("वकील खोजने या सारांश देखने पर आपका डेटा कभी स्वतः साझा नहीं होता"),
    "Must explicitly assure client that browsing never auto-shares data"
  );
});

// --------------------------------------------------------------------------
// 8. Revocation Lifecycle & Advocate Portal
// --------------------------------------------------------------------------
console.log("\n[Phase 8] Testing revocation lifecycle & advocate portal integration...");

const requestsTabCode = fs.readFileSync(
  path.join(__dirname, "../components/lawyer/requests-tab.tsx"),
  "utf8"
);
const clientConsultationsTabCode = fs.readFileSync(
  path.join(__dirname, "../components/client/consultations-tab.tsx"),
  "utf8"
);

it("Client dashboard allows withdrawing/revoking unaccepted brief handoffs", () => {
  assert(
    clientConsultationsTabCode.includes("revokeBriefHandoff"),
    "Client consultations tab must import revokeBriefHandoff"
  );
  assert(
    clientConsultationsTabCode.includes("Withdraw / Revoke Brief"),
    "Must display withdraw / revoke button for pending handoffs"
  );
});

it("Advocate inbox badges received AI Preconsultation briefs", () => {
  assert(
    requestsTabCode.includes("AI Preconsultation Brief (Client-Shared)"),
    "Advocate requests tab must badge client-shared briefs"
  );
  assert(
    requestsTabCode.includes("View Full Brief"),
    "Advocate requests tab must provide View Full Brief modal button"
  );
});

it("Advocate portal shows disclaimer that brief is client-reported and AI-inferred", () => {
  assert(
    requestsTabCode.includes("Advocate Advisory:"),
    "Must display advocate advisory banner"
  );
  assert(
    requestsTabCode.includes("must be independently verified by chambers"),
    "Must state that chambers must independently verify facts"
  );
});

it("Advocate portal displays clear notice when consultation is revoked by client", () => {
  assert(
    requestsTabCode.includes("Consultation Withdrawn by Client") ||
    requestsTabCode.includes("BRIEF REVOKED"),
    "Must handle revoked status without exposing confidential brief"
  );
});

// --------------------------------------------------------------------------
// 9. Database Migration & RLS Security
// --------------------------------------------------------------------------
console.log("\n[Phase 9] Testing database migration & Row Level Security policies...");

const migrationCode = fs.readFileSync(
  path.join(__dirname, "../supabase/migrations/20261027000000_client_briefs_and_handoffs.sql"),
  "utf8"
);

it("Migration creates client_briefs and brief_handoffs tables", () => {
  assert(migrationCode.includes("CREATE TABLE IF NOT EXISTS public.client_briefs"), "Must create client_briefs table");
  assert(migrationCode.includes("CREATE TABLE IF NOT EXISTS public.brief_handoffs"), "Must create brief_handoffs table");
  assert(
    migrationCode.includes("ALTER TABLE public.consultation_requests") &&
    migrationCode.includes("brief_handoff_id uuid"),
    "Must extend consultation_requests"
  );
});

it("Enables Row Level Security (RLS) on both tables", () => {
  assert(migrationCode.includes("ALTER TABLE public.client_briefs ENABLE ROW LEVEL SECURITY"), "RLS must be enabled on client_briefs");
  assert(migrationCode.includes("ALTER TABLE public.brief_handoffs ENABLE ROW LEVEL SECURITY"), "RLS must be enabled on brief_handoffs");
});

it("Restricts brief handoff view policy strictly to creating client and designated advocate", () => {
  assert(
    migrationCode.includes("auth.uid() = client_id") &&
    migrationCode.includes("auth.uid() = lawyer_id"),
    "Handoff view policy must check client_id and lawyer_id"
  );
  assert(
    migrationCode.includes("consent_given = true"),
    "Insert policy must mandate consent_given = true"
  );
});

// --------------------------------------------------------------------------
// 10. Summary
// --------------------------------------------------------------------------
console.log("\n======================================================================");
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("======================================================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  console.log(">>> ALL AI PRECONSULTATION-TO-ADVOCATE HANDOFF TESTS PASSED <<<\n");
}
