"use client";

import Link from "next/link";
import {
  Sparkles,
  ShieldAlert,
  ArrowRight,
  FileCheck2,
  Scale,
  BrainCircuit,
  MessageSquare,
} from "lucide-react";

export function IntakeTab() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#D5E5D9]">
        <h1 className="text-xl sm:text-2xl font-serif font-semibold text-[#202824]">
          Nyay AI Preconsultation & Triage
        </h1>
        <p className="text-xs text-[#69736D] mt-1">
          Structure your case facts, analyze Indian statutory provisions, and prepare lawyer-ready dockets.
        </p>
      </div>

      {/* Mandatory Statutory Disclaimer Card */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <span className="font-semibold text-amber-950 uppercase font-mono tracking-wider text-[11px]">
            Legal Information Disclaimer (Advocates Act, 1961)
          </span>
          <p className="leading-relaxed text-amber-800 text-[11px]">
            Nyay AI generates legal information, procedural summaries, and organizational briefs based on Indian legal statutes and precedents. It does not provide legal representation, nor does it establish an advocate-client privileged relationship. Always consult a verified State Bar Council advocate before executing statutory notices or court filings.
          </p>
        </div>
      </div>

      {/* Intake Launch Hero */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#F4FAF6] via-[#FFFFFF] to-[#EAF3ED] border border-[#D5E5D9] shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#205C43] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-serif font-semibold text-[#202824]">
              Start an Interactive AI Preconsultation
            </h2>
            <p className="text-xs text-[#69736D]">
              Conversational legal diagnosis powered by Indian statutory legal models
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-white border border-[#D5E5D9] space-y-2">
            <BrainCircuit className="w-4 h-4 text-[#205C43]" />
            <h4 className="text-xs font-semibold text-[#202824]">1. Fact Structuring</h4>
            <p className="text-[11px] text-[#69736D] leading-relaxed">
              Answer structured clarifying questions regarding dates, transaction amounts, contracts, and involved parties.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#D5E5D9] space-y-2">
            <Scale className="w-4 h-4 text-[#205C43]" />
            <h4 className="text-xs font-semibold text-[#202824]">2. Statutory Grounding</h4>
            <p className="text-[11px] text-[#69736D] leading-relaxed">
              Reference applicable Indian sections across BNS, BNSS, CPC, Indian Contract Act, RERA, and consumer regulations.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#D5E5D9] space-y-2">
            <FileCheck2 className="w-4 h-4 text-[#205C43]" />
            <h4 className="text-xs font-semibold text-[#202824]">3. Docket Generation</h4>
            <p className="text-[11px] text-[#69736D] leading-relaxed">
              Export a concise case memo ready to share directly with your retained advocate or file as a new matter.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-4">
          <Link
            href="/intake"
            className="px-5 py-2.5 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs active:scale-[0.99]"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Launch AI Preconsultation Assistant</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <span className="text-xs text-[#69736D]">
            Available 24/7 · Confidential & encrypted
          </span>
        </div>
      </div>
    </div>
  );
}
