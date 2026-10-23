import React from "react";
import { ChatInterface } from "@/components/intake/chat-interface";
import { ShieldCheck, Lock } from "lucide-react";

export default function IntakePage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 space-y-3 sm:space-y-4">
      {/* Page Header - Refined, Compact, and Confident */}
      <div className="max-w-3xl mx-auto text-center space-y-1.5 pt-1 sm:pt-2 pb-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF3ED] border border-[#D5E5D9] text-[10.5px] font-mono font-semibold text-[#205C43]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#205C43] animate-pulse" />
          <span>CONFIDENTIAL LEGAL INTAKE</span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-serif font-semibold text-[#174530] tracking-tight leading-snug">
          Let&apos;s understand your legal situation
        </h1>

        <p className="text-xs sm:text-sm text-[#69736D] max-w-2xl mx-auto leading-relaxed">
          The assistant helps you organise what happened, identify relevant Indian statutes, and understand possible next steps before speaking with an advocate.
        </p>

        {/* Subtle Trust Indicators */}
        <div className="flex items-center justify-center gap-4 pt-1 text-[11px] text-[#69736D]">
          <span className="inline-flex items-center gap-1">
            <Lock className="w-3 h-3 text-[#205C43]" />
            <span>Private &amp; Non-identifying</span>
          </span>
          <span className="text-[#D5E5D9]">•</span>
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#205C43]" />
            <span>Indian Statutory Framework Grounded</span>
          </span>
        </div>
      </div>

      {/* Main Interactive AI Intake Workspace */}
      <ChatInterface />
    </div>
  );
}
