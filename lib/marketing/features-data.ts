export interface FeatureItem {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  category: "Client" | "Platform" | "Advocate" | "Trust";
  iconName: string;
  badge: string;
  highlights: string[];
}

export const FEATURES: FeatureItem[] = [
  {
    id: "search-match",
    number: "01",
    title: "Search & Match",
    subtitle: "Find verified lawyers by case type, language, city",
    category: "Client",
    iconName: "Search",
    badge: "Verified Registry",
    highlights: [
      "480+ Bar Council certified advocates",
      "Direct filter by District Court & High Court jurisdiction",
      "Match by native language & consultation mode",
    ],
  },
  {
    id: "ai-intake",
    number: "02",
    title: "AI Preconsultation",
    subtitle: "Describe your issue, get plain-language guidance",
    category: "Client",
    iconName: "Sparkles",
    badge: "Bilingual AI",
    highlights: [
      "De-jargonizes complex civil & criminal statutes",
      "Instant assessment of legal merit & limitation periods",
      "Drafts preliminary grievance notes automatically",
    ],
  },
  {
    id: "track-case",
    number: "03",
    title: "Track Your Case",
    subtitle: "Milestones, documents, next steps in one place",
    category: "Platform",
    iconName: "Activity",
    badge: "Live Milestones",
    highlights: [
      "Cryptographically verified timeline updates",
      "Notice dispatch & registry filing timestamps",
      "Case docket and hearing diary tracking",
    ],
  },
  {
    id: "book-pay",
    number: "04",
    title: "Book & Consult",
    subtitle: "Transparent fees, no surprise charges",
    category: "Client",
    iconName: "CreditCard",
    badge: "Direct Engagement",
    highlights: [
      "Flat-fee upfront quotes for legal notices & consultations",
      "Direct transparent consultation terms agreed upfront",
      "Advocates Act compliant fee documentation",
    ],
  },
  {
    id: "lawyer-workspace",
    number: "05",
    title: "Lawyer Workspace",
    subtitle: "Calendar, case vault, client intake (for lawyers)",
    category: "Advocate",
    iconName: "Briefcase",
    badge: "For Advocates",
    highlights: [
      "Unified court calendar with hearing diary tracking",
      "Digital Vakalatnama drafting with Section 30 compliance",
      "Encrypted client case repository with audit trail",
    ],
  },
  {
    id: "verified-compliant",
    number: "06",
    title: "Verified & Compliant",
    subtitle: "Bar Council verification, Advocates Act–safe",
    category: "Trust",
    iconName: "ShieldCheck",
    badge: "BCI Rule 36 Compliant",
    highlights: [
      "State Bar Council enrollment ID cross-validation",
      "No unlawful solicitation — strictly an informational marketplace",
      "Strict advocate-client confidentiality with TLS encryption and RLS",
    ],
  },
  {
    id: "multilingual-support",
    number: "07",
    title: "Multilingual Support",
    subtitle: "Hindi + regional languages, voice-first",
    category: "Platform",
    iconName: "Languages",
    badge: "Voice-First",
    highlights: [
      "Hindi, Marathi, Tamil, Bengali, Telugu & English support",
      "Voice intake in vernacular dialects for non-literate citizens",
      "Instant side-by-side legal document translation",
    ],
  },
];
