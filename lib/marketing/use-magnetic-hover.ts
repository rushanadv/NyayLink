"use client";

import { useRef } from "react";
import { useMotionValue, useSpring, useReducedMotion } from "framer-motion";

/**
 * useMagneticHover
 * Spring-based magnetic hover effect clamped to maxDisplacement px.
 * Reverts smoothly to (0, 0) on pointer leave.
 * Respects prefers-reduced-motion by keeping displacement at 0.
 */
export function useMagneticHover(maxDisplacement = 8) {
  const ref = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 220, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (shouldReduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distX = e.clientX - centerX;
    const distY = e.clientY - centerY;

    // Scale displacement by distance from center, clamped to [-maxDisplacement, maxDisplacement]
    const clampedX = Math.max(-maxDisplacement, Math.min(maxDisplacement, distX * 0.28));
    const clampedY = Math.max(-maxDisplacement, Math.min(maxDisplacement, distY * 0.28));

    x.set(clampedX);
    y.set(clampedY);
  };

  const handleMouseLeave = () => {
    if (shouldReduceMotion) return;
    x.set(0);
    y.set(0);
  };

  return {
    ref,
    x: shouldReduceMotion ? 0 : springX,
    y: shouldReduceMotion ? 0 : springY,
    handleMouseMove,
    handleMouseLeave,
  };
}
