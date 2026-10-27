const jiti = require("jiti")(process.cwd(), { alias: { "@": process.cwd() } });
const { retrieveLegalSourcesHybrid, validateCitations } = jiti("./lib/legal/retrieval.ts");
const { CANONICAL_DOCUMENTS, CANONICAL_PROVISIONS } = jiti("./lib/legal/canonical-registry.ts");

async function runRepresentativeRetrievalAudit() {
  console.log("======================================================================");
  console.log(">>> NYAYLINK LEGAL RAG REPRESENTATIVE QUERY AUDIT <<<");
  console.log("======================================================================\n");

  const testCases = [
    {
      name: "1. Financial Cheating / Fraud (English)",
      query: "Someone took Rs 50,000 promising high return trading scheme and blocked my phone number",
      expectedSection: "Section 318",
      expectedAct: "BNS, 2023",
      category: "criminal",
    },
    {
      name: "2. Anticipatory Bail (Disambiguation Guard)",
      query: "Police came looking for me on a false allegation. I am apprehending arrest and need anticipatory bail urgently",
      expectedSection: "Section 482",
      expectedAct: "BNSS, 2023",
      disallowedSection: "Section 480", // Should not return regular bail as top
      category: "criminal",
    },
    {
      name: "3. Regular Bail in Custody (Disambiguation Guard)",
      query: "My brother was arrested yesterday and is in custody at the police station. We need regular bail hearing",
      expectedSection: "Section 480",
      expectedAct: "BNSS, 2023",
      disallowedSection: "Section 482", // Should not return anticipatory bail as top
      category: "criminal",
    },
    {
      name: "4. Real Estate Possession Delay (RERA vs Consumer)",
      query: "The builder promised flat handover in 2023 but the building construction is halted. As an allottee can I get refund with interest under RERA?",
      expectedSection: "Section 18",
      expectedAct: "RERA, 2016",
      category: "property",
    },
    {
      name: "5. Defective E-Commerce Product (Consumer Forum)",
      query: "I ordered an electronic device from an e-commerce platform that was defective on arrival. Seller refused replacement. Can I file a consumer complaint on e-daakhil?",
      expectedSection: "Section 35",
      expectedAct: "CPA, 2019",
      category: "consumer",
    },
    {
      name: "6. Cheque Bounce (Commercial / Negotiable Instruments)",
      query: "A client gave a cheque of 2 lakhs which was returned by the bank unpaid due to insufficient funds. What notice is required under Section 138?",
      expectedSection: "Section 138",
      expectedAct: "Negotiable Instruments Act, 1881",
      category: "commercial",
    },
    {
      name: "7. Anticipatory Bail in Hindi (Devanagari)",
      query: "झूठी शिकायत पर गिरफ्तारी की आशंका है, अग्रिम जमानत कैसे ली जाए?",
      expectedSection: "Section 482",
      expectedAct: "BNSS, 2023",
      category: "criminal",
    },
    {
      name: "8. Cheque Bounce in Hindi (Devanagari)",
      query: "खाते में पर्याप्त राशि न होने के कारण चेक बाउंस हो गया, 138 का कानूनी नोटिस",
      expectedSection: "Section 138",
      expectedAct: "Negotiable Instruments Act, 1881",
      category: "commercial",
    },
    {
      name: "9. Out-of-Scope Query (Admiralty / Maritime Salvage - Unenacted in registry)",
      query: "Maritime salvage claim for vessel adrift in international waters off Cochin",
      expectNoMatch: true,
    },
    {
      name: "10. Nonsense Gibberish Query (False Positive Guard)",
      query: "asldkfj zxcmvn qwoeiru poiuasdf",
      expectNoMatch: true,
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    const res = await retrieveLegalSourcesHybrid(tc.query, {
      limit: 3,
      minScoreThreshold: 3.0,
      factsContext: tc.category ? { possiblePracticeAreas: [tc.category] } : undefined,
    });

    console.log(`[TEST] ${tc.name}`);
    console.log(`  Query: "${tc.query}"`);
    console.log(`  Matches Found: ${res.sources.length}`);

    if (tc.expectNoMatch) {
      if (res.sources.length === 0 && res.hasGroundedSources === false) {
        console.log(`  ✓ [PASS] Correctly returned 0 matches with honest disclaimer:`);
        console.log(`    "${res.orientationDisclaimer}"`);
        passed++;
      } else {
        console.log(`  ✗ [FAIL] Expected 0 matches, but got ${res.sources.length} matches:`, res.sources.map(s => s.section));
        failed++;
      }
    } else {
      const topMatch = res.sources[0];
      if (!topMatch) {
        console.log(`  ✗ [FAIL] Expected top match '${tc.expectedSection}' under '${tc.expectedAct}', but got 0 matches.`);
        failed++;
        continue;
      }

      console.log(`  Top Match: ${topMatch.actShortName} - ${topMatch.section}: ${topMatch.provisionTitle}`);
      console.log(`  Official URL: ${topMatch.officialSourceUrl}`);
      console.log(`  Verification: ${topMatch.verificationStatus}`);

      const sectionMatch = topMatch.section.includes(tc.expectedSection);
      const actMatch = topMatch.actShortName.includes(tc.expectedAct) || topMatch.actName.includes(tc.expectedAct);

      let disallowedViolated = false;
      if (tc.disallowedSection && topMatch.section.includes(tc.disallowedSection)) {
        disallowedViolated = true;
      }

      if (sectionMatch && actMatch && !disallowedViolated) {
        console.log(`  ✓ [PASS] Accurately retrieved ${topMatch.section} under ${topMatch.actShortName}`);
        
        // Also test citation validation against generated text
        const sampleAiAnswer = `Under ${topMatch.actShortName}, ${topMatch.section} applies to this situation.`;
        const validated = validateCitations(sampleAiAnswer, res.sources);
        const citationValid = validated.some(v => v.id === topMatch.id);
        if (citationValid) {
          console.log(`  ✓ [PASS] Citation correctly validated against retrieved source record.`);
        } else {
          console.log(`  ✗ [FAIL] Citation validation failed.`);
        }
        passed++;
      } else {
        console.log(`  ✗ [FAIL] Expected ${tc.expectedSection} under ${tc.expectedAct}. Got ${topMatch.section} under ${topMatch.actShortName}. Disallowed violated: ${disallowedViolated}`);
        failed++;
      }
    }
    console.log("");
  }

  console.log("======================================================================");
  console.log(`>>> REPRESENTATIVE QUERY AUDIT: ${passed} PASSED | ${failed} FAILED <<<`);
  console.log("======================================================================");

  if (failed > 0) process.exit(1);
}

runRepresentativeRetrievalAudit().catch(err => {
  console.error("Audit threw exception:", err);
  process.exit(1);
});
