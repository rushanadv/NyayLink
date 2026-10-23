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
    const lenis = new Lenis({
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0,
      // Protect any element or ancestor with [data-lenis-prevent] from scroll hijacking
      prevent: (node: HTMLElement) =>
        node.hasAttribute("data-lenis-prevent") ||
        Boolean(node.closest("[data-lenis-prevent]")),
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

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
      setLenisInstance(null);
    };
  }, [scrollProgress]);

  const scrollTo = (
    target: string | HTMLElement,
    options?: { offset?: number; duration?: number }
  ) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, {
        offset: options?.offset ?? -80,
        duration: options?.duration ?? 0.9,
      });
    } else {
      if (typeof target === "string") {
        const el = document.querySelector(target);
        el?.scrollIntoView({ behavior: "smooth" });
      } else if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: "smooth" });
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
