import React from "react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#09090F] text-[#F5F4FA] font-sans flex flex-col md:flex-row antialiased selection:bg-[#A99AFF]/30 selection:text-white relative overflow-hidden">
      {/* LEFT SIDE — ATMOSPHERIC BRAND WORLD (58% Desktop) */}
      <div className="relative w-full md:w-[58%] lg:w-[60%] flex flex-col justify-between p-8 sm:p-12 lg:p-16 border-b md:border-b-0 md:border-r border-white/[0.06] overflow-hidden bg-gradient-to-b from-[#0F0E1A] via-[#09090F] to-[#09090F]">
        {/* Atmospheric Radial Light Field & Luminous Depth (Dimension 40% + Wope 25%) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Upper luminous violet glow */}
          <div className="absolute -top-[25%] -left-[10%] w-[650px] h-[650px] rounded-full bg-gradient-to-br from-[#7864DF]/15 via-[#A99AFF]/08 to-transparent blur-[120px]" />
          
          {/* Center horizon depth field */}
          <div className="absolute top-[45%] left-[20%] w-[500px] h-[350px] rounded-full bg-gradient-to-tr from-[#6F76DB]/10 to-transparent blur-[100px]" />

          {/* Architectural hairline grid lines for sense of depth */}
          <div 
            className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#A99AFF_1px,transparent_1px),linear-gradient(to_bottom,#A99AFF_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" 
          />

          {/* Delicate luminous horizon line across left canvas */}
          <div className="absolute top-[62%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#A99AFF]/20 to-transparent" />
        </div>

        {/* TOP: Brand Wordmark & Security Tier */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link href="/" className="group flex items-center gap-3 transition-opacity hover:opacity-90">
            {/* Custom geometric monogram */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1E1C30] to-[#121120] border border-[#A99AFF]/25 flex items-center justify-center shadow-[0_0_15px_rgba(169,154,255,0.15)] group-hover:border-[#A99AFF]/40 transition-colors">
              <span className="font-mono text-xs font-bold text-[#A99AFF] tracking-wider">NL</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold tracking-tight text-[#F5F4FA]">
                NyayaLink
              </span>
              <span className="text-[10px] font-mono tracking-wider text-[#6F6E7D] uppercase">
                Obsidian Architecture
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#141322] border border-white/[0.06] text-[11px] font-mono text-[#A5A3B2] w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Govt & Bar Verifications Active</span>
          </div>
        </div>

        {/* CENTER: Editorial Typographic Anchor (Desktop/Tablet Only) */}
        <div className="hidden md:block relative z-10 my-12 md:my-auto max-w-xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#A99AFF]/10 border border-[#A99AFF]/20 text-xs font-mono text-[#A99AFF]">
            <span>LEGAL-TECH INFRASTRUCTURE</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#F5F4FA] leading-[1.08]">
            A clearer path to justice.
          </h1>

          <p className="text-base sm:text-lg text-[#A5A3B2] leading-relaxed font-normal max-w-lg">
            Institutional-grade platform connecting citizens with verified advocates across High Courts and district jurisdictions throughout India.
          </p>

          {/* Key Value Pill Highlights */}
          <div className="pt-4 grid grid-cols-2 gap-3 max-w-md">
            <div className="p-3.5 rounded-lg bg-[#111119]/70 border border-white/[0.06] backdrop-blur-sm">
              <div className="text-xs font-mono text-[#A99AFF] mb-1">ZERO-TRUST AUDIT</div>
              <div className="text-xs text-[#A5A3B2]">Continuous immutable logging of all administrative actions.</div>
            </div>
            <div className="p-3.5 rounded-lg bg-[#111119]/70 border border-white/[0.06] backdrop-blur-sm">
              <div className="text-xs font-mono text-[#A99AFF] mb-1">BAR COUNCIL CHECK</div>
              <div className="text-xs text-[#A5A3B2]">Real-time enrollment verification before directory listing.</div>
            </div>
          </div>
        </div>

        {/* BOTTOM: Institutional Metadata (Desktop/Tablet Only) */}
        <div className="hidden md:flex relative z-10 pt-6 border-t border-white/[0.06] flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#6F6E7D]">
          <div className="flex items-center gap-4">
            <span>SECURE GATEWAY v2.4</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">AES-256 GCM ENCRYPTED</span>
          </div>
          <div>
            <span>© 2026 NyayaLink Republic of India</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE — AUTHENTICATION SURFACE (42% Desktop) */}
      <div className="w-full md:w-[42%] lg:w-[40%] flex items-center justify-center p-6 sm:p-10 lg:p-12 bg-[#09090F] relative">
        {/* Subtle right-side ambient vignette */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(120,100,223,0.05),transparent_60%)]" />

        <div className="w-full max-w-md relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
