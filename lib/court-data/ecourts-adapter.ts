/**
 * NyayLink Official eCourts & Cause-List Tracking Integration Boundary
 *
 * Implements:
 * 1. 16-character Case National Identifier (CNR) parsing and format validation.
 * 2. Official eCourts Services deep-linking and search portal routing.
 * 3. Strict provenance and truthfulness labeling (never claiming automated
 *    sync or official registry verification without an authorized provider).
 * 4. Extensible IECourtsProvider adapter architecture for future institutional
 *    e-Committee / Court Registry API integrations.
 */

export type CaseProvenanceType =
  | "user_manual_entry"
  | "advocate_manual_entry"
  | "official_ecourts_portal_manual"
  | "authorized_provider";

export type CaseVerificationStatus =
  | "user_entered"
  | "manual_unverified"
  | "pending_verification"
  | "officially_verified"
  | "sync_failed";

export interface TrackedCaseData {
  id?: string;
  matterId?: string | null;
  userId?: string;
  cnrNumber?: string;
  courtComplex: string;
  caseType: string;
  caseNumber: string;
  caseYear: number;
  petitioner?: string;
  respondent?: string;
  nextHearingDate?: string;
  courtHall?: string;
  purposeOfHearing?: string;
  outcomeSummary?: string;
  sourceType: CaseProvenanceType;
  verificationStatus: CaseVerificationStatus;
  lastCheckedAt: string;
}

export const INDIAN_COURT_COMPLEXES = [
  "Supreme Court of India (New Delhi)",
  "Delhi High Court (Sher Shah Road, New Delhi)",
  "Bombay High Court (Principal Bench, Mumbai)",
  "High Court of Karnataka (Bengaluru)",
  "High Court of Judicature at Allahabad",
  "High Court of Judicature at Madras",
  "Calcutta High Court (Principal Bench, Kolkata)",
  "High Court of Gujarat (Ahmedabad)",
  "Patiala House District Courts (New Delhi)",
  "Tis Hazari District Courts (Central Delhi)",
  "Saket District Courts (South Delhi)",
  "Rouse Avenue Court Complex (New Delhi)",
  "City Civil and Sessions Court (Mumbai)",
  "National Consumer Disputes Redressal Commission (NCDRC)",
  "National Company Law Tribunal (NCLT Principal Bench)",
  "State Consumer Disputes Redressal Commission (SCDRC)",
  "Real Estate Regulatory Authority (RERA Authority)",
] as const;

export const STANDARD_CASE_TYPES = [
  "Civil Suit",
  "Criminal Appeal",
  "Writ Petition (Civil)",
  "Writ Petition (Criminal)",
  "Bail Application",
  "Special Leave Petition (SLP)",
  "Arbitration Petition",
  "Company Petition",
  "Consumer Complaint",
  "Execution Petition",
  "Original Suit",
  "Review Petition",
  "RERA Appeal",
  "Negotiable Instruments Section 138",
  "Miscellaneous Application",
] as const;

export interface CNRValidationResult {
  isValid: boolean;
  rawInput: string;
  cleanCNR: string;
  formattedCNR: string;
  stateCode?: string;
  establishmentCode?: string;
  courtNumber?: string;
  caseNumber?: string;
  year?: number;
  error?: string;
  isVerifiedWithRegistry: false;
  provenanceNote: string;
}

/**
 * Strips whitespace, hyphens, spaces, and non-alphanumeric characters, returning standard uppercase.
 */
