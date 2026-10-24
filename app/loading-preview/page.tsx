"use client";

import React, { useState } from "react";
import { AnimatedGavelLoader } from "@/components/ui/animated-gavel-loader";
import { AnimatedGavel } from "@/components/ui/animated-gavel";
import { useLanguage } from "@/lib/i18n/context";

export default function LoadingPreviewPage() {
  const { isHindi, setLocale } = useLanguage();
  const [activeVariant, setActiveVariant] = useState<"fullscreen" | "section" | "inline">("section");
  const [showOverlay, setShowOverlay] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAF9] p-6 sm:p-10 space-y-8 max-w-5xl mx-auto">
      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-2xl border border-[#D5E5D9] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-serif font-bold text-[#174530]">
            NyayLink Animated Gavel Loading Studio
          </h1>
          <p className="text-xs text-[#69736D]">
            Inspect vector gavel physics, impact ripples, recoil, and bilingual legal copy
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <div className="flex items-center gap-1 bg-[#EAF3ED] p-1 rounded-lg border border-[#D5E5D9]">
            <button
              type="button"
              onClick={() => setLocale("en")}
              className={`px-3 py-1 rounded text-xs font-medium cursor-pointer ${
                !isHindi ? "bg-[#205C43] text-white font-semibold" : "text-[#202824]"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLocale("hi")}
              className={`px-3 py-1 rounded text-xs font-medium cursor-pointer ${
                isHindi ? "bg-[#205C43] text-white font-semibold" : "text-[#202824]"
              }`}
            >
              हिंदी
            </button>
          </div>

          {/* Trigger Fullscreen Modal */}
          <button
            type="button"
            onClick={() => setShowOverlay(true)}
            className="px-4 py-2 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white text-xs font-semibold shadow-xs cursor-pointer"
          >
            Preview Fullscreen Experience
          </button>
        </div>
      </div>

      {/* Grid of Variants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Section Variant */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-semibold text-[#69736D] uppercase">
            Section / Card Variant (for Suspense & Tabs)
          </span>
          <AnimatedGavelLoader variant="section" />
        </div>

        {/* Standalone Vector Physics Showcase */}
        <div className="p-8 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs flex flex-col items-center justify-center text-center space-y-4">
          <span className="text-xs font-mono font-semibold text-[#69736D] uppercase">
            Standalone Vector Gavel (1.12s loop, recoil, ripples)
          </span>
          <div className="py-2">
            <AnimatedGavel size="lg" />
          </div>
          <p className="text-xs text-[#69736D] max-w-xs font-mono text-[11px]">
            Wrist pivot: 126px 45px · Gravity acceleration · Anvil compression: 0.97
          </p>
        </div>
      </div>

      {/* Inline Variant Showcase */}
      <div className="space-y-3 bg-white p-6 rounded-2xl border border-[#D5E5D9] shadow-xs">
        <span className="text-xs font-mono font-semibold text-[#69736D] uppercase block">
          Inline / Contextual Variants (for badge operations)
        </span>
        <div className="flex flex-wrap items-center gap-4">
          <AnimatedGavelLoader variant="inline" />
          <AnimatedGavelLoader
            variant="inline"
            message={isHindi ? "सत्यापन प्रक्रिया जारी है…" : "Verifying Bar Council status…"}
            submessage={isHindi ? "अधिवक्ता रोल 2026" : "BCI Roll Check"}
          />
        </div>
      </div>

      {/* Fullscreen Overlay Test Modal */}
      {showOverlay && (
        <div className="relative">
          <AnimatedGavelLoader variant="fullscreen" />
          <button
            type="button"
            onClick={() => setShowOverlay(false)}
            className="fixed top-6 right-6 z-[60] px-3.5 py-1.5 rounded-lg bg-white/90 hover:bg-white text-[#202824] border border-[#D5E5D9] text-xs font-semibold shadow-md cursor-pointer"
          >
            Close Fullscreen [X]
          </button>
        </div>
      )}
    </div>
  );
}
