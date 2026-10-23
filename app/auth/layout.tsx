import React from "react";
import { ShieldCheck, Lock } from "lucide-react";
import { NyayLinkLogo } from "@/components/ui/nyaylink-logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-white text-[#202824] font-sans flex flex-col md:flex-row antialiased selection:bg-[#205C43]/20 selection:text-[#202824] relative overflow-hidden">
      {/* LEFT SIDE — EDITORIAL BRAND WORLD (58% Desktop) */}
      <div className="relative w-full md:w-[54%] lg:w-[58%] flex flex-col justify-between p-4 sm:p-6 md:p-12 lg:p-16 border-b md:border-b-0 md:border-r border-[#D5E5D9] overflow-hidden bg-gradient-to-b from-white via-[#FAFCFB] to-[#EAF3ED]/40">
        {/* Subtle Architectural Atmosphere */}

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Faint green luminous ambient light */}
          <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#205C43]/8 to-transparent blur-[100px]" />

          {/* Architectural micro hairline grid */}
          <div
            className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#202824_1px,transparent_1px),linear-gradient(to_bottom,#202824_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"
          />
        </div>

        {/* TOP: Brand Wordmark & Security Status */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <NyayLinkLogo size="sm" subtitle="Legal Services" />

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#D5E5D9] text-[11px] font-mono text-[#69736D] w-fit shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#205C43] animate-pulse" />
            <span>Bar Council Roll Verification Active</span>
          </div>
        </div>

        {/* CENTER: Editorial Typographic Anchor (Desktop/Tablet Only) */}
        <div className="hidden md:block relative z-10 my-12 md:my-auto max-w-xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#EAF3ED] border border-[#D5E5D9] text-xs font-mono text-[#205C43] font-semibold">
            <span>VERIFIED ACCESS GATEWAY</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-serif font-normal tracking-tight text-[#202824] leading-[1.1] text-balance">
            Find the right legal path forward.
          </h1>

          <p className="text-base text-[#69736D] leading-relaxed font-light max-w-lg">
            Institutional platform connecting citizens with verified State Bar Council advocates across High Courts and district jurisdictions throughout India.
          </p>

          {/* Key Value Highlight Cards */}
          <div className="pt-2 grid grid-cols-2 gap-3 max-w-md text-xs">
            <div className="p-4 rounded-xl bg-white border border-[#D5E5D9] shadow-xs space-y-1">
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#205C43] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-[#205C43]" />
                <span>BCI RULE 36</span>
              </div>
              <p className="text-[#69736D] text-[11px] leading-snug">
                Strictly neutral directory. Zero client solicitation or referral commissions.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#D5E5D9] shadow-xs space-y-1">
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#174530] font-bold uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5 text-[#174530]" />
                <span>MILESTONE ESCROW</span>
              </div>
              <p className="text-[#69736D] text-[11px] leading-snug">
                Triple-layer escrow protection with transparent consultation fees.
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM: Institutional Metadata (Desktop/Tablet Only) */}
        <div className="hidden md:flex relative z-10 pt-6 border-t border-[#D5E5D9] flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#69736D]">
          <div className="flex items-center gap-3">
            <span>SECURE GATEWAY v2.4</span>
            <span>•</span>
            <span>AES-256 PRIVACY ENCRYPTED</span>
          </div>
          <div>
            <span>© 2026 NyayLink</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE — AUTHENTICATION SURFACE (42% Desktop) */}
      <div className="w-full md:w-[46%] lg:w-[42%] flex items-center justify-center p-4 sm:p-8 lg:p-14 bg-white relative">
        <div className="w-full max-w-md relative z-10">

          {children}
        </div>
      </div>
    </div>
  );
}
