"use client";

import React, { useState, useRef, useEffect, useCallback, useId } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  RotateCcw,
  Scale,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

type PracticeTabKey = "property" | "family" | "criminal" | "consumer";

interface TabMeta {
  key: PracticeTabKey;
  roman: string;
  defaultY: number;
}

const TAB_METAS: TabMeta[] = [
  { key: "property", roman: "I", defaultY: 0 },
  { key: "family", roman: "II", defaultY: 1 },
  { key: "criminal", roman: "III", defaultY: 2 },
  { key: "consumer", roman: "IV", defaultY: 3 },
];

export function UnfoldingBrief() {
  const { t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const [selectedKey, setSelectedKey] = useState<PracticeTabKey | null>(null);
  const [hoveredKey, setHoveredKey] = useState<PracticeTabKey | null>(null);
  const [isEntranceDone, setIsEntranceDone] = useState(false);

  // 3D Tilt physics
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<{ rx: number; ry: number; px: number; py: number }>({
    rx: 0,
    ry: 0,
    px: 0.5,
    py: 0.5,
  });

  const filterId = useId();

  // Entrance timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsEntranceDone(true);
    }, 1100);
    return () => clearTimeout(timer);
  }, []);

  // Pointer move handler with restrained dampening
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (shouldReduceMotion || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      // Restrained tilt angles (-5 deg to +5 deg)
      const rx = (0.5 - y) * 8;
      const ry = (x - 0.5) * 10;

      setTilt({ rx, ry, px: x, py: y });
    },
    [shouldReduceMotion]
  );

  const handlePointerLeave = useCallback(() => {
    setTilt({ rx: 0, ry: 0, px: 0.5, py: 0.5 });
    setHoveredKey(null);
  }, []);

  const handleSelectTab = (key: PracticeTabKey) => {
    setSelectedKey(key);
  };

  const handleRefold = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedKey(null);
  };

  // Safe dictionary resolution
  const briefCopy = t.home.brief || {
    eyebrow: "THE UNFOLDING BRIEF",
    title: "From Complexity to Clarity",
    subtitle: "Unfold the brief to uncover your legal path forward",
    refold: "Refold Brief",
    hint: "Interactive Legal Folio • Select an index fold to explore practice pathways",
    initialStateLabel: "Folio Suspended · Select a starting domain",
    exploreAdvocates: "Explore advocates",
    getGuidance: "Get initial legal guidance",
    verifiedBadge: "Verified State Bar Council Advocates",
    pathwayUnfolded: "Legal Pathway Unfolded",
    stampLabel: "NYAYLINK · JURISPRUDENCE FOLIO",
    tabs: {
      property: {
        id: "property",
        tab: "I. Property & Tenancy",
        tabShort: "I. Property",
        title: "Property & Tenancy",
        desc: "Resolving tenancy disputes, title verification, builder handover delays, and RERA compliance proceedings.",
        statute: "Real Estate (Regulation and Development) Act 2016 · Transfer of Property Act",
        canonicalArea: "Real Estate & RERA",
      },
      family: {
        id: "family",
        tab: "II. Family Matters",
        tabShort: "II. Family",
        title: "Family Matters",
        desc: "Guiding mutual consent petitions, matrimonial rights, lawful maintenance, and transparent custody arrangements.",
        statute: "Special Marriage Act 1954 · Hindu Marriage Act 1955 · Family Courts Act",
        canonicalArea: "Family & Matrimonial",
      },
      criminal: {
        id: "criminal",
        tab: "III. Criminal Law",
        tabShort: "III. Criminal",
        title: "Criminal Law",
        desc: "Structuring anticipatory bail applications, FIR review, quashing petitions, and formal defense counsel matching.",
        statute: "Bharatiya Nyaya Sanhita 2023 · Bharatiya Nagarik Suraksha Sanhita 2023",
        canonicalArea: "Criminal Law",
      },
      consumer: {
        id: "consumer",
        tab: "IV. Consumer Disputes",
        tabShort: "IV. Consumer",
        title: "Consumer Disputes",
        desc: "Addressing deficient goods or commercial services, misleading trade conduct, and District / State Commission filings.",
        statute: "Consumer Protection Act 2019 · E-Commerce Rules & Standards",
        canonicalArea: "Consumer Protection",
      },
    },
  };

  const activeTabMeta = selectedKey ? briefCopy.tabs[selectedKey] : null;

  // Compute SVG ink trail target coordinates depending on active tab
  // Brass grommet is at (48, 38). Tab notch centers are at:
  // Tab 0 (Property): (87, 388)
  // Tab 1 (Family):   (219, 388)
  // Tab 2 (Criminal): (351, 388)
  // Tab 3 (Consumer): (483, 388)
  const getInkPath = () => {
    if (!selectedKey) {
      // Meandering initial path flowing gracefully down the margin rule
      return "M 48 42 L 48 150 C 48 195, 28 220, 48 255 C 68 290, 48 320, 48 375";
    }
    switch (selectedKey) {
      case "property":
        // Flows down margin and sweeps smoothly into Tab 1 notch
        return "M 48 42 L 48 260 C 48 335, 60 375, 87 388";
      case "family":
        // Flows down margin and sweeps across into Tab 2 notch
        return "M 48 42 L 48 260 C 48 340, 130 380, 219 388";
      case "criminal":
        // Flows down margin and sweeps across into Tab 3 notch
        return "M 48 42 L 48 240 C 48 345, 220 382, 351 388";
      case "consumer":
        // Flows down margin and sweeps across into Tab 4 notch
        return "M 48 42 L 48 220 C 48 350, 310 382, 483 388";
      default:
        return "M 48 42 L 48 150 C 48 195, 28 220, 48 255 C 68 290, 48 320, 48 375";
    }
  };

  const getMarkerCoords = () => {
    switch (selectedKey) {
      case "property":
        return { x: 87, y: 388 };
      case "family":
        return { x: 219, y: 388 };
      case "criminal":
        return { x: 351, y: 388 };
      case "consumer":
        return { x: 483, y: 388 };
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full select-none" style={{ perspective: 1200 }}>
      {/* Outer framing container with 3D perspective */}
      <div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="relative w-full max-w-[540px] xl:max-w-[570px] mx-auto transition-transform duration-300 ease-out py-2"
        style={{
          transformStyle: "preserve-3d",
          transform: shouldReduceMotion
            ? "none"
            : `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        }}
      >
        {/* Soft Ambient Directional Lighting Shadow (Dynamic underlay) */}
        <div
          aria-hidden="true"
          className="absolute -inset-4 rounded-3xl opacity-70 blur-2xl pointer-events-none transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at ${tilt.px * 100}% ${
              tilt.py * 100
            }%, rgba(32, 92, 67, 0.15) 0%, rgba(23, 69, 48, 0.05) 50%, transparent 75%)`,
            transform: "translateZ(-30px)",
          }}
        />

        {/* ═══════════════════════════════════════════════════════════════════
            THE PHYSICAL FOLIO (Warm Ivory Paper Base)
            ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={
            shouldReduceMotion
              ? false
              : { opacity: 0, y: 24, rotateX: 6, scale: 0.97 }
          }
          animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          transition={{
            duration: 0.9,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="relative rounded-2xl bg-[#FAF7F0] border border-[#E5DAC8] shadow-[0_24px_50px_-12px_rgba(23,69,48,0.12),0_8px_20px_-6px_rgba(32,40,36,0.06),0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden min-h-[460px] sm:min-h-[490px] flex flex-col justify-between"
          style={{
            transformStyle: "preserve-3d",
            backgroundImage: `
              radial-gradient(circle at 10% 10%, rgba(255,255,255,0.7) 0%, transparent 60%),
              linear-gradient(175deg, #FDFBF7 0%, #FAF7F0 60%, #F3EDE2 100%)
            `,
          }}
        >
          {/* Subtle Authentic Paper Grain / Texture Overlay */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply"
            style={{
              backgroundImage: `radial-gradient(#202824 0.4px, transparent 0.4px)`,
              backgroundSize: "8px 8px",
            }}
          />

          {/* Authentic Court Docket Double Margin Rule in Forest Green Ink */}
          <div
            aria-hidden="true"
            className="absolute left-[36px] sm:left-[48px] top-0 bottom-0 pointer-events-none flex gap-[3px]"
          >
            <div className="w-[1px] h-full bg-[#205C43]/20" />
            <div className="w-[1px] h-full bg-[#205C43]/10" />
          </div>

          {/* Authentic Brass Eyelet Binding Rivet at Top-Left Margin */}
          <div
            aria-hidden="true"
            className="absolute left-[24px] sm:left-[36px] top-6 w-6 h-6 rounded-full flex items-center justify-center shadow-xs pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 35% 35%, #F4E2B5 0%, #C5A059 45%, #8E6D2E 85%, #594217 100%)",
              boxShadow:
                "inset 0 1px 1px rgba(255,255,255,0.6), 0 2px 4px rgba(23,69,48,0.2)",
            }}
          >
            {/* Dark eyelet center opening */}
            <div className="w-2.5 h-2.5 rounded-full bg-[#174530]/80 shadow-inner" />
          </div>

          {/* Blind Embossed Legal Watermark Seal in Upper-Right Corner */}
          <div
            aria-hidden="true"
            className="absolute right-6 top-6 pointer-events-none opacity-[0.14] flex flex-col items-center justify-center text-[#205C43]"
          >
            <div className="w-14 h-14 rounded-full border border-current flex items-center justify-center p-1">
              <div className="w-full h-full rounded-full border border-dashed border-current flex items-center justify-center">
                <Scale className="w-5 h-5 text-current" />
              </div>
            </div>
            <span className="font-mono text-[7px] tracking-[0.2em] mt-1 uppercase text-[#205C43] font-bold">
              {briefCopy.stampLabel.split("·")[0].trim()}
            </span>
          </div>

          {/* ═════════════════════════════════════════════════════════════════
              HEADER: Micro-typography & Interactive Controls
              ═════════════════════════════════════════════════════════════════ */}
          <div className="relative z-10 pt-5 pb-3 pl-14 sm:pl-20 pr-6 flex items-center justify-between border-b border-[#E5DAC8]/70">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#205C43]" />
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#69736D] font-bold">
                {briefCopy.eyebrow}
              </span>
            </div>

            {/* Subtle Refold Control when unfolded */}
            <AnimatePresence>
              {selectedKey && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  onClick={handleRefold}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FAF7F0] hover:bg-[#EAF3ED] border border-[#D5E5D9] text-[#205C43] text-[11px] font-mono transition-colors shadow-2xs cursor-pointer focus-visible:outline-2 focus-visible:outline-[#205C43]"
                  title={briefCopy.refold}
                  aria-label={briefCopy.refold}
                >
                  <RotateCcw className="w-3 h-3 text-[#205C43]" />
                  <span>{briefCopy.refold}</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* ═════════════════════════════════════════════════════════════════
              MIDDLE: The Dynamic Paper Body (Ink Trail + Folded / Unfolded State)
              ═════════════════════════════════════════════════════════════════ */}
          <div className="relative flex-1 px-4 sm:px-6 py-4 flex flex-col justify-between">
            {/* SVG INK TRAIL LAYER */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <filter id={`inkGlow-${filterId}`} x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#205C43" floodOpacity="0.25" />
                </filter>
              </defs>

              {/* The Drawing Ink Path */}
              <motion.path
                d={getInkPath()}
                fill="none"
                stroke="#205C43"
                strokeWidth={selectedKey ? 2 : 1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={`url(#inkGlow-${filterId})`}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: 1,
                  opacity: selectedKey ? 0.88 : 0.42,
                }}
                transition={{
                  duration: shouldReduceMotion ? 0.3 : 0.85,
                  ease: [0.16, 1, 0.3, 1],
                }}
              />

              {/* Terminal Seal Marker on Chosen Destination */}
              {selectedKey && (() => {
                const marker = getMarkerCoords();
                if (!marker) return null;
                return (
                  <motion.g
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.35, duration: 0.4, ease: "easeOut" }}
                    transform={`translate(${marker.x}, ${marker.y})`}
                  >
                    <circle r="7" fill="#FAF7F0" stroke="#205C43" strokeWidth="2" />
                    <circle r="3.5" fill="#C5A059" />
                  </motion.g>
                );
              })()}
            </svg>

            {/* Content Switcher: INITIAL FOLDED STATE vs REVEALED UNFOLDED STATE */}
            <div className="relative z-20 pl-10 sm:pl-14 pr-2 sm:pr-4 py-2">
              <AnimatePresence mode="wait">
                {!selectedKey ? (
                  /* ─── INITIAL STATE: A Brief Waiting to be Opened ─── */
                  <motion.div
                    key="initial-folded-state"
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-4"
                  >
                    {/* Folded Sheet Sculpture Preview */}
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#EAF3ED] text-[#205C43] text-[10px] font-mono font-semibold tracking-wider uppercase border border-[#D5E5D9]">
                        <Sparkles className="w-3 h-3 text-[#205C43]" />
                        <span>{briefCopy.initialStateLabel}</span>
                      </div>
                      <h2 className="font-serif text-2xl sm:text-3xl text-[#202824] font-normal tracking-tight leading-snug">
                        {briefCopy.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-[#69736D] font-light leading-relaxed max-w-sm">
                        {briefCopy.subtitle}
                      </p>
                    </div>

                    {/* Architectural Folded Crease Representation */}
                    <div className="relative py-2 max-w-sm">
                      <div className="p-3.5 rounded-xl bg-white/70 border border-[#E5DAC8] shadow-2xs backdrop-blur-xs space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-mono text-[#69736D]">
                          <span className="font-semibold text-[#205C43]">
                            FOLIO SEC. 01–04
                          </span>
                          <span>FOUR PRACTICE DOMAINS</span>
                        </div>
                        {/* Fine Debossed Rule Lines simulating legal folio manuscript */}
                        <div className="space-y-1.5 opacity-60">
                          <div className="h-[2px] bg-[#205C43]/15 rounded-full w-full" />
                          <div className="h-[2px] bg-[#205C43]/15 rounded-full w-4/5" />
                          <div className="h-[2px] bg-[#205C43]/15 rounded-full w-3/5" />
                        </div>
                        <p className="text-[11px] text-[#69736D] pt-1">
                          Select an index tab on the right to unfold statutory clarity.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* ─── REVEALED STATE: One Clear Next Action ─── */
                  <motion.div
                    key={`revealed-${selectedKey}`}
                    initial={
                      shouldReduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, y: 10, rotateX: -6 }
                    }
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    exit={
                      shouldReduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, y: -8, rotateX: 6 }
                    }
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-4 max-w-md"
                  >
                    {/* Practice Area Label & Statutory Benchmark */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#205C43] text-white text-[10px] font-mono font-bold tracking-wider uppercase">
                          {activeTabMeta?.tabShort}
                        </span>
                        <span className="text-[11px] font-mono text-[#69736D] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#205C43]" />
                          <span>{briefCopy.pathwayUnfolded}</span>
                        </span>
                      </div>

                      <h2 className="font-serif text-2xl sm:text-[26px] text-[#202824] font-normal tracking-tight leading-snug">
                        {activeTabMeta?.title}
                      </h2>

                      {/* Statutory Anchor */}
                      <p className="font-mono text-[11px] text-[#205C43] font-medium leading-relaxed bg-[#EAF3ED]/80 px-2.5 py-1 rounded-md border border-[#D5E5D9] inline-block">
                        § {activeTabMeta?.statute}
                      </p>
                    </div>

                    {/* Concise Plain-Language Description */}
                    <p className="text-xs sm:text-sm text-[#69736D] font-light leading-relaxed">
                      {activeTabMeta?.desc}
                    </p>

                    {/* Bar Council Compliance Reassurance */}
                    <div className="flex items-center gap-2 text-[11px] text-[#202824] pt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#205C43] shrink-0" />
                      <span className="font-medium text-[#202824]/90">
                        {briefCopy.verifiedBadge}
                      </span>
                    </div>

                    {/* Clear Two Next Actions (Primary Discovery + Secondary AI Guidance) */}
                    <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      {/* Primary Action: Direct Advocate Discovery with Canonical Filter */}
                      <Link
                        href={`/lawyers?practiceArea=${encodeURIComponent(
                          activeTabMeta?.canonicalArea || ""
                        )}`}
                        className="px-4 py-2.5 rounded-lg bg-[#205C43] hover:bg-[#174530] text-white text-xs font-semibold tracking-wide transition-all shadow-xs flex items-center justify-center gap-2 group text-center"
                      >
                        <span>{briefCopy.exploreAdvocates}</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>

                      {/* Quieter Secondary Guidance: AI Legal Intake */}
                      <Link
                        href="/intake"
                        className="px-3.5 py-2.5 rounded-lg bg-white/80 hover:bg-[#EAF3ED] border border-[#D5E5D9] text-[#202824] text-xs font-medium transition-colors flex items-center justify-center gap-1.5 text-center"
                      >
                        <Sparkles className="w-3 h-3 text-[#205C43]" />
                        <span>{briefCopy.getGuidance}</span>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ═════════════════════════════════════════════════════════════════
                THE 4 INTEGRATED INDEX FOLD TABS (Stepped Along Right Margin)
                ═════════════════════════════════════════════════════════════════ */}
            <div
              role="tablist"
              aria-label="Practice Area Folio Index Tabs"
              className="relative z-30 mt-4 pt-3 border-t border-[#E5DAC8]/70 grid grid-cols-2 sm:grid-cols-4 gap-2"
            >
              {TAB_METAS.map((item) => {
                const tabData = briefCopy.tabs[item.key];
                const isSelected = selectedKey === item.key;
                const isHovered = hoveredKey === item.key;

                return (
                  <button
                    key={item.key}
                    role="tab"
                    type="button"
                    aria-selected={isSelected}
                    onClick={() => handleSelectTab(item.key)}
                    onMouseEnter={() => setHoveredKey(item.key)}
                    onMouseLeave={() => setHoveredKey(null)}
                    className={`group relative text-left p-2 sm:p-2.5 rounded-lg border transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#205C43] ${
                      isSelected
                        ? "bg-[#205C43] border-[#205C43] text-white shadow-sm"
                        : "bg-white/70 hover:bg-white border-[#E5DAC8] text-[#202824] hover:border-[#205C43]/40"
                    }`}
                    style={{
                      transform:
                        !shouldReduceMotion && (isSelected || isHovered)
                          ? "translateZ(10px)"
                          : "none",
                    }}
                  >
                    {/* Index Roman Numeral Marker */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          isSelected
                            ? "bg-white/20 text-[#FAF7F0]"
                            : "bg-[#EAF3ED] text-[#205C43]"
                        }`}
                      >
                        {item.roman}
                      </span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                      )}
                    </div>

                    {/* Tab Name */}
                    <div
                      className={`text-[11px] sm:text-xs font-medium leading-tight truncate ${
                        isSelected ? "text-white" : "text-[#202824]"
                      }`}
                    >
                      {tabData.tabShort}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════════
              FOOTER: Subtle Interaction Hint & Deckle Edge
              ═════════════════════════════════════════════════════════════════ */}
          <div className="relative z-10 px-6 py-2.5 bg-[#FAF7F0]/90 border-t border-[#E5DAC8]/60 flex items-center justify-between text-[10px] font-mono text-[#69736D]">
            <span className="truncate pr-2">{briefCopy.hint}</span>
            <span className="text-[#205C43] font-semibold shrink-0">
              BCI COMPLIANT
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
