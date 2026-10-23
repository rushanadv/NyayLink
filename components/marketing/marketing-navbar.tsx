"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, User, Briefcase, Sparkles, Languages } from "lucide-react";
import { useSmoothScroll } from "./smooth-scroll-provider";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { NyayLinkLogo } from "@/components/ui/nyaylink-logo";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useLanguage } from "@/lib/i18n/context";

export function MarketingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [entryDropdownOpen, setEntryDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { scrollTo } = useSmoothScroll();
  const pathname = usePathname();
  const { t, isHindi } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setEntryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    if (typeof window !== "undefined" && window.location.pathname !== "/") {
      window.location.href = `/#${id}`;
      return;
    }
    scrollTo(`#${id}`, { offset: -80 });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-[#D5E5D9] shadow-xs py-3.5"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo & Wordmark with Official Lady Justice Emblem */}
        <NyayLinkLogo size="sm" />

        {/* Middle: Editorial Section Navigation */}
        <nav
          className="hidden md:flex items-center gap-7 text-xs font-medium tracking-wide text-[#69736D]"
          aria-label="Marketing Navigation"
        >
          <button
            onClick={() => handleNavClick("how-it-works")}
            className="transition-colors focus-visible:outline-none hover:text-[#202824]"
          >
            {t.nav.howItWorks}
          </button>
          <button
            onClick={() => handleNavClick("for-clients")}
            className="transition-colors focus-visible:outline-none hover:text-[#202824]"
          >
            {isHindi ? "मुवक्किलों के लिए" : "For clients"}
          </button>
          <button
            onClick={() => handleNavClick("for-advocates")}
            className="transition-colors focus-visible:outline-none hover:text-[#202824]"
          >
            {t.nav.forLawyers}
          </button>
          <button
            onClick={() => handleNavClick("trust")}
            className="transition-colors focus-visible:outline-none hover:text-[#202824]"
          >
            {isHindi ? "विश्वास व आचार संहिता" : "Trust & Ethics"}
          </button>
          <Link
            href="/lawyers"
            className={`transition-colors focus-visible:outline-none ${
              pathname === "/lawyers"
                ? "text-[#205C43] font-semibold"
                : "hover:text-[#202824]"
            }`}
          >
            {t.nav.findAdvocates}
          </Link>
          <Link
            href="/intake"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              pathname?.startsWith("/intake")
                ? "bg-[#EAF3ED] text-[#205C43] font-semibold border border-[#D5E5D9]"
                : "text-[#205C43] font-semibold hover:bg-[#EAF3ED]/70"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#205C43]" />
            <span>{t.nav.aiIntake}</span>
          </Link>
        </nav>

        {/* Right Action Controls: Language Switcher, Sign In & Account Type Selector */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Global Compact Language Switcher */}
          <LanguageSwitcher variant="compact" />

          <Link
            href="/auth/login"
            className="text-xs px-3 py-2 font-medium transition-colors text-[#69736D] hover:text-[#202824]"
          >
            {t.nav.signIn}
          </Link>

          {/* Account Type Selection Gateway Dropdown / Onboarding */}
          <div className="relative" ref={dropdownRef}>
            <MagneticWrapper maxDisplacement={4}>
              <button
                onClick={() => setEntryDropdownOpen(!entryDropdownOpen)}
                className="px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 shadow-xs bg-[#205C43] hover:bg-[#174530] text-white"
                aria-expanded={entryDropdownOpen}
                aria-haspopup="true"
              >
                <span>{t.nav.getStarted}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    entryDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </MagneticWrapper>

            {entryDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border p-2 shadow-xl transition-all z-50 bg-white border-[#D5E5D9] text-[#202824] shadow-lg shadow-[#202824]/8">
                {/* Step 1 Language First Onboarding Entry */}
                <Link
                  href="/onboarding"
                  onClick={() => setEntryDropdownOpen(false)}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#EAF3ED]/80 hover:bg-[#EAF3ED] border border-[#205C43]/20 text-[#205C43] transition-colors mb-2"
                >
                  <Languages className="w-4 h-4 shrink-0 text-[#205C43]" />
                  <div className="text-left">
                    <span className="text-xs font-semibold block">
                      {isHindi ? "शुरुआती ऑनबोर्डिंग" : "First-Time Onboarding"}
                    </span>
                    <span className="text-[11px] text-[#69736D] block leading-snug">
                      {isHindi ? "चरण 1: भाषा चुनें • चरण 2: भूमिका चुनें" : "Step 1: Choose Language • Step 2: Choose Role"}
                    </span>
                  </div>
                </Link>

                <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-[#205C43] font-semibold border-b border-[#D5E5D9] mb-1">
                  {isHindi ? "सीधे पोर्टल में जाएं" : "Or Direct Gateway"}
                </div>
                <Link
                  href="/auth/login?intent=client"
                  onClick={() => setEntryDropdownOpen(false)}
                  className="flex items-start gap-3 p-2.5 rounded-lg transition-colors group hover:bg-[#EAF3ED]/60"
                >
                  <div className="w-7 h-7 rounded-md bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center shrink-0 mt-0.5 text-[#205C43]">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold block group-hover:text-[#205C43] transition-colors">
                      {isHindi ? "मुवक्किल पोर्टल (Client)" : "I Need Legal Help"}
                    </span>
                    <span className="text-[11px] text-[#69736D] block mt-0.5 leading-snug">
                      {isHindi ? "परामर्श व केस ब्रीफ" : "Intake brief & verified lawyer consultation"}
                    </span>
                  </div>
                </Link>

                <Link
                  href="/auth/sign-up?intent=lawyer"
                  onClick={() => setEntryDropdownOpen(false)}
                  className="flex items-start gap-3 p-2.5 rounded-lg transition-colors group hover:bg-[#EAF3ED]/60"
                >
                  <div className="w-7 h-7 rounded-md bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center shrink-0 mt-0.5 text-[#174530]">
                    <Briefcase className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold block group-hover:text-[#174530] transition-colors">
                      {isHindi ? "अधिवक्ता पोर्टल (Advocate)" : "Join as an Advocate"}
                    </span>
                    <span className="text-[11px] text-[#69736D] block mt-0.5 leading-snug">
                      {isHindi ? "प्रैक्टिस इंफ्रास्ट्रक्चर व कॉज लिस्ट" : "Register practice & complete professional profile"}
                    </span>
                  </div>
                </Link>

                <div className="my-1 border-t border-[#D5E5D9]" />

                <Link
                  href="/intake"
                  onClick={() => setEntryDropdownOpen(false)}
                  className="flex items-start gap-3 p-2.5 rounded-lg transition-colors group hover:bg-[#EAF3ED]/60"
                >
                  <div className="w-7 h-7 rounded-md bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center shrink-0 mt-0.5 text-[#205C43]">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold block group-hover:text-[#205C43] transition-colors">
                      {t.nav.aiIntake}
                    </span>
                    <span className="text-[11px] text-[#69736D] block mt-0.5 leading-snug">
                      {isHindi ? "सरल कानूनी सलाह व अधिकार" : "Plain-language statutory remedies & questions"}
                    </span>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSwitcher variant="compact" />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#205C43] text-[#202824]/80 hover:text-[#202824]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-4 pb-6 border-b space-y-4 bg-white/95 backdrop-blur-xl border-[#D5E5D9] text-[#202824]">
          <nav className="flex flex-col space-y-3 text-sm">
            <button
              onClick={() => handleNavClick("how-it-works")}
              className="text-left py-1 hover:text-[#205C43]"
            >
              {t.nav.howItWorks}
            </button>
            <button
              onClick={() => handleNavClick("for-clients")}
              className="text-left py-1 hover:text-[#205C43]"
            >
              {isHindi ? "मुवक्किलों के लिए" : "For clients"}
            </button>
            <button
              onClick={() => handleNavClick("for-advocates")}
              className="text-left py-1 hover:text-[#205C43]"
            >
              {t.nav.forLawyers}
            </button>
            <button
              onClick={() => handleNavClick("trust")}
              className="text-left py-1 hover:text-[#205C43]"
            >
              {isHindi ? "विश्वास व आचार संहिता" : "Trust & Ethics"}
            </button>
            <Link
              href="/lawyers"
              onClick={() => setMobileMenuOpen(false)}
              className="text-left py-1 hover:text-[#205C43]"
            >
              {t.nav.findAdvocates}
            </Link>
            <Link
              href="/intake"
              onClick={() => setMobileMenuOpen(false)}
              className="text-left py-1.5 font-semibold text-[#205C43] flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#205C43]" />
              <span>{t.nav.aiIntake}</span>
            </Link>
          </nav>

          <div className="pt-3 border-t flex flex-col gap-2.5 border-[#D5E5D9]">
            <Link
              href="/onboarding"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2.5 text-xs font-semibold rounded-lg bg-[#205C43] text-white hover:bg-[#174530]"
            >
              {isHindi ? "ऑनबोर्डिंग शुरू करें (भाषा व भूमिका)" : "Start Onboarding (Language & Role)"}
            </Link>

            <Link
              href="/auth/login"
              className="text-center py-2 text-xs font-medium rounded-lg border border-[#D5E5D9] bg-white text-[#202824] hover:bg-[#EAF3ED]"
            >
              {t.nav.signIn}
            </Link>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="/auth/login?intent=client"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-lg border border-[#D5E5D9] bg-white text-[#205C43] font-semibold text-xs hover:bg-[#EAF3ED]"
              >
                {isHindi ? "मुवक्किल" : "Need Legal Help"}
              </Link>
              <Link
                href="/auth/sign-up?intent=lawyer"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-lg font-semibold text-xs border border-[#D5E5D9] bg-white text-[#174530] hover:bg-[#EAF3ED]"
              >
                {isHindi ? "अधिवक्ता" : "Join as Advocate"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
