/**
 * NyayLink Fact Extractor
 *
 * Implements structured fact structuring from user input, distinguishing
 * user-asserted facts from AI inferences, preserving relative dates with
 * needsConfirmation: true, avoiding false defaults, and identifying real missing facts.
 */

import { IntakeFacts, FactItem, DateItem, JurisdictionInfo } from "./fact-types";

// Common relative date patterns in English and Hindi
const RELATIVE_DATE_PATTERNS = [
  /\b(today|yesterday|day before yesterday|last night)\b/i,
  /\b(last|past)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|week|month|year)\b/i,
  /\b(\d+)\s+(days?|weeks?|months?|years?)\s+ago\b/i,
  /\b(this\s+morning|last\s+evening|this\s+week)\b/i,
  /\b(कल|आज|परसों|पिछले\s+(हफ़्ते|महीने|साल|सोमवार|मंगलवार|बुधवार|गुरुवार|शुक्रवार|शनिवार|रविवार))\b/i,
];

// Explicit date patterns (DD/MM/YYYY, Month DD, YYYY etc.)
const EXPLICIT_DATE_PATTERNS = [
  /\b\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}\b/,
  /\b\d{4}[-/.]\d{1,2}[-/.]\d{1,2}\b/,
  /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}\b/i,
  /\b\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?),?\s+\d{4}\b/i,
];

// Detect known Indian states mentioned in text
const INDIAN_STATES_LIST = [
  "Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "Uttar Pradesh",
  "West Bengal", "Telangana", "Gujarat", "Kerala", "Rajasthan",
  "Punjab", "Haryana", "Madhya Pradesh", "Bihar", "Odisha", "Andhra Pradesh",
  "Assam", "Goa", "Jharkhand", "Uttarakhand", "Himachal Pradesh"
];

