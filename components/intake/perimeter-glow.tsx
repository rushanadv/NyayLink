"use client";

import React, { useRef, useEffect, useState, memo } from "react";
import { NyayLinkLogo } from "@/components/ui/nyaylink-logo";
import { Sparkles } from "lucide-react";

interface PerimeterGlowProps {
  children: React.ReactNode;
  isActive?: boolean;
  className?: string;
}

/**
 * Animated Rainbow Perimeter & Pointer-Reactive Edge Glow
 *
 * Faithfully reproduces the iridescent perimeter edge from the reference recording (oryzo.ai):
 * - Smooth rotating spectral conic gradient (Forest Green -> Emerald -> Cyan -> Indigo -> Violet -> Rose -> Amber -> Lime -> Forest Green)
 * - Crisp 1.5px masked perimeter stroke hugging rounded container boundaries
 * - Soft diffuse outer ambient halo (28px blur) casting subtle iridescent luminescence
 * - Pointer-reactive spotlight tracking cursor position with smooth lerp damping on devices with mouse/hover
 * - Touch-device optimization: pointer tracking is bypassed on touch screens, preserving battery & 60fps scrolling
 * - Full support for prefers-reduced-motion (stops rotation and tracking gracefully)
 * - Solid white interior surface ensuring 100% text legibility and contrast
 */
export const PerimeterGlowContainer = memo(function PerimeterGlowContainer({
  children,
  isActive = false,
  className = "",
}: PerimeterGlowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Smooth pointer tracking with lerp interpolation
  const mouseState = useRef({
    currentX: 50,
    currentY: 50,
    targetX: 50,
    targetY: 50,
    currentIntensity: 0,
    targetIntensity: 0,
  });

  const idleTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Only enable pointer tracking on devices that support hover with fine pointer
    const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!supportsHover || prefersReducedMotion) {
      container.style.setProperty("--pointer-intensity", "0");
      return;
    }

    let animFrame: number;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      mouseState.current.targetX = Math.max(0, Math.min(100, x));
      mouseState.current.targetY = Math.max(0, Math.min(100, y));
      mouseState.current.targetIntensity = 0.95;

      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        // Settle back to subtle ambient intensity after 2s idle
        mouseState.current.targetIntensity = 0.3;
      }, 2000);
    };

    const handlePointerEnter = () => {
      setIsHovered(true);
      mouseState.current.targetIntensity = 0.85;
    };

    const handlePointerLeave = () => {
      setIsHovered(false);
      mouseState.current.targetIntensity = 0;
      mouseState.current.targetX = 50;
      mouseState.current.targetY = 50;
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };

    const handleFocusIn = () => {
      setIsFocused(true);
      mouseState.current.targetIntensity = 0.8;
    };

    const handleFocusOut = () => {
      setIsFocused(false);
      mouseState.current.targetIntensity = isHovered ? 0.85 : 0;
    };

    // 60fps RAF loop with 12% lerp for natural silky damping
    const updateGlow = () => {
      const state = mouseState.current;
      state.currentX += (state.targetX - state.currentX) * 0.12;
      state.currentY += (state.targetY - state.currentY) * 0.12;
      state.currentIntensity += (state.targetIntensity - state.currentIntensity) * 0.08;

      container.style.setProperty("--pointer-x", `${state.currentX.toFixed(2)}%`);
      container.style.setProperty("--pointer-y", `${state.currentY.toFixed(2)}%`);
      container.style.setProperty("--pointer-intensity", state.currentIntensity.toFixed(3));

      animFrame = requestAnimationFrame(updateGlow);
    };

    container.addEventListener("pointermove", handlePointerMove, { passive: true });
    container.addEventListener("pointerenter", handlePointerEnter);
    container.addEventListener("pointerleave", handlePointerLeave);
    container.addEventListener("focusin", handleFocusIn);
    container.addEventListener("focusout", handleFocusOut);

    animFrame = requestAnimationFrame(updateGlow);

    return () => {
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerenter", handlePointerEnter);
      container.removeEventListener("pointerleave", handlePointerLeave);
      container.removeEventListener("focusin", handleFocusIn);
      container.removeEventListener("focusout", handleFocusOut);
      cancelAnimationFrame(animFrame);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [isHovered]);

  // Ambient baseline opacity - refined to remain subtle and not overpower text
  const ambientHaloOpacity = isFocused
    ? 0.72
    : isHovered
    ? 0.62
    : isActive
    ? 0.68
    : 0.42;

  return (
    <div
      ref={containerRef}
      className={`relative rounded-2xl sm:rounded-3xl group transition-all duration-500 ${className}`}
      style={
        {
          "--pointer-x": "50%",
          "--pointer-y": "50%",
          "--pointer-intensity": "0",
        } as React.CSSProperties
      }
    >
      {/* LAYER 1: Outer Rainbow Halo Glow (28px blur creates luminous diffuse halo around container) */}
      <div
        className="absolute -inset-2 sm:-inset-2.5 rounded-3xl sm:rounded-[28px] pointer-events-none z-0 blur-[28px] transition-opacity duration-700 animate-rainbow-border motion-reduce:animate-none"
        style={{
          opacity: ambientHaloOpacity,
          background: `conic-gradient(from var(--rainbow-angle, 0deg) at 50% 50%,
            #205C43 0deg,
            #10B981 35deg,
            #06B6D4 80deg,
            #4F46E5 130deg,
            #8B5CF6 180deg,
            #F43F5E 230deg,
            #F59E0B 280deg,
            #84CC16 325deg,
            #205C43 360deg
          )`,
        }}
        aria-hidden="true"
      />

      {/* LAYER 2: Crisp Animated Rainbow Perimeter Stroke (Strict 1.5px border via mask exclusion) */}
      <div
        className="absolute -inset-[1.5px] rounded-2xl sm:rounded-3xl pointer-events-none z-0 animate-rainbow-border motion-reduce:animate-none transition-opacity duration-500"
        style={{
          background: `conic-gradient(from var(--rainbow-angle, 0deg) at 50% 50%,
            #205C43 0deg,
            #10B981 35deg,
            #06B6D4 80deg,
            #4F46E5 130deg,
            #8B5CF6 180deg,
            #F43F5E 230deg,
            #F59E0B 280deg,
            #84CC16 325deg,
            #205C43 360deg
          )`,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1.5px",
        }}
        aria-hidden="true"
      />

      {/* LAYER 3: Pointer-Reactive Edge Spotlight (Brightens the nearest perimeter sector) */}
      <div
        className="absolute -inset-[1.5px] rounded-2xl sm:rounded-3xl pointer-events-none z-0 transition-opacity duration-200"
        style={{
          opacity: "var(--pointer-intensity, 0)",
          background: `radial-gradient(
            380px circle at var(--pointer-x, 50%) var(--pointer-y, 50%),
            rgba(255, 255, 255, 0.95) 0%,
            rgba(255, 255, 255, 0.45) 35%,
            rgba(255, 255, 255, 0.12) 65%,
            transparent 85%
          )`,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1.5px",
          mixBlendMode: "overlay",
        }}
        aria-hidden="true"
      />

      {/* LAYER 4: Pointer-Reactive Soft Bloom Flare (Follows cursor smoothly outside edge) */}
      <div
        className="absolute -inset-2 sm:-inset-2.5 rounded-3xl pointer-events-none z-0 blur-[20px] transition-opacity duration-300"
        style={{
          opacity: "calc(var(--pointer-intensity, 0) * 0.65)",
          background: `radial-gradient(
            320px circle at var(--pointer-x, 50%) var(--pointer-y, 50%),
            rgba(16, 185, 129, 0.5) 0%,
            rgba(6, 182, 212, 0.35) 30%,
            rgba(139, 92, 246, 0.25) 55%,
            transparent 80%
          )`,
        }}
        aria-hidden="true"
      />

      {/* Solid Interior Surface (Protects 100% legibility of text and controls) */}
      <div className="relative z-10 w-full h-full bg-[#FFFFFF] rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm flex flex-col border border-[#D5E5D9]/50">
        {children}
      </div>
    </div>
  );
});

