"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Users,
  RotateCcw,
  Sparkles,
  Video,
} from "lucide-react";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import {
  matchesPracticeArea,
  getCanonicalFilterOptions,
  resolvePracticeAreaCategory,
} from "@/lib/taxonomy/practice-areas";

export interface PublicLawyer {
  id: string;
  professional_name: string;
  bio: string | null;
  practice_areas: string[];
  experience_years: number;
  city: string;
  state: string;
  languages: string[];
  courts_of_practice?: string[];
  consultation_modes?: string[];
  consultation_fee?: number | null;
  created_at?: string;
  verification_status?: "approved" | "pending" | "changes_requested" | "rejected" | string;
  verified_at?: string | null;
  submitted_at?: string | null;
  is_published?: boolean;
}

interface LawyerDirectoryClientProps {
  initialLawyers: PublicLawyer[];
  underReviewLawyers?: PublicLawyer[];
  isAuthenticated: boolean;
  loadWarning?: string;
  directoryState?: "live" | "empty" | "error" | "dev_demo";
  errorMessage?: string;
  initialPracticeArea?: string;
}

// Helper to get initials from professional name
function getInitials(name: string): string {
  const clean = name.replace(/^(fake\s+)?(Adv\.|Dr\.|Mr\.|Ms\.|Mrs\.)\s*/i, "").trim();
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase() || "AD";
}

const ITEMS_PER_PAGE = 9;

