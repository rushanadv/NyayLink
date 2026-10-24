"use client";

import React, { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface HeroHeadlineRevealProps {
  text: string;
  className?: string;
  highlightWords?: string[];
  highlightColor?: string;
}

/**
 * Editorial headline reveal with restrained, mask-clipped line animation.
 * Eliminates canvas rasterization, noise particles, font metric shifts, and visual jitter.
 * Each line acts as an intentional typographic unit with luxury editorial easing.
 */
export function HeroHeadlineReveal({
  text,
  className = "",
}: HeroHeadlineRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  // Split text by explicit newline breaks (preserved from i18n dictionaries)
  const lines = useMemo(() => {
    if (!text) return [];
    if (text.includes("\n")) {
      return text.split("\n").map((l) => l.trim()).filter(Boolean);
    }
    return [text];
  }, [text]);

  // Luxury editorial easing curve: fast initial acceleration with silky smooth settle
  const editorialEase = [0.16, 1, 0.3, 1] as const;

  return (
    <span className={`block select-text ${className}`}>
      {lines.map((line, idx) => (
        <span
          key={`${idx}-${line}`}
          className="block overflow-hidden py-[0.12em] -my-[0.12em]"
        >
          <motion.span
            className="block transform-gpu will-change-transform"
            initial={shouldReduceMotion ? false : { y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.82,
              delay: 0.08 + idx * 0.14,
              ease: editorialEase,
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