/**
 * Refined Initial State Emblem & Prompt Header
 * Displays the NyayLink Lady Justice emblem with clean editorial typography.
 */
export const LegalCompassMotif = memo(function LegalCompassMotif() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-2 sm:py-3 px-4 select-none">
      {/* Concentric Crest with Official Lady Justice Logo */}
      <div className="relative w-12 h-12 sm:w-14 sm:h-14 mb-2 flex items-center justify-center">
        {/* Subtle pulsing background disc */}
        <div className="absolute inset-0 rounded-full bg-[#EAF3ED]/80 border border-[#D5E5D9]" />
        {/* Orbital hairline ring */}
        <div className="absolute -inset-1 rounded-full border border-dashed border-[#205C43]/30 animate-[spin_30s_linear_infinite]" />
        {/* Center node: Official Lady Justice Emblem */}
        <div className="relative z-10">
          <NyayLinkLogo variant="symbol" size={24} href={false} />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-base sm:text-lg font-serif font-semibold text-[#174530] tracking-tight mb-1 flex items-center gap-1.5">
        <span>What legal situation would you like to explore?</span>
        <Sparkles className="w-3.5 h-3.5 text-[#205C43]" />
      </h3>

      <p className="text-xs text-[#69736D] max-w-lg leading-relaxed">
        Describe what occurred in everyday language. The assistant will help organise key facts, identify relevant Indian statutes, and outline practical next steps.
      </p>
    </div>
  );
});
