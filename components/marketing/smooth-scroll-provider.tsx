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
    // 1. Native scroll listener fallback and initial measurement
    const handleNativeScroll = () => {
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const p =
        scrollHeight > 0
          ? Math.min(1, Math.max(0, window.scrollY / scrollHeight))
          : 0;
      scrollProgress.set(p);
    };

    window.addEventListener("scroll", handleNativeScroll, { passive: true });
    window.addEventListener("resize", handleNativeScroll, { passive: true });
    handleNativeScroll();

    // 2. Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      return () => {
        window.removeEventListener("scroll", handleNativeScroll);
        window.removeEventListener("resize", handleNativeScroll);
      };
    }

    // 3. Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 1.2,
    });

    lenisRef.current = lenis;
    setLenisInstance(lenis);

    // Synchronize Lenis progress directly into the shared MotionValue
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
      window.removeEventListener("scroll", handleNativeScroll);
      window.removeEventListener("resize", handleNativeScroll);
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
        duration: options?.duration ?? 1.2,
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

  return (
    <SmoothScrollContext.Provider
      value={{ lenis: lenisInstance, scrollTo, scrollProgress }}
    >
      {children}
    </SmoothScrollContext.Provider>
  );
}
