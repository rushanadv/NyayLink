/**
 * NyayLink - Lawyer-Ready Brief Builder
 * Synthesizes structured data from AI preconsultation, maintaining strict separation
 * between user-confirmed facts, AI inferences, ambiguous dates, and unattached documents.
 */

import { IntakeFacts } from "@/lib/intake/fact-types";
import {
  LawyerReadyBrief,
  BriefFact,
  BriefDate,
  MentionedDocument,
  StatutorySource,
} from "@/lib/intake/brief-types";
import {
  retrieveRelevantLegalSources,
  StatutoryReference,
} from "@/lib/legal/references";

export const MANDATORY_BRIEF_DISCLAIMER = {
  en: "This brief was prepared using NyayLink AI Preconsultation for discussion with an advocate. It does not constitute formal legal advice or create an advocate-client relationship. All facts and legal questions should be independently verified by the reviewing advocate.",
  hi: "यह विधिक सारांश अधिवक्ता से परामर्श हेतु न्यायलिंक एआई पूर्व-परामर्श द्वारा तैयार किया गया है। यह औपचारिक विधिक सलाह नहीं है और न ही इससे अधिवक्ता-मुवक्किल संबंध बनता है। सभी तथ्यों और कानूनी प्रश्नों का स्वतंत्र सत्यापन अधिवक्ता द्वारा किया जाना चाहिए।",
};

/**
 * Extracts documents mentioned in user query or answer narrative without auto-attaching files.
 */
export function extractMentionedDocuments(text: string): MentionedDocument[] {
  if (!text) return [];

  const patterns: Array<{ regex: RegExp; nameEn: string; nameHi?: string }> = [
    {
      regex: /\b(cheque|check|bounced cheque|return memo)\b/gi,
      nameEn: "Cheque / Bank Return Memo",
    },
    {
      regex: /\b(legal notice|demand notice|show cause notice|notice)\b/gi,
      nameEn: "Legal / Statutory Notice",
    },
    {
      regex: /\b(rent agreement|tenancy agreement|lease deed|lease)\b/gi,
      nameEn: "Rent / Lease Agreement",
    },
    {
      regex: /\b(employment contract|appointment letter|offer letter|job agreement)\b/gi,
      nameEn: "Employment Contract / Appointment Letter",
    },
    {
      regex: /\b(salary slip|pay slip|bank statement|passbook)\b/gi,
      nameEn: "Salary Slip / Bank Statement",
    },
    {
      regex: /\b(termination letter|relieving letter|resignation)\b/gi,
      nameEn: "Termination / Relieving Letter",
    },
    {
      regex: /\b(fir|police complaint|gd entry|complaint copy)\b/gi,
      nameEn: "Police Complaint / First Information Report (FIR)",
    },
    {
      regex: /\b(sale deed|conveyance deed|property registry|mutation|allotment letter)\b/gi,
      nameEn: "Sale Deed / Title & Registry Documents",
    },
    {
      regex: /\b(invoice|bill|receipt|warranty card|tax invoice)\b/gi,
      nameEn: "Purchase Invoice / Payment Receipt",
    },
    {
      regex: /\b(whatsapp|email|chat|message|call recording)\b/gi,
      nameEn: "Written Communications (Email / WhatsApp / Chat Records)",
    },
    {
      regex: /\b(partnership deed|moa|aoa|board resolution)\b/gi,
      nameEn: "Company / Commercial Constitution Records",
    },
    {
      regex: /(नोटिस|लीगल नोटिस)/gi,
      nameEn: "Legal Notice (नोटिस)",
    },
    {
      regex: /(किरायानामा|अनुबंध|समझौता)/gi,
      nameEn: "Rent / Tenancy Agreement (किरायानामा)",
    },
    {
      regex: /(एफआईआर|शिकायत पत्र)/gi,
      nameEn: "Police Complaint / FIR (एफआईआर)",
    },
    {
      regex: /(सैलरी स्लिप|वेतन पर्ची|बैंक स्टेटमेंट)/gi,
      nameEn: "Salary Slip / Bank Statement (वेतन पर्ची)",
    },
  ];

  const found: MentionedDocument[] = [];
  const seen = new Set<string>();

  for (const { regex, nameEn } of patterns) {
    if (regex.test(text)) {
      if (!seen.has(nameEn)) {
        seen.add(nameEn);
        found.push({
          id: `doc-${found.length + 1}`,
          name: nameEn,
          status: "mentioned_not_attached",
          context: "Mentioned in narrative — not yet attached",
        });
      }
    }
  }

  return found;
}

