import React from "react";
import { ChatInterface } from "@/components/intake/chat-interface";
import { Shield, Sparkles } from "lucide-react";

export default function IntakePage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 pt-6 sm:pt-10 pb-12 space-y-4 sm:space-y-6">
      {/* Page Header - Restrained, Honest, and Clear */}
      <div className="max-w-3xl mx-auto text-center space-y-2 pb-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF3ED] border border-[#D5E5D9] text-[11px] font-mono font-semibold text-[#205C43]">
          <Sparkles className="w-3.5 h-3.5 text-[#205C43]" />
          <span>AI LEGAL PRECONSULTATION</span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-serif font-semibold text-[#174530] tracking-tight leading-snug">
          Let&apos;s understand your legal situation
        </h1>

        <p className="text-xs sm:text-sm text-[#69736D] max-w-2xl mx-auto leading-relaxed">
          The assistant helps you organize what happened, structure your facts, and understand relevant Indian statutory provisions before consulting an enrolled advocate.
        </p>

        {/* Informational Disclaimer Strip */}
        <div className="inline-flex items-center justify-center gap-2 pt-1 text-[11.5px] text-[#69736D]">
          <Shield className="w-3.5 h-3.5 text-[#205C43]" />
          <span>Informational orientation under Indian law — not formal legal advice</span>
        </div>
      </div>

      {/* Main Interactive AI Intake Workspace */}
      <ChatInterface />
    </div>
  );
}
