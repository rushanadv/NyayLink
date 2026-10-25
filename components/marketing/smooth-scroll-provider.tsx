"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Lenis from "lenis";
import { useMotionValue, type MotionValue } from "framer-motion";

interface SmoothScrollContextType {
  lenis: Lenis | null;
  scrollTo: (
    target: string | HTMLElement,
    options?: { offset?: number; duration?: number }
  ) => void;
  scrollProgress: MotionValue<number>;
  stop: () => void;
  start: () => void;
}

const defaultMotionValue = {
  get: () => 0,
  set: () => {},
  onChange: () => () => {},
  on: () => () => {},
} as unknown as MotionValue<number>;

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
  scrollTo: () => {},
  scrollProgress: defaultMotionValue,
  stop: () => {},
  start: () => {},
});

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const scrollProgress = useMotionValue<number>(0);

  useEffect(() => {
    // 1. Initial measurement
    const measureScroll = () => {
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const p =
        scrollHeight > 0
          ? Math.min(1, Math.max(0, window.scrollY / scrollHeight))
          : 0;
      scrollProgress.set(p);
    };

    measureScroll();

    // 2. Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      window.addEventListener("scroll", measureScroll, { passive: true });
      window.addEventListener("resize", measureScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", measureScroll);
        window.removeEventListener("resize", measureScroll);
      };
    }

    // 3. Initialize responsive, lightweight Lenis smooth scroll
    // Using lerp: 0.1 rather than duration: 0.9 provides immediate, frame-rate
    // independent damping that seamlessly tracks Mac trackpad momentum and mouse wheel
    // without sluggish lag, artificial overshooting, or fighting native gestures.
    const lenis = new Lenis({
      lerp: 0.1,
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0,
      syncTouch: false, // Preserves 1:1 native touch physics on mobile
      autoResize: true,
      stopInertiaOnNavigate: true, // Prevents rogue inertia on route transitions
      // Protect any element or ancestor with [data-lenis-prevent] or nested scrollable containers
      prevent: (node: HTMLElement) => {
        if (!node) return false;
        if (
          node.hasAttribute("data-lenis-prevent") ||
          Boolean(node.closest("[data-lenis-prevent]"))
        ) {
          return true;
        }
        // Protect native inputs, textareas, selects, and nested scrollable containers
        let current: HTMLElement | null = node;
        while (current && current !== document.body && current !== document.documentElement) {
          const tag = current.tagName.toLowerCase();
          if (tag === "textarea" || tag === "select" || current.isContentEditable) {
            return true;
          }
          if (current.hasAttribute("data-lenis-prevent")) {
            return true;
          }
          const style = window.getComputedStyle(current);
          const overflowY = style.overflowY;
          if (
            (overflowY === "auto" || overflowY === "scroll") &&
            current.scrollHeight > current.clientHeight
          ) {
            return true;
          }
          current = current.parentElement;
        }
        return false;
      },
    });

    lenisRef.current = lenis;
    setLenisInstance(lenis);

    // Synchronize Lenis progress directly into the shared MotionValue (single source of truth)
    lenis.on("scroll", (e: { progress: number }) => {
      if (typeof e.progress === "number") {
        scrollProgress.set(Math.min(1, Math.max(0, e.progress)));
      }
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Keep dimensions updated on content or window changes
    const handleResize = () => {
      lenis.resize();
      measureScroll();
    };
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
      setLenisInstance(null);
    };
  }, [scrollProgress]);

  const scrollTo = (
    target: string | HTMLElement,
    options?: { offset?: number; duration?: number; immediate?: boolean }
  ) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, {
        offset: options?.offset ?? -70,
        immediate: options?.immediate ?? false,
        duration: options?.immediate ? 0 : (options?.duration ?? 0.95),
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else {
      if (typeof target === "string") {
        const el = document.querySelector(target);
        el?.scrollIntoView({ behavior: options?.immediate ? "auto" : "smooth" });
      } else if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: options?.immediate ? "auto" : "smooth" });
      }
    }
  };

  const stop = () => {
    if (lenisRef.current) {
      lenisRef.current.stop();
    }
  };

  const start = () => {
    if (lenisRef.current) {
      lenisRef.current.start();
    }
  };

  return (
    <SmoothScrollContext.Provider
      value={{ lenis: lenisInstance, scrollTo, scrollProgress, stop, start }}
    >
      {children}
    </SmoothScrollContext.Provider>
  );
}

