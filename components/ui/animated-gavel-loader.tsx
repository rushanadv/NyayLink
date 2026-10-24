"use client";

import React from "react";
import { AnimatedGavel } from "./animated-gavel";
import { NyayLinkLogo } from "./nyaylink-logo";
import { useLanguage } from "@/lib/i18n/context";
import { Scale } from "lucide-react";

export interface AnimatedGavelLoaderProps {
  /**
   * Layout presentation variant:
   * - "fullscreen": High-impact branded splash / full-viewport overlay
   * - "section": Card or container-level loading for data tabs & Suspense boundaries
   * - "inline": Compact horizontal/vertical badge for lightweight operations
   */
  variant?: "fullscreen" | "section" | "inline";
  /**
   * Optional custom primary loading message (defaults to bilingual legal workspace message)
   */
  message?: string;
  /**
   * Optional secondary legal trust subtitle
   */
  submessage?: string;
  /**
   * Whether to display the NyayLink logo above the gavel (default: true for fullscreen, false for inline)
   */
  showLogo?: boolean;
  /**
   * Gavel size preset: "sm", "md", "lg"
   */
  gavelSize?: "sm" | "md" | "lg";
  /**
   * Additional custom CSS classes for the outer container
   */
  className?: string;
  /**
   * Whether to display the subtle BNS compliance micro-badge (default: true for fullscreen)
   */
  showStatutoryBadge?: boolean;
}

