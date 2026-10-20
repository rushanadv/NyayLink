"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "framer-motion";

export function CursorSpotlight() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    // If reduced motion is requested or ref is missing, don't run mouse tracking
    if (shouldReduceMotion || !containerRef.current) return;

    let rafId: number | null = null;
    let latestX = -1000;
    let latestY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      latestX = e.clientX;
      latestY = e.clientY;

      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          if (containerRef.current) {
            containerRef.current.style.setProperty("--spot-x", `${latestX}px`);
            containerRef.current.style.setProperty("--spot-y", `${latestY}px`);
          }
          rafId = null;
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [shouldReduceMotion]);

  // Exclude spotlight over auth pages which have their own two-pane form layout
  if (pathname?.startsWith("/auth")) {
    return null;
  }

  if (shouldReduceMotion) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[2] overflow-hidden"
      style={{
        background:
          "radial-gradient(420px circle at var(--spot-x, -1000px) var(--spot-y, -1000px), rgba(197, 160, 89, 0.07) 0%, rgba(197, 160, 89, 0.02) 45%, transparent 70%)",
        transition: "opacity 0.3s ease",
      }}
    />
  );
}
