export interface SectionItem {
  id: string;
  name: string;
  nameHi: string;
  shortLabel: string;
  shortLabelHi: string;
  number: string;
}

export const SECTIONS: SectionItem[] = [
  { id: "hero", name: "Overview", nameHi: "अवलोकन", shortLabel: "Overview", shortLabelHi: "अवलोकन", number: "01" },
  { id: "how-it-works", name: "How It Works", nameHi: "कार्यप्रणाली", shortLabel: "Process", shortLabelHi: "प्रक्रिया", number: "02" },
  { id: "capabilities", name: "Core Capabilities", nameHi: "मुख्य क्षमताएं", shortLabel: "Capabilities", shortLabelHi: "क्षमताएं", number: "03" },
  { id: "trust", name: "Trust & Ethics", nameHi: "विधिक नैतिकता", shortLabel: "Ethics", shortLabelHi: "नैतिकता", number: "04" },
  { id: "cta", name: "Next Steps", nameHi: "अगला कदम", shortLabel: "Start", shortLabelHi: "शुरू करें", number: "05" },
];