export function LawyerDirectoryClient({
  initialLawyers,
  underReviewLawyers = [],
  isAuthenticated,
  loadWarning,
  directoryState = "live",
  errorMessage,
  initialPracticeArea,
}: LawyerDirectoryClientProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeSurface, setActiveSurface] = useState<"verified" | "under_review">("verified");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPracticeArea, setSelectedPracticeArea] = useState<string>(() => {
    if (initialPracticeArea) return initialPracticeArea;
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const pa = sp.get("practiceArea");
      if (pa) return pa;
    }
    return "all";
  });
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [selectedExperience, setSelectedExperience] = useState<string>("all");
  const [selectedMode, setSelectedMode] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"exp-desc" | "exp-asc" | "name-asc" | "fee-asc">("exp-desc");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Sync initialPracticeArea if prop changes
  useEffect(() => {
    if (initialPracticeArea) {
      setSelectedPracticeArea(initialPracticeArea);
      setCurrentPage(1);
    }
  }, [initialPracticeArea]);

  // Reset to page 1 whenever any filter or active surface changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    activeSurface,
    searchQuery,
    selectedPracticeArea,
    selectedCity,
    selectedLanguage,
    selectedExperience,
    selectedMode,
    sortBy,
  ]);

  // Active dataset strictly selected by surface
  const currentDataset = useMemo(() => {
    return activeSurface === "verified" ? initialLawyers : underReviewLawyers;
  }, [activeSurface, initialLawyers, underReviewLawyers]);

  // Extract all distinct filter options dynamically from current dataset
  const practiceAreaOptions = useMemo(() => {
    const rawOptions = getCanonicalFilterOptions(false);
    const set = new Set<string>();
    currentDataset.forEach((l) => {
      l.practice_areas?.forEach((pa) => {
        const cat = resolvePracticeAreaCategory(pa);
        if (!cat) set.add(pa);
      });
    });
    const extra = Array.from(set).map((val) => ({ value: val, label: val }));
    return [...rawOptions, ...extra];
  }, [currentDataset]);

  const citiesList = useMemo(() => {
    const set = new Set<string>();
    currentDataset.forEach((l) => {
      if (l.city) set.add(l.city);
    });
    return Array.from(set).sort();
  }, [currentDataset]);

  const languagesList = useMemo(() => {
    const set = new Set<string>();
    currentDataset.forEach((l) => {
      l.languages?.forEach((lang) => set.add(lang));
    });
    return Array.from(set).sort();
  }, [currentDataset]);

  // Client-side instant filtering with canonical taxonomy engine
  const filteredLawyers = useMemo(() => {
    return currentDataset
      .filter((lawyer) => {
        // Exclude synthetic/demo test accounts from public discovery
        const lowerName = lawyer.professional_name.toLowerCase();
        if (lowerName.includes("demo") || lowerName.includes("synthetic") || lowerName.includes("reviewer test")) {
          return false;
        }

        // 1. Text Search query across multiple fields
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const nameMatch = lawyer.professional_name.toLowerCase().includes(q);
          const bioMatch = lawyer.bio?.toLowerCase().includes(q) ?? false;
          const cityMatch = lawyer.city.toLowerCase().includes(q);
          const stateMatch = lawyer.state.toLowerCase().includes(q);
          const paMatch = lawyer.practice_areas.some((pa) =>
            pa.toLowerCase().includes(q) || matchesPracticeArea([pa], q)
          );
          const langMatch = lawyer.languages.some((lang) =>
            lang.toLowerCase().includes(q)
          );
          const courtsMatch = lawyer.courts_of_practice?.some((c) =>
            c.toLowerCase().includes(q)
          ) ?? false;

          if (!nameMatch && !bioMatch && !cityMatch && !stateMatch && !paMatch && !langMatch && !courtsMatch) {
            return false;
          }
        }

        // 2. Canonical Practice Area filter
        if (selectedPracticeArea !== "all") {
          if (!matchesPracticeArea(lawyer.practice_areas, selectedPracticeArea)) {
            return false;
          }
        }

        // 3. Experience filter
        if (selectedExperience !== "all") {
          const exp = lawyer.experience_years;
          if (selectedExperience === "15+" && exp < 15) return false;
          if (selectedExperience === "10-14" && (exp < 10 || exp > 14)) return false;
          if (selectedExperience === "5-9" && (exp < 5 || exp > 9)) return false;
          if (selectedExperience === "under-5" && exp >= 5) return false;
        }

        // 4. Consultation Mode filter
        if (selectedMode !== "all") {
          const modes = lawyer.consultation_modes || ["Online Video Consultation", "In-Chambers Consultation"];
          if (selectedMode === "online") {
            const hasOnline = modes.some((m) =>
              m.toLowerCase().includes("online") || m.toLowerCase().includes("video")
            );
            if (!hasOnline) return false;
          }
          if (selectedMode === "in_person") {
            const hasInPerson = modes.some((m) =>
              m.toLowerCase().includes("chamber") || m.toLowerCase().includes("person")
            );
            if (!hasInPerson) return false;
          }
        }

        // 5. City filter
        if (selectedCity !== "all") {
          if (lawyer.city !== selectedCity) {
            return false;
          }
        }

        // 6. Language filter
        if (selectedLanguage !== "all") {
          if (!lawyer.languages.includes(selectedLanguage)) {
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
        if (sortBy === "fee-asc") {
          const feeA = a.consultation_fee ?? 1500;
          const feeB = b.consultation_fee ?? 1500;
          return feeA - feeB;
        }
        return 0;
      });
  }, [
    currentDataset,
    searchQuery,
    selectedPracticeArea,
    selectedCity,
    selectedLanguage,
    selectedExperience,
    selectedMode,
    sortBy,
  ]);

  // Pagination calculation
  const totalItems = filteredLawyers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLawyers = useMemo(() => {
    return filteredLawyers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredLawyers, startIndex]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedPracticeArea !== "all" ||
    selectedCity !== "all" ||
    selectedLanguage !== "all" ||
    selectedExperience !== "all" ||
    selectedMode !== "all";

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedPracticeArea("all");
    setSelectedCity("all");
    setSelectedLanguage("all");
    setSelectedExperience("all");
    setSelectedMode("all");
    setSortBy("exp-desc");
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
      {/* Page Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#EAF3ED] border border-[#D5E5D9] text-xs font-mono font-semibold text-[#205C43]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#205C43] animate-pulse" />
          <span>ADVOCATE DIRECTORY & REGISTER</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#202824] tracking-tight leading-[1.15] text-balance">
          {activeSurface === "verified"
            ? "Find Bar Council Enrolled Advocates"
            : "Advocate Profiles Under Review"}
        </h1>
        <p className="text-sm sm:text-base text-[#69736D] leading-relaxed">
          {activeSurface === "verified"
            ? "Search independent legal practitioners across Supreme Court, High Courts, and District Tribunals. Profiles in this register feature authenticated State Bar Council enrollment credentials, transparent consultation fees, and direct client engagement."
            : "Review practitioners who have recently onboarded with publication consent and submitted their State Bar Council enrolment credentials for administrative verification. Paid consultations are strictly disabled for profiles under review."}
        </p>

        {/* Badges / Guarantees Row */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs text-[#69736D]">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#D5E5D9] shadow-xs">
            <Users className="w-3.5 h-3.5 text-[#205C43]" />
            <span className="text-[#202824] font-medium">
              {activeSurface === "verified"
                ? `${initialLawyers.length} Verified Advocates`
                : `${underReviewLawyers.length} Profiles Under Review`}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#D5E5D9] shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#205C43]" />
            <span className="text-[#202824] font-medium">
              {activeSurface === "verified"
                ? "Independent Enrolment Verification"
                : "Verification In Progress"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#D5E5D9] shadow-xs">
            <Scale className="w-3.5 h-3.5 text-[#205C43]" />
            <span className="text-[#202824] font-medium">BCI Rule 36 Compliant</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#D5E5D9] shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#205C43]" />
            <span className="text-[#202824] font-medium">
              {activeSurface === "verified"
                ? "Transparent Retainer Protection"
                : "Non-Binding Inquiries Only"}
            </span>
          </div>
        </div>

        {/* Two Distinct Directory Surfaces Tabs */}
        <div className="pt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setActiveSurface("verified");
              setCurrentPage(1);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeSurface === "verified"
                ? "bg-[#205C43] text-white shadow-xs"
                : "bg-white text-[#69736D] border border-[#D5E5D9] hover:bg-[#F8FAF9]"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Verified Advocates</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeSurface === "verified"
                  ? "bg-white/20 text-white"
                  : "bg-[#EAF3ED] text-[#205C43]"
              }`}
            >
              {initialLawyers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSurface("under_review");
              setCurrentPage(1);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeSurface === "under_review"
                ? "bg-amber-800 text-white shadow-xs"
                : "bg-white text-[#69736D] border border-[#D5E5D9] hover:bg-[#F8FAF9]"
            }`}
          >
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Profiles Under Review</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
              Not yet verified
            </span>
            {underReviewLawyers.length > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  activeSurface === "under_review"
                    ? "bg-white/20 text-white"
                    : "bg-amber-50 text-amber-800 border border-amber-200"
                }`}
              >
                {underReviewLawyers.length}
              </span>
            )}
          </button>
        </div>

        {/* Restrained Disclosure Banner for Profiles Under Review */}
        {activeSurface === "under_review" && (
          <div className="p-4 rounded-xl bg-[#FFFDF7] border border-[#E8DCC0] text-xs text-[#7A5E1A] flex items-start gap-3 shadow-2xs mt-2">
            <AlertCircle className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#202824]">Profiles Under Review</span>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 font-bold">
                  Not yet verified
                </span>
              </div>
              <p className="leading-relaxed text-[#69736D]">
                Advocates in this section have submitted their Bar Council enrolment details and are undergoing administrative review. These credentials have not yet been independently verified. In accordance with platform policy and Bar Council guidelines, paid consultations and fee agreements are strictly disabled for profiles under review. You may submit non-binding preliminary inquiries only.
              </p>
            </div>
          </div>
        )}

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
        {!isAuthenticated && activeSurface === "under_review" && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF7] border border-[#E8DCC0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs mt-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#E8DCC0] flex items-center justify-center text-amber-800 shrink-0 mt-0.5 shadow-2xs">
                <Clock className="w-5 h-5 text-amber-700" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs sm:text-sm font-semibold text-[#202824]">
                  Registered Client Sign-In Required for Profiles Under Review
                </p>
                <p className="text-xs text-[#69736D] leading-relaxed">
                  Under Bar Council Rule 36 and privacy regulations, profiles undergoing initial credential verification are reserved for authenticated registered clients. Sign in to browse pending profiles or submit non-binding inquiries.
                </p>
              </div>
            </div>
            <Link
              href="/auth/login?intent=client&next=/lawyers"
              className="whitespace-nowrap px-4 py-2 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white text-xs font-semibold shadow-xs transition-all shrink-0"
            >
              Sign In to Browse
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

        {/* Dropdowns Row (6 responsive columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* 1. Practice Area Filter (Canonical Taxonomy) */}
          <div className="relative">
            <label className="block text-[11px] font-mono text-[#69736D] uppercase tracking-wider mb-1 font-semibold">
              Practice Area
            </label>
            <select
              value={selectedPracticeArea}
              onChange={(e) => setSelectedPracticeArea(e.target.value)}
              className="w-full h-10 px-3 pr-8 rounded-lg bg-[#F8FAF9] border border-[#D5E5D9] text-xs text-[#202824] focus:border-[#205C43] outline-none appearance-none cursor-pointer truncate"
            >
              {practiceAreaOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-[34px] w-3.5 h-3.5 text-[#69736D] pointer-events-none" />
          </div>

          {/* 2. Experience Filter */}
          <div className="relative">
            <label className="block text-[11px] font-mono text-[#69736D] uppercase tracking-wider mb-1 font-semibold">
              Experience
            </label>
            <select
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              className="w-full h-10 px-3 pr-8 rounded-lg bg-[#F8FAF9] border border-[#D5E5D9] text-xs text-[#202824] focus:border-[#205C43] outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Experience</option>
              <option value="15+">15+ Years (Senior)</option>
              <option value="10-14">10–14 Years</option>
              <option value="5-9">5–9 Years</option>
              <option value="under-5">Under 5 Years</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-[34px] w-3.5 h-3.5 text-[#69736D] pointer-events-none" />
          </div>

          {/* 3. Consultation Mode Filter */}
          <div className="relative">
            <label className="block text-[11px] font-mono text-[#69736D] uppercase tracking-wider mb-1 font-semibold">
              Format / Mode
            </label>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="w-full h-10 px-3 pr-8 rounded-lg bg-[#F8FAF9] border border-[#D5E5D9] text-xs text-[#202824] focus:border-[#205C43] outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Modes</option>
              <option value="online">Online Video</option>
              <option value="in_person">In-Chambers</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-[34px] w-3.5 h-3.5 text-[#69736D] pointer-events-none" />
          </div>

          {/* 4. City / State Filter */}
          <div className="relative">
            <label className="block text-[11px] font-mono text-[#69736D] uppercase tracking-wider mb-1 font-semibold">
              Location / City
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
            <ChevronDown className="absolute right-2.5 top-[34px] w-3.5 h-3.5 text-[#69736D] pointer-events-none" />
          </div>

          {/* 5. Language Filter */}
          <div className="relative">
            <label className="block text-[11px] font-mono text-[#69736D] uppercase tracking-wider mb-1 font-semibold">
              Language
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
            <ChevronDown className="absolute right-2.5 top-[34px] w-3.5 h-3.5 text-[#69736D] pointer-events-none" />
          </div>


          {/* 7. Sort By Filter */}
          <div className="relative">
            <label className="block text-[11px] font-mono text-[#69736D] uppercase tracking-wider mb-1 font-semibold">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "exp-desc" | "exp-asc" | "name-asc" | "fee-asc")
              }
              className="w-full h-10 px-3 pr-8 rounded-lg bg-[#F8FAF9] border border-[#D5E5D9] text-xs text-[#202824] focus:border-[#205C43] outline-none appearance-none cursor-pointer"
            >
              <option value="exp-desc">Most Experienced</option>
              <option value="exp-asc">Rising Counsel</option>
              <option value="fee-asc">Fee: Low to High</option>
              <option value="name-asc">Alphabetical (A-Z)</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-[34px] w-3.5 h-3.5 text-[#69736D] pointer-events-none" />
          </div>
        </div>

        {/* Results Bar & Active Filter Dismiss Chips */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-t border-[#D5E5D9]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] text-[#69736D]">
              Showing <strong className="text-[#202824]">{totalItems > 0 ? `${startIndex + 1}–${Math.min(startIndex + ITEMS_PER_PAGE, totalItems)}` : 0}</strong> of{" "}
              <strong className="text-[#202824]">{totalItems}</strong> matching practitioners
            </span>

            {/* Dismissible Chips */}
            {searchQuery.trim() && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EAF3ED] border border-[#D5E5D9] text-[11px] text-[#205C43] font-medium">
                Keyword: &ldquo;{searchQuery}&rdquo;
                <button onClick={() => setSearchQuery("")} className="hover:text-rose-700 ml-0.5" aria-label="Remove keyword filter">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedPracticeArea !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EAF3ED] border border-[#D5E5D9] text-[11px] text-[#205C43] font-medium">
                Practice: {selectedPracticeArea}
                <button onClick={() => setSelectedPracticeArea("all")} className="hover:text-rose-700 ml-0.5" aria-label="Remove practice area filter">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedExperience !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EAF3ED] border border-[#D5E5D9] text-[11px] text-[#205C43] font-medium">
                Exp: {selectedExperience === "15+" ? "15+ Years" : selectedExperience}
                <button onClick={() => setSelectedExperience("all")} className="hover:text-rose-700 ml-0.5" aria-label="Remove experience filter">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedMode !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EAF3ED] border border-[#D5E5D9] text-[11px] text-[#205C43] font-medium">
                Mode: {selectedMode === "online" ? "Online Video" : "In-Chambers"}
                <button onClick={() => setSelectedMode("all")} className="hover:text-rose-700 ml-0.5" aria-label="Remove mode filter">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedCity !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EAF3ED] border border-[#D5E5D9] text-[11px] text-[#205C43] font-medium">
                City: {selectedCity}
                <button onClick={() => setSelectedCity("all")} className="hover:text-rose-700 ml-0.5" aria-label="Remove city filter">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedLanguage !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EAF3ED] border border-[#D5E5D9] text-[11px] text-[#205C43] font-medium">
                Lang: {selectedLanguage}
                <button onClick={() => setSelectedLanguage("all")} className="hover:text-rose-700 ml-0.5" aria-label="Remove language filter">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-[#205C43] hover:text-[#174530] flex items-center gap-1 font-semibold hover:underline shrink-0"
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
              "We are having trouble connecting to our Bar Council verification registry right now. Our technical team has been notified. You can retry the connection or start an AI Preconsultation session."}
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
              Start AI Preconsultation
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
              Start AI Preconsultation
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
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedLawyers.map((lawyer) => {
              const initials = getInitials(lawyer.professional_name);
              const feeDisplay = lawyer.consultation_fee
                ? `₹${lawyer.consultation_fee.toLocaleString("en-IN")}`
                : "₹1,500";
              const isPending = lawyer.verification_status === "pending";

              return (
                <motion.div
                  key={lawyer.id}
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.018 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className={`relative p-6 rounded-2xl bg-white border ${
                    isPending
                      ? "border-neutral-300 hover:border-neutral-400"
                      : "border-[#D5E5D9] hover:border-[#205C43]/40"
                  } transition-all shadow-xs hover:shadow-md flex flex-col justify-between group overflow-hidden`}
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <Link
                          href={`/lawyers/${lawyer.id}`}
                          className={`w-12 h-12 rounded-full ${
                            isPending ? "bg-neutral-100 text-neutral-700 border-neutral-300" : "bg-[#EAF3ED] text-[#205C43] border-[#D5E5D9]"
                          } hover:bg-[#D5E5D9] flex items-center justify-center font-serif text-sm font-semibold shrink-0 shadow-2xs transition-colors border`}
                        >
                          {initials}
                        </Link>
                        <div>
                          <Link href={`/lawyers/${lawyer.id}`} className="block">
                            <h3 className="font-semibold text-[#202824] text-base group-hover:text-[#205C43] transition-colors leading-tight">
                              {lawyer.professional_name}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-1.5 mt-1">
                            {isPending ? (
                              <span
                                className="text-[10px] font-mono text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-300 flex items-center gap-1 font-semibold"
                                title="Credentials submitted; registrar review in progress. Not yet verified."
                              >
                                <Clock className="w-3 h-3 text-neutral-600" />
                                Not yet verified
                              </span>
                            ) : (
                              <span
                                className="text-[10px] font-mono text-[#205C43] bg-[#EAF3ED] px-2 py-0.5 rounded-md border border-[#D5E5D9] flex items-center gap-1 font-semibold"
                                title={
                                  lawyer.verified_at
                                    ? `Enrolment verified on ${new Date(lawyer.verified_at).toLocaleDateString("en-IN")}`
                                    : "Bar Council credentials authenticated by registrar"
                                }
                              >
                                <CheckCircle2 className="w-3 h-3 text-[#205C43]" />
                                Verified Advocate
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

                    {/* Transparent Consultation Terms / Preliminary Preview */}
                    {isPending ? (
                      <div className="mt-3 px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-medium text-neutral-700">
                          <Scale className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Preliminary Inquiry</span>
                        </div>
                        <span className="text-[11px] text-neutral-500 font-mono">No Fee • Unconfirmed</span>
                      </div>
                    ) : (
                      <div className="mt-3 px-3 py-2 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-medium text-[#202824]">
                          <Scale className="w-3.5 h-3.5 text-[#205C43]" />
                          <span>
                            {feeDisplay}{" "}
                            <span className="text-[#69736D] font-normal text-[11px]">/ 45m Session</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#4A544F]">
                          <Video className="w-3 h-3 text-[#205C43]" />
                          <span>Online & Chambers</span>
                        </div>
                      </div>
                    )}

                    {/* Courts of practice if available */}
                    {lawyer.courts_of_practice && lawyer.courts_of_practice.length > 0 && (
                      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#4A544F]">
                        <Scale className="w-3.5 h-3.5 text-[#205C43] shrink-0" />
                        <span className="truncate">{lawyer.courts_of_practice.slice(0, 2).join(" • ")}</span>
                      </div>
                    )}

                    {/* Bio */}
                    {lawyer.bio && (
                      <p className="text-xs text-[#69736D] leading-relaxed line-clamp-3 mt-3">
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

                    {/* Under Review Notice */}
                    {isPending && (
                      <div className="mt-3.5 p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-800 leading-snug space-y-0.5">
                        <div className="font-semibold font-mono text-[10px] uppercase text-neutral-900 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-neutral-600" />
                          <span>Not Yet Verified • Profile Under Review</span>
                        </div>
                        <p className="text-neutral-600 text-[11px]">
                          Credentials have been submitted and are under review. Paid consultation booking is disabled. Non-binding preliminary inquiries are permitted with advocate consent.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="pt-5 mt-5 border-t border-[#D5E5D9] grid grid-cols-2 gap-2">
                    <Link
                      href={`/lawyers/${lawyer.id}`}
                      className="py-2.5 px-3 rounded-xl bg-white hover:bg-[#EAF3ED] text-[#205C43] border border-[#D5E5D9] font-semibold text-xs transition-colors shadow-2xs flex items-center justify-center text-center"
                    >
                      View Profile
                    </Link>
                    <MagneticWrapper className="w-full" maxDisplacement={4}>
                      <Link
                        href={`/lawyers/${lawyer.id}#${isPending ? "preliminary-inquiry" : "consultation"}`}
                        className={`w-full py-2.5 px-3 rounded-xl ${
                          isPending
                            ? "bg-neutral-800 hover:bg-neutral-900 text-white"
                            : "bg-[#205C43] hover:bg-[#174530] text-white"
                        } font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#205C43] block text-center`}
                      >
                        <span>
                          {isPending ? "Preliminary Inquiry" : "Consultation"}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 inline ml-0.5" />
                      </Link>
                    </MagneticWrapper>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#D5E5D9] shadow-2xs">
              <span className="text-xs font-mono text-[#69736D]">
                Page <strong className="text-[#202824]">{safeCurrentPage}</strong> of{" "}
                <strong className="text-[#202824]">{totalPages}</strong>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-[#D5E5D9] bg-white hover:bg-[#F8FAF9] text-xs font-medium text-[#202824] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold font-mono transition-colors ${
                      safeCurrentPage === page
                        ? "bg-[#205C43] text-white shadow-2xs"
                        : "bg-white hover:bg-[#EAF3ED] text-[#202824] border border-[#D5E5D9]"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-[#D5E5D9] bg-white hover:bg-[#F8FAF9] text-xs font-medium text-[#202824] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
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
