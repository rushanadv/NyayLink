export interface GradientStop {
  id: string;
  name: string;
  section: string;
  range: number[]; // keyframe points for useTransform
  opacityCurve: number[]; // corresponding opacity outputs
  gradient: string;
}

export const BACKGROUND_STOPS: GradientStop[] = [
  {
    id: "hero",
    name: "Cosmic Midnight Navy",
    section: "Hero",
    range: [0, 0.1, 0.18],
    opacityCurve: [1, 1, 0],
    gradient:
      "radial-gradient(ellipse 130% 90% at 50% -10%, #16284D 0%, #0D1629 50%, #060911 100%)",
  },
  {
    id: "problem",
    name: "Deep Twilight Indigo",
    section: "The Challenge",
    range: [0.08, 0.18, 0.28, 0.36],
    opacityCurve: [0, 1, 1, 0],
    gradient:
      "radial-gradient(ellipse 120% 85% at 75% 15%, #19244D 0%, #0F152D 50%, #070914 100%)",
  },
  {
    id: "marketplace",
    name: "Warm Amber Charcoal",
    section: "Lawyer Network",
    range: [0.26, 0.36, 0.44, 0.52],
    opacityCurve: [0, 1, 1, 0],
    gradient:
      "radial-gradient(ellipse 125% 85% at 50% 20%, #342514 0%, #1C130A 50%, #0A0805 100%)",
  },
  {
    id: "ai-advisory",
    name: "Luminous Cyan-Teal",
    section: "AI Intake Engine",
    range: [0.42, 0.52, 0.6, 0.68],
    opacityCurve: [0, 1, 1, 0],
    gradient:
      "radial-gradient(ellipse 125% 85% at 30% 25%, #0D3843 0%, #082027 50%, #030F13 100%)",
  },
  {
    id: "lawyer-saas",
    name: "Deep Emerald-Navy",
    section: "Advocate SaaS",
    range: [0.58, 0.68, 0.76, 0.84],
    opacityCurve: [0, 1, 1, 0],
    gradient:
      "radial-gradient(ellipse 125% 85% at 70% 25%, #0E3823 0%, #082015 50%, #030F0A 100%)",
  },
  {
    id: "trust-compliance",
    name: "Radiant Judicial Brass & Gold",
    section: "Compliance & Trust",
    range: [0.74, 0.83, 0.89, 0.95],
    opacityCurve: [0, 1, 1, 0],
    gradient:
      "radial-gradient(ellipse 130% 85% at 50% 25%, #3E2B12 0%, #221709 50%, #0B0703 100%)",
  },
  {
    id: "cta-footer",
    name: "Obsidian Pitch Black",
    section: "CTA & Footer",
    range: [0.86, 0.94, 1.0],
    opacityCurve: [0, 1, 1],
    gradient:
      "radial-gradient(ellipse 130% 90% at 50% 55%, #111218 0%, #060608 60%, #000000 100%)",
  },
];

export const STATIC_HERO_GRADIENT =
  "radial-gradient(ellipse 130% 90% at 50% -10%, #16284D 0%, #0D1629 50%, #060911 100%)";