export function extractFactsFromText(
  rawText: string,
  userSelectedState?: string,
  userSelectedTopic?: string,
  userRole?: string,
  desiredOutcome?: string
): IntakeFacts {
  const clean = rawText.trim();

  // 1. Extract dates
  const dates: DateItem[] = [];

  // Check explicit dates
  for (const pat of EXPLICIT_DATE_PATTERNS) {
    const match = clean.match(pat);
    if (match) {
      dates.push({
        id: `date-exp-${dates.length + 1}`,
        originalText: match[0],
        normalizedDate: match[0],
        needsConfirmation: false,
        context: "Explicit calendar date stated by user",
      });
      break;
    }
  }

  // Check relative dates
  for (const pat of RELATIVE_DATE_PATTERNS) {
    const match = clean.match(pat);
    if (match) {
      // Relative dates MUST have needsConfirmation: true
      dates.push({
        id: `date-rel-${dates.length + 1}`,
        originalText: match[0],
        needsConfirmation: true,
        context: "Relative time reference — requires calendar confirmation for limitation verification",
      });
      break;
    }
  }

  // 2. Extract facts from statements
  // Split into real communicative clauses, not just arbitrary punctuation
  const candidateSentences = clean
    .split(/\n+|(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 10);

  const facts: FactItem[] = [];

  if (candidateSentences.length > 0) {
    candidateSentences.forEach((sentence, index) => {
      // Clean leading conversational fluff
      const trimmedStatement = sentence
        .replace(/^(hello|hi|sir|madam|please help me|i want to know|can you tell me),?\s*/i, "")
        .trim();

      if (trimmedStatement.length > 8) {
        facts.push({
          id: `fact-${index + 1}`,
          statement: trimmedStatement,
          sourceText: sentence,
          userConfirmed: false,
          isAiInference: false,
        });
      }
    });
  }

  // If no sentences matched, treat the whole input as single fact
  if (facts.length === 0 && clean.length > 0) {
    facts.push({
      id: "fact-1",
      statement: clean,
      sourceText: clean,
      userConfirmed: false,
      isAiInference: false,
    });
  }

  // 3. Extract Jurisdiction
  let detectedState: string | undefined = undefined;
  if (userSelectedState && userSelectedState !== "All India (General)") {
    detectedState = userSelectedState;
  } else {
    for (const stateName of INDIAN_STATES_LIST) {
      if (new RegExp(`\\b${stateName}\\b`, "i").test(clean)) {
        detectedState = stateName;
        break;
      }
    }
  }

  const jurisdiction: JurisdictionInfo = {
    state: detectedState,
    district: undefined,
    courtOrForum: undefined,
    isUserSpecified: Boolean(userSelectedState && userSelectedState !== "All India (General)"),
  };

  // 4. Practice Area Categorization - NO SILENT CIVIL LITIGATION DEFAULT!
  const possiblePracticeAreas: string[] = [];
  const textLower = clean.toLowerCase();

  if (
    textLower.includes("cheque") ||
    textLower.includes("check") ||
    textLower.includes("bounce") ||
    textLower.includes("138") ||
    textLower.includes("चेक")
  ) {
    possiblePracticeAreas.push("Negotiable Instruments (Cheque Bounce)");
  }

  if (
    textLower.includes("fir") ||
    textLower.includes("police") ||
    textLower.includes("arrest") ||
    textLower.includes("bail") ||
    textLower.includes("bns") ||
    textLower.includes("bnss") ||
    textLower.includes("complaint") ||
    textLower.includes("पुलिस") ||
    textLower.includes("जमानत") ||
    textLower.includes("गिरफ्तारी")
  ) {
    possiblePracticeAreas.push("Criminal Law & Police Procedure");
  }

  if (
    textLower.includes("consumer") ||
    textLower.includes("defective") ||
    textLower.includes("refund") ||
    textLower.includes("warranty") ||
    textLower.includes("e-daakhil") ||
    textLower.includes("उपभोक्ता") ||
    textLower.includes("खराबी")
  ) {
    possiblePracticeAreas.push("Consumer Protection");
  }

  if (
    textLower.includes("rent") ||
    textLower.includes("tenant") ||
    textLower.includes("landlord") ||
    textLower.includes("deposit") ||
    textLower.includes("eviction") ||
    textLower.includes("rera") ||
    textLower.includes("flat") ||
    textLower.includes("builder") ||
    textLower.includes("किराया") ||
    textLower.includes("मकान मालिक")
  ) {
    possiblePracticeAreas.push("Property & Tenancy / Real Estate");
  }

  if (
    textLower.includes("divorce") ||
    textLower.includes("marriage") ||
    textLower.includes("maintenance") ||
    textLower.includes("domestic violence") ||
    textLower.includes("custody") ||
    textLower.includes("तलाक") ||
    textLower.includes("घरेलू हिंसा")
  ) {
    possiblePracticeAreas.push("Family & Matrimonial Law");
  }

  if (
    textLower.includes("salary") ||
    textLower.includes("employer") ||
    textLower.includes("employee") ||
    textLower.includes("job") ||
    textLower.includes("resignation") ||
    textLower.includes("termination") ||
    textLower.includes("वेतन") ||
    textLower.includes("नौकरी")
  ) {
    possiblePracticeAreas.push("Labour & Employment Law");
  }

  if (
    textLower.includes("cyber") ||
    textLower.includes("online scam") ||
    textLower.includes("otp") ||
    textLower.includes("phishing") ||
    textLower.includes("hacked") ||
    textLower.includes("साइबर")
  ) {
    possiblePracticeAreas.push("Cyber Law & Digital Fraud");
  }

  if (
    textLower.includes("accident") ||
    textLower.includes("mact") ||
    textLower.includes("vehicle") ||
    textLower.includes("दुर्घटना")
  ) {
    possiblePracticeAreas.push("Motor Accident Claims (MACT)");
  }

  // If user explicitly picked a topic in guided form, prioritize that
  if (userSelectedTopic && !possiblePracticeAreas.includes(userSelectedTopic)) {
    possiblePracticeAreas.unshift(userSelectedTopic);
  }

  // 5. Legal Issue identification
  let legalIssue: string | undefined = undefined;
  if (possiblePracticeAreas.length > 0) {
    legalIssue = `Legal inquiry concerning ${possiblePracticeAreas[0]}`;
  } else if (clean.length > 0) {
    legalIssue = "General legal inquiry requiring factual classification";
  }

  // 6. Genuine Missing Facts (domain-specific, not generic keyword checks!)
  const missingFacts: string[] = [];

  if (dates.length === 0) {
    missingFacts.push("Exact date or period of incident/transaction (needed to verify limitation deadlines)");
  } else if (dates.some((d) => d.needsConfirmation)) {
    missingFacts.push("Specific calendar date for the relative time reference");
  }

  if (!jurisdiction.state) {
    missingFacts.push("State or district where the transaction or incident occurred (needed for local forum jurisdiction)");
  }

  if (possiblePracticeAreas.includes("Negotiable Instruments (Cheque Bounce)")) {
    missingFacts.push("Date of bank dishonour memo and whether statutory 30-day notice was dispatched");
  } else if (possiblePracticeAreas.includes("Property & Tenancy / Real Estate")) {
    missingFacts.push("Whether there is a signed registered lease or agreement to sell");
  } else if (possiblePracticeAreas.includes("Labour & Employment Law")) {
    missingFacts.push("Whether employment offer letter or appointment letter and salary slips are in possession");
  } else if (possiblePracticeAreas.includes("Consumer Protection")) {
    missingFacts.push("Invoice/receipt and written communication of defect/grievance to seller/service provider");
  }

  // 7. Urgency determination
  let urgency: "normal" | "time_sensitive" | "urgent" | "unknown" = "normal";
  if (
    textLower.includes("threat") ||
    textLower.includes("arrest") ||
    textLower.includes("beaten") ||
    textLower.includes("danger") ||
    textLower.includes("suicide") ||
    textLower.includes("emergency") ||
    textLower.includes("imminent") ||
    textLower.includes("खतरा") ||
    textLower.includes("हमला")
  ) {
    urgency = "urgent";
  } else if (
    textLower.includes("notice received") ||
    textLower.includes("summons") ||
    textLower.includes("hearing tomorrow") ||
    textLower.includes("limitation expiring") ||
    textLower.includes("15 days") ||
    textLower.includes("30 days") ||
    textLower.includes("deadlines")
  ) {
    urgency = "time_sensitive";
  }

  return {
    facts,
    dates,
    jurisdiction,
    legalIssue,
    possiblePracticeAreas,
    missingFacts,
    urgency,
    userRole: (userRole as IntakeFacts["userRole"]) || "other",
    desiredOutcome,
    hasConfirmed: false,
    originalQuery: clean,
  };
}
