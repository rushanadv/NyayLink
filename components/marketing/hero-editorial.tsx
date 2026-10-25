"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Briefcase, UserCheck, Sparkles } from "lucide-react";
import { HeroHeadlineReveal } from "./hero-headline-reveal";
import { UnfoldingBrief } from "./unfolding-brief";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/context";

export function HeroEditorial() {
  const { t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16 lg:py-20">
      {/* Two-Column Balanced Editorial Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center">
        {/* LEFT COLUMN: Editorial Typography & Clean Dual Audience Choice (6 cols) */}
        <div className="lg:col-span-6 flex flex-col space-y-6 sm:space-y-8 items-start">
          {/* Understated Eyebrow Label */}
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-px bg-[#205C43]" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#69736D] font-semibold">
              {t.home.hero.eyebrow}
            </span>
          </div>

          {/* Headline & Concise Supporting Copy */}
          <div className="space-y-4 w-full">
            <h1 className="tracking-tight leading-[1.08] text-left">
              <HeroHeadlineReveal
                text={t.home.hero.title}
                className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[46px] xl:text-[54px] font-normal tracking-tight text-[#202824] leading-[1.08] text-left block"
              />
            </h1>
            <motion.p
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.75,
                delay: 0.36,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="text-base sm:text-lg text-[#69736D] font-light leading-relaxed max-w-xl text-left"
            >
              {t.home.hero.subtitle}
            </motion.p>
          </div>

          {/* Two Clear Primary Role Actions */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.48,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto"
          >
            {/* Primary Action: For Citizens & Legal Help Seekers */}
            <MagneticWrapper maxDisplacement={4}>
              <Link
                href="/auth/login?intent=client"
                className="px-6 py-3.5 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white font-semibold text-xs transition-all shadow-md shadow-[#205C43]/15 flex items-center justify-center gap-2 text-center"
              >
                <UserCheck className="w-4 h-4 text-[#EAF3ED]" />
                <span>{t.home.hero.needHelp}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </MagneticWrapper>

            {/* Secondary Action: For Practicing Advocates */}
            <Link
              href="/auth/sign-up?intent=lawyer"
              className="px-5 py-3.5 rounded-xl bg-white hover:bg-[#EAF3ED]/80 border border-[#D5E5D9] hover:border-[#205C43]/40 text-[#202824] font-semibold text-xs transition-all flex items-center justify-center gap-2 text-center shadow-xs"
            >
              <Briefcase className="w-4 h-4 text-[#205C43]" />
              <span>{t.home.hero.joinAdvocate}</span>
            </Link>
          </motion.div>

          {/* Quieter Secondary Guidance Link */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.6,
              delay: 0.58,
              ease: "easeOut",
            }}
            className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#69736D]"
          >
            <span>{t.home.hero.preliminaryQuestion}</span>
            <Link
              href="/intake"
              className="inline-flex items-center gap-1.5 font-semibold text-[#205C43] hover:text-[#174530] hover:underline transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#205C43]" />
              <span>{t.home.hero.preliminaryLink}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: The Unfolding Brief Interactive Legal Folio (6 cols) */}
        <div className="lg:col-span-6 w-full lg:pt-1">
          <UnfoldingBrief />
        </div>
      </div>
    </div>
  );
}
