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
  { id: "gateways", name: "Client & Advocate Entry", nameHi: "प्रवेश द्वार", shortLabel: "Gateways", shortLabelHi: "प्रवेश", number: "02" },
  { id: "how-it-works", name: "How It Works", nameHi: "कार्यप्रणाली", shortLabel: "Process", shortLabelHi: "प्रक्रिया", number: "03" },
  { id: "audiences", name: "Two Audiences, One Platform", nameHi: "द्विपक्षीय मंच", shortLabel: "Platform", shortLabelHi: "मंच", number: "04" },
  { id: "trust", name: "Legal Ethics & Compliance", nameHi: "विधिक नैतिकता", shortLabel: "Ethics", shortLabelHi: "नैतिकता", number: "05" },
  { id: "cta", name: "Begin Consultation", nameHi: "परामर्श प्रारंभ", shortLabel: "Consult", shortLabelHi: "परामर्श", number: "06" },
];

