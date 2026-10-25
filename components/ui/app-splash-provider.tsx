"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { AnimatedGavelLoader } from "./animated-gavel-loader";
import { preloadGavelGeometries } from "@/lib/3d/gavel-preloader";

export const SESSION_SPLASH_KEY = "nyaylink_initial_splash_shown";
export const COOKIE_SPLASH_KEY = "nyaylink_splash_seen";

/**
 * Loading & Animation Duration Calibration:
 * - 3D STL Model Visible Animation: 3,500ms (begins ONLY after 3D STL geometries are parsed, assembled, and frame 0 rendered)
 * - 3 complete judicial strike cycles (1,120ms x 3 = 3,360ms) + 140ms resting hold at angle 0
 * - Anti-ghosting Foreground exit: 300ms (gavel, logo, text fade and lift against solid white cover)
 * - Solid white curtain reveal: 350ms (smooth opacity transition exposing clean homepage)
 * - Total duration after readiness: 3,500ms + 300ms + 350ms = 4,150ms
 * - Hard safety fallback: 6,000ms while loading assets (cancelled immediately upon model readiness)
 */
const VISIBLE_ANIMATION_DURATION_MS = 3500;
const CONTENT_EXIT_DURATION_MS = 300;
const BACKDROP_REVEAL_DURATION_MS = 350;
const ASSET_LOAD_FALLBACK_TIMEOUT_MS = 6000;

export type SplashLifecycleStage =
  | "loading_assets"
  | "preparing_scene"
  | "model_ready"
  | "animating"
  | "exiting_content"
  | "revealing_page"
  | "complete";

export interface SplashContextValue {
  stage: SplashLifecycleStage;
  isSplashActive: boolean;
  isSplashComplete: boolean;
}

export const SplashContext = createContext<SplashContextValue>({
  stage: "complete",
  isSplashActive: false,
  isSplashComplete: true,
});

export function useSplash() {
  return useContext(SplashContext);
}

interface AppSplashProviderProps {
  children: React.ReactNode;
  initialSplashSeen?: boolean;
}

/**
 * AppSplashProvider — Delivers a unified, cinematic first-entry branded loading experience.
 *
 * Architecture & Guarantees:
 * 1. Immediate Cover (NO Homepage Flash):
 *    - Defaults to solid white curtain from HTML byte 0 on first visit.
 *    - Synchronous <head> script suppresses curtain on repeat session visits with zero flash.
 * 2. Explicit Readiness State Machine:
 *    - LOADING_ASSETS -> PREPARING_SCENE -> MODEL_READY -> ANIMATING -> EXITING_CONTENT -> REVEALING_PAGE -> COMPLETE
 *    - Duration clock starts ONLY when 3D STL model is assembled, positioned, and rendered frame 0.
 * 3. Pure 3.5s Visible Gavel Performance:
 *    - Gavel receives its full 3.5 seconds of visible screen time regardless of network load time.
 *    - Performs 3 complete strikes with recoil and shockwave rings, settling cleanly at angle 0.
 * 4. Anti-Ghosting Two-Phase Exit:
 *    - Loading content lifts and fades out against 100% opaque solid white backdrop.
 *    - Only once content is gone does the curtain fade to reveal the clean homepage.
 * 5. Pre-scroll Prevention:
 *    - Page scroll is locked at top until curtain begins revealing.
 */
