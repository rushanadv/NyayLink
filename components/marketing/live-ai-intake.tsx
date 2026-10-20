"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";
import { Sparkles, Scale, FileText, CheckCircle2 } from "lucide-react";

export interface AIIntakeScenario {
  id: string;
  category: string;
  groundingTag: string;
  userQuery: string;
  legalRightsTitle: string;
  legalRightsBody: string;
  recommendedRemedy: string;
  limitationPeriod: string;
  primaryAction: string;
  secondaryAction: string;
}

export const AI_INTAKE_SCENARIOS: AIIntakeScenario[] = [
  {
    id: "tenancy-deposit",
    category: "Tenancy & Security Deposit",
    groundingTag: "Model Tenancy Act & Contract Act Grounded",
    userQuery:
      "My landlord has withheld my ₹85,000 security deposit for 5 months without explanation or damages list. What legal notice can I send?",
    legalRightsTitle: "Statutory Rights Under Model Tenancy Provisions",
    legalRightsBody:
      "Under Section 73 of the Indian Contract Act and Model Tenancy regulations, a lessor cannot withhold caution money without tendering an itemized defect assessment within 30 days of surrender of premises.",
    recommendedRemedy: "Statutory 15-Day Demand Notice",
    limitationPeriod: "3 Years from default date",
    primaryAction: "Draft Legal Notice",
    secondaryAction: "Translate to Hindi (हिंदी)",
  },
  {
    id: "rera-delayed-possession",
    category: "Real Estate & RERA",
    groundingTag: "RERA Section 18 & Consumer Protection Grounded",
    userQuery:
      "My builder delayed flat possession by 14 months past the RERA agreement date without an occupancy certificate. Can I seek a full refund?",
    legalRightsTitle: "Statutory Rights Under RERA Section 18",
    legalRightsBody:
      "Section 18 of RERA, 2016 guarantees an allottee the unqualified option to claim a 100% refund with interest at SBI MCLR + 2%, or monthly interest for each month of continued delay until physical possession.",
    recommendedRemedy: "RERA Form 'M' Complaint & Recovery Warrant",
    limitationPeriod: "Continuous cause of action until actual possession",
    primaryAction: "File RERA Complaint",
    secondaryAction: "Calculate Delay Interest",
  },
  {
    id: "cheque-bounce-138",
    category: "Commercial & Banking Law",
    groundingTag: "Section 138 Negotiable Instruments Act Grounded",
    userQuery:
      "A commercial client's cheque for ₹3,40,000 bounced with remark 'Funds Insufficient'. What is the mandatory legal procedure to recover?",
    legalRightsTitle: "Criminal Remedy Under Section 138 NI Act",
    legalRightsBody:
      "Issuance of a formal statutory legal demand notice within 30 days of receiving the cheque return memo is a mandatory prerequisite. If payment is not cleared within 15 days of receipt, a criminal complaint lies before the Judicial Magistrate.",
    recommendedRemedy: "Section 138 Statutory Demand Notice",
    limitationPeriod: "Notice within 30 days; complaint within 30 days thereafter",
    primaryAction: "Generate Section 138 Notice",
    secondaryAction: "Track 15-Day Window",
  },
];

type DemoPhase = "typing" | "thinking" | "card-intro" | "details" | "holding";

