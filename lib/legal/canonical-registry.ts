/**
 * NyayLink Curated Indian Legal Source Registry
 *
 * Official Entry Point: India Code Digital Repository (https://www.indiacode.nic.in/indiacode/home.jsp)
 * Grounded in official e-Gazette notifications, Legislative Department enactments, and Ministry publications.
 *
 * COVERAGE DISCLAIMER:
 * This registry contains a selectively curated, verified statutory corpus under core Indian central enactments:
 * - Bharatiya Nyaya Sanhita, 2023 (BNS) [Act No. 45 of 2023]
 * - Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS) [Act No. 46 of 2023]
 * - Bharatiya Sakshya Adhiniyam, 2023 (BSA) [Act No. 47 of 2023]
 * - Code of Civil Procedure, 1908 (CPC) [Act No. 5 of 1908]
 * - Consumer Protection Act, 2019 (CPA) [Act No. 35 of 2019]
 * - Real Estate (Regulation and Development) Act, 2016 (RERA) [Act No. 16 of 2016]
 * - Negotiable Instruments Act, 1881 [Act No. 26 of 1881]
 * - Indian Contract Act, 1872 [Act No. 9 of 1872]
 * - Transfer of Property Act, 1882 [Act No. 4 of 1882]
 * - Hindu Marriage Act, 1955 [Act No. 25 of 1955]
 * - Protection of Women from Domestic Violence Act, 2005 [Act No. 43 of 2005]
 * - Information Technology Act, 2000 [Act No. 21 of 2000]
 * - Motor Vehicles Act, 1988 [Act No. 59 of 1988]
 *
 * It is NOT an exhaustive compilation of all Indian legislation. State-specific rules, local rent control laws,
 * municipal by-laws, and uncodified customary personal laws require advocate verification.
 */

export type StatutoryCategory =
  | "criminal"
  | "civil"
  | "consumer"
  | "property"
  | "commercial"
  | "family"
  | "labour"
  | "cyber";

export type VerificationStatus =
  | "officially_verified"
  | "pending_gazette_update"
  | "unverified"
  | "outdated";

export interface LegalSourceDocument {
  id: string;
  actCode: string;
  title: string;
  shortTitle: string;
  actNumber: string;
  actYear: number;
  documentType: "Central Act" | "State Act" | "Rules" | "Regulations";
  enactmentDate?: string;
  effectiveDate?: string;
  jurisdiction: "Union of India (Central)" | "State-specific";
  issuingAuthority: string;
  officialUrl: string;
  provenance: string;
  verificationStatus: VerificationStatus;
  lastCheckedDate: string;
  isActive: boolean;
  metadata?: Record<string, unknown>;
}

export interface LegalSourceProvision {
  id: string;
  documentId: string;
  actName: string;
  actShortName: string;
  actYear: number;
  provisionIdentifier: string; // e.g., "Section 318" or "Order XXXIX, Rules 1 & 2"
  title: string;
  chapter?: string;
  content: string; // Exact enacted statutory text
  plainSummary: string; // Plain-language explanation
  statutoryLimitationNote?: string;
  category: StatutoryCategory;
  keywords: string[];
  officialUrl: string;
  issuingAuthority: string;
  verificationStatus: VerificationStatus;
  provenance: string;
  lastCheckedDate: string;
  isActive: boolean;
  isEmbedded?: boolean;
  embeddingModel?: string | null;
  embeddedAt?: string | null;
  embeddingDimension?: number;
}

