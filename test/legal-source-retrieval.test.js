/**
 * NyayLink Indian Legal-Source Registry and pgvector Retrieval Test Suite
 *
 * Verifies all 11 core legal retrieval, grounding, citation safety,
 * terminology crosswalk, and administrative ingestion criteria.
 */

const assert = require("assert");
const fs = require("fs");
const path = require("path");

console.log("======================================================================");
console.log(">>> NYAYLINK LEGAL-SOURCE REGISTRY & RETRIEVAL PIPELINE TEST SUITE <<<");
console.log("======================================================================\n");

let passed = 0;
let failed = 0;

async function test(desc, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ✓ [PASS] ${desc}`);
  } catch (err) {
    failed++;
    console.error(`  ❌ [FAIL] ${desc}: ${err.message}`);
  }
}

async function runAllTests() {
  const jiti = require("jiti")(process.cwd(), { alias: { "@": process.cwd() } });
  const canonicalRegistry = jiti("./lib/legal/canonical-registry.ts");
  const embedding = jiti("./lib/legal/embedding.ts");
  const retrieval = jiti("./lib/legal/retrieval.ts");
  const ingestion = jiti("./lib/legal/ingestion-service.ts");
  const briefBuilder = jiti("./lib/intake/brief-builder.ts");

  console.log("[Phase 1] Verifying Curated Source Registry Integrity & Canonical Acts...");

  await test("Registry contains core Indian central enactments (BNS, BNSS, BSA, CPC, CPA, RERA, NI Act, Contract Act, TPA)", () => {
    const docCodes = canonicalRegistry.CANONICAL_DOCUMENTS.map((d) => d.actCode);
    const requiredActs = [
      "BNS_2023",
      "BNSS_2023",
      "BSA_2023",
      "CPC_1908",
      "CPA_2019",
      "RERA_2016",
      "NI_1881",
      "CONTRACT_1872",
      "TPA_1882",
    ];

    for (const act of requiredActs) {
      assert.ok(docCodes.includes(act), `Registry must include ${act}`);
    }
  });

  await test("All official source URLs point to official government portals using HTTPS", () => {
    for (const doc of canonicalRegistry.CANONICAL_DOCUMENTS) {
      const check = ingestion.validateOfficialSourceUrl(doc.officialUrl);
      assert.ok(check.isValid, `Document ${doc.id} URL '${doc.officialUrl}' must be valid: ${check.error}`);
    }
    for (const prov of canonicalRegistry.CANONICAL_PROVISIONS) {
      const check = ingestion.validateOfficialSourceUrl(prov.officialUrl);
      assert.ok(check.isValid, `Provision ${prov.id} URL '${prov.officialUrl}' must be valid: ${check.error}`);
    }
  });

  console.log("\n[Phase 2] Verifying Retrieval Precision & Disambiguation...");

  await test("1. Query for known provision returns correct source (Section 318, FIR, 138)", async () => {
    const resBNS = await retrieval.retrieveLegalSourcesHybrid("What is the penalty for cheating and fraud under Section 318?");
    assert.ok(resBNS.sources.some((s) => s.id === "bns-sec-318"), "Must retrieve BNS Section 318 for cheating");

    const resFIR = await retrieval.retrieveLegalSourcesHybrid("How to file an FIR or e-FIR at the police station?");
    assert.ok(resFIR.sources.some((s) => s.id === "bnss-sec-173"), "Must retrieve BNSS Section 173 for FIR");

    const resCheque = await retrieval.retrieveLegalSourcesHybrid("My client issued a cheque that bounced for insufficient funds under Section 138");
    assert.ok(resCheque.sources.some((s) => s.id === "ni-sec-138"), "Must retrieve NI Act Section 138 for cheque bounce");
  });

  await test("2. Similar but different provisions are not confused (Anticipatory vs Regular Bail; CPA vs RERA)", async () => {
    // Anticipatory bail vs Regular bail
    const resAnticipatory = await retrieval.retrieveLegalSourcesHybrid("I have an apprehension of arrest and need anticipatory bail");
    assert.strictEqual(resAnticipatory.sources[0]?.id, "bnss-sec-482", "Apprehending arrest must rank BNSS 482 first");
    assert.notStrictEqual(resAnticipatory.sources[0]?.id, "bnss-sec-480", "Must NOT confuse Anticipatory bail with Regular bail");

    const resRegular = await retrieval.retrieveLegalSourcesHybrid("Accused person was arrested and detained in custody, need regular bail before Magistrate");
    assert.strictEqual(resRegular.sources[0]?.id, "bnss-sec-480", "In custody arrest must rank BNSS 480 first");

    // CPA 35 vs RERA 18/31
    const resConsumer = await retrieval.retrieveLegalSourcesHybrid("Defective washing machine sold by retail vendor, e-daakhil consumer complaint");
    assert.ok(resConsumer.sources.some((s) => s.id === "cpa-sec-35"), "Defective product must retrieve CPA Section 35");

    const resBuilder = await retrieval.retrieveLegalSourcesHybrid("Builder delayed flat possession by 3 years, seeking interest under RERA");
    assert.ok(resBuilder.sources.some((s) => s.id === "rera-sec-18"), "Builder delay must retrieve RERA Section 18");
  });

  await test("3. Old and new statutory terminology handled carefully (IPC 420 -> BNS 318; CrPC 154 -> BNSS 173; CrPC 438 -> BNSS 482)", async () => {
    const res420 = await retrieval.retrieveLegalSourcesHybrid("Can I file a complaint for 420 IPC financial cheating?");
    assert.ok(res420.sources.some((s) => s.id === "bns-sec-318"), "IPC 420 query must map to BNS Section 318");

    const res154 = await retrieval.retrieveLegalSourcesHybrid("Police refused CrPC 154 complaint registration");
    assert.ok(res154.sources.some((s) => s.id === "bnss-sec-173"), "CrPC 154 must map to BNSS Section 173");

    const res438 = await retrieval.retrieveLegalSourcesHybrid("Applying for bail under CrPC 438 in High Court");
    assert.ok(res438.sources.some((s) => s.id === "bnss-sec-482"), "CrPC 438 must map to BNSS Section 482");

    const res125 = await retrieval.retrieveLegalSourcesHybrid("Claiming monthly maintenance under CrPC 125");
    assert.ok(res125.sources.some((s) => s.id === "bnss-sec-144"), "CrPC 125 must map to BNSS Section 144");
  });

  await test("4. Missing-source questions do not produce fabricated citations and trigger honest disclaimer", async () => {
    const resIrrelevant = await retrieval.retrieveLegalSourcesHybrid(
      "What is the penalty for wearing purple socks on Mars while dancing with penguins?"
    );
    assert.strictEqual(resIrrelevant.sources.length, 0, "No source should be matched for irrelevant question");
    assert.strictEqual(resIrrelevant.hasGroundedSources, false, "Grounded sources flag must be false");
    assert.ok(
      resIrrelevant.orientationDisclaimer?.includes("General Indian legal orientation"),
      "Must return orientation disclaimer when no source is matched"
    );
  });

  console.log("\n[Phase 3] Verifying Citation Validation & Brief Export Flow...");

  await test("5. Citation validator filters out unretrieved citations and fabricated sources", () => {
    const mockRetrieved = [
      canonicalRegistry.CANONICAL_PROVISIONS.find((p) => p.id === "bns-sec-318"),
      canonicalRegistry.CANONICAL_PROVISIONS.find((p) => p.id === "bnss-sec-173"),
    ].map(retrieval.provisionToReference);

    const generatedResponse = "Under BNS, 2023 Section 318, cheating is punishable with imprisonment up to 7 years.";
    const validated = retrieval.validateCitations(generatedResponse, mockRetrieved);

    assert.strictEqual(validated.length, 1, "Only Section 318 was mentioned in text");
    assert.strictEqual(validated[0].id, "bns-sec-318");

    const hallucinatedResponse = "Under Section 9999 of the Imaginary Space Act, you get a penalty.";
    const emptyValidated = retrieval.validateCitations(hallucinatedResponse, mockRetrieved);
    assert.strictEqual(emptyValidated.length, 0, "Must not validate unretrieved/hallucinated citations");
  });

  await test("6. Source and version metadata survives the answer and brief-export flow", () => {
    const mockSources = [
      canonicalRegistry.CANONICAL_PROVISIONS.find((p) => p.id === "bns-sec-318"),
    ].map(retrieval.provisionToReference);

    const brief = briefBuilder.buildLawyerReadyBrief({
      inquiryText: "Builder took my deposit and cheated me",
      answerText: "You can take action under BNS Section 318",
      facts: {
        facts: [{ id: "f1", statement: "Paid deposit", isAiInference: false, userConfirmed: true }],
        dates: [],
        possiblePracticeAreas: ["criminal"],
        hasConfirmed: true,
      },
      sources: mockSources,
    });

    assert.strictEqual(brief.retrievedSources.length, 1);
    const src = brief.retrievedSources[0];
    assert.strictEqual(src.section, "Section 318");
    assert.strictEqual(src.actName, "Bharatiya Nyaya Sanhita, 2023");
    assert.strictEqual(src.actShortName, "BNS, 2023");
    assert.ok(src.officialSourceUrl?.startsWith("https://www.indiacode.nic.in/"));
    assert.strictEqual(src.verificationStatus, "officially_verified");
  });

  console.log("\n[Phase 4] Verifying Bilingual Hindi/English Support & Embeddings...");

  await test("7. Hindi and English queries both retrieve relevant records", async () => {
    // English
    const enRes = await retrieval.retrieveLegalSourcesHybrid("cheating and fraudulent inducement");
    assert.ok(enRes.sources.some((s) => s.id === "bns-sec-318"), "English query retrieves BNS 318");

    // Hindi
    const hiRes = await retrieval.retrieveLegalSourcesHybrid("व्यापार में धोखाधड़ी और ठगी के खिलाफ शिकायत");
    assert.strictEqual(hiRes.queryLanguage, "hi", "Language must be detected as Hindi");
    assert.ok(hiRes.sources.some((s) => s.id === "bns-sec-318"), "Hindi query for धोखाधड़ी retrieves BNS 318");

    // Hindi for anticipatory bail
    const hiBail = await retrieval.retrieveLegalSourcesHybrid("पुलिस द्वारा गिरफ्तारी का डर है अग्रिम जमानत कैसे मिलेगी");
    assert.strictEqual(hiBail.queryLanguage, "hi");
    assert.ok(hiBail.sources.some((s) => s.id === "bnss-sec-482"), "Hindi query for अग्रिम जमानत retrieves BNSS 482");
  });

  await test("8. Embeddings generate strictly 1536-dimensional unit vectors (no silent placeholders)", async () => {
    // When OPENAI_API_KEY is not configured, generateEmbedding returns null rather than faking an embedding
    const unconfigured = await embedding.generateEmbedding("Bharatiya Nyaya Sanhita Section 318 Cheating");
    assert.strictEqual(unconfigured, null, "Must return null when OPENAI_API_KEY is unconfigured to prevent silent placeholders");

    // Offline projection helper produces strictly 1536-dimensional unit vector
    const vec = embedding.generateDeterministicProjection("Bharatiya Nyaya Sanhita Section 318 Cheating");
    assert.strictEqual(embedding.validateEmbedding(vec), true, "Embedding must be a valid 1536-dim array");
    assert.strictEqual(vec.length, 1536, "Embedding dimension must equal 1536");

    // Check unit magnitude
    const magnitude = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
    assert.ok(Math.abs(magnitude - 1.0) < 0.001, "Embedding must be normalized to unit length");
  });

  console.log("\n[Phase 5] Verifying Security, RLS & Ingestion Boundaries...");

  await test("9. Database migration enforces strict separation of public legal corpus and client matters", () => {
    const migrationSql = fs.readFileSync(
      path.join(__dirname, "../supabase/migrations/20261027183000_curated_legal_source_registry_and_pgvector.sql"),
      "utf8"
    );

    assert.ok(migrationSql.includes("CREATE TABLE IF NOT EXISTS public.legal_source_documents"), "Defines legal_source_documents");
    assert.ok(migrationSql.includes("CREATE TABLE IF NOT EXISTS public.legal_source_provisions"), "Defines legal_source_provisions");
    assert.ok(
      migrationSql.includes("search_vector tsvector") &&
      (migrationSql.includes("handle_legal_prov_search_vector") || migrationSql.includes("GENERATED ALWAYS AS")),
      "Defines tsvector column with automatic synchronization"
    );
    assert.ok(migrationSql.includes("vector(1536)"), "Defines 1536-dim vector embedding");
    assert.ok(migrationSql.includes("CREATE OR REPLACE FUNCTION public.match_legal_provisions"), "Defines match_legal_provisions hybrid function");
    assert.ok(migrationSql.includes("CREATE POLICY \"Admins have full access to legal provisions\""), "Requires admin role for mutating sources");
    assert.ok(migrationSql.includes("public.is_admin()"), "Restricts writes to public.is_admin()");
  });

  await test("10. Ingestion rejects malformed records and does not report fake success", async () => {
    // Malformed record: missing ID, bad URL, empty content
    const malformed = {
      id: "",
      provisionIdentifier: "",
      content: "short",
      officialUrl: "http://insecure-third-party.com/fake",
    };

    const validation = ingestion.validateProvisionRecord(malformed);
    assert.strictEqual(validation.isValid, false, "Malformed record must fail validation");
    assert.ok(validation.errors.length >= 3, "Reports multiple validation errors");

    // Non-whitelisted domain
    const badUrlCheck = ingestion.validateOfficialSourceUrl("https://random-blog.com/section318");
    assert.strictEqual(badUrlCheck.isValid, false, "Must reject non-whitelisted domain");
  });

  await test("11. Chat route integrates hybrid retrieval and server-side citation validation", () => {
    const chatRouteCode = fs.readFileSync(
      path.join(__dirname, "../app/api/intake/chat/route.ts"),
      "utf8"
    );

    assert.ok(chatRouteCode.includes("retrieveLegalSourcesHybrid"), "Chat route must call retrieveLegalSourcesHybrid");
    assert.ok(chatRouteCode.includes("validateCitations"), "Chat route must validate citations before emitting");
    assert.ok(chatRouteCode.includes("__NYAYLINK_SOURCES__:"), "Chat route streams verified sources chunk");
  });

  console.log("\n======================================================================");
  console.log(`>>> TEST RESULTS: ${passed} PASSED | ${failed} FAILED <<<`);
  console.log("======================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error("FATAL SUITE ERROR:", err);
  process.exit(1);
});
