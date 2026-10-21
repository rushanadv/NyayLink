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

export function TwoAudiences() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="audiences" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-24">
      {/* Section Header */}
      <div className="max-w-3xl mb-14 space-y-3">
        <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em]">
          <span className="w-4 h-px bg-[#205C43]" />
          <span className="text-[#205C43] font-bold">04</span>
          <span className="text-[#D5E5D9]">{"//"}</span>
          <span className="text-[#69736D] font-semibold">TWO AUDIENCES</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#202824] font-normal tracking-tight text-balance">
          Two audiences. One unified platform.
        </h2>
        <p className="text-base text-[#69736D] leading-relaxed max-w-2xl font-light">
          Whether you need structured guidance on a dispute or modern digital infrastructure for your legal practice, NyayaLink connects both sides with transparency and compliance.
        </p>
      </div>

      {/* Split Editorial Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* SIDE A: FOR CLIENTS */}
        <div id="for-clients" className="scroll-mt-28">
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl bg-white border border-[#D5E5D9] p-8 sm:p-10 flex flex-col justify-between h-full shadow-xs"
          >
            <div className="space-y-6">
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#205C43] font-semibold flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#205C43]" />
                  CLIENT EXPERIENCE
                </span>
                <span className="text-xs font-mono text-[#69736D]">Accessible & Transparent</span>
              </div>

              {/* Title & Description */}
              <div className="space-y-3">
                <h3 className="font-serif text-2xl sm:text-3xl text-[#202824] tracking-tight">
                  Demystifying the Indian legal process for citizens.
                </h3>
                <p className="text-sm text-[#69736D] leading-relaxed">
                  Navigating legal issues often involves confusing jargon, uncertain court fees, and difficulty identifying the right advocate. NyayaLink replaces uncertainty with structured clarity: understand your matter in plain language, verify your advocate&apos;s credentials, and consult with full fee protection.
                </p>
              </div>

              {/* Capability List */}
              <div className="space-y-3 pt-2 text-xs text-[#69736D] border-t border-[#D5E5D9]">
                <div className="flex items-start gap-2.5 pt-3">
                  <CheckCircle2 className="w-4 h-4 text-[#205C43] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#202824]">Plain-Language Problem Framing:</strong> Express your situation without having to know legal sections beforehand.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#205C43] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#202824]">Verified Bar Council Credentials:</strong> Search advocates by enrollment ID, specific courts, and language.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#205C43] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#202824]">Transparent Milestone Escrow:</strong> Your payment remains securely protected until agreed consultation steps occur.
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
                <span>Continue as a Client</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/lawyers"
                className="text-xs text-[#69736D] hover:text-[#202824] font-medium transition-colors"
              >
                Search Lawyers →
              </Link>
            </div>
          </motion.div>
        </div>

        {/* SIDE B: FOR ADVOCATES */}
        <div id="for-advocates" className="scroll-mt-28">
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl bg-white/95 md:bg-[#EAF3ED]/90 backdrop-blur-md border border-[#D5E5D9] p-8 sm:p-10 flex flex-col justify-between h-full shadow-xs"
          >
            <div className="space-y-6">
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#174530] font-semibold flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-[#174530]" />
                  ADVOCATE CHAMBERS INFRASTRUCTURE
                </span>
                <span className="text-xs font-mono text-[#69736D]">Section 36 Compliant</span>
              </div>

              {/* Title & Description */}
              <div className="space-y-3">
                <h3 className="font-serif text-2xl sm:text-3xl text-[#202824] tracking-tight">
                  Digital chamber workflows for practicing advocates.
                </h3>
                <p className="text-sm text-[#69736D] leading-relaxed">
                  Litigation counsel manage crowded cause lists, manual client onboarding, and paper-based authorizations. NyayaLink equips your practice with modern, compliant tools: automated cause list tracking, digital Vakalatnama execution, and direct retainer settlement.
                </p>
              </div>

              {/* Capability List */}
              <div className="space-y-3 pt-2 text-xs text-[#69736D] border-t border-[#D5E5D9]">
                <div className="flex items-start gap-2.5 pt-3">
                  <CheckCircle2 className="w-4 h-4 text-[#174530] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#202824]">Daily e-Courts Cause List Sync:</strong> Item number alerts and listing updates synchronized to your calendar.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#174530] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#202824]">Digital Vakalatnama (Section 65B):</strong> Legally enforceable client authorization signed with Aadhaar OTP.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#174530] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#202824]">Zero Referral Commission:</strong> 100% of client retainer funds released directly without platform deductions.
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
                <span>Continue as a Lawyer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="#trust"
                className="text-xs text-[#69736D] hover:text-[#202824] font-medium transition-colors"
              >
                Ethics & Standards →
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
