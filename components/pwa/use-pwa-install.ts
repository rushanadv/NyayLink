"use client";

import { useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isIOSModalOpen, setIsIOSModalOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Check if already running in standalone mode (installed PWA / home-screen bookmark)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes("android-app://");

    setIsInstalled(isStandalone);

    // 2. Detect iOS device
    const ua = window.navigator.userAgent;
    const iosDevice =
      /iPad|iPhone|iPod/.test(ua) &&
      !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(iosDevice && !isStandalone);

    // 3. Check dismissal flag from localStorage
    try {
      const dismissed = localStorage.getItem("nyaylink_pwa_dismissed") === "true";
      setIsDismissed(dismissed);
    } catch {
      // Ignore localStorage exceptions in restricted environments
    }

    // 4. Capture native Chromium beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // 5. Capture native appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      try {
        localStorage.removeItem("nyaylink_pwa_dismissed");
      } catch {
        // Ignore
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Trigger installation flow
  const promptInstall = useCallback(async (): Promise<"accepted" | "dismissed" | "ios" | "unsupported"> => {
    if (isInstalled) {
      return "accepted";
    }

    // Native Chromium deferred prompt available
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setIsInstalled(true);
          setIsInstallable(false);
          setDeferredPrompt(null);
          return "accepted";
        } else {
          try {
            localStorage.setItem("nyaylink_pwa_dismissed", "true");
            setIsDismissed(true);
          } catch {
            // Ignore
          }
          return "dismissed";
        }
      } catch (err) {
        console.warn("[NyayLink PWA] Install prompt exception:", err);
        return "unsupported";
      }
    }

    // iOS Safari fallback: open instructional guide
    const ua = typeof window !== "undefined" ? window.navigator.userAgent : "";
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(ua) &&
      !(window as unknown as { MSStream?: unknown }).MSStream;

    if (isIOS || isIOSDevice) {
      setIsIOSModalOpen(true);
      return "ios";
    }

    return "unsupported";
  }, [deferredPrompt, isIOS, isInstalled]);

  const dismissPrompt = useCallback(() => {
    try {
      localStorage.setItem("nyaylink_pwa_dismissed", "true");
      setIsDismissed(true);
    } catch {
      // Ignore
    }
  }, []);

  return {
    isInstallable: isInstallable || (isIOS && !isInstalled),
    isInstalled,
    isIOS,
    isIOSModalOpen,
    isDismissed,
    promptInstall,
    dismissPrompt,
    openIOSModal: () => setIsIOSModalOpen(true),
    closeIOSModal: () => setIsIOSModalOpen(false),
  };
}