export function AppSplashProvider({
  children,
  initialSplashSeen = false,
}: AppSplashProviderProps) {
  const [stage, setStage] = useState<SplashLifecycleStage>(() => {
    if (initialSplashSeen) return "complete";
    if (typeof window !== "undefined") {
      try {
        if (sessionStorage.getItem(SESSION_SPLASH_KEY)) return "complete";
        if (document.cookie.includes(`${COOKIE_SPLASH_KEY}=true`)) return "complete";
      } catch {}
    }
    return "loading_assets";
  });

  const timersRef = useRef<number[]>([]);
  const exitStartedRef = useRef(false);

  // Clear all pending timers on unmount or transition
  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }, []);

  // Preload STL assets immediately on mount
  useEffect(() => {
    if (stage === "complete") return;

    preloadGavelGeometries().catch((err) => {
      console.warn("[AppSplashProvider] STL preloading warning:", err);
    });
  }, [stage]);

  // Mark splash as completed in session storage and cookie
  const markSplashCompleted = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_SPLASH_KEY, "true");
      document.cookie = `${COOKIE_SPLASH_KEY}=true; path=/; max-age=86400; SameSite=Lax`;
    } catch {}
  }, []);

  // Lock scroll to top while splash is active
  useEffect(() => {
    if (stage === "complete") return;

    const handleScrollLock = () => {
      if (window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener("scroll", handleScrollLock, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScrollLock);
    };
  }, [stage]);

  // Safety fallback timeout: active ONLY during asset load / scene preparation.
  // If network hangs, allows user into the site gracefully without getting trapped.
  useEffect(() => {
    if (stage !== "loading_assets" && stage !== "preparing_scene") return;

    const tFallback = window.setTimeout(() => {
      console.warn("[AppSplashProvider] Asset loading fallback engaged after timeout");
      setStage("exiting_content");
      const tReveal = window.setTimeout(() => {
        setStage("revealing_page");
        markSplashCompleted();
        const tDone = window.setTimeout(() => {
          setStage("complete");
        }, BACKDROP_REVEAL_DURATION_MS);
        timersRef.current.push(tDone);
      }, CONTENT_EXIT_DURATION_MS);
      timersRef.current.push(tReveal);
    }, ASSET_LOAD_FALLBACK_TIMEOUT_MS);

    timersRef.current.push(tFallback);

    return () => {
      clearTimeout(tFallback);
    };
  }, [stage, markSplashCompleted]);

  // Mount timestamp for diagnostics
  const mountTimestampRef = useRef<number>(Date.now());
  const modelReadyTimestampRef = useRef<number>(0);

  // Triggered when the 3D STL model is assembled, positioned, and rendered frame 0
  const handleModelReady = useCallback(() => {
    if (exitStartedRef.current) return;
    if (stage === "complete" || stage === "exiting_content" || stage === "revealing_page") return;

    const readyNow = performance.now();
    modelReadyTimestampRef.current = readyNow;

    if (typeof window !== "undefined") {
      (window as unknown as { __NYAYLINK_SPLASH_METRICS__: Record<string, number> }).__NYAYLINK_SPLASH_METRICS__ = {
        mountTime: mountTimestampRef.current,
        modelReadyTime: readyNow,
        assetPreparationMs: Date.now() - mountTimestampRef.current,
        gavelVisibleDurationMs: 0,
        completed: 0,
      };
    }

    // Transition to MODEL_READY & ANIMATING
    setStage("animating");

    // Clear the load fallback timer now that the actual 3D model is active
    clearAllTimers();

    // The display duration clock starts NOW: exactly 3.5 seconds of visible gavel animation
    const tStrikes = window.setTimeout(() => {
      exitStartedRef.current = true;
      const visibleDuration = performance.now() - readyNow;

      if (typeof window !== "undefined" && (window as unknown as { __NYAYLINK_SPLASH_METRICS__?: Record<string, number> }).__NYAYLINK_SPLASH_METRICS__) {
        (window as unknown as { __NYAYLINK_SPLASH_METRICS__: Record<string, number> }).__NYAYLINK_SPLASH_METRICS__.gavelVisibleDurationMs = Math.round(visibleDuration);
        (window as unknown as { __NYAYLINK_SPLASH_METRICS__: Record<string, number> }).__NYAYLINK_SPLASH_METRICS__.exitContentTime = performance.now();
      }

      // Phase 1 -> 2: Begin fading out the foreground content against opaque white backdrop
      setStage("exiting_content");

      // Phase 2 -> 3: Foreground content is gone. Fade out the solid white backdrop
      const tReveal = window.setTimeout(() => {
        setStage("revealing_page");
        markSplashCompleted();

        if (typeof window !== "undefined" && (window as unknown as { __NYAYLINK_SPLASH_METRICS__?: Record<string, number> }).__NYAYLINK_SPLASH_METRICS__) {
          (window as unknown as { __NYAYLINK_SPLASH_METRICS__: Record<string, number> }).__NYAYLINK_SPLASH_METRICS__.revealPageTime = performance.now();
        }

        // Phase 3 -> 4: Unmount the splash completely from the DOM
        const tDone = window.setTimeout(() => {
          setStage("complete");
          if (typeof window !== "undefined" && (window as unknown as { __NYAYLINK_SPLASH_METRICS__?: Record<string, number> }).__NYAYLINK_SPLASH_METRICS__) {
            (window as unknown as { __NYAYLINK_SPLASH_METRICS__: Record<string, number> }).__NYAYLINK_SPLASH_METRICS__.completeTime = performance.now();
            (window as unknown as { __NYAYLINK_SPLASH_METRICS__: Record<string, number> }).__NYAYLINK_SPLASH_METRICS__.completed = 1;
          }
        }, BACKDROP_REVEAL_DURATION_MS);

        timersRef.current.push(tDone);
      }, CONTENT_EXIT_DURATION_MS);

      timersRef.current.push(tReveal);
    }, VISIBLE_ANIMATION_DURATION_MS);

    timersRef.current.push(tStrikes);
  }, [stage, clearAllTimers, markSplashCompleted]);


  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  const isSplashComplete = stage === "complete";
  const isSplashActive = !isSplashComplete;
  const isExitingContent = stage === "exiting_content" || stage === "revealing_page";
  const isBackdropFading = stage === "revealing_page";

  const contextValue: SplashContextValue = {
    stage,
    isSplashActive,
    isSplashComplete,
  };

  return (
    <SplashContext.Provider value={contextValue}>
      {/* Underlying Page: Renders in place; hidden behind opaque cover until curtain opens */}
      <div className="w-full">
        {children}
      </div>

      {/* Fullscreen Branded Loading Curtain (Z-Index 100, solid white until content exits) */}
      {!isSplashComplete && (
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
      )}
    </SplashContext.Provider>
  );
}
