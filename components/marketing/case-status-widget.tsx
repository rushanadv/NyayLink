"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Activity } from "lucide-react";
import { ROTATING_STATS } from "@/lib/marketing/stats-data";

export function CaseStatusWidget() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isDismissed || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ROTATING_STATS.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isDismissed, isPaused]);

  if (isDismissed) return null;

  const currentStat = ROTATING_STATS[currentIndex];

  return (
    <motion.aside
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white border border-[#D5E5D9] hover:border-[#205C43]/40 transition-colors text-xs select-none shadow-xs"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Platform Highlights"
      aria-live="polite"
    >
      {/* Ambient Pulsing Feed Indicator */}
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#205C43]/60 opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#205C43]" />
      </span>

      <span className="font-mono text-[10px] uppercase tracking-wider text-[#69736D] font-semibold hidden sm:inline-flex items-center gap-1">
        <Activity className="w-2.5 h-2.5 text-[#205C43]" />
        Live Registry
      </span>

      <div className="h-2.5 w-px bg-[#D5E5D9] hidden sm:block" />

      {/* Rotating Stat Content */}
      <div className="overflow-hidden min-w-[170px] sm:min-w-[210px] h-4 relative flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStat.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-1.5 whitespace-nowrap text-[11px]"
          >
            <span className="font-semibold text-[#202824] tracking-tight">
              {currentStat.metric}
            </span>
            <span className="text-[#69736D] font-normal">
              {currentStat.label}
            </span>
            <span className="text-[#69736D]/80 text-[10px] hidden md:inline">
              · {currentStat.sublabel}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => setIsDismissed(true)}
        className="text-[#69736D] hover:text-[#202824] transition-colors p-0.5 rounded-full hover:bg-[#EAF3ED] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#205C43]"
        aria-label="Dismiss status notification"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.aside>
  );
}
