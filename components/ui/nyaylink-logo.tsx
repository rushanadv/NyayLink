"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export interface NyayLinkLogoProps {
  /**
   * "full" displays both the official Lady Justice emblem and "NyayLink" wordmark.
   * "symbol" displays only the official Lady Justice emblem.
   */
  variant?: "full" | "symbol";
  /**
   * Predefined size presets or custom pixel dimension for the emblem.
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  /**
   * Theme mode for wordmark styling.
   * "light": #202824 text with forest green accent (standard NyayLink identity).
   * "dark": crisp white text for dark panels/headers.
   */
  theme?: "light" | "dark";
  /**
   * Optional link destination. Defaults to "/". Pass false or empty string to render non-clickable.
   */
  href?: string | false;
  /**
   * Additional CSS classes for outer container.
   */
  className?: string;
  /**
   * Custom accessible alt text. Defaults to "NyayLink — Legal Justice Platform".
   */
  alt?: string;
  /**
   * Optional subtitle or badge below the wordmark (e.g. "AI Intake" or "Advocate Portal").
   */
  subtitle?: string;
}

const SIZE_MAP = {
  xs: { px: 24, text: "text-base", sub: "text-[9px]" },
  sm: { px: 32, text: "text-lg", sub: "text-[10px]" },
  md: { px: 40, text: "text-xl", sub: "text-[11px]" },
  lg: { px: 48, text: "text-2xl", sub: "text-xs" },
  xl: { px: 60, text: "text-3xl", sub: "text-sm" },
};

export function NyayLinkLogo({
  variant = "full",
  size = "md",
  theme = "light",
  href = "/",
  className = "",
  alt = "NyayLink — Official Logo",
  subtitle,
}: NyayLinkLogoProps) {
  const pixelSize = typeof size === "number" ? size : SIZE_MAP[size].px;
  const textSizeClass =
    typeof size === "string" ? SIZE_MAP[size].text : "text-xl";
  const subSizeClass =
    typeof size === "string" ? SIZE_MAP[size].sub : "text-[11px]";

  const textColor =
    theme === "dark"
      ? "text-white group-hover:text-white/90"
      : "text-[#202824] group-hover:text-[#174530]";

  const dotColor = theme === "dark" ? "bg-emerald-400" : "bg-[#205C43]";

  const content = (
    <div
      className={`inline-flex items-center gap-2.5 group select-none ${className}`}
    >
      {/* Official NyayLink Logo Image: Gold Lady Justice on Deep Navy Square */}
      <div
        className="relative shrink-0 overflow-hidden rounded-[22%] shadow-xs transition-transform duration-200 group-hover:scale-[1.03]"
        style={{ width: pixelSize, height: pixelSize }}
      >
        <Image
          src="/brand/nyaylink-logo.png"
          alt={alt}
          width={pixelSize}
          height={pixelSize}
          priority
          className="w-full h-full object-cover"
        />
      </div>

      {/* Wordmark (when variant === 'full') */}
      {variant === "full" && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center">
            <span
              className={`font-serif font-bold tracking-tight transition-colors ${textSizeClass} ${textColor}`}
            >
              NyayLink
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${dotColor} ml-1.5 transition-transform group-hover:scale-125`}
              aria-hidden="true"
            />
          </div>
          {subtitle && (
            <span
              className={`font-mono text-[#69736D] uppercase tracking-wider mt-0.5 ${subSizeClass}`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#205C43] rounded-lg"
      >
        {content}
      </Link>
    );
  }

  return content;
}
