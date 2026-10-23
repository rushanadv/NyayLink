"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Search,
  CheckCircle2,
  MapPin,
  Clock,
  Languages as LanguagesIcon,
  X,
  ArrowRight,
  Scale,
  ShieldCheck,
  ChevronDown,
  AlertCircle,
  Users,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";

export interface PublicLawyer {
  id: string;
  professional_name: string;
  bio: string | null;
  practice_areas: string[];
  experience_years: number;
  city: string;
  state: string;
  languages: string[];
  created_at?: string;
  verification_status?: "approved" | "pending" | "changes_requested" | "rejected" | string;
  is_published?: boolean;
}

interface LawyerDirectoryClientProps {
  initialLawyers: PublicLawyer[];
  isAuthenticated: boolean;
  loadWarning?: string;
  directoryState?: "live" | "empty" | "error" | "dev_demo";
  errorMessage?: string;
}

// Helper to get initials from professional name (e.g. "Adv. Rajesh Sharma" -> "RS")
function getInitials(name: string): string {
  const clean = name.replace(/^(Adv\.|Dr\.|Mr\.|Ms\.|Mrs\.)\s*/i, "").trim();
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase() || "AD";
}

export function LawyerDirectoryClient({
  initialLawyers,
  isAuthenticated,
  loadWarning,
  directoryState = "live",
  errorMessage,
}: LawyerDirectoryClientProps) {
  const shouldReduceMotion = useReducedMotion();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPracticeArea, setSelectedPracticeArea] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"exp-desc" | "exp-asc" | "name-asc">("exp-desc");

  // Extract all distinct filter options dynamically from data
  const practiceAreasList = useMemo(() => {
    const set = new Set<string>();
    initialLawyers.forEach((l) => {
      l.practice_areas?.forEach((pa) => set.add(pa));
    });
    return Array.from(set).sort();
  }, [initialLawyers]);

  const citiesList = useMemo(() => {
    const set = new Set<string>();
    initialLawyers.forEach((l) => {
      if (l.city) set.add(l.city);
    });
    return Array.from(set).sort();
  }, [initialLawyers]);

  const languagesList = useMemo(() => {
    const set = new Set<string>();
    initialLawyers.forEach((l) => {
      l.languages?.forEach((lang) => set.add(lang));
    });
    return Array.from(set).sort();
  }, [initialLawyers]);

  // Client-side instant filtering
  const filteredLawyers = useMemo(() => {
    return initialLawyers
      .filter((lawyer) => {
        // 1. Text Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const nameMatch = lawyer.professional_name.toLowerCase().includes(q);
          const bioMatch = lawyer.bio?.toLowerCase().includes(q) ?? false;
          const cityMatch = lawyer.city.toLowerCase().includes(q);
          const stateMatch = lawyer.state.toLowerCase().includes(q);
          const paMatch = lawyer.practice_areas.some((pa) =>
            pa.toLowerCase().includes(q)
          );
          const langMatch = lawyer.languages.some((lang) =>
            lang.toLowerCase().includes(q)
          );

          if (!nameMatch && !bioMatch && !cityMatch && !stateMatch && !paMatch && !langMatch) {
            return false;
          }
        }

        // 2. Practice Area filter
        if (selectedPracticeArea !== "all") {
          if (!lawyer.practice_areas.includes(selectedPracticeArea)) {
            return false;
          }
        }

        // 3. City filter
        if (selectedCity !== "all") {
          if (lawyer.city !== selectedCity) {
            return false;
          }
        }

        // 4. Language filter
        if (selectedLanguage !== "all") {
          if (!lawyer.languages.includes(selectedLanguage)) {
            return false;
          }
        }

        // 5. Verification Status filter
        if (selectedStatus !== "all") {
          const status = lawyer.verification_status || "approved";
          if (status !== selectedStatus) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "exp-desc") {
          return b.experience_years - a.experience_years;
        }
        if (sortBy === "exp-asc") {
          return a.experience_years - b.experience_years;
        }
        if (sortBy === "name-asc") {
          return a.professional_name.localeCompare(b.professional_name);
        }
        return 0;
      });
  }, [
    initialLawyers,
    searchQuery,
    selectedPracticeArea,
    selectedCity,
    selectedLanguage,
    selectedStatus,
    sortBy,
  ]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedPracticeArea !== "all" ||
    selectedCity !== "all" ||
    selectedLanguage !== "all" ||
    selectedStatus !== "all";

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedPracticeArea("all");
    setSelectedCity("all");
    setSelectedLanguage("all");
    setSelectedStatus("all");
    setSortBy("exp-desc");
  };

  const consultationHref = isAuthenticated
    ? "/dashboard"
    : "/auth/login?intent=client&next=/lawyers";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
      {/* Page Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#EAF3ED] border border-[#D5E5D9] text-xs font-mono font-semibold text-[#205C43]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#205C43] animate-pulse" />
          <span>VERIFIED ADVOCATE DIRECTORY</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#202824] tracking-tight leading-[1.15] text-balance">
          Find Verified Bar Council Advocates
        </h1>
        <p className="text-sm sm:text-base text-[#69736D] leading-relaxed">
          Search independent practitioners across Supreme Court, High Courts, and
          District Tribunals. All profiles feature authenticated Bar Council of
          India enrollment records, upfront flat consultation fees, and zero
          referral commission.
        </p>

        {/* Badges / Guarantees Row */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs text-[#69736D]">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#D5E5D9] shadow-xs">
            <Users className="w-3.5 h-3.5 text-[#205C43]" />
            <span className="text-[#202824] font-medium">
              {initialLawyers.length > 0
                ? `${initialLawyers.length} Enrolled Advocates`
                : "National Bar Roll"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#D5E5D9] shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#205C43]" />
            <span className="text-[#202824] font-medium">BCI Credentials Validated</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#D5E5D9] shadow-xs">
            <Scale className="w-3.5 h-3.5 text-[#205C43]" />
            <span className="text-[#202824] font-medium">Section 36 Compliant</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#D5E5D9] shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#205C43]" />
            <span className="text-[#202824] font-medium">Milestone Escrow Protection</span>
          </div>
        </div>

        {/* Development Demo Notice */}
        {directoryState === "dev_demo" && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 mt-4 shadow-xs">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-amber-950 font-mono">Development Demo Mode Active</p>
              <p className="text-amber-800 leading-relaxed">
                Displaying 6 local demonstration advocate profiles for development and UI testing.
                These are simulated profiles, NOT live verified advocates.
              </p>
            </div>
          </div>
        )}

        {/* Diagnostic Notice */}
        {loadWarning && directoryState !== "dev_demo" && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 mt-4 shadow-xs">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-amber-950 font-mono">Directory Notice</p>
              <p className="text-amber-800 leading-relaxed">{loadWarning}</p>
            </div>
          </div>
        )}
        {/* Unauthenticated Client Access Prompt */}
        {!isAuthenticated && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#EAF3ED] border border-[#D5E5D9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs mt-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#D5E5D9] flex items-center justify-center text-[#205C43] shrink-0 mt-0.5 shadow-2xs">
                <ShieldCheck className="w-5 h-5 text-[#205C43]" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs sm:text-sm font-semibold text-[#202824]">
                  Registered Client Directory Access
                </p>
                <p className="text-xs text-[#69736D] leading-relaxed">
                  Sign in as a client to discover newly onboarded advocates practicing before your local courts while their Bar Council verification completes.
                </p>
              </div>
            </div>
            <Link
              href="/auth/login?intent=client&next=/lawyers"
              className="whitespace-nowrap px-4 py-2 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white text-xs font-semibold shadow-xs transition-all shrink-0"
            >
              Sign In to Browse All Advocates
            </Link>
          </div>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white/95 border border-[#D5E5D9] backdrop-blur-md shadow-xs space-y-4">
        {/* Main Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#205C43]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by advocate name, legal issue (e.g. RERA, Bail, NCLT), city, or language..."
            className="w-full h-12 pl-11 pr-10 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] focus:border-[#205C43] focus:ring-2 focus:ring-[#205C43]/15 text-sm text-[#202824] placeholder-[#69736D]/60 transition-all outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#69736D] hover:text-[#202824]"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdowns Row (5 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Practice Area Filter */}
          <div className="relative">
            <label className="block text-[11px] font-mono text-[#69736D] uppercase tracking-wider mb-1 font-semibold">
              Practice Area
            </label>
            <select
              value={selectedPracticeArea}
              onChange={(e) => setSelectedPracticeArea(e.target.value)}
              className="w-full h-10 px-3 pr-8 rounded-lg bg-[#F8FAF9] border border-[#D5E5D9] text-xs text-[#202824] focus:border-[#205C43] outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Practice Areas ({practiceAreasList.length})</option>
              {practiceAreasList.map((pa) => (
                <option key={pa} value={pa}>
                  {pa}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-[34px] w-3.5 h-3.5 text-[#69736D] pointer-events-none" />
          </div>

          {/* City / State Filter */}
          <div className="relative">
            <label className="block text-[11px] font-mono text-[#69736D] uppercase tracking-wider mb-1 font-semibold">
              Court Jurisdiction / City
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full h-10 px-3 pr-8 rounded-lg bg-[#F8FAF9] border border-[#D5E5D9] text-xs text-[#202824] focus:border-[#205C43] outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Locations ({citiesList.length})</option>
              {citiesList.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-[34px] w-3.5 h-3.5 text-[#69736D] pointer-events-none" />
          </div>

          {/* Language Filter */}
          <div className="relative">
            <label className="block text-[11px] font-mono text-[#69736D] uppercase tracking-wider mb-1 font-semibold">
              Consultation Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full h-10 px-3 pr-8 rounded-lg bg-[#F8FAF9] border border-[#D5E5D9] text-xs text-[#202824] focus:border-[#205C43] outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Languages ({languagesList.length})</option>
              {languagesList.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-[34px] w-3.5 h-3.5 text-[#69736D] pointer-events-none" />
          </div>

          {/* Verification Status Filter */}
          <div className="relative">
            <label className="block text-[11px] font-mono text-[#69736D] uppercase tracking-wider mb-1 font-semibold">
              Verification Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-10 px-3 pr-8 rounded-lg bg-[#F8FAF9] border border-[#D5E5D9] text-xs text-[#202824] focus:border-[#205C43] outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Advocates</option>
              <option value="approved">BCI Verified Only</option>
              <option value="pending">Newly Joined (Pending)</option>
            </select>
            <ChevronDown className="absolute right-3 top-[34px] w-3.5 h-3.5 text-[#69736D] pointer-events-none" />
          </div>

          {/* Sort By Filter */}
          <div className="relative">
            <label className="block text-[11px] font-mono text-[#69736D] uppercase tracking-wider mb-1 font-semibold">
              Sort Results
            </label>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "exp-desc" | "exp-asc" | "name-asc")
              }
              className="w-full h-10 px-3 pr-8 rounded-lg bg-[#F8FAF9] border border-[#D5E5D9] text-xs text-[#202824] focus:border-[#205C43] outline-none appearance-none cursor-pointer"
            >
              <option value="exp-desc">Most Experienced (Years)</option>
              <option value="exp-asc">Earliest Call / Rising Counsel</option>
              <option value="name-asc">Alphabetical (A to Z)</option>
            </select>
            <ChevronDown className="absolute right-3 top-[34px] w-3.5 h-3.5 text-[#69736D] pointer-events-none" />
          </div>
        </div>

        {/* Results Bar & Active Filter Chips */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-[#D5E5D9]">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-[#69736D]">
              Showing <strong className="text-[#202824]">{filteredLawyers.length}</strong> of{" "}
              {initialLawyers.length} verified advocates
            </span>
            {hasActiveFilters && (
              <span className="text-[10px] font-mono text-[#205C43] bg-[#EAF3ED] px-2 py-0.5 rounded border border-[#D5E5D9] font-semibold">
                Filtered
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-[#205C43] hover:underline flex items-center gap-1 font-semibold"
            >
              <X className="w-3.5 h-3.5" />
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Distinct States: 1. Backend Error, 2. Database Empty, 3. Filtered Empty, 4. Results Grid */}
      {directoryState === "error" ? (
        /* State 3: Backend Failure */
        <div className="p-10 sm:p-14 rounded-2xl bg-white border border-rose-200 text-center space-y-4 max-w-xl mx-auto shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-serif text-[#202824] font-medium">
            Directory Service Temporarily Unavailable
          </h2>
          <p className="text-xs sm:text-sm text-[#69736D] leading-relaxed max-w-md mx-auto">
            {errorMessage ||
              "We are having trouble connecting to our Bar Council verification registry right now. Our technical team has been notified. You can retry the connection or start an AI Legal Intake session."}
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl bg-[#205C43] hover:bg-[#174530] text-xs font-semibold text-white transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retry Connection
            </button>
            <Link
              href="/intake"
              className="px-5 py-2.5 rounded-xl bg-[#EAF3ED] hover:bg-[#D5E5D9] text-xs font-semibold text-[#205C43] border border-[#D5E5D9] transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#205C43]" />
              Start AI Legal Intake
            </Link>
          </div>
        </div>
      ) : directoryState === "empty" || initialLawyers.length === 0 ? (
        /* State 2: Honest Database Empty State */
        <div className="p-10 sm:p-14 rounded-2xl bg-white border border-[#D5E5D9] text-center space-y-4 max-w-xl mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center text-[#205C43] mx-auto">
            <Scale className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-serif text-[#202824] font-medium">
            Advocate Directory Initializing
          </h2>
          <p className="text-xs sm:text-sm text-[#69736D] leading-relaxed max-w-md mx-auto">
            No advocate profiles are currently published on the live registry. As independent advocates complete Bar Council enrollment validation and grant publication consent under Rule 36, their verified profiles will appear here.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/intake"
              className="px-5 py-2.5 rounded-xl bg-[#205C43] hover:bg-[#174530] text-xs font-semibold text-white transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Start AI Legal Intake
            </Link>
            <Link
              href="/auth/sign-up?intent=lawyer"
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-[#EAF3ED] text-xs font-semibold text-[#202824] border border-[#D5E5D9] transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Users className="w-3.5 h-3.5 text-[#205C43]" />
              Enroll as an Advocate
            </Link>
          </div>
        </div>
      ) : filteredLawyers.length > 0 ? (
        /* State 1: Live Results Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLawyers.map((lawyer) => {
            const initials = getInitials(lawyer.professional_name);

            return (
              <motion.div
                key={lawyer.id}
                whileHover={shouldReduceMotion ? undefined : { scale: 1.018 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="relative p-6 rounded-2xl bg-white border border-[#D5E5D9] hover:border-[#205C43]/40 transition-all shadow-xs hover:shadow-md flex flex-col justify-between group overflow-hidden"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-full bg-[#EAF3ED] flex items-center justify-center font-serif text-sm font-semibold text-[#205C43] border border-[#D5E5D9] shrink-0 shadow-2xs">
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#202824] text-base group-hover:text-[#205C43] transition-colors leading-tight">
                          {lawyer.professional_name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          {lawyer.verification_status === "pending" ? (
                            <span
                              className="text-[10px] font-mono text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80 flex items-center gap-1 font-semibold"
                              title="Bar Council credentials submitted; registrar verification in progress"
                            >
                              <Clock className="w-3 h-3 text-amber-700" />
                              Newly Joined • Verification Pending
                            </span>
                          ) : (
                            <span
                              className="text-[10px] font-mono text-[#205C43] bg-[#EAF3ED] px-2 py-0.5 rounded-md border border-[#D5E5D9] flex items-center gap-1 font-semibold"
                              title="Bar Council of India credentials authenticated"
                            >
                              <CheckCircle2 className="w-3 h-3 text-[#205C43]" />
                              BCI Verified Advocate
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location & Experience Meta */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#D5E5D9] text-xs text-[#69736D]">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#205C43] shrink-0" />
                      <span className="truncate">{lawyer.city}, {lawyer.state}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#205C43] shrink-0" />
                      <span>{lawyer.experience_years} Years Experience</span>
                    </div>
                  </div>

                  {/* Bio */}
                  {lawyer.bio && (
                    <p className="text-xs text-[#69736D] leading-relaxed line-clamp-3 mt-3.5">
                      {lawyer.bio}
                    </p>
                  )}

                  {/* Practice Area Chips */}
                  <div className="mt-4 space-y-1.5">
                    <span className="text-[10px] font-mono text-[#69736D] uppercase tracking-wider block font-semibold">
                      Specializations
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {lawyer.practice_areas.map((pa) => (
                        <span
                          key={pa}
                          className="px-2.5 py-0.5 rounded-md bg-[#F8FAF9] text-[11px] font-medium text-[#202824] border border-[#D5E5D9]"
                        >
                          {pa}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Languages Spoken */}
                  <div className="mt-3.5 flex items-center gap-1.5 text-[11px] text-[#69736D]">
                    <LanguagesIcon className="w-3.5 h-3.5 text-[#205C43] shrink-0" />
                    <span className="truncate">
                      {lawyer.languages.join(", ")}
                    </span>
                  </div>

                  {/* Pending Verification Notice */}
                  {lawyer.verification_status === "pending" && (
                    <div className="mt-3.5 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900 leading-snug space-y-0.5">
                      <div className="font-semibold font-mono text-[10px] uppercase text-amber-950 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-700" />
                        <span>Verification Pending</span>
                      </div>
                      <p className="text-amber-800 text-[11px]">
                        Profile visible to registered clients. Direct consultation booking is enabled for preliminary chambers inquiry while Bar Council verification completes.
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Action */}
                <div className="pt-5 mt-5 border-t border-[#D5E5D9]">
                  <MagneticWrapper className="w-full" maxDisplacement={6}>
                    <Link
                      href={consultationHref}
                      className="w-full py-2.5 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#205C43] block text-center"
                    >
                      <span>
                        {lawyer.verification_status === "pending"
                          ? "Preliminary Inquiry"
                          : "Request Consultation"}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
                    </Link>
                  </MagneticWrapper>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Filter Empty State (when user filters match 0 results) */
        <div className="p-12 sm:p-16 rounded-2xl bg-white border border-[#D5E5D9] text-center space-y-4 max-w-xl mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center text-[#205C43] mx-auto">
            <Scale className="w-6 h-6 text-[#205C43]" />
          </div>
          <h2 className="text-xl font-serif text-[#202824] font-medium">
            No advocates match these filters
          </h2>
          <p className="text-xs sm:text-sm text-[#69736D] leading-relaxed max-w-md mx-auto">
            Try broadening your search keywords, switching practice areas, or
            clearing active filters to view all verified practitioners.
          </p>
          <div className="pt-2">
            <button
              onClick={clearAllFilters}
              className="px-5 py-2.5 rounded-xl bg-[#F8FAF9] hover:bg-[#EAF3ED] text-xs font-semibold text-[#202824] border border-[#D5E5D9] transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
