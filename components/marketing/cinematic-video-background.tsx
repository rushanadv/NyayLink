"use client";

import React, { useRef, useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

export type VideoBackgroundVariant = "homepage" | "lawyers" | "intake" | "portal";

export interface CinematicVideoBackgroundProps {
  variant?: VideoBackgroundVariant;
  className?: string;
}

export function CinematicVideoBackground({
  variant = "homepage",
  className = "",
}: CinematicVideoBackgroundProps) {
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

  // Variant-specific layout and mask properties
  const config = {
    homepage: {
      containerClass: "hidden lg:block fixed top-0 right-0 w-[50vw] xl:w-[48vw] h-screen",
      outerMask:
        "linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.04) 15%, rgba(0, 0, 0, 0.45) 45%, rgba(0, 0, 0, 0.95) 75%, #000 90%)",
      innerMask:
        "radial-gradient(ellipse 95% 85% at 75% 45%, #000 35%, rgba(0, 0, 0, 0.85) 65%, rgba(0, 0, 0, 0.3) 85%, transparent 100%)",
      backingOpacity: 0.92,
      videoOpacity: 0.95,
      mobileGlowClass: "block lg:hidden fixed top-0 right-0 w-[65vw] h-[35vh] opacity-25",
    },
    lawyers: {
      containerClass: "hidden md:block fixed top-0 right-0 w-[42vw] xl:w-[38vw] h-[75vh]",
      outerMask:
        "linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.1) 25%, rgba(0, 0, 0, 0.8) 70%, #000 100%)",
      innerMask:
        "radial-gradient(ellipse 85% 75% at 85% 25%, #000 20%, rgba(0, 0, 0, 0.7) 45%, rgba(0, 0, 0, 0.2) 70%, transparent 95%)",
      backingOpacity: 0.68,
      videoOpacity: 0.72,
      mobileGlowClass: "block md:hidden fixed top-0 right-0 w-[50vw] h-[25vh] opacity-15",
    },
    intake: {
      containerClass: "hidden md:block fixed top-0 right-0 w-[48vw] xl:w-[44vw] h-screen",
      outerMask:
        "linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.08) 20%, rgba(0, 0, 0, 0.65) 60%, #000 90%)",
      innerMask:
        "radial-gradient(ellipse 90% 80% at 80% 35%, #000 25%, rgba(0, 0, 0, 0.75) 50%, rgba(0, 0, 0, 0.25) 75%, transparent 100%)",
      backingOpacity: 0.76,
      videoOpacity: 0.82,
      mobileGlowClass: "block md:hidden fixed top-0 right-0 w-[55vw] h-[30vh] opacity-20",
    },
    portal: {
      containerClass: "hidden md:block fixed top-0 right-0 w-[36vw] xl:w-[32vw] h-[65vh]",
      outerMask:
        "linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.15) 30%, rgba(0, 0, 0, 0.75) 75%, #000 100%)",
      innerMask:
        "radial-gradient(ellipse 80% 70% at 90% 15%, #000 15%, rgba(0, 0, 0, 0.5) 40%, transparent 75%)",
      backingOpacity: 0.48,
      videoOpacity: 0.52,
      mobileGlowClass: "block md:hidden fixed top-0 right-0 w-[40vw] h-[20vh] opacity-10",
    },
  }[variant];

  return (
    <div className={`pointer-events-none select-none z-0 ${className}`} aria-hidden="true">
      {/* Mobile & Tablet Subtle Ambient Gold-Green Glow (Preserves pristine text contrast) */}
      <div
        className={`${config.mobileGlowClass} pointer-events-none z-0 select-none`}
        style={{
          background:
            "radial-gradient(ellipse at top right, rgba(32, 92, 67, 0.4) 0%, rgba(220, 180, 95, 0.25) 40%, transparent 75%)",
        }}
      />

      {/* Desktop Persistent Fixed Cinematic Video Layer */}
      <div
        className={`${config.containerClass} pointer-events-none z-0 overflow-hidden select-none`}
        style={{
          maskImage: config.outerMask,
          WebkitMaskImage: config.outerMask,
        }}
      >
        {/* Secondary elliptical vignette mask to soften boundaries */}
        <div
          className="relative w-full h-full"
          style={{
            maskImage: config.innerMask,
            WebkitMaskImage: config.innerMask,
          }}
        >
          {/* Deep Forest-Green Backing (#174530) Surface */}
          <div
            className="absolute inset-0 bg-[#174530]"
            style={{
              background:
                "radial-gradient(ellipse 100% 100% at 75% 45%, #174530 0%, #123827 55%, #0c261a 100%)",
              opacity: config.backingOpacity,
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
              className="absolute inset-0 w-full h-full object-cover mix-blend-screen scale-[1.08] origin-center transition-opacity duration-700"
              style={{
                opacity: config.videoOpacity,
                filter: "contrast(1.18) brightness(1.08)",
              }}
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          ) : null}

          {/* Static Accessible Fallback (when reduced-motion is requested or video is unavailable) */}
          {(shouldReduceMotion || videoError) && (
            <div
              className="absolute inset-0 mix-blend-screen"
              style={{
                backgroundImage: `url(${posterSrc})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: config.videoOpacity * 0.85,
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
    </div>
  );
}
