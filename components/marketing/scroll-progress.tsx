"use client";

import React, { useEffect, useState } from "react";
import { SECTIONS } from "@/lib/marketing/sections-data";
import { useSmoothScroll } from "./smooth-scroll-provider";

export function ScrollProgress() {
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const { scrollTo } = useSmoothScroll();

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
    scrollTo(`#${id}`, { offset: -60 });
    setActiveSection(id);
  };

  return (
    <nav
      className="fixed bottom-8 left-6 z-40 hidden lg:flex flex-col items-start gap-3 p-2.5 rounded-full bg-[#0C0F17]/85 backdrop-blur-md border border-white/[0.06] shadow-2xl shadow-black/60 transition-all select-none"
      aria-label="Section Navigation Rail"
    >
      <div className="flex flex-col gap-2.5 items-center">
        {SECTIONS.map((sec) => {
          const isActive = activeSection === sec.id;
          const isHovered = hoveredSection === sec.id;

          return (
            <button
              key={sec.id}
              onClick={() => handleSectionClick(sec.id)}
              onMouseEnter={() => setHoveredSection(sec.id)}
              onMouseLeave={() => setHoveredSection(null)}
              className="group relative flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] rounded-full p-1"
              aria-label={`Jump to section: ${sec.name}`}
              aria-current={isActive ? "true" : undefined}
            >
              {/* Dot Indicator */}
              <div
                className={`transition-all duration-300 rounded-full ${
                  isActive
                    ? "w-2.5 h-6 bg-[#C5A059] shadow-[0_0_12px_rgba(197,160,89,0.5)]"
                    : "w-2 h-2 bg-white/20 group-hover:bg-white/60 group-hover:scale-125"
                }`}
              />

              {/* Tooltip Label on Hover / Active */}
              {(isHovered || isActive) && (
                <div
                  className={`absolute left-7 px-2.5 py-1 rounded-md text-[11px] font-mono whitespace-nowrap transition-all duration-200 pointer-events-none ${
                    isActive
                      ? "bg-[#141824] text-white border border-[#C5A059]/40 opacity-100 translate-x-0"
                      : "bg-[#11141D] text-[#A5A3B2] border border-white/10 opacity-90 translate-x-0"
                  }`}
                >
                  <span className="text-[#C5A059] mr-1.5 font-bold">
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
