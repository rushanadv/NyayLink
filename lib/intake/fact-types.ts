/**
 * NyayLink Structured Fact Extraction & Preconsultation Types
 *
 * Defines strictly typed structures for user-provided facts, AI inferences,
 * unconfirmed relative dates, jurisdiction, and verification states.
 */

export type IntakeIntent =
  | "understand_position"
  | "prepare_consultation"
  | "urgent_help";

export interface FactItem {
  id: string;
  statement: string;
  sourceText: string;
  userConfirmed: boolean;
  isAiInference?: boolean;
}

export interface DateItem {
  id: string;
  originalText: string;
  normalizedDate?: string;
  needsConfirmation: boolean;
  confirmedDate?: string;
  context?: string;
}

export interface JurisdictionInfo {
  state?: string;
  district?: string;
  courtOrForum?: string;
  isUserSpecified: boolean;
}

export interface IntakeFacts {
  facts: FactItem[];
  dates: DateItem[];
  jurisdiction: JurisdictionInfo;
  legalIssue?: string;
  possiblePracticeAreas: string[];
  missingFacts: string[];
  urgency: "normal" | "time_sensitive" | "urgent" | "unknown";
  userRole?: "aggrieved" | "accused" | "tenant_or_buyer" | "employee_or_consumer" | "other";
  desiredOutcome?: string;
  hasConfirmed: boolean;
  confirmedAt?: string;
  originalQuery: string;
  consultationQuestions?: string[];
}

export interface GuidedFormData {
  intent: IntakeIntent;
  legalTopic: string;
  state: string;
  district: string;
  dateOfIncident: string;
  userRole: string;
  desiredOutcome: string;
  description: string;
  specificQuestions?: string;
}

export interface VerifiedSourceRecord {
  id: string;
  actName: string;
  actShortName: string;
  actYear: number;
  section: string;
  provisionTitle: string;
  jurisdiction: string;
  officialSourceUrl: string;
  sourcePublisher: string;
  lastCheckedDate: string;
  verificationStatus: "officially_verified" | "pending_gazette_update";
  category: "criminal" | "civil" | "consumer" | "property" | "commercial" | "family" | "labour" | "cyber";
  keyStatutoryText: string;
  plainSummary: string;
  statutoryLimitationNote?: string;
  isDirectMatch?: boolean;
}
