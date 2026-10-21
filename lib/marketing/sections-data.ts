export interface SectionItem {
  id: string;
  name: string;
  shortLabel: string;
  number: string;
}

export const SECTIONS: SectionItem[] = [
  { id: "hero", name: "Overview", shortLabel: "Hero", number: "01" },
  { id: "gateways", name: "Client & Advocate Entry", shortLabel: "Entry", number: "02" },
  { id: "how-it-works", name: "How It Works", shortLabel: "Process", number: "03" },
  { id: "audiences", name: "Two Audiences, One Platform", shortLabel: "Platform", number: "04" },
  { id: "trust", name: "Legal Ethics & Compliance", shortLabel: "Trust", number: "05" },
  { id: "cta", name: "Begin Consultation", shortLabel: "Action", number: "06" },
];
