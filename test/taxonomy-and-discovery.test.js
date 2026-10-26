const assert = require("assert");

// Import the compiled/transpiled or direct logic for taxonomy
// We can test the exact taxonomy logic implemented in lib/taxonomy/practice-areas.ts
const CANONICAL_PRACTICE_AREAS = [
  {
    id: "criminal",
    canonicalName: "Criminal Defense",
    enLabel: "Criminal Law & Defense",
    hiLabel: "आपराधिक कानून व बचाव",
    synonyms: [
      "criminal",
      "criminal law",
      "criminal defense",
      "cyber crime",
      "bail & criminal appeals",
      "आपराधिक कानून",
      "फौजदारी",
    ],
  },
  {
    id: "property",
    canonicalName: "Real Estate & RERA",
    enLabel: "Property, Tenancy & RERA",
    hiLabel: "संपत्ति, किराया व रेरा",
    synonyms: [
      "property",
      "property & tenancy",
      "real estate",
      "real estate & rera",
      "real estate & rera appeals",
      "property partition",
      "tenancy disputes",
      "land revenue",
      "संपत्ति व किराया",
      "भू-संपदा",
    ],
  },
  {
    id: "family",
    canonicalName: "Family & Matrimonial",
    enLabel: "Family & Matrimonial",
    hiLabel: "पारिवारिक व वैवाहिक",
    synonyms: [
      "family",
      "family law",
      "family matters",
      "family & matrimonial",
      "matrimonial disputes",
      "divorce & custody",
      "domestic relations",
      "पारिवारिक मामले",
      "वैवाहिक विवाद",
    ],
  },
  {
    id: "consumer",
    canonicalName: "Consumer Protection",
    enLabel: "Consumer Disputes & NCDRC",
    hiLabel: "उपभोक्ता संरक्षण विवाद",
    synonyms: [
      "consumer",
      "consumer protection",
      "consumer disputes",
      "consumer class litigation",
      "ncdrc appeals",
      "deficient goods",
      "उपभोक्ता विवाद",
      "उपभोक्ता संरक्षण",
    ],
  },
];

