"use client";

import React, { useEffect, useState } from "react";
import { SECTIONS } from "@/lib/marketing/sections-data";
import { useSmoothScroll } from "./smooth-scroll-provider";
import { motion, useTransform, useReducedMotion } from "framer-motion";

export function ScrollProgress() {
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const { scrollTo, scrollProgress } = useSmoothScroll();
  const shouldReduceMotion = useReducedMotion();
  const fillHeight = useTransform(scrollProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -50% 0px",
      threshold: [0, 0.25, 0.5, 0.75],
    };

    const entriesMap = new Map<string, number>();

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entriesMap.set(entry.target.id, entry.intersectionRatio);
      });

      // Find the visible section with highest intersection ratio
      let maxRatio = -1;
      let dominantId = "";
      entriesMap.forEach((ratio, id) => {
        if (ratio > maxRatio && ratio > 0) {
          maxRatio = ratio;
          dominantId = id;
        }
      });

      if (dominantId) {
        setActiveSection(dominantId);
      }
    }, observerOptions);

    SECTIONS.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) {
        observer.observe(el);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleSectionClick = (id: string) => {
    scrollTo(`#${id}`, { offset: -70 });
    setActiveSection(id);
  };

  return (
    <nav
      className="fixed bottom-8 left-6 z-40 hidden xl:flex flex-col items-start p-2 rounded-full bg-white/95 backdrop-blur-md border border-[#D5E5D9] shadow-lg shadow-[#202824]/5 transition-all select-none"
      aria-label="Section Navigation Rail"
    >
      <div className="relative flex flex-col gap-3 items-center py-1">
        {/* Continuous Scrubber Track Container */}
        <div
          aria-hidden="true"
          className="absolute top-2.5 bottom-2.5 left-1/2 -translate-x-1/2 w-[2px] pointer-events-none"
        >
          {/* Base Track */}
          <div className="absolute inset-0 w-full bg-[#E2ECE5] rounded-full" />

          {/* Continuous Active Fill Line (0 to 100% of scroll progress) */}
          {!shouldReduceMotion && (
            <motion.div
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-[#202824] to-[#205C43] rounded-full origin-top"
              style={{ height: fillHeight }}
            />
          )}
        </div>

        {SECTIONS.map((sec) => {
          const isActive = activeSection === sec.id;
          const isHovered = hoveredSection === sec.id;

          return (
            <button
              key={sec.id}
              onClick={() => handleSectionClick(sec.id)}
              onMouseEnter={() => setHoveredSection(sec.id)}
              onMouseLeave={() => setHoveredSection(null)}
              className="group relative z-10 flex items-center justify-center w-5 h-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#205C43] rounded-full"
              aria-label={`Jump to section: ${sec.name}`}
              aria-current={isActive ? "true" : undefined}
            >
              {/* Discrete Circular Dot Indicator */}
              <div
                className={`rounded-full transition-all duration-300 ${
                  isActive
                    ? "w-2.5 h-2.5 bg-[#205C43] ring-4 ring-[#205C43]/25 scale-110"
                    : isHovered
                    ? "w-2.5 h-2.5 bg-[#174530] ring-2 ring-[#205C43]/20 scale-125"
                    : "w-2 h-2 bg-white ring-1.5 ring-[#D5E5D9] group-hover:ring-[#205C43]"
                }`}
              />

              {/* Tooltip Label on Hover */}
              {isHovered && (
                <div
                  className="absolute left-8 px-2.5 py-1 rounded-lg text-[11px] font-mono whitespace-nowrap transition-all duration-200 pointer-events-none shadow-md bg-white text-[#202824] border border-[#D5E5D9] opacity-100"
                >
                  <span className="text-[#205C43] mr-1.5 font-bold">
                    {sec.number}
                  </span>
                  <span>{sec.name}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