export function cleanCNR(input: string): string {
  if (!input) return "";
  return input.trim().replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

/**
 * Formats a clean 16-character CNR into canonical human-readable format:
 * E.g. "DLHC01-001234-2024"
 */
export function formatCNR(clean: string): string {
  if (clean.length !== 16) return clean;
  return `${clean.slice(0, 6)}-${clean.slice(6, 12)}-${clean.slice(12, 16)}`;
}

/**
 * Validates a 16-character Case National Identifier (CNR) format.
 * Format breakdown:
 * - Chars 1-2: State 2-letter alphabetic code (e.g., 'DL', 'MH', 'KA', 'UP', 'WB')
 * - Chars 3-4: Court Establishment code (e.g., 'HC' for High Court, 'CC' for City Civil, 'ND' for New Delhi)
 * - Chars 5-6: Court Establishment / Bench number (alphanumeric, e.g., '01', '02')
 * - Chars 7-12: Case registration serial number (6 numeric digits, e.g., '001234')
 * - Chars 13-16: Case filing/registration year (4 numeric digits, e.g., '2024')
 *
 * Tolerant of user input with spaces, hyphens, or mixed case.
 * NOTE: Format validity DOES NOT imply the case exists in the government registry.
 */
export function validateCNRNumber(cnr: string): CNRValidationResult {
  const rawInput = cnr || "";
  const clean = cleanCNR(rawInput);

  if (!clean) {
    return {
      isValid: false,
      rawInput,
      cleanCNR: "",
      formattedCNR: "",
      error: "CNR number is required.",
      isVerifiedWithRegistry: false,
      provenanceNote: "No CNR supplied. Case status must be tracked manually.",
    };
  }

  if (clean.length !== 16) {
    return {
      isValid: false,
      rawInput,
      cleanCNR: clean,
      formattedCNR: clean,
      error: `CNR must be exactly 16 alphanumeric characters. (Received ${clean.length} characters after removing separators)`,
      isVerifiedWithRegistry: false,
      provenanceNote: "Invalid length. The official eCourts portal requires exactly 16 characters.",
    };
  }

  // Check state code (first 2 characters must be letters)
  const stateCode = clean.slice(0, 2);
  if (!/^[A-Z]{2}$/.test(stateCode)) {
    return {
      isValid: false,
      rawInput,
      cleanCNR: clean,
      formattedCNR: clean,
      error: "First 2 characters must be an Indian state code (e.g., DL for Delhi, MH for Maharashtra).",
      isVerifiedWithRegistry: false,
      provenanceNote: "Invalid state code in CNR prefix.",
    };
  }

  // Check court establishment code (characters 3-4)
  const establishmentCode = clean.slice(2, 4);
  if (!/^[A-Z0-9]{2}$/.test(establishmentCode)) {
    return {
      isValid: false,
      rawInput,
      cleanCNR: clean,
      formattedCNR: clean,
      error: "Characters 3-4 must be an alphanumeric establishment code (e.g., HC, CC, DC).",
      isVerifiedWithRegistry: false,
      provenanceNote: "Invalid court establishment code in CNR.",
    };
  }

  // Check court number (characters 5-6)
  const courtNumber = clean.slice(4, 6);
  if (!/^[A-Z0-9]{2}$/.test(courtNumber)) {
    return {
      isValid: false,
      rawInput,
      cleanCNR: clean,
      formattedCNR: clean,
      error: "Characters 5-6 must be a valid court complex establishment code (e.g., 01).",
      isVerifiedWithRegistry: false,
      provenanceNote: "Invalid establishment code in CNR.",
    };
  }

  // Check case serial number (characters 7-12: 6 digits)
  const caseNumber = clean.slice(6, 12);
  if (!/^\d{6}$/.test(caseNumber)) {
    return {
      isValid: false,
      rawInput,
      cleanCNR: clean,
      formattedCNR: clean,
      error: "Characters 7-12 must be a 6-digit numeric case registration number (e.g., 001234).",
      isVerifiedWithRegistry: false,
      provenanceNote: "Case serial number part must be 6 numeric digits.",
    };
  }

  // Check filing year (characters 13-16: 4 digits)
  const yearStr = clean.slice(12, 16);
  const year = parseInt(yearStr, 10);
  const currentYear = new Date().getFullYear();
  if (!/^\d{4}$/.test(yearStr) || year < 1950 || year > currentYear + 1) {
    return {
      isValid: false,
      rawInput,
      cleanCNR: clean,
      formattedCNR: clean,
      error: `Characters 13-16 must be a valid registration year between 1950 and ${currentYear + 1}.`,
      isVerifiedWithRegistry: false,
      provenanceNote: "Invalid registration year in CNR.",
    };
  }

  const formatted = formatCNR(clean);

  return {
    isValid: true,
    rawInput,
    cleanCNR: clean,
    formattedCNR: formatted,
    stateCode,
    establishmentCode,
    courtNumber,
    caseNumber,
    year,
    isVerifiedWithRegistry: false,
    provenanceNote:
      "Format-valid CNR. Note: Live case validity and cause lists must be checked directly on the official eCourts portal.",
  };
}

export interface OfficialPortalLink {
  url: string;
  portalName: string;
  hindiPortalName: string;
  searchType: "district_courts" | "high_court" | "supreme_court";
  disclaimer: string;
  hindiDisclaimer: string;
  requiresCaptcha: true;
  supportsDirectQueryPrefill: false;
}

export const OFFICIAL_ECOURTS_PORTAL_URL = "https://services.ecourts.gov.in/ecourtindia_v6/";
export const OFFICIAL_HIGH_COURT_PORTAL_URL = "https://hcservices.ecourts.gov.in/hcservices/";
export const OFFICIAL_SUPREME_COURT_PORTAL_URL = "https://registry.sci.gov.in/case-status";

/**
 * Returns the official external destination link for a court complex or CNR.
 * Truthfully documents that the official government portal is session-based and
 * requires the user to enter their CAPTCHA on the government server.
 */
export function getOfficialPortalLink(courtComplex?: string, cnr?: string): OfficialPortalLink {
  const isSupremeCourt = courtComplex?.toLowerCase().includes("supreme court");
  const isHighCourt = courtComplex?.toLowerCase().includes("high court") || (cnr && cleanCNR(cnr).slice(2, 4) === "HC");

  if (isSupremeCourt) {
    return {
      url: OFFICIAL_SUPREME_COURT_PORTAL_URL,
      portalName: "Supreme Court of India Case Status Portal",
      hindiPortalName: "भारत का सर्वोच्च न्यायालय केस स्टेटस पोर्टल",
      searchType: "supreme_court",
      disclaimer:
        "You will be redirected to the official Supreme Court of India registry portal. Complete the official verification CAPTCHA to inspect official case dockets and orders.",
      hindiDisclaimer:
        "आपको भारत के सर्वोच्च न्यायालय के आधिकारिक रजिस्ट्री पोर्टल पर भेजा जाएगा। आधिकारिक वाद सूची व आदेश देखने हेतु आधिकारिक कैप्चा दर्ज करें।",
      requiresCaptcha: true,
      supportsDirectQueryPrefill: false,
    };
  }

  if (isHighCourt) {
    return {
      url: OFFICIAL_HIGH_COURT_PORTAL_URL,
      portalName: "High Court Services Portal (eCourts Services)",
      hindiPortalName: "उच्च न्यायालय सेवा पोर्टल (ई-कोर्ट्स सेवाएं)",
      searchType: "high_court",
      disclaimer:
        "You will be redirected to the official High Court eCourts Services portal. Use the CNR Search option, paste your copied CNR, and solve the security CAPTCHA.",
      hindiDisclaimer:
        "आपको आधिकारिक उच्च न्यायालय ई-कोर्ट्स सेवा पोर्टल पर भेजा जाएगा। सीएनआर खोज विकल्प चुनें, कॉपी किया गया सीएनआर पेस्ट करें और सुरक्षा कैप्चा भरें।",
      requiresCaptcha: true,
      supportsDirectQueryPrefill: false,
    };
  }

  return {
    url: OFFICIAL_ECOURTS_PORTAL_URL,
    portalName: "Official eCourts Services Portal (District & Sessions Courts)",
    hindiPortalName: "आधिकारिक ई-कोर्ट्स सेवा पोर्टल (जिला व सत्र न्यायालय)",
    searchType: "district_courts",
    disclaimer:
      "You will be redirected to the official eCourts Services portal (services.ecourts.gov.in). Use the CNR Search tab, paste your copied 16-character CNR, and solve the official CAPTCHA.",
    hindiDisclaimer:
      "आपको आधिकारिक ई-कोर्ट्स सेवा पोर्टल (services.ecourts.gov.in) पर भेजा जाएगा। सीएनआर सर्च टैब चुनें, अपना कॉपी किया हुआ 16-अंकीय सीएनआर पेस्ट करें और कैप्चा भरें।",
    requiresCaptcha: true,
    supportsDirectQueryPrefill: false,
  };
}

/**
 * Backward-compatible helper returning the primary official URL.
 */
export function getOfficialECourtsUrl(cnr?: string): string {
  if (cnr && cleanCNR(cnr)) {
    return OFFICIAL_ECOURTS_PORTAL_URL;
  }
  return OFFICIAL_ECOURTS_PORTAL_URL;
}

/**
 * Returns human-readable provenance and verification badges.
 * Never reports a fake "synced" or "officially verified" status for user manual entries.
 */
export function getProvenanceLabel(
  sourceType: CaseProvenanceType = "user_manual_entry",
  verificationStatus: CaseVerificationStatus = "user_entered",
  isHindi: boolean = false
): {
  badgeText: string;
  description: string;
  badgeStyle: string;
} {
  if (verificationStatus === "officially_verified" && sourceType === "authorized_provider") {
    return {
      badgeText: isHindi ? "आधिकारिक रजिस्ट्री सत्यापित" : "Officially Registry Verified",
      description: isHindi
        ? "यह डेटा प्राधिकृत कोर्ट रजिस्ट्री एपीआई से सीधे सत्यापित है।"
        : "Directly validated via authorized court registry API gateway.",
      badgeStyle: "bg-emerald-50 text-emerald-800 border-emerald-300",
    };
  }

  if (sourceType === "advocate_manual_entry") {
    return {
      badgeText: isHindi ? "अधिवक्ता चैंबर दर्ज (सत्यापन प्रतीक्षित)" : "Advocate Entered (Unverified with Registry)",
      description: isHindi
        ? "यह विवरण अधिवक्ता द्वारा दर्ज किया गया है। आधिकारिक ई-कोर्ट्स पोर्टल से मिलान आवश्यक है।"
        : "Recorded by assigned advocate. Requires manual check against official eCourts portal.",
      badgeStyle: "bg-purple-50 text-purple-800 border-purple-200",
    };
  }

  return {
    badgeText: isHindi ? "उपयोगकर्ता दर्ज (अपुष्ट)" : "User-Entered (Unverified with Registry)",
    description: isHindi
      ? "यह वाद विवरण उपयोगकर्ता द्वारा दर्ज किया गया है। इसे आधिकारिक ई-कोर्ट्स पोर्टल पर खोज कर जांचें।"
      : "Recorded manually by user. Must be verified directly on official eCourts portal.",
    badgeStyle: "bg-amber-50 text-amber-800 border-amber-200",
  };
}

/**
 * IECourtsProvider interface: clean adapter boundary so an authorized institutional connector
 * can be introduced later without changing the user-facing case model.
 */
export interface IECourtsProvider {
  providerId: string;
  providerName: string;
  isAutomatedSyncSupported(): boolean;
  getRequiredCredentials(): string[];
  getProviderStatus(): {
    isConfigured: boolean;
    statusMessage: string;
    hindiStatusMessage: string;
  };
}

/**
 * Manual eCourts Adapter (Active default implementation).
 * Truthfully informs users and advocates of manual lookup requirements and what is needed
 * for automated cause-list synchronisation.
 */
export class ManualECourtsAdapter implements IECourtsProvider {
  providerId = "manual_ecourts_adapter";
  providerName = "NyayLink Manual eCourts Portal Linkage";

  isAutomatedSyncSupported(): boolean {
    return false;
  }

  getRequiredCredentials(): string[] {
    return [
      "e-Committee, Supreme Court of India API License / Institutional MoU",
      "National Informatics Centre (NIC) National Judicial Data Grid (NJDG) Gateway Token",
      "Authorized Court Registry API Webhook Subscription",
    ];
  }

  getProviderStatus() {
    return {
      isConfigured: true,
      statusMessage:
        "Manual official lookup mode active. Automated synchronisation is disabled to strictly respect government portal terms of service, preserve court data integrity, and prevent CAPTCHA bypass.",
      hindiStatusMessage:
        "मैनुअल आधिकारिक खोज मोड सक्रिय है। सरकारी पोर्टल की शर्तों का सम्मान करने, न्यायालय डेटा की अखंडता बनाए रखने और कैप्चा बाईपास से बचने के लिए स्वचालित सिंक्रनाइज़ेशन अक्षम है।",
    };
  }
}

export const defaultECourtsAdapter = new ManualECourtsAdapter();
