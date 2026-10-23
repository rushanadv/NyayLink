"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  User,
  Briefcase,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

export function TwoAudiences() {
  const { t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="audiences" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-24">
      {/* Section Header */}
      <div className="max-w-3xl mb-14 space-y-3">
        <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em]">
          <span className="w-4 h-px bg-[#205C43]" />
          <span className="text-[#205C43] font-bold">04</span>
          <span className="text-[#D5E5D9]">{"//"}</span>
          <span className="text-[#69736D] font-semibold">{t.home.twoAudiences.eyebrow}</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#202824] font-normal tracking-tight text-balance">
          {t.home.twoAudiences.title}
        </h2>
        <p className="text-base text-[#69736D] leading-relaxed max-w-2xl font-light">
          {t.home.twoAudiences.subtitle}
        </p>
      </div>

      {/* Split Editorial Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* SIDE A: FOR CLIENTS */}
        <div id="for-clients" className="scroll-mt-28">
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -40px 0px" }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl bg-white border border-[#D5E5D9] p-8 sm:p-10 flex flex-col justify-between h-full shadow-xs"
          >
            <div className="space-y-6">
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#205C43] font-semibold flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#205C43]" />
                  {t.home.twoAudiences.clientBadge}
                </span>
                <span className="text-xs font-mono text-[#69736D]">{t.home.twoAudiences.clientSubBadge}</span>
              </div>

              {/* Title & Description */}
              <div className="space-y-3">
                <h3 className="font-serif text-2xl sm:text-3xl text-[#202824] tracking-tight">
                  {t.home.twoAudiences.clientTitle}
                </h3>
                <p className="text-sm text-[#69736D] leading-relaxed">
                  {t.home.twoAudiences.clientDesc}
                </p>
              </div>

              {/* Capability List */}
              <div className="space-y-3 pt-2 text-xs text-[#69736D] border-t border-[#D5E5D9]">
                <div className="flex items-start gap-2.5 pt-3">
                  <CheckCircle2 className="w-4 h-4 text-[#205C43] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#202824]">{t.home.twoAudiences.clientF1Title} </strong>
                    {t.home.twoAudiences.clientF1Desc}
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#205C43] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#202824]">{t.home.twoAudiences.clientF2Title} </strong>
                    {t.home.twoAudiences.clientF2Desc}
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#205C43] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#202824]">{t.home.twoAudiences.clientF3Title} </strong>
                    {t.home.twoAudiences.clientF3Desc}
                  </span>
                </div>
              </div>
            </div>

            {/* Entry Action */}
            <div className="pt-8 mt-8 border-t border-[#D5E5D9] flex items-center justify-between">
              <Link
                href="/auth/login?intent=client"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white font-semibold text-xs transition-all shadow-md shadow-[#205C43]/15"
              >
                <span>{t.home.twoAudiences.clientCta}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/lawyers"
                className="text-xs text-[#69736D] hover:text-[#202824] font-medium transition-colors"
              >
                {t.home.twoAudiences.browseAdvocates}
              </Link>
            </div>
          </motion.div>
        </div>

        {/* SIDE B: FOR PRACTICING ADVOCATES */}
        <div id="for-lawyers" className="scroll-mt-28">
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -40px 0px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl bg-[#EAF3ED]/40 border border-[#D5E5D9] p-8 sm:p-10 flex flex-col justify-between h-full shadow-xs"
          >
            <div className="space-y-6">
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#174530] font-semibold flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-[#174530]" />
                  {t.home.twoAudiences.lawyerBadge}
                </span>
                <span className="text-xs font-mono text-[#174530] font-medium bg-white px-2 py-0.5 rounded border border-[#D5E5D9]">
                  {t.home.twoAudiences.lawyerSubBadge}
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-3">
                <h3 className="font-serif text-2xl sm:text-3xl text-[#202824] tracking-tight">
                  {t.home.twoAudiences.lawyerTitle}
                </h3>
                <p className="text-sm text-[#69736D] leading-relaxed">
                  {t.home.twoAudiences.lawyerDesc}
                </p>
              </div>

              {/* Capability List */}
              <div className="space-y-3 pt-2 text-xs text-[#69736D] border-t border-[#D5E5D9]">
                <div className="flex items-start gap-2.5 pt-3">
                  <CheckCircle2 className="w-4 h-4 text-[#174530] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#202824]">{t.home.twoAudiences.lawyerF1Title} </strong>
                    {t.home.twoAudiences.lawyerF1Desc}
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#174530] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#202824]">{t.home.twoAudiences.lawyerF2Title} </strong>
                    {t.home.twoAudiences.lawyerF2Desc}
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#174530] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#202824]">{t.home.twoAudiences.lawyerF3Title} </strong>
                    {t.home.twoAudiences.lawyerF3Desc}
                  </span>
                </div>
              </div>
            </div>

            {/* Entry Action */}
            <div className="pt-8 mt-8 border-t border-[#D5E5D9] flex items-center justify-between">
              <Link
                href="/auth/login?intent=lawyer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#174530] hover:bg-[#0E2C1E] text-white font-semibold text-xs transition-all shadow-md shadow-[#174530]/15"
              >
                <span>{t.home.twoAudiences.lawyerCta}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/auth/sign-up?intent=lawyer"
                className="text-xs text-[#69736D] hover:text-[#202824] font-medium transition-colors"
              >
                {t.home.twoAudiences.learnAdvocatePortal}
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