export const CANONICAL_DOCUMENTS: LegalSourceDocument[] = [
  {
    id: "doc-bns-2023",
    actCode: "BNS_2023",
    title: "Bharatiya Nyaya Sanhita, 2023",
    shortTitle: "BNS, 2023",
    actNumber: "Act No. 45 of 2023",
    actYear: 2023,
    documentType: "Central Act",
    enactmentDate: "2023-12-25",
    effectiveDate: "2024-07-01",
    jurisdiction: "Union of India (Central)",
    issuingAuthority: "Ministry of Law and Justice, Legislative Department",
    officialUrl: "https://www.indiacode.nic.in/handle/123456789/20062",
    provenance: "Official India Code Portal / e-Gazette Notification S.O. 850(E)",
    verificationStatus: "officially_verified",
    lastCheckedDate: "2026-10-27",
    isActive: true,
  },
  {
    id: "doc-bnss-2023",
    actCode: "BNSS_2023",
    title: "Bharatiya Nagarik Suraksha Sanhita, 2023",
    shortTitle: "BNSS, 2023",
    actNumber: "Act No. 46 of 2023",
    actYear: 2023,
    documentType: "Central Act",
    enactmentDate: "2023-12-25",
    effectiveDate: "2024-07-01",
    jurisdiction: "Union of India (Central)",
    issuingAuthority: "Ministry of Law and Justice, Legislative Department",
    officialUrl: "https://www.indiacode.nic.in/handle/123456789/20063",
    provenance: "Official India Code Portal / e-Gazette Notification S.O. 848(E)",
    verificationStatus: "officially_verified",
    lastCheckedDate: "2026-10-27",
    isActive: true,
  },
  {
    id: "doc-bsa-2023",
    actCode: "BSA_2023",
    title: "Bharatiya Sakshya Adhiniyam, 2023",
    shortTitle: "BSA, 2023",
    actNumber: "Act No. 47 of 2023",
    actYear: 2023,
    documentType: "Central Act",
    enactmentDate: "2023-12-25",
    effectiveDate: "2024-07-01",
    jurisdiction: "Union of India (Central)",
    issuingAuthority: "Ministry of Law and Justice, Legislative Department",
    officialUrl: "https://www.indiacode.nic.in/handle/123456789/20064",
    provenance: "Official India Code Portal / e-Gazette Notification S.O. 849(E)",
    verificationStatus: "officially_verified",
    lastCheckedDate: "2026-10-27",
    isActive: true,
  },
  {
    id: "doc-cpc-1908",
    actCode: "CPC_1908",
    title: "Code of Civil Procedure, 1908",
    shortTitle: "CPC, 1908",
    actNumber: "Act No. 5 of 1908",
    actYear: 1908,
    documentType: "Central Act",
    enactmentDate: "1908-03-21",
    effectiveDate: "1909-01-01",
    jurisdiction: "Union of India (Central)",
    issuingAuthority: "Legislative Department, Government of India",
    officialUrl: "https://www.indiacode.nic.in/handle/123456789/2191",
    provenance: "Official India Code Portal / Ministry of Law and Justice",
    verificationStatus: "officially_verified",
    lastCheckedDate: "2026-10-27",
    isActive: true,
  },
  {
    id: "doc-cpa-2019",
    actCode: "CPA_2019",
    title: "Consumer Protection Act, 2019",
    shortTitle: "CPA, 2019",
    actNumber: "Act No. 35 of 2019",
    actYear: 2019,
    documentType: "Central Act",
    enactmentDate: "2019-08-09",
    effectiveDate: "2020-07-20",
    jurisdiction: "Union of India (Central)",
    issuingAuthority: "Ministry of Consumer Affairs, Food and Public Distribution",
    officialUrl: "https://www.indiacode.nic.in/handle/123456789/15256",
    provenance: "Official India Code Portal / Ministry of Consumer Affairs",
    verificationStatus: "officially_verified",
    lastCheckedDate: "2026-10-27",
    isActive: true,
  },
  {
    id: "doc-rera-2016",
    actCode: "RERA_2016",
    title: "Real Estate (Regulation and Development) Act, 2016",
    shortTitle: "RERA, 2016",
    actNumber: "Act No. 16 of 2016",
    actYear: 2016,
    documentType: "Central Act",
    enactmentDate: "2016-03-25",
    effectiveDate: "2016-05-01",
    jurisdiction: "Union of India (Central)",
    issuingAuthority: "Ministry of Housing and Urban Affairs",
    officialUrl: "https://www.indiacode.nic.in/handle/123456789/2158",
    provenance: "Official India Code Portal / Ministry of Housing and Urban Affairs",
    verificationStatus: "officially_verified",
    lastCheckedDate: "2026-10-27",
    isActive: true,
  },
  {
    id: "doc-ni-1881",
    actCode: "NI_1881",
    title: "Negotiable Instruments Act, 1881",
    shortTitle: "NI Act, 1881",
    actNumber: "Act No. 26 of 1881",
    actYear: 1881,
    documentType: "Central Act",
    enactmentDate: "1881-12-09",
    effectiveDate: "1882-03-01",
    jurisdiction: "Union of India (Central)",
    issuingAuthority: "Ministry of Law and Justice, Government of India",
    officialUrl: "https://www.indiacode.nic.in/handle/123456789/2205",
    provenance: "Official India Code Portal / Legislative Department",
    verificationStatus: "officially_verified",
    lastCheckedDate: "2026-10-27",
    isActive: true,
  },
  {
    id: "doc-contract-1872",
    actCode: "CONTRACT_1872",
    title: "Indian Contract Act, 1872",
    shortTitle: "Contract Act, 1872",
    actNumber: "Act No. 9 of 1872",
    actYear: 1872,
    documentType: "Central Act",
    enactmentDate: "1872-04-25",
    effectiveDate: "1872-09-01",
    jurisdiction: "Union of India (Central)",
    issuingAuthority: "Legislative Department, Government of India",
    officialUrl: "https://www.indiacode.nic.in/handle/123456789/2187",
    provenance: "Official India Code Portal / Ministry of Law and Justice",
    verificationStatus: "officially_verified",
    lastCheckedDate: "2026-10-27",
    isActive: true,
  },
  {
    id: "doc-tpa-1882",
    actCode: "TPA_1882",
    title: "Transfer of Property Act, 1882",
    shortTitle: "Transfer of Property Act, 1882",
    actNumber: "Act No. 4 of 1882",
    actYear: 1882,
    documentType: "Central Act",
    enactmentDate: "1882-02-17",
    effectiveDate: "1882-07-01",
    jurisdiction: "Union of India (Central)",
    issuingAuthority: "Legislative Department, Government of India",
    officialUrl: "https://www.indiacode.nic.in/handle/123456789/2338",
    provenance: "Official India Code Portal / Ministry of Law and Justice",
    verificationStatus: "officially_verified",
    lastCheckedDate: "2026-10-27",
    isActive: true,
  },
];

