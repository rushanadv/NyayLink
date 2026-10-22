"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import {
  ShieldCheck,
  Scale,
  Lock,
  RefreshCw,
  FileCheck2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface CredentialPanel {
  id: string;
  title: string;
  subtitle: string;
  stat: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CREDENTIAL_PANELS: CredentialPanel[] = [
  {
    id: "bci",
    title: "BCI Verified",
    subtitle: "State Bar Council Roll Authentication",
    stat: "480+ Enrolled",
    icon: ShieldCheck,
  },
  {
    id: "sec36",
    title: "Section 36 Compliant",
    subtitle: "Zero Touting & Solicitation Rules",
    stat: "100% Neutral",
    icon: Scale,
  },
  {
    id: "escrow",
    title: "Milestone Escrow",
    subtitle: "Triple-Layer Retainer Fund Security",
    stat: "₹0 Commission",
    icon: Lock,
  },
  {
    id: "ecourts",
    title: "e-Courts Integrated",
    subtitle: "Automated Daily Cause List Sync",
    stat: "28 States & UTs",
    icon: RefreshCw,
  },
  {
    id: "vakalatnama",
    title: "Digital Vakalatnama",
    subtitle: "Aadhaar e-Sign & Digital Vault",
    stat: "256-bit Encrypted",
    icon: FileCheck2,
  },
];

export function MomentumRing({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const isInView = useInView(containerRef, { margin: "-40px" });

  const [activeBlur, setActiveBlur] = useState<number>(0);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Animation & physics state stored in refs to avoid React re-renders during rAF
  const rotationRef = useRef<number>(0);
  const targetRotationRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const isHoveredRef = useRef<boolean>(false);
  const lastInteractionTimeRef = useRef<number>(0);
  const dragStartXRef = useRef<number>(0);
  const lastXRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  const numPanels = CREDENTIAL_PANELS.length;
  const angleStep = 360 / numPanels;
  const [radius, setRadius] = useState<number>(220);

  useEffect(() => {
    const updateRadius = () => {
      if (window.innerWidth < 480) {
        setRadius(160);
      } else if (window.innerWidth < 768) {
        setRadius(190);
      } else {
        setRadius(220);
      }
    };
    updateRadius();
    window.addEventListener("resize", updateRadius);
    return () => window.removeEventListener("resize", updateRadius);
  }, []);

  // Snap to nearest 360/N index
  const snapToNearest = useCallback(() => {
    const current = rotationRef.current;
    const nearestIndex = Math.round(current / angleStep);
    targetRotationRef.current = nearestIndex * angleStep;
  }, [angleStep]);

  // Click to navigate directly to panel
  const rotateToPanel = (index: number) => {
    targetRotationRef.current = -index * angleStep;
    velocityRef.current = 0;
    lastInteractionTimeRef.current = performance.now();
  };

  useEffect(() => {
    if (shouldReduceMotion) return;

    let isDocumentVisible = !document.hidden;
    lastInteractionTimeRef.current = performance.now();

    const updatePhysics = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = timestamp;

      // Auto-advance ring after 3.8s of idle (when not dragging and not hovered)
      if (!isDraggingRef.current && !isHoveredRef.current) {
        const idleTime = timestamp - lastInteractionTimeRef.current;
        if (idleTime > 3800) {
          targetRotationRef.current -= angleStep;
          lastInteractionTimeRef.current = timestamp;
        }
      }

      if (!isDraggingRef.current) {
        // Spring physics easing towards targetRotation
        const diff = targetRotationRef.current - rotationRef.current;

        if (Math.abs(diff) > 0.04) {
          // Spring toward snap target ("clicks into place")
          velocityRef.current = diff * 6.5 * dt;
          rotationRef.current += velocityRef.current;
        } else {
          // Settled exactly at panel
          rotationRef.current = targetRotationRef.current;
          velocityRef.current = 0;
        }
      }

      // Calculate dynamic blur based on angular velocity (max ~2.5px)
      const currentSpeed = Math.abs(velocityRef.current);
      const blurAmount = Math.min(2.5, currentSpeed * 0.75);
      setActiveBlur(blurAmount);

      // Determine front-facing active panel
      const normalizedAngle = ((-rotationRef.current % 360) + 360) % 360;
      const frontIndex = Math.round(normalizedAngle / angleStep) % numPanels;
      setActiveIndex(frontIndex);

      // Apply transform directly to DOM for GPU acceleration without re-rendering
      if (ringRef.current) {
        ringRef.current.style.transform = `rotateY(${rotationRef.current}deg)`;
      }

      if (isInView && isDocumentVisible) {
        animationFrameRef.current = requestAnimationFrame(updatePhysics);
      }
    };

    if (isInView && isDocumentVisible) {
      animationFrameRef.current = requestAnimationFrame(updatePhysics);
    }

    const handleVisibility = () => {
      isDocumentVisible = !document.hidden;
      if (isDocumentVisible && isInView) {
        lastTimeRef.current = performance.now();
        lastInteractionTimeRef.current = performance.now();
        animationFrameRef.current = requestAnimationFrame(updatePhysics);
      } else {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isInView, shouldReduceMotion, angleStep, numPanels]);

  // Pointer drag/swipe interactions
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    lastInteractionTimeRef.current = performance.now();
    dragStartXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;

    // Direct rotation tracking on drag
    rotationRef.current += deltaX * 0.45;
    targetRotationRef.current = rotationRef.current;
    velocityRef.current = deltaX * 0.45;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    lastInteractionTimeRef.current = performance.now();
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore pointer capture release error if detached
    }

    // Add inertia then snap/ease to nearest 360/N panel ("clicks into place")
    targetRotationRef.current = rotationRef.current + velocityRef.current * 10;
    snapToNearest();
  };

  // Static Fallback for reduced motion preference
  if (shouldReduceMotion) {
    return (
      <div className={`w-full py-4 space-y-4 ${className}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {CREDENTIAL_PANELS.map((panel) => {
            const Icon = panel.icon;
            return (
              <div
                key={panel.id}
                className="p-4 rounded-xl bg-white border border-[#D5E5D9] shadow-md space-y-2 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center text-[#205C43]">
                    <Icon className="w-4 h-4 text-[#205C43]" />
                  </div>
                  <span className="text-[9px] font-mono text-[#205C43] px-1.5 py-0.5 rounded-lg bg-[#EAF3ED] border border-[#D5E5D9] uppercase tracking-wider font-semibold">
                    {panel.stat}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#202824]">
                    {panel.title}
                  </h4>
                  <p className="text-[11px] text-[#69736D] leading-tight mt-1">
                    {panel.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-center text-xs text-[#69736D]">
          Every layer of this platform is independently verified.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full flex flex-col items-center justify-center select-none py-10 overflow-hidden ${className}`}
    >
      {/* 3D Perspective Stage */}
      <div
        className="relative w-full max-w-2xl h-[280px] flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
        style={{ perspective: "1200px" }}
        onMouseEnter={() => {
          isHoveredRef.current = true;
        }}
        onMouseLeave={() => {
          isHoveredRef.current = false;
          lastInteractionTimeRef.current = performance.now();
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Revolving Inner Ring */}
        <div
          ref={ringRef}
          className="relative w-[190px] sm:w-[230px] h-[175px] sm:h-[190px] flex items-center justify-center"
          style={{
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
        >
          {CREDENTIAL_PANELS.map((panel, i) => {
            const Icon = panel.icon;
            const panelAngle = i * angleStep;
            const isFacing = activeIndex === i;

            return (
              <div
                key={panel.id}
                onClick={() => rotateToPanel(i)}
                className={`absolute inset-0 p-4 sm:p-5 rounded-xl border backdrop-blur-md transition-colors duration-300 flex flex-col justify-between shadow-md ${
                  isFacing
                    ? "bg-white border-[#205C43]/50 shadow-[0_15px_35px_rgba(32,92,67,0.1)]"
                    : "bg-[#FAFCFB] border-[#D5E5D9] opacity-80 shadow-xs"
                }`}
                style={{
                  transform: `rotateY(${panelAngle}deg) translateZ(${radius}px)`,
                  filter: `blur(${activeBlur}px)`,
                  backfaceVisibility: "visible",
                }}
              >
                {/* Top Badge Row */}
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center text-[#205C43]">
                    <Icon className="w-4 h-4 text-[#205C43]" />
                  </div>
                  <span className="text-[9px] font-mono text-[#205C43] px-1.5 py-0.5 rounded-lg bg-[#EAF3ED] border border-[#D5E5D9] uppercase tracking-wider font-semibold">
                    {panel.stat}
                  </span>
                </div>

                {/* Panel Title & Subtitle */}
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-[#202824] tracking-tight">
                    {panel.title}
                  </h4>
                  <p className="text-[11px] text-[#69736D] leading-snug line-clamp-2">
                    {panel.subtitle}
                  </p>
                </div>

                {/* Bottom Verification Indicator */}
                <div className="pt-2 border-t border-[#D5E5D9] flex items-center gap-1.5 text-[10px] font-mono text-[#205C43] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#205C43]" />
                  <span>Enforced by Protocol</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls & Caption */}
      <div className="flex flex-col items-center gap-3 mt-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              targetRotationRef.current += angleStep;
              snapToNearest();
            }}
            className="p-1.5 rounded-full bg-white hover:bg-[#EAF3ED] text-[#202824] border border-[#D5E5D9] transition-colors shadow-xs"
            aria-label="Previous credential layer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5 px-3">
            {CREDENTIAL_PANELS.map((_, i) => (
              <button
                key={i}
                onClick={() => rotateToPanel(i)}
                className={`transition-all duration-300 rounded-full ${
                  activeIndex === i
                    ? "w-5 h-1.5 bg-[#205C43]"
                    : "w-1.5 h-1.5 bg-[#D5E5D9] hover:bg-[#205C43]/40"
                }`}
                aria-label={`Jump to credential layer ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => {
              targetRotationRef.current -= angleStep;
              snapToNearest();
            }}
            className="p-1.5 rounded-full bg-white hover:bg-[#EAF3ED] text-[#202824] border border-[#D5E5D9] transition-colors shadow-xs"
            aria-label="Next credential layer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Supporting Caption */}
        <p className="text-xs font-mono text-[#69736D] text-center tracking-wide">
          Every layer of this platform is independently verified.
        </p>
      </div>
    </div>
  );
}
