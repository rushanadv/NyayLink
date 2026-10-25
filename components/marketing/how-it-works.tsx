"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  MessageSquareText,
  FileSearch,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

export function HowItWorks() {
  const { t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  const steps = [
    {
      number: t.home.howItWorks.step1Number,
      title: t.home.howItWorks.step1Title,
      subtitle: t.home.howItWorks.step1Subtitle,
      description: t.home.howItWorks.step1Desc,
      badge: t.home.howItWorks.step1Badge,
      icon: MessageSquareText,
      detail: t.home.howItWorks.step1Detail,
    },
    {
      number: t.home.howItWorks.step2Number,
      title: t.home.howItWorks.step2Title,
      subtitle: t.home.howItWorks.step2Subtitle,
      description: t.home.howItWorks.step2Desc,
      badge: t.home.howItWorks.step2Badge,
      icon: FileSearch,
      detail: t.home.howItWorks.step2Detail,
    },
    {
      number: t.home.howItWorks.step3Number,
      title: t.home.howItWorks.step3Title,
      subtitle: t.home.howItWorks.step3Subtitle,
      description: t.home.howItWorks.step3Desc,
      badge: t.home.howItWorks.step3Badge,
      icon: ShieldCheck,
      detail: t.home.howItWorks.step3Detail,
    },
  ];

  return (
    <section id="how-it-works" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-24">
      {/* Header */}
      <div className="max-w-3xl mb-14 space-y-3">
        <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em]">
          <span className="w-4 h-px bg-[#205C43]" />
          <span className="text-[#205C43] font-bold">02</span>
          <span className="text-[#D5E5D9]">{"//"}</span>
          <span className="text-[#69736D] font-semibold">{t.home.howItWorks.eyebrow}</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#202824] font-normal tracking-tight text-balance">
          {t.home.howItWorks.title}
        </h2>
        <p className="text-base text-[#69736D] leading-relaxed max-w-2xl font-light">
          {t.home.howItWorks.subtitle}
        </p>
      </div>

      {/* Editorial Timeline Progression Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;

          return (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -40px 0px" }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              className="rounded-2xl bg-white border border-[#D5E5D9] hover:border-[#205C43]/50 p-7 sm:p-8 flex flex-col justify-between shadow-xs transition-all relative group"
            >
              <div className="space-y-5">
                {/* Step Number & Icon */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-3xl font-light text-[#D5E5D9] group-hover:text-[#205C43] transition-colors">
                    {step.number}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center text-[#205C43]">
                    <Icon className="w-4 h-4 text-[#205C43]" />
                  </div>
                </div>

                {/* Title & Badge */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#205C43] font-semibold block">
                    {step.badge}
                  </span>
                  <h3 className="font-serif text-xl text-[#202824] tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#69736D] font-medium">
                    {step.subtitle}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-[#69736D] leading-relaxed pt-1">
                  {step.description}
                </p>
              </div>

              {/* Detail Footer */}
              <div className="pt-5 mt-6 border-t border-[#D5E5D9] flex items-center gap-2 text-[11px] text-[#202824]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#205C43] shrink-0" />
                <span className="font-medium">{step.detail}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Contextual Link */}
      <div className="mt-12 text-center">
        <Link
          href="/intake"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white font-semibold text-xs transition-all shadow-md shadow-[#205C43]/15"
        >
          <span>{t.home.hero.needHelp}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}
