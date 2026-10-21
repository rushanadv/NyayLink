"use client";

import React, { useRef, useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

export function CinematicVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || shouldReduceMotion) return;

    // Trigger video playback
    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // Autoplay may be restricted by low-power mode or user settings
        console.warn("Autoplay muted video notice:", err);
      });
    }
  }, [shouldReduceMotion]);

  const videoSrc = "/screenshots/Gold_ink_swirling_in_water_20261022005117.mp4";
  const posterSrc = "/screenshots/gold-ink-poster.png";

  return (
    <>
      {/* Mobile Subtle Ambient Gold-Green Glow (Lightweight, Non-Intrusive, Battery-Friendly) */}
      <div
        className="block md:hidden fixed top-0 right-0 w-[65vw] h-[35vh] pointer-events-none z-0 opacity-20 select-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at top right, rgba(32, 92, 67, 0.45) 0%, rgba(220, 180, 95, 0.3) 40%, transparent 75%)",
        }}
      />

      {/* Desktop & Tablet Persistent Fixed Cinematic Video Layer */}
      <div
        className="hidden md:block fixed top-0 right-0 w-[55vw] lg:w-[58vw] xl:w-[52vw] h-screen pointer-events-none z-0 overflow-hidden select-none"
        aria-hidden="true"
        style={{
        // Linear fade mask across the horizontal axis: blends seamlessly into the dominant white canvas on the left
        maskImage:
          "linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.08) 12%, rgba(0, 0, 0, 0.6) 35%, rgba(0, 0, 0, 0.95) 60%, #000 85%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.08) 12%, rgba(0, 0, 0, 0.6) 35%, rgba(0, 0, 0, 0.95) 60%, #000 85%)",
      }}
    >
      {/* Secondary elliptical vignette mask to soften top, bottom, and right boundaries */}
      <div
        className="relative w-full h-full"
        style={{
          maskImage:
            "radial-gradient(ellipse 95% 85% at 75% 45%, #000 35%, rgba(0, 0, 0, 0.85) 65%, rgba(0, 0, 0, 0.3) 85%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 95% 85% at 75% 45%, #000 35%, rgba(0, 0, 0, 0.85) 65%, rgba(0, 0, 0, 0.3) 85%, transparent 100%)",
        }}
      >
        {/* Deep Forest-Green Backing (#174530) Surface */}
        <div
          className="absolute inset-0 bg-[#174530]"
          style={{
            background:
              "radial-gradient(ellipse 100% 100% at 75% 45%, #174530 0%, #123827 55%, #0c261a 100%)",
            opacity: 0.92,
          }}
        />

        {/* Video Element Layer with screen blend mode and poster fallback */}
        {!shouldReduceMotion && !videoError ? (
          <video
            ref={videoRef}
            src={videoSrc}
            poster={posterSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onError={() => setVideoError(true)}
            className="absolute inset-0 w-full h-full object-cover mix-blend-screen scale-[1.08] origin-center opacity-95 transition-opacity duration-700"
            style={{
              // Increase contrast to ensure deep blacks zero out to pure transparency in screen blend mode
              filter: "contrast(1.18) brightness(1.08)",
            }}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : null}

        {/* Static Accessible Fallback (when reduced-motion is requested or video is unavailable) */}
        {(shouldReduceMotion || videoError) && (
          <div
            className="absolute inset-0 opacity-80 mix-blend-screen"
            style={{
              backgroundImage: `url(${posterSrc})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "contrast(1.18) brightness(1.08)",
            }}
          />
        )}

        {/* Subtle Ambient Gold-Green Tint Overlay for art-directed warmth */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 75% 45%, #205C43 0%, transparent 70%)",
          }}
        />
      </div>
    </div>
    </>
  );
}
