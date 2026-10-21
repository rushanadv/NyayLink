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
    label: "Guided Intakes",
    sublabel: "Pilot platform volume",
  },
  {
    id: "lawyers",
    metric: "480+",
    label: "Enrolled Advocates",
    sublabel: "State Bar Council validated",
  },
  {
    id: "clarity",
    metric: "92%",
    label: "Comprehension Rate",
    sublabel: "Vernacular triage pilot feedback",
  },
];
