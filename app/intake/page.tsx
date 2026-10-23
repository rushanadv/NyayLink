import React from "react";
import { ChatInterface } from "@/components/intake/chat-interface";
import { ShieldCheck, Lock } from "lucide-react";

export default function IntakePage() {
  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 space-y-2.5 sm:space-y-3">
      {/* Page Header - Compact & Deliberately Composed */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 pb-1">
        <div className="space-y-0.5 sm:space-y-1 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF3ED] border border-[#D5E5D9] text-[10px] font-mono font-semibold text-[#205C43]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#205C43] animate-pulse" />
            <span>CONFIDENTIAL AI LEGAL INTAKE</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif text-[#202824] tracking-tight leading-tight">
            Plain-Language Legal Orientation
          </h1>
          <p className="text-xs text-[#69736D] leading-normal line-clamp-2 sm:line-clamp-none">
            Describe your dispute, notice, or legal question in everyday words for statutory guidance under Indian law.
          </p>
        </div>

        {/* Compact Trust Guarantees */}
        <div className="hidden sm:flex flex-wrap items-center gap-2 text-[11px] text-[#69736D] shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-[#D5E5D9] shadow-2xs">
            <Lock className="w-3 h-3 text-[#205C43]" />
            <span className="text-[#202824] font-medium">Zero Identity Logging</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-[#D5E5D9] shadow-2xs">
            <ShieldCheck className="w-3 h-3 text-[#205C43]" />
            <span className="text-[#202824] font-medium">BCI Sec. 36 Compliant</span>
          </div>
        </div>
      </div>

      {/* Main Interactive AI Intake Workspace */}
      <ChatInterface />
    </div>
  );
}
