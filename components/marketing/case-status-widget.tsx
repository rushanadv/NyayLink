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
      className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-surface-raised border border-border-subtle hover:border-border-strong transition-colors text-xs select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Platform Highlights"
      aria-live="polite"
    >
      {/* Ambient Pulsing Feed Indicator */}
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400/60 opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400/80" />
      </span>

      <span className="font-mono text-[10px] uppercase tracking-wider text-white/40 font-medium hidden sm:inline-flex items-center gap-1">
        <Activity className="w-2.5 h-2.5 text-white/30" />
        Feed
      </span>

      <div className="h-2.5 w-px bg-border-default hidden sm:block" />

      {/* Rotating Stat Content */}
      <div className="overflow-hidden min-w-[170px] sm:min-w-[200px] h-4 relative flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStat.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-1.5 whitespace-nowrap text-[11px]"
          >
            <span className="font-medium text-white/90 tracking-tight">
              {currentStat.metric}
            </span>
            <span className="text-white/50 font-normal">
              {currentStat.label}
            </span>
            <span className="text-white/30 text-[10px] hidden md:inline">
              · {currentStat.sublabel}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => setIsDismissed(true)}
        className="text-white/40 hover:text-white transition-colors p-0.5 rounded-full hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
        aria-label="Dismiss status notification"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.aside>
  );
}
