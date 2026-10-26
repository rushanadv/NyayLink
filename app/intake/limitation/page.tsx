"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Scale,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import {
  CANONICAL_LIMITATION_RULES,
  calculateLimitation,
  type LimitationCalculationResult,
} from "@/lib/legal/limitation-rules";
import { useLanguage } from "@/lib/i18n/context";

export default function LimitationScreeningPage() {
  const { isHindi } = useLanguage();
  const [selectedRuleId, setSelectedRuleId] = useState<string>(
    CANONICAL_LIMITATION_RULES[0].ruleId
  );
  const [causeOfActionDate, setCauseOfActionDate] = useState<string>("");
  const [result, setResult] = useState<LimitationCalculationResult | null>(null);

  const selectedRule =
    CANONICAL_LIMITATION_RULES.find((r) => r.ruleId === selectedRuleId) ||
    CANONICAL_LIMITATION_RULES[0];

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!causeOfActionDate) return;
    const res = calculateLimitation(selectedRuleId, causeOfActionDate);
    setResult(res);
  };

  const handleReset = () => {
    setCauseOfActionDate("");
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-[#FDFEFC] text-[#202824] antialiased">
      {/* Top Breadcrumb */}
      <div className="border-b border-[#D5E5D9] bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link
            href="/intake"
            className="text-xs font-semibold text-[#205C43] hover:text-[#174530] flex items-center gap-1.5"
          >
            ← {isHindi ? "एआई कानूनी सलाह पर वापस" : "Back to Legal Intake"}
          </Link>
          <span className="text-[11px] font-mono text-[#69736D]">
            {isHindi ? "सांविधिक सीमावधि कैलकुलेटर" : "Statutory Limitation Screening v2026.1"}
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#EAF3ED] border border-[#D5E5D9] text-xs font-mono font-semibold text-[#205C43]">
            <Clock className="w-3.5 h-3.5" />
            <span>{isHindi ? "सांविधिक मियाद जांच" : "STATUTORY LIMITATION SCREENING"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#202824] tracking-tight">
            {isHindi ? "कानूनी समय सीमा व मियाद कैलकुलेटर" : "Responsible Statutory Limitation Screening"}
          </h1>
          <p className="text-xs sm:text-sm text-[#69736D] leading-relaxed max-w-2xl">
            {isHindi
              ? "उपभोक्ता कानून, चेक बाउंस, दीवानी अनुबंध व रेरा मामलों के लिए आधिकारिक भारतीय कानूनों (Limitation Act 1963 व विशेष अधिनियमों) पर आधारित मियाद गणना।"
              : "Preliminary mathematical calculation grounded in the Limitation Act, 1963, Consumer Protection Act, 2019, NI Act, and Supreme Court jurisprudence."}
          </p>
        </div>

        {/* Input Form Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-6">
          <form onSubmit={handleCalculate} className="space-y-5">
            {/* Matter Category / Rule Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-[#69736D] font-semibold block">
                {isHindi ? "कानूनी विषय व लागू कानून *" : "Legal Matter Category & Governing Statute *"}
              </label>
              <select
                value={selectedRuleId}
                onChange={(e) => {
                  setSelectedRuleId(e.target.value);
                  setResult(null);
                }}
                className="w-full h-11 px-3.5 rounded-xl border border-[#D5E5D9] bg-[#F8FAF9] text-xs text-[#202824] focus:ring-2 focus:ring-[#205C43]/20 focus:border-[#205C43] outline-none cursor-pointer"
              >
                {CANONICAL_LIMITATION_RULES.map((rule) => (
                  <option key={rule.ruleId} value={rule.ruleId}>
                    {rule.title} — {rule.governingAct} ({rule.sectionOrArticle})
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Rule Explainer */}
            <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9]/80 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#202824]">
                  {selectedRule.governingAct} ({selectedRule.sectionOrArticle})
                </span>
                <a
                  href={selectedRule.officialSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-mono text-[#205C43] hover:underline inline-flex items-center gap-1"
                >
                  <span>Official India Code Text</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[#69736D] text-[11px] leading-relaxed">
                <strong>Trigger Event:</strong> {selectedRule.triggerEventDescription}
              </p>
            </div>

            {/* Date Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-[#69736D] font-semibold block">
                {isHindi ? "वाद कारण की तिथि (Cause of Action Date) *" : "Cause of Action / Event Date *"}
              </label>
              <input
                type="date"
                required
                value={causeOfActionDate}
                onChange={(e) => setCauseOfActionDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-full h-11 px-3.5 rounded-xl border border-[#D5E5D9] bg-white text-xs text-[#202824] focus:ring-2 focus:ring-[#205C43]/20 focus:border-[#205C43] outline-none"
              />
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-[#69736D] font-mono uppercase mr-1">
                  {isHindi ? "त्वरित चयन:" : "Quick Preset:"}
                </span>
                {[
                  { label: isHindi ? "30 दिन पहले" : "30 Days Ago", days: 30 },
                  { label: isHindi ? "6 माह पहले" : "6 Months Ago", days: 180 },
                  { label: isHindi ? "1 वर्ष पहले" : "1 Year Ago", days: 365 },
                  { label: isHindi ? "2.5 वर्ष पहले" : "2.5 Years Ago", days: 912 },
                ].map((preset) => (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() - preset.days);
                      setCauseOfActionDate(d.toISOString().split("T")[0]);
                    }}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-[#F4F9F5] border border-[#D5E5D9] text-[#205C43] hover:bg-[#EAF3ED] transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-[#69736D] block">
                {isHindi
                  ? "उदाहरण: चालान/बिल की तिथि, नोटिस प्राप्ति की तिथि, या अनुबंध उल्लंघन की तिथि"
                  : "e.g., date when legal notice was delivered, deficient goods received, or performance refused."}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={!causeOfActionDate}
                className="px-6 py-2.5 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-40"
              >
                {isHindi ? "सीमावधि की गणना करें" : "Calculate Statutory Deadline"}
              </button>
              {result && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl border border-[#D5E5D9] bg-white hover:bg-[#F8FAF9] text-xs font-medium text-[#69736D] transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Calculation Result Presentation */}
        {result && (
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#D5E5D9] shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#D5E5D9]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#69736D] block font-semibold">
                  SCREENING OUTCOME
                </span>
                <h3 className="text-lg font-serif font-bold text-[#202824]">
                  {result.rule.title}
                </h3>
              </div>

              {/* Status Pill */}
              <div>
                {result.status === "within_limitation" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF3ED] border border-[#D5E5D9] text-xs font-semibold text-[#205C43] font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Within Limitation
                  </span>
                )}
                {result.status === "approaching_deadline" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900 font-mono">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                    Approaching Deadline
                  </span>
                )}
                {result.status === "prima_facie_expired" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-900 font-mono">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
                    Prima Facie Time-Barred
                  </span>
                )}
                {result.status === "continuing_cause" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF3ED] border border-[#D5E5D9] text-xs font-semibold text-[#205C43] font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Continuing Cause of Action
                  </span>
                )}
              </div>
            </div>

            {/* Key Output Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#69736D] block font-semibold">
                  Cause of Action Date
                </span>
                <p className="font-semibold text-xs sm:text-sm text-[#202824]">
                  {new Date(result.causeOfActionDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#69736D] block font-semibold">
                  Calculated Statutory Deadline
                </span>
                <p className="font-semibold text-xs sm:text-sm text-[#202824]">
                  {result.calculatedStatutoryDeadline
                    ? new Date(result.calculatedStatutoryDeadline).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Continuous Wrong (Active Default)"}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#69736D] block font-semibold">
                  Remaining Days
                </span>
                <p
                  className={`font-semibold text-xs sm:text-sm ${
                    result.daysRemaining !== null && result.daysRemaining < 0
                      ? "text-rose-700"
                      : "text-[#205C43]"
                  }`}
                >
                  {result.daysRemaining !== null
                    ? `${result.daysRemaining} Calendar Days`
                    : "N/A (Continuing)"}
                </p>
              </div>
            </div>

            {/* Result Narrative */}
            <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] space-y-1">
              <span className="text-[11px] font-mono uppercase text-[#69736D] font-semibold">
                Interpretation:
              </span>
              <p className="text-xs text-[#202824] leading-relaxed">
                {isHindi ? result.statusTextHi : result.statusTextEn}
              </p>
            </div>

            {/* Assumptions & Condonation Note */}
            <div className="space-y-2 text-xs text-[#69736D] border-t border-[#D5E5D9] pt-4">
              <span className="font-mono text-[10px] uppercase font-bold text-[#202824] block">
                LEGAL ASSUMPTIONS & CONDONATION RULES:
              </span>
              <ul className="list-disc pl-5 space-y-1 text-[11px]">
                {result.assumptions.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
                <li>
                  <strong>Condonation Mechanism:</strong> {result.rule.condonationRule}
                </li>
              </ul>
            </div>

            {/* Mandatory Legal Safeguard / Advocate Notice */}
            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold font-mono text-[11px] uppercase text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                <span>Statutory Legal Notice</span>
              </div>
              <p className="leading-relaxed text-[11px] text-amber-900">
                {result.advocateNotice}
              </p>
            </div>

            {/* Next Steps: Connect to Verified Advocate */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#D5E5D9]">
              <span className="text-xs text-[#69736D]">
                Have an advocate independently verify this timeline before filing.
              </span>
              <Link
                href={`/lawyers?practiceArea=${encodeURIComponent(
                  result.rule.category === "consumer"
                    ? "Consumer Protection"
                    : result.rule.category === "property_rera"
                    ? "Real Estate & RERA"
                    : "Civil Litigation"
                )}`}
                className="whitespace-nowrap px-5 py-2.5 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Find Practitioners for this Matter</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
