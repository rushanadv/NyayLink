/**
 * NyayLink Canonical Practice Area Taxonomy & Harmonization Engine
 *
 * Provides a single source of truth for legal practice areas across:
 * - The Unfolding Brief hero component
 * - Lawyer discovery (/lawyers) & search filters
 * - Advocate onboarding & profile completion
 * - Client portal consultation requests
 * - English and Hindi localized labels
 */

export interface PracticeAreaDefinition {
  id: string;
  canonicalName: string;
  enLabel: string;
  hiLabel: string;
  synonyms: string[];
}

export const CANONICAL_PRACTICE_AREAS: PracticeAreaDefinition[] = [
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
  {
    id: "civil",
    canonicalName: "Civil Litigation",
    enLabel: "Civil Litigation & Appeals",
    hiLabel: "दीवानी वाद व अपील",
    synonyms: [
      "civil",
      "civil litigation",
      "civil appeals",
      "contract law",
      "contract disputes",
      "specific performance",
      "दीवानी",
    ],
  },
  {
    id: "corporate",
    canonicalName: "Corporate & Commercial",
    enLabel: "Corporate & Commercial",
    hiLabel: "कॉर्पोरेट व वाणिज्यिक",
    synonyms: [
      "corporate",
      "commercial",
      "corporate & commercial",
      "commercial litigation",
      "company law",
      "arbitration & adr",
      "arbitration",
      "nclt",
      "insolvency & bankruptcy (nclt)",
      "कॉर्पोरेट",
    ],
  },
  {
    id: "constitutional",
    canonicalName: "Constitutional Law",
    enLabel: "Constitutional & Writ Practice",
    hiLabel: "संवैधानिक व रिट याचिकाएं",
    synonyms: [
      "constitutional",
      "constitutional law",
      "constitutional & writ",
      "writ petitions",
      "fundamental rights",
      "संवैधानिक",
    ],
  },
  {
    id: "banking",
    canonicalName: "Banking & DRT / IBC",
    enLabel: "Banking, DRT & Insolvency",
    hiLabel: "बैंकिंग, डीआरटी व दिवालियापन",
    synonyms: [
      "banking",
      "banking & drt",
      "banking & drt / ibc",
      "drt",
      "sarfaesi",
      "insolvency & bankruptcy (nclt)",
      "बैंकिंग",
    ],
  },
  {
    id: "ip_tech",
    canonicalName: "Intellectual Property",
    enLabel: "Intellectual Property & Cyber",
    hiLabel: "बौद्धिक संपदा व साइबर कानून",
    synonyms: [
      "intellectual property",
      "technology & ip",
      "technology, ip & data protection",
      "cyber law & it act",
      "patent & trademark",
      "बौद्धिक संपदा",
    ],
  },
  {
    id: "taxation",
    canonicalName: "Taxation & GST",
    enLabel: "Taxation & GST",
    hiLabel: "आयकर व जीएसटी",
    synonyms: [
      "taxation",
      "taxation & gst",
      "income tax",
      "gst appeals",
      "कराधान",
    ],
  },
  {
    id: "labour",
    canonicalName: "Labour & Industrial",
    enLabel: "Labour & Industrial Law",
    hiLabel: "श्रम व औद्योगिक कानून",
    synonyms: [
      "labour",
      "labor",
      "labour & industrial",
      "industrial disputes",
      "employment law",
      "श्रम कानून",
    ],
  },
  {
    id: "mact",
    canonicalName: "Motor Accident (MACT)",
    enLabel: "Motor Accident Claims (MACT)",
    hiLabel: "मोटर दुर्घटना दावा (MACT)",
    synonyms: [
      "motor accident",
      "motor accident (mact)",
      "mact",
      "motor vehicles act",
      "मोटर दुर्घटना",
    ],
  },
];

/**
 * Normalizes any freeform or localized string for robust comparison.
 */
function normalizeTerm(term: string): string {
  return term
    .toLowerCase()
    .replace(/[&/\\#,+()$~%.'":*?<>{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Resolves any search query, hero link value, or display label into its canonical category definition.
 */
export function resolvePracticeAreaCategory(
  query: string
): PracticeAreaDefinition | null {
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

/**
 * Evaluates whether an advocate's array of practice areas matches a requested filter value.
 * Supports:
 * - Direct canonical match
 * - Category synonym matching (e.g. "Criminal Law" matches "Criminal Defense")
 * - Substring and multi-language queries
 */
export function matchesPracticeArea(
  lawyerPracticeAreas: string[] | undefined | null,
  requestedFilter: string | undefined | null
): boolean {
  if (!requestedFilter || requestedFilter === "all") return true;
  if (!Array.isArray(lawyerPracticeAreas) || lawyerPracticeAreas.length === 0) return false;

  const requestedCategory = resolvePracticeAreaCategory(requestedFilter);
  const normalizedRequested = normalizeTerm(requestedFilter);

  return lawyerPracticeAreas.some((pa) => {
    const normalizedPA = normalizeTerm(pa);

    // 1. Exact string match after normalization
    if (normalizedPA === normalizedRequested) return true;

    // 2. Substring match
    if (normalizedPA.includes(normalizedRequested) || normalizedRequested.includes(normalizedPA)) {
      return true;
    }

    // 3. Category-level match (e.g., both belong to Criminal, Property, Family, Consumer, etc.)
    if (requestedCategory) {
      const paCategory = resolvePracticeAreaCategory(pa);
      if (paCategory && paCategory.id === requestedCategory.id) {
        return true;
      }

      // Check against category synonyms directly
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

/**
 * Returns all canonical practice area values formatted for directory filter dropdowns.
 */
export function getCanonicalFilterOptions(isHindi: boolean = false): Array<{ value: string; label: string }> {
  return [
    { value: "all", label: isHindi ? "सभी विशेषज्ञताएं (All Practice Areas)" : "All Practice Areas" },
    ...CANONICAL_PRACTICE_AREAS.map((item) => ({
      value: item.canonicalName,
      label: isHindi ? `${item.hiLabel} (${item.enLabel})` : item.enLabel,
    })),
  ];
}
