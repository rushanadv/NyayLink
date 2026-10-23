"use client";

import React from "react";
import { useLanguage } from "@/lib/i18n/context";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "pill" | "minimal" | "compact";
}

export function LanguageSwitcher({
  className = "",
  variant = "pill",
}: LanguageSwitcherProps) {
  const { locale, setLocale } = useLanguage();

  if (variant === "compact") {
    return (
      <div
        className={`inline-flex items-center gap-1 p-0.5 rounded-lg bg-white border border-[#D5E5D9] text-xs shadow-2xs ${className}`}
        role="group"
        aria-label="Language selection"
      >
        <button
          type="button"
          onClick={() => setLocale("en")}
          className={`px-2 py-0.5 rounded font-medium transition-all ${
            locale === "en"
              ? "bg-[#205C43] text-white shadow-xs font-semibold"
              : "text-[#69736D] hover:text-[#202824]"
          }`}
          title="Switch to English"
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setLocale("hi")}
          className={`px-2 py-0.5 rounded font-medium transition-all ${
            locale === "hi"
              ? "bg-[#205C43] text-white shadow-xs font-semibold"
              : "text-[#69736D] hover:text-[#202824]"
          }`}
          title="हिंदी में बदलें"
        >
          हिंदी
        </button>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/90 hover:bg-white border border-[#D5E5D9] text-xs shadow-2xs backdrop-blur-xs transition-colors select-none ${className}`}
      role="group"
      aria-label="Language selection"
    >
      <Globe className="w-3.5 h-3.5 text-[#205C43] shrink-0" />
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`px-1.5 py-0.5 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
          locale === "en"
            ? "bg-[#205C43] text-white font-semibold shadow-2xs"
            : "text-[#69736D] hover:text-[#202824]"
        }`}
        title="English"
      >
        English
      </button>
      <span className="text-[#D5E5D9] text-[10px] select-none">•</span>
      <button
        type="button"
        onClick={() => setLocale("hi")}
        className={`px-1.5 py-0.5 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
          locale === "hi"
            ? "bg-[#205C43] text-white font-semibold shadow-2xs"
            : "text-[#69736D] hover:text-[#202824]"
        }`}
        title="हिंदी (Hindi)"
      >
        हिंदी
      </button>
    </div>
  );
}
