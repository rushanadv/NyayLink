"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Scale,
  Lock,
  ArrowRight,
  Briefcase,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { ParticleText } from "@/components/effects/particle-text";
import { CaseStatusWidget } from "./case-status-widget";
import { HeroDocket } from "./hero-docket";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { CourtOnboardingQrModal } from "@/components/lawyer/court-onboarding-qr-modal";


export function HeroEditorial() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16 lg:py-14">
      {/* Two-Column Balanced Editorial Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-start">
        {/* LEFT COLUMN: Editorial Typography & Audience Choices (6 cols) */}
        <div className="lg:col-span-6 flex flex-col space-y-6 sm:space-y-7 items-start select-none">
          {/* Top Live Registry Status Pill — Aligned flush to left edge */}
          <CaseStatusWidget />

          {/* Eyebrow Label — Architectural Mono with Green Rule */}
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-px bg-[#205C43]" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#69736D] font-semibold">
              NYAYLINK / LEGAL SERVICES
            </span>
          </div>

          {/* Headline Direction: Intentional 2-line break with balanced typography */}
          <div className="space-y-3.5 w-full">
            <h1 className="tracking-tight leading-[1.08] text-left">
              <ParticleText
                text={"Find the right legal\npath forward."}
                className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[46px] xl:text-[54px] font-normal tracking-tight text-[#202824] leading-[1.08] text-left block"
                highlightColor="#205C43"
                textColor="#202824"
              />
            </h1>
            <p className="text-base sm:text-lg text-[#69736D] font-light leading-relaxed max-w-xl text-left pt-1">
              NyayLink connects citizens and businesses with verified State Bar Council advocates across India. Explore statutory remedies in plain language and consult certified counsel under transparent milestone escrow.
            </p>
          </div>

          {/* Immediate Audience Actions: Client & Advocate Primary Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 w-full sm:w-auto">
            <MagneticWrapper maxDisplacement={4}>
              <Link
                href="/auth/login?intent=client"
                className="px-6 py-3.5 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white font-semibold text-xs transition-all shadow-md shadow-[#205C43]/15 flex items-center justify-center gap-2 text-center"
              >
                <UserCheck className="w-4 h-4 text-[#EAF3ED]" />
                <span>I Need Legal Help</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </MagneticWrapper>

            <Link
              href="/auth/sign-up?intent=lawyer"
              className="px-5 py-3.5 rounded-xl bg-white hover:bg-[#EAF3ED] border border-[#D5E5D9] text-[#202824] font-semibold text-xs transition-all flex items-center justify-center gap-2 text-center shadow-xs"
            >
              <Briefcase className="w-4 h-4 text-[#205C43]" />
              <span>Join as an Advocate</span>
            </Link>

            <CourtOnboardingQrModal />
          </div>

          {/* Contextual Secondary Guidance Link */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
            <span className="text-[#69736D]">Need preliminary analysis first?</span>
            <Link
              href="/intake"
              className="inline-flex items-center gap-1.5 font-semibold text-[#205C43] hover:text-[#174530] hover:underline transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#205C43]" />
              <span>Get Initial Legal Guidance</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>


          {/* Stamped Verification Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs w-full max-w-xl">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-[#D5E5D9] shadow-xs">
              <div className="w-6 h-6 rounded-lg bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-[#205C43]" />
              </div>
              <span className="text-[11px] font-medium text-[#202824]">
                BCI Rule 36 Compliant
              </span>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-[#D5E5D9] shadow-xs">
              <div className="w-6 h-6 rounded-lg bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center shrink-0">
                <Scale className="w-3.5 h-3.5 text-[#205C43]" />
              </div>
              <span className="text-[11px] font-medium text-[#202824]">
                Bar Council Enrolled
              </span>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-[#D5E5D9] shadow-xs">
              <div className="w-6 h-6 rounded-lg bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center shrink-0">
                <Lock className="w-3.5 h-3.5 text-[#205C43]" />
              </div>
              <span className="text-[11px] font-medium text-[#202824]">
                Milestone Escrow Security
              </span>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-[#D5E5D9] shadow-xs">
              <div className="w-6 h-6 rounded-lg bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center shrink-0">
                <span className="font-mono text-[10px] font-bold text-[#205C43]">65B</span>
              </div>
              <span className="text-[11px] font-medium text-[#202824]">
                Aadhaar Digital Vakalatnama
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Bespoke Interactive Legal Procedural Centerpiece (6 cols) */}
        <div className="lg:col-span-6 w-full lg:pt-1">
          <HeroDocket />
        </div>
      </div>
    </div>
  );
}
