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
  category:
    | "criminal"
    | "civil"
    | "consumer"
    | "property"
    | "commercial"
    | "family"
    | "labour"
    | "cyber";
  keyStatutoryText: string;
  plainSummary: string;
  statutoryLimitationNote?: string;
  keywords: string[];
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
    keyStatutoryText:
      "Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.",
    plainSummary:
      "Replaces Section 420 of the erstwhile Indian Penal Code (IPC). Covers fraudulent inducement of money, property, financial deception, or contract execution under false pretences.",
    keywords: ["cheat", "cheating", "fraud", "scam", "deceived", "property", "money stolen", "420", "318", "धोखाधड़ी", "ठगी"],
  },
  {
    id: "bns-sec-316",
    actName: "Bharatiya Nyaya Sanhita, 2023",
    actShortName: "BNS, 2023",
    actYear: 2023,
    section: "Section 316",
    provisionTitle: "Criminal breach of trust",
    jurisdiction: "Union of India (Central)",
    officialSourceUrl: "https://www.indiacode.nic.in/handle/123456789/20062",
    sourcePublisher: "Ministry of Law and Justice, Government of India (Act No. 45 of 2023)",
    lastCheckedDate: "2026-10-27",
    verificationStatus: "officially_verified",
    category: "criminal",
    keyStatutoryText:
      "Whoever, being in any manner entrusted with property, or with any dominion over property, dishonestly misappropriates or converts to his own use that property, or dishonestly uses or disposes of that property in violation of any direction of law prescribing the mode in which such trust is to be discharged, or of any legal contract, express or implied, which he has made touching the discharge of such trust, or wilfully suffers any other person so to do, commits criminal breach of trust.",
    plainSummary:
      "Replaces Section 405/406 of the erstwhile IPC. Applies when entrusted assets, funds, partnership property, or deposits are dishonestly misappropriated.",
    statutoryLimitationNote:
      "Punishable with imprisonment up to 5 years, or fine, or both.",
    keywords: ["breach of trust", "misappropriation", "entrusted property", "funds misappropriated", "405", "406", "316", "अमानत में खयानत"],
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
    keyStatutoryText:
      "Every information relating to the commission of a cognizable offence, if given orally to an officer in charge of a police station, shall be reduced to writing by him or under his direction... Provided that information may also be given electronically (e-FIR) to be signed within three days.",
    plainSummary:
      "Replaces Section 154 of CrPC. Mandates registration of FIR for cognizable offences and explicitly recognizes preliminary electronic intimation (e-FIR).",
    keywords: ["fir", "police", "complaint", "cognizable", "efir", "station", "report", "थाना", "प्राथमिकी", "पुलिस"],
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
    keyStatutoryText:
      "When any person accused of, or suspected of, the commission of any non-bailable offence is arrested or detained without warrant... he may be released on bail by a Court other than the High Court or Court of Session.",
    plainSummary:
      "Corresponds to Section 437 of the CrPC. Details statutory grounds and discretionary considerations for regular bail before Magistrates.",
    keywords: ["bail", "regular bail", "custody", "magistrate", "non-bailable", "जमानत", "रिहाई"],
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
    keyStatutoryText:
      "Where any person has reason to believe that he may be arrested on accusation of having committed a non-bailable offence, he may apply to the High Court or the Court of Session for a direction under this section.",
    plainSummary:
      "Corresponds to Section 438 CrPC. Allows an accused or apprehended individual to seek judicial protection against imminent arrest before Sessions Court or High Court.",
    keywords: ["anticipatory bail", "arrest", "apprehending arrest", "sessions court", "high court", "अग्रिम जमानत", "गिरफ्तारी"],
  },
  {
    id: "bnss-sec-144",
    actName: "Bharatiya Nagarik Suraksha Sanhita, 2023",
    actShortName: "BNSS, 2023",
    actYear: 2023,
    section: "Section 144",
    provisionTitle: "Order for maintenance of wives, children and parents",
    jurisdiction: "Union of India (Central)",
    officialSourceUrl: "https://www.indiacode.nic.in/handle/123456789/20063",
    sourcePublisher: "Ministry of Law and Justice, Government of India",
    lastCheckedDate: "2026-10-27",
    verificationStatus: "officially_verified",
    category: "family",
    keyStatutoryText:
      "If any person having sufficient means neglects or refuses to maintain his wife, unable to maintain herself, or his legitimate or illegitimate minor child... a Magistrate of the first class may, upon proof of such neglect or refusal, order such person to make a monthly allowance for the maintenance of his wife or child or parent.",
    plainSummary:
      "Corresponds to Section 125 of CrPC. Statutory secular maintenance remedy providing monthly maintenance and interim support.",
    statutoryLimitationNote:
      "Summary statutory proceeding before Family Court or Judicial Magistrate.",
    keywords: ["maintenance", "wife maintenance", "child support", "parents maintenance", "125", "144", "भरण-पोषण", "खर्चा"],
  },

  // --- Bharatiya Sakshya Adhiniyam, 2023 (BSA) ---
  {
    id: "bsa-sec-61",
    actName: "Bharatiya Sakshya Adhiniyam, 2023",
    actShortName: "BSA, 2023",
    actYear: 2023,
    section: "Section 61",
    provisionTitle: "Admissibility of electronic records",
    jurisdiction: "Union of India (Central)",
    officialSourceUrl: "https://www.indiacode.nic.in/handle/123456789/20064",
    sourcePublisher: "Ministry of Law and Justice, Legislative Department",
    lastCheckedDate: "2026-10-27",
    verificationStatus: "officially_verified",
    category: "civil",
    keyStatutoryText:
      "Nothing in this Adhiniyam shall apply to deny the admissibility of an electronic record in evidence on the ground that it is an electronic record, and such record shall have the same legal effect, validity and enforceability as other document, subject to section 63.",
    plainSummary:
      "Replaces Section 65A/65B of the erstwhile Indian Evidence Act, 1872. Affirms primary legal validity and admissibility of emails, WhatsApp records, SMS, and digital logs in judicial proceedings.",
    statutoryLimitationNote:
      "Governed by certificate requirements under BSA Section 63.",
    keywords: ["electronic evidence", "whatsapp evidence", "email proof", "digital record", "certificate", "65b", "61", "इलेक्ट्रॉनिक साक्ष्य"],
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
    keyStatutoryText:
      "A complaint, in relation to any goods sold or delivered or agreed to be sold or delivered or any service provided or agreed to be provided, may be filed with a District Commission by the consumer... electronically or in physical copy.",
    plainSummary:
      "Governs filing of consumer complaints before District Consumer Disputes Redressal Commissions (DCDRC), including e-Daakhil electronic portal filings for defective products or deficient services.",
    keywords: ["consumer", "deficiency", "service", "product defect", "district commission", "e-daakhil", "उपभोक्ता", "खराबी"],
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
    keyStatutoryText:
      "The District Commission, the State Commission or the National Commission shall not admit a complaint unless it is filed within two years from the date on which the cause of action has arisen. Provided that a complaint may be entertained after the period specified if sufficient cause is shown.",
    plainSummary:
      "Strict 2-year statutory limitation period from the date of deficient service, defect in goods, or cause of action.",
    statutoryLimitationNote:
      "2 years from cause of action. Condonation of delay permissible under Section 69(2) only upon recorded sufficient cause.",
    keywords: ["limitation", "two years", "delay", "deadline", "consumer deadline", "समय-सीमा", "अवधि"],
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
    keyStatutoryText:
      "If the promoter fails to complete or is unable to give possession of an apartment, plot or building in accordance with the terms of the agreement for sale... he shall be liable on demand to the allottees to return the amount received with interest at prescribed rate including compensation.",
    plainSummary:
      "Right of homebuyers to demand full refund with interest for project delays, or monthly delayed possession interest if choosing to remain in the project.",
    statutoryLimitationNote:
      "Continuing cause of action while default and non-possession persists, as affirmed by the Supreme Court of India in Newtech Promoters (2021).",
    keywords: ["builder", "flat", "possession", "delay", "rera", "apartment", "homebuyer", "allottee", "बिल्डर", "कब्जा", "देरी"],
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
    keyStatutoryText:
      "Any aggrieved person may file a complaint with the Authority or the adjudicating officer, as the case may be, for any violation or contravention of the provisions of this Act or the rules and regulations made thereunder.",
    plainSummary:
      "Statutory jurisdiction for homebuyers to initiate complaint proceedings (Form M) before State RERA Authorities.",
    keywords: ["rera complaint", "form m", "adjudicating officer", "authority", "rera authority"],
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
    keyStatutoryText:
      "Where in any suit it is proved by affidavit or otherwise that any property in dispute in a suit is in danger of being wasted, damaged or alienated by any party to the suit... the Court may by order grant a temporary injunction to restrain such act.",
    plainSummary:
      "Primary civil mechanism to obtain immediate interim stay or injunction to protect property, tenancy, or contractual rights pending trial upon showing prima facie case, balance of convenience, and irreparable injury.",
    keywords: ["stay", "injunction", "temporary injunction", "interim relief", "restrain", "order 39", "स्थगन आदेश", "रोक"],
  },

  // --- Negotiable Instruments Act, 1881 (Cheque Bounce) ---
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
    keyStatutoryText:
      "Where any cheque drawn by a person on an account maintained by him with a banker for payment of any amount of money... is returned by the bank unpaid, either because of the amount of money standing to the credit of that account is insufficient... such person shall be deemed to have committed an offence.",
    plainSummary:
      "Criminal liability for dishonoured cheques. Requires strict 30-day statutory legal notice and 15-day payment grace period prior to filing a complaint.",
    statutoryLimitationNote:
      "Statutory notice within 30 days of bank memo. Complaint under Section 142 within 1 month after expiry of 15-day notice period.",
    keywords: ["cheque", "check", "bounce", "dishonour", "insufficient funds", "138", "चेक बाउंस", "अनादर"],
  },

  // --- Indian Contract Act, 1872 ---
  {
    id: "contract-sec-73",
    actName: "Indian Contract Act, 1872",
    actShortName: "Contract Act, 1872",
    actYear: 1872,
    section: "Section 73",
    provisionTitle: "Compensation for loss or damage caused by breach of contract",
    jurisdiction: "Union of India (Central)",
    officialSourceUrl: "https://www.indiacode.nic.in/handle/123456789/2187",
    sourcePublisher: "Legislative Department, Government of India (Act No. 9 of 1872)",
    lastCheckedDate: "2026-07-01",
    verificationStatus: "officially_verified",
    category: "commercial",
    keyStatutoryText:
      "When a contract has been broken, the party who suffers by such breach is entitled to receive, from the party who has broken the contract, compensation for any loss or damage caused to him thereby, which naturally arose in the usual course of things from such breach, or which the parties knew, when they made the contract, to be likely to result from the breach of it.",
    plainSummary:
      "Core statutory basis for claiming monetary damages, unpaid remuneration, or commercial compensation when an agreement is violated.",
    keywords: ["contract", "breach", "agreement", "compensation", "damages", "unpaid salary", "vendor", "समझौता", "अनुबंध", "मुआवजा"],
  },

  // --- Specific Relief Act, 1963 ---
  {
    id: "sra-sec-10",
    actName: "Specific Relief Act, 1963",
    actShortName: "Specific Relief Act, 1963",
    actYear: 1963,
    section: "Section 10",
    provisionTitle: "Specific performance in respect of contracts",
    jurisdiction: "Union of India (Central)",
    officialSourceUrl: "https://www.indiacode.nic.in/handle/123456789/1577",
    sourcePublisher: "Legislative Department, Government of India (Act No. 47 of 1963)",
    lastCheckedDate: "2026-07-01",
    verificationStatus: "officially_verified",
    category: "civil",
    keyStatutoryText:
      "The specific performance of a contract shall be enforced by the court subject to the provisions contained in sub-section (2) of section 11, section 14 and section 16.",
    plainSummary:
      "Mandates civil courts to enforce specific performance of contracts (post-2018 amendment), directing the defaulting party to perform the promised obligation (e.g. executing property sale deed).",
    keywords: ["specific performance", "sale agreement", "enforce contract", "property deed", "विशिष्ट अनुतोष"],
  },

  // --- Transfer of Property Act, 1882 (Tenancy & Leases) ---
  {
    id: "tpa-sec-106",
    actName: "Transfer of Property Act, 1882",
    actShortName: "Transfer of Property Act, 1882",
    actYear: 1882,
    section: "Section 106",
    provisionTitle: "Duration of certain leases in absence of written contract or local usage",
    jurisdiction: "Union of India (Central)",
    officialSourceUrl: "https://www.indiacode.nic.in/handle/123456789/2338",
    sourcePublisher: "Legislative Department, Government of India (Act No. 4 of 1882)",
    lastCheckedDate: "2026-07-01",
    verificationStatus: "officially_verified",
    category: "property",
    keyStatutoryText:
      "In the absence of a contract or local law or usage to the contrary, a lease of immovable property for agricultural or manufacturing purposes shall be deemed to be a lease from year to year... and a lease of immovable property for any other purpose shall be deemed to be a lease from month to month, terminable, on the part of either lessor or lessee, by fifteen days' notice.",
    plainSummary:
      "Statutory rule for terminating residential/commercial tenancies via mandatory 15-day notice to quit where state rent control does not bar eviction.",
    keywords: ["tenant", "landlord", "rent", "eviction", "security deposit", "lease", "notice to quit", "किरायेदार", "मकान मालिक", "किराया"],
  },

  // --- Hindu Marriage Act, 1955 ---
  {
    id: "hma-sec-13b",
    actName: "Hindu Marriage Act, 1955",
    actShortName: "Hindu Marriage Act, 1955",
    actYear: 1955,
    section: "Section 13B",
    provisionTitle: "Divorce by mutual consent",
    jurisdiction: "Union of India (Central)",
    officialSourceUrl: "https://www.indiacode.nic.in/handle/123456789/1565",
    sourcePublisher: "Legislative Department, Government of India (Act No. 25 of 1955)",
    lastCheckedDate: "2026-07-01",
    verificationStatus: "officially_verified",
    category: "family",
    keyStatutoryText:
      "Subject to the provisions of this Act a petition for dissolution of marriage by a decree of divorce may be presented to the district court by both the parties to a marriage together... on the ground that they have been living separately for a period of one year or more, that they have not been able to live together and that they have mutually agreed that the marriage should be dissolved.",
    plainSummary:
      "Allows spouses to obtain divorce amicably by mutual consent after 1 year of separation, subject to statutory 6-month cooling off (which may be waived by court under Supreme Court guidelines).",
    keywords: ["divorce", "mutual consent", "marriage", "separation", "maintenance", "तलाक", "विवाह", "पारस्परिक सहमति"],
  },

  // --- Protection of Women from Domestic Violence Act, 2005 ---
  {
    id: "dv-sec-12",
    actName: "Protection of Women from Domestic Violence Act, 2005",
    actShortName: "DV Act, 2005",
    actYear: 2005,
    section: "Section 12",
    provisionTitle: "Application to Magistrate for relief and protection orders",
    jurisdiction: "Union of India (Central)",
    officialSourceUrl: "https://www.indiacode.nic.in/handle/123456789/2021",
    sourcePublisher: "Ministry of Women and Child Development (Act No. 43 of 2005)",
    lastCheckedDate: "2026-07-01",
    verificationStatus: "officially_verified",
    category: "family",
    keyStatutoryText:
      "An aggrieved person or a Protection Officer or any other person on behalf of the aggrieved person may present an application to the Magistrate seeking one or more reliefs under this Act, including protection orders, residence orders, monetary relief, and custody orders.",
    plainSummary:
      "Empowers women subjected to domestic abuse to seek emergency protection orders, right to reside in shared household, interim monetary maintenance, and custody orders before a Magistrate.",
    keywords: ["domestic violence", "dv act", "protection order", "maintenance", "abuse", "cruelty", "घरेलू हिंसा", "सुरक्षा आदेश"],
  },

  // --- Information Technology Act, 2000 ---
  {
    id: "it-sec-66d",
    actName: "Information Technology Act, 2000",
    actShortName: "IT Act, 2000",
    actYear: 2000,
    section: "Section 66D",
    provisionTitle: "Punishment for cheating by personation by using computer resource",
    jurisdiction: "Union of India (Central)",
    officialSourceUrl: "https://www.indiacode.nic.in/handle/123456789/1999",
    sourcePublisher: "Ministry of Electronics and Information Technology (Act No. 21 of 2000)",
    lastCheckedDate: "2026-07-01",
    verificationStatus: "officially_verified",
    category: "cyber",
    keyStatutoryText:
      "Whoever, by means of any communication device or computer resource, cheats by personating, shall be punished with imprisonment of either description for a term which may extend to three years and shall also be liable to fine which may extend to one lakh rupees.",
    plainSummary:
      "Key cybercrime provision targeting online phishing, fake profile impersonation, digital payment fraud, and cyber financial scams.",
    keywords: ["cyber", "online fraud", "phishing", "fake account", "hacked", "cybercrime", "साइबर अपराध", "ऑनलाइन ठगी"],
  },

  // --- Motor Vehicles Act, 1988 ---
  {
    id: "mva-sec-166",
    actName: "Motor Vehicles Act, 1988",
    actShortName: "Motor Vehicles Act, 1988",
    actYear: 1988,
    section: "Section 166",
    provisionTitle: "Application for compensation in motor accident claims",
    jurisdiction: "Union of India (Central)",
    officialSourceUrl: "https://www.indiacode.nic.in/handle/123456789/1798",
    sourcePublisher: "Ministry of Road Transport and Highways (Act No. 59 of 1988)",
    lastCheckedDate: "2026-07-01",
    verificationStatus: "officially_verified",
    category: "civil",
    keyStatutoryText:
      "An application for compensation arising out of an accident of the nature specified in sub-section (1) of section 165 may be made by the person who has sustained the injury, or by the owner of the property, or by all or any of the legal representatives of the deceased... Provided that no application for compensation shall be entertained unless it is made within six months of the occurrence of the accident.",
    plainSummary:
      "Statutory mechanism for road accident victims or family members to claim monetary compensation before the Motor Accidents Claims Tribunal (MACT).",
    statutoryLimitationNote:
      "Strict 6-month statutory limitation period from date of accident under the 2019 amendment.",
    keywords: ["accident", "motor accident", "mact", "vehicle injury", "claim compensation", "दुर्घटना", "सड़क दुर्घटना"],
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
      ref.keyStatutoryText.toLowerCase().includes(q) ||
      ref.keywords.some((k) => q.includes(k.toLowerCase()) || k.toLowerCase().includes(q))
    );
  });
}

