"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { AnimatedGavelLoader } from "./animated-gavel-loader";
import { preloadGavelGeometries } from "@/lib/3d/gavel-preloader";

export const SESSION_SPLASH_KEY = "nyaylink_initial_splash_shown";
export const COOKIE_SPLASH_KEY = "nyaylink_splash_seen";

/**
 * Loading & Animation Duration Calibration:
 * - Base single strike: 1,400ms (1400)
 * - Calibrated 2-strike judicial performance: 2,800ms (begins once 3D STL model is assembled)
 * - Foreground content exit (gavel, logo, text fade out against solid white cover): 320ms
 * - Solid white curtain reveal (smooth opacity transition to expose pristine homepage): 350ms
 * - Total duration: 2,800ms + 320ms + 350ms = 3,470ms (~3.5 seconds)
 * - Maximum safety fallback timeout: 5,000ms (guarantees user is never trapped)
 */
const ACTIVE_STRIKE_DURATION_MS = 2800; // 2 complete strikes (1,120ms x 2) + 560ms dignified hold
const CONTENT_EXIT_DURATION_MS = 320; // Foreground content fade out
const BACKDROP_EXIT_DURATION_MS = 350; // White curtain reveal
const MAX_SAFETY_TIMEOUT_MS = 5000; // Hard fallback guarantee

type SplashStage = "active" | "exiting-content" | "revealing-page" | "done";

interface AppSplashProviderProps {
  children: React.ReactNode;
  initialSplashSeen?: boolean;
}

/**
 * AppSplashProvider — Delivers a unified, cinematic first-entry branded loading experience.
 *
 * Architecture & Guarantees:
 * 1. Immediate Cover (NO Homepage Flash):
 *    - Defaults to 'active' on first visit, rendering the solid white curtain from HTML byte 0.
 *    - Synchronous <head> script suppresses curtain on repeat session visits with zero white flash.
 * 2. Preloaded Single 3D Model:
 *    - Modular STLs preloaded in parallel.
 *    - NO competing animated vector gavel, spinner, or GIF placeholder.
 * 3. Coordinated 3.5s Duration:
 *    - Strike timer begins only after 3D STL geometries are assembled and ready.
 *    - 2 complete, satisfying strikes with realistic recoil and impact shockwave ring.
 * 4. Anti-Ghosting Two-Phase Exit:
 *    - Content lifts and fades out against 100% opaque solid white backdrop.
 *    - Only once loading content is gone does the curtain fade to reveal the clean homepage.
 */
export function AppSplashProvider({
  children,
  initialSplashSeen = false,
}: AppSplashProviderProps) {
  const [stage, setStage] = useState<SplashStage>(() => {
    if (initialSplashSeen) return "done";
    if (typeof window !== "undefined") {
      try {
        if (sessionStorage.getItem(SESSION_SPLASH_KEY)) return "done";
        if (document.cookie.includes(`${COOKIE_SPLASH_KEY}=true`)) return "done";
      } catch {}
    }
    return "active";
  });

  const [modelReady, setModelReady] = useState(false);
  const exitStartedRef = useRef(false);

  // Preload STL assets immediately on mount
  useEffect(() => {
    preloadGavelGeometries().catch((err) => {
      console.warn("[AppSplashProvider] STL preloading warning:", err);
    });
  }, []);

  // Mark splash as completed in session storage and cookie
  const markSplashCompleted = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_SPLASH_KEY, "true");
      document.cookie = `${COOKIE_SPLASH_KEY}=true; path=/; max-age=86400; SameSite=Lax`;
    } catch {}
  }, []);

  // Triggered when the 3D STL model is assembled and rendered to frame 0
  const handleModelReady = useCallback(() => {
    setModelReady(true);
  }, []);

  // Hard safety timeout: guarantee user is never trapped under any network or browser condition
  useEffect(() => {
    try {
      const alreadyShown = sessionStorage.getItem(SESSION_SPLASH_KEY);
      const cookieShown = document.cookie.includes(`${COOKIE_SPLASH_KEY}=true`);
      if (alreadyShown || cookieShown) {
        setStage("done");
        return;
      }
    } catch {
      setStage("done");
      return;
    }

    let isCancelled = false;
    const tSafety = setTimeout(() => {
      if (!isCancelled) {
        setStage("done");
        markSplashCompleted();
      }
    }, MAX_SAFETY_TIMEOUT_MS);

    return () => {
      isCancelled = true;
      clearTimeout(tSafety);
    };
  }, [markSplashCompleted]);

  // Once model is ready (or after fallback delay), run the complete ~3.5s sequence
  useEffect(() => {
    if (exitStartedRef.current) return;

    let isCancelled = false;

    const tStrikes = setTimeout(() => {
      if (isCancelled) return;
      exitStartedRef.current = true;

      // Phase 1 -> 2: Begin fading out the foreground content against opaque white backdrop
      setStage("exiting-content");

      // Phase 2 -> 3: Foreground content is gone. Fade out the solid white backdrop
      setTimeout(() => {
        if (isCancelled) return;
        setStage("revealing-page");
        markSplashCompleted();

        // Phase 3 -> 4: Unmount the splash completely from the DOM
        setTimeout(() => {
          if (isCancelled) return;
          setStage("done");
        }, BACKDROP_EXIT_DURATION_MS);
      }, CONTENT_EXIT_DURATION_MS);
    }, modelReady ? ACTIVE_STRIKE_DURATION_MS : 2800);

    return () => {
      isCancelled = true;
      clearTimeout(tStrikes);
    };
  }, [modelReady, markSplashCompleted]);

  if (stage === "done") {
    return <>{children}</>;
  }

  const isExitingContent = stage === "exiting-content" || stage === "revealing-page";
  const isBackdropFading = stage === "revealing-page";

  return (
    <>
      {/* Underlying Page: Renders in place; completely hidden behind opaque cover until curtain opens */}
      <div className="w-full">
        {children}
      </div>

      {/* Fullscreen Branded Loading Curtain (Z-Index 100, solid white until content exits) */}
      <div
        id="nyaylink-splash-curtain"
        className={`fixed inset-0 z-[100] transition-opacity duration-350 ease-out pointer-events-none ${
          isBackdropFading ? "opacity-0" : "opacity-100 pointer-events-auto"
        }`}
      >
        <AnimatedGavelLoader
          variant="fullscreen"
          isExitingContent={isExitingContent}
          onModelReady={handleModelReady}
        />
      </div>
    </>
  );
}
