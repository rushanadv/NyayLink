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
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#0C0F17]/90 backdrop-blur-md border border-white/[0.08] hover:border-[#C5A059]/40 transition-colors shadow-xl shadow-black/40 text-xs select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Platform Highlights"
      aria-live="polite"
    >
      {/* Live Pulsing Dot */}
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C5A059] opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C5A059]" />
      </span>

      <span className="font-mono text-[10px] uppercase tracking-wider text-[#C5A059] font-medium hidden sm:inline-flex items-center gap-1">
        <Activity className="w-3 h-3 text-[#C5A059]" />
        Live
      </span>

      <div className="h-3 w-px bg-white/10 hidden sm:block" />

      {/* Rotating Stat Content */}
      <div className="overflow-hidden min-w-[180px] sm:min-w-[210px] h-4 relative flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStat.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-1.5 whitespace-nowrap text-[12px]"
          >
            <span className="font-semibold text-white tracking-tight">
              {currentStat.metric}
            </span>
            <span className="text-[#A5A3B2] font-normal">
              {currentStat.label}
            </span>
            <span className="text-white/40 text-[10px] hidden md:inline">
              · {currentStat.sublabel}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => setIsDismissed(true)}
        className="text-white/40 hover:text-white transition-colors p-0.5 rounded-full hover:bg-white/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
        aria-label="Dismiss status notification"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.aside>
  );
}
