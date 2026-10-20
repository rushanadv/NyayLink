"use client";

import React from "react";

/**
 * FilmGrain
 * Ultra-subtle (3.5% opacity, mix-blend-overlay) procedural noise overlay
 * Gives dark backgrounds tactile depth without incurring network or layout cost.
 */
export function FilmGrain() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[1] opacity-[0.035] mix-blend-overlay overflow-hidden select-none"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
      }}
    />
  );
}
