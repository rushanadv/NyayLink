"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useInView, type Variants } from "framer-motion";
import { CountUp } from "@/components/ui/count-up";
import { ParticleImage } from "@/components/effects/particle-image";
import { MomentumRing } from "@/components/effects/momentum-ring";
import {
  ArrowRight,
  ShieldCheck,
  Scale,
  Sparkles,
  CheckCircle2,
  Lock,
  Search,
  Mic,
} from "lucide-react";

/**
 * ScrollSyncedPreview
 * Synchronizes preview panels with viewport entry/exit:
 * Enter: opacity 0 -> 1, y 24px -> 0px over 400ms (easeOut)
 * Exit: opacity 1 -> 0, y 0px -> -16px over 250ms (easeIn)
 */
function ScrollSyncedPreview({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount: 0.4 });

  const previewVariants: Variants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 24,
      transition: { duration: 0.25, ease: "easeIn" },
    },
    visible: {
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
    <motion.div
      ref={ref}
      variants={previewVariants}
      initial="hidden"
      animate={isInView ? "visible" : "exit"}
      className={className}
    >
      {children}
    </motion.div>
  );
}


export function SectionStubs() {
  const shouldReduceMotion = useReducedMotion();

  const sectionVariants: Variants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 28,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.65,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="w-full space-y-28 lg:space-y-40 pb-28">
      {/* SECTION 02: The Challenge */}
      <motion.section
        id="problem"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-70px" }}
        variants={sectionVariants}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28"
      >
        <div className="py-6 sm:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column: Challenge Description */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em]">
                <span className="w-4 h-px bg-[#C5A059]" />
                <span className="text-white/60 font-semibold">02</span>
                <span className="text-white/30">{"//"}</span>
                <span className="text-white/80 font-medium">THE CHALLENGE</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white font-normal leading-[1.12] tracking-tight text-balance">
                5.1 Crore pending cases.
                <span className="block text-white/80 font-light mt-1">
                  Zero transparent pricing.
                </span>
              </h2>

              <p className="text-[13px] sm:text-sm text-[#9491A1] leading-relaxed max-w-xl">
                Navigating Indian courts still relies on tout networks, opaque clerk fees,
                and dense statutory English. NyayLink establishes open technological infrastructure:
                algorithmic lawyer matching, cross-validated Bar Council rolls, and plain-language intake.
              </p>
            </div>

            {/* Right Column: Particle Scales of Justice Visual */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 text-center select-none">
              <ParticleImage size={240} />
              <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-white/60">
                From procedural confusion to structured legal clarity
              </p>
            </div>
          </div>

          {/* Scale-Contrast Hero Stats Row (Borderless, Dramatic Editorial Type Scale) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-14 pt-10 border-t border-border-default">
            {/* Flagship Stat: 5.1 Cr+ */}
            <div className="md:col-span-5 space-y-2">
              <div className="font-serif text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-normal text-white tracking-tight leading-none">
                <CountUp to={5.1} decimals={1} suffix=" Cr" />
              </div>
              <p className="font-medium text-white text-sm sm:text-base tracking-tight pt-1">
                Pending matters across subordinate & appellate courts
              </p>
              <p className="text-[11px] font-mono text-white/60">
                Source: National Judicial Data Grid (NJDG), 2024
              </p>
            </div>

            {/* Secondary Stat: 84% */}
            <div className="md:col-span-4 space-y-2">
              <div className="font-serif text-5xl sm:text-6xl lg:text-7xl font-normal text-white/90 tracking-tight leading-none">
                <CountUp to={84} suffix="%" />
              </div>
              <p className="font-medium text-white/80 text-sm tracking-tight pt-1">
                Litigants citing statutory jargon as their primary barrier
              </p>
              <p className="text-[11px] font-mono text-white/40">
                Vidhi Centre Access to Justice survey benchmark (directional)
              </p>
            </div>

            {/* Platform Guarantee: 100% */}
            <div className="md:col-span-3 space-y-2">
              <div className="font-serif text-5xl sm:text-6xl lg:text-7xl font-normal text-white/90 tracking-tight leading-none">
                <CountUp to={100} suffix="%" />
              </div>
              <p className="font-medium text-white/80 text-sm tracking-tight pt-1">
                Milestone-based fee release guarantee
              </p>
              <p className="text-[11px] font-mono text-emerald-400/90">
                Triple-layer escrow protocol (Advocates Act compliant)
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* SECTION 03: Lawyer Network / Marketplace (Zigzag: Text Left, Mockup Right) */}
      <motion.section
        id="marketplace"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-70px" }}
        variants={sectionVariants}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em]">
              <span className="w-4 h-px bg-[#C5A059]" />
              <span className="text-white/60 font-semibold">03</span>
              <span className="text-white/30">{"//"}</span>
              <span className="text-white/80 font-medium">LAWYER NETWORK</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-[34px] text-white font-normal leading-[1.18] tracking-tight text-balance">
              A nationwide registry of Bar Council validated advocates.
            </h2>
            <p className="text-[13px] sm:text-sm text-[#9491A1] leading-relaxed">
              Filter by court jurisdiction (Supreme Court, High Courts, District &
              Sessions Courts, DRT, NCLT, Consumer Forums), case specialization,
              and spoken language. Book scheduled 15-minute consultations with
              guaranteed flat fees and zero surprise add-ons.
            </p>

            <div className="space-y-2 text-xs text-[#A5A3B2]">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-white/60 shrink-0" />
                <span>Real-time BCI enrollment ID cross-validation</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-white/60 shrink-0" />
                <span>
                  Search across <CountUp to={28} /> states & <CountUp to={14} /> regional languages
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-white/60 shrink-0" />
                <span>Upfront transparent consultation rates</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/lawyers"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#C5A059] hover:bg-[#DFBE7E] text-[#090B10] font-semibold text-sm transition-all shadow-lg shadow-[#C5A059]/20"
              >
                <span>Explore Verified Advocates</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Supporting Visual (Device Frame Mockup) */}
          <ScrollSyncedPreview className="lg:col-span-7">
            <div className="rounded-xl bg-[#0C0F17]/95 border border-border-default shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden p-5 sm:p-7 space-y-4 hover:border-border-strong transition-colors">
              {/* Device Top Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle text-xs font-mono text-[#A5A3B2]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-white font-semibold">VERIFIED ADVOCATE ROLL</span>
                </div>
                <span className="text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-500/20 text-[10px]">
                  <CountUp to={480} suffix="+" /> Enrolled Advocates
                </span>
              </div>

              {/* Mini Search Filter */}
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#141824] border border-border-default text-xs">
                <Search className="w-3.5 h-3.5 text-white/60" />
                <span className="text-white/80 text-[11px]">
                  Civil Appeal · High Court of Delhi · English & Hindi
                </span>
              </div>

              {/* 2 Lawyer Result Cards with Stamped BCI Badges */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-[#141824]/90 border border-border-default flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#252E46] to-[#121622] flex items-center justify-center font-serif text-xs font-semibold text-white border border-border-default">
                      RS
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">Adv. Rajesh Sharma</span>
                        <span className="px-1.5 py-0.5 rounded-lg bg-[#C5A059]/10 border border-[#C5A059]/30 text-[9px] font-mono text-[#DFBE7E] uppercase tracking-wider flex items-center gap-1 font-semibold">
                          <ShieldCheck className="w-2.5 h-2.5 text-[#C5A059]" /> BCI VERIFIED
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A5A3B2] mt-0.5">Delhi High Court & Supreme Court · 18 yrs exp</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-white">₹1,500</span>
                    <p className="text-[10px] text-white/40">15-min call</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#141824]/90 border border-border-default flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2A2338] to-[#14121E] flex items-center justify-center font-serif text-xs font-semibold text-white border border-border-default">
                      MS
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">Adv. Meera Sen</span>
                        <span className="px-1.5 py-0.5 rounded-lg bg-[#C5A059]/10 border border-[#C5A059]/30 text-[9px] font-mono text-[#DFBE7E] uppercase tracking-wider flex items-center gap-1 font-semibold">
                          <ShieldCheck className="w-2.5 h-2.5 text-[#C5A059]" /> BCI VERIFIED
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A5A3B2] mt-0.5">Bombay High Court & NCLT · 12 yrs exp</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-white">₹1,200</span>
                    <p className="text-[10px] text-white/40">15-min call</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollSyncedPreview>
        </div>
      </motion.section>

      {/* SECTION 04: AI Intake Engine (Zigzag: Mockup Left, Text Right) */}
      <motion.section
        id="ai-advisory"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-70px" }}
        variants={sectionVariants}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Supporting Visual (Device Frame Mockup) */}
          <ScrollSyncedPreview className="lg:col-span-7 order-2 lg:order-1">
            <div className="rounded-xl bg-[#0C0F17]/95 border border-border-default shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden p-5 sm:p-7 space-y-4 hover:border-border-strong transition-colors">
              {/* Device Top Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle text-xs font-mono text-[#A5A3B2]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-white/60" />
                  <span className="text-white font-semibold">NYAY AI INTAKE INTELLIGENCE</span>
                </div>
                <span className="text-emerald-400 font-mono text-[10px]">BNS & CPC Grounded</span>
              </div>

              {/* Chat Thread */}
              <div className="space-y-3 text-xs">
                <div className="ml-auto max-w-[85%] p-3 rounded-xl rounded-tr-sm bg-[#1C2234] border border-border-default text-white/90">
                  <p className="leading-relaxed text-[11px]">
                    &ldquo;My builder has delayed flat possession by 14 months without occupational certificate. What are my legal remedies?&rdquo;
                  </p>
                </div>

                <div className="mr-auto max-w-[95%] p-3.5 rounded-xl rounded-tl-sm bg-[#121622] border border-border-strong space-y-2">
                  <div className="flex items-center gap-2 text-white text-[11px] font-semibold">
                    <Scale className="w-3.5 h-3.5 text-white/70" />
                    <span>Statutory Rights Under RERA Sec 18</span>
                  </div>
                  <p className="text-[#A5A3B2] text-[11px] leading-relaxed">
                    You are entitled to claim interest for every month of delay at SBI MCLR + 2%, or seek a full refund of deposit amount with compensation.
                  </p>
                  <div className="p-2 rounded-lg bg-black/40 border border-border-subtle flex items-center justify-between text-[10px]">
                    <span className="text-white/70">Action:</span>
                    <span className="font-mono text-emerald-400">File RERA Form M Complaint</span>
                  </div>
                </div>

                {/* Voice Intake Bar */}
                <div className="p-2.5 rounded-lg bg-black/30 border border-border-subtle flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 text-white/80">
                    <Mic className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                    <span>Voice Intake in Hindi: &ldquo;शिकायत दर्ज करें...&rdquo;</span>
                  </div>
                  <span className="font-mono text-[10px] text-white/40">Auto-Translated</span>
                </div>
              </div>
            </div>
          </ScrollSyncedPreview>

          {/* Right Text Column */}
          <div className="lg:col-span-5 order-1 lg:order-2 space-y-5">
            <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em]">
              <span className="w-4 h-px bg-[#C5A059]" />
              <span className="text-white/60 font-semibold">04</span>
              <span className="text-white/30">{"//"}</span>
              <span className="text-white/80 font-medium">AI INTAKE ENGINE</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-[34px] text-white font-normal leading-[1.18] tracking-tight text-balance">
              Intelligent legal triage in your mother tongue.
            </h2>
            <p className="text-[13px] sm:text-sm text-[#9491A1] leading-relaxed">
              Speak or type your grievance in Hindi, Marathi, Tamil, Bengali,
              Telugu or English. Our specialized AI model extracts the legal
              core, maps relevant remedies under Bharatiya Nyaya Sanhita (BNS)
              and procedural codes, and matches you with verified specialist counsel.
            </p>

            <div className="space-y-2.5 text-xs text-[#A5A3B2]">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-white/60 shrink-0" />
                <span>Translates vernacular speech to formal legal grievances</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-white/60 shrink-0" />
                <span>Checks limitation periods and court jurisdiction</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-white/60 shrink-0" />
                <span>Zero charge for preliminary AI legal assessment</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/intake"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#C5A059] hover:bg-[#DFBE7E] text-[#090B10] font-semibold text-sm transition-all shadow-lg shadow-[#C5A059]/20"
              >
                <span>Start Free AI Intake</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* SECTION 05: Advocate SaaS (Zigzag: Text Left, Mockup Right) */}
      <motion.section
        id="lawyer-saas"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-70px" }}
        variants={sectionVariants}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em]">
              <span className="w-4 h-px bg-[#C5A059]" />
              <span className="text-white/60 font-semibold">05</span>
              <span className="text-white/30">{"//"}</span>
              <span className="text-white/80 font-medium">ADVOCATE CHAMBERS PORTAL</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-[34px] text-white font-normal leading-[1.18] tracking-tight text-balance">
              Digital litigation infrastructure for independent counsel.
            </h2>
            <p className="text-[13px] sm:text-sm text-[#9491A1] leading-relaxed">
              Automate daily cause list alerts, client onboarding, digital
              Vakalatnama signing via Aadhaar OTP, and milestone fee escrow. Built
              from the ground up specifically for Indian litigation chambers.
            </p>

            <div className="space-y-2 text-xs text-[#A5A3B2]">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-white/60 shrink-0" />
                <span>e-Courts daily cause list sync directly to WhatsApp/SMS</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-white/60 shrink-0" />
                <span>Legally valid digital Vakalatnama e-signing (Aadhaar OTP)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-white/60 shrink-0" />
                <span>Zero commission — 100% of escrow retainer released directly to counsel</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/auth/login?intent=lawyer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border-default hover:border-border-strong text-white font-medium text-sm transition-colors bg-surface-raised hover:bg-surface-hover"
              >
                <span>Onboard Your Practice</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Supporting Visual — Vertical Chamber Workflow Timeline (Breaking the Card Pattern) */}
          <ScrollSyncedPreview className="lg:col-span-7">
            <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-white/40 before:via-border-default before:to-border-subtle">
              {/* Event 1 */}
              <div className="relative group">
                <div className="absolute -left-6 sm:-left-8 top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-[#090B10] shadow-[0_0_12px_rgba(52,211,153,0.5)]" />
                <div className="p-4 rounded-xl bg-surface-raised border border-border-default hover:border-border-strong transition-colors">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-[11px] text-emerald-400 font-semibold tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      09:30 AM · CAUSE LIST SYNC
                    </span>
                    <span className="font-mono text-[10px] text-white/40">e-Courts API</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">Court 14, Item #19 — Interim Stay Application</h4>
                  <p className="text-xs text-[#9491A1] mt-0.5">High Court of Delhi · Sharma v. Capital Realty</p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-950/60 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
                      Listed #19 (Urgent)
                    </span>
                    <span className="text-[10px] text-white/40 font-mono">Synced to WhatsApp & Chamber Calendar</span>
                  </div>
                </div>
              </div>

              {/* Event 2 */}
              <div className="relative group">
                <div className="absolute -left-6 sm:-left-8 top-1.5 w-2.5 h-2.5 rounded-full bg-white ring-4 ring-[#090B10]" />
                <div className="p-4 rounded-xl bg-surface-raised border border-border-default hover:border-border-strong transition-colors">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-[11px] text-white font-semibold tracking-wider">
                      11:15 AM · DIGITAL VAKALATNAMA
                    </span>
                    <span className="font-mono text-[10px] text-white/70">Aadhaar OTP Verified</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">Client Authorization & Digital Seal Executed</h4>
                  <p className="text-xs text-[#9491A1] mt-0.5">Digitally signed under Section 65B of Indian Evidence Act</p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-surface-hover border border-border-default text-[10px] font-mono text-white/80">
                      Enforceable Vakalatnama
                    </span>
                    <span className="text-[10px] text-white/40 font-mono">UIDAI e-Sign Certified</span>
                  </div>
                </div>
              </div>

              {/* Event 3 */}
              <div className="relative group">
                <div className="absolute -left-6 sm:-left-8 top-1.5 w-2.5 h-2.5 rounded-full bg-white/60 ring-4 ring-[#090B10]" />
                <div className="p-4 rounded-xl bg-surface-raised border border-border-default hover:border-border-strong transition-colors">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-[11px] text-white/70 font-semibold tracking-wider">
                      04:30 PM · MILESTONE ESCROW SETTLEMENT
                    </span>
                    <span className="font-mono text-[10px] text-emerald-400">₹0 Commission</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">Stage-2 Retainer Released Directly to Bank A/c</h4>
                  <p className="text-xs text-[#9491A1] mt-0.5">₹35,000 released upon filing acknowledgement timestamp</p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-surface-raised border border-border-subtle text-[10px] font-mono text-white/70">
                      Zero Referral Fees
                    </span>
                    <span className="text-[10px] text-white/40 font-mono">100% Disbursed to Advocate</span>
                  </div>
                </div>
              </div>

              {/* Sample Docket Notice */}
              <p className="text-[11px] font-mono text-white/40 text-right pr-2">
                Demonstration Chamber Feed · Sample Advocate Docket
              </p>
            </div>
          </ScrollSyncedPreview>
        </div>
      </motion.section>

      {/* SECTION 06: Trust & Compliance */}
      <motion.section
        id="trust"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-70px" }}
        variants={sectionVariants}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28"
      >
        <div className="p-8 sm:p-12 lg:p-14 rounded-xl bg-[#14110A]/85 border border-border-strong backdrop-blur-md shadow-2xl shadow-black/50 space-y-6">
          <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em]">
            <span className="w-4 h-px bg-[#C5A059]" />
            <span className="text-white/60 font-semibold">06</span>
            <span className="text-white/30">{"//"}</span>
            <span className="text-white/80 font-medium">LEGAL COMPLIANCE & ETHICS</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl lg:text-[34px] text-white font-normal max-w-2xl leading-snug tracking-tight text-balance">
            Engineered strictly under Rule 36 of the Bar Council of India Rules.
          </h2>
          <p className="text-[13px] sm:text-sm text-[#9491A1] max-w-3xl leading-relaxed">
            The Advocates Act, 1961 and Rule 36 of the BCI Rules strictly prohibit lawyers from
            advertising, soliciting briefs, or paying referral commissions. NyayLink operates purely
            as neutral infrastructure: enabling direct citizen search, transparent milestone escrow,
            and verifiable public enrollment records.
          </p>

          {/* 3D Dynamic Momentum Ring */}
          <MomentumRing className="my-4" />

          {/* Stamped Compliance Chips (Category 2: Stamped Gold Credential) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-border-default text-xs">
            <div className="p-3.5 rounded-lg bg-[#C5A059]/[0.06] border border-[#C5A059]/30 shadow-[inset_0_1px_0_rgba(197,160,89,0.15)] flex items-start gap-3">
              <div className="w-5 h-5 rounded-lg bg-[#C5A059]/15 border border-[#C5A059]/30 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#DFBE7E] block font-semibold">
                  BCI Rule 36 Compliance
                </span>
                <span className="text-[12px] text-white/80 block mt-0.5 leading-snug">
                  Zero touting, zero advertising, zero client solicitation. Purely informational indexing.
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#C5A059]/[0.06] border border-[#C5A059]/30 shadow-[inset_0_1px_0_rgba(197,160,89,0.15)] flex items-start gap-3">
              <div className="w-5 h-5 rounded-lg bg-[#C5A059]/15 border border-[#C5A059]/30 flex items-center justify-center shrink-0 mt-0.5">
                <Lock className="w-3.5 h-3.5 text-[#C5A059]" />
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#DFBE7E] block font-semibold">
                  Advocate-Client Privilege
                </span>
                <span className="text-[12px] text-white/80 block mt-0.5 leading-snug">
                  256-bit AES encryption protecting privileged legal consultations and case brief records.
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* SECTION 07: CTA */}
      <motion.section
        id="cta"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-70px" }}
        variants={sectionVariants}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28"
      >
        <div className="p-10 sm:p-16 rounded-xl bg-gradient-to-br from-[#121624] via-[#0C0F17] to-[#090B10] border border-border-strong text-center space-y-6 shadow-2xl">
          <div className="flex items-center justify-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em]">
            <span className="w-4 h-px bg-[#C5A059]" />
            <span className="text-white/60 font-semibold">07</span>
            <span className="text-white/30">{"//"}</span>
            <span className="text-white/80 font-medium">NEXT STEPS</span>
            <span className="w-4 h-px bg-[#C5A059]" />
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white font-normal max-w-2xl mx-auto leading-tight tracking-tight text-balance">
            Begin with structured clarity. Consult verified counsel.
          </h2>
          <p className="text-[13px] sm:text-sm text-[#9491A1] max-w-xl mx-auto leading-relaxed">
            Describe your situation in 3 minutes in your native language. Receive statutory
            issue analysis and connect directly with an enrolled advocate.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/auth/login?intent=client"
              className="px-7 py-3.5 rounded-lg bg-[#C5A059] hover:bg-[#DFBE7E] text-[#090B10] font-semibold text-sm transition-all shadow-xl shadow-[#C5A059]/25 flex items-center gap-2"
            >
              <span>Find an Advocate</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/login?intent=lawyer"
              className="px-6 py-3.5 rounded-lg border border-border-default hover:border-border-strong text-white font-medium text-sm transition-colors bg-surface-raised hover:bg-surface-hover"
            >
              Join as Counsel
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
