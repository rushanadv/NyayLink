"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Scale, ArrowRight, Menu, X, Sparkles } from "lucide-react";
import { useSmoothScroll } from "./smooth-scroll-provider";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";

export function MarketingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollTo } = useSmoothScroll();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
          ? "bg-[#090B10]/85 backdrop-blur-md border-b border-white/[0.06] shadow-xl shadow-black/40 py-3.5"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] rounded-lg"
        >
          <div className="w-8 h-8 rounded-lg bg-[#C5A059]/15 border border-[#C5A059]/30 flex items-center justify-center text-[#DFBE7E] group-hover:scale-105 transition-transform">
            <Scale className="w-4 h-4" />
          </div>
          <span className="font-serif text-lg font-medium tracking-tight text-white flex items-center gap-1.5">
            NyayaLink
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className="hidden md:flex items-center gap-7 text-xs text-[#A5A3B2] font-medium tracking-wide"
          aria-label="Marketing Navigation"
        >
          <button
            onClick={() => handleNavClick("problem")}
            className="hover:text-white transition-colors focus-visible:outline-none focus-visible:text-white"
          >
            The Challenge
          </button>
          <Link
            href="/lawyers"
            className="hover:text-white transition-colors focus-visible:outline-none focus-visible:text-white"
          >
            Lawyer Network
          </Link>
          <Link
            href="/intake"
            className="hover:text-white transition-colors focus-visible:outline-none focus-visible:text-white flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>AI Legal Intake</span>
          </Link>
          <button
            onClick={() => handleNavClick("lawyer-saas")}
            className="hover:text-white transition-colors focus-visible:outline-none focus-visible:text-white"
          >
            For Advocates
          </button>
          <button
            onClick={() => handleNavClick("trust")}
            className="hover:text-white transition-colors focus-visible:outline-none focus-visible:text-white"
          >
            Compliance
          </button>
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-xs text-white/80 hover:text-white px-3.5 py-2 font-medium transition-colors"
          >
            Sign In
          </Link>
          <MagneticWrapper maxDisplacement={6}>
            <Link
              href="/lawyers"
              className="px-4 py-2 rounded-lg bg-[#C5A059] hover:bg-[#DFBE7E] text-[#090B10] font-semibold text-xs transition-colors shadow-md shadow-[#C5A059]/15 flex items-center gap-1.5 block"
            >
              <span>Consult an Advocate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </MagneticWrapper>
        </div>

        {/* Mobile menu hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white/70 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059] rounded-lg"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-4 pb-6 bg-[#090B10]/95 backdrop-blur-xl border-b border-white/10 space-y-4">
          <nav className="flex flex-col space-y-3 text-sm text-[#A5A3B2]">
            <button
              onClick={() => handleNavClick("problem")}
              className="text-left py-1 hover:text-white"
            >
              The Challenge
            </button>
            <Link
              href="/lawyers"
              onClick={() => setMobileMenuOpen(false)}
              className="text-left py-1 hover:text-white"
            >
              Lawyer Network
            </Link>
            <Link
              href="/intake"
              onClick={() => setMobileMenuOpen(false)}
              className="text-left py-1 hover:text-white flex items-center gap-2 text-[#DFBE7E]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>AI Legal Intake</span>
            </Link>
            <button
              onClick={() => handleNavClick("lawyer-saas")}
              className="text-left py-1 hover:text-white"
            >
              For Advocates
            </button>
            <button
              onClick={() => handleNavClick("trust")}
              className="text-left py-1 hover:text-white"
            >
              Compliance
            </button>
          </nav>
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <Link
              href="/auth/login"
              className="text-center py-2 text-white/80 hover:text-white text-xs"
            >
              Sign In
            </Link>
            <Link
              href="/lawyers"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2.5 rounded-lg bg-[#C5A059] text-[#090B10] font-semibold text-xs"
            >
              Consult an Advocate
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
