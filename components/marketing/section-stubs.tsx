"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Scale,
  Sparkles,
  Briefcase,
  Languages,
  CheckCircle2,
} from "lucide-react";

export function SectionStubs() {
  return (
    <div className="w-full space-y-24 lg:space-y-36 pb-24">
      {/* SECTION 02: The Problem */}
      <section
        id="problem"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[50vh] flex flex-col justify-center scroll-mt-24"
      >
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0C0F17]/80 border border-white/[0.06] backdrop-blur-md">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-mono text-xs text-[#C5A059] uppercase tracking-wider font-semibold">
              02 / The Challenge
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white font-normal max-w-2xl leading-snug">
            Indian citizens face 5 crore pending cases and opaque legal costs.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#A5A3B2] max-w-3xl leading-relaxed">
            Finding the right advocate often relies on informal broker networks,
            unclear fee schedules, and intimidating legal language. NyayaLink
            bridges this divide with algorithmic lawyer matching, verified Bar
            Council profiles, and plain-language vernacular intake.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 pt-8 border-t border-white/[0.06]">
            <div>
              <span className="font-serif text-2xl font-bold text-[#DFBE7E]">
                5.1 Cr+
              </span>
              <p className="text-xs text-[#A5A3B2] mt-1">
                Pending matters across subordinate & appellate courts
              </p>
            </div>
            <div>
              <span className="font-serif text-2xl font-bold text-[#DFBE7E]">
                84%
              </span>
              <p className="text-xs text-[#A5A3B2] mt-1">
                Citizens report inability to understand complex statutory jargon
              </p>
            </div>
            <div>
              <span className="font-serif text-2xl font-bold text-[#DFBE7E]">
                100%
              </span>
              <p className="text-xs text-[#A5A3B2] mt-1">
                Flat, milestone-based fee guarantee with zero hidden clerk fees
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 03: Lawyer Network / Marketplace */}
      <section
        id="marketplace"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[50vh] flex flex-col justify-center scroll-mt-24"
      >
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0C0F17]/80 border border-white/[0.06] backdrop-blur-md">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-mono text-xs text-[#C5A059] uppercase tracking-wider font-semibold">
              03 / Lawyer Network
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white font-normal max-w-2xl leading-snug">
            A nationwide directory of Bar Council validated advocates.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#A5A3B2] max-w-3xl leading-relaxed">
            Filter by court jurisdiction (Supreme Court, High Courts, District &
            Sessions Courts, DRT, NCLT, Consumer Forums), case specialization,
            and primary language. Book scheduled video or in-chambers
            consultations with guaranteed upfront fees.
          </p>
          <div className="mt-6 flex items-center gap-4">
            <Link
              href="/auth/login"
              className="px-5 py-2.5 rounded-lg bg-[#C5A059] hover:bg-[#DFBE7E] text-[#090B10] font-semibold text-xs transition-colors flex items-center gap-2"
            >
              <span>Explore Verified Advocates</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 04: AI Advisory */}
      <section
        id="ai-advisory"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[50vh] flex flex-col justify-center scroll-mt-24"
      >
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0C0F17]/80 border border-white/[0.06] backdrop-blur-md">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-mono text-xs text-[#C5A059] uppercase tracking-wider font-semibold">
              04 / AI Intake Engine
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white font-normal max-w-2xl leading-snug">
            Intelligent legal triage in your mother tongue.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#A5A3B2] max-w-3xl leading-relaxed">
            Speak or type your grievance in Hindi, Marathi, Tamil, Bengali,
            Telugu or English. Our specialized AI model extracts the legal
            issues, maps relevant statutory remedies under Bharatiya Nyaya
            Sanhita (BNS) and civil procedural codes, and matches you with the
            most relevant advocate.
          </p>
        </div>
      </section>

      {/* SECTION 05: Lawyer SaaS */}
      <section
        id="lawyer-saas"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[50vh] flex flex-col justify-center scroll-mt-24"
      >
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0C0F17]/80 border border-white/[0.06] backdrop-blur-md">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-mono text-xs text-[#C5A059] uppercase tracking-wider font-semibold">
              05 / Advocate SaaS
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white font-normal max-w-2xl leading-snug">
            The modern digital practice for independent advocates.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#A5A3B2] max-w-3xl leading-relaxed">
            Automate daily cause list alerts, client onboarding, digital
            Vakalatnama signing via Aadhaar OTP, and milestone billing. Designed
            specifically for the workflow of Indian litigation chambers.
          </p>
          <div className="mt-6">
            <Link
              href="/auth/login"
              className="px-5 py-2.5 rounded-lg border border-white/20 hover:border-[#C5A059]/60 text-white font-medium text-xs transition-colors inline-flex items-center gap-2"
            >
              <span>Onboard Your Practice</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 06: Trust & Compliance */}
      <section
        id="trust"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[50vh] flex flex-col justify-center scroll-mt-24"
      >
        <div className="p-8 sm:p-12 rounded-3xl bg-[#14110A]/80 border border-[#C5A059]/20 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-mono text-xs text-[#DFBE7E] uppercase tracking-wider font-semibold">
              06 / Legal Compliance & Ethics
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white font-normal max-w-2xl leading-snug">
            Engineered strictly in compliance with the Advocates Act, 1961.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#A5A3B2] max-w-3xl leading-relaxed">
            NyayaLink does not engage in advertising, solicit clients for
            particular advocates, or take referral fees. We operate strictly as
            a technology platform enabling direct citizen access, transparent fee
            escrow, and verifiable public directory records.
          </p>
        </div>
      </section>

      {/* SECTION 07: CTA */}
      <section
        id="cta"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[45vh] flex flex-col justify-center scroll-mt-24"
      >
        <div className="p-10 sm:p-16 rounded-3xl bg-gradient-to-br from-[#121624] via-[#0C0F17] to-[#090B10] border border-[#C5A059]/30 text-center space-y-6">
          <span className="font-mono text-xs uppercase tracking-widest text-[#C5A059] font-medium px-3 py-1 rounded bg-[#C5A059]/10 border border-[#C5A059]/25">
            07 / Take Action
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white font-normal max-w-2xl mx-auto leading-tight">
            Begin with clarity. Consult a verified advocate today.
          </h2>
          <p className="text-sm sm:text-base text-[#A5A3B2] max-w-xl mx-auto">
            Take 3 minutes to describe your case in your language. Receive
            structured legal clarity and connect with an enrolled advocate.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/auth/login"
              className="px-7 py-3.5 rounded-lg bg-[#C5A059] hover:bg-[#DFBE7E] text-[#090B10] font-semibold text-sm transition-all duration-200 shadow-xl shadow-[#C5A059]/25 flex items-center gap-2"
            >
              <span>Get Case Evaluation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
