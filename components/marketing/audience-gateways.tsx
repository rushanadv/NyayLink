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
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { useLanguage } from "@/lib/i18n/context";

export function AudienceGateways() {
  const { t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="gateways" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-24">
      {/* Section Header */}
      <div className="max-w-3xl mb-12 space-y-3">
        <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em]">
          <span className="w-4 h-px bg-[#205C43]" />
          <span className="text-[#205C43] font-bold">02</span>
          <span className="text-[#D5E5D9]">{"//"}</span>
          <span className="text-[#69736D] font-semibold">{t.home.gateways.eyebrow}</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#202824] font-normal tracking-tight text-balance">
          {t.home.gateways.title}
        </h2>
        <p className="text-base text-[#69736D] leading-relaxed max-w-2xl font-light">
          {t.home.gateways.subtitle}
        </p>
      </div>

      {/* Differentiated Editorial Dual Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* CLIENT PATHWAY (6 cols) */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -40px 0px" }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-6 rounded-2xl bg-white border border-[#D5E5D9] hover:border-[#205C43]/50 p-7 sm:p-9 flex flex-col justify-between shadow-lg shadow-[#202824]/4 transition-all relative overflow-hidden group"
        >
          {/* Subtle green accent bar along top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#205C43] to-transparent" />

          <div className="space-y-6">
            {/* Header Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF3ED] border border-[#D5E5D9] text-xs font-mono text-[#205C43]">
                <User className="w-3.5 h-3.5 text-[#205C43]" />
                <span className="font-semibold text-[#202824]">{t.home.gateways.clientTag}</span>
              </div>
              <span className="text-[11px] font-mono text-[#205C43] bg-[#EAF3ED] px-2.5 py-0.5 rounded-md border border-[#D5E5D9] font-medium">
                {t.home.gateways.escrowProtected}
              </span>
            </div>

            {/* Title & Copy */}
            <div className="space-y-2">
              <h3 className="font-serif text-2xl sm:text-3xl text-[#202824] tracking-tight">
                {t.home.gateways.clientTitle}
              </h3>
              <p className="text-sm text-[#69736D] leading-relaxed">
                {t.home.gateways.clientDesc}
              </p>
            </div>

            {/* Feature Checklist */}
            <div className="space-y-3 pt-2 text-xs text-[#69736D]">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#205C43] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#202824] font-semibold">{t.home.gateways.clientFeature1Title} </strong>
                  {t.home.gateways.clientFeature1Desc}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#205C43] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#202824] font-semibold">{t.home.gateways.clientFeature2Title} </strong>
                  {t.home.gateways.clientFeature2Desc}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#205C43] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#202824] font-semibold">{t.home.gateways.clientFeature3Title} </strong>
                  {t.home.gateways.clientFeature3Desc}
                </span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-8 mt-6 border-t border-[#D5E5D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <MagneticWrapper maxDisplacement={4}>
              <Link
                href="/auth/login?intent=client"
                className="px-6 py-3.5 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white font-semibold text-xs transition-all shadow-md shadow-[#205C43]/15 flex items-center justify-center gap-2 group-hover:bg-[#174530]"
              >
                <span>{t.home.gateways.clientCta}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </MagneticWrapper>

            <Link
              href="/lawyers"
              className="text-xs text-[#69736D] hover:text-[#202824] font-medium transition-colors text-center sm:text-right"
            >
              {t.home.gateways.browseLawyers}
            </Link>
          </div>
        </motion.div>

        {/* LAWYER PATHWAY (6 cols) */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -40px 0px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-6 rounded-2xl bg-white/95 md:bg-[#EAF3ED]/90 backdrop-blur-md border border-[#D5E5D9] hover:border-[#174530] p-7 sm:p-9 flex flex-col justify-between shadow-lg shadow-[#202824]/4 transition-all relative overflow-hidden group"
        >
          {/* Subtle deep forest accent bar along top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#174530] to-transparent" />

          <div className="space-y-6">
            {/* Header Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#D5E5D9] text-xs font-mono text-[#174530]">
                <Briefcase className="w-3.5 h-3.5 text-[#174530]" />
                <span className="font-semibold text-[#202824]">{t.home.gateways.lawyerTag}</span>
              </div>
              <span className="text-[11px] font-mono text-[#174530] bg-white px-2.5 py-0.5 rounded-md border border-[#D5E5D9] font-semibold">
                {t.home.gateways.lawyerBadge}
              </span>
            </div>

            {/* Title & Copy */}
            <div className="space-y-2">
              <h3 className="font-serif text-2xl sm:text-3xl text-[#202824] tracking-tight">
                {t.home.gateways.lawyerTitle}
              </h3>
              <p className="text-sm text-[#69736D] leading-relaxed">
                {t.home.gateways.lawyerDesc}
              </p>
            </div>

            {/* Feature Checklist */}
            <div className="space-y-3 pt-2 text-xs text-[#69736D]">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#174530] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#202824] font-semibold">{t.home.gateways.lawyerFeature1Title} </strong>
                  {t.home.gateways.lawyerFeature1Desc}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#174530] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#202824] font-semibold">{t.home.gateways.lawyerFeature2Title} </strong>
                  {t.home.gateways.lawyerFeature2Desc}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#174530] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#202824] font-semibold">{t.home.gateways.lawyerFeature3Title} </strong>
                  {t.home.gateways.lawyerFeature3Desc}
                </span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-8 mt-6 border-t border-[#D5E5D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <MagneticWrapper maxDisplacement={4}>
              <Link
                href="/auth/login?intent=lawyer"
                className="px-6 py-3.5 rounded-xl bg-[#174530] hover:bg-[#0E2C1E] text-white font-semibold text-xs transition-all shadow-md shadow-[#174530]/15 flex items-center justify-center gap-2 group-hover:bg-[#0E2C1E]"
              >
                <span>{t.home.gateways.lawyerCta}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </MagneticWrapper>

            <Link
              href="#trust"
              className="text-xs text-[#69736D] hover:text-[#202824] font-medium transition-colors text-center sm:text-right"
            >
              {t.home.gateways.rule36Link}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