/**
 * Generates tailored, strategic questions for the advocate based on inquiry and facts.
 */
export function generateAdvocateQuestions(
  facts: IntakeFacts,
  locale: "en" | "hi" = "en"
): string[] {
  const isHi = locale === "hi";

  const defaultQuestionsEn = [
    "What immediate statutory remedies or preliminary notices should be issued to preserve my rights?",
    "Is there an applicable statutory limitation period or time bar for filing this claim?",
    "What specific primary evidentiary documents should I assemble before commencing formal proceedings?",
    "Which judicial forum or court holds territorial and subject-matter jurisdiction in this matter?",
    "Is interim injunctive relief or status quo feasible while the proceedings remain pending?",
  ];

  const defaultQuestionsHi = [
    "मेरे अधिकारों की रक्षा के लिए तत्काल क्या विधिक उपाय या नोटिस भेजा जाना चाहिए?",
    "क्या इस मामले में दावा दायर करने के लिए कोई परिसीमा अवधि (Limitation Period) लागू होती है?",
    "औपचारिक कार्यवाही शुरू करने से पहले मुझे कौन से मुख्य दस्तावेज़ और साक्ष्य जुटाने चाहिए?",
    "इस मामले में किस अदालत या न्यायिक फोरम का क्षेत्राधिकार बनता है?",
    "क्या विवाद लंबित रहने के दौरान अंतरिम राहत (Interim Relief) या यथास्थिति आदेश प्राप्त किया जा सकता है?",
  ];

  // If facts already has custom questions from intake, return them
  if (facts.consultationQuestions && facts.consultationQuestions.length > 0) {
    return facts.consultationQuestions.slice(0, 5);
  }

  // Topic-specific additions
  const topic = (facts.legalIssue || facts.originalQuery || "").toLowerCase();
  const customList: string[] = [];

  if (topic.includes("cheque") || topic.includes("138") || topic.includes("चेक")) {
    customList.push(
      isHi
        ? "क्या 15 दिन की कानूनी नोटिस अवधि समाप्त हो चुकी है और धारा 138 के तहत परिवाद का समय शेष है?"
        : "Has the mandatory 15-day statutory notice period lapsed, and is the complaint within the 30-day filing window?"
    );
  } else if (topic.includes("rent") || topic.includes("tenant") || topic.includes("eviction") || topic.includes("किराया")) {
    customList.push(
      isHi
        ? "क्या राज्य किराया नियंत्रण अधिनियम (Rent Control Act) या टीपीए (TPA) के तहत बेदखली नोटिस अनिवार्य है?"
        : "Does the state Rent Control legislation or Transfer of Property Act mandate a formal eviction notice prior to suit?"
    );
  } else if (topic.includes("salary") || topic.includes("employer") || topic.includes("termination") || topic.includes("कंपनी")) {
    customList.push(
      isHi
        ? "क्या श्रम न्यायालय (Labour Court) या औद्योगिक न्यायाधिकरण में जाने से पहले सुलह कार्यवाही (Conciliation) आवश्यक है?"
        : "Is pre-litigation conciliation before the Labour Commissioner required before approaching court?"
    );
  } else if (topic.includes("consumer") || topic.includes("refund") || topic.includes("defective") || topic.includes("उपभोक्ता")) {
    customList.push(
      isHi
        ? "क्या उपभोक्ता आयोग (DCDRC) में शिकायत ई-दाखिल पोर्टल द्वारा ऑनलाइन दर्ज की जा सकती है?"
        : "Can this consumer complaint be filed via the e-Daakhil portal with pecuniary jurisdiction confirmed?"
    );
  }

  const basePool = isHi ? defaultQuestionsHi : defaultQuestionsEn;
  const merged = [...customList, ...basePool];
  return merged.slice(0, 5);
}

/**
 * Synthesizes a clean, neutral legal issue summary from the inquiry and response text.
 */
