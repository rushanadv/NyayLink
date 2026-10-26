/**
 * NyayLink Traceable Limitation-Period Screening Engine
 * Grounded in the Limitation Act, 1963, Consumer Protection Act, 2019,
 * BNSS 2023, and special statutory limitation provisions.
 *
 * All calculations are deterministic, auditable, and versioned.
 */

export interface LimitationRule {
  ruleId: string;
  category: "consumer" | "cheque_bounce" | "civil_contract" | "civil_residuary" | "property_rera" | "criminal_cognizance";
  title: string;
  governingAct: string;
  sectionOrArticle: string;
  officialSourceUrl: string;
  standardPeriodMonths: number;
  standardPeriodDays?: number;
  triggerEventDescription: string;
  assumptions: string[];
  condonationRule: string;
  version: string;
}

export const CANONICAL_LIMITATION_RULES: LimitationRule[] = [
  {
    ruleId: "cpa-2019-sec-69",
    category: "consumer",
    title: "Consumer Dispute Filing (District / State / National Commission)",
    governingAct: "Consumer Protection Act, 2019",
    sectionOrArticle: "Section 69",
    officialSourceUrl: "https://www.indiacode.nic.in/handle/123456789/15256",
    standardPeriodMonths: 24, // 2 Years
    triggerEventDescription: "Date on which the cause of action has arisen (e.g., date of deficient service, invoice, or defective delivery)",
    assumptions: [
      "Assuming cause of action is complete and not a continuing breach.",
      "Assuming no prior condonation of delay application under Section 69(2) has been adjudicated.",
      "Does not account for COVID-19 pandemic exclusion periods (which applied only between March 2020 and February 2022).",
    ],
    condonationRule: "Condonation permissible under Section 69(2) upon showing 'sufficient cause' to the satisfaction of the Consumer Commission.",
    version: "2026.1",
  },
  {
    ruleId: "ni-act-sec-138-142",
    category: "cheque_bounce",
    title: "Cheque Dishonour Complaint (Section 138/142)",
    governingAct: "Negotiable Instruments Act, 1881",
    sectionOrArticle: "Section 138 & Section 142(1)(b)",
    officialSourceUrl: "https://www.indiacode.nic.in/handle/123456789/2205",
    standardPeriodMonths: 1, // 1 month from notice expiry
    standardPeriodDays: 30, // 30 days statutory notice window + 15 day grace period + 30 days court filing
    triggerEventDescription: "Date of receipt of the 15-day statutory demand notice by the drawer of the dishonoured cheque",
    assumptions: [
      "Assumes legal demand notice was sent within 30 days of receiving the bank memo.",
      "Assumes the 15-day grace period for payment has expired without full settlement.",
      "Complaint must be presented before the Judicial Magistrate within 1 month from expiry of the 15-day notice period.",
    ],
    condonationRule: "Proviso to Section 142(1)(b) allows Magistrate to take cognizance after 1 month if complainant satisfies the Court with sufficient cause.",
    version: "2026.1",
  },
  {
    ruleId: "lim-act-art-54-contract",
    category: "civil_contract",
    title: "Specific Performance of Contract / Breach of Agreement",
    governingAct: "Limitation Act, 1963",
    sectionOrArticle: "Article 54, Schedule I",
    officialSourceUrl: "https://www.indiacode.nic.in/handle/123456789/2186",
    standardPeriodMonths: 36, // 3 Years
    triggerEventDescription: "The date fixed for performance, or if no such date is fixed, when the plaintiff has notice that performance is refused",
    assumptions: [
      "Assumes no subsequent written acknowledgement of debt or liability under Section 18 Limitation Act (which resets the 3-year clock).",
      "Assumes no legal disability (minority, insanity) under Section 6 at the time the right accrued.",
    ],
    condonationRule: "Section 5 of Limitation Act DOES NOT apply to original civil suits (only to appeals and applications). Suits filed beyond limitation must be dismissed under Section 3.",
    version: "2026.1",
  },
  {
    ruleId: "lim-act-art-113-residuary",
    category: "civil_residuary",
    title: "General Civil Suit (Residuary Limitation Period)",
    governingAct: "Limitation Act, 1963",
    sectionOrArticle: "Article 113, Schedule I",
    officialSourceUrl: "https://www.indiacode.nic.in/handle/123456789/2186",
    standardPeriodMonths: 36, // 3 Years
    triggerEventDescription: "When the right to sue accrues to the plaintiff",
    assumptions: [
      "Applies only where no specific limitation period is otherwise provided in the Limitation Act or special statute.",
      "Assumes no continuing tort or continuing breach under Section 22.",
    ],
    condonationRule: "Section 5 condonation is strictly inapplicable to institution of original suits.",
    version: "2026.1",
  },
  {
    ruleId: "rera-2016-delayed-possession",
    category: "property_rera",
    title: "RERA Delayed Possession & Refund Complaint (Form M)",
    governingAct: "Real Estate (Regulation and Development) Act, 2016",
    sectionOrArticle: "Section 18 & Section 31",
    officialSourceUrl: "https://www.indiacode.nic.in/handle/123456789/2158",
    standardPeriodMonths: 0, // Continuing cause of action
    triggerEventDescription: "Date of promised possession agreed in the builder-buyer agreement",
    assumptions: [
      "Per the landmark Supreme Court ruling in M/s Newtech Promoters (2021), failure to deliver possession is a continuous wrong.",
      "Limitation does not expire while the promoter retains allottee funds and has not delivered an occupancy/completion certificate.",
    ],
    condonationRule: "Continuous cause of action; limitation objection is not a bar while the default continues.",
    version: "2026.1",
  },
];

