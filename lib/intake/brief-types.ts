/**
 * NyayLink - Lawyer-Ready Brief Types & Models
 * Defines data structures for client briefs, structured facts separation,
 * consent-based advocate handoffs, and audit trails.
 */

export interface BriefFact {
  id: string;
  statement: string;
  category: "user_stated" | "ai_inference" | "user_confirmed";
  userConfirmed: boolean;
  isAiInference: boolean;
  sourceText?: string;
}

export interface BriefDate {
  id: string;
  originalText: string;
  confirmedDate?: string;
  needsConfirmation: boolean;
  context?: string;
}

export interface BriefJurisdiction {
  state?: string;
  district?: string;
  forumOrCourt?: string;
}

export interface MentionedDocument {
  id: string;
  name: string;
  status: "mentioned_not_attached";
  context?: string;
}

export interface StatutorySource {
  actName: string;
  section: string;
  title: string;
  summary: string;
  relevanceNote?: string;
  officialSourceUrl?: string;
  actShortName?: string;
  jurisdiction?: string;
  lastCheckedDate?: string;
  verificationStatus?: string;
  provenance?: string;
}

export interface LawyerReadyBrief {
  id?: string;
  title: string;
  createdAt: string;
  locale: "en" | "hi";
  issueSummary: string;
  facts: BriefFact[];
  dates: BriefDate[];
  jurisdiction: BriefJurisdiction;
  documentsMentioned: MentionedDocument[];
  questionsForAdvocate: string[];
  retrievedSources: StatutorySource[];
  disclaimer: {
    en: string;
    hi: string;
  };
  excludedSections?: string[];
  isConfirmed: boolean;
  clientNotes?: string;
}

export interface BriefHandoffPayload {
  briefId?: string;
  lawyerId: string;
  matterId?: string | null;
  briefSnapshot: LawyerReadyBrief;
  consentGiven: boolean;
  clientNotes?: string;
}

export type BriefHandoffStatus = "pending" | "accepted" | "declined" | "revoked";

export interface BriefHandoffRecord {
  id: string;
  client_brief_id: string | null;
  client_id: string;
  lawyer_id: string;
  consultation_request_id: string | null;
  exact_brief_snapshot: LawyerReadyBrief;
  consent_given: boolean;
  consent_timestamp: string;
  status: BriefHandoffStatus;
  revoked_at: string | null;
  revocation_reason: string | null;
  created_at: string;
  updated_at: string;
  lawyer?: {
    id: string;
    professional_name: string;
    city?: string;
    practice_areas?: string[];
  } | null;
  client?: {
    full_name?: string;
    phone?: string;
  } | null;
}

export interface ClientBriefRecord {
  id: string;
  client_id: string;
  matter_id: string | null;
  title: string;
  brief_data: LawyerReadyBrief;
  facts_confirmed: boolean;
  locale: "en" | "hi";
  version: number;
  created_at: string;
  updated_at: string;
  matter?: {
    id: string;
    title: string;
    status: string;
  } | null;
}
