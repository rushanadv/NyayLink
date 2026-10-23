"use client";

import React, { useRef, useEffect, useState, memo } from "react";
import { Scale, Sparkles } from "lucide-react";

interface PerimeterGlowProps {
  children: React.ReactNode;
  isActive?: boolean;
  className?: string;
}

/**
 * Cursor-reactive edge-lit perimeter treatment inspired by the Oryzo.ai interaction,
 * adapted specifically for NyayLink's white-and-forest-green legal aesthetic.
 *
 * Employs CSS variables, requestAnimationFrame interpolation, layered gradients,
 * and backdrop masks to create an ambient, edge-shifting glow without 3D WebGL overhead.
 */
export const PerimeterGlowContainer = memo(function PerimeterGlowContainer({
  children,
  isActive = false,
  className = "",
}: PerimeterGlowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Mouse tracking state with smooth linear interpolation (lerp)
  const mousePos = useRef({ x: 50, y: 50, targetX: 50, targetY: 50 });
  const idleTimer = useRef<NodeJS.Timeout | null>(null);
  const [isIdle, setIsIdle] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animFrame: number;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      mousePos.current.targetX = Math.max(0, Math.min(100, x));
      mousePos.current.targetY = Math.max(0, Math.min(100, y));

      setIsIdle(false);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setIsIdle(true), 2500);
    };

    const handlePointerEnter = () => setIsHovered(true);
    const handlePointerLeave = () => {
      setIsHovered(false);
      setIsIdle(true);
      mousePos.current.targetX = 50;
      mousePos.current.targetY = 50;
    };

    const handleFocusIn = () => setIsFocused(true);
    const handleFocusOut = () => setIsFocused(false);

    // Lerp loop for fluid, non-abrupt cursor tracking
    const updateGlow = () => {
      const current = mousePos.current;
      current.x += (current.targetX - current.x) * 0.12;
      current.y += (current.targetY - current.y) * 0.12;

      container.style.setProperty("--glow-x", `${current.x.toFixed(2)}%`);
      container.style.setProperty("--glow-y", `${current.y.toFixed(2)}%`);

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
  }, []);

  // Intensity state computation
  const intensity = isFocused ? 0.95 : isHovered ? 0.8 : isActive ? 0.7 : isIdle ? 0.42 : 0.65;

  return (
    <div
      ref={containerRef}
      className={`relative rounded-2xl group transition-shadow duration-700 ${className}`}
      style={
        {
          "--glow-x": "50%",
          "--glow-y": "50%",
          "--glow-intensity": intensity,
        } as React.CSSProperties
      }
    >
      {/* Layer 1: Exterior Perimeter Aura (Soft radial wash outside the border) */}
      <div
        className="absolute -inset-1.5 sm:-inset-2 rounded-3xl pointer-events-none transition-opacity duration-700 z-0 blur-xl opacity-60"
        style={{
          opacity: `calc(var(--glow-intensity) * 0.75)`,
          background: `
            radial-gradient(
              550px circle at var(--glow-x) var(--glow-y),
              rgba(16, 185, 129, 0.45) 0%,
              rgba(32, 92, 67, 0.35) 30%,
              rgba(234, 243, 237, 0.25) 55%,
              transparent 75%
            )
          `,
        }}
        aria-hidden="true"
      />

      {/* Layer 2: Edge-Lit Perimeter Trace (Crisp border highlight following the cursor) */}
      <div
        className="absolute -inset-[1px] rounded-2xl pointer-events-none transition-opacity duration-500 z-0 opacity-80"
        style={{
          opacity: `var(--glow-intensity)`,
          background: `
            radial-gradient(
              420px circle at var(--glow-x) var(--glow-y),
              #10B981 0%,
              #205C43 35%,
              #EAF3ED 70%,
              transparent 100%
            )
          `,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1.5px",
        }}
        aria-hidden="true"
      />

      {/* Layer 3: Ambient Color Drift Ring (Breathing rotational movement along perimeter) */}
      <div
        className="absolute -inset-[2px] rounded-2xl pointer-events-none z-0 opacity-30 mix-blend-multiply motion-reduce:hidden"
        style={{
          background: `conic-gradient(from 0deg at 50% 50%, rgba(32,92,67,0.3) 0deg, rgba(16,185,129,0.4) 90deg, rgba(234,243,237,0.6) 180deg, rgba(32,92,67,0.3) 360deg)`,
          animation: "edge-drift 14s linear infinite",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1.5px",
        }}
        aria-hidden="true"
      />

      {/* Inner Container: Solid White surface protecting readable text */}
      <div className="relative z-10 w-full h-full bg-white rounded-2xl overflow-hidden shadow-sm">
        {children}
      </div>

      <style jsx global>{`
        @keyframes edge-drift {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
});

/**
 * Interactive NyayLink Legal Compass Motif for the initial empty state.
 * Responds subtly to pointer proximity with gentle 3D tilt and light reflection,
 * communicating clarity, trust, and focus before a conversation begins.
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

    // Subtle restrained tilt (-5deg to +5deg)
    setTilt({
      x: -dy * 5,
      y: dx * 5,
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
      className="flex flex-col items-center justify-center text-center py-6 sm:py-8 px-4 cursor-default select-none transition-transform duration-300 ease-out"
      style={{
        transform: `perspective(800px) rotateX(${tilt.x.toFixed(2)}deg) rotateY(${tilt.y.toFixed(2)}deg)`,
      }}
    >
      {/* Concentric Compass Emblem */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-5 flex items-center justify-center">
        {/* Outer orbital ring */}
        <div className="absolute inset-0 rounded-full border border-[#D5E5D9] animate-[spin_24s_linear_infinite] opacity-60" />

        {/* Middle dashed compass ring */}
        <div className="absolute inset-2 rounded-full border border-dashed border-[#205C43]/40 animate-[spin_18s_linear_infinite_reverse]" />

        {/* Inner radiant node */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#EAF3ED] via-white to-[#D5E5D9]/50 border border-[#D5E5D9] flex items-center justify-center text-[#205C43] shadow-md shadow-[#205C43]/10 relative z-10 transition-transform hover:scale-105">
          <Scale className="w-6 h-6 text-[#205C43]" />
        </div>

        {/* Cardinal tick dots */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#205C43]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#205C43]" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#205C43]" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#205C43]" />
      </div>

      {/* Editorial Title */}
      <h3 className="text-xl sm:text-2xl font-serif font-semibold text-[#174530] tracking-tight mb-2 flex items-center gap-2">
        <span>Nyay AI Legal Intake</span>
        <Sparkles className="w-4 h-4 text-[#205C43]" />
      </h3>

      <p className="text-xs sm:text-sm text-[#69736D] max-w-md leading-relaxed">
        Describe your legal dispute, notice, or question in plain language.
        Receive statutory provisions, procedural orientation, and guidance for counsel.
      </p>
    </div>
  );
});
