"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Scale,
  Sparkles,
  Briefcase,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { CourtOnboardingQrModal } from "@/components/lawyer/court-onboarding-qr-modal";
import { useLanguage } from "@/lib/i18n/context";

export function CoreCapabilities() {
  const { t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const caps = t.home.capabilities;

  return (
    <section id="capabilities" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-24">
      {/* Section Header */}
      <div className="max-w-3xl mb-14 space-y-3">
        <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em]">
          <span className="w-4 h-px bg-[#205C43]" />
          <span className="text-[#205C43] font-bold">03</span>
          <span className="text-[#D5E5D9]">{"//"}</span>
          <span className="text-[#69736D] font-semibold">{caps.eyebrow}</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#202824] font-normal tracking-tight text-balance">
          {caps.title}
        </h2>
        <p className="text-base text-[#69736D] leading-relaxed max-w-2xl font-light">
          {caps.subtitle}
        </p>
      </div>

      {/* 3 Coherent Capability Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* CATEGORY 1: FINDING & CONSULTING ADVOCATES */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -40px 0px" }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl bg-white border border-[#D5E5D9] hover:border-[#205C43]/50 p-7 sm:p-8 flex flex-col justify-between shadow-xs transition-all relative group"
        >
          <div className="space-y-6">
            {/* Category Badge & Icon */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#205C43] font-semibold bg-[#EAF3ED] px-2.5 py-1 rounded-md border border-[#D5E5D9]">
                {caps.cat1Badge}
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center text-[#205C43]">
                <Scale className="w-4 h-4 text-[#205C43]" />
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h3 className="font-serif text-2xl text-[#202824] tracking-tight">
                {caps.cat1Title}
              </h3>
              <p className="text-xs text-[#69736D] leading-relaxed">
                {caps.cat1Desc}
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-3 pt-3 text-xs text-[#69736D] border-t border-[#D5E5D9]">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#205C43] shrink-0 mt-0.5" />
                <span className="leading-snug">{caps.cat1Item1}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#205C43] shrink-0 mt-0.5" />
                <span className="leading-snug">{caps.cat1Item2}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#205C43] shrink-0 mt-0.5" />
                <span className="leading-snug">{caps.cat1Item3}</span>
              </div>
            </div>
          </div>

          {/* Action Link */}
          <div className="pt-6 mt-8 border-t border-[#D5E5D9]">
            <Link
              href="/lawyers"
              className="w-full py-3 px-4 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <span>{caps.cat1Cta}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* CATEGORY 2: UNDERSTANDING LEGAL ISSUES & NEXT STEPS */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -40px 0px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl bg-white border border-[#D5E5D9] hover:border-[#205C43]/50 p-7 sm:p-8 flex flex-col justify-between shadow-xs transition-all relative group"
        >
          <div className="space-y-6">
            {/* Category Badge & Icon */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#205C43] font-semibold bg-[#EAF3ED] px-2.5 py-1 rounded-md border border-[#D5E5D9]">
                {caps.cat2Badge}
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center text-[#205C43]">
                <Sparkles className="w-4 h-4 text-[#205C43]" />
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h3 className="font-serif text-2xl text-[#202824] tracking-tight">
                {caps.cat2Title}
              </h3>
              <p className="text-xs text-[#69736D] leading-relaxed">
                {caps.cat2Desc}
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-3 pt-3 text-xs text-[#69736D] border-t border-[#D5E5D9]">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#205C43] shrink-0 mt-0.5" />
                <span className="leading-snug">{caps.cat2Item1}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#205C43] shrink-0 mt-0.5" />
                <span className="leading-snug">{caps.cat2Item2}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#205C43] shrink-0 mt-0.5" />
                <span className="leading-snug">{caps.cat2Item3}</span>
              </div>
            </div>
          </div>

          {/* Action Link */}
          <div className="pt-6 mt-8 border-t border-[#D5E5D9]">
            <Link
              href="/intake"
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-[#EAF3ED] border border-[#D5E5D9] text-[#202824] font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <span>{caps.cat2Cta}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* CATEGORY 3: ADVOCATE CHAMBER WORKFLOW INFRASTRUCTURE */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -40px 0px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl bg-[#EAF3ED]/30 border border-[#D5E5D9] hover:border-[#174530]/50 p-7 sm:p-8 flex flex-col justify-between shadow-xs transition-all relative group"
        >
          <div className="space-y-6">
            {/* Category Badge & Icon */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#174530] font-semibold bg-white px-2.5 py-1 rounded-md border border-[#D5E5D9]">
                {caps.cat3Badge}
              </span>
              <div className="w-9 h-9 rounded-xl bg-white border border-[#D5E5D9] flex items-center justify-center text-[#174530]">
                <Briefcase className="w-4 h-4 text-[#174530]" />
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h3 className="font-serif text-2xl text-[#202824] tracking-tight">
                {caps.cat3Title}
              </h3>
              <p className="text-xs text-[#69736D] leading-relaxed">
                {caps.cat3Desc}
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-3 pt-3 text-xs text-[#69736D] border-t border-[#D5E5D9]">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#174530] shrink-0 mt-0.5" />
                <span className="leading-snug">{caps.cat3Item1}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#174530] shrink-0 mt-0.5" />
                <span className="leading-snug">{caps.cat3Item2}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#174530] shrink-0 mt-0.5" />
                <span className="leading-snug">{caps.cat3Item3}</span>
              </div>
            </div>
          </div>

          {/* Action Links: Advocate Chambers Portal + Court QR Modal */}
          <div className="pt-6 mt-8 border-t border-[#D5E5D9] space-y-2.5">
            <Link
              href="/auth/login?intent=lawyer"
              className="w-full py-3 px-4 rounded-xl bg-[#174530] hover:bg-[#0E2C1E] text-white font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <span>{caps.cat3Cta}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <div className="flex justify-center">
              <CourtOnboardingQrModal />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
