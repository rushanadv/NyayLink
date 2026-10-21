"use client";

import React from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import {
  PALETTE_STOPS,
  STATIC_HERO_GRADIENT,
} from "@/lib/marketing/background-stops";
import { useSmoothScroll } from "./smooth-scroll-provider";

export function ScrollBackground() {
  const { scrollProgress } = useSmoothScroll();
  const { scrollYProgress: nativeScrollYProgress } = useScroll();
  const shouldReduceMotion = useReducedMotion();

  // Prefer Lenis-synchronized scrollProgress, falling back to Framer Motion's native scroll
  const activeProgress = scrollProgress ?? nativeScrollYProgress;

  // 3 GPU-accelerated compositor layers with opacity-only crossfading:
  // Layer 1 (Start / Top): Luminous pure white (#FFFFFF)
  const opacityStart = useTransform(activeProgress, [0, 0.5], [1, 0]);

  // Layer 2 (Mid / Middle): Crisp white with subtle pale mint warmth (#FFFFFF -> #EAF3ED)
  const opacityMid = useTransform(activeProgress, [0.15, 0.5, 0.85], [0, 1, 0]);

  // Layer 3 (End / Bottom): Pristine white resolving into footer (#FFFFFF)
  const opacityEnd = useTransform(activeProgress, [0.5, 1.0], [0, 1]);

  if (shouldReduceMotion) {
    return (
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-white"
        style={{ background: STATIC_HERO_GRADIENT }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-white"
      aria-hidden="true"
    >
      {/* Layer 1: Start (Luminous pure white) */}
      <motion.div
        data-layer="layer-start"
        className="absolute inset-0"
        style={{
          background: PALETTE_STOPS.start.gradient,
          opacity: opacityStart,
          willChange: "opacity",
          transform: "translateZ(0)",
        }}
      />

      {/* Layer 2: Mid (Pristine white & pale mint) */}
      <motion.div
        data-layer="layer-mid"
        className="absolute inset-0"
        style={{
          background: PALETTE_STOPS.mid.gradient,
          opacity: opacityMid,
          willChange: "opacity",
          transform: "translateZ(0)",
        }}
      />

      {/* Layer 3: End (Grounded white canvas) */}
      <motion.div
        data-layer="layer-end"
        className="absolute inset-0"
        style={{
          background: PALETTE_STOPS.end.gradient,
          opacity: opacityEnd,
          willChange: "opacity",
          transform: "translateZ(0)",
        }}
      />

      {/* Atmospheric depth lighting overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 15%, rgba(32, 92, 67, 0.025) 0%, transparent 70%)",
        }}
      />

      {/* Architectural micro grid pattern on clean white */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #202824 1px, transparent 1px), linear-gradient(to bottom, #202824 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
    </div>
  );
}
