import React from "react";
import { ChatInterface } from "@/components/intake/chat-interface";
import { Scale, ShieldCheck, Lock, Sparkles } from "lucide-react";

export default function IntakePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Page Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#191923] border border-white/[0.08] text-xs font-mono text-[#DFBE7E]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
          <span>04 / CONFIDENTIAL LEGAL INTAKE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white tracking-tight leading-[1.15] text-balance">
          Plain-Language Legal Clarity & Remedies
        </h1>
        <p className="text-sm sm:text-base text-[#A5A3B2] leading-relaxed">
          Describe your issue in your everyday language. NyayaAI outlines the relevant
          statutory provisions under Bharatiya Nyaya Sanhita, procedural codes, and state
          regulations, helping you prepare before meeting an advocate.
        </p>

        {/* Guarantees Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-[#A5A3B2]">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <Lock className="w-3.5 h-3.5 text-[#C5A059]" />
            <span className="text-white/90">Zero Identity Logging</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <Scale className="w-3.5 h-3.5 text-[#C5A059]" />
            <span className="text-white/90">Section 36 Compliant (No Touting)</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-white/90">General Legal Information</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Chat Interface */}
      <ChatInterface />
    </div>
  );
}
