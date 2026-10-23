"use client";

import React, { useRef, useEffect, useState, memo } from "react";
import { Sparkles } from "lucide-react";
import { NyayLinkLogo } from "@/components/ui/nyaylink-logo";

interface PerimeterGlowProps {
  children: React.ReactNode;
  isActive?: boolean;
  className?: string;
}

/**
 * Animated Rainbow Perimeter & Pointer-Reactive Edge Glow
 *
 * Implements the color-shifting illuminated edge treatment from the reference recordings:
 * - A continuous rotating rainbow conic spectrum (Forest Green -> Emerald -> Cyan -> Sapphire -> Violet -> Magenta -> Amber -> Green)
 * - Crisp 1.5px masked perimeter stroke without color blocking
 * - Outer soft blurred halo (24px blur) creating ambient luminosity
 * - Pointer-reactive spotlight tracking cursor position with smooth lerp damping and natural lag
 * - Pure CSS animation & variable interpolation for 60fps performance without 3D canvas overhead
 * - Full support for prefers-reduced-motion and touch devices
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

    let animFrame: number;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      mouseState.current.targetX = Math.max(0, Math.min(100, x));
      mouseState.current.targetY = Math.max(0, Math.min(100, y));
      mouseState.current.targetIntensity = 1.0;

      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        // Settle back to subtle ambient intensity after 2s idle
        mouseState.current.targetIntensity = 0.35;
      }, 2200);
    };

    const handlePointerEnter = () => {
      setIsHovered(true);
      mouseState.current.targetIntensity = 0.9;
    };

    const handlePointerLeave = () => {
      setIsHovered(false);
      mouseState.current.targetIntensity = 0;
      // Gently return pointer center
      mouseState.current.targetX = 50;
      mouseState.current.targetY = 50;
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };

    const handleFocusIn = () => {
      setIsFocused(true);
      mouseState.current.targetIntensity = 0.85;
    };

    const handleFocusOut = () => {
      setIsFocused(false);
      mouseState.current.targetIntensity = isHovered ? 0.9 : 0;
    };

    // RAF Loop for smooth lerp lag (12% lerp per frame = natural silky damping)
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

  // Ambient baseline opacity
  const ambientHaloOpacity = isFocused ? 0.85 : isHovered ? 0.75 : isActive ? 0.65 : 0.48;

  return (
    <div
      ref={containerRef}
      className={`relative rounded-2xl group transition-all duration-500 ${className}`}
      style={
        {
          "--pointer-x": "50%",
          "--pointer-y": "50%",
          "--pointer-intensity": "0",
        } as React.CSSProperties
      }
    >
      {/* LAYER 1: Outer Rainbow Halo Glow (24px blur creates soft radiant luminescence) */}
      <div
        className="absolute -inset-2 sm:-inset-2.5 rounded-3xl pointer-events-none z-0 blur-[24px] transition-opacity duration-700 animate-rainbow-border motion-reduce:animate-none"
        style={{
          opacity: ambientHaloOpacity,
          background: `conic-gradient(from var(--rainbow-angle, 0deg) at 50% 50%,
            #205C43 0deg,
            #10B981 40deg,
            #06B6D4 90deg,
            #3B82F6 140deg,
            #8B5CF6 190deg,
            #EC4899 240deg,
            #F59E0B 290deg,
            #10B981 330deg,
            #205C43 360deg
          )`,
        }}
        aria-hidden="true"
      />

      {/* LAYER 2: Crisp Animated Rainbow Perimeter Stroke (Strict 1.5px border via mask) */}
      <div
        className="absolute -inset-[1.5px] rounded-2xl pointer-events-none z-0 animate-rainbow-border motion-reduce:animate-none transition-opacity duration-500"
        style={{
          background: `conic-gradient(from var(--rainbow-angle, 0deg) at 50% 50%,
            #205C43 0deg,
            #10B981 40deg,
            #06B6D4 90deg,
            #3B82F6 140deg,
            #8B5CF6 190deg,
            #EC4899 240deg,
            #F59E0B 290deg,
            #10B981 330deg,
            #205C43 360deg
          )`,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1.5px",
        }}
        aria-hidden="true"
      />

      {/* LAYER 3: Pointer-Reactive Edge Spotlight (Brightens nearest perimeter sector) */}
      <div
        className="absolute -inset-[1.5px] rounded-2xl pointer-events-none z-0 transition-opacity duration-200"
        style={{
          opacity: "var(--pointer-intensity, 0)",
          background: `radial-gradient(
            360px circle at var(--pointer-x, 50%) var(--pointer-y, 50%),
            rgba(255, 255, 255, 0.95) 0%,
            rgba(255, 255, 255, 0.4) 35%,
            rgba(255, 255, 255, 0.1) 60%,
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
        className="absolute -inset-2 rounded-3xl pointer-events-none z-0 blur-[18px] transition-opacity duration-300"
        style={{
          opacity: "calc(var(--pointer-intensity, 0) * 0.7)",
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

      {/* Solid White Interior Surface (Protects 100% readability of text and inputs) */}
      <div className="relative z-10 w-full h-full bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col">
        {children}
      </div>
    </div>
  );
});

/**
 * Interactive NyayLink Legal Compass Motif for the initial empty state.
 * Features the official Lady Justice emblem in an orbital celestial frame,
 * with subtle pointer-proximity 3D tilt.
 */
export const LegalCompassMotif = memo(function LegalCompassMotif() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);

    // Subtle restrained tilt (-4deg to +4deg)
    setTilt({
      x: -dy * 4,
      y: dx * 4,
    });
  };

  const handlePointerLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="flex flex-col items-center justify-center text-center py-2 sm:py-2.5 px-4 cursor-default select-none transition-transform duration-300 ease-out"
      style={{
        transform: `perspective(800px) rotateX(${tilt.x.toFixed(2)}deg) rotateY(${tilt.y.toFixed(2)}deg)`,
      }}
    >
      {/* Concentric Compass Emblem with Official Lady Justice Logo */}
      <div className="relative w-12 h-12 sm:w-16 sm:h-16 mb-1.5 sm:mb-2 flex items-center justify-center">
        {/* Outer orbital ring */}
        <div className="absolute inset-0 rounded-full border border-[#D5E5D9] animate-[spin_24s_linear_infinite] opacity-60" />

        {/* Middle dashed compass ring */}
        <div className="absolute inset-1.5 rounded-full border border-dashed border-[#205C43]/40 animate-[spin_18s_linear_infinite_reverse]" />

        {/* Center node: Official Lady Justice Emblem */}
        <div className="relative z-10 transition-transform hover:scale-105 duration-200">
          <NyayLinkLogo variant="symbol" size={26} href={false} />
        </div>

        {/* Cardinal tick dots */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#205C43]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#205C43]" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#205C43]" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#205C43]" />
      </div>

      {/* Editorial Title */}
      <h3 className="text-lg sm:text-xl font-serif font-semibold text-[#174530] tracking-tight mb-1 flex items-center gap-1.5">
        <span>What would you like help understanding?</span>
        <Sparkles className="w-4 h-4 text-[#205C43]" />
      </h3>

      <p className="text-xs text-[#69736D] max-w-md leading-relaxed">
        Describe your legal dispute, notice, or question in plain language for statutory guidance.
      </p>
    </div>
  );
});
