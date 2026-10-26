"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { NyayLinkLogo } from "@/components/ui/nyaylink-logo";
import { useLanguage } from "@/lib/i18n/context";
import { PWAInstallButton } from "@/components/pwa/pwa-install-button";

export function MarketingFooter() {
  const { t, isHindi } = useLanguage();
  const isDarkSubpage = false;

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
            <NyayLinkLogo size="sm" />
            <p className="text-xs leading-relaxed max-w-sm">
              {t.home.footer.mission}
            </p>
            <div
              className={`flex items-center gap-2 text-[11px] ${
                isDarkSubpage ? "text-white/70" : "text-[#202824]/80"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#205C43]" />
              <span>{t.home.footer.complianceBadge}</span>
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
                {t.home.footer.platformHeading}
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/lawyers"
                    className={`transition-colors ${
                      isDarkSubpage ? "hover:text-white" : "hover:text-[#205C43]"
                    }`}
                  >
                    {t.home.footer.findAdvocates}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/intake"
                    className={`transition-colors ${
                      isDarkSubpage ? "hover:text-white" : "hover:text-[#205C43]"
                    }`}
                  >
                    {t.home.footer.aiIntake}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#how-it-works"
                    className={`transition-colors ${
                      isDarkSubpage ? "hover:text-white" : "hover:text-[#205C43]"
                    }`}
                  >
                    {t.home.footer.howItWorks}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#trust"
                    className={`transition-colors ${
                      isDarkSubpage ? "hover:text-white" : "hover:text-[#205C43]"
                    }`}
                  >
                    {t.home.footer.bciVerification}
                  </Link>
                </li>
                <li>
                  <PWAInstallButton
                    variant="footer"
                    className={
                      isDarkSubpage
                        ? "text-[#A5A3B2] hover:text-white"
                        : "text-[#69736D] hover:text-[#205C43]"
                    }
                  />
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4
                className={`font-mono text-[11px] uppercase tracking-wider font-semibold ${
                  isDarkSubpage ? "text-white" : "text-[#202824]"
                }`}
              >
                {t.home.footer.advocatesHeading}
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/auth/login?intent=lawyer"
                    className={`transition-colors ${
                      isDarkSubpage ? "hover:text-white" : "hover:text-[#205C43]"
                    }`}
                  >
                    {t.home.footer.chamberLogin}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#for-lawyers"
                    className={`transition-colors ${
                      isDarkSubpage ? "hover:text-white" : "hover:text-[#205C43]"
                    }`}
                  >
                    {t.home.footer.causeListSync}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#for-lawyers"
                    className={`transition-colors ${
                      isDarkSubpage ? "hover:text-white" : "hover:text-[#205C43]"
                    }`}
                  >
                    {t.home.hero.digitalVakalatnama}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#trust"
                    className={`transition-colors ${
                      isDarkSubpage ? "hover:text-white" : "hover:text-[#205C43]"
                    }`}
                  >
                    {t.home.footer.ethicsGuidelines}
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
                {t.home.footer.legalHeading}
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/privacy"
                    className={`transition-colors ${
                      isDarkSubpage ? "hover:text-white" : "hover:text-[#205C43]"
                    }`}
                  >
                    {t.home.footer.privacyPolicy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className={`transition-colors ${
                      isDarkSubpage ? "hover:text-white" : "hover:text-[#205C43]"
                    }`}
                  >
                    {t.home.footer.termsService}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/support"
                    className={`transition-colors ${
                      isDarkSubpage ? "hover:text-white" : "hover:text-[#205C43]"
                    }`}
                  >
                    {t.home.footer.supportContact}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/support#account-deletion"
                    className={`transition-colors ${
                      isDarkSubpage ? "hover:text-white" : "hover:text-[#205C43]"
                    }`}
                  >
                    {t.home.footer.accountDeletion}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/reviewer"
                    className={`transition-colors font-mono text-[10px] ${
                      isDarkSubpage ? "text-white/60 hover:text-white" : "text-[#205C43] hover:underline"
                    }`}
                  >
                    {isHindi ? "ऐप रिव्यूअर एक्सेस →" : "App Reviewer Access →"}
                  </Link>
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
              {isHindi ? "विधिक प्रकटीकरण: " : "Regulatory Disclosure: "}
            </strong>
            {t.home.footer.disclaimerNotice}
          </p>
        </div>

        {/* Bottom Bar */}
        <div
          className={`pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] ${
            isDarkSubpage ? "text-white/40" : "text-[#69736D]"
          }`}
        >
          <p>{t.home.footer.copyright}</p>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] text-[#205C43] flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#205C43] animate-pulse" />
              {isHindi ? "राष्ट्रीय क्षेत्राधिकार सक्रिय · सर्वोच्च न्यायालय व सभी उच्च न्यायालय" : "National Jurisdiction Active · Supreme Court & State High Courts"}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
