"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Activity } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

export function CaseStatusWidget() {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const stats = [
    { id: "cases", ...t.home.stats.cases },
    { id: "lawyers", ...t.home.stats.lawyers },
    { id: "clarity", ...t.home.stats.clarity },
  ];

  useEffect(() => {
    if (isDismissed || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % stats.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isDismissed, isPaused, stats.length]);

  if (isDismissed) return null;

  const currentStat = stats[currentIndex % stats.length];

  return (
    <motion.aside
      initial={shouldReduceMotion ? false : { opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white border border-[#D5E5D9] hover:border-[#205C43]/40 transition-colors text-xs select-none shadow-xs"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Platform Highlights"
      aria-live="polite"
    >
      {/* Ambient Pulsing Feed Indicator */}
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#205C43]/60 opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#205C43]" />
      </span>

      <span className="font-mono text-[10px] uppercase tracking-wider text-[#69736D] font-semibold hidden sm:inline-flex items-center gap-1 shrink-0">
        <Activity className="w-2.5 h-2.5 text-[#205C43]" />
        {t.home.liveRegistry}
      </span>

      <div className="h-2.5 w-px bg-[#D5E5D9] hidden sm:block shrink-0" />

      {/* Rotating Stat Content with stable width to prevent dismiss button jitter */}
      <div className="overflow-hidden w-[160px] sm:w-[200px] md:w-[330px] h-5 relative flex items-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={`${currentStat.id}-${currentIndex}`}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 7 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -7 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center gap-1.5 whitespace-nowrap text-[11px]"
          >
            <span className="font-semibold text-[#202824] tracking-tight shrink-0 font-mono">
              {currentStat.metric}
            </span>
            <span className="text-[#3E4942] font-medium shrink-0">
              {currentStat.label}
            </span>
            <span className="text-[#69736D] text-[10px] hidden md:inline truncate">
              · {currentStat.sublabel}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => setIsDismissed(true)}
        className="text-[#69736D] hover:text-[#202824] transition-colors p-0.5 rounded-full hover:bg-[#EAF3ED] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#205C43] shrink-0"
        aria-label="Dismiss status notification"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.aside>
  );
}

