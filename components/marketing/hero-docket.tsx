"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Scale,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

export function HeroDocket() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Auto-advance tabs every 6 seconds unless user hovers or interacts
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % 3);
    }, 6000);

    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <div
      className="w-full rounded-2xl bg-white border border-[#D5E5D9] shadow-xl shadow-[#202824]/5 overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Guided Legal Workflow Demonstration"
    >
      {/* Top Architectural Docket Bar */}
      <div className="px-4 sm:px-5 py-3 sm:py-3.5 bg-[#EAF3ED]/60 border-b border-[#D5E5D9] flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#205C43] animate-pulse" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#202824] font-semibold whitespace-nowrap">
            {t.home.docket.tag}
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#69736D] shrink-0">
          <span className="hidden sm:inline">{t.home.docket.jurisdictionLabel}</span>
          <span className="px-2 py-0.5 rounded bg-white border border-[#D5E5D9] text-[#202824] font-medium truncate max-w-[210px] sm:max-w-none">
            {t.home.docket.jurisdictionVal}
          </span>
        </div>
      </div>

      {/* 3 Step Procedure Stepper Tabs */}
      <div role="tablist" className="grid grid-cols-3 border-b border-[#D5E5D9] bg-white text-xs font-mono">
        <button
          role="tab"
          onClick={() => setActiveTab(0)}
          className={`py-3 px-2 sm:px-4 text-left transition-colors relative flex items-center gap-1.5 sm:gap-2.5 focus-visible:outline-none border-b-2 ${
            activeTab === 0
              ? "bg-[#EAF3ED]/40 text-[#202824] font-semibold border-[#205C43]"
              : "text-[#69736D] hover:text-[#202824] border-transparent"
          }`}
          aria-selected={activeTab === 0}
        >
          <span
            className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold shrink-0 ${
              activeTab === 0
                ? "bg-[#205C43] text-white"
                : "bg-[#EAF3ED] text-[#69736D]"
            }`}
          >
            1
          </span>
          <span className="truncate text-xs">{t.home.docket.tabGrievance}</span>
        </button>

        <button
          role="tab"
          onClick={() => setActiveTab(1)}
          className={`py-3 px-2 sm:px-4 text-left transition-colors relative flex items-center gap-1.5 sm:gap-2.5 focus-visible:outline-none border-b-2 ${
            activeTab === 1
              ? "bg-[#EAF3ED]/40 text-[#202824] font-semibold border-[#205C43]"
              : "text-[#69736D] hover:text-[#202824] border-transparent"
          }`}
          aria-selected={activeTab === 1}
        >
          <span
            className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold shrink-0 ${
              activeTab === 1
                ? "bg-[#205C43] text-white"
                : "bg-[#EAF3ED] text-[#69736D]"
            }`}
          >
            2
          </span>
          <span className="truncate text-xs">{t.home.docket.tabAnalysis}</span>
        </button>

        <button
          role="tab"
          onClick={() => setActiveTab(2)}
          className={`py-3 px-2 sm:px-4 text-left transition-colors relative flex items-center gap-1.5 sm:gap-2.5 focus-visible:outline-none border-b-2 ${
            activeTab === 2
              ? "bg-[#EAF3ED]/40 text-[#202824] font-semibold border-[#205C43]"
              : "text-[#69736D] hover:text-[#202824] border-transparent"
          }`}
          aria-selected={activeTab === 2}
        >
          <span
            className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold shrink-0 ${
              activeTab === 2
                ? "bg-[#205C43] text-white"
                : "bg-[#EAF3ED] text-[#69736D]"
            }`}
          >
            3
          </span>
          <span className="truncate text-xs">{t.home.docket.tabCounsel}</span>
        </button>
      </div>

      {/* Main Procedural Stage Display */}
      <div className="p-5 sm:p-7 flex flex-col justify-between">
        <div className="min-h-[250px] relative">
          <AnimatePresence mode="wait">
            {activeTab === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#205C43] font-bold">
                    {t.home.docket.stage1Title}
                  </span>
                  <span className="text-[11px] text-[#69736D] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#205C43]" /> {t.home.docket.stage1Logged}
                  </span>
                </div>

                {/* Dispute Summary Excerpt */}
                <div className="p-4 rounded-xl bg-[#EAF3ED]/30 border border-[#D5E5D9] text-xs space-y-2">
                  <div className="flex items-center gap-2 text-[#69736D] text-[11px] font-mono">
                    <FileText className="w-3.5 h-3.5 text-[#202824]" />
                    <span>{t.home.docket.stage1SubmissionLabel}</span>
                  </div>
                  <p className="text-[#202824] text-[13px] leading-relaxed italic font-serif">
                    {t.home.docket.stage1SubmissionText}
                  </p>
                </div>

                {/* 2 Concise Supporting Signals */}
                <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="p-3 rounded-lg border border-[#D5E5D9] bg-white">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#69736D] block">
                      {t.home.docket.domainCategory}
                    </span>
                    <span className="text-xs font-semibold text-[#202824] mt-0.5 block truncate">
                      {t.home.docket.domainVal}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg border border-[#D5E5D9] bg-white">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#69736D] block">
                      {t.home.docket.limitationPeriod}
                    </span>
                    <span className="text-xs font-semibold text-[#205C43] mt-0.5 block flex items-center gap-1 truncate">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#205C43] shrink-0" /> {t.home.docket.limitationVal}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#205C43] font-bold">
                    {t.home.docket.stage2Title}
                  </span>
                  <span className="text-[11px] text-[#69736D] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#205C43]" /> {t.home.docket.stage2RealStatutes}
                  </span>
                </div>

                {/* Legal Provisions Card */}
                <div className="p-4 rounded-xl bg-[#EAF3ED]/30 border border-[#D5E5D9] space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#205C43] shrink-0" />
                    <span className="text-xs font-semibold text-[#202824] leading-snug">
                      {t.home.docket.stage2StatuteTitle}
                    </span>
                  </div>
                  <p className="text-xs text-[#69736D] leading-relaxed">
                    {t.home.docket.stage2StatuteDesc}
                  </p>

                  <div className="pt-2 border-t border-[#D5E5D9] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[11px] font-mono">
                    <span className="text-[#69736D]">{t.home.docket.stage2ForumLabel}</span>
                    <span className="text-[#202824] font-semibold truncate">{t.home.docket.stage2ForumVal}</span>
                  </div>
                </div>

                {/* 2 Key Evidentiary Requirements */}
                <div className="space-y-1.5 text-xs text-[#69736D]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#202824] font-semibold block">
                    {t.home.docket.checklistTitle}
                  </span>
                  <div className="flex items-center gap-2 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#205C43] shrink-0" />
                    <span className="truncate">{t.home.docket.checklistItem1}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#205C43] shrink-0" />
                    <span className="truncate">{t.home.docket.checklistItem2}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#205C43] font-bold">
                    {t.home.docket.stage3Title}
                  </span>
                  <span className="text-[11px] text-[#69736D] flex items-center gap-1 font-mono">
                    <Lock className="w-3.5 h-3.5 text-[#205C43]" /> {t.home.docket.stage3Escrow}
                  </span>
                </div>

                {/* Verified Advocate Profile Highlight */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-[#D5E5D9] shadow-xs flex items-start justify-between gap-3 sm:gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center font-serif text-sm font-semibold text-[#205C43] shrink-0">
                      NL
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-sm font-semibold text-[#202824]">{t.home.docket.advocateName}</h4>
                        <span className="px-1.5 py-0.5 rounded bg-[#EAF3ED] border border-[#D5E5D9] text-[9px] font-mono text-[#205C43] font-semibold uppercase">
                          {t.home.docket.bciVerifiedBadge}
                        </span>
                      </div>
                      <p className="text-xs text-[#69736D] mt-0.5 truncate">
                        {t.home.docket.advocateRoll}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-[11px] font-mono text-[#69736D]">
                        <span>{t.home.docket.advocateLanguages}</span>
                        <span>·</span>
                        <span className="text-[#205C43] font-semibold">{t.home.docket.advocateStat}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm sm:text-base font-bold text-[#202824]">{t.home.docket.advocateFee}</span>
                    <p className="text-[10px] text-[#69736D]">{t.home.docket.advocateFeeLabel}</p>
                  </div>
                </div>

                {/* 2 Supporting Terms */}
                <div className="p-3 rounded-lg bg-[#EAF3ED]/40 border border-[#D5E5D9] text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] text-[#69736D]">
                    <ShieldCheck className="w-4 h-4 text-[#205C43] shrink-0" />
                    <span className="truncate">{t.home.docket.digitalVakalatnamaEscrow}</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#205C43] font-semibold shrink-0 ml-2">
                    {t.home.docket.zeroSurpriseFees}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Contextual Progression Bar */}
        <div className="pt-4 mt-2 border-t border-[#D5E5D9] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-[11px] text-[#69736D]">
            <span>{t.home.docket.clickStagesPrompt}</span>
          </div>

          <Link
            href="/lawyers"
            className="inline-flex items-center gap-1.5 font-semibold text-xs text-[#205C43] hover:text-[#174530] transition-colors"
          >
            <span>{t.home.docket.proceedClient}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
