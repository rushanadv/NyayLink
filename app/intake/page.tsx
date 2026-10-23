import React from "react";
import { ChatInterface } from "@/components/intake/chat-interface";
import { Scale, ShieldCheck, Lock } from "lucide-react";

export default function IntakePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
      {/* Page Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#EAF3ED] border border-[#D5E5D9] text-xs font-mono font-semibold text-[#205C43]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#205C43] animate-pulse" />
          <span>CONFIDENTIAL LEGAL INTAKE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#202824] tracking-tight leading-[1.15] text-balance">
          Plain-Language Legal Clarity & Remedies
        </h1>
        <p className="text-sm sm:text-base text-[#69736D] leading-relaxed">
          Describe your issue in your everyday language. Nyay AI outlines the relevant
          statutory provisions under Bharatiya Nyaya Sanhita, procedural codes, and state
          regulations, helping you prepare before meeting an advocate.
        </p>

        {/* Guarantees Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-[#69736D]">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#D5E5D9] shadow-xs">
            <Lock className="w-3.5 h-3.5 text-[#205C43]" />
            <span className="text-[#202824] font-medium">Zero Identity Logging</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#D5E5D9] shadow-xs">
            <Scale className="w-3.5 h-3.5 text-[#205C43]" />
            <span className="text-[#202824] font-medium">Section 36 Compliant (No Touting)</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#D5E5D9] shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#205C43]" />
            <span className="text-[#202824] font-medium">General Legal Information</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Chat Interface */}
      <ChatInterface />
    </div>
  );
}