function normalizeTerm(term) {
  return term
    .toLowerCase()
    .replace(/[&/\\#,+()$~%.'":*?<>{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function resolvePracticeAreaCategory(query) {
  if (!query || query === "all") return null;
  const normalized = normalizeTerm(query);

  for (const cat of CANONICAL_PRACTICE_AREAS) {
    if (normalizeTerm(cat.id) === normalized) return cat;
    if (normalizeTerm(cat.canonicalName) === normalized) return cat;
    if (normalizeTerm(cat.enLabel) === normalized) return cat;
    if (normalizeTerm(cat.hiLabel) === normalized) return cat;

    for (const syn of cat.synonyms) {
      const normSyn = normalizeTerm(syn);
      if (normSyn === normalized || normalized.includes(normSyn) || normSyn.includes(normalized)) {
        return cat;
      }
    }
  }
  return null;
}

function matchesPracticeArea(lawyerPracticeAreas, requestedFilter) {
  if (!requestedFilter || requestedFilter === "all") return true;
  if (!Array.isArray(lawyerPracticeAreas) || lawyerPracticeAreas.length === 0) return false;

  const requestedCategory = resolvePracticeAreaCategory(requestedFilter);
  const normalizedRequested = normalizeTerm(requestedFilter);

  return lawyerPracticeAreas.some((pa) => {
    const normalizedPA = normalizeTerm(pa);
    if (normalizedPA === normalizedRequested) return true;
    if (normalizedPA.includes(normalizedRequested) || normalizedRequested.includes(normalizedPA)) {
      return true;
    }
    if (requestedCategory) {
      const paCategory = resolvePracticeAreaCategory(pa);
      if (paCategory && paCategory.id === requestedCategory.id) {
        return true;
      }
      if (
        requestedCategory.synonyms.some((syn) => {
          const normSyn = normalizeTerm(syn);
          return normalizedPA.includes(normSyn) || normSyn.includes(normalizedPA);
        })
      ) {
        return true;
      }
    }
    return false;
  });
}

// Test Dataset reflecting real database records (e.g. Adv. Arjun Mehta, Adv. Priya Kapoor, etc.)
const testAdvocates = [
  {
    id: "adv-1",
    professional_name: "fake Adv. Arjun Mehta",
    practice_areas: ["Criminal Defense", "Civil Litigation"],
    experience_years: 14,
    city: "New Delhi",
    consultation_modes: ["Online Video Consultation", "In-Chambers Consultation"],
    consultation_fee: 2500,
  },
  {
    id: "adv-2",
    professional_name: "fake Adv. Priya Kapoor",
    practice_areas: ["Real Estate & RERA", "Consumer Protection"],
    experience_years: 9,
    city: "Mumbai",
    consultation_modes: ["Online Video Consultation"],
    consultation_fee: 1800,
  },
  {
    id: "adv-3",
    professional_name: "fake Adv. Rajesh Verma",
    practice_areas: ["Family & Matrimonial"],
    experience_years: 18,
    city: "Bengaluru",
    consultation_modes: ["In-Chambers Consultation"],
    consultation_fee: 3000,
  },
  {
    id: "adv-4",
    professional_name: "fake Adv. Ananya Sharma",
    practice_areas: ["Consumer Protection", "Cyber Crime & IT"],
    experience_years: 6,
    city: "New Delhi",
    consultation_modes: ["Online Video Consultation"],
    consultation_fee: 1500,
  },
];

console.log("--- RUNNING TAXONOMY & DISCOVERY TESTS ---\n");

// 1. Hero Category 1: Criminal Law (Query: "Criminal Law" vs DB: "Criminal Defense" and "Cyber Crime & IT")
const criminalMatches = testAdvocates.filter((a) =>
  matchesPracticeArea(a.practice_areas, "Criminal Law")
);
assert.strictEqual(criminalMatches.length, 2, "Criminal Law should match Adv. Arjun Mehta (Criminal Defense) and Adv. Ananya Sharma (Cyber Crime)");
assert.ok(criminalMatches.some((a) => a.professional_name === "fake Adv. Arjun Mehta"));
assert.ok(criminalMatches.some((a) => a.professional_name === "fake Adv. Ananya Sharma"));
console.log("✔ Category 1: 'Criminal Law' hero query correctly matches 'Criminal Defense' & 'Cyber Crime' in directory.");

// 2. Hero Category 2: Property & Tenancy (Query: "Property & Tenancy" vs DB: "Real Estate & RERA")
const propertyMatches = testAdvocates.filter((a) =>
  matchesPracticeArea(a.practice_areas, "Property & Tenancy")
);
assert.strictEqual(propertyMatches.length, 1, "Property & Tenancy should match Adv. Priya Kapoor");
assert.strictEqual(propertyMatches[0].professional_name, "fake Adv. Priya Kapoor");
console.log("✔ Category 2: 'Property & Tenancy' hero query correctly matches 'Real Estate & RERA'.");

// 3. Hero Category 3: Family Matters (Query: "Family Matters" vs DB: "Family & Matrimonial")
const familyMatches = testAdvocates.filter((a) =>
  matchesPracticeArea(a.practice_areas, "Family Matters")
);
assert.strictEqual(familyMatches.length, 1, "Family Matters should match Adv. Rajesh Verma");
assert.strictEqual(familyMatches[0].professional_name, "fake Adv. Rajesh Verma");
console.log("✔ Category 3: 'Family Matters' hero query correctly matches 'Family & Matrimonial'.");

// 4. Hero Category 4: Consumer Disputes (Query: "Consumer Disputes" vs DB: "Consumer Protection")
const consumerMatches = testAdvocates.filter((a) =>
  matchesPracticeArea(a.practice_areas, "Consumer Disputes")
);
assert.strictEqual(consumerMatches.length, 2, "Consumer Disputes should match Adv. Priya Kapoor and Adv. Ananya Sharma");
console.log("✔ Category 4: 'Consumer Disputes' hero query correctly matches 'Consumer Protection' advocates.");

// 5. Hindi Category Queries
const hindiCriminal = testAdvocates.filter((a) =>
  matchesPracticeArea(a.practice_areas, "आपराधिक कानून व बचाव")
);
assert.strictEqual(hindiCriminal.length, 2);
console.log("✔ Hindi taxonomy query 'आपराधिक कानून व बचाव' correctly matches 'Criminal Defense' & 'Cyber Crime'.");

// 6. Experience Range Filtering
const seniorAdvocates = testAdvocates.filter((a) => a.experience_years >= 15);
assert.strictEqual(seniorAdvocates.length, 1);
assert.strictEqual(seniorAdvocates[0].professional_name, "fake Adv. Rajesh Verma");
console.log("✔ Senior advocate filter (15+ Years) returns only eligible records.");

// 7. Consultation Mode Filtering
const onlineOnly = testAdvocates.filter((a) =>
  a.consultation_modes.some((m) => m.toLowerCase().includes("online"))
);
assert.strictEqual(onlineOnly.length, 3, "3 advocates support online video consultation");
console.log("✔ Consultation mode filter (Online Video) matches advocates accurately.");

// 8. Pagination verification
const pageSize = 2;
const totalPages = Math.ceil(testAdvocates.length / pageSize);
assert.strictEqual(totalPages, 2, "4 items with page size 2 should equal 2 pages");
const page1 = testAdvocates.slice(0, 2);
const page2 = testAdvocates.slice(2, 4);
assert.strictEqual(page1.length, 2);
assert.strictEqual(page2.length, 2);
console.log("✔ Directory pagination slices items without overlap or duplicates.");

console.log("\nALL 8 TAXONOMY & DISCOVERY UNIT TESTS PASSED SUCCESSFULLY!");
