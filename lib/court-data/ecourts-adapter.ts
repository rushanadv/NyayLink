/**
 * NyayLink Official eCourts & Cause-List Tracking Integration Boundary
 *
 * Implements CNR format verification and official eCourts service routing.
 * Truthfully labels provenance: does not invent synced court data without
 * an authenticated court registry API connection.
 */

export interface TrackedCaseData {
  id?: string;
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
  sourceType: "ecourts_portal_link" | "user_manual_entry" | "advocate_cause_list";
  verificationStatus: "user_entered" | "officially_verified" | "pending_verification";
  lastCheckedAt: string;
}

export const INDIAN_COURT_COMPLEXES = [
  "Supreme Court of India (New Delhi)",
  "Delhi High Court (Sher Shah Road, New Delhi)",
  "Bombay High Court (Principal Bench, Mumbai)",
  "High Court of Karnataka (Bengaluru)",
  "High Court of Judicature at Allahabad",
  "High Court of Judicature at Madras",
  "Patiala House District Courts (New Delhi)",
  "Tis Hazari District Courts (Central Delhi)",
  "Saket District Courts (South Delhi)",
  "City Civil and Sessions Court (Mumbai)",
  "National Consumer Disputes Redressal Commission (NCDRC)",
  "National Company Law Tribunal (NCLT Principal Bench)",
  "State Consumer Disputes Redressal Commission (SCDRC)",
  "Real Estate Regulatory Authority (RERA Authority)",
];

/**
 * Validates a 16-character Case National Identifier (CNR) format.
 * Format: 4-letter Court Code + 2-letter District/Bench + 6-digit Number + 4-digit Year
 * E.g., 'DLHC010123452024' or with hyphens 'DLHC01-012345-2024'
 */
export function validateCNRNumber(cnr: string): { isValid: boolean; error?: string } {
  if (!cnr) return { isValid: false, error: "CNR number is required." };
  const clean = cnr.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  if (clean.length !== 16) {
    return {
      isValid: false,
      error: `CNR must be exactly 16 alphanumeric characters. (Received ${clean.length} characters)`,
    };
  }

  // First 4 characters must be letters (e.g. DLHC, MHCC)
  if (!/^[A-Z]{4}/.test(clean)) {
    return {
      isValid: false,
      error: "First 4 characters must be court state/high court alphabetic code (e.g., DLHC).",
    };
  }

  return { isValid: true };
}

/**
 * Generates the official eCourts Services URL for a given CNR or case search.
 */
export function getOfficialECourtsUrl(cnr?: string): string {
  if (cnr) {
    const clean = cnr.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    return `https://services.ecourts.gov.in/ecourtindia_v6/?p=casestatus/index&cnr=${encodeURIComponent(clean)}`;
  }
  return "https://services.ecourts.gov.in/ecourtindia_v6/?p=casestatus/index";
}
