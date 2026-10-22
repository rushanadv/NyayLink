"use client";

import React, { useState } from "react";
import { QrCode, Copy, Check, X, ExternalLink, ShieldCheck } from "lucide-react";

export function CourtOnboardingQrModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const targetUrl = "https://nyay.live/auth/sign-up?intent=lawyer";
  // Reliable SVG QR code via standard QR endpoint or encoded matrix
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(targetUrl)}&color=174530&bgcolor=FFFFFF`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn("Could not copy to clipboard", e);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-3.5 py-3.5 rounded-xl bg-white hover:bg-[#EAF3ED] border border-[#D5E5D9] text-[#174530] text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs"
        title="Show QR Code for instant phone scanning at court"
      >
        <QrCode className="w-4 h-4 text-[#205C43]" />
        <span className="hidden sm:inline">Court QR Handoff</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-white border border-[#D5E5D9] p-6 shadow-2xl text-center space-y-4">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-[#EAF3ED] hover:bg-[#D5E5D9] flex items-center justify-center text-[#202824] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF3ED] text-[11px] font-mono text-[#174530] font-semibold mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#205C43]" />
                <span>DISTRICT COURT HANDOFF</span>
              </div>
              <h3 className="text-xl font-serif font-semibold text-[#202824]">
                Scan to Register
              </h3>
              <p className="text-xs text-[#69736D] mt-1 leading-relaxed">
                Have the advocate point their phone camera here to open the registration flow directly.
              </p>
            </div>

            {/* QR Code Container */}
            <div className="p-3 rounded-2xl bg-[#F8FAF9] border border-[#D5E5D9] inline-block shadow-inner mx-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCodeUrl}
                alt="Advocate Onboarding QR Code"
                width={220}
                height={220}
                className="w-52 h-52 rounded-xl mx-auto block"
              />
            </div>

            {/* URL Display & Copy */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] text-left">
                <span className="text-[11px] font-mono text-[#404D44] truncate select-all">
                  {targetUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="ml-2 px-2.5 py-1 rounded-lg bg-[#EAF3ED] hover:bg-[#D5E5D9] text-[#174530] text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-[#205C43]" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <a
                href={targetUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#205C43] hover:underline font-medium"
              >
                <span>Open signup page in new tab</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
