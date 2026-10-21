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

export function HowItWorks() {
  const shouldReduceMotion = useReducedMotion();

  const steps = [
    {
      number: "01",
      title: "Describe what you need help with",
      subtitle: "Plain-language and vernacular intake",
      description:
        "Speak or write your matter in everyday words or regional Indian languages. Our legal intake structures the factual core, identifies relevant statutes under Bharatiya Nyaya Sanhita, CPC, or specialized acts, and checks limitation periods.",
      badge: "Vernacular Intake",
      icon: MessageSquareText,
      detail: "Translates everyday speech into structured legal issues and forum jurisdiction.",
    },
    {
      number: "02",
      title: "Explore relevant information & verified counsel",
      subtitle: "Bar Council of India roll validation",
      description:
        "Filter enrolled advocates by specific court jurisdiction (Supreme Court, High Courts, NCLT, DRT, District Courts), matter specialization, and spoken language. Every advocate listing is cross-checked against official Bar Council registers.",
      badge: "Real-time BCI Check",
      icon: FileSearch,
      detail: "View upfront, transparent consultation fees with zero surprise clerk expenses.",
    },
    {
      number: "03",
      title: "Connect and consult under milestone escrow",
      subtitle: "Protected legal engagement",
      description:
        "Book a scheduled 15-minute preliminary strategy conference. Execute an enforceable digital Vakalatnama using Aadhaar OTP under Section 65B. Your legal retainer is held in milestone escrow and disbursed only as agreed filing stages complete.",
      badge: "Milestone Escrow",
      icon: ShieldCheck,
      detail: "100% of escrow retainer released directly to counsel with zero referral commission.",
    },
  ];

  return (
    <section id="how-it-works" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-24">
      {/* Header */}
      <div className="max-w-3xl mb-14 space-y-3">
        <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em]">
          <span className="w-4 h-px bg-[#205C43]" />
          <span className="text-[#205C43] font-bold">03</span>
          <span className="text-[#D5E5D9]">{"//"}</span>
          <span className="text-[#69736D] font-semibold">PROCEDURAL FLOW</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#202824] font-normal tracking-tight text-balance">
          How NyayaLink works.
        </h2>
        <p className="text-base text-[#69736D] leading-relaxed max-w-2xl font-light">
          Three structured stages engineered to eliminate procedural opacity and connect citizens directly with verified advocates.
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
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              className="rounded-2xl bg-white border border-[#D5E5D9] hover:border-[#205C43]/50 p-7 flex flex-col justify-between shadow-xs transition-all relative group"
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

      {/* Workflow Navigation Action */}
      <div className="mt-12 text-center">
        <Link
          href="/auth/login?intent=client"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white font-semibold text-xs transition-all shadow-md shadow-[#205C43]/15"
        >
          <span>Begin with Structured Intake</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}
