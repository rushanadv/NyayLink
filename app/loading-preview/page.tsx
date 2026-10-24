"use client";

import React, { useState } from "react";
import { AnimatedGavelLoader } from "@/components/ui/animated-gavel-loader";
import { AnimatedGavel } from "@/components/ui/animated-gavel";
import { AnimatedGavel3D } from "@/components/ui/animated-gavel-3d";
import { useLanguage } from "@/lib/i18n/context";

export default function LoadingPreviewPage() {
  const { isHindi, setLocale } = useLanguage();
  const [renderMode, setRenderMode] = useState<"auto" | "3d" | "vector">("3d");
  const [showOverlay, setShowOverlay] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAF9] p-6 sm:p-10 space-y-8 max-w-6xl mx-auto">
      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-2xl border border-[#D5E5D9] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-serif font-bold text-[#174530]">
            NyayLink 3D Animated Gavel Loading Studio
          </h1>
          <p className="text-xs text-[#69736D]">
            Inspect 3D Three.js STL spline-sculpted meshes, toCreasedNormals shading, and bilingual legal copy
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Mode Toggle: 3D vs Vector */}
          <div className="flex items-center gap-1 bg-[#EAF3ED] p-1 rounded-lg border border-[#D5E5D9]">
            <button
              type="button"
              onClick={() => setRenderMode("3d")}
              className={`px-3 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                renderMode === "3d" ? "bg-[#205C43] text-white font-semibold shadow-xs" : "text-[#202824]"
              }`}
            >
              3D STL Mesh
            </button>
            <button
              type="button"
              onClick={() => setRenderMode("vector")}
              className={`px-3 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                renderMode === "vector" ? "bg-[#205C43] text-white font-semibold shadow-xs" : "text-[#202824]"
              }`}
            >
              2D Vector SVG
            </button>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center gap-1 bg-[#EAF3ED] p-1 rounded-lg border border-[#D5E5D9]">
            <button
              type="button"
              onClick={() => setLocale("en")}
              className={`px-3 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                !isHindi ? "bg-[#205C43] text-white font-semibold" : "text-[#202824]"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLocale("hi")}
              className={`px-3 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
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
            className="px-4 py-2 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white text-xs font-semibold shadow-xs cursor-pointer transition-all hover:scale-102"
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
            Section / Card Variant (3D Modular STL Assets)
          </span>
          <AnimatedGavelLoader variant="section" renderMode={renderMode} />
        </div>

        {/* Standalone 3D Viewport Showcase */}
        <div className="p-6 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs flex flex-col items-center justify-center text-center space-y-3">
          <span className="text-xs font-mono font-semibold text-[#69736D] uppercase">
            Standalone Three.js 3D Viewport (toCreasedNormals @ π/4)
          </span>
          <div className="py-1">
            <AnimatedGavel3D width={300} height={210} />
          </div>
          <div className="text-left font-mono text-[10.5px] text-[#4F5953] space-y-0.5 bg-[#F4F9F5] p-3 rounded-lg border border-[#D5E5D9] w-full">
            <p>• Head: Y-axis, bottom striking face Y=-1.46 (creased)</p>
            <p>• Brass Band: concentric collar + trim rings + -X ferrule</p>
            <p>• Handle: extends along -X (X=-0.55 to -4.75)</p>
            <p>• Sound block: Y=-1.50, plateau Y=-1.30 (exact 0-gap contact)</p>
          </div>
        </div>
      </div>

      {/* 2D Vector Standalone & Inline Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs flex flex-col items-center justify-center text-center space-y-2">
          <span className="text-xs font-mono font-semibold text-[#69736D] uppercase">
            Fallback Vector SVG Gavel
          </span>
          <div className="py-2">
            <AnimatedGavel size="md" />
          </div>
          <p className="text-[11px] text-[#69736D]">
            Instant fallback if WebGL is unavailable
          </p>
        </div>

        <div className="md:col-span-2 space-y-3 bg-white p-6 rounded-2xl border border-[#D5E5D9] shadow-xs flex flex-col justify-center">
          <span className="text-xs font-mono font-semibold text-[#69736D] uppercase block">
            Inline / Contextual Badges
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
      </div>

      {/* Fullscreen Overlay Test Modal */}
      {showOverlay && (
        <div className="relative">
          <AnimatedGavelLoader variant="fullscreen" renderMode={renderMode} />
          <button
            type="button"
            onClick={() => setShowOverlay(false)}
            className="fixed top-6 right-6 z-[60] px-4 py-2 rounded-xl bg-white/95 hover:bg-white text-[#202824] border border-[#D5E5D9] text-xs font-semibold shadow-md cursor-pointer hover:scale-105 transition-transform"
          >
            Close Fullscreen [X]
          </button>
        </div>
      )}
    </div>
  );
}