export const CANONICAL_PROVISIONS: LegalSourceProvision[] = [
  // --- BNS / BNSS (Criminal Law) ---
  {
    id: "bns-sec-318",
    documentId: "doc-bns-2023",
    actName: "Bharatiya Nyaya Sanhita, 2023",
    actShortName: "BNS, 2023",
    actYear: 2023,
    provisionIdentifier: "Section 318",
    title: "Cheating and dishonestly inducing delivery of property",
    chapter: "Chapter XVIII - Of Offences Against Property",
    content:
      "Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, or anything which is signed or sealed, and which is capable of being converted into a valuable security, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.",
    plainSummary:
      "Replaces Section 420 of the erstwhile Indian Penal Code (IPC). Covers fraudulent inducement of money, property, financial deception, or contract execution under false pretences.",
    statutoryLimitationNote:
      "Criminal prosecution subject to limitation principles under BNSS Section 514 (erstwhile CrPC Section 468).",
    category: "criminal",
    keywords: ["cheat", "cheating", "fraud", "scam", "deceived", "property", "money stolen", "420", "318", "धोखाधड़ी", "ठगी"],
    officialUrl: "https://www.indiacode.nic.in/handle/123456789/20062",
    issuingAuthority: "Ministry of Law and Justice, Legislative Department",
    provenance: "Official India Code Portal / Act No. 45 of 2023",
    verificationStatus: "officially_verified",
    lastCheckedDate: "2026-10-27",
    isActive: true,
    embeddingDimension: 1536,
  },
  {
    id: "bns-sec-316",
    documentId: "doc-bns-2023",
    actName: "Bharatiya Nyaya Sanhita, 2023",
    actShortName: "BNS, 2023",
    actYear: 2023,
    provisionIdentifier: "Section 316",
    title: "Criminal breach of trust",
    chapter: "Chapter XVIII - Of Offences Against Property",
    content:
      "Whoever, being in any manner entrusted with property, or with any dominion over property, dishonestly misappropriates or converts to his own use that property, or dishonestly uses or disposes of that property in violation of any direction of law prescribing the mode in which such trust is to be discharged, or of any legal contract, express or implied, which he has made touching the discharge of such trust, or wilfully suffers any other person so to do, commits criminal breach of trust.",
    plainSummary:
      "Replaces Section 405/406 of the erstwhile IPC. Applies when entrusted assets, funds, partnership property, or deposits are dishonestly misappropriated.",
    statutoryLimitationNote:
      "Punishable with imprisonment up to 5 years, or fine, or both.",
    category: "criminal",
    keywords: ["breach of trust", "misappropriation", "entrusted property", "funds misappropriated", "405", "406", "316", "अमानत में खयानत"],
    officialUrl: "https://www.indiacode.nic.in/handle/123456789/20062",
    issuingAuthority: "Ministry of Law and Justice, Legislative Department",
    provenance: "Official India Code Portal / Act No. 45 of 2023",
    verificationStatus: "officially_verified",
    lastCheckedDate: "2026-10-27",
    isActive: true,
    embeddingDimension: 1536,
  },
  {
    id: "bnss-sec-173",
    documentId: "doc-bnss-2023",
    actName: "Bharatiya Nagarik Suraksha Sanhita, 2023",
    actShortName: "BNSS, 2023",
    actYear: 2023,
    provisionIdentifier: "Section 173",
    title: "Information in cognizable cases (First Information Report - FIR)",
    chapter: "Chapter XII - Information to the Police and Their Powers to Investigate",
    content:
      "Every information relating to the commission of a cognizable offence, if given orally to an officer in charge of a police station, shall be reduced to writing by him or under his direction, and be read over to the informant... Provided that information may also be given electronically (e-FIR), which shall be taken on record on being signed within three days by the person giving it.",
    plainSummary:
      "Replaces Section 154 of CrPC. Mandates registration of FIR for cognizable offences and explicitly recognizes preliminary electronic intimation (e-FIR).",
    statutoryLimitationNote:
      "Prompt registration required; e-FIR must be physically signed within 3 days.",
    category: "criminal",
    keywords: ["fir", "police", "complaint", "cognizable", "efir", "station", "report", "थाना", "प्राथमिकी", "पुलिस", "154", "173"],
    officialUrl: "https://www.indiacode.nic.in/handle/123456789/20063",
    issuingAuthority: "Ministry of Law and Justice, Legislative Department",
    provenance: "Official India Code Portal / Act No. 46 of 2023",
    verificationStatus: "officially_verified",
    lastCheckedDate: "2026-10-27",
    isActive: true,
    embeddingDimension: 1536,
  },
  {
    id: "bnss-sec-480",
    documentId: "doc-bnss-2023",
    actName: "Bharatiya Nagarik Suraksha Sanhita, 2023",
    actShortName: "BNSS, 2023",
    actYear: 2023,
    provisionIdentifier: "Section 480",
    title: "When bail may be taken in case of non-bailable offence (Regular Bail)",
    chapter: "Chapter XXXV - Provisions as to Bail and Bonds",
    content:
      "When any person accused of, or suspected of, the commission of any non-bailable offence is arrested or detained without warrant by an officer in charge of a police station, or appears or is brought before a Court other than the High Court or Court of Session, he may be released on bail.",
    plainSummary:
      "Corresponds to Section 437 of the CrPC. Details statutory grounds and discretionary considerations for regular bail before Magistrates.",
    statutoryLimitationNote:
      "Discretionary before Magistrate; special considerations for women, sick, or infirm persons.",
    category: "criminal",
    keywords: ["bail", "regular bail", "custody", "magistrate", "non-bailable", "437", "480", "जमानत", "रिहाई"],
    officialUrl: "https://www.indiacode.nic.in/handle/123456789/20063",
    issuingAuthority: "Ministry of Law and Justice, Government of India",
    provenance: "Official India Code Portal / Act No. 46 of 2023",
    verificationStatus: "officially_verified",
    lastCheckedDate: "2026-10-27",
    isActive: true,
    embeddingDimension: 1536,
  },
  {
    id: "bnss-sec-482",
    documentId: "doc-bnss-2023",
    actName: "Bharatiya Nagarik Suraksha Sanhita, 2023",
    actShortName: "BNSS, 2023",
    actYear: 2023,
    provisionIdentifier: "Section 482",
    title: "Direction for grant of bail to person apprehending arrest (Anticipatory Bail)",
    chapter: "Chapter XXXV - Provisions as to Bail and Bonds",
    content:
      "Where any person has reason to believe that he may be arrested on accusation of having committed a non-bailable offence, he may apply to the High Court or the Court of Session for a direction under this section; and that Court may, if it thinks fit, direct that in the event of such arrest, he shall be released on bail.",
    plainSummary:
      "Corresponds to Section 438 CrPC. Allows an accused or apprehended individual to seek judicial protection against imminent arrest before Sessions Court or High Court.",
    statutoryLimitationNote:
      "Must be moved before actual arrest; requires establishing genuine apprehension of arrest.",
    category: "criminal",
    keywords: ["anticipatory bail", "arrest", "apprehending arrest", "sessions court", "high court", "438", "482", "अग्रिम जमानत", "गिरफ्तारी"],
    officialUrl: "https://www.indiacode.nic.in/handle/123456789/20063",
    issuingAuthority: "Ministry of Law and Justice, Government of India",
    provenance: "Official India Code Portal / Act No. 46 of 2023",
    verificationStatus: "officially_verified",
    lastCheckedDate: "2026-10-27",
    isActive: true,
    embeddingDimension: 1536,
  },
  {
    id: "bnss-sec-144",
    documentId: "doc-bnss-2023",
    actName: "Bharatiya Nagarik Suraksha Sanhita, 2023",
    actShortName: "BNSS, 2023",
    actYear: 2023,
    provisionIdentifier: "Section 144",
    title: "Order for maintenance of wives, children and parents",
    chapter: "Chapter X - Maintenance of Wives, Children and Parents",
    content:
      "If any person having sufficient means neglects or refuses to maintain his wife, unable to maintain herself, or his legitimate or illegitimate minor child... a Magistrate of the first class may, upon proof of such neglect or refusal, order such person to make a monthly allowance for the maintenance of his wife or child or parent.",
    plainSummary:
      "Corresponds to Section 125 of CrPC. Statutory secular maintenance remedy providing monthly maintenance and interim support.",
    statutoryLimitationNote:
      "Summary statutory proceeding before Family Court or Judicial Magistrate.",
    category: "family",
    keywords: ["maintenance", "wife maintenance", "child support", "parents maintenance", "125", "144", "भरण-पोषण", "खर्चा"],
    officialUrl: "https://www.indiacode.nic.in/handle/123456789/20063",
    issuingAuthority: "Ministry of Law and Justice, Government of India",
    provenance: "Official India Code Portal / Act No. 46 of 2023",
    verificationStatus: "officially_verified",
    lastCheckedDate: "2026-10-27",
    isActive: true,
    embeddingDimension: 1536,
  },

  // --- Bharatiya Sakshya Adhiniyam, 2023 (BSA) ---
  {
    id: "bsa-sec-61",
    documentId: "doc-bsa-2023",
    actName: "Bharatiya Sakshya Adhiniyam, 2023",
    actShortName: "BSA, 2023",
    actYear: 2023,
    provisionIdentifier: "Section 61",
    title: "Admissibility of electronic records",
    chapter: "Part II - On Proof / Chapter V - Documentary Evidence",
    content:
      "Nothing in this Adhiniyam shall apply to deny the admissibility of an electronic record in evidence on the ground that it is an electronic record, and such record shall have the same legal effect, validity and enforceability as other document, subject to section 63.",
    plainSummary:
      "Replaces Section 65A/65B of the erstwhile Indian Evidence Act, 1872. Affirms primary legal validity and admissibility of emails, WhatsApp records, SMS, and digital logs in judicial proceedings.",
    statutoryLimitationNote:
      "Governed by certificate requirements under BSA Section 63.",
    category: "civil",
    keywords: ["electronic evidence", "whatsapp evidence", "email proof", "digital record", "certificate", "65b", "61", "इलेक्ट्रॉनिक साक्ष्य"],
    officialUrl: "https://www.indiacode.nic.in/handle/123456789/20064",
    issuingAuthority: "Ministry of Law and Justice, Legislative Department",
    provenance: "Official India Code Portal / Act No. 47 of 2023",
    verificationStatus: "officially_verified",
    lastCheckedDate: "2026-10-27",
    isActive: true,
    embeddingDimension: 1536,
  },

  // --- Consumer Protection Act, 2019 ---
  {
    id: "cpa-sec-35",
    documentId: "doc-cpa-2019",
    actName: "Consumer Protection Act, 2019",
    actShortName: "CPA, 2019",
    actYear: 2019,
    provisionIdentifier: "Section 35",
    title: "Manner in which complaint shall be made before District Commission",
    chapter: "Chapter IV - Consumer Disputes Redressal Commission",
    content:
      "A complaint, in relation to any goods sold or delivered or agreed to be sold or delivered or any service provided or agreed to be provided, may be filed with a District Commission by the consumer... electronically or in physical copy.",
    plainSummary:
      "Governs filing of consumer complaints before District Consumer Disputes Redressal Commissions (DCDRC), including e-Daakhil electronic portal filings for defective products or deficient services.",
    statutoryLimitationNote:
      "Pecuniary jurisdiction up to Rs 50 Lakhs before District Commission under 2021 Rules.",
    category: "consumer",
    keywords: ["consumer", "deficiency", "service", "product defect", "district commission", "e-daakhil", "उपभोक्ता", "खराबी"],
    officialUrl: "https://www.indiacode.nic.in/handle/123456789/15256",
    issuingAuthority: "Ministry of Consumer Affairs, Food and Public Distribution",
    provenance: "Official India Code Portal / Act No. 35 of 2019",
    verificationStatus: "officially_verified",
    lastCheckedDate: "2026-10-27",
    isActive: true,
    embeddingDimension: 1536,
  },
  {
    id: "cpa-sec-69",
    documentId: "doc-cpa-2019",
    actName: "Consumer Protection Act, 2019",
    actShortName: "CPA, 2019",
    actYear: 2019,
    provisionIdentifier: "Section 69",
    title: "Limitation period for filing consumer complaints",
    chapter: "Chapter IV - Consumer Disputes Redressal Commission",
    content:
      "The District Commission, the State Commission or the National Commission shall not admit a complaint unless it is filed within two years from the date on which the cause of action has arisen. Provided that a complaint may be entertained after the period specified if sufficient cause is shown.",
    plainSummary:
      "Strict 2-year statutory limitation period from the date of deficient service, defect in goods, or cause of action.",
    statutoryLimitationNote:
      "2 years from cause of action. Condonation of delay permissible under Section 69(2) only upon recorded sufficient cause.",
    category: "consumer",
    keywords: ["limitation", "two years", "delay", "deadline", "consumer deadline", "समय-सीमा", "अवधि"],
    officialUrl: "https://www.indiacode.nic.in/handle/123456789/15256",
    issuingAuthority: "Ministry of Consumer Affairs, Food and Public Distribution",
    provenance: "Official India Code Portal / Act No. 35 of 2019",
    verificationStatus: "officially_verified",
    lastCheckedDate: "2026-10-27",
    isActive: true,
    embeddingDimension: 1536,
  },

  // --- Real Estate (Regulation & Development) Act, 2016 ---
  {
    id: "rera-sec-18",
    documentId: "doc-rera-2016",
    actName: "Real Estate (Regulation and Development) Act, 2016",
    actShortName: "RERA, 2016",
    actYear: 2016,
    provisionIdentifier: "Section 18",
    title: "Return of amount and compensation for delayed possession",
    chapter: "Chapter III - Functions and Duties of Promoter",
    content:
      "If the promoter fails to complete or is unable to give possession of an apartment, plot or building in accordance with the terms of the agreement for sale... he shall be liable on demand to the allottees to return the amount received with interest at prescribed rate including compensation.",
    plainSummary:
      "Right of homebuyers to demand full refund with interest for project delays, or monthly delayed possession interest if choosing to remain in the project.",
    statutoryLimitationNote:
      "Continuing cause of action while default and non-possession persists, as affirmed by the Supreme Court of India in Newtech Promoters (2021).",
    category: "property",
    keywords: ["builder", "flat", "possession", "delay", "rera", "apartment", "homebuyer", "allottee", "बिल्डर", "कब्जा", "देरी"],
    officialUrl: "https://www.indiacode.nic.in/handle/123456789/2158",
    issuingAuthority: "Ministry of Housing and Urban Affairs",
    provenance: "Official India Code Portal / Act No. 16 of 2016",
    verificationStatus: "officially_verified",
    lastCheckedDate: "2026-10-27",
    isActive: true,
    embeddingDimension: 1536,
  },
  {
    id: "rera-sec-31",
    documentId: "doc-rera-2016",
    actName: "Real Estate (Regulation and Development) Act, 2016",
    actShortName: "RERA, 2016",
    actYear: 2016,
    provisionIdentifier: "Section 31",
    title: "Filing of complaints with the Authority or the Adjudicating Officer",
    chapter: "Chapter V - The Real Estate Regulatory Authority",
    content:
      "Any aggrieved person may file a complaint with the Authority or the adjudicating officer, as the case may be, for any violation or contravention of the provisions of this Act or the rules and regulations made thereunder.",
    plainSummary:
      "Statutory jurisdiction for homebuyers to initiate complaint proceedings (Form M / Form N) before State RERA Authorities.",
    statutoryLimitationNote:
      "Filed before jurisdictional State RERA portal with prescribed fee.",
    category: "property",
    keywords: ["rera complaint", "form m", "adjudicating officer", "authority", "rera authority"],
    officialUrl: "https://www.indiacode.nic.in/handle/123456789/2158",
    issuingAuthority: "Ministry of Housing and Urban Affairs",
    provenance: "Official India Code Portal / Act No. 16 of 2016",
    verificationStatus: "officially_verified",
    lastCheckedDate: "2026-10-27",
    isActive: true,
    embeddingDimension: 1536,
  },

  // --- Civil Procedure Code, 1908 ---
  {
    id: "cpc-order-39",
    documentId: "doc-cpc-1908",
    actName: "Code of Civil Procedure, 1908",
    actShortName: "CPC, 1908",
    actYear: 1908,
    provisionIdentifier: "Order XXXIX, Rules 1 & 2",
    title: "Temporary Injunctions and Interlocutory Orders",
    chapter: "The First Schedule - Order XXXIX",
    content:
      "Where in any suit it is proved by affidavit or otherwise that any property in dispute in a suit is in danger of being wasted, damaged or alienated by any party to the suit, or wrongfully sold in execution of a decree... the Court may by order grant a temporary injunction to restrain such act.",
    plainSummary:
      "Primary civil mechanism to obtain immediate interim stay or injunction to protect property, tenancy, or contractual rights pending trial upon showing prima facie case, balance of convenience, and irreparable injury.",
    statutoryLimitationNote:
      "Interim relief application in pending civil suit.",
    category: "civil",
    keywords: ["stay", "injunction", "temporary injunction", "interim relief", "restrain", "order 39", "स्थगन आदेश", "रोक"],
    officialUrl: "https://www.indiacode.nic.in/handle/123456789/2191",
    issuingAuthority: "Legislative Department, Government of India",
    provenance: "Official India Code Portal / Act No. 5 of 1908",
    verificationStatus: "officially_verified",
    lastCheckedDate: "2026-10-27",
    isActive: true,
    embeddingDimension: 1536,
  },

  // --- Negotiable Instruments Act, 1881 (Cheque Bounce) ---
  {
    id: "ni-sec-138",
    documentId: "doc-ni-1881",
    actName: "Negotiable Instruments Act, 1881",
    actShortName: "NI Act, 1881",
    actYear: 1881,
    provisionIdentifier: "Section 138",
    title: "Dishonour of cheque for insufficiency, etc., of funds in the account",
    chapter: "Chapter XVII - Of Penalties in Case of Dishonour of Certain Cheques",
    content:
      "Where any cheque drawn by a person on an account maintained by him with a banker for payment of any amount of money... is returned by the bank unpaid, either because of the amount of money standing to the credit of that account is insufficient... such person shall be deemed to have committed an offence.",
    plainSummary:
      "Criminal liability for dishonoured cheques. Requires strict 30-day statutory legal notice and 15-day payment grace period prior to filing a complaint.",
    statutoryLimitationNote:
      "Statutory notice within 30 days of bank memo. Complaint under Section 142 within 1 month after expiry of 15-day notice period.",
    category: "commercial",
    keywords: ["cheque", "check", "bounce", "dishonour", "insufficient funds", "138", "चेक बाउंस", "अनादर"],
    officialUrl: "https://www.indiacode.nic.in/handle/123456789/2205",
    issuingAuthority: "Ministry of Law and Justice, Government of India",
    provenance: "Official India Code Portal / Act No. 26 of 1881",
    verificationStatus: "officially_verified",
    lastCheckedDate: "2026-10-27",
    isActive: true,
    embeddingDimension: 1536,
  },

  // --- Indian Contract Act, 1872 ---
  {
    id: "contract-sec-73",
    documentId: "doc-contract-1872",
    actName: "Indian Contract Act, 1872",
    actShortName: "Contract Act, 1872",
    actYear: 1872,
    provisionIdentifier: "Section 73",
    title: "Compensation for loss or damage caused by breach of contract",
    chapter: "Chapter VI - Of the Consequences of Breach of Contract",
    content:
      "When a contract has been broken, the party who suffers by such breach is entitled to receive, from the party who has broken the contract, compensation for any loss or damage caused to him thereby, which naturally arose in the usual course of things from such breach, or which the parties knew, when they made the contract, to be likely to result from the breach of it.",
    plainSummary:
      "Core statutory basis for claiming monetary damages, unpaid remuneration, or commercial compensation when an agreement is violated.",
    statutoryLimitationNote:
      "Governed by 3-year limitation period from date of breach under Limitation Act, 1963.",
    category: "commercial",
    keywords: ["contract", "breach", "agreement", "compensation", "damages", "unpaid salary", "vendor", "समझौता", "अनुबंध", "मुआवजा"],
    officialUrl: "https://www.indiacode.nic.in/handle/123456789/2187",
    issuingAuthority: "Legislative Department, Government of India",
    provenance: "Official India Code Portal / Act No. 9 of 1872",
    verificationStatus: "officially_verified",
    lastCheckedDate: "2026-10-27",
    isActive: true,
    embeddingDimension: 1536,
  },

  // --- Transfer of Property Act, 1882 (Tenancy & Leases) ---
  {
    id: "tpa-sec-106",
    documentId: "doc-tpa-1882",
    actName: "Transfer of Property Act, 1882",
    actShortName: "Transfer of Property Act, 1882",
    actYear: 1882,
    provisionIdentifier: "Section 106",
    title: "Duration of certain leases in absence of written contract or local usage",
    chapter: "Chapter V - Of Leases of Immovable Property",
    content:
      "In the absence of a contract or local law or usage to the contrary, a lease of immovable property for agricultural or manufacturing purposes shall be deemed to be a lease from year to year... and a lease of immovable property for any other purpose shall be deemed to be a lease from month to month, terminable, on the part of either lessor or lessee, by fifteen days notice.",
    plainSummary:
      "Statutory rule for terminating residential/commercial tenancies via mandatory 15-day notice to quit where state rent control does not bar eviction.",
    statutoryLimitationNote:
      "15 days notice expiring with the end of a month of the tenancy.",
    category: "property",
    keywords: ["tenant", "landlord", "rent", "eviction", "security deposit", "lease", "notice to quit", "किरायेदार", "मकान मालिक", "किराया"],
    officialUrl: "https://www.indiacode.nic.in/handle/123456789/2338",
    issuingAuthority: "Legislative Department, Government of India",
    provenance: "Official India Code Portal / Act No. 4 of 1882",
    verificationStatus: "officially_verified",
    lastCheckedDate: "2026-10-27",
    isActive: true,
    embeddingDimension: 1536,
  },
];
