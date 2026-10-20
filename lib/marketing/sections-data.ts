export interface SectionItem {
  id: string;
  name: string;
  shortLabel: string;
  number: string;
}

export const SECTIONS: SectionItem[] = [
  { id: "hero", name: "Overview", shortLabel: "Hero", number: "01" },
  { id: "problem", name: "The Challenge", shortLabel: "Problem", number: "02" },
  { id: "marketplace", name: "Lawyer Network", shortLabel: "Marketplace", number: "03" },
  { id: "ai-advisory", name: "AI Intake Engine", shortLabel: "AI Advisory", number: "04" },
  { id: "lawyer-saas", name: "Advocate Portal", shortLabel: "Lawyer SaaS", number: "05" },
  { id: "trust", name: "Legal Compliance", shortLabel: "Trust", number: "06" },
  { id: "cta", name: "Get Started", shortLabel: "Action", number: "07" },
];