export function AnimatedGavelLoader({
  variant = "fullscreen",
  message,
  submessage,
  showLogo = variant === "fullscreen",
  gavelSize,
  className = "",
  showStatutoryBadge = variant === "fullscreen",
}: AnimatedGavelLoaderProps) {
  const { isHindi } = useLanguage();

  // Default bilingual copy tailored for Indian legal-tech context
  const defaultMessage = isHindi
    ? "आपका कानूनी कार्यक्षेत्र तैयार हो रहा है…"
    : "Preparing your legal workspace…";

  const defaultSubmessage = isHindi
    ? "भारतीय न्याय संहिता व विधिक सिद्धांतों पर आधारित"
    : "BNS & Indian Jurisprudence Grounded · High Court & Supreme Court Verified";

  const activeMessage = message || defaultMessage;
  const activeSubmessage = submessage !== undefined ? submessage : defaultSubmessage;

  // Resolved Gavel Size
  const resolvedGavelSize =
    gavelSize || (variant === "fullscreen" ? "lg" : variant === "section" ? "md" : "sm");

  /* =========================================================================
     1. INLINE VARIANT
     ========================================================================= */
  if (variant === "inline") {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/95 border border-[#D5E5D9] shadow-2xs ${className}`}
      >
        <AnimatedGavel
          size={46}
          showPedestal={true}
          ariaLabel={activeMessage}
        />
        <div className="text-left">
          <p className="text-xs font-semibold text-[#202824] leading-snug">
            {activeMessage}
          </p>
          {activeSubmessage && (
            <p className="text-[10px] text-[#69736D] font-mono leading-tight">
              {activeSubmessage}
            </p>
          )}
        </div>
      </div>
    );
  }

  /* =========================================================================
     2. SECTION / CARD VARIANT (for Suspense & Tab boundaries)
     ========================================================================= */
  if (variant === "section") {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`w-full p-8 sm:p-12 min-h-[280px] rounded-2xl bg-gradient-to-b from-white via-[#FAFDFB] to-[#F2F7F4] border border-[#D5E5D9] shadow-sm flex flex-col items-center justify-center text-center space-y-4 select-none ${className}`}
      >
        {/* Animated Vector Gavel */}
        <div className="relative py-2">
          {/* Subtle Ambient Glow */}
          <div className="absolute inset-0 bg-[#EAF3ED] rounded-full blur-xl opacity-60 scale-125 pointer-events-none" />
          <AnimatedGavel
            size={resolvedGavelSize}
            showPedestal={true}
            ariaLabel={activeMessage}
          />
        </div>

        {/* Messaging */}
        <div className="space-y-1.5 max-w-sm">
          <h3 className="text-sm font-semibold text-[#202824] tracking-tight">
            {activeMessage}
          </h3>
          {activeSubmessage && (
            <p className="text-xs text-[#69736D] leading-relaxed">
              {activeSubmessage}
            </p>
          )}
        </div>

        {/* Minimal Progress Line Accent */}
        <div className="w-24 h-1 rounded-full bg-[#EAF3ED] overflow-hidden border border-[#D5E5D9]/40 mt-1">
          <div className="h-full bg-[#205C43] rounded-full animate-indeterminate-pulse" />
        </div>

        <style jsx>{`
          @keyframes indeterminate {
            0% {
              transform: translateX(-100%);
              width: 40%;
            }
            50% {
              width: 70%;
            }
            100% {
              transform: translateX(250%);
              width: 40%;
            }
          }
          .animate-indeterminate-pulse {
            animation: indeterminate 1.6s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  /* =========================================================================
     3. FULLSCREEN BRANDED LOADING EXPERIENCE
     ========================================================================= */
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-6 bg-[#FFFFFF] select-none ${className}`}
    >
      {/* Background Soft Ambient Vignette */}
      <div className="absolute inset-0 bg-radial from-[#F0F6F2] via-[#F8FAF9] to-[#FFFFFF] opacity-90 pointer-events-none" />

      {/* Subtle Circular Radial Glow behind the Gavel */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-[#EAF3ED]/80 via-[#D5E5D9]/40 to-transparent blur-3xl pointer-events-none" />

      {/* Main Centered Content Container */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-6 sm:space-y-7 max-w-md mx-auto">
        {/* Official NyayLink Logo & Wordmark */}
        {showLogo && (
          <div className="transform transition-transform hover:scale-102">
            <NyayLinkLogo
              variant="full"
              size="md"
              theme="light"
              href={false}
              className="drop-shadow-2xs"
            />
          </div>
        )}

        {/* Central Vector Gavel Animation */}
        <div className="relative py-3 sm:py-4">
          <div className="absolute -inset-4 bg-gradient-to-b from-white/40 via-[#EAF3ED]/50 to-transparent rounded-full blur-lg pointer-events-none" />
          <AnimatedGavel
            size={resolvedGavelSize}
            showPedestal={true}
            ariaLabel={activeMessage}
          />
        </div>

        {/* Professional Status Messaging */}
        <div className="space-y-2">
          <h2 className="text-base sm:text-lg font-serif font-semibold text-[#174530] tracking-tight">
            {activeMessage}
          </h2>

          {activeSubmessage && (
            <p className="text-xs text-[#69736D] max-w-xs sm:max-w-sm mx-auto leading-relaxed font-sans">
              {activeSubmessage}
            </p>
          )}
        </div>

        {/* Decisive Animated Progress Bar Accent */}
        <div className="w-36 sm:w-44 h-1.5 rounded-full bg-[#EAF3ED] overflow-hidden border border-[#D5E5D9] shadow-2xs">
          <div className="h-full bg-gradient-to-r from-[#205C43] via-[#2F855E] to-[#205C43] rounded-full animate-indeterminate-pulse" />
        </div>

        {/* Statutory Compliance Footer Badge */}
        {showStatutoryBadge && (
          <div className="pt-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F9F5] border border-[#D5E5D9] text-[10.5px] font-mono text-[#205C43] shadow-2xs">
            <Scale className="w-3 h-3 text-[#205C43] shrink-0" />
            <span>Advocates Act 1961 · BCI Rule 36 Compliant</span>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes indeterminate {
          0% {
            transform: translateX(-100%);
            width: 35%;
          }
          50% {
            width: 65%;
          }
          100% {
            transform: translateX(260%);
            width: 35%;
          }
        }
        .animate-indeterminate-pulse {
          animation: indeterminate 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}
