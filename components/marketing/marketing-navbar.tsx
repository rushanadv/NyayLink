"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale, Menu, X, ChevronDown, User, Briefcase } from "lucide-react";
import { useSmoothScroll } from "./smooth-scroll-provider";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";

export function MarketingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [entryDropdownOpen, setEntryDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { scrollTo } = useSmoothScroll();
  const pathname = usePathname();

  // Determine if this route should render the editorial light navbar (default: light theme on landing page and auth)
  const isDarkSubpage = pathname === "/lawyers" || pathname?.startsWith("/intake");

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
          ? isDarkSubpage
            ? "bg-[#090B10]/85 backdrop-blur-md border-b border-white/[0.08] shadow-xl py-3.5"
            : "bg-white/95 backdrop-blur-md border-b border-[#D5E5D9] shadow-xs py-3.5"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo & Wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#205C43] rounded-lg"
        >
          <div
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-transform group-hover:scale-105 ${
              isDarkSubpage
                ? "bg-white/[0.04] border-white/[0.1] text-white"
                : "bg-[#EAF3ED] border-[#D5E5D9] text-[#205C43] shadow-xs"
            }`}
          >
            <Scale className="w-4 h-4 text-[#205C43]" />
          </div>
          <span
            className={`font-serif text-lg font-medium tracking-tight flex items-center gap-1.5 ${
              isDarkSubpage ? "text-white" : "text-[#202824]"
            }`}
          >
            NyayLink
            <span className="w-1.5 h-1.5 rounded-full bg-[#205C43]" />
          </span>
        </Link>

        {/* Middle: Editorial Section Navigation */}
        <nav
          className={`hidden md:flex items-center gap-8 text-xs font-medium tracking-wide ${
            isDarkSubpage ? "text-[#A5A3B2]" : "text-[#69736D]"
          }`}
          aria-label="Marketing Navigation"
        >
          <button
            onClick={() => handleNavClick("how-it-works")}
            className={`transition-colors focus-visible:outline-none ${
              isDarkSubpage ? "hover:text-white" : "hover:text-[#202824]"
            }`}
          >
            How it works
          </button>
          <button
            onClick={() => handleNavClick("for-clients")}
            className={`transition-colors focus-visible:outline-none ${
              isDarkSubpage ? "hover:text-white" : "hover:text-[#202824]"
            }`}
          >
            For clients
          </button>
          <button
            onClick={() => handleNavClick("for-advocates")}
            className={`transition-colors focus-visible:outline-none ${
              isDarkSubpage ? "hover:text-white" : "hover:text-[#202824]"
            }`}
          >
            For advocates
          </button>
          <button
            onClick={() => handleNavClick("trust")}
            className={`transition-colors focus-visible:outline-none ${
              isDarkSubpage ? "hover:text-white" : "hover:text-[#202824]"
            }`}
          >
            Trust & Ethics
          </button>
        </nav>

        {/* Right Action Controls: Clear Sign In & Account Type Selector */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/auth/login"
            className={`text-xs px-3 py-2 font-medium transition-colors ${
              isDarkSubpage
                ? "text-white/80 hover:text-white"
                : "text-[#69736D] hover:text-[#202824]"
            }`}
          >
            Sign In
          </Link>

          {/* Account Type Selection Gateway Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <MagneticWrapper maxDisplacement={4}>
              <button
                onClick={() => setEntryDropdownOpen(!entryDropdownOpen)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 shadow-xs ${
                  isDarkSubpage
                    ? "bg-[#205C43] hover:bg-[#174530] text-white"
                    : "bg-[#205C43] hover:bg-[#174530] text-white"
                }`}
                aria-expanded={entryDropdownOpen}
                aria-haspopup="true"
              >
                <span>Get Started</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    entryDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </MagneticWrapper>

            {entryDropdownOpen && (
              <div
                className={`absolute right-0 mt-2 w-64 rounded-xl border p-2 shadow-xl transition-all z-50 ${
                  isDarkSubpage
                    ? "bg-[#0C0F17] border-white/[0.1] text-white"
                    : "bg-white border-[#D5E5D9] text-[#202824] shadow-lg shadow-[#202824]/8"
                }`}
              >
                <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#205C43] font-semibold border-b border-[#D5E5D9] mb-1">
                  Choose Account Type
                </div>
                <Link
                  href="/auth/login?intent=client"
                  onClick={() => setEntryDropdownOpen(false)}
                  className={`flex items-start gap-3 p-2.5 rounded-lg transition-colors group ${
                    isDarkSubpage
                      ? "hover:bg-white/[0.05]"
                      : "hover:bg-[#EAF3ED]/60"
                  }`}
                >
                  <div className="w-7 h-7 rounded-md bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center shrink-0 mt-0.5 text-[#205C43]">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold block group-hover:text-[#205C43] transition-colors">
                      I Need Legal Help
                    </span>
                    <span className="text-[11px] text-[#69736D] block mt-0.5 leading-snug">
                      Intake brief & verified lawyer consultation
                    </span>
                  </div>
                </Link>

                <Link
                  href="/auth/login?intent=lawyer"
                  onClick={() => setEntryDropdownOpen(false)}
                  className={`flex items-start gap-3 p-2.5 rounded-lg transition-colors group ${
                    isDarkSubpage
                      ? "hover:bg-white/[0.05]"
                      : "hover:bg-[#EAF3ED]/60"
                  }`}
                >
                  <div className="w-7 h-7 rounded-md bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center shrink-0 mt-0.5 text-[#174530]">
                    <Briefcase className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold block group-hover:text-[#174530] transition-colors">
                      I&apos;m an Advocate
                    </span>
                    <span className="text-[11px] text-[#69736D] block mt-0.5 leading-snug">
                      Chambers portal, cause lists & Vakalatnama
                    </span>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#205C43] ${
              isDarkSubpage
                ? "text-white/70 hover:text-white"
                : "text-[#202824]/80 hover:text-[#202824]"
            }`}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden px-4 pt-4 pb-6 border-b space-y-4 ${
            isDarkSubpage
              ? "bg-[#090B10]/95 backdrop-blur-xl border-white/[0.08]"
              : "bg-white/95 backdrop-blur-xl border-[#D5E5D9] text-[#202824]"
          }`}
        >
          <nav className="flex flex-col space-y-3 text-sm">
            <button
              onClick={() => handleNavClick("how-it-works")}
              className="text-left py-1 hover:text-[#205C43]"
            >
              How it works
            </button>
            <button
              onClick={() => handleNavClick("for-clients")}
              className="text-left py-1 hover:text-[#205C43]"
            >
              For clients
            </button>
            <button
              onClick={() => handleNavClick("for-advocates")}
              className="text-left py-1 hover:text-[#205C43]"
            >
              For advocates
            </button>
            <button
              onClick={() => handleNavClick("trust")}
              className="text-left py-1 hover:text-[#205C43]"
            >
              Trust & Ethics
            </button>
            <Link
              href="/lawyers"
              onClick={() => setMobileMenuOpen(false)}
              className="text-left py-1 hover:text-[#205C43]"
            >
              Lawyer Directory
            </Link>
          </nav>

          <div
            className={`pt-3 border-t flex flex-col gap-2.5 ${
              isDarkSubpage ? "border-white/[0.08]" : "border-[#D5E5D9]"
            }`}
          >
            <Link
              href="/auth/login"
              className={`text-center py-2 text-xs font-medium rounded-lg border ${
                isDarkSubpage
                  ? "border-white/[0.1] text-white/90 hover:bg-white/[0.04]"
                  : "border-[#D5E5D9] bg-white text-[#202824] hover:bg-[#EAF3ED]"
              }`}
            >
              Sign In
            </Link>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="/auth/login?intent=client"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-lg bg-[#205C43] hover:bg-[#174530] text-white font-semibold text-xs"
              >
                Need Legal Help
              </Link>
              <Link
                href="/auth/login?intent=lawyer"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-center py-2.5 rounded-lg font-semibold text-xs border ${
                  isDarkSubpage
                    ? "border-white/[0.2] text-white hover:bg-white/[0.05]"
                    : "border-[#D5E5D9] bg-white text-[#202824] hover:bg-[#EAF3ED]"
                }`}
              >
                Advocate Entry
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
