"use client";

import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

interface ParticleTextProps {
  text: string;
  className?: string;
  highlightColor?: string;
  textColor?: string;
  particleSize?: number;
  duration?: number;
}

interface Particle {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  delay: number;
  color: string;
  size: number;
}

export function ParticleText({
  text,
  className = "",
  highlightColor = "#C5A059",
  textColor = "#F5F4FA",
  particleSize = 1.3,
  duration = 1400,
}: ParticleTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [animationCompleted, setAnimationCompleted] = useState(false);

  useEffect(() => {
    if (shouldReduceMotion) {
      setAnimationCompleted(true);
      return;
    }

    const container = containerRef.current;
    const canvas = canvasRef.current;
    const textEl = textRef.current;
    if (!container || !canvas || !textEl) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;
    let cancelled = false;
    let renderFn: ((timestamp: number) => void) | null = null;

    const startEffect = async () => {
      if (typeof document !== "undefined" && document.fonts) {
        try {
          await document.fonts.ready;
        } catch {
          // ignore font loading error
        }
      }
      if (cancelled) return;

      let startTime: number | null = null;
      let particles: Particle[] = [];

      // Measure element bounding box for crisp DPI-aware canvas
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(rect.width, 280);
      const height = Math.max(rect.height, 50);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Render offscreen text and sample pixels
      const offscreen = document.createElement("canvas");
      offscreen.width = width;
      offscreen.height = height;
      const offCtx = offscreen.getContext("2d", { willReadFrequently: true });

      if (!offCtx) return;

      const computedStyle = window.getComputedStyle(textEl);
      const fontSize = computedStyle.fontSize || "38px";
      const fontFamily = computedStyle.fontFamily || "serif";
      const fontWeight = computedStyle.fontWeight || "400";
      const letterSpacing = computedStyle.letterSpacing || "-0.02em";

      offCtx.fillStyle = "#ffffff";
      offCtx.font = `${fontWeight} ${fontSize} ${fontFamily}`;
      offCtx.textBaseline = "middle";
      if ("letterSpacing" in offCtx) {
        (offCtx as unknown as { letterSpacing: string }).letterSpacing = letterSpacing;
      }

      // Handle word wrapping if container is narrower than text
      const words = text.split(" ");
      let currentLine = "";
      const lines: string[] = [];
      for (let n = 0; n < words.length; n++) {
        const testLine = currentLine ? `${currentLine} ${words[n]}` : words[n];
        const metrics = offCtx.measureText(testLine);
        if (metrics.width > width - 10 && currentLine) {
          lines.push(currentLine);
          currentLine = words[n];
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);

      const parsedFontSize = parseFloat(fontSize) || 38;
      const lineHeightPx = parseFloat(computedStyle.lineHeight) || (parsedFontSize * 1.2);
      const totalTextHeight = lines.length * lineHeightPx;
      const startY = (height - totalTextHeight) / 2 + lineHeightPx / 2;

      lines.forEach((l, idx) => {
        offCtx.fillText(l, 0, startY + idx * lineHeightPx);
      });

      const imgData = offCtx.getImageData(0, 0, width, height);
      const data = imgData.data;

      // Grid sampling with adaptive step size to keep particle count ~1500-2200
      const step = 2;
      const rawPoints: { x: number; y: number; brightness: number }[] = [];
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const index = (y * width + x) * 4;
          const alpha = data[index + 3];
          if (alpha > 120) {
            rawPoints.push({ x, y, brightness: alpha / 255 });
          }
        }
      }

      // If too dense, sample with larger step
      const targetCount = 2000;
      const points =
        rawPoints.length > targetCount
          ? rawPoints.filter((_, i) => i % Math.ceil(rawPoints.length / targetCount) === 0)
          : rawPoints;

      // Build particle array with randomized scatter & slight stagger
      particles = points.map((p) => {
      // Scattered starting position across canvas boundary with radial swirl
      const angle = Math.random() * Math.PI * 2;
      const distance = 80 + Math.random() * 200;
      const startX = p.x + Math.cos(angle) * distance;
      const startY = p.y + Math.sin(angle) * distance;

      // Color palette mix: majority gold, some soft bright accents
      const isAccent = Math.random() < 0.35;
      const color = isAccent ? highlightColor : textColor;

      return {
        startX,
        startY,
        targetX: p.x,
        targetY: p.y,
        delay: Math.random() * 320, // Stagger up to 320ms
        color,
        size: particleSize * (0.8 + Math.random() * 0.4),
      };
    });

    // Ease-out cubic spring curve
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3.2);

    const render = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      let allSettled = true;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const particleElapsed = Math.max(0, elapsed - p.delay);
        const progress = Math.min(1, particleElapsed / duration);

        if (progress < 1) {
          allSettled = false;
        }

        const eased = easeOutCubic(progress);
        const currentX = p.startX + (p.targetX - p.startX) * eased;
        const currentY = p.startY + (p.targetY - p.startY) * eased;
        const alpha = Math.min(1, progress * 1.5);

        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(currentX, currentY, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      if (allSettled && elapsed > duration + 350) {
        // Transition to static text and stop rAF loop completely
        setAnimationCompleted(true);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      if (isVisible) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    renderFn = render;
    animationFrameId = requestAnimationFrame(render);
  };

  startEffect();

  // Page Visibility API to pause when tab is backgrounded
  const handleVisibilityChange = () => {
    if (document.hidden) {
      isVisible = false;
      cancelAnimationFrame(animationFrameId);
    } else {
      isVisible = true;
      // Resume with adjusted start time
      if (!animationCompleted && renderFn) {
        animationFrameId = requestAnimationFrame(renderFn);
      }
    }
  };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [text, highlightColor, textColor, particleSize, duration, shouldReduceMotion, animationCompleted]);

  return (
    <div ref={containerRef} className="relative inline-block w-full">
      {/* Real accessible DOM text element for screen readers & crisp settled display */}
      <span
        ref={textRef}
        className={`${className} transition-opacity duration-500 ${
          animationCompleted ? "opacity-100" : "opacity-0"
        }`}
      >
        {text}
      </span>

      {/* Decorative Canvas Layer (active only during the one-time gathering arrival) */}
      {!animationCompleted && !shouldReduceMotion && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none z-10"
        />
      )}
    </div>
  );
}