export function synthesizeIssueSummary(
  inquiryText: string,
  answerText: string = "",
  facts: IntakeFacts
): string {
  if (facts.legalIssue && facts.legalIssue.trim().length > 15) {
    return facts.legalIssue.trim();
  }

  // Clean conversational filler and markdown from answer text
  const cleanAnswer = answerText
    .replace(/^#+\s+/gm, "")
    .replace(/\*\*|__/g, "")
    .replace(/^(hello|hi|dear|greetings).*?\n+/i, "")
    .replace(/based on the facts provided,?\s*/i, "")
    .trim();

  const firstParagraph = cleanAnswer.split(/\n\n+/)[0] || "";
  if (firstParagraph.length >= 25 && firstParagraph.length <= 400) {
    return firstParagraph;
  }

  // Fallback to inquiry text
  const cleanInquiry = inquiryText
    .replace(/^i want to ask:?\s*/i, "")
    .replace(/^my question is:?\s*/i, "")
    .trim();

  return cleanInquiry.slice(0, 300) + (cleanInquiry.length > 300 ? "..." : "");
}

export interface BuildBriefParams {
  inquiryText: string;
  answerText?: string;
  facts: IntakeFacts;
  jurisdiction?: string;
  locale?: "en" | "hi";
  customTitle?: string;
  sources?: StatutoryReference[];
}

/**
 * Builds a structured, lawyer-ready brief adhering to all legal handoff requirements.
 */
export function buildLawyerReadyBrief({
  inquiryText,
  answerText = "",
  facts,
  jurisdiction,
  locale = "en",
  customTitle,
  sources,
}: BuildBriefParams): LawyerReadyBrief {
  const isHi = locale === "hi";

  // 1. Title
  const primaryTopic = facts.possiblePracticeAreas[0] || "Legal Matter";
  const defaultTitle = isHi
    ? `${primaryTopic} — विधिक पूर्व-परामर्श सारांश`
    : `${primaryTopic} — Legal Preconsultation Brief`;
  const title = customTitle || defaultTitle;

  // 2. Issue Summary
  const issueSummary = synthesizeIssueSummary(inquiryText, answerText, facts);

  // 3. Separated Facts
  const separatedFacts: BriefFact[] = (facts.facts || []).map((f) => {
    const isAi = Boolean(f.isAiInference);
    const isConfirmed = Boolean(f.userConfirmed);

    let category: "user_stated" | "ai_inference" | "user_confirmed" = "user_stated";
    if (isAi) {
      category = "ai_inference";
    } else if (isConfirmed) {
      category = "user_confirmed";
    }

    return {
      id: f.id,
      statement: f.statement,
      category,
      userConfirmed: isConfirmed,
      isAiInference: isAi,
      sourceText: f.sourceText,
    };
  });

  // 4. Timeline / Dates
  const timelineDates: BriefDate[] = (facts.dates || []).map((d) => ({
    id: d.id,
    originalText: d.originalText,
    confirmedDate: d.confirmedDate,
    needsConfirmation: !d.confirmedDate,
    context: d.context,
  }));

  // 5. Jurisdiction
  const briefJurisdiction = {
    state: facts.jurisdiction?.state || (jurisdiction ? jurisdiction.split(",")[0]?.trim() : undefined),
    district: facts.jurisdiction?.district || (jurisdiction?.includes(",") ? jurisdiction.split(",")[1]?.trim() : undefined),
    forumOrCourt: facts.jurisdiction?.courtOrForum || "Jurisdictional Court / Forum",
  };

  // 6. Documents Mentioned (not attached)
  const combinedText = `${inquiryText} ${answerText}`;
  const documentsMentioned = extractMentionedDocuments(combinedText);

  // 7. Questions for Advocate
  const questionsForAdvocate = generateAdvocateQuestions(facts, locale);

  // 8. Retrieved Statutory Sources
  const rawSources: StatutoryReference[] =
    sources && sources.length > 0
      ? sources
      : retrieveRelevantLegalSources(
          `${inquiryText} ${facts.legalIssue || ""}`,
          {
            legalIssue: facts.legalIssue,
            possiblePracticeAreas: facts.possiblePracticeAreas,
            userRole: facts.userRole,
          },
          4
        );

  const retrievedSources: StatutorySource[] = rawSources.map((s) => ({
    actName: s.actName,
    section: s.section,
    title: s.provisionTitle,
    summary: s.plainSummary,
    relevanceNote: s.statutoryLimitationNote,
    officialSourceUrl: s.officialSourceUrl,
    actShortName: s.actShortName,
    jurisdiction: s.jurisdiction,
    lastCheckedDate: s.lastCheckedDate,
    verificationStatus: s.verificationStatus,
    provenance: s.sourcePublisher,
  }));

  return {
    title,
    createdAt: new Date().toISOString(),
    locale,
    issueSummary,
    facts: separatedFacts,
    dates: timelineDates,
    jurisdiction: briefJurisdiction,
    documentsMentioned,
    questionsForAdvocate,
    retrievedSources,
    disclaimer: MANDATORY_BRIEF_DISCLAIMER,
    excludedSections: [],
    isConfirmed: Boolean(facts.hasConfirmed),
  };
}
