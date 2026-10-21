"use client";

import React, { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

interface ParticleImageProps {
  className?: string;
  size?: number;
  highlightColor?: string;
  accentColor?: string;
}

interface ImageParticle {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  delay: number;
  color: string;
  size: number;
}

export function ParticleImage({
  className = "",
  size = 240,
  highlightColor = "#205C43",
  accentColor = "#174530",
}: ParticleImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const isInView = useInView(containerRef, { once: true, margin: "-40px" });
  const [animationCompleted, setAnimationCompleted] = useState(false);

  useEffect(() => {
    if (shouldReduceMotion) {
      setAnimationCompleted(true);
      return;
    }

    if (!isInView) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;
    let startTime: number | null = null;
    const duration = 1500;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    // 1. Draw original Scales of Justice vector onto an offscreen canvas
    const offscreen = document.createElement("canvas");
    offscreen.width = size;
    offscreen.height = size;
    const offCtx = offscreen.getContext("2d", { willReadFrequently: true });
    if (!offCtx) return;

    // Center coordinates
    const cx = size / 2;
    const cy = size / 2;
    const s = size / 240; // scale factor

    offCtx.strokeStyle = "#ffffff";
    offCtx.fillStyle = "#ffffff";
    offCtx.lineWidth = 3.5 * s;
    offCtx.lineCap = "round";
    offCtx.lineJoin = "round";

    // Central Pillar & Finial
    offCtx.beginPath();
    offCtx.arc(cx, cy - 65 * s, 6 * s, 0, Math.PI * 2); // Top apex ball
    offCtx.fill();

    offCtx.beginPath();
    offCtx.moveTo(cx, cy - 60 * s);
    offCtx.lineTo(cx, cy + 65 * s); // Central vertical beam
    offCtx.stroke();

    // Base pedestal
    offCtx.beginPath();
    offCtx.moveTo(cx - 38 * s, cy + 65 * s);
    offCtx.lineTo(cx + 38 * s, cy + 65 * s);
    offCtx.stroke();

    offCtx.beginPath();
    offCtx.moveTo(cx - 24 * s, cy + 72 * s);
    offCtx.lineTo(cx + 24 * s, cy + 72 * s);
    offCtx.stroke();

    // Main Horizontal Crossbeam
    offCtx.beginPath();
    offCtx.moveTo(cx - 72 * s, cy - 35 * s);
    offCtx.lineTo(cx + 72 * s, cy - 35 * s);
    offCtx.stroke();

    // Center pivot bracket
    offCtx.beginPath();
    offCtx.arc(cx, cy - 35 * s, 5 * s, 0, Math.PI * 2);
    offCtx.fill();

    // Left Scale Pan & Strings
    const leftX = cx - 55 * s;
    const leftY = cy - 35 * s;
    offCtx.beginPath();
    offCtx.moveTo(leftX, leftY);
    offCtx.lineTo(leftX - 22 * s, leftY + 45 * s);
    offCtx.moveTo(leftX, leftY);
    offCtx.lineTo(leftX + 22 * s, leftY + 45 * s);
    offCtx.stroke();

    // Left Pan curve
    offCtx.beginPath();
    offCtx.arc(leftX, leftY + 45 * s, 24 * s, 0.1 * Math.PI, 0.9 * Math.PI, false);
    offCtx.stroke();

    // Right Scale Pan & Strings
    const rightX = cx + 55 * s;
    const rightY = cy - 35 * s;
    offCtx.beginPath();
    offCtx.moveTo(rightX, rightY);
    offCtx.lineTo(rightX - 22 * s, rightY + 45 * s);
    offCtx.moveTo(rightX, rightY);
    offCtx.lineTo(rightX + 22 * s, rightY + 45 * s);
    offCtx.stroke();

    // Right Pan curve
    offCtx.beginPath();
    offCtx.arc(rightX, rightY + 45 * s, 24 * s, 0.1 * Math.PI, 0.9 * Math.PI, false);
    offCtx.stroke();

    // 2. Sample pixel data
    const imgData = offCtx.getImageData(0, 0, size, size);
    const data = imgData.data;

    const rawPoints: { x: number; y: number }[] = [];
    const step = Math.max(2, Math.round(s * 2.2));

    for (let y = 0; y < size; y += step) {
      for (let x = 0; x < size; x += step) {
        const idx = (y * size + x) * 4;
        if (data[idx + 3] > 110) {
          rawPoints.push({ x, y });
        }
      }
    }

    // Limit particles to ~1600 for optimal performance
    const targetCount = 1600;
    const points =
      rawPoints.length > targetCount
        ? rawPoints.filter((_, i) => i % Math.ceil(rawPoints.length / targetCount) === 0)
        : rawPoints;

    // 3. Initialize particles with radial vortex scatter
    const particles: ImageParticle[] = points.map((p) => {
      // Swirl angle and distance from center
      const angle = Math.atan2(p.y - cy, p.x - cx) + (Math.random() - 0.5) * 1.8 + Math.PI * 0.75;
      const dist = Math.sqrt(Math.pow(p.x - cx, 2) + Math.pow(p.y - cy, 2)) + 60 + Math.random() * 80;

      const startX = cx + Math.cos(angle) * dist;
      const startY = cy + Math.sin(angle) * dist;

      const isHighlight = Math.random() < 0.6;
      const color = isHighlight ? highlightColor : accentColor;

      return {
        startX,
        startY,
        targetX: p.x,
        targetY: p.y,
        delay: Math.random() * 260,
        color,
        size: 1.25 * (0.8 + Math.random() * 0.4) * s,
      };
    });

    // Custom cubic ease-out curve
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

    // 4. Render loop
    const render = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      let allSettled = true;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const pElapsed = Math.max(0, elapsed - p.delay);
        const progress = Math.min(1, pElapsed / duration);

        if (progress < 1) {
          allSettled = false;
        }

        const eased = easeOutQuart(progress);

        // Add subtle swirl curl during early transit that diminishes to zero
        const curl = (1 - eased) * Math.sin(progress * Math.PI) * 15 * s;
        const currentX = p.startX + (p.targetX - p.startX) * eased + curl;
        const currentY = p.startY + (p.targetY - p.startY) * eased - curl;

        const alpha = Math.min(1, progress * 1.6);

        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(currentX, currentY, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      if (allSettled && elapsed > duration + 300) {
        setAnimationCompleted(true);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      if (isVisible) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isVisible = false;
        cancelAnimationFrame(animationFrameId);
      } else {
        isVisible = true;
        animationFrameId = requestAnimationFrame(render);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isInView, size, highlightColor, accentColor, shouldReduceMotion]);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      aria-label="Symbolic Scales of Justice Resolving into Clarity"
    >
      {/* Settled Static SVG (visible on reduced motion or once particles reform) */}
      <svg
        viewBox="0 0 240 240"
        fill="none"
        stroke="currentColor"
        className={`w-full h-full text-[#205C43] transition-opacity duration-700 ${
          animationCompleted || shouldReduceMotion ? "opacity-100" : "opacity-0"
        }`}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* Apex Finial */}
        <circle cx="120" cy="55" r="5" fill="#205C43" stroke="#205C43" />

        {/* Central Vertical Pillar */}
        <line x1="120" y1="60" x2="120" y2="185" stroke="#205C43" />

        {/* Pedestal Base */}
        <line x1="82" y1="185" x2="158" y2="185" stroke="#205C43" />
        <line x1="96" y1="192" x2="144" y2="192" stroke="#174530" />

        {/* Horizontal Balance Beam */}
        <line x1="48" y1="85" x2="192" y2="85" stroke="#174530" />
        <circle cx="120" cy="85" r="4.5" fill="#174530" />

        {/* Left Scale Strings & Pan */}
        <line x1="65" y1="85" x2="43" y2="130" stroke="#205C43" strokeWidth="2.5" />
        <line x1="65" y1="85" x2="87" y2="130" stroke="#205C43" strokeWidth="2.5" />
        <path
          d="M 41 130 A 24 24 0 0 0 89 130"
          stroke="#174530"
          strokeWidth="3.5"
          fill="rgba(32, 92, 67, 0.08)"
        />

        {/* Right Scale Strings & Pan */}
        <line x1="175" y1="85" x2="153" y2="130" stroke="#205C43" strokeWidth="2.5" />
        <line x1="175" y1="85" x2="197" y2="130" stroke="#205C43" strokeWidth="2.5" />
        <path
          d="M 151 130 A 24 24 0 0 0 199 130"
          stroke="#174530"
          strokeWidth="3.5"
          fill="rgba(32, 92, 67, 0.08)"
        />
      </svg>

      {/* Particle Swirl-Apart and Reform Canvas Layer */}
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
