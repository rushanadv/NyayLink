"use client";

import React from "react";

export interface AnimatedGavelProps {
  /**
   * Predefined sizes for the animated gavel illustration:
   * "sm" (84px wide), "md" (130px wide), "lg" (170px wide)
   */
  size?: "sm" | "md" | "lg" | number;
  /**
   * Whether to render the circular impact pedestal beneath the gavel.
   */
  showPedestal?: boolean;
  /**
   * Optional custom CSS class names.
   */
  className?: string;
  /**
   * Accessible description for screen readers.
   */
  ariaLabel?: string;
}

const SIZE_MAP = {
  sm: { width: 92, height: 78 },
  md: { width: 140, height: 118 },
  lg: { width: 180, height: 152 },
};

/**
 * AnimatedGavel — A high-precision vector judge's gavel crafted for NyayLink.
 * Features realistic wrist-pivot physics, decisive gravity acceleration,
 * subtle impact recoil, expanding ripples, and micro-particles.
 *
 * Uses hardware-accelerated CSS keyframes for 60/120fps motion with zero
 * React re-render overhead, and respects prefers-reduced-motion.
 */
export function AnimatedGavel({
  size = "md",
  showPedestal = true,
  className = "",
  ariaLabel = "Judge's gavel striking the bench, indicating legal process in progress",
}: AnimatedGavelProps) {
  const dimensions =
    typeof size === "number"
      ? { width: size, height: Math.round(size * 0.84) }
      : SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: dimensions.width, height: dimensions.height }}
    >
      <svg
        viewBox="0 0 160 135"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
        aria-hidden="true"
      >
        <defs>
          {/* Sound Block Gradients */}
          <linearGradient id="pedestalRim" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#DFCCA8" />
            <stop offset="25%" stopColor="#C5A880" />
            <stop offset="50%" stopColor="#EAD8BC" />
            <stop offset="85%" stopColor="#9C7B4D" />
            <stop offset="100%" stopColor="#B38E5A" />
          </linearGradient>

          <linearGradient id="pedestalBase" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#205C43" />
            <stop offset="40%" stopColor="#174530" />
            <stop offset="100%" stopColor="#0F2B1F" />
          </linearGradient>

          <radialGradient id="pedestalTop" cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#2A7355" />
            <stop offset="65%" stopColor="#1E5740" />
            <stop offset="100%" stopColor="#143C2C" />
          </radialGradient>

          {/* Gavel Handle & Head Gradients */}
          <linearGradient id="gavelWood" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2C1F17" />
            <stop offset="35%" stopColor="#1E3E2F" />
            <stop offset="70%" stopColor="#173528" />
            <stop offset="100%" stopColor="#10251C" />
          </linearGradient>

          <linearGradient id="gavelHeadShaft" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2D6A50" />
            <stop offset="45%" stopColor="#205C43" />
            <stop offset="85%" stopColor="#164330" />
            <stop offset="100%" stopColor="#0E2D20" />
          </linearGradient>

          <linearGradient id="brassBand" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F5E5C9" />
            <stop offset="30%" stopColor="#D8BA8A" />
            <stop offset="70%" stopColor="#B6935C" />
            <stop offset="100%" stopColor="#876735" />
          </linearGradient>

          <radialGradient id="impactGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EAF3ED" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#205C43" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#205C43" stopOpacity="0" />
          </radialGradient>

          {/* Pedestal Drop Shadow Filter */}
          <filter id="pedestalShadow" x="-20%" y="-10%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="5"
              stdDeviation="5"
              floodColor="#174530"
              floodOpacity="0.18"
            />
          </filter>
        </defs>

        {/* Ambient Pedestal Shadow */}
        {showPedestal && (
          <ellipse
            cx="72"
            cy="114"
            rx="52"
            ry="11"
            fill="#174530"
            fillOpacity="0.12"
          />
        )}

        {/* Sound Block / Anvil Assembly */}
        {showPedestal && (
          <g className="sound-block-assembly" filter="url(#pedestalShadow)">
            {/* Plinth Step */}
            <path
              d="M26 109 C26 104, 118 104, 118 109 L118 114 C118 119, 26 119, 26 114 Z"
              fill="#0F2B1F"
            />
            <ellipse
              cx="72"
              cy="109"
              rx="46"
              ry="9.5"
              fill="url(#pedestalRim)"
            />

            {/* Main Tier Body */}
            <path
              d="M32 98 C32 93, 112 93, 112 98 L112 108 C112 113, 32 113, 32 108 Z"
              fill="url(#pedestalBase)"
            />

            {/* Brass Inlay Collar */}
            <path
              d="M32 103 C32 99, 112 99, 112 103 L112 105 C112 109, 32 109, 32 105 Z"
              fill="url(#pedestalRim)"
              opacity="0.85"
            />

            {/* Top Sounding Anvil Face */}
            <ellipse
              cx="72"
              cy="98"
              rx="40"
              ry="8.5"
              fill="url(#pedestalTop)"
              stroke="#D5E5D9"
              strokeWidth="0.75"
              strokeOpacity="0.4"
            />

            {/* Inlaid Inner Brass Ring on Anvil Face */}
            <ellipse
              cx="72"
              cy="98"
              rx="31"
              ry="6.5"
              fill="none"
              stroke="url(#pedestalRim)"
              strokeWidth="1.2"
              strokeDasharray="4 2"
              opacity="0.7"
            />
          </g>
        )}

        {/* Dynamic Impact Ripple Rings (centered precisely at strike anvil contact: 53, 97) */}
        <g className="impact-ripples">
          {/* Primary Wave */}
          <ellipse
            cx="53"
            cy="97"
            rx="18"
            ry="6"
            fill="url(#impactGlow)"
            stroke="#205C43"
            strokeWidth="1.6"
            className="gavel-ripple-1"
          />
          {/* Secondary Expanding Accent Ring */}
          <ellipse
            cx="53"
            cy="97"
            rx="14"
            ry="5"
            fill="none"
            stroke="#C5A880"
            strokeWidth="1.2"
            className="gavel-ripple-2"
          />
        </g>

        {/* Micro Impact Sparks / Particles */}
        <g className="impact-sparks">
          <circle cx="43" cy="91" r="1.5" fill="#EAD8BC" className="gavel-spark spark-1" />
          <circle cx="63" cy="90" r="1.6" fill="#C5A880" className="gavel-spark spark-2" />
          <circle cx="48" cy="85" r="1.3" fill="#205C43" className="gavel-spark spark-3" />
          <circle cx="60" cy="86" r="1.4" fill="#DFCCA8" className="gavel-spark spark-4" />
        </g>

        {/* Gavel Assembly (Pivot point situated at handle grip: 126, 46) */}
        <g className="gavel-arm">
          {/* Gavel Handle Shaft */}
          <g className="gavel-handle">
            {/* Turned wood handle with subtle taper */}
            <path
              d="M125 43 L71 83 C69 84.5, 68 87, 70 88.5 L73 90 C75 91, 77.5 89.5, 79 88 L129 48 Z"
              fill="url(#gavelWood)"
            />
            {/* Handle highlight ridge */}
            <path
              d="M124 44.5 L72 84.5"
              stroke="#437A61"
              strokeWidth="0.8"
              strokeOpacity="0.6"
              strokeLinecap="round"
            />
            {/* Handle Neck Brass Ferrule */}
            <path
              d="M68 85 L76 91 L73.5 94 L65.5 88 Z"
              fill="url(#brassBand)"
            />
            {/* Grip Rings / Ergonomic Turned Grooves */}
            <ellipse cx="114" cy="53" rx="2.5" ry="5" transform="rotate(-38 114 53)" fill="url(#brassBand)" opacity="0.9" />
            <ellipse cx="106" cy="59" rx="2" ry="4.5" transform="rotate(-38 106 59)" fill="url(#brassBand)" opacity="0.8" />

            {/* End Knob / Pommel Finial */}
            <circle cx="127" cy="44" r="5.5" fill="url(#brassBand)" stroke="#876735" strokeWidth="0.5" />
            <circle cx="127" cy="44" r="3.2" fill="#2C1F17" />
          </g>

          {/* Gavel Head (Cylindrical Barrel with Brass Bands & Strike Faces) */}
          <g className="gavel-head">
            {/* Head Drop Shadow onto handle */}
            <ellipse cx="53" cy="94" rx="14" ry="7" transform="rotate(-28 53 94)" fill="#091610" opacity="0.3" />

            {/* Main Emerald Lacquer Barrel Body */}
            <rect
              x="37"
              y="85"
              width="32"
              height="18"
              rx="4"
              transform="rotate(-28 53 94)"
              fill="url(#gavelHeadShaft)"
              stroke="#0E2D20"
              strokeWidth="0.75"
            />

            {/* Specular Light Highlight Across Barrel */}
            <path
              d="M38 88 L68 88"
              transform="rotate(-28 53 94)"
              stroke="#A8D6C0"
              strokeWidth="1.2"
              strokeOpacity="0.55"
              strokeLinecap="round"
            />

            {/* Center Mounting Brass Band */}
            <rect
              x="50"
              y="84.5"
              width="6.5"
              height="19"
              rx="1.5"
              transform="rotate(-28 53 94)"
              fill="url(#brassBand)"
              stroke="#876735"
              strokeWidth="0.5"
            />

            {/* Left Strike Face Assembly (The Business End striking the pedestal) */}
            <g transform="rotate(-28 53 94)">
              {/* Left Brass Chamfer Ring */}
              <rect x="36" y="84.5" width="3.5" height="19" rx="1" fill="url(#brassBand)" />
              {/* Left Impact Cap */}
              <ellipse cx="36" cy="94" rx="3.5" ry="9" fill="url(#gavelWood)" stroke="#10251C" strokeWidth="0.75" />
              {/* Flat Strike Pad Face */}
              <ellipse cx="34.5" cy="94" rx="2" ry="8" fill="#1C3F30" />
            </g>

            {/* Right Decorative Strike Face Assembly */}
            <g transform="rotate(-28 53 94)">
              {/* Right Brass Chamfer Ring */}
              <rect x="66.5" y="84.5" width="3.5" height="19" rx="1" fill="url(#brassBand)" />
              {/* Right Cap */}
              <ellipse cx="70" cy="94" rx="3.5" ry="9" fill="url(#brassBand)" />
              <ellipse cx="70.5" cy="94" rx="2" ry="7.5" fill="url(#gavelWood)" />
            </g>
          </g>
        </g>
      </svg>

      {/* Embedded High-Performance Motion Keyframes */}
      <style jsx>{`
        /* Core Strike Cycle: 1080ms total loop */
        .gavel-arm {
          transform-origin: 126px 45px;
          animation: gavel-strike-cycle 1.12s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          will-change: transform;
        }

        .sound-block-assembly {
          transform-origin: 72px 105px;
          animation: anvil-compression 1.12s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          will-change: transform;
        }

        .gavel-ripple-1 {
          transform-origin: 53px 97px;
          animation: ripple-wave-1 1.12s cubic-bezier(0.2, 0.8, 0.4, 1) infinite;
          will-change: transform, opacity;
        }

        .gavel-ripple-2 {
          transform-origin: 53px 97px;
          animation: ripple-wave-2 1.12s cubic-bezier(0.2, 0.8, 0.4, 1) infinite;
          will-change: transform, opacity;
        }

        .spark-1 {
          --dx: -14px;
          --dy: -9px;
          animation: spark-flare 1.12s cubic-bezier(0.2, 0.8, 0.4, 1) infinite;
        }
        .spark-2 {
          --dx: 13px;
          --dy: -10px;
          animation: spark-flare 1.12s cubic-bezier(0.2, 0.8, 0.4, 1) infinite;
        }
        .spark-3 {
          --dx: -16px;
          --dy: -4px;
          animation: spark-flare 1.12s cubic-bezier(0.2, 0.8, 0.4, 1) infinite;
        }
        .spark-4 {
          --dx: 15px;
          --dy: -5px;
          animation: spark-flare 1.12s cubic-bezier(0.2, 0.8, 0.4, 1) infinite;
        }

        /* Physics keyframes for the gavel strike */
        @keyframes gavel-strike-cycle {
          0% {
            transform: rotate(-6deg) translateY(0);
          }
          10% {
            transform: rotate(-6deg) translateY(0);
          }
          /* Lift & Backswing anticipation */
          34% {
            transform: rotate(-32deg) translateY(-8px);
          }
          40% {
            transform: rotate(-33.5deg) translateY(-8.5px);
          }
          /* Decisive downward strike acceleration */
          52% {
            transform: rotate(0.8deg) translateY(0.5px);
          }
          /* Impact point */
          53% {
            transform: rotate(0deg) translateY(0px);
          }
          /* Crisp micro-recoil / bounce */
          56% {
            transform: rotate(-3.5deg) translateY(-2px);
          }
          61% {
            transform: rotate(0deg) translateY(0px);
          }
          /* Rest on the sound block / resonance hold */
          82% {
            transform: rotate(0deg) translateY(0px);
          }
          /* Reset back smoothly to initial stance */
          100% {
            transform: rotate(-6deg) translateY(0);
          }
        }

        /* Sound block shock compression on impact */
        @keyframes anvil-compression {
          0%, 51% {
            transform: scaleY(1) translateY(0);
          }
          53% {
            transform: scaleY(0.97) translateY(0.8px);
          }
          58% {
            transform: scaleY(1.01) translateY(-0.2px);
          }
          64%, 100% {
            transform: scaleY(1) translateY(0);
          }
        }

        /* Expanding impact wave 1 */
        @keyframes ripple-wave-1 {
          0%, 52% {
            opacity: 0;
            transform: scale(0.2);
          }
          53% {
            opacity: 0.9;
            transform: scale(0.4);
          }
          74% {
            opacity: 0;
            transform: scale(2.4);
          }
          100% {
            opacity: 0;
            transform: scale(2.4);
          }
        }

        /* Expanding impact wave 2 */
        @keyframes ripple-wave-2 {
          0%, 54% {
            opacity: 0;
            transform: scale(0.2);
          }
          56% {
            opacity: 0.7;
            transform: scale(0.5);
          }
          78% {
            opacity: 0;
            transform: scale(2.9);
          }
          100% {
            opacity: 0;
            transform: scale(2.9);
          }
        }

        /* Micro impact sparks */
        @keyframes spark-flare {
          0%, 52% {
            opacity: 0;
            transform: translate(0, 0) scale(0);
          }
          53% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
          68% {
            opacity: 0;
            transform: translate(var(--dx), var(--dy)) scale(0.3);
          }
          100% {
            opacity: 0;
            transform: translate(var(--dx), var(--dy)) scale(0);
          }
        }

        /* Accessibility: graceful reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .gavel-arm {
            animation: none;
            transform: rotate(0deg) translateY(0);
          }
          .sound-block-assembly {
            animation: none;
            transform: scale(1);
          }
          .gavel-ripple-1,
          .gavel-ripple-2,
          .gavel-spark {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
