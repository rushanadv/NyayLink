"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ShieldCheck, Lock, RefreshCw, FileCheck2 } from "lucide-react";
import { MomentumRing } from "@/components/effects/momentum-ring";
import { ParticleImage } from "@/components/effects/particle-image";
import { useLanguage } from "@/lib/i18n/context";

export function TrustCompliance() {
  const { t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="trust" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px 0px -40px 0px" }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl bg-white border border-[#D5E5D9] p-8 sm:p-12 lg:p-14 shadow-sm space-y-10 relative overflow-hidden"
      >
        {/* Top Header & Scales Visual */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em]">
              <span className="w-4 h-px bg-[#205C43]" />
              <span className="text-[#205C43] font-bold">04</span>
              <span className="text-[#D5E5D9]">{"//"}</span>
              <span className="text-[#69736D] font-semibold">{t.home.trust.eyebrow}</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[40px] text-[#202824] font-normal leading-snug tracking-tight text-balance">
              {t.home.trust.title}
            </h2>
            <p className="text-sm text-[#69736D] leading-relaxed max-w-2xl font-light">
              {t.home.trust.desc}
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 select-none">
            <ParticleImage size={210} highlightColor="#205C43" accentColor="#174530" />
            <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-[#69736D]">
              {t.home.trust.neutralTech}
            </p>
          </div>
        </div>

        {/* 3D Dynamic Momentum Ring */}
        <div className="py-2">
          <MomentumRing />
        </div>

        {/* 4 Stamped Institutional Safeguards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-[#D5E5D9] text-xs">
          <div className="p-4 rounded-xl bg-[#EAF3ED]/30 border border-[#D5E5D9] flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-lg bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4 text-[#205C43]" />
            </div>
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#205C43] block font-semibold">
                {t.home.trust.card1Title}
              </span>
              <span className="text-xs text-[#69736D] block mt-1 leading-relaxed">
                {t.home.trust.card1Desc}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#EAF3ED]/30 border border-[#D5E5D9] flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-lg bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="w-4 h-4 text-[#174530]" />
            </div>
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#174530] block font-semibold">
                {t.home.trust.card2Title}
              </span>
              <span className="text-xs text-[#69736D] block mt-1 leading-relaxed">
                {t.home.trust.card2Desc}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#EAF3ED]/30 border border-[#D5E5D9] flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-lg bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center shrink-0 mt-0.5">
              <RefreshCw className="w-4 h-4 text-[#205C43]" />
            </div>
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#205C43] block font-semibold">
                {t.home.trust.card3Title}
              </span>
              <span className="text-xs text-[#69736D] block mt-1 leading-relaxed">
                {t.home.trust.card3Desc}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#EAF3ED]/30 border border-[#D5E5D9] flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-lg bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center shrink-0 mt-0.5">
              <FileCheck2 className="w-4 h-4 text-[#174530]" />
            </div>
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#174530] block font-semibold">
                {t.home.trust.card4Title}
              </span>
              <span className="text-xs text-[#69736D] block mt-1 leading-relaxed">
                {t.home.trust.card4Desc}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
