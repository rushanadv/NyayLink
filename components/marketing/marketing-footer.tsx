"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale, ShieldCheck } from "lucide-react";

export function MarketingFooter() {
  const pathname = usePathname();
  const isDarkSubpage = pathname === "/lawyers" || pathname?.startsWith("/intake");

  return (
    <footer
      className={`w-full border-t text-xs pt-16 pb-12 relative z-10 transition-colors ${
        isDarkSubpage
          ? "border-white/[0.08] bg-[#090B10] text-[#A5A3B2]"
          : "border-[#D5E5D9] bg-white text-[#69736D]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
                  isDarkSubpage
                    ? "bg-white/[0.04] border-white/[0.1] text-white"
                    : "bg-[#EAF3ED] border-[#D5E5D9] text-[#205C43]"
                }`}
              >
                <Scale className="w-4 h-4 text-[#205C43]" />
              </div>
              <span
                className={`font-serif text-lg font-medium tracking-tight ${
                  isDarkSubpage ? "text-white" : "text-[#202824]"
                }`}
              >
                NyayaLink
              </span>
            </div>
            <p className="text-xs leading-relaxed max-w-sm">
              Democratizing access to verified legal counsel across India.
              Plain-language intake, transparent milestone escrow, and certified Bar
              Council advocacy.
            </p>
            <div
              className={`flex items-center gap-2 text-[11px] ${
                isDarkSubpage ? "text-white/70" : "text-[#202824]/80"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#205C43]" />
              <span>Section 36 Advocates Act, 1961 Compliant</span>
            </div>
          </div>

          {/* Links */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
            <div className="space-y-3">
              <h4
                className={`font-mono text-[11px] uppercase tracking-wider font-semibold ${
                  isDarkSubpage ? "text-white" : "text-[#202824]"
                }`}
              >
                Platform
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/lawyers"
                    className={`transition-colors ${
                      isDarkSubpage ? "hover:text-white" : "hover:text-[#205C43]"
                    }`}
                  >
                    Find Advocates
                  </Link>
                </li>
                <li>
                  <Link
                    href="/intake"
                    className={`transition-colors ${
                      isDarkSubpage ? "hover:text-white" : "hover:text-[#205C43]"
                    }`}
                  >
                    AI Legal Intake
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#how-it-works"
                    className={`transition-colors ${
                      isDarkSubpage ? "hover:text-white" : "hover:text-[#205C43]"
                    }`}
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#trust"
                    className={`transition-colors ${
                      isDarkSubpage ? "hover:text-white" : "hover:text-[#205C43]"
                    }`}
                  >
                    BCI Verification
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4
                className={`font-mono text-[11px] uppercase tracking-wider font-semibold ${
                  isDarkSubpage ? "text-white" : "text-[#202824]"
                }`}
              >
                Advocates
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/auth/login?intent=lawyer"
                    className={`transition-colors ${
                      isDarkSubpage ? "hover:text-white" : "hover:text-[#205C43]"
                    }`}
                  >
                    Advocate Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#for-advocates"
                    className={`transition-colors ${
                      isDarkSubpage ? "hover:text-white" : "hover:text-[#205C43]"
                    }`}
                  >
                    Chambers Portal
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#for-advocates"
                    className={`transition-colors ${
                      isDarkSubpage ? "hover:text-white" : "hover:text-[#205C43]"
                    }`}
                  >
                    Digital Vakalatnama
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#trust"
                    className={`transition-colors ${
                      isDarkSubpage ? "hover:text-white" : "hover:text-[#205C43]"
                    }`}
                  >
                    Rule 36 Guidelines
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4
                className={`font-mono text-[11px] uppercase tracking-wider font-semibold ${
                  isDarkSubpage ? "text-white" : "text-[#202824]"
                }`}
              >
                Ethics & Standards
              </h4>
              <ul className="space-y-2">
                <li>
                  <span className="cursor-default">Bar Council Rules</span>
                </li>
                <li>
                  <span className="cursor-default">Privileged Briefs</span>
                </li>
                <li>
                  <span className="cursor-default">Privacy Safeguards</span>
                </li>
                <li>
                  <span className="cursor-default">Platform Terms</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Regulatory Disclaimer */}
        <div
          className={`pt-8 border-t text-[11px] leading-relaxed ${
            isDarkSubpage
              ? "border-white/[0.08] text-white/50"
              : "border-[#D5E5D9] text-[#69736D]"
          }`}
        >
          <p>
            <strong className={isDarkSubpage ? "text-white/80" : "text-[#202824]"}>
              Regulatory Disclosure:
            </strong>{" "}
            NyayaLink is an informational infrastructure and technology platform, not a law firm.
            In strict compliance with Section 36 of the Advocates Act, 1961, and Bar Council of India
            Rules, NyayaLink does not advertise legal services, solicit briefs, or receive referral commissions.
            Advocate-client privilege attaches directly upon mutual consultation acceptance.
          </p>
        </div>

        {/* Bottom Bar */}
        <div
          className={`pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] ${
            isDarkSubpage ? "text-white/40" : "text-[#69736D]"
          }`}
        >
          <p>© 2026 NyayaLink Technologies. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] text-[#205C43] flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#205C43] animate-pulse" />
              National Jurisdiction Active · Supreme Court & State High Courts
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