/**
 * Retrieves the most relevant approved legal sources for a given legal inquiry and facts.
 * Performs weighted keyword matching across act titles, sections, provision text, and domain keywords.
 */
export function retrieveRelevantLegalSources(
  query: string,
  factsContext?: {
    legalIssue?: string;
    possiblePracticeAreas?: string[];
    userRole?: string;
  },
  limit: number = 3
): StatutoryReference[] {
  const queryLower = query.toLowerCase();
  const issueLower = (factsContext?.legalIssue || "").toLowerCase();
  const practiceAreas = (factsContext?.possiblePracticeAreas || []).map((p) => p.toLowerCase());

  const scored = CANONICAL_LEGAL_REFERENCES.map((ref) => {
    let score = 0;

    // Direct section or act short name mention in query (highest weight)
    const sectionNum = ref.section.replace(/\D/g, "");
    if (sectionNum && (queryLower.includes(ref.section.toLowerCase()) || queryLower.includes(sectionNum))) {
      score += 15;
    }
    if (queryLower.includes(ref.actShortName.toLowerCase()) || queryLower.includes(ref.actName.toLowerCase())) {
      score += 12;
    }

    // Category match
    if (practiceAreas.some((p) => p.includes(ref.category))) {
      score += 8;
    }

    // Keywords match
    for (const kw of ref.keywords) {
      const kwLower = kw.toLowerCase();
      if (queryLower.includes(kwLower)) {
        score += 5;
      }
      if (issueLower.includes(kwLower)) {
        score += 4;
      }
    }

    // Provision title / summary words
    const titleWords = ref.provisionTitle.toLowerCase().split(/\s+/);
    for (const word of titleWords) {
      if (word.length > 3 && queryLower.includes(word)) {
        score += 2;
      }
    }

    return { ref, score };
  });

  const matches = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.ref);

  return matches.slice(0, limit);
}

/**
 * Validates citations in generated text against our canonical source registry.
 * Returns only verified citations that exist in the registry.
 */
export function validateCitationsAgainstRegistry(
  text: string,
  retrievedSources: StatutoryReference[]
): StatutoryReference[] {
  const textLower = text.toLowerCase();
  return retrievedSources.filter((source) => {
    const actMentioned =
      textLower.includes(source.actShortName.toLowerCase()) ||
      textLower.includes(source.actName.toLowerCase());
    const sectionMentioned = textLower.includes(source.section.toLowerCase());
    return actMentioned || sectionMentioned;
  });
}

// Re-export hybrid retrieval engine for async / pgvector retrieval pipelines
export {
  retrieveLegalSourcesHybrid,
  validateCitations,
  detectLanguage,
  provisionToReference,
} from "./retrieval";
export type { HybridRetrievalResult, RetrievalOptions, RetrievalFactsContext } from "./retrieval";
export {
  CANONICAL_DOCUMENTS,
  CANONICAL_PROVISIONS,
} from "./canonical-registry";
export type { LegalSourceDocument, LegalSourceProvision } from "./canonical-registry";
