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
  defaultIndex: number;
}

const TAB_METAS: TabMeta[] = [
  { key: "property", roman: "I", defaultIndex: 0 },
  { key: "family", roman: "II", defaultIndex: 1 },
  { key: "criminal", roman: "III", defaultIndex: 2 },
  { key: "consumer", roman: "IV", defaultIndex: 3 },
];

export function UnfoldingBrief() {
  const { t, isHindi } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const [selectedKey, setSelectedKey] = useState<PracticeTabKey | null>(null);
  const [hoveredKey, setHoveredKey] = useState<PracticeTabKey | null>(null);

  // Dynamic card measurements for responsive ink trail and fold placement
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardDim, setCardDim] = useState({ width: 560, height: 490 });

  // 3D Tilt physics on pointer move
  const [tilt, setTilt] = useState<{ rx: number; ry: number; px: number; py: number }>({
    rx: 0,
    ry: 0,
    px: 0.5,
    py: 0.5,
  });

  const filterId = useId();

  // ResizeObserver to keep ink path and fold alignment razor-sharp across all screen sizes
  useEffect(() => {
    if (!cardRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setCardDim({
            width: Math.round(width),
            height: Math.round(height),
          });
        }
      }
    });
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  // Pointer move handler with restrained dampening (-5 deg to +5 deg)
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (shouldReduceMotion || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const rx = (0.5 - y) * 7;
      const ry = (x - 0.5) * 8;

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

  // Safe dictionary resolution with robust fallbacks
  const briefCopy = t.home.brief || {
    eyebrow: "THE UNFOLDING BRIEF",
    title: "From Complexity to Clarity",
    subtitle: "Unfold the brief to uncover your legal path forward",
    refold: "Refold Brief",
    hint: "Select an index fold to explore practice pathways",
    folioCompliance: "STATUTORY JURISPRUDENCE FOLIO",
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

  // --------------------------------------------------------------------------
  // INK TRAIL MATHEMATICS & COLLISION-FREE ROUTING
  // --------------------------------------------------------------------------
  // The ink trail originates from the brass binding rivet in the top-left margin.
  // It flows strictly through the dedicated left margin canal (x: ~36 to ~44).
  // When a category is selected:
  // It guides down the margin and sweeps cleanly along the horizontal fold crease
  // dividing line (y: yFoldCrease) right above the tab shelf, meeting the active
  // tab's top registration notch. It NEVER crosses any tab card, label, or text.
  // --------------------------------------------------------------------------
  const getInkPathAndMarker = () => {
    const W = cardDim.width || 560;
    const H = cardDim.height || 490;
    const xMargin = W < 480 ? 30 : 38;
    const yRivet = 36;
    // The fold crease is positioned right above the tab bar
    // Tab bar is roughly 72px high + footer 38px + padding -> crease is at H - 124
    const yFoldCrease = Math.max(H - 124, 340);

    if (!selectedKey) {
      // Idle / Initial Folded State:
      // An elegant manuscript ruling line cascading down the left margin canal,
      // concluding with a calligraphic flourish at the docket crease.
      const path = `M ${xMargin} ${yRivet} L ${xMargin} 140 C ${xMargin} 190, ${
        xMargin + 6
      } 230, ${xMargin} 280 C ${xMargin - 6} 320, ${xMargin} ${
        yFoldCrease - 24
      }, ${xMargin} ${yFoldCrease}`;

      return {
        path,
        marker: { x: xMargin, y: yFoldCrease },
      };
    }

    // Active Category State:
    // Determine the notch X coordinate for the active tab
    const isMobileGrid = W < 480;
    let targetX = xMargin;
    let targetY = yFoldCrease;

    const tabIndex = TAB_METAS.findIndex((t) => t.key === selectedKey);
    const validIndex = tabIndex >= 0 ? tabIndex : 0;

    if (!isMobileGrid) {
      // 4 tabs across in 1 row (equal width)
      // Left and right margins: ~20px on each side. Width = W - 40.
      const tabColWidth = (W - 40) / 4;
      targetX = Math.round(20 + tabColWidth * validIndex + tabColWidth / 2);
      targetY = yFoldCrease;
    } else {
      // 2x2 grid on mobile
      const tabColWidth = (W - 32) / 2;
      const col = validIndex % 2;
      targetX = Math.round(16 + tabColWidth * col + tabColWidth / 2);
      targetY = yFoldCrease;
    }

    // Ensure path flows down the left canal, then sweeps smoothly along the crease
    // into the tab's registration notch
    const curveRadius = 14;
    const path = `M ${xMargin} ${yRivet} L ${xMargin} ${
      yFoldCrease - curveRadius
    } Q ${xMargin} ${yFoldCrease}, ${Math.min(
      xMargin + curveRadius,
      targetX
    )} ${yFoldCrease} L ${targetX} ${yFoldCrease}`;

    return {
      path,
      marker: { x: targetX, y: targetY },
    };
  };

  const { path: inkPathD, marker: inkMarker } = getInkPathAndMarker();

  return (
    <div className="relative w-full select-none" style={{ perspective: 1200 }}>
      {/* Outer 3D tilt framing container */}
      <div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="relative w-full max-w-[540px] xl:max-w-[570px] mx-auto transition-transform duration-300 ease-out py-3"
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
          className="absolute -inset-4 rounded-3xl opacity-60 blur-2xl pointer-events-none transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at ${tilt.px * 100}% ${
              tilt.py * 100
            }%, rgba(32, 92, 67, 0.16) 0%, rgba(23, 69, 48, 0.05) 55%, transparent 75%)`,
            transform: "translateZ(-30px)",
          }}
        />

        {/* ═══════════════════════════════════════════════════════════════════
            STACKED PAPER SHEETS (Authentic physical brief depth)
            ═══════════════════════════════════════════════════════════════════ */}
        {/* Under-Sheet 2 (Deepest parchment layer) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-2xl bg-[#EDE4D5] border border-[#DDD0BC] shadow-xs pointer-events-none transition-transform duration-300"
          style={{
            transform: shouldReduceMotion
              ? "none"
              : "translate3d(4px, 6px, -20px) rotate(-0.8deg)",
          }}
        />

        {/* Under-Sheet 1 (Middle vellum layer) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-2xl bg-[#F4EDE0] border border-[#E4D7C5] shadow-xs pointer-events-none transition-transform duration-300"
          style={{
            transform: shouldReduceMotion
              ? "none"
              : "translate3d(-2px, 3px, -10px) rotate(0.5deg)",
          }}
        />

        {/* ═══════════════════════════════════════════════════════════════════
            THE PRIMARY FOLIO (Warm Ivory Paper Base)
            ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={
            shouldReduceMotion
              ? false
              : { opacity: 0, y: 20, rotateX: 5, scale: 0.98 }
          }
          animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          transition={{
            duration: 0.85,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="relative rounded-2xl bg-[#FAF7F0] border border-[#E5DAC8] shadow-[0_20px_45px_-12px_rgba(23,69,48,0.12),0_6px_18px_-4px_rgba(32,40,36,0.06),0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden min-h-[480px] sm:min-h-[500px] flex flex-col justify-between"
          style={{
            transformStyle: "preserve-3d",
            backgroundImage: `
              radial-gradient(circle at 12% 10%, rgba(255,255,255,0.75) 0%, transparent 60%),
              linear-gradient(176deg, #FDFBF7 0%, #FAF7F0 60%, #F4EDE2 100%)
            `,
          }}
        >
          {/* Subtle Authentic Architectural Dot Grid (Calm, quiet, masked behind text) */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none opacity-[0.11] mix-blend-multiply"
            style={{
              backgroundImage: `radial-gradient(#202824 0.5px, transparent 0.5px)`,
              backgroundSize: "16px 16px",
              maskImage:
                "radial-gradient(ellipse 90% 85% at 50% 45%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,1) 100%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 90% 85% at 50% 45%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,1) 100%)",
            }}
          />

          {/* Authentic Court Docket Double Margin Rule in Forest Green Ink */}
          <div
            aria-hidden="true"
            className="absolute left-[34px] sm:left-[44px] top-0 bottom-0 pointer-events-none flex gap-[3px] z-10"
          >
            <div className="w-[1px] h-full bg-[#205C43]/20" />
            <div className="w-[1px] h-full bg-[#205C43]/10" />
          </div>

          {/* Authentic Brass Eyelet Binding Rivet at Top-Left Margin */}
          <div
            aria-hidden="true"
            className="absolute left-[22px] sm:left-[30px] top-5 w-6 h-6 rounded-full flex items-center justify-center pointer-events-none z-20 shadow-xs"
            style={{
              background:
                "radial-gradient(circle at 35% 35%, #F4E2B5 0%, #C5A059 45%, #8E6D2E 85%, #594217 100%)",
              boxShadow:
                "inset 0 1px 1.5px rgba(255,255,255,0.7), 0 2px 4px rgba(23,69,48,0.22)",
            }}
          >
            {/* Dark eyelet center hole */}
            <div className="w-2.5 h-2.5 rounded-full bg-[#174530] shadow-inner" />
          </div>

          {/* Blind Embossed Legal Watermark Seal in Upper-Right Corner */}
          <div
            aria-hidden="true"
            className="absolute right-5 top-5 pointer-events-none opacity-[0.11] flex flex-col items-center justify-center text-[#205C43] select-none"
          >
            <div className="w-13 h-13 rounded-full border border-current flex items-center justify-center p-1">
              <div className="w-full h-full rounded-full border border-dashed border-current flex items-center justify-center">
                <Scale className="w-4.5 h-4.5 text-current" />
              </div>
            </div>
            <span className="font-mono text-[6.5px] tracking-[0.2em] mt-0.5 uppercase text-[#205C43] font-bold">
              {briefCopy.stampLabel.split("·")[0].trim()}
            </span>
          </div>

          {/* ═════════════════════════════════════════════════════════════════
              REGION 1: COMPACT FOLIO HEADER
              ═════════════════════════════════════════════════════════════════ */}
          <div className="relative z-20 pt-4 pb-3 pl-14 sm:pl-18 pr-5 sm:pr-6 flex items-center justify-between border-b border-[#E5DAC8]/70">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#205C43]" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#69736D] font-bold">
                {briefCopy.eyebrow}
              </span>
              <span className="hidden sm:inline-block font-mono text-[9.5px] text-[#205C43]/70 font-semibold pl-1.5 border-l border-[#E5DAC8]">
                DOC. 2026 · SEC. 01–04
              </span>
            </div>

            {/* Refold Brief Control when unfolded */}
            <AnimatePresence>
              {selectedKey && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={handleRefold}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FAF7F0] hover:bg-[#EAF3ED] border border-[#D5E5D9] text-[#205C43] text-[11px] font-mono transition-colors shadow-2xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#205C43]"
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
              MIDDLE REGION: CONTENT BODY & BACKGROUND INK TRAIL
              ═════════════════════════════════════════════════════════════════ */}
          <div className="relative flex-1 flex flex-col justify-between">
            {/* SVG INK TRAIL LAYER (Placed strictly behind content and tab cards) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <filter
                  id={`inkGlow-${filterId}`}
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feDropShadow
                    dx="0"
                    dy="1"
                    stdDeviation="1.5"
                    floodColor="#205C43"
                    floodOpacity="0.22"
                  />
                </filter>
              </defs>

              {/* The Drawing Ink Path (Follows canal and fold crease, never crossing tabs) */}
              <motion.path
                d={inkPathD}
                fill="none"
                stroke="#205C43"
                strokeWidth={selectedKey ? 2 : 1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={`url(#inkGlow-${filterId})`}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: 1,
                  opacity: selectedKey ? 0.88 : 0.45,
                }}
                transition={{
                  duration: shouldReduceMotion ? 0.25 : 0.7,
                  ease: [0.16, 1, 0.3, 1],
                }}
              />

              {/* Terminal Registration Marker / Wax Seal at Crease Anchor */}
              {selectedKey && inkMarker && (
                <motion.g
                  key={`marker-${selectedKey}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: shouldReduceMotion ? 0 : 0.25,
                    duration: 0.35,
                    ease: "easeOut",
                  }}
                  transform={`translate(${inkMarker.x}, ${inkMarker.y})`}
                >
                  <circle
                    r="5"
                    fill="#FAF7F0"
                    stroke="#205C43"
                    strokeWidth="1.5"
                  />
                  <circle r="2.5" fill="#C5A059" />
                </motion.g>
              )}
            </svg>

            {/* ═══════════════════════════════════════════════════════════════
                REGION 2: MAIN SELECTED-CATEGORY CONTENT (Height-stable)
                ═══════════════════════════════════════════════════════════════ */}
            <div className="relative z-20 pl-12 sm:pl-16 pr-4 sm:pr-6 pt-3 pb-2 min-h-[225px] sm:min-h-[240px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {!selectedKey ? (
                  /* ─── INITIAL SUSPENDED STATE ─── */
                  <motion.div
                    key="initial-state"
                    initial={
                      shouldReduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, y: 8 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    exit={
                      shouldReduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, y: -8 }
                    }
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="space-y-3.5"
                  >
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#EAF3ED] text-[#205C43] text-[10px] font-mono font-semibold tracking-wider uppercase border border-[#D5E5D9]">
                        <Sparkles className="w-3 h-3 text-[#205C43]" />
                        <span>{briefCopy.initialStateLabel}</span>
                      </div>
                      <h2 className="font-serif text-2xl sm:text-[28px] text-[#202824] font-normal tracking-tight leading-snug">
                        {briefCopy.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-[#69736D] font-light leading-relaxed max-w-sm">
                        {briefCopy.subtitle}
                      </p>
                    </div>

                    {/* Architectural Fold Crease Guidance Box */}
                    <div className="p-3.5 rounded-xl bg-white/80 border border-[#E5DAC8] shadow-2xs backdrop-blur-xs space-y-2 max-w-sm">
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#69736D]">
                        <span className="font-semibold text-[#205C43]">
                          FOLIO SEC. 01–04
                        </span>
                        <span>FOUR PRACTICE PATHWAYS</span>
                      </div>
                      {/* Fine manuscript rulings */}
                      <div className="space-y-1.5 opacity-60">
                        <div className="h-[1.5px] bg-[#205C43]/15 rounded-full w-full" />
                        <div className="h-[1.5px] bg-[#205C43]/15 rounded-full w-4/5" />
                        <div className="h-[1.5px] bg-[#205C43]/15 rounded-full w-3/5" />
                      </div>
                      <p className="text-[11px] text-[#69736D] pt-0.5">
                        {isHindi
                          ? "विधिक मार्ग व संविधि देखने के लिए नीचे दी गई तह चुनें।"
                          : "Select an index fold below to inspect statutory clarity."}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  /* ─── ACTIVE REVEALED CATEGORY STATE ─── */
                  <motion.div
                    key={`revealed-${selectedKey}`}
                    initial={
                      shouldReduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, y: 10, scale: 0.99 }
                    }
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={
                      shouldReduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, y: -8, scale: 0.99 }
                    }
                    transition={{
                      duration: shouldReduceMotion ? 0.2 : 0.45,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="space-y-3 max-w-md"
                  >
                    {/* Category Label & Pathway Status */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#205C43] text-white text-[10px] font-mono font-bold tracking-wider uppercase shadow-2xs">
                          {activeTabMeta?.tabShort}
                        </span>
                        <span className="text-[11px] font-mono text-[#69736D] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#205C43]" />
                          <span>{briefCopy.pathwayUnfolded}</span>
                        </span>
                      </div>

                      {/* Editorial Category Title */}
                      <h2 className="font-serif text-2xl sm:text-[26px] text-[#202824] font-normal tracking-tight leading-snug">
                        {activeTabMeta?.title}
                      </h2>

                      {/* Natural Wrapping Statutory Anchor Badge */}
                      <div className="pt-0.5">
                        <span className="font-mono text-[11px] text-[#205C43] font-medium leading-relaxed bg-[#EAF3ED]/90 px-2.5 py-1 rounded-md border border-[#D5E5D9] inline-block max-w-full break-words">
                          § {activeTabMeta?.statute}
                        </span>
                      </div>
                    </div>

                    {/* Concise Plain-Language Description */}
                    <p className="text-xs sm:text-sm text-[#69736D] font-light leading-relaxed">
                      {activeTabMeta?.desc}
                    </p>

                    {/* Bar Council Compliance Reassurance */}
                    <div className="flex items-center gap-2 text-[11px] text-[#202824] pt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#205C43] shrink-0" />
                      <span className="font-medium text-[#202824]/90">
                        {briefCopy.verifiedBadge}
                      </span>
                    </div>

                    {/* ═══════════════════════════════════════════════════════
                        REGION 3: PRIMARY & SECONDARY ACTIONS
                        ═══════════════════════════════════════════════════════ */}
                    <div className="pt-1.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                      {/* Dominant Primary: Direct Advocate Discovery with Canonical Filter */}
                      <Link
                        href={`/lawyers?practiceArea=${encodeURIComponent(
                          activeTabMeta?.canonicalArea || ""
                        )}`}
                        className="px-4 py-2.5 rounded-lg bg-[#205C43] hover:bg-[#174530] text-white text-xs font-semibold tracking-wide transition-all shadow-xs flex items-center justify-center gap-2 group text-center cursor-pointer active:scale-98"
                      >
                        <span>{briefCopy.exploreAdvocates}</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>

                      {/* Lighter Secondary: AI Legal Guidance */}
                      <Link
                        href="/intake"
                        className="px-3.5 py-2.5 rounded-lg bg-white/90 hover:bg-[#EAF3ED] border border-[#D5E5D9] hover:border-[#205C43]/40 text-[#202824] text-xs font-medium transition-colors flex items-center justify-center gap-1.5 text-center cursor-pointer active:scale-98 shadow-2xs"
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
                REGION 4: THE 4 INTEGRATED INDEX FOLD TABS (Equal, Predictable)
                ═════════════════════════════════════════════════════════════════ */}
            <div className="relative z-30 pt-3 px-3 sm:px-5 pb-3 border-t border-[#E5DAC8]/70 bg-[#FAF7F0]/95">
              <div
                role="tablist"
                aria-label="Practice Area Folio Index Tabs"
                className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full"
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
                      className={`group relative w-full h-[64px] sm:h-[68px] rounded-lg border text-left p-2 sm:p-2.5 flex flex-col justify-between overflow-hidden cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#205C43] active:scale-[0.98] ${
                        isSelected
                          ? "border-[#205C43] shadow-xs"
                          : "bg-white/90 hover:bg-white border-[#E5DAC8] hover:border-[#205C43]/40 shadow-2xs"
                      }`}
                    >
                      {/* Animated Active Background Fill (Framer Motion layoutId for smooth gliding) */}
                      {isSelected && (
                        <motion.div
                          layoutId="activeTabBackground"
                          className="absolute inset-0 bg-[#205C43] rounded-lg"
                          transition={
                            shouldReduceMotion
                              ? { duration: 0 }
                              : {
                                  type: "spring",
                                  stiffness: 450,
                                  damping: 35,
                                }
                          }
                        />
                      )}

                      {/* Foreground Tab Content (Guaranteed identical height and baseline) */}
                      <div className="relative z-10 flex flex-col justify-between h-full w-full">
                        {/* Top Line: Roman numeral badge + active gold indicator */}
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded transition-colors ${
                              isSelected
                                ? "bg-white/20 text-[#FAF7F0]"
                                : "bg-[#EAF3ED] text-[#205C43]"
                            }`}
                          >
                            {item.roman}
                          </span>

                          {/* Restrained Gold Accent Pip on Selected */}
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] shadow-[0_0_6px_rgba(197,160,89,0.85)]" />
                          )}
                          {!isSelected && isHovered && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D5E5D9]" />
                          )}
                        </div>

                        {/* Bottom Line: Category Short Name */}
                        <div
                          className={`text-[11px] sm:text-xs leading-tight truncate transition-colors ${
                            isSelected
                              ? "text-white font-semibold"
                              : "text-[#202824] group-hover:text-[#174530] font-medium"
                          }`}
                        >
                          {tabData.tabShort}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════════
              FOOTER: Truthful Copy & Unclipped Layout
              ═════════════════════════════════════════════════════════════════ */}
          <div className="relative z-30 px-4 sm:px-6 py-2.5 bg-[#F5EDE1] border-t border-[#E5DAC8]/70 flex items-center justify-between text-[10px] font-mono text-[#69736D] gap-3 flex-wrap">
            <span className="text-left font-medium">
              {briefCopy.hint}
            </span>
            <span className="text-[#205C43] font-semibold shrink-0 uppercase tracking-wider text-[9.5px]">
              {briefCopy.folioCompliance || "STATUTORY JURISPRUDENCE FOLIO"}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
