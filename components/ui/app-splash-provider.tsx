"use client";

import React, { useState, useEffect } from "react";
import { AnimatedGavelLoader } from "./animated-gavel-loader";

const SESSION_SPLASH_KEY = "nyaylink_initial_splash_shown";
const STRIKE_HOLD_MS = 1400; // Time to complete 1 full, satisfying judicial strike & settle
const CONTENT_EXIT_DURATION_MS = 320; // Time for foreground gavel & text to fade out
const BACKDROP_EXIT_DURATION_MS = 350; // Time for solid white curtain to fade and reveal page
const MAX_SAFETY_TIMEOUT_MS = 3000; // Hard fallback guarantee

type SplashStage = "active" | "exiting-content" | "revealing-page" | "done";

interface AppSplashProviderProps {
  children: React.ReactNode;
}

/**
 * AppSplashProvider — Delivers a cinematic first-entry branded loading experience.
 *
 * Anti-Ghosting Two-Phase Exit Architecture:
 * Phase 1 (active, 1.4s):
 *   Opaque white curtain + 3D gavel striking on sounding pedestal.
 * Phase 2 (exiting-content, 320ms):
 *   Foreground content (gavel, logo, copy) lifts and fades out against the
 *   100% OPAQUE WHITE BACKDROP. The page underneath is completely concealed.
 * Phase 3 (revealing-page, 350ms):
 *   Now that all foreground loading elements are completely gone, the blank
 *   white curtain fades out smoothly to reveal the pristine homepage with
 *   ZERO double exposure or ghosting.
 * Phase 4 (done):
 *   Loader unmounts from DOM completely; subsequent navigations render instantly.
 */
export function AppSplashProvider({ children }: AppSplashProviderProps) {
  const [stage, setStage] = useState<SplashStage>("done");

  useEffect(() => {
    try {
      const alreadyShown = sessionStorage.getItem(SESSION_SPLASH_KEY);
      if (alreadyShown) {
        setStage("done");
        return;
      }
    } catch {
      setStage("done");
      return;
    }

    // First visit in session: begin active splash
    setStage("active");

    // Phase 1 -> 2: Begin fading out the foreground content against opaque white backdrop
    const tContentExit = setTimeout(() => {
      setStage("exiting-content");
    }, STRIKE_HOLD_MS);

    // Phase 2 -> 3: Foreground content is now 100% gone. Fade out the solid white backdrop
    const tRevealingPage = setTimeout(() => {
      setStage("revealing-page");
      try {
        sessionStorage.setItem(SESSION_SPLASH_KEY, "true");
      } catch {}
    }, STRIKE_HOLD_MS + CONTENT_EXIT_DURATION_MS);

    // Phase 3 -> 4: Unmount the splash completely from the DOM
    const tDone = setTimeout(() => {
      setStage("done");
    }, STRIKE_HOLD_MS + CONTENT_EXIT_DURATION_MS + BACKDROP_EXIT_DURATION_MS);

    // Hard safety timeout: guarantee the user is never trapped
    const tSafety = setTimeout(() => {
      setStage("done");
      try {
        sessionStorage.setItem(SESSION_SPLASH_KEY, "true");
      } catch {}
    }, MAX_SAFETY_TIMEOUT_MS);

    return () => {
      clearTimeout(tContentExit);
      clearTimeout(tRevealingPage);
      clearTimeout(tDone);
      clearTimeout(tSafety);
    };
  }, []);

  if (stage === "done") {
    return <>{children}</>;
  }

  const isExitingContent = stage === "exiting-content" || stage === "revealing-page";
  const isBackdropFading = stage === "revealing-page";

  return (
    <>
      {/* Underlying Page: Renders in place; completely hidden until curtain opens */}
      <div className="w-full">
        {children}
      </div>

      {/* Fullscreen Branded Loading Curtain (Z-Index 100, solid white until content exits) */}
      <div
        className={`fixed inset-0 z-[100] transition-opacity duration-350 ease-out pointer-events-none ${
          isBackdropFading ? "opacity-0" : "opacity-100 pointer-events-auto"
        }`}
      >
        <AnimatedGavelLoader
          variant="fullscreen"
          isExitingContent={isExitingContent}
        />
      </div>
    </>
  );
}
