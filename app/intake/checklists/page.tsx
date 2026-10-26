"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Square,
  FileText,
  Scale,
  AlertCircle,
  ExternalLink,
  Upload,
  ArrowRight,
  ShieldCheck,
  FolderLock,
} from "lucide-react";
import {
  PROCEDURAL_CHECKLISTS,
  type ProceduralChecklist,
  type ChecklistItem,
} from "@/lib/legal/filing-checklists";
import { useLanguage } from "@/lib/i18n/context";

export default function ChecklistsPage() {
  const { isHindi } = useLanguage();
  const [activeChecklistId, setActiveChecklistId] = useState<string>(
    PROCEDURAL_CHECKLISTS[0].id
  );
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});

  const currentChecklist =
    PROCEDURAL_CHECKLISTS.find((c) => c.id === activeChecklistId) ||
    PROCEDURAL_CHECKLISTS[0];

  const totalItems = currentChecklist.items.length;
  const completedCount = currentChecklist.items.filter(
    (item) => checkedItems[item.id]
  ).length;
  const progressPercentage = Math.round((completedCount / totalItems) * 100);

  const toggleItem = (itemId: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleNoteChange = (itemId: string, note: string) => {
    setItemNotes((prev) => ({
      ...prev,
      [itemId]: note,
    }));
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
            {isHindi ? "प्रक्रियात्मक दाखिला चेकलिस्ट" : "Procedural Filing Checklists v2026.1"}
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#EAF3ED] border border-[#D5E5D9] text-xs font-mono font-semibold text-[#205C43]">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>{isHindi ? "प्रक्रियात्मक तैयारी चेकलिस्ट" : "PROCEDURAL FILING CHECKLISTS"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#202824] tracking-tight">
            {isHindi ? "अदालती दाखिला व दस्तावेज़ तैयारी चेकलिस्ट" : "Context-Sensitive Procedural Filing Checklists"}
          </h1>
          <p className="text-xs sm:text-sm text-[#69736D] leading-relaxed max-w-2xl">
            {isHindi
              ? "बीएनएसएस जमानत, उपभोक्ता आयोग, रेरा व दीवानी व्यादेश (Injunction) मामलों में अनिवार्य व वैकल्पिक दस्तावेज़ों की संरचित सूची।"
              : "Structured document preparation guides grounded in the BNSS 2023, Consumer Protection Act, RERA, and Code of Civil Procedure."}
          </p>
        </div>

        {/* Checklist Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#D5E5D9] pb-3">
          {PROCEDURAL_CHECKLISTS.map((cl) => {
            const isActive = cl.id === activeChecklistId;
            return (
              <button
                key={cl.id}
                onClick={() => setActiveChecklistId(cl.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#205C43] text-white shadow-xs"
                    : "bg-white hover:bg-[#EAF3ED] text-[#202824] border border-[#D5E5D9]"
                }`}
              >
                {isHindi ? cl.titleHi.split("(")[0].trim() : cl.titleEn.split("(")[0].trim()}
              </button>
            );
          })}
        </div>

        {/* Active Checklist Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-6">
          {/* Forum & Disclaimer Banner */}
          <div className="space-y-3 pb-5 border-b border-[#D5E5D9]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#69736D] font-bold block">
                  ADJUDICATING FORUM & STATUTORY SCOPE
                </span>
                <h2 className="text-lg font-serif font-bold text-[#202824]">
                  {isHindi ? currentChecklist.titleHi : currentChecklist.titleEn}
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#EAF3ED] border border-[#D5E5D9] text-xs font-mono font-semibold text-[#205C43] self-start sm:self-auto">
                {currentChecklist.forum}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9]/80 text-xs text-[#69736D] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#205C43] shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px]">
                <strong>{isHindi ? "मार्गदर्शन सूचना:" : "Notice:"}</strong> {currentChecklist.guidanceDisclaimer}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[#69736D] text-[11px]">
                  Filing Readiness: <strong className="text-[#202824]">{completedCount} of {totalItems} items prepared</strong>
                </span>
                <span className="font-mono font-bold text-[#205C43] text-[11px]">
                  {progressPercentage}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#F2F7F4] overflow-hidden">
                <div
                  className="h-full bg-[#205C43] transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-4">
            {currentChecklist.items.map((item, index) => {
              const isChecked = !!checkedItems[item.id];

              return (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 rounded-xl border transition-all ${
                    isChecked
                      ? "bg-[#F8FAF9] border-[#205C43]/40"
                      : "bg-white border-[#D5E5D9] hover:border-[#D5E5D9]/80"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <button
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      className="mt-0.5 text-[#205C43] focus:outline-none shrink-0"
                      aria-label={isChecked ? "Mark incomplete" : "Mark complete"}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5 text-[#205C43]" />
                      ) : (
                        <Square className="w-5 h-5 text-[#69736D]/60 hover:text-[#205C43]" />
                      )}
                    </button>

                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3
                          className={`text-xs sm:text-sm font-semibold transition-colors ${
                            isChecked ? "line-through text-[#69736D]" : "text-[#202824]"
                          }`}
                        >
                          {index + 1}. {isHindi ? item.labelHi : item.labelEn}
                        </h3>

                        <div className="flex items-center gap-2">
                          {item.isRequired ? (
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                              Mandatory
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#F8FAF9] text-[#69736D] border border-[#D5E5D9]">
                              Optional / If Applicable
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-[#205C43] bg-[#EAF3ED] px-2 py-0.5 rounded border border-[#D5E5D9]">
                            {item.documentType}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-[#69736D] leading-relaxed">
                        {isHindi ? item.descriptionHi : item.descriptionEn}
                      </p>

                      <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#69736D]">
                        <span className="font-mono">
                          Source Authority: <strong className="text-[#202824]">{item.statutorySource}</strong>
                        </span>

                        <Link
                          href="/dashboard?tab=documents"
                          className="inline-flex items-center gap-1 text-[#205C43] hover:underline font-semibold"
                        >
                          <Upload className="w-3 h-3" />
                          <span>Attach in Client Vault</span>
                        </Link>
                      </div>

                      {/* Notes Field */}
                      <div className="pt-2">
                        <input
                          type="text"
                          value={itemNotes[item.id] || ""}
                          onChange={(e) => handleNoteChange(item.id, e.target.value)}
                          placeholder="Your notes (e.g. Certified copy applied at registry on Monday)..."
                          className="w-full px-3 py-1.5 rounded-lg border border-[#D5E5D9] bg-[#FDFEFC] text-[11px] text-[#202824] placeholder-[#69736D]/60 focus:ring-1 focus:ring-[#205C43] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Callout */}
          <div className="pt-4 border-t border-[#D5E5D9] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-[#69736D]">
              <FolderLock className="w-4 h-4 text-[#205C43]" />
              <span>All prepared documents can be saved in your encrypted Vault.</span>
            </div>

            <Link
              href="/lawyers"
              className="px-5 py-2.5 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <span>Consult Filing Counsel</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
