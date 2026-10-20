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
  // Layer 1 (Start / Top): Deep indigo-navy (#090B10) - fades 1 -> 0 in the first half
  const opacityStart = useTransform(activeProgress, [0, 0.5], [1, 0]);

  // Layer 2 (Mid / Middle): Warm near-black with faint gold undertone (#120F0A) - fades 0 -> 1 -> 0 across the middle
  const opacityMid = useTransform(activeProgress, [0.15, 0.5, 0.85], [0, 1, 0]);

  // Layer 3 (End / Bottom): Pure pitch black (#000000) - fades 0 -> 1 in the back half
  const opacityEnd = useTransform(activeProgress, [0.5, 1.0], [0, 1]);

  if (shouldReduceMotion) {
    return (
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-[#090B10]"
        style={{ background: STATIC_HERO_GRADIENT }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#000000]"
      aria-hidden="true"
    >
      {/* Layer 1: Start (Deep indigo-navy) */}
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

      {/* Layer 2: Mid (Warm near-black with subtle gold accent undertone) */}
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

      {/* Layer 3: End (Pure black resolving to footer) */}
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
        className="absolute inset-0 pointer-events-none opacity-25 mix-blend-screen"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(255, 255, 255, 0.03) 0%, transparent 70%)",
        }}
      />

      {/* Architectural micro grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
    </div>
  );
}
