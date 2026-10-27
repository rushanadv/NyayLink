"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Scale,
  Languages,
  Lock,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { FEATURES } from "@/lib/marketing/features-data";
import { FeaturePreview } from "./feature-preview";
import { CaseStatusWidget } from "./case-status-widget";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { HeroHeadlineReveal } from "./hero-headline-reveal";

export function HeroSplit() {
  const [activeFeature, setActiveFeature] = useState<number>(0);
  const [isInteracting, setIsInteracting] = useState<boolean>(false);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-advance timer (4.5s)
  useEffect(() => {
    if (isInteracting) return;

    const timer = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % FEATURES.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [isInteracting]);

  // Pause auto-advance on interaction and resume after inactivity
  const handleUserInteraction = useCallback((index: number) => {
    setActiveFeature(index);
    setIsInteracting(true);

    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }

    resumeTimeoutRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, 8000);
  }, []);

  const handleMouseEnter = () => {
    setIsInteracting(true);
  };

  const handleMouseLeave = () => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    resumeTimeoutRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, 5000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 lg:py-16">
      {/* Top Floating Highlight Status Pill */}
      <div className="mb-8 flex items-center justify-between">
        <CaseStatusWidget />
      </div>

      {/* Two-Column 38/62 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* LEFT PANEL (~38% column width: 5 cols out of 12) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 flex flex-col space-y-8 select-none">
          {/* Eyebrow Label — Architectural Mono, Not a Pill */}
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-px bg-[#C5A059]" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/70 font-medium">
              NyayLink // National Legal Technology Infrastructure
            </span>
          </div>

          {/* Large Serif 2-Line Headline — Expanded Typographic Scale */}
          <div className="space-y-2">
            <h1 className="tracking-tight text-white leading-[1.04]">
              <HeroHeadlineReveal
                text="Justice without intermediaries."
                className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-[64px] font-normal tracking-tight text-white block text-balance"
              />
              <span className="block text-white/75 font-sans text-xl sm:text-2xl lg:text-[26px] mt-3 font-light tracking-tight text-balance leading-snug">
                State Bar Council–verified advocates. Milestone escrow protection. Vernacular intake.
              </span>
            </h1>
          </div>

          {/* 4 Stamped & Sealed Verification Chips — Differentiated from Ambient Ticker (Tier 2: rounded-lg) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#C5A059]/[0.06] border border-[#C5A059]/30 shadow-[inset_0_1px_0_rgba(197,160,89,0.15)]">
              <div className="w-5 h-5 rounded-lg bg-[#C5A059]/15 border border-[#C5A059]/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
              </div>
              <div className="min-w-0">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#DFBE7E] block font-semibold leading-tight">
                  Enrolled Advocates
                </span>
                <span className="text-[11px] text-white/80 block truncate">
                  State Bar Council Enrolled
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#C5A059]/[0.06] border border-[#C5A059]/30 shadow-[inset_0_1px_0_rgba(197,160,89,0.15)]">
              <div className="w-5 h-5 rounded-lg bg-[#C5A059]/15 border border-[#C5A059]/30 flex items-center justify-center shrink-0">
                <Scale className="w-3.5 h-3.5 text-[#C5A059]" />
              </div>
              <div className="min-w-0">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#DFBE7E] block font-semibold leading-tight">
                  Rule 36 Compliant
                </span>
                <span className="text-[11px] text-white/80 block truncate">
                  Zero Touting or Solicitation
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#C5A059]/[0.06] border border-[#C5A059]/30 shadow-[inset_0_1px_0_rgba(197,160,89,0.15)]">
              <div className="w-5 h-5 rounded-lg bg-[#C5A059]/15 border border-[#C5A059]/30 flex items-center justify-center shrink-0">
                <Lock className="w-3.5 h-3.5 text-[#C5A059]" />
              </div>
              <div className="min-w-0">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#DFBE7E] block font-semibold leading-tight">
                  Milestone Escrow
                </span>
                <span className="text-[11px] text-white/80 block truncate">
                  Stage-Released Retainers
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#C5A059]/[0.06] border border-[#C5A059]/30 shadow-[inset_0_1px_0_rgba(197,160,89,0.15)]">
              <div className="w-5 h-5 rounded-lg bg-[#C5A059]/15 border border-[#C5A059]/30 flex items-center justify-center shrink-0">
                <Languages className="w-3.5 h-3.5 text-[#C5A059]" />
              </div>
              <div className="min-w-0">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#DFBE7E] block font-semibold leading-tight">
                  Vernacular Engine
                </span>
                <span className="text-[11px] text-white/80 block truncate">
                  14 Indian Languages
                </span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <MagneticWrapper maxDisplacement={8}>
              <Link
                href="/lawyers"
                className="px-6 py-3 rounded-lg bg-[#C5A059] hover:bg-[#DFBE7E] text-[#090B10] font-semibold text-sm transition-all duration-200 shadow-lg shadow-[#C5A059]/20 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
              >
                <span>Find a Lawyer</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </MagneticWrapper>
            <MagneticWrapper maxDisplacement={8}>
              <Link
                href="/auth/login?intent=lawyer"
                className="px-5 py-3 rounded-lg border border-border-default hover:border-border-strong text-white/90 hover:text-white font-medium text-sm transition-colors bg-surface-raised hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-strong block"
              >
                Join as a Lawyer
              </Link>
            </MagneticWrapper>
          </div>

          {/* Numbered Feature List (dimension.dev inspired driver) */}
          <div
            className="pt-4 space-y-1"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            role="tablist"
            aria-label="Platform Interactive Features"
          >
            <div className="flex items-center justify-between pb-2 text-[11px] font-mono text-white/40 uppercase tracking-wider">
              <span>Platform Capabilities</span>
              <span>
                {isInteracting ? "Paused · Manual" : "Auto-Advancing"}
              </span>
            </div>

            {FEATURES.map((item, index) => {
              const isActive = activeFeature === index;

              return (
                <button
                  key={item.id}
                  onClick={() => handleUserInteraction(index)}
                  role="tab"
                  id={`feature-tab-${index}`}
                  aria-selected={isActive}
                  aria-controls={`feature-panel-${index}`}
                  className={`w-full text-left relative px-3.5 py-2.5 rounded-lg transition-all duration-300 flex items-center gap-3.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-strong ${
                    isActive
                      ? "bg-surface-hover text-white shadow-sm"
                      : "text-slate-400/80 hover:text-white/90 hover:bg-surface-raised"
                  }`}
                >
                  {/* Left Accent Bar */}
                  <div
                    className={`absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full transition-all duration-300 ${
                      isActive
                        ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                        : "bg-transparent"
                    }`}
                  />

                  {/* Feature Index Number */}
                  <span
                    className={`font-mono text-xs font-semibold transition-colors ${
                      isActive ? "text-white" : "text-white/30"
                    }`}
                  >
                    {item.number}
                  </span>

                  {/* Feature Title & Subtitle */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-medium tracking-wide truncate ${
                          isActive ? "text-white" : "text-slate-300/80"
                        }`}
                      >
                        {item.title}
                      </span>
                      {isActive && (
                        <ChevronRight className="w-3.5 h-3.5 text-white/60 shrink-0" />
                      )}
                    </div>
                    <p
                      className={`text-[11px] truncate transition-colors ${
                        isActive ? "text-white/70" : "text-white/35"
                      }`}
                    >
                      {item.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL (~62% column width: 7 cols out of 12) */}
        <div
          className="lg:col-span-7 w-full"
          id={`feature-panel-${activeFeature}`}
          role="tabpanel"
          aria-labelledby={`feature-tab-${activeFeature}`}
        >
          <FeaturePreview activeIndex={activeFeature} />
        </div>
      </div>
    </div>
  );
}
