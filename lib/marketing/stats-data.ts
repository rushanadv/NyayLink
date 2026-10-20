export interface StatItem {
  id: string;
  metric: string;
  label: string;
  sublabel: string;
}

export const ROTATING_STATS: StatItem[] = [
  {
    id: "cases",
    metric: "12,400+",
    label: "Cases Guided",
    sublabel: "Across 28 states & UTs",
  },
  {
    id: "lawyers",
    metric: "480",
    label: "Verified Advocates",
    sublabel: "State Bar Council validated",
  },
  {
    id: "clarity",
    metric: "92%",
    label: "Clarity in <5 min",
    sublabel: "Plain-language intake",
  },
];
