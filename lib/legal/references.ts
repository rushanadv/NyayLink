/**
 * NyayLink Authoritative Legal Reference Layer
 * Grounded in official India Code, e-Gazette, and Court publications.
 * Distinguishes primary statutory text from secondary commentary.
 */

export interface StatutoryReference {
  id: string;
  actName: string;
  actShortName: string;
  actYear: number;
  section: string;
  provisionTitle: string;
  jurisdiction: "Union of India (Central)" | "State-specific";
  officialSourceUrl: string;
  sourcePublisher: string;
  lastCheckedDate: string;
  verificationStatus: "officially_verified" | "pending_gazette_update";
  category: "criminal" | "civil" | "consumer" | "property" | "commercial";
  keyStatutoryText: string;
  plainSummary: string;
  statutoryLimitationNote?: string;
}

export const CANONICAL_LEGAL_REFERENCES: StatutoryReference[] = [
  // --- BNS / BNSS (Criminal Law) ---
  {
    id: "bns-sec-318",
    actName: "Bharatiya Nyaya Sanhita, 2023",
    actShortName: "BNS, 2023",
    actYear: 2023,
    section: "Section 318",
    provisionTitle: "Cheating and dishonestly inducing delivery of property",
    jurisdiction: "Union of India (Central)",
    officialSourceUrl: "https://www.indiacode.nic.in/handle/123456789/20062",
    sourcePublisher: "Ministry of Law and Justice, Government of India (Act No. 45 of 2023)",
    lastCheckedDate: "2026-07-01",
    verificationStatus: "officially_verified",
    category: "criminal",
    keyStatutoryText: "Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.",
    plainSummary: "Replaces Section 420 of the erstwhile Indian Penal Code (IPC). Covers fraudulent inducement of money, property, or contract execution.",
  },
  {
    id: "bnss-sec-173",
    actName: "Bharatiya Nagarik Suraksha Sanhita, 2023",
    actShortName: "BNSS, 2023",
    actYear: 2023,
    section: "Section 173",
    provisionTitle: "Information in cognizable cases (First Information Report - FIR)",
    jurisdiction: "Union of India (Central)",
    officialSourceUrl: "https://www.indiacode.nic.in/handle/123456789/20063",
    sourcePublisher: "Ministry of Law and Justice, Government of India (Act No. 46 of 2023)",
    lastCheckedDate: "2026-07-01",
    verificationStatus: "officially_verified",
    category: "criminal",
    keyStatutoryText: "Every information relating to the commission of a cognizable offence, if given orally to an officer in charge of a police station, shall be reduced to writing by him or under his direction... Provided that information may also be given electronically (e-FIR) to be signed within three days.",
    plainSummary: "Replaces Section 154 of CrPC. Mandates registration of FIR for cognizable offences and explicitly recognizes preliminary electronic intimation (e-FIR).",
  },
  {
    id: "bnss-sec-480",
    actName: "Bharatiya Nagarik Suraksha Sanhita, 2023",
    actShortName: "BNSS, 2023",
    actYear: 2023,
    section: "Section 480",
    provisionTitle: "When bail may be taken in case of non-bailable offence (Regular Bail)",
    jurisdiction: "Union of India (Central)",
    officialSourceUrl: "https://www.indiacode.nic.in/handle/123456789/20063",
    sourcePublisher: "Ministry of Law and Justice, Government of India",
    lastCheckedDate: "2026-07-01",
    verificationStatus: "officially_verified",
    category: "criminal",
    keyStatutoryText: "When any person accused of, or suspected of, the commission of any non-bailable offence is arrested or detained without warrant... he may be released on bail by a Court other than the High Court or Court of Session.",
    plainSummary: "Corresponds to Section 437 of the CrPC. Details statutory grounds and discretionary considerations for regular bail before Magistrates.",
  },
  {
    id: "bnss-sec-482",
    actName: "Bharatiya Nagarik Suraksha Sanhita, 2023",
    actShortName: "BNSS, 2023",
    actYear: 2023,
    section: "Section 482",
    provisionTitle: "Direction for grant of bail to person apprehending arrest (Anticipatory Bail)",
    jurisdiction: "Union of India (Central)",
    officialSourceUrl: "https://www.indiacode.nic.in/handle/123456789/20063",
    sourcePublisher: "Ministry of Law and Justice, Government of India",
    lastCheckedDate: "2026-07-01",
    verificationStatus: "officially_verified",
    category: "criminal",
    keyStatutoryText: "Where any person has reason to believe that he may be arrested on accusation of having committed a non-bailable offence, he may apply to the High Court or the Court of Session for a direction under this section.",
    plainSummary: "Corresponds to Section 438 CrPC. Allows an accused to seek judicial protection against imminent arrest before Sessions or High Court.",
  },

  // --- Consumer Protection Act, 2019 ---
  {
    id: "cpa-sec-35",
    actName: "Consumer Protection Act, 2019",
    actShortName: "CPA, 2019",
    actYear: 2019,
    section: "Section 35",
    provisionTitle: "Manner in which complaint shall be made before District Commission",
    jurisdiction: "Union of India (Central)",
    officialSourceUrl: "https://www.indiacode.nic.in/handle/123456789/15256",
    sourcePublisher: "Ministry of Consumer Affairs, Food and Public Distribution (Act No. 35 of 2019)",
    lastCheckedDate: "2026-07-01",
    verificationStatus: "officially_verified",
    category: "consumer",
    keyStatutoryText: "A complaint, in relation to any goods sold or delivered or agreed to be sold or delivered or any service provided or agreed to be provided, may be filed with a District Commission by the consumer... electronically or in physical copy.",
    plainSummary: "Governs filing of consumer complaints before District Consumer Disputes Redressal Commissions (DCDRC), including e-Daakhil electronic portal filings.",
  },
  {
    id: "cpa-sec-69",
    actName: "Consumer Protection Act, 2019",
    actShortName: "CPA, 2019",
    actYear: 2019,
    section: "Section 69",
    provisionTitle: "Limitation period for filing consumer complaints",
    jurisdiction: "Union of India (Central)",
    officialSourceUrl: "https://www.indiacode.nic.in/handle/123456789/15256",
    sourcePublisher: "Ministry of Consumer Affairs, Food and Public Distribution",
    lastCheckedDate: "2026-07-01",
    verificationStatus: "officially_verified",
    category: "consumer",
    keyStatutoryText: "The District Commission, the State Commission or the National Commission shall not admit a complaint unless it is filed within two years from the date on which the cause of action has arisen. Provided that a complaint may be entertained after the period specified if sufficient cause is shown.",
    plainSummary: "Strict 2-year statutory limitation period from the date of deficient service, defect in goods, or cause of action.",
    statutoryLimitationNote: "2 years from cause of action. Condonation of delay permissible under Section 69(2) only upon recorded sufficient cause.",
  },

  // --- Real Estate (Regulation & Development) Act, 2016 ---
  {
    id: "rera-sec-18",
    actName: "Real Estate (Regulation and Development) Act, 2016",
    actShortName: "RERA, 2016",
    actYear: 2016,
    section: "Section 18",
    provisionTitle: "Return of amount and compensation for delayed possession",
    jurisdiction: "Union of India (Central)",
    officialSourceUrl: "https://www.indiacode.nic.in/handle/123456789/2158",
    sourcePublisher: "Ministry of Housing and Urban Affairs (Act No. 16 of 2016)",
    lastCheckedDate: "2026-07-01",
    verificationStatus: "officially_verified",
    category: "property",
    keyStatutoryText: "If the promoter fails to complete or is unable to give possession of an apartment, plot or building in accordance with the terms of the agreement for sale... he shall be liable on demand to the allottees to return the amount received with interest at prescribed rate including compensation.",
    plainSummary: "Right of homebuyers to demand full refund with interest for project delays, or monthly delayed possession interest if choosing to remain in the project.",
    statutoryLimitationNote: "Continuing cause of action while default and non-possession persists, as affirmed by the Supreme Court of India in Newtech Promoters (2021).",
  },
  {
    id: "rera-sec-31",
    actName: "Real Estate (Regulation and Development) Act, 2016",
    actShortName: "RERA, 2016",
    actYear: 2016,
    section: "Section 31",
    provisionTitle: "Filing of complaints with the Authority or the Adjudicating Officer",
    jurisdiction: "Union of India (Central)",
    officialSourceUrl: "https://www.indiacode.nic.in/handle/123456789/2158",
    sourcePublisher: "Ministry of Housing and Urban Affairs",
    lastCheckedDate: "2026-07-01",
    verificationStatus: "officially_verified",
    category: "property",
    keyStatutoryText: "Any aggrieved person may file a complaint with the Authority or the adjudicating officer, as the case may be, for any violation or contravention of the provisions of this Act or the rules and regulations made thereunder.",
    plainSummary: "Statutory jurisdiction for homebuyers to initiate complaint proceedings (Form M) before State RERA Authorities.",
  },

  // --- Civil Procedure Code, 1908 ---
  {
    id: "cpc-order-39",
    actName: "Code of Civil Procedure, 1908",
    actShortName: "CPC, 1908",
    actYear: 1908,
    section: "Order XXXIX, Rules 1 & 2",
    provisionTitle: "Temporary Injunctions and Interlocutory Orders",
    jurisdiction: "Union of India (Central)",
    officialSourceUrl: "https://www.indiacode.nic.in/handle/123456789/2191",
    sourcePublisher: "Legislative Department, Government of India (Act No. 5 of 1908)",
    lastCheckedDate: "2026-07-01",
    verificationStatus: "officially_verified",
    category: "civil",
    keyStatutoryText: "Where in any suit it is proved by affidavit or otherwise that any property in dispute in a suit is in danger of being wasted, damaged or alienated by any party to the suit... the Court may by order grant a temporary injunction to restrain such act.",
    plainSummary: "Primary civil mechanism to obtain immediate interim stay or injunction to protect property, tenancy, or contractual rights pending trial.",
  },

  // --- Negotiable Instruments Act (Cheque Bounce) ---
  {
    id: "ni-sec-138",
    actName: "Negotiable Instruments Act, 1881",
    actShortName: "NI Act, 1881",
    actYear: 1881,
    section: "Section 138",
    provisionTitle: "Dishonour of cheque for insufficiency, etc., of funds in the account",
    jurisdiction: "Union of India (Central)",
    officialSourceUrl: "https://www.indiacode.nic.in/handle/123456789/2205",
    sourcePublisher: "Ministry of Law and Justice, Government of India",
    lastCheckedDate: "2026-07-01",
    verificationStatus: "officially_verified",
    category: "commercial",
    keyStatutoryText: "Where any cheque drawn by a person on an account maintained by him with a banker for payment of any amount of money... is returned by the bank unpaid, either because of the amount of money standing to the credit of that account is insufficient... such person shall be deemed to have committed an offence.",
    plainSummary: "Criminal liability for dishonoured cheques. Requires strict 30-day statutory legal notice and 15-day payment grace period prior to complaint.",
    statutoryLimitationNote: "Statutory notice within 30 days of bank memo. Complaint under Section 142 within 1 month after expiry of 15-day notice period.",
  },
];

/**
 * Searches authoritative references by keyword or category
 */
export function searchLegalReferences(
  query: string,
  category?: string
): StatutoryReference[] {
  const q = query.toLowerCase().trim();
  return CANONICAL_LEGAL_REFERENCES.filter((ref) => {
    if (category && category !== "all" && ref.category !== category) return false;
    if (!q) return true;

    return (
      ref.actName.toLowerCase().includes(q) ||
      ref.actShortName.toLowerCase().includes(q) ||
      ref.section.toLowerCase().includes(q) ||
      ref.provisionTitle.toLowerCase().includes(q) ||
      ref.plainSummary.toLowerCase().includes(q) ||
      ref.keyStatutoryText.toLowerCase().includes(q)
    );
  });
}
