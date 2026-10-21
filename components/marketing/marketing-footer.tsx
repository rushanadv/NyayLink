import React from "react";
import Link from "next/link";
import { Scale, ShieldCheck } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="w-full border-t border-border-default bg-black/40 backdrop-blur-md text-[#A5A3B2] text-xs pt-16 pb-12 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border-default flex items-center justify-center text-white">
                <Scale className="w-4 h-4" />
              </div>
              <span className="font-serif text-lg font-medium text-white tracking-tight">
                NyayaLink
              </span>
            </div>
            <p className="text-xs text-[#A5A3B2] leading-relaxed max-w-sm">
              Democratizing access to verified legal counsel across India.
              Vernacular intake, transparent milestone escrow, and certified Bar
              Council advocacy.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-white/70">
              <ShieldCheck className="w-4 h-4 text-white/50" />
              <span>Section 36 Advocates Act, 1961 Compliant</span>
            </div>
          </div>

          {/* Links */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
            <div className="space-y-3">
              <h4 className="font-mono text-[11px] uppercase tracking-wider text-white font-semibold">
                Platform
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/lawyers" className="hover:text-white transition-colors">
                    Find Advocates
                  </Link>
                </li>
                <li>
                  <Link href="/intake" className="hover:text-white transition-colors">
                    AI Legal Intake
                  </Link>
                </li>
                <li>
                  <Link href="#problem" className="hover:text-white transition-colors">
                    Escrow Protection
                  </Link>
                </li>
                <li>
                  <Link href="#trust" className="hover:text-white transition-colors">
                    BCI Verification
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-mono text-[11px] uppercase tracking-wider text-white font-semibold">
                Advocates
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/auth/login?intent=lawyer" className="hover:text-white transition-colors">
                    Join Network
                  </Link>
                </li>
                <li>
                  <Link href="#lawyer-saas" className="hover:text-white transition-colors">
                    Chambers SaaS
                  </Link>
                </li>
                <li>
                  <Link href="#lawyer-saas" className="hover:text-white transition-colors">
                    Digital Vakalatnama
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-white transition-colors text-white/50">
                    Operations Portal
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-mono text-[11px] uppercase tracking-wider text-white font-semibold">
                Compliance
              </h4>
              <ul className="space-y-2">
                <li>
                  <span className="hover:text-white transition-colors cursor-default">
                    Bar Council Rules
                  </span>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-default">
                    Advocate-Client Privilege
                  </span>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-default">
                    Privacy Policy
                  </span>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-default">
                    Terms of Service
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Regulatory Disclaimer */}
        <div className="pt-8 border-t border-border-subtle text-[11px] text-white/40 leading-relaxed">
          <p>
            <strong>Regulatory Disclosure:</strong> NyayaLink is an
            informational marketplace and technology service provider, not a law
            firm. In compliance with Section 36 of the Advocates Act, 1961, and
            the Bar Council of India Rules, NyayaLink does not solicit work,
            advertise legal services, or receive any percentage of advocate
            professional fees. Transmission of information does not create an
            advocate-client relationship until mutually accepted.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-white/40">
          <p>© 2026 NyayaLink Technologies Private Limited. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] text-emerald-400">
              ● All Systems Operational (New Delhi)
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
