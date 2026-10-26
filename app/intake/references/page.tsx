"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Scale,
  Search,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  Calendar,
  Shield,
  Clock,
  ArrowRight,
} from "lucide-react";
import {
  CANONICAL_LEGAL_REFERENCES,
  searchLegalReferences,
  type StatutoryReference,
} from "@/lib/legal/references";
import { useLanguage } from "@/lib/i18n/context";

const CATEGORIES = [
  { id: "all", labelEn: "All Acts", labelHi: "सभी कानून" },
  { id: "criminal", labelEn: "BNS & BNSS (Criminal)", labelHi: "बीएनएस व बीएनएसएस (फौजदारी)" },
  { id: "consumer", labelEn: "Consumer Protection (CPA)", labelHi: "उपभोक्ता संरक्षण (CPA)" },
  { id: "property", labelEn: "Real Estate (RERA)", labelHi: "भू-संपदा (RERA)" },
  { id: "civil", labelEn: "Civil Procedure (CPC)", labelHi: "दीवानी प्रक्रिया (CPC)" },
  { id: "commercial", labelEn: "NI Act (Cheque Bounce)", labelHi: "चेक बाउंस (NI Act)" },
];

export default function LegalReferencesPage() {
  const { isHindi } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredReferences = useMemo(() => {
    return searchLegalReferences(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#FDFEFC] text-[#202824] antialiased">
      {/* Top Breadcrumb */}
      <div className="border-b border-[#D5E5D9] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link
            href="/intake"
            className="text-xs font-semibold text-[#205C43] hover:text-[#174530] flex items-center gap-1.5"
          >
            ← {isHindi ? "एआई कानूनी सलाह पर वापस" : "Back to Legal Intake"}
          </Link>
          <span className="text-[11px] font-mono text-[#69736D]">
            {isHindi ? "आधिकारिक भारतीय कानूनी स्रोत" : "Canonical Legal References Registry v2026.1"}
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#EAF3ED] border border-[#D5E5D9] text-xs font-mono font-semibold text-[#205C43]">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isHindi ? "सत्यापित स्रोत निर्देशिका" : "VERIFIED STATUTORY REFERENCES"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#202824] tracking-tight">
            {isHindi ? "भारतीय कानूनी संदर्भ व सांविधिक स्रोत" : "Authoritative Indian Statutory References"}
          </h1>
          <p className="text-xs sm:text-sm text-[#69736D] leading-relaxed max-w-2xl">
            {isHindi
              ? "भारतीय न्याय संहिता (BNS), नागरिक सुरक्षा संहिता (BNSS), उपभोक्ता संरक्षण अधिनियम 2019, रेरा और सीपीसी के आधिकारिक इंडिया कोड (India Code) लिंक व कानूनी प्रावधान।"
              : "Direct links and primary text provisions from India Code, Ministry of Law and Justice, and Central gazette publications."}
          </p>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#205C43]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by section number (e.g. 318, 173, 69, 18), act name, or legal concept..."
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#D5E5D9] bg-[#F8FAF9] text-xs text-[#202824] focus:ring-2 focus:ring-[#205C43]/20 focus:border-[#205C43] outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const isActive = cat.id === selectedCategory;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-[#205C43] text-white"
                      : "bg-[#F8FAF9] hover:bg-[#EAF3ED] text-[#202824] border border-[#D5E5D9]"
                  }`}
                >
                  {isHindi ? cat.labelHi : cat.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        {/* References List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#69736D]">
            <span>
              Showing <strong className="text-[#202824]">{filteredReferences.length}</strong> official provisions
            </span>
            <span className="font-mono text-[11px]">Primary Source Verified</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredReferences.map((ref) => (
              <div
                key={ref.id}
                className="p-6 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#EAF3ED] border border-[#D5E5D9] text-xs font-mono font-bold text-[#205C43]">
                        {ref.section}
                      </span>
                      <span className="text-xs font-serif font-bold text-[#202824]">
                        {ref.actShortName}
                      </span>
                    </div>
                    <h2 className="text-base font-serif font-bold text-[#202824]">
                      {ref.provisionTitle}
                    </h2>
                    <p className="text-[11px] text-[#69736D]">
                      {ref.actName} • {ref.sourcePublisher}
                    </p>
                  </div>

                  <a
                    href={ref.officialSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAF9] hover:bg-[#EAF3ED] border border-[#D5E5D9] text-xs font-semibold text-[#205C43] transition-colors self-start shrink-0"
                  >
                    <span>View on India Code</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Primary Source Text */}
                <div className="p-4 rounded-xl bg-[#F8FAF9] border-l-4 border-l-[#205C43] border border-[#D5E5D9] text-xs space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#69736D] font-bold block">
                    PRIMARY STATUTORY TEXT (GAZETTE RECORD):
                  </span>
                  <p className="font-serif text-[#202824] italic leading-relaxed text-[12px]">
                    &ldquo;{ref.keyStatutoryText}&rdquo;
                  </p>
                </div>

                {/* Plain-Language Explanation */}
                <div className="text-xs space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#69736D] font-semibold block">
                    PLAIN-LANGUAGE APPLICATION:
                  </span>
                  <p className="text-[#4A544F] leading-relaxed">
                    {ref.plainSummary}
                  </p>
                </div>

                {/* Statutory Limitation if present */}
                {ref.statutoryLimitationNote && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900">
                    <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                    <span>
                      <strong>Limitation Period:</strong> {ref.statutoryLimitationNote}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
