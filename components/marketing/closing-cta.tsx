"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, UserCheck, Briefcase } from "lucide-react";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";

export function ClosingCta() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="cta" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-28 scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px 0px -40px 0px" }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl bg-white border border-[#D5E5D9] p-10 sm:p-16 lg:p-20 text-center space-y-10 shadow-lg shadow-[#202824]/4 relative overflow-hidden"
      >
        {/* Subtle pale mint ambient glow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-[#EAF3ED] to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto space-y-4 relative z-10">
          <div className="flex items-center justify-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em]">
            <span className="w-4 h-px bg-[#205C43]" />
            <span className="text-[#205C43] font-bold">06</span>
            <span className="text-[#D5E5D9]">{"//"}</span>
            <span className="text-[#69736D] font-semibold">GET STARTED</span>
            <span className="w-4 h-px bg-[#205C43]" />
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#202824] font-normal tracking-tight text-balance">
            Find the right legal path forward.
          </h2>
          <p className="text-base sm:text-lg text-[#69736D] leading-relaxed max-w-xl mx-auto font-light">
            Connect with verified counsel or access your advocate chamber workspace today.
          </p>
        </div>

        {/* Dual Integrated Closing Paths */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto relative z-10 text-left">
          {/* Client Decision Card */}
          <div className="p-6 rounded-2xl bg-white border border-[#D5E5D9] flex flex-col justify-between space-y-5 shadow-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#202824]">
                <UserCheck className="w-4 h-4 text-[#205C43]" />
                <span>NEED LEGAL HELP?</span>
              </div>
              <p className="text-xs text-[#69736D] leading-relaxed">
                Describe your situation, clarify remedies, and consult verified counsel under milestone escrow.
              </p>
            </div>

            <MagneticWrapper maxDisplacement={3}>
              <Link
                href="/auth/login?intent=client"
                className="w-full py-3 px-4 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span>Continue as a client</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </MagneticWrapper>
          </div>

          {/* Lawyer Decision Card */}
          <div className="p-6 rounded-2xl bg-[#EAF3ED]/50 border border-[#D5E5D9] flex flex-col justify-between space-y-5 shadow-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#202824]">
                <Briefcase className="w-4 h-4 text-[#174530]" />
                <span>PRACTICING ADVOCATE?</span>
              </div>
              <p className="text-xs text-[#69736D] leading-relaxed">
                Access your cause list alerts, digital Vakalatnama signing, and client brief dossiers.
              </p>
            </div>

            <MagneticWrapper maxDisplacement={3}>
              <Link
                href="/auth/login?intent=lawyer"
                className="w-full py-3 px-4 rounded-xl bg-[#174530] hover:bg-[#0E2C1E] text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span>Continue as a lawyer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </MagneticWrapper>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
