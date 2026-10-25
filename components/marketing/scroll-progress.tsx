"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { SECTIONS, SectionItem } from "@/lib/marketing/sections-data";
import { useSmoothScroll } from "./smooth-scroll-provider";
import {
  motion,
  useTransform,
  useSpring,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";
import { useLanguage } from "@/lib/i18n/context";
import { useSplash } from "@/components/ui/app-splash-provider";

/**
 * The NyayLink Legal Navigation Rail — A bespoke, living legal-timeline scroll navigator.
 *
 * Design Direction:
 * - Editorial timeline fusing case-docket architecture with kinetic navigation.
 * - Palette: Forest Green (#205C43), Deep Green (#174530), Pale Mint (#EAF3ED), Border (#D5E5D9),
 *   Pure White (#FFFFFF), and restrained warm-gold accent (#C5A059).
 * - Continuous progress line from 0% to 100% of real document scroll.
 * - Precision moving circular locator marker with kinetic ripple ring on section boundary crossings.
 * - 6 authentic homepage section milestones with completed, active, and upcoming styling.
 * - Gentle hover/focus drawer revealing section phase, localized title, and live scroll percentage.
 * - Keyboard navigation (Tab, Enter) with visible accessible rings.
 * - Compact zero-obstruction top-edge progress line on mobile/tablet viewports.
 * - Coordinated with AppSplashProvider: hidden behind splash, animates in smoothly once page is revealed.
 */
export function ScrollProgress() {
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [isRailHovered, setIsRailHovered] = useState(false);
  const [boundaryRippleKey, setBoundaryRippleKey] = useState(0);
  const [percentDisplay, setPercentDisplay] = useState(0);

  const prevActiveRef = useRef("hero");
  const { scrollTo, scrollProgress } = useSmoothScroll();
  const shouldReduceMotion = useReducedMotion();
  const { isHindi } = useLanguage();
  const { isSplashComplete } = useSplash();

  // Smooth, immediate spring tracking for the moving marker without trailing lag
  const smoothProgress = useSpring(scrollProgress, {
    stiffness: 420,
    damping: 38,
    restDelta: 0.001,
  });

  // Track height mapping: 0% to 100%
  const fillHeight = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);
  const markerTop = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  // Mobile horizontal progress width
  const mobileWidth = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  // Update live numeric percentage readout
  useEffect(() => {
    const unsubscribe = smoothProgress.on("change", (latest) => {
      const p = Math.round(Math.min(100, Math.max(0, latest * 100)));
      setPercentDisplay((prev) => (prev !== p ? p : prev));
    });
    return () => unsubscribe();
  }, [smoothProgress]);

  // Robust Section Detection based on actual viewport coordinates
  const updateActiveSection = useCallback(() => {
    if (typeof window === "undefined") return;

    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Boundary conditions
    if (scrollY < 80) {
      if (activeSection !== "hero") {
        setActiveSection("hero");
      }
      return;
    }

    if (scrollY + windowHeight >= documentHeight - 60) {
      const lastSection = SECTIONS[SECTIONS.length - 1].id;
      if (activeSection !== lastSection) {
        setActiveSection(lastSection);
      }
      return;
    }

    // Evaluate each section's position relative to the primary reading zone (top 32% of viewport)
    const readingZone = scrollY + windowHeight * 0.32;
    let currentId = SECTIONS[0].id;

    for (let i = 0; i < SECTIONS.length; i++) {
      const el = document.getElementById(SECTIONS[i].id);
      if (el) {
        const top = el.offsetTop;
        if (top <= readingZone) {
          currentId = SECTIONS[i].id;
        } else {
          break;
        }
      }
    }

    if (currentId !== activeSection) {
      setActiveSection(currentId);
    }
  }, [activeSection]);

  // Sync active section on scroll and resize
  useEffect(() => {
    updateActiveSection();

    const handleScroll = () => {
      updateActiveSection();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [updateActiveSection]);

  // Trigger kinetic ripple when crossing into a new section
  useEffect(() => {
    if (activeSection !== prevActiveRef.current) {
      prevActiveRef.current = activeSection;
      setBoundaryRippleKey((k) => k + 1);
    }
  }, [activeSection]);

  const handleSectionClick = (id: string) => {
    scrollTo(`#${id}`, { offset: -70 });
    setActiveSection(id);
  };

  const activeIndex = SECTIONS.findIndex((s) => s.id === activeSection);
  const currentSectionItem = SECTIONS[activeIndex] || SECTIONS[0];
  const currentSectionTitle = isHindi ? currentSectionItem.nameHi : currentSectionItem.name;

  return (
    <>
      {/* =====================================================================
          1. MOBILE & TABLET (Screen < 1024px): Sleek Top-Edge Progress Rail
          ===================================================================== */}
      <div
        className="fixed top-0 left-0 right-0 z-50 h-[2.5px] bg-[#E2ECE5]/50 lg:hidden pointer-events-none"
        aria-hidden="true"
      >
        <motion.div
          className="h-full bg-gradient-to-r from-[#205C43] via-[#2F855E] to-[#C5A059]"
          style={{ width: shouldReduceMotion ? "0%" : mobileWidth }}
        />
      </div>

      {/* =====================================================================
          2. DESKTOP (Screen >= 1024px): The NyayLink Legal Navigation Rail
          ===================================================================== */}
      <motion.nav
        aria-label={isHindi ? "विधिक समयरेखा नेविगेशन" : "Legal Case-File Navigation Rail"}
        initial={{ opacity: 0, x: -24 }}
        animate={
          isSplashComplete
            ? { opacity: 1, x: 0 }
            : { opacity: 0, x: -24 }
        }
        transition={{ duration: 0.65, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        onMouseEnter={() => setIsRailHovered(true)}
        onMouseLeave={() => {
          setIsRailHovered(false);
          setHoveredSection(null);
        }}
        className="fixed left-4 xl:left-7 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center select-none"
      >
        {/* Living Timeline Glass Capsule Container */}
        <div className="relative flex flex-col items-center py-3.5 px-2 rounded-full bg-white/88 backdrop-blur-md border border-[#D5E5D9] shadow-[0_12px_36px_-6px_rgba(23,69,48,0.08),0_2px_8px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-[0_16px_42px_-6px_rgba(23,69,48,0.14)] hover:border-[#B3CBB9]">
          
          {/* Rail Track Backbone */}
          <div className="relative w-7 h-56 sm:h-64 flex flex-col items-center justify-between">
            {/* Central Vertical Spine / Groove */}
            <div
              aria-hidden="true"
              className="absolute top-2.5 bottom-2.5 left-1/2 -translate-x-1/2 w-[2px] bg-[#E2ECE5] rounded-full overflow-hidden"
            >
              {/* Continuous Active Fill Line (Top down to scroll progress) */}
              {!shouldReduceMotion && (
                <motion.div
                  className="w-full bg-gradient-to-b from-[#205C43] via-[#2A7556] to-[#C5A059] rounded-full origin-top"
                  style={{ height: fillHeight }}
                />
              )}
            </div>

            {/* Kinetic Moving Progress Marker (Rides the track smoothly) */}
            {!shouldReduceMotion && (
              <motion.div
                aria-hidden="true"
                className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-20"
                style={{ top: markerTop, marginTop: "-6px" }}
              >
                <div className="relative flex items-center justify-center">
                  {/* Outer glow ring */}
                  <div className="absolute w-5 h-5 rounded-full bg-[#205C43]/15 blur-[2px]" />

                  {/* Boundary Crossing Kinetic Ripple */}
                  {boundaryRippleKey > 0 && (
                    <motion.div
                      key={boundaryRippleKey}
                      initial={{ scale: 0.8, opacity: 0.75 }}
                      animate={{ scale: 2.4, opacity: 0 }}
                      transition={{ duration: 0.65, ease: "easeOut" }}
                      className="absolute w-4 h-4 rounded-full border border-[#205C43]"
                    />
                  )}

                  {/* Core Precision Marker (White ring + Forest Green center + Warm Gold specular rim) */}
                  <div className="relative w-3 h-3 rounded-full bg-[#205C43] ring-2 ring-white shadow-xs">
                    <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-[#2F855E] to-[#174530]" />
                    <div className="absolute top-0.5 right-0.5 w-0.5 h-0.5 rounded-full bg-[#EAF3ED] opacity-90" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* 6 Authentic Section Milestones */}
            {SECTIONS.map((sec, idx) => {
              const isCurrent = activeSection === sec.id;
              const isHovered = hoveredSection === sec.id;
              const isCompleted = idx < activeIndex;
              const localizedName = isHindi ? sec.nameHi : sec.name;

              return (
                <div key={sec.id} className="relative z-10 flex items-center">
                  <button
                    type="button"
                    onClick={() => handleSectionClick(sec.id)}
                    onMouseEnter={() => setHoveredSection(sec.id)}
                    onMouseLeave={() => setHoveredSection(null)}
                    onFocus={() => setHoveredSection(sec.id)}
                    onBlur={() => setHoveredSection(null)}
                    className="relative flex items-center justify-center w-6 h-6 rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#205C43] focus-visible:ring-offset-2 transition-transform duration-200 hover:scale-120"
                    aria-label={`${isHindi ? "अनुभाग पर जाएँ" : "Navigate to section"}: ${sec.number} - ${localizedName}`}
                    aria-current={isCurrent ? "step" : undefined}
                  >
                    {/* Milestone Pip Presentation */}
                    <div
                      className={`rounded-full transition-all duration-300 ${
                        isCurrent
                          ? "w-2.5 h-2.5 bg-[#205C43] ring-3 ring-[#205C43]/20 shadow-xs"
                          : isCompleted
                          ? "w-2 h-2 bg-[#205C43] ring-1.5 ring-[#EAF3ED]"
                          : isHovered
                          ? "w-2.5 h-2.5 bg-[#174530] ring-2 ring-[#205C43]/30"
                          : "w-2 h-2 bg-white ring-1.5 ring-[#D5E5D9]"
                      }`}
                    />
                  </button>

                  {/* Individual Milestone Floating Dossier Tooltip */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, x: 8, scale: 0.95 }}
                        animate={{ opacity: 1, x: 12, scale: 1 }}
                        exit={{ opacity: 0, x: 6, scale: 0.95 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="absolute left-full ml-1 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-[#D5E5D9] shadow-md text-left whitespace-nowrap pointer-events-none z-30"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-[#205C43] bg-[#EAF3ED] px-1.5 py-0.5 rounded">
                            {sec.number}
                          </span>
                          <span className="text-xs font-semibold text-[#202824]">
                            {localizedName}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Micro Percent Tag at Bottom of Rail */}
          <div className="mt-2 pt-2 border-t border-[#D5E5D9]/60 flex items-center justify-center">
            <span
              className="font-mono text-[9.5px] font-semibold text-[#69736D] tracking-tighter"
              aria-live="off"
            >
              {percentDisplay}%
            </span>
          </div>
        </div>

        {/* ===================================================================
            3. GLOBAL HOVER EXPANSION: Floating Active Dossier Pill
            =================================================================== */}
        <AnimatePresence>
          {isRailHovered && !hoveredSection && (
            <motion.div
              initial={{ opacity: 0, x: 8, y: "-50%" }}
              animate={{ opacity: 1, x: 14, y: "-50%" }}
              exit={{ opacity: 0, x: 6, y: "-50%" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute left-full top-1/2 ml-1 px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-[#D5E5D9] shadow-lg text-left whitespace-nowrap pointer-events-none z-30 min-w-[170px]"
            >
              <div className="space-y-0.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[9.5px] font-bold uppercase tracking-wider text-[#205C43]">
                    {isHindi ? `चरण ${currentSectionItem.number}` : `PHASE ${currentSectionItem.number}`}
                  </span>
                  <span className="font-mono text-[10px] font-semibold text-[#69736D]">
                    {percentDisplay}%
                  </span>
                </div>
                <p className="text-xs font-medium text-[#202824] truncate">
                  {currentSectionTitle}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