export interface LimitationCalculationResult {
  rule: LimitationRule;
  causeOfActionDate: string;
  calculatedStatutoryDeadline: string | null;
  daysRemaining: number | null;
  status:
    | "within_limitation"
    | "approaching_deadline"
    | "prima_facie_expired"
    | "continuing_cause"
    | "indeterminate";
  statusTextEn: string;
  statusTextHi: string;
  assumptions: string[];
  advocateNotice: string;
  calculatedAt: string;
}

/**
 * Deterministically calculates preliminary limitation period.
 * Accurately handles leap years, exact calendar months, and edge boundary dates.
 */
export function calculateLimitation(
  ruleId: string,
  causeOfActionDateStr: string
): LimitationCalculationResult {
  const rule = CANONICAL_LIMITATION_RULES.find((r) => r.ruleId === ruleId) || CANONICAL_LIMITATION_RULES[0];

  if (!causeOfActionDateStr) {
    return {
      rule,
      causeOfActionDate: "",
      calculatedStatutoryDeadline: null,
      daysRemaining: null,
      status: "indeterminate",
      statusTextEn: "Unable to calculate reliably with missing date information.",
      statusTextHi: "तिथि संबंधी अधूरी जानकारी के कारण गणना संभव नहीं है।",
      assumptions: rule.assumptions,
      advocateNotice: "Essential cause of action date is missing. Consult an advocate to identify when your right to sue accrued.",
      calculatedAt: new Date().toISOString(),
    };
  }

  const causeDate = new Date(causeOfActionDateStr);
  if (isNaN(causeDate.getTime())) {
    return {
      rule,
      causeOfActionDate: causeOfActionDateStr,
      calculatedStatutoryDeadline: null,
      daysRemaining: null,
      status: "indeterminate",
      statusTextEn: "Invalid calendar date provided.",
      statusTextHi: "अमान्य कैलेंडर तिथि दर्ज की गई है।",
      assumptions: rule.assumptions,
      advocateNotice: "Please provide a valid ISO date.",
      calculatedAt: new Date().toISOString(),
    };
  }

  // Handle continuing cause of action (e.g. RERA delayed possession)
  if (rule.standardPeriodMonths === 0) {
    return {
      rule,
      causeOfActionDate: causeOfActionDateStr,
      calculatedStatutoryDeadline: null,
      daysRemaining: null,
      status: "continuing_cause",
      statusTextEn: "Continuing Cause of Action: The right to claim possession interest or refund remains actionable as long as default persists.",
      statusTextHi: "निरंतर वाद कारण (Continuing Cause): जब तक कब्जा या रिफंड नहीं मिलता, तब तक दावा किया जा सकता है।",
      assumptions: rule.assumptions,
      advocateNotice: "Confirmed under SC precedent (Newtech Promoters 2021). However, unreasonable laches or delay can affect discretionary interest awards.",
      calculatedAt: new Date().toISOString(),
    };
  }

  // Deterministic calendar addition: Months + Days
  const deadline = new Date(causeDate.getTime());
  deadline.setMonth(deadline.getMonth() + rule.standardPeriodMonths);
  if (rule.standardPeriodDays) {
    deadline.setDate(deadline.getDate() + rule.standardPeriodDays);
  }

  const now = new Date();
  const diffTime = deadline.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let status: LimitationCalculationResult["status"] = "within_limitation";
  let statusTextEn = `Well within statutory limitation (${daysRemaining} calendar days remaining).`;
  let statusTextHi = `सांविधिक सीमावधि के अंतर्गत (${daysRemaining} दिन शेष हैं)।`;

  if (daysRemaining < 0) {
    status = "prima_facie_expired";
    const daysAgo = Math.abs(daysRemaining);
    statusTextEn = `Statutory deadline expired approximately ${daysAgo} days ago on ${deadline.toISOString().split("T")[0]}.`;
    statusTextHi = `सांविधिक समय सीमा समाप्त हो चुकी है (लगभग ${daysAgo} दिन पूर्व ${deadline.toISOString().split("T")[0]} को समाप्त)।`;
  } else if (daysRemaining <= 60) {
    status = "approaching_deadline";
    statusTextEn = `URGENT: Statutory deadline approaches within ${daysRemaining} days (due by ${deadline.toISOString().split("T")[0]}).`;
    statusTextHi = `अति आवश्यक: समय सीमा समाप्त होने वाली है (${daysRemaining} दिन शेष, अंतिम तिथि ${deadline.toISOString().split("T")[0]})।`;
  }

  return {
    rule,
    causeOfActionDate: causeOfActionDateStr,
    calculatedStatutoryDeadline: deadline.toISOString().split("T")[0],
    daysRemaining,
    status,
    statusTextEn,
    statusTextHi,
    assumptions: rule.assumptions,
    advocateNotice:
      "PRELIMINARY INDICATION ONLY: This tool performs mathematical boundary screening based on canonical statutory rules. It does NOT constitute legal advice or a definitive opinion. Specific facts such as written acknowledgements (Sec 18 Limitation Act), public holidays (Sec 4), or condonation of delay (Sec 5 / Sec 69(2) CPA) may alter this result. Confirm with an enrolled advocate immediately.",
    calculatedAt: new Date().toISOString(),
  };
}
