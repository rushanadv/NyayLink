"use client";

import React, { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

interface CountUpProps {
  to: number;
  from?: number;
  duration?: number; // in ms, default ~800
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

/**
 * CountUp
 * Lightweight rAF-based numerical tween (~800ms ease-out)
 * Runs strictly ONCE per session when the section scrolls into view.
 * Immediately renders the target value if prefers-reduced-motion is active.
 */
export function CountUp({
  to,
  from = 0,
  duration = 800,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { amount: 0.25, once: true });
  const shouldReduceMotion = useReducedMotion();
  const hasAnimatedRef = useRef(false);

  const [value, setValue] = useState<number>(shouldReduceMotion ? to : from);

  useEffect(() => {
    if (shouldReduceMotion) {
      setValue(to);
      return;
    }

    if (!isInView || hasAnimatedRef.current) {
      return;
    }

    hasAnimatedRef.current = true;
    let startTime: number | null = null;
    let rafId: number;

    // Smooth cubic ease-out for numerical convergence
    const easeOutCubic = (t: number): number => {
      return 1 - Math.pow(1 - t, 3);
    };

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(progress);

      const current = from + (to - from) * eased;
      setValue(current);

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        setValue(to);
      }
    };

    rafId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [isInView, to, from, duration, shouldReduceMotion]);

  const formatted =
    decimals > 0
      ? value.toFixed(decimals)
      : Math.round(value).toLocaleString("en-IN");

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
