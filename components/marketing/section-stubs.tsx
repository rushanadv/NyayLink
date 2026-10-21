"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useInView, type Variants } from "framer-motion";
import { CountUp } from "@/components/ui/count-up";
import {
  ArrowRight,
  ShieldCheck,
  Scale,
  Sparkles,
  Briefcase,
  Languages,
  CheckCircle2,
  Calendar,
  Lock,
  Search,
  ChevronRight,
  FileText,
  Clock,
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
        <div className="p-8 sm:p-12 lg:p-16 rounded-3xl bg-[#0C0F17]/85 border border-white/[0.08] backdrop-blur-md shadow-2xl shadow-black/50">
          <div className="flex items-center gap-2 mb-5">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C5A059] font-medium px-2.5 py-1 rounded bg-[#C5A059]/10 border border-[#C5A059]/25">
              02 / THE CHALLENGE
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white font-normal max-w-2xl leading-snug tracking-tight text-balance">
            Indian citizens face 5 crore pending cases and opaque legal costs.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#A5A3B2] max-w-3xl leading-relaxed">
            Finding the right advocate often relies on informal broker networks,
            unclear fee schedules, and intimidating legal language. NyayaLink
            bridges this divide with algorithmic lawyer matching, verified Bar
            Council profiles, and plain-language vernacular intake.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10 pt-8 border-t border-white/[0.06]">
            <div className="space-y-1">
              <span className="font-serif text-3xl font-medium text-[#DFBE7E]">
                <CountUp to={5.1} decimals={1} suffix=" Cr+" />
              </span>
              <p className="text-xs text-[#A5A3B2] leading-relaxed">
                Pending matters across subordinate & appellate courts
              </p>
            </div>
            <div className="space-y-1">
              <span className="font-serif text-3xl font-medium text-[#DFBE7E]">
                <CountUp to={84} suffix="%" />
              </span>
              <p className="text-xs text-[#A5A3B2] leading-relaxed">
                Citizens report inability to understand complex statutory jargon
              </p>
            </div>
            <div className="space-y-1">
              <span className="font-serif text-3xl font-medium text-[#DFBE7E]">
                <CountUp to={100} suffix="%" />
              </span>
              <p className="text-xs text-[#A5A3B2] leading-relaxed">
                Flat, milestone-based fee guarantee with zero hidden clerk charges
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
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-widest text-[#C5A059] font-medium px-2.5 py-1 rounded bg-[#C5A059]/10 border border-[#C5A059]/25">
                03 / LAWYER NETWORK
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-[38px] text-white font-normal leading-[1.18] tracking-tight text-balance">
              A nationwide registry of Bar Council validated advocates.
            </h2>
            <p className="text-sm sm:text-base text-[#A5A3B2] leading-relaxed">
              Filter by court jurisdiction (Supreme Court, High Courts, District &
              Sessions Courts, DRT, NCLT, Consumer Forums), case specialization,
              and spoken language. Book scheduled 15-minute consultations with
              guaranteed flat fees and no surprise add-ons.
            </p>

            <div className="space-y-2.5 text-xs text-[#A5A3B2]">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>Real-time BCI enrollment ID cross-validation</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>
                  Search across <CountUp to={28} /> states & <CountUp to={14} /> regional languages
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#C5A059] shrink-0" />
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
            <div className="rounded-2xl bg-[#0C0F17]/95 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden p-5 sm:p-7 space-y-4 hover:border-[#C5A059]/30 transition-colors">
              {/* Device Top Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] text-xs font-mono text-[#A5A3B2]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-white font-semibold">VERIFIED ADVOCATE ROLL</span>
                </div>
                <span className="text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20 text-[10px]">
                  <CountUp to={480} suffix="+" /> Verified Advocates
                </span>
              </div>

              {/* Mini Search Filter */}
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#141824] border border-white/[0.08] text-xs">
                <Search className="w-3.5 h-3.5 text-[#C5A059]" />
                <span className="text-white/80 text-[11px]">
                  Civil Appeal · High Court of Delhi · English & Hindi
                </span>
              </div>

              {/* 2 Lawyer Result Cards */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-[#141824]/90 border border-white/[0.08] flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#252E46] to-[#121622] flex items-center justify-center font-serif text-xs font-semibold text-[#DFBE7E] border border-white/10">
                      RS
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-white">Adv. Rajesh Sharma</span>
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> BCI Verified
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A5A3B2]">Delhi High Court & Supreme Court · 18 yrs exp</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#DFBE7E]">₹1,500</span>
                    <p className="text-[10px] text-white/40">15-min call</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#141824]/90 border border-white/[0.08] flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2A2338] to-[#14121E] flex items-center justify-center font-serif text-xs font-semibold text-[#DFBE7E] border border-white/10">
                      MS
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-white">Adv. Meera Sen</span>
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> BCI Verified
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A5A3B2]">Bombay High Court & NCLT · 12 yrs exp</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#DFBE7E]">₹1,200</span>
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
            <div className="rounded-2xl bg-[#0C0F17]/95 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden p-5 sm:p-7 space-y-4 hover:border-[#C5A059]/30 transition-colors">
              {/* Device Top Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] text-xs font-mono text-[#A5A3B2]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span className="text-white font-semibold">NYAYAAI INTAKE INTELLIGENCE</span>
                </div>
                <span className="text-emerald-400 font-mono text-[10px]">BNS & CPC Grounded</span>
              </div>

              {/* Chat Thread */}
              <div className="space-y-3 text-xs">
                <div className="ml-auto max-w-[85%] p-3 rounded-2xl rounded-tr-sm bg-[#1C2234] border border-white/10 text-white/90">
                  <p className="leading-relaxed text-[11px]">
                    &ldquo;My builder has delayed flat possession by 14 months without occupational certificate. What are my legal remedies?&rdquo;
                  </p>
                </div>

                <div className="mr-auto max-w-[95%] p-3.5 rounded-2xl rounded-tl-sm bg-[#121622] border border-[#C5A059]/20 space-y-2">
                  <div className="flex items-center gap-2 text-[#DFBE7E] text-[11px] font-semibold">
                    <Scale className="w-3.5 h-3.5" />
                    <span>Statutory Rights Under RERA Sec 18</span>
                  </div>
                  <p className="text-[#A5A3B2] text-[11px] leading-relaxed">
                    You are entitled to claim interest for every month of delay at SBI MCLR + 2%, or seek a full refund of deposit amount with compensation.
                  </p>
                  <div className="p-2 rounded bg-black/40 border border-white/5 flex items-center justify-between text-[10px]">
                    <span className="text-white/70">Action:</span>
                    <span className="font-mono text-emerald-400">File RERA Form M Complaint</span>
                  </div>
                </div>

                {/* Voice Intake Bar */}
                <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 text-[#DFBE7E]">
                    <Mic className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                    <span>Voice Intake in Hindi: &ldquo;शिकायत दर्ज करें...&rdquo;</span>
                  </div>
                  <span className="font-mono text-[10px] text-white/40">Auto-Translated</span>
                </div>
              </div>
            </div>
          </ScrollSyncedPreview>

          {/* Right Text Column */}
          <div className="lg:col-span-5 order-1 lg:order-2 space-y-6">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-widest text-[#C5A059] font-medium px-2.5 py-1 rounded bg-[#C5A059]/10 border border-[#C5A059]/25">
                04 / AI INTAKE ENGINE
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-[38px] text-white font-normal leading-[1.18] tracking-tight text-balance">
              Intelligent legal triage in your mother tongue.
            </h2>
            <p className="text-sm sm:text-base text-[#A5A3B2] leading-relaxed">
              Speak or type your grievance in Hindi, Marathi, Tamil, Bengali,
              Telugu or English. Our specialized AI model extracts the legal
              core, maps relevant remedies under Bharatiya Nyaya Sanhita (BNS)
              and procedural codes, and matches you with the right specialist advocate.
            </p>

            <div className="space-y-2.5 text-xs text-[#A5A3B2]">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>Translates vernacular speech to formal legal grievances</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>Checks limitation periods and court jurisdiction</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#C5A059] shrink-0" />
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
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-widest text-[#C5A059] font-medium px-2.5 py-1 rounded bg-[#C5A059]/10 border border-[#C5A059]/25">
                05 / ADVOCATE SAAS
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-[38px] text-white font-normal leading-[1.18] tracking-tight text-balance">
              The modern digital practice for independent advocates.
            </h2>
            <p className="text-sm sm:text-base text-[#A5A3B2] leading-relaxed">
              Automate daily cause list alerts, client onboarding, digital
              Vakalatnama signing via Aadhaar OTP, and milestone billing. Built
              from the ground up specifically for Indian litigation chambers.
            </p>

            <div className="space-y-2.5 text-xs text-[#A5A3B2]">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>e-Courts daily cause list sync directly to WhatsApp/SMS</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>Legally valid digital Vakalatnama e-signing</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>Milestone escrow fee releases directly to your bank account</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/auth/login?intent=lawyer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/20 hover:border-[#C5A059]/60 text-white font-medium text-sm transition-colors bg-white/[0.02] hover:bg-white/[0.05]"
              >
                <span>Onboard Your Practice</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Supporting Visual (Device Frame Mockup) */}
          <ScrollSyncedPreview className="lg:col-span-7">
            <div className="rounded-2xl bg-[#0C0F17]/95 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden p-5 sm:p-7 space-y-4 hover:border-[#C5A059]/30 transition-colors">
              {/* Device Top Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] text-xs font-mono text-[#A5A3B2]">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span className="text-white font-semibold">ADVOCATE CHAMBERS PORTAL</span>
                </div>
                <span className="text-[#DFBE7E] text-[10px]">Enr: D/1429/2006</span>
              </div>

              {/* Cause List Card */}
              <div className="p-3.5 rounded-xl bg-[#141824] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#C5A059]" /> Today&apos;s Cause List
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">e-Courts Synced</span>
                </div>
                <div className="space-y-1.5">
                  <div className="p-2 rounded bg-black/40 border border-white/5 flex items-center justify-between text-[11px]">
                    <div>
                      <span className="text-white font-medium">Court 14 · Item #19</span>
                      <p className="text-[10px] text-white/40">Sharma v. Capital Realty (Interim Stay)</p>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-400">10:45 AM</span>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-white/5 flex items-center justify-between text-[11px]">
                    <div>
                      <span className="text-white font-medium">Court 03 · Item #31</span>
                      <p className="text-[10px] text-white/40">Mehta Packaging (Bail Hearing)</p>
                    </div>
                    <span className="font-mono text-[10px] text-white/50">02:15 PM</span>
                  </div>
                </div>
              </div>

              {/* Vakalatnama & Intake Status */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#121622] border border-white/5">
                  <span className="text-white/60 block text-[10px]">Active Briefs</span>
                  <span className="text-lg font-bold text-white font-mono">
                    <CountUp to={18} />
                  </span>
                  <span className="text-emerald-400 text-[10px] block">+3 new intakes</span>
                </div>
                <div className="p-3 rounded-xl bg-[#121622] border border-white/5">
                  <span className="text-white/60 block text-[10px]">Digital Vakalatnama</span>
                  <span className="text-lg font-bold text-[#DFBE7E] font-mono">e-Signed</span>
                  <span className="text-white/40 text-[10px] block">Aadhaar verified</span>
                </div>
              </div>
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
        <div className="p-8 sm:p-12 lg:p-14 rounded-3xl bg-[#14110A]/85 border border-[#C5A059]/25 backdrop-blur-md shadow-2xl shadow-black/50 space-y-6">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-[#DFBE7E] font-medium px-2.5 py-1 rounded bg-[#C5A059]/10 border border-[#C5A059]/25">
              06 / LEGAL COMPLIANCE & ETHICS
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white font-normal max-w-2xl leading-snug tracking-tight text-balance">
            Engineered strictly in compliance with the Advocates Act, 1961.
          </h2>
          <p className="text-sm sm:text-base text-[#A5A3B2] max-w-3xl leading-relaxed">
            NyayaLink does not engage in advertising, solicit clients for
            particular advocates, or take referral percentages. We operate strictly as
            a neutral technology platform enabling direct citizen access, transparent fee
            escrow, and verifiable public directory records.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/[0.06] text-xs">
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#C5A059] shrink-0" />
              <span className="text-white/80">Section 36 Compliance: No touting or unauthorized solicitation</span>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center gap-3">
              <Lock className="w-5 h-5 text-[#C5A059] shrink-0" />
              <span className="text-white/80">256-bit AES encryption protecting privileged advocate-client communications</span>
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
        <div className="p-10 sm:p-16 rounded-3xl bg-gradient-to-br from-[#121624] via-[#0C0F17] to-[#090B10] border border-[#C5A059]/30 text-center space-y-6 shadow-2xl">
          <span className="font-mono text-xs uppercase tracking-widest text-[#C5A059] font-medium px-3 py-1 rounded bg-[#C5A059]/10 border border-[#C5A059]/25">
            07 / TAKE ACTION
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white font-normal max-w-2xl mx-auto leading-tight tracking-tight text-balance">
            Begin with clarity. Consult a verified advocate today.
          </h2>
          <p className="text-sm sm:text-base text-[#A5A3B2] max-w-xl mx-auto leading-relaxed">
            Take 3 minutes to describe your case in your language. Receive
            structured legal clarity and connect with an enrolled advocate.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/auth/login?intent=client"
              className="px-7 py-3.5 rounded-lg bg-[#C5A059] hover:bg-[#DFBE7E] text-[#090B10] font-semibold text-sm transition-all shadow-xl shadow-[#C5A059]/25 flex items-center gap-2"
            >
              <span>Get Case Evaluation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/login?intent=lawyer"
              className="px-6 py-3.5 rounded-lg border border-white/20 hover:border-[#C5A059]/50 text-white font-medium text-sm transition-colors bg-white/[0.02] hover:bg-white/[0.05]"
            >
              Join as a Lawyer
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
