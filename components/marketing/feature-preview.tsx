"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import {
  Search,
  ShieldCheck,
  CreditCard,
  Briefcase,
  Languages,
  CheckCircle2,
  FileText,
  Lock,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { FEATURES } from "@/lib/marketing/features-data";
import { LiveAIIntakeDemo } from "./live-ai-intake";
import { CountUp } from "@/components/ui/count-up";


interface FeaturePreviewProps {
  activeIndex: number;
}

export function FeaturePreview({ activeIndex }: FeaturePreviewProps) {
  const [currentTime, setCurrentTime] = useState<string>("08:12 IST");
  const [showNotice, setShowNotice] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  // Client-side live clock for New Delhi time without SSR mismatch
  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const timeStr = now.toLocaleTimeString("en-US", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        setCurrentTime(`${timeStr} IST`);
      } catch {
        setCurrentTime("12:00 IST");
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const feature = FEATURES[activeIndex] ?? FEATURES[0];

  const variants: Variants = {
    initial: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 24,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : -16,
      transition: { duration: 0.25, ease: "easeIn" },
    },
  };

  return (
    <div className="relative w-full rounded-xl bg-[#0C0F17]/95 border border-border-default shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] overflow-hidden transition-all duration-300 hover:border-border-strong">
      {/* Top Device Bar (dimension.dev inspired) */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border-subtle bg-[#090B10]/70 text-xs text-[#A5A3B2] select-none">
        <div className="flex items-center gap-3">
          {/* Subtle OS-style dots */}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-border-strong" />
            <span className="w-2.5 h-2.5 rounded-full bg-border-strong" />
            <span className="w-2.5 h-2.5 rounded-full bg-border-strong" />
          </div>
          <div className="h-3 w-px bg-border-strong" />
          {/* Time & Location Readout */}
          <div className="font-mono text-[11px] tracking-wide flex items-center gap-1.5 text-white/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">NEW DELHI</span>
            <span className="text-white/40">—</span>
            <span className="text-white/80">{currentTime}</span>
          </div>
        </div>

        {/* Notice Pill */}
        {showNotice && (
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#141824] border border-border-default text-[11px] text-white/70">
            <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
            <span>NyayaLink Access Initiative</span>
            <button
              onClick={() => setShowNotice(false)}
              className="text-white/40 hover:text-white transition-colors ml-1 text-xs"
              aria-label="Close Notice"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Feature Header Bar */}
      <div className="px-5 sm:px-7 pt-5 pb-3 flex items-center justify-between border-b border-border-subtle bg-surface-raised">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-white/60">
            {feature.number} {"//"}
          </span>
          <h2 className="text-sm font-medium text-white tracking-wide">
            {feature.title}
          </h2>
        </div>
        <span className="font-mono text-[11px] text-[#A5A3B2] uppercase tracking-wider hidden sm:inline-block">
          {feature.badge}
        </span>
      </div>

      {/* Dynamic Content Panel with Framer Motion AnimatePresence */}
      <div className="p-5 sm:p-7 min-h-[420px] sm:min-h-[460px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={feature.id}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            {activeIndex === 0 && <PreviewSearchMatch />}
            {activeIndex === 1 && <PreviewAILegalIntake />}
            {activeIndex === 2 && <PreviewTrackCase />}
            {activeIndex === 3 && <PreviewBookPay />}
            {activeIndex === 4 && <PreviewLawyerWorkspace />}
            {activeIndex === 5 && <PreviewVerifiedCompliant />}
            {activeIndex === 6 && <PreviewMultilingualSupport />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Subtle Frame Footer with Feature Highlights */}
      <div className="px-5 sm:px-7 py-3 border-t border-border-subtle bg-[#090B10]/50 flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#A5A3B2]">
        <div className="flex items-center gap-2">
          <span className="text-white/70 font-mono">✦ Feature Core:</span>
          <span>{feature.highlights[0]}</span>
        </div>
        <div className="font-mono text-[10px] text-white/40">
          Module {feature.number} of 07
        </div>
      </div>
    </div>
  );
}

// 01 Search & Match Preview
function PreviewSearchMatch() {
  return (
    <div className="space-y-4">
      {/* Mock Search Bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#121622] border border-border-default text-xs">
        <Search className="w-4 h-4 text-white/60" />
        <span className="text-white font-medium">
          Property Dispute · Tenancy Notice · Mumbai & Pune
        </span>
        <span className="ml-auto font-mono text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-500/30 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <CountUp to={480} suffix="+" /> Enrolled Advocates
        </span>
      </div>

      {/* Stamped Filter Chips */}
      <div className="flex flex-wrap gap-2 text-[11px]">
        <span className="px-2 py-0.5 rounded-lg bg-[#C5A059]/10 text-[#DFBE7E] border border-[#C5A059]/30 text-[10px] font-mono uppercase tracking-wider font-semibold flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-[#C5A059]" /> BCI Verified
        </span>
        <span className="px-2.5 py-0.5 rounded-lg bg-surface-raised text-[#A5A3B2] border border-border-default text-[11px]">
          Civil & RERA
        </span>
        <span className="px-2.5 py-0.5 rounded-lg bg-surface-raised text-[#A5A3B2] border border-border-default text-[11px]">
          Hindi & Marathi
        </span>
        <span className="px-2.5 py-0.5 rounded-lg bg-surface-raised text-[#A5A3B2] border border-border-default text-[11px]">
          Fixed Fee Only
        </span>
      </div>

      {/* Mock Lawyer Cards with Stamped Badges */}
      <div className="grid grid-cols-1 gap-3 pt-1">
        {/* Lawyer 1 */}
        <div className="p-3.5 rounded-xl bg-[#141824]/90 border border-border-default hover:border-border-strong transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#252E46] to-[#121622] flex items-center justify-center font-serif text-sm font-semibold text-white border border-border-default">
                RS
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold text-white">
                    Adv. Rajesh Sharma
                  </h3>
                  <span className="px-1.5 py-0.5 rounded-lg bg-[#C5A059]/10 border border-[#C5A059]/30 text-[9px] font-mono text-[#DFBE7E] uppercase tracking-wider flex items-center gap-1 font-semibold">
                    <ShieldCheck className="w-2.5 h-2.5 text-[#C5A059]" /> BCI VERIFIED · D/1429
                  </span>
                </div>
                <p className="text-[11px] text-[#A5A3B2] mt-0.5">
                  Supreme Court of India & High Court of Delhi · 18 yrs exp
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-white">₹1,500</span>
              <p className="text-[10px] text-white/40">15-min assessment</p>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] text-white/60">
            <span>Specialization: Tenancy, Commercial Evictions, RERA</span>
            <span className="text-white/80 font-medium flex items-center gap-1">
              Available 3:30 PM <ChevronRight className="w-3 h-3 text-white/60" />
            </span>
          </div>
        </div>

        {/* Lawyer 2 */}
        <div className="p-3.5 rounded-xl bg-[#141824]/90 border border-border-default hover:border-border-strong transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2A2338] to-[#14121E] flex items-center justify-center font-serif text-sm font-semibold text-white border border-border-default">
                MS
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold text-white">
                    Adv. Meera Sen
                  </h3>
                  <span className="px-1.5 py-0.5 rounded-lg bg-[#C5A059]/10 border border-[#C5A059]/30 text-[9px] font-mono text-[#DFBE7E] uppercase tracking-wider flex items-center gap-1 font-semibold">
                    <ShieldCheck className="w-2.5 h-2.5 text-[#C5A059]" /> BCI VERIFIED · MAH/3120
                  </span>
                </div>
                <p className="text-[11px] text-[#A5A3B2] mt-0.5">
                  Bombay High Court & NCLT · 12 yrs exp · Marathi, Hindi
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-white">₹1,200</span>
              <p className="text-[10px] text-white/40">15-min assessment</p>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] text-white/60">
            <span>Specialization: Contract Law, Recovery Notices, Consumer</span>
            <span className="text-white/80 font-medium flex items-center gap-1">
              Available Tomorrow <ChevronRight className="w-3 h-3 text-white/60" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 02 AI Legal Intake Preview (Live Scripted Demo)
function PreviewAILegalIntake() {
  return <LiveAIIntakeDemo />;
}


// 03 Track Your Case Preview
function PreviewTrackCase() {
  return (
    <div className="space-y-3.5">
      {/* Case Header */}
      <div className="p-3 rounded-xl bg-[#141824] border border-border-default flex items-center justify-between">
        <div>
          <span className="font-mono text-[10px] text-white/60 uppercase tracking-wider">
            Case Vault #NL-2026-9042
          </span>
          <h3 className="text-xs font-semibold text-white">
            Commercial Tenancy Deposit Recovery
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
          Pre-Litigation Stage
        </span>
      </div>

      {/* Stepper Timeline */}
      <div className="space-y-2.5 pl-2 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-px before:bg-border-default">
        {/* Step 1 */}
        <div className="flex items-start gap-3 relative">
          <div className="w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-[#0C0F17] mt-0.5" />
          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-medium text-white">
                Formal Demand Notice Dispatched
              </span>
              <span className="text-[10px] font-mono text-white/40">
                Oct 12, 2026
              </span>
            </div>
            <p className="text-[11px] text-[#A5A3B2]">
              Sent via Speed Post (Track: ED8839201IN) with digital receipt.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start gap-3 relative">
          <div className="w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-[#0C0F17] mt-0.5" />
          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-medium text-white">
                Opposing Party Response Received
              </span>
              <span className="text-[10px] font-mono text-white/40">
                Oct 28, 2026
              </span>
            </div>
            <p className="text-[11px] text-[#A5A3B2]">
              Assessed by Adv. Rajesh Sharma — Partial refusal noted.
            </p>
          </div>
        </div>

        {/* Step 3 (Active) */}
        <div className="flex items-start gap-3 relative">
          <div className="w-3 h-3 rounded-full bg-white ring-4 ring-white/20 animate-pulse mt-0.5" />
          <div className="flex-1 text-xs p-2 rounded-xl bg-surface-raised border border-border-strong">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">
                Mediation Session Scheduled
              </span>
              <span className="text-[10px] font-mono text-white/60">
                Nov 08 · In 4 Days
              </span>
            </div>
            <p className="text-[11px] text-white/80 mt-0.5">
              Online joint conciliation hearing with certified mediator.
            </p>
          </div>
        </div>
      </div>

      {/* Document Vault chip */}
      <div className="p-2 rounded-lg bg-black/40 border border-border-subtle flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2 text-white/80">
          <FileText className="w-3.5 h-3.5 text-white/60" />
          <span>Demand_Notice_Signed_Stamped.pdf</span>
        </div>
        <span className="text-[10px] font-mono text-white/40">SHA-256 Valid</span>
      </div>
    </div>
  );
}

// 04 Book & Pay Preview
function PreviewBookPay() {
  return (
    <div className="space-y-3.5">
      <div className="p-4 rounded-xl bg-[#141824] border border-border-default space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-white/60" />
            <h3 className="text-xs font-semibold text-white">
              Transparent Legal Fee Statement
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-500/20">
            100% Escrow Protected
          </span>
        </div>

        {/* Itemized list */}
        <div className="space-y-2 text-xs divide-y divide-border-subtle">
          <div className="flex justify-between items-center pt-1 text-[#A5A3B2]">
            <span>15-Minute Preliminary Case Assessment</span>
            <span className="font-mono text-white">₹1,200</span>
          </div>
          <div className="flex justify-between items-center pt-2 text-[#A5A3B2]">
            <span>Statutory Demand Notice Drafting & Review</span>
            <span className="font-mono text-white">₹3,500</span>
          </div>
          <div className="flex justify-between items-center pt-2 text-[#A5A3B2]">
            <span>Postal Speed Post Registration & A/D Card</span>
            <span className="font-mono text-white">₹250</span>
          </div>
          <div className="flex justify-between items-center pt-2 font-semibold text-white">
            <span className="text-white">Total Milestone Escrow</span>
            <span className="font-mono text-white text-sm">₹4,950</span>
          </div>
        </div>
      </div>

      {/* Escrow Guarantee Banner */}
      <div className="p-3 rounded-xl bg-[#090B10] border border-border-strong flex items-start gap-3">
        <Lock className="w-4 h-4 text-white/70 shrink-0 mt-0.5" />
        <div className="text-[11px] leading-relaxed">
          <p className="font-medium text-white">Milestone-Gated Release</p>
          <p className="text-[#A5A3B2]">
            Funds remain in escrow. Payment is released to your advocate only
            after you confirm receipt of the drafted legal notice copy.
          </p>
        </div>
      </div>
    </div>
  );
}

// 05 Lawyer Workspace Preview
function PreviewLawyerWorkspace() {
  return (
    <div className="space-y-3.5">
      {/* Workspace Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-white/60" />
          <span className="text-xs font-semibold text-white">
            Advocate Studio · Delhi HC Bar
          </span>
        </div>
        <span className="text-[10px] font-mono text-white/50">
          Enr: D/1429/2006
        </span>
      </div>

      {/* Cause List Sync */}
      <div className="p-3 rounded-xl bg-[#141824] border border-border-default space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-white flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-white/60" />
            Today&apos;s Cause List
          </span>
          <span className="text-[10px] font-mono text-emerald-400">
            e-Courts Synced
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="p-2 rounded-lg bg-black/40 border border-border-subtle flex items-center justify-between text-[11px]">
            <div>
              <span className="text-white font-medium">Court 14 · Item #19</span>
              <p className="text-[10px] text-white/40">
                Sharma v. Capital Realty (Interim Stay)
              </p>
            </div>
            <span className="font-mono text-[10px] text-emerald-400">
              10:45 AM
            </span>
          </div>

          <div className="p-2 rounded-lg bg-black/40 border border-border-subtle flex items-center justify-between text-[11px]">
            <div>
              <span className="text-white font-medium">Court 03 · Item #31</span>
              <p className="text-[10px] text-white/40">
                Mehta Packaging (Bail Hearing)
              </p>
            </div>
            <span className="font-mono text-[10px] text-white/50">
              02:15 PM
            </span>
          </div>
        </div>
      </div>

      {/* Digital Vakalatnama & Intake Queue */}
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="p-2.5 rounded-lg bg-[#121622] border border-border-subtle">
          <span className="text-white/60 block text-[10px]">Active Briefs</span>
          <span className="text-base font-bold text-white font-mono">
            <CountUp to={18} />
          </span>
          <span className="text-emerald-400 text-[10px] block">
            +3 new intakes
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-[#121622] border border-border-subtle">
          <span className="text-white/60 block text-[10px]">
            Digital Vakalatnama
          </span>
          <span className="text-base font-bold text-white font-mono">
            e-Signed
          </span>
          <span className="text-white/40 text-[10px] block">Aadhaar verified</span>
        </div>
      </div>
    </div>
  );
}

// 06 Verified & Compliant Preview
function PreviewVerifiedCompliant() {
  return (
    <div className="space-y-3.5">
      {/* Trust Badge (Category 2: Stamped Gold Credential) */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-[#181D2A] to-[#0D101A] border border-[#C5A059]/30 text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/40 flex items-center justify-center mx-auto text-[#DFBE7E]">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xs font-semibold text-white">
            Bar Council of India Verification Shield
          </h3>
          <p className="text-[11px] text-[#A5A3B2] max-w-sm mx-auto mt-0.5">
            Every enrolled advocate undergoes credential validation against
            official State Bar Council rolls before joining the platform.
          </p>
        </div>
      </div>

      {/* Compliance Points */}
      <div className="space-y-2 text-xs">
        <div className="p-2.5 rounded-lg bg-[#121622] border border-border-subtle flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-white/60 shrink-0" />
          <span className="text-white/80 text-[11px]">
            <strong className="text-white">Advocates Act 1961 (Sec 36):</strong>{" "}
            Zero advertisement or unlawful touting. Strictly neutral directory.
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-[#121622] border border-border-subtle flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-white/60 shrink-0" />
          <span className="text-white/80 text-[11px]">
            <strong className="text-white">Privileged Communications:</strong>{" "}
            End-to-end 256-bit AES encryption protecting all case notes.
          </span>
        </div>
      </div>
    </div>
  );
}

// 07 Multilingual Support Preview
function PreviewMultilingualSupport() {
  return (
    <div className="space-y-3.5">
      {/* Vernacular Language Chips */}
      <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-white/60" />
          <span className="text-xs font-semibold text-white">
            Regional Dialect Engine
          </span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400">
          6 Languages Active
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 text-[11px]">
        {["हिंदी (Hindi)", "मराठी (Marathi)", "தமிழ் (Tamil)", "বাংলা (Bengali)", "తెలుగు (Telugu)", "English"].map(
          (lang, i) => (
            <span
              key={lang}
              className={`px-2.5 py-1 rounded-full border text-[11px] font-medium transition-colors ${
                i === 0
                  ? "bg-surface-hover text-white border-border-strong"
                  : "bg-surface-raised text-white/70 border-border-default"
              }`}
            >
              {lang}
            </span>
          )
        )}
      </div>

      {/* Voice Waveform Interactive Mock */}
      <div className="p-3.5 rounded-xl bg-[#141824] border border-border-default space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
            <span className="text-white font-medium">
              Voice-First Legal Intake
            </span>
          </div>
          <span className="font-mono text-[10px] text-[#A5A3B2]">
            Hindi Audio · 00:08
          </span>
        </div>

        {/* Audio Waveform visualization */}
        <div className="h-8 bg-black/40 rounded-lg flex items-center justify-center gap-1 px-4">
          {[40, 65, 80, 50, 90, 75, 45, 85, 95, 60, 70, 80, 55, 90, 65, 40].map(
            (h, idx) => (
              <span
                key={idx}
                className="w-1 bg-white/80 rounded-full transition-all duration-300"
                style={{ height: `${h}%` }}
              />
            )
          )}
        </div>

        <p className="text-[11px] text-[#A5A3B2] italic">
          &ldquo;मेरे ज़मीन के कागजात में नाम सुधार करवाना है, क्या प्रक्रिया
          होगी?&rdquo;
        </p>

        <div className="p-2 rounded-lg bg-black/30 border border-border-subtle text-[11px] text-white/80 flex items-center justify-between">
          <span>Automatic De-Jargonization:</span>
          <span className="font-mono text-white text-[10px]">
            Land Revenue Act Sec 32
          </span>
        </div>
      </div>
    </div>
  );
}
