"use client";

import React from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import {
  BACKGROUND_STOPS,
  STATIC_HERO_GRADIENT,
} from "@/lib/marketing/background-stops";
import { useSmoothScroll } from "./smooth-scroll-provider";

export function ScrollBackground() {
  const { scrollProgress } = useSmoothScroll();
  const { scrollYProgress: nativeScrollYProgress } = useScroll();
  const shouldReduceMotion = useReducedMotion();

  // Prefer Lenis-synchronized scrollProgress, falling back to Framer Motion's native scroll
  const activeProgress = scrollProgress ?? nativeScrollYProgress;

  // Calculate smooth continuous opacity transforms for each of the 7 stops
  // Stop 0: Hero (Cosmic Midnight Navy)
  const opacity0 = useTransform(
    activeProgress,
    BACKGROUND_STOPS[0].range,
    BACKGROUND_STOPS[0].opacityCurve
  );

  // Stop 1: The Challenge (Twilight Indigo)
  const opacity1 = useTransform(
    activeProgress,
    BACKGROUND_STOPS[1].range,
    BACKGROUND_STOPS[1].opacityCurve
  );

  // Stop 2: Lawyer Network (Warm Amber Charcoal)
  const opacity2 = useTransform(
    activeProgress,
    BACKGROUND_STOPS[2].range,
    BACKGROUND_STOPS[2].opacityCurve
  );

  // Stop 3: AI Intake Engine (Luminous Cyan-Teal)
  const opacity3 = useTransform(
    activeProgress,
    BACKGROUND_STOPS[3].range,
    BACKGROUND_STOPS[3].opacityCurve
  );

  // Stop 4: Advocate SaaS (Deep Emerald-Navy)
  const opacity4 = useTransform(
    activeProgress,
    BACKGROUND_STOPS[4].range,
    BACKGROUND_STOPS[4].opacityCurve
  );

  // Stop 5: Compliance & Trust (Radiant Judicial Brass & Gold)
  const opacity5 = useTransform(
    activeProgress,
    BACKGROUND_STOPS[5].range,
    BACKGROUND_STOPS[5].opacityCurve
  );

  // Stop 6: CTA & Footer (Obsidian Pitch Black)
  const opacity6 = useTransform(
    activeProgress,
    BACKGROUND_STOPS[6].range,
    BACKGROUND_STOPS[6].opacityCurve
  );

  const opacities = [
    opacity0,
    opacity1,
    opacity2,
    opacity3,
    opacity4,
    opacity5,
    opacity6,
  ];

  if (shouldReduceMotion) {
    return (
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-[#060911]"
        style={{ background: STATIC_HERO_GRADIENT }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#060911]"
      aria-hidden="true"
    >
      {/* 7 Layered Gradient Stops for Smooth Continuous Color Journey */}
      {BACKGROUND_STOPS.map((stop, index) => (
        <motion.div
          key={stop.id}
          data-bg-stop={stop.id}
          className="absolute inset-0 will-change-[opacity]"
          style={{
            background: stop.gradient,
            opacity: opacities[index],
          }}
        />
      ))}

      {/* Atmospheric depth lighting overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(255, 255, 255, 0.04) 0%, transparent 70%)",
        }}
      />

      {/* Subtle spatial vignette */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent 50%, rgba(0, 0, 0, 0.75) 100%)",
        }}
      />

      {/* Architectural micro grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
    </div>
  );
}
