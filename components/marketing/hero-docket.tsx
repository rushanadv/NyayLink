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

export function HeroDocket() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Auto-advance tabs every 5 seconds unless user hovers/interacts
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % 3);
    }, 5500);

    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <div
      className="w-full rounded-2xl bg-white border border-[#D5E5D9] shadow-xl shadow-[#202824]/5 overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Top Architectural Docket Bar */}
      <div className="px-4 sm:px-5 py-3 sm:py-3.5 bg-[#EAF3ED]/50 border-b border-[#D5E5D9] flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#205C43] animate-pulse" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#202824] font-semibold whitespace-nowrap">
            Docket Dossier #NL-2026-DL
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#69736D] shrink-0">
          <span className="hidden sm:inline">Jurisdiction:</span>
          <span className="px-2 py-0.5 rounded bg-white border border-[#D5E5D9] text-[#202824] font-medium truncate max-w-[210px] sm:max-w-none">
            High Court of Delhi & Tribunals
          </span>
        </div>
      </div>

      {/* 3 Step Procedure Stepper Tabs with stable border sizing */}
      <div className="grid grid-cols-3 border-b border-[#D5E5D9] bg-white text-xs font-mono">
        <button
          onClick={() => setActiveTab(0)}
          className={`py-3 px-2 sm:px-3 text-left transition-colors relative flex items-center gap-1.5 sm:gap-2 focus-visible:outline-none border-b-2 ${
            activeTab === 0
              ? "bg-[#EAF3ED]/50 text-[#202824] font-semibold border-[#205C43]"
              : "text-[#69736D] hover:text-[#202824] border-transparent"
          }`}
        >
          <span
            className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold shrink-0 ${
              activeTab === 0
                ? "bg-[#205C43] text-white"
                : "bg-[#EAF3ED] text-[#69736D]"
            }`}
          >
            1
          </span>
          <span className="truncate text-[11px]">01 / Grievance</span>
        </button>

        <button
          onClick={() => setActiveTab(1)}
          className={`py-3 px-2 sm:px-3 text-left transition-colors relative flex items-center gap-1.5 sm:gap-2 focus-visible:outline-none border-b-2 ${
            activeTab === 1
              ? "bg-[#EAF3ED]/50 text-[#202824] font-semibold border-[#205C43]"
              : "text-[#69736D] hover:text-[#202824] border-transparent"
          }`}
        >
          <span
            className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold shrink-0 ${
              activeTab === 1
                ? "bg-[#205C43] text-white"
                : "bg-[#EAF3ED] text-[#69736D]"
            }`}
          >
            2
          </span>
          <span className="truncate text-[11px]">02 / Analysis</span>
        </button>

        <button
          onClick={() => setActiveTab(2)}
          className={`py-3 px-2 sm:px-3 text-left transition-colors relative flex items-center gap-1.5 sm:gap-2 focus-visible:outline-none border-b-2 ${
            activeTab === 2
              ? "bg-[#EAF3ED]/50 text-[#202824] font-semibold border-[#205C43]"
              : "text-[#69736D] hover:text-[#202824] border-transparent"
          }`}
        >
          <span
            className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold shrink-0 ${
              activeTab === 2
                ? "bg-[#205C43] text-white"
                : "bg-[#EAF3ED] text-[#69736D]"
            }`}
          >
            3
          </span>
          <span className="truncate text-[11px]">03 / Counsel</span>
        </button>
      </div>

      {/* Main Procedural Stage Display with Anchored Bottom Progression Bar */}
      <div className="p-5 sm:p-7 flex flex-col justify-between">
        <div className="min-h-[260px] sm:min-h-[240px] relative">
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
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#205C43] font-bold">
                    Stage 01 · Plain Language Inquiry
                  </span>
                  <span className="text-[11px] text-[#69736D] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#205C43]" /> Logged via Vernacular Intake
                  </span>
                </div>

                {/* Citizen Dispute Excerpt */}
                <div className="p-4 rounded-xl bg-[#EAF3ED]/30 border border-[#D5E5D9] text-xs space-y-2">
                  <div className="flex items-center gap-2 text-[#69736D] text-[11px] font-mono">
                    <FileText className="w-3.5 h-3.5 text-[#202824]" />
                    <span>Citizen Submission (Gurugram Project):</span>
                  </div>
                  <p className="text-[#202824] text-[13px] leading-relaxed italic font-serif">
                    &ldquo;The developer promised delivery by December 2024. It is now 14 months past deadline, no occupancy certificate has been issued, and they are demanding advance maintenance before handover.&rdquo;
                  </p>
                </div>

                {/* Extracted Metadata Grid */}
                <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="p-3 rounded-lg border border-[#D5E5D9] bg-white">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#69736D] block">
                      Domain Category
                    </span>
                    <span className="text-xs font-semibold text-[#202824] mt-0.5 block truncate">
                      RERA & Consumer
                    </span>
                  </div>
                  <div className="p-3 rounded-lg border border-[#D5E5D9] bg-white">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#69736D] block">
                      Limitation Period
                    </span>
                    <span className="text-xs font-semibold text-[#205C43] mt-0.5 block flex items-center gap-1 truncate">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#205C43] shrink-0" /> Active & Timely
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
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#205C43] font-bold">
                    Stage 02 · Statutory Issue & Forum Analysis
                  </span>
                  <span className="text-[11px] text-[#69736D] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#205C43]" /> Real Statutes
                  </span>
                </div>

                {/* Legal Roadmap Card */}
                <div className="p-4 rounded-xl bg-[#EAF3ED]/30 border border-[#D5E5D9] space-y-3">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#205C43] shrink-0" />
                    <span className="text-xs font-semibold text-[#202824] leading-snug">
                      Section 18, Real Estate (Regulation & Development) Act, 2016
                    </span>
                  </div>
                  <p className="text-xs text-[#69736D] leading-relaxed">
                    Litigant possesses right to either withdraw with full refund plus interest at SBI MCLR + 2%, or seek monthly delayed compensation.
                  </p>

                  <div className="pt-2 border-t border-[#D5E5D9] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[11px] font-mono">
                    <span className="text-[#69736D]">Statutory Forum:</span>
                    <span className="text-[#202824] font-semibold truncate">Haryana RERA (HARERA)</span>
                  </div>
                </div>

                {/* Procedural Checklist Preview */}
                <div className="space-y-1.5 text-xs text-[#69736D]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#202824] font-semibold block">
                    Filing Evidence Checklist:
                  </span>
                  <div className="flex items-center gap-2 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#205C43] shrink-0" />
                    <span className="truncate">Buyer-Builder Agreement with Clause 14</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#205C43] shrink-0" />
                    <span className="truncate">Bank disbursement statement verifying payments</span>
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
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#205C43] font-bold">
                    Stage 03 · Verified State Bar Council Counsel
                  </span>
                  <span className="text-[11px] text-[#69736D] flex items-center gap-1 font-mono">
                    <Lock className="w-3.5 h-3.5 text-[#205C43]" /> Escrow Secured
                  </span>
                </div>

                {/* Advocate Profile Highlight */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-[#D5E5D9] shadow-xs flex items-start justify-between gap-3 sm:gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center font-serif text-sm font-semibold text-[#205C43] shrink-0">
                      RS
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-sm font-semibold text-[#202824]">Adv. Rajesh Sharma</h4>
                        <span className="px-1.5 py-0.5 rounded bg-[#EAF3ED] border border-[#D5E5D9] text-[9px] font-mono text-[#205C43] font-semibold uppercase">
                          BCI Verified
                        </span>
                      </div>
                      <p className="text-xs text-[#69736D] mt-0.5 truncate">
                        Enrolment: D/1482/2009 · High Court & RERA
                      </p>
                      <div className="mt-1.5 flex items-center gap-2 text-[11px] font-mono text-[#69736D] flex-wrap">
                        <span>Hindi, English</span>
                        <span>·</span>
                        <span className="text-[#205C43] font-semibold">15 Cases Before HARERA</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm sm:text-base font-bold text-[#202824]">₹1,500</span>
                    <p className="text-[10px] text-[#69736D]">15-min fixed</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#EAF3ED]/40 border border-[#D5E5D9] text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] text-[#69736D]">
                    <ShieldCheck className="w-4 h-4 text-[#205C43] shrink-0" />
                    <span className="truncate">Digital Vakalatnama & Milestone Escrow Ready</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#205C43] font-semibold shrink-0 ml-2">
                    Zero Surprise Fees
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Contextual Progression Bar */}
        <div className="pt-4 mt-2 border-t border-[#D5E5D9] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-[11px] text-[#69736D]">
            <span>Click stages above to explore procedural path</span>
          </div>

          <Link
            href="/auth/login?intent=client"
            className="inline-flex items-center gap-1.5 font-semibold text-xs text-[#202824] hover:text-[#205C43] transition-colors"
          >
            <span>Proceed as Client</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
