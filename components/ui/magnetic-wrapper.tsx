"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

interface MagneticWrapperProps {
  children: React.ReactNode;
  className?: string;
  maxDisplacement?: number;
}

export function MagneticWrapper({
  children,
  className = "inline-block",
  maxDisplacement = 8,
}: MagneticWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 220, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distX = e.clientX - centerX;
    const distY = e.clientY - centerY;

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

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
