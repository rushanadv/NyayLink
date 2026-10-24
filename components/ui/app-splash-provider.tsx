"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AnimatedGavelLoader } from "./animated-gavel-loader";

const SESSION_SPLASH_KEY = "nyaylink_initial_splash_shown";
const SPLASH_DISPLAY_DURATION_MS = 1400; // 1.4s ensures one full satisfying strike & recoil
const MAX_SAFETY_TIMEOUT_MS = 2800; // Hard fallback: never trap the user

interface AppSplashProviderProps {
  children: React.ReactNode;
}

/**
 * AppSplashProvider — Delivers a cinematic first-entry branded loading experience.
 *
 * Rules strictly enforced:
 * - Plays once per browser session upon initial application entry.
 * - Displays for ~1.4s allowing the gavel strike & ripple to be experienced intentionally.
 * - Fades out smoothly with zero white-screen flash or layout shift.
 * - Subsequent navigations within the session render immediately without delaying the user.
 * - Maximum safety timeout guarantees the user is never trapped.
 */
export function AppSplashProvider({ children }: AppSplashProviderProps) {
  const [showSplash, setShowSplash] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    try {
      const alreadyShown = sessionStorage.getItem(SESSION_SPLASH_KEY);
      if (!alreadyShown) {
        setShowSplash(true);

        // Schedule smooth completion after 1 full gavel strike cycle
        const timer = setTimeout(() => {
          setShowSplash(false);
          try {
            sessionStorage.setItem(SESSION_SPLASH_KEY, "true");
          } catch {}
        }, SPLASH_DISPLAY_DURATION_MS);

        // Hard safety timeout
        const safetyTimer = setTimeout(() => {
          setShowSplash(false);
        }, MAX_SAFETY_TIMEOUT_MS);

        return () => {
          clearTimeout(timer);
          clearTimeout(safetyTimer);
        };
      }
    } catch {
      // In restricted iframes or privacy mode where sessionStorage is blocked
      setShowSplash(false);
    }
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && (
          <motion.div
            key="nyaylink-splash-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.42, ease: [0.4, 0, 0.2, 1] } }}
            className="fixed inset-0 z-[100] pointer-events-auto"
          >
            <AnimatedGavelLoader variant="fullscreen" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main App Content Container with subtle entry revelation */}
      <motion.div
        initial={isMounted && showSplash ? { opacity: 0.92, y: 3 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full"
      >
        {children}
      </motion.div>
    </>
  );
}