export function LiveAIIntakeDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { amount: 0.3 });
  const shouldReduceMotion = useReducedMotion();

  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [typedChars, setTypedChars] = useState(0);
  const [phase, setPhase] = useState<DemoPhase>("typing");

  const currentScenario = AI_INTAKE_SCENARIOS[scenarioIndex];

  useEffect(() => {
    // If user prefers reduced motion, show full card and rotate slowly
    if (shouldReduceMotion) {
      setTypedChars(currentScenario.userQuery.length);
      setPhase("details");
      const interval = setInterval(() => {
        setScenarioIndex((prev) => (prev + 1) % AI_INTAKE_SCENARIOS.length);
      }, 6000);
      return () => clearInterval(interval);
    }

    if (!isInView) {
      return;
    }

    let timer: NodeJS.Timeout;

    if (phase === "typing") {
      if (typedChars < currentScenario.userQuery.length) {
        timer = setTimeout(() => {
          setTypedChars((prev) => prev + 1);
        }, 20); // ~20ms per character
      } else {
        timer = setTimeout(() => {
          setPhase("thinking");
        }, 250);
      }
    } else if (phase === "thinking") {
      timer = setTimeout(() => {
        setPhase("card-intro");
      }, 750); // 750ms thinking delay
    } else if (phase === "card-intro") {
      timer = setTimeout(() => {
        setPhase("details");
      }, 350); // slight stagger before remedy & limitation values appear
    } else if (phase === "details") {
      timer = setTimeout(() => {
        setPhase("holding");
      }, 100);
    } else if (phase === "holding") {
      timer = setTimeout(() => {
        // Crossfade to next example
        setTypedChars(0);
        setPhase("typing");
        setScenarioIndex((prev) => (prev + 1) % AI_INTAKE_SCENARIOS.length);
      }, 4000); // Hold for ~4s
    }

    return () => clearTimeout(timer);
  }, [
    isInView,
    phase,
    typedChars,
    currentScenario.userQuery.length,
    shouldReduceMotion,
  ]);

  const displayedText = shouldReduceMotion
    ? currentScenario.userQuery
    : currentScenario.userQuery.slice(0, typedChars);

  return (
    <div ref={containerRef} className="space-y-3.5 select-none">
      {/* Bot Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#C5A059]/20 flex items-center justify-center text-[#C5A059]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-medium text-white">
            NyayaAI Intake Assistant
          </span>
        </div>
        <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
          {currentScenario.groundingTag}
        </span>
      </div>

      {/* Scripted Live Chat Thread */}
      <div className="space-y-3 text-xs min-h-[350px]">
        {/* User Query Bubble */}
        <div className="ml-auto max-w-[90%] p-3.5 rounded-2xl rounded-tr-sm bg-[#1C2234] border border-white/10 text-white/95 shadow-md">
          <p className="leading-relaxed font-normal">
            &ldquo;{displayedText}&rdquo;
            {phase === "typing" && !shouldReduceMotion && (
              <span className="inline-block w-1.5 h-3.5 bg-[#C5A059] ml-1 animate-pulse" />
            )}
          </p>
        </div>

        {/* Thinking Indicator State */}
        {phase === "thinking" && !shouldReduceMotion && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mr-auto flex items-center gap-2 px-3 py-2 rounded-xl bg-[#121622] border border-white/[0.08] text-[#DFBE7E]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059] animate-spin" />
            <span className="text-[11px] font-mono">Analyzing statutory provisions...</span>
            <div className="flex items-center gap-1 pl-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-bounce" />
            </div>
          </motion.div>
        )}

        {/* AI Response Card (Fades & slides in, opacity/transform only) */}
        {(phase === "card-intro" || phase === "details" || phase === "holding" || shouldReduceMotion) && (
          <motion.div
            key={currentScenario.id}
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mr-auto max-w-[96%] p-4 rounded-2xl rounded-tl-sm bg-[#121622] border border-[#C5A059]/30 space-y-3 shadow-xl"
          >
            {/* Legal Clarity Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#DFBE7E] text-[11px] font-semibold">
                <Scale className="w-3.5 h-3.5" />
                <span>{currentScenario.legalRightsTitle}</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-500/20">
                Verified Code
              </span>
            </div>

            {/* Legal Analysis Body */}
            <p className="text-[#A5A3B2] leading-relaxed text-[11px]">
              {currentScenario.legalRightsBody}
            </p>

            {/* Staggered Remedy & Limitation Values */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: shouldReduceMotion ? 0 : 0.15 }}
              className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1.5 text-[11px]"
            >
              <div className="flex items-center justify-between text-white/90">
                <span className="text-white/60">Recommended Remedy:</span>
                <span className="text-emerald-400 font-mono font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {currentScenario.recommendedRemedy}
                </span>
              </div>
              <div className="flex items-center justify-between text-white/70 text-[10px]">
                <span className="text-white/50">Statutory Limitation:</span>
                <span className="font-mono text-[#DFBE7E]">
                  {currentScenario.limitationPeriod}
                </span>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, delay: shouldReduceMotion ? 0 : 0.25 }}
              className="flex flex-wrap items-center gap-2 pt-1"
            >
              <span className="px-3 py-1 rounded bg-[#C5A059] text-[#090B10] font-semibold text-[10px] shadow-sm">
                {currentScenario.primaryAction}
              </span>
              <span className="px-2.5 py-1 rounded bg-white/10 text-white/90 text-[10px] border border-white/10">
                {currentScenario.secondaryAction}
              </span>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Progress Indicator for Scenarios */}
      <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-white/40 border-t border-white/[0.04]">
        <span>
          Scenario {scenarioIndex + 1} of {AI_INTAKE_SCENARIOS.length}
        </span>
        <div className="flex items-center gap-1.5">
          {AI_INTAKE_SCENARIOS.map((s, idx) => (
            <span
              key={s.id}
              className={`h-1 rounded-full transition-all duration-300 ${
                idx === scenarioIndex
                  ? "w-4 bg-[#C5A059]"
                  : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
