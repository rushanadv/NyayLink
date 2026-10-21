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
  Filter,
  X,
  ArrowRight,
  Scale,
  Briefcase,
  ShieldCheck,
  ChevronDown,
  AlertCircle,
  Users,
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
}

interface LawyerDirectoryClientProps {
  initialLawyers: PublicLawyer[];
  isAuthenticated: boolean;
  loadWarning?: string;
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
}: LawyerDirectoryClientProps) {
  const shouldReduceMotion = useReducedMotion();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPracticeArea, setSelectedPracticeArea] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
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
    return initialLawyers.filter((lawyer) => {
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

      return true;
    }).sort((a, b) => {
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
    sortBy,
  ]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedPracticeArea !== "all" ||
    selectedCity !== "all" ||
    selectedLanguage !== "all";

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedPracticeArea("all");
    setSelectedCity("all");
    setSelectedLanguage("all");
    setSortBy("exp-desc");
  };

  const consultationHref = isAuthenticated
    ? "/dashboard"
    : "/auth/login?intent=client&next=/lawyers";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Page Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#191923] border border-white/[0.08] text-xs font-mono text-[#DFBE7E]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
          <span>03 / VERIFIED ADVOCATE DIRECTORY</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white tracking-tight leading-[1.15] text-balance">
          Find Verified Bar Council Advocates
        </h1>
        <p className="text-sm sm:text-base text-[#A5A3B2] leading-relaxed">
          Search independent practitioners across Supreme Court, High Courts, and
          District Tribunals. All profiles feature authenticated Bar Council of
          India enrollment records, upfront flat consultation fees, and zero
          referral commission.
        </p>

        {/* Badges / Guarantees Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-[#A5A3B2]">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <Users className="w-3.5 h-3.5 text-[#C5A059]" />
            <span className="text-white/90">480+ Verified Advocates</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-white/90">BCI Credentials Validated</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <Scale className="w-3.5 h-3.5 text-[#C5A059]" />
            <span className="text-white/90">Section 36 Compliant</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
            <span className="text-white/90">Milestone Escrow Protection</span>
          </div>
        </div>

        {/* Graceful Degradation Notice (visible if live DB query fails or recovers) */}
        {loadWarning && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs flex items-start gap-3 mt-4">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-amber-300">Live Sync Notice</p>
              <p className="text-amber-200/80 leading-relaxed">{loadWarning}</p>
            </div>
          </div>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0C0F17]/95 border border-white/[0.08] backdrop-blur-md shadow-2xl space-y-4">
        {/* Main Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C5A059]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by advocate name, legal issue (e.g. RERA, Bail, NCLT), city, or language..."
            className="w-full h-12 pl-11 pr-10 rounded-xl bg-[#141824] border border-white/10 focus:border-[#C5A059]/60 focus:ring-1 focus:ring-[#C5A059] text-sm text-white placeholder-white/30 transition-all outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdowns Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Practice Area Filter */}
          <div className="relative">
            <label className="block text-[11px] font-mono text-[#A5A3B2] uppercase tracking-wider mb-1">
              Practice Area
            </label>
            <select
              value={selectedPracticeArea}
              onChange={(e) => setSelectedPracticeArea(e.target.value)}
              className="w-full h-10 px-3 pr-8 rounded-lg bg-[#141824] border border-white/10 text-xs text-white focus:border-[#C5A059] outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Practice Areas ({practiceAreasList.length})</option>
              {practiceAreasList.map((pa) => (
                <option key={pa} value={pa} className="bg-[#0C0F17] text-white">
                  {pa}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-[34px] w-3.5 h-3.5 text-white/40 pointer-events-none" />
          </div>

          {/* City / State Filter */}
          <div className="relative">
            <label className="block text-[11px] font-mono text-[#A5A3B2] uppercase tracking-wider mb-1">
              Court Jurisdiction / City
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full h-10 px-3 pr-8 rounded-lg bg-[#141824] border border-white/10 text-xs text-white focus:border-[#C5A059] outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Locations ({citiesList.length})</option>
              {citiesList.map((city) => (
                <option key={city} value={city} className="bg-[#0C0F17] text-white">
                  {city}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-[34px] w-3.5 h-3.5 text-white/40 pointer-events-none" />
          </div>

          {/* Language Filter */}
          <div className="relative">
            <label className="block text-[11px] font-mono text-[#A5A3B2] uppercase tracking-wider mb-1">
              Consultation Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full h-10 px-3 pr-8 rounded-lg bg-[#141824] border border-white/10 text-xs text-white focus:border-[#C5A059] outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Languages ({languagesList.length})</option>
              {languagesList.map((lang) => (
                <option key={lang} value={lang} className="bg-[#0C0F17] text-white">
                  {lang}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-[34px] w-3.5 h-3.5 text-white/40 pointer-events-none" />
          </div>

          {/* Sort By Filter */}
          <div className="relative">
            <label className="block text-[11px] font-mono text-[#A5A3B2] uppercase tracking-wider mb-1">
              Sort Results
            </label>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "exp-desc" | "exp-asc" | "name-asc")
              }
              className="w-full h-10 px-3 pr-8 rounded-lg bg-[#141824] border border-white/10 text-xs text-white focus:border-[#C5A059] outline-none appearance-none cursor-pointer"
            >
              <option value="exp-desc" className="bg-[#0C0F17] text-white">
                Most Experienced (Years)
              </option>
              <option value="exp-asc" className="bg-[#0C0F17] text-white">
                Earliest Call / Rising Counsel
              </option>
              <option value="name-asc" className="bg-[#0C0F17] text-white">
                Alphabetical (A to Z)
              </option>
            </select>
            <ChevronDown className="absolute right-3 top-[34px] w-3.5 h-3.5 text-white/40 pointer-events-none" />
          </div>
        </div>

        {/* Results Bar & Active Filter Chips */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-[#A5A3B2]">
              Showing <strong className="text-white">{filteredLawyers.length}</strong> of{" "}
              {initialLawyers.length} verified advocates
            </span>
            {hasActiveFilters && (
              <span className="text-[10px] font-mono text-[#C5A059] bg-[#C5A059]/10 px-2 py-0.5 rounded border border-[#C5A059]/25">
                Filtered
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-[#DFBE7E] hover:underline flex items-center gap-1 font-medium"
            >
              <X className="w-3.5 h-3.5" />
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Results Grid / Empty State */}
      {filteredLawyers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLawyers.map((lawyer) => {
            const initials = getInitials(lawyer.professional_name);

            return (
              <motion.div
                key={lawyer.id}
                whileHover={shouldReduceMotion ? undefined : { scale: 1.018 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="relative p-6 rounded-2xl bg-[#0C0F17]/95 border border-white/[0.08] transition-colors shadow-xl hover:shadow-2xl hover:shadow-black/70 flex flex-col justify-between group overflow-hidden"
              >
                {/* 1px Crisp Gold-to-Transparent Gradient Border on Hover */}
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none p-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(197, 160, 89, 0.8) 0%, rgba(197, 160, 89, 0.25) 45%, transparent 85%)",
                    WebkitMask:
                      "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                  }}
                />

                <div className="relative z-[1]">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#252E46] to-[#121622] flex items-center justify-center font-serif text-sm font-semibold text-[#DFBE7E] border border-white/10 group-hover:border-[#C5A059]/30 transition-colors shrink-0 shadow-inner">
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-base group-hover:text-[#DFBE7E] transition-colors leading-tight">
                          {lawyer.professional_name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            BCI Verified
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location & Experience Meta */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/[0.06] text-xs text-[#A5A3B2]">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                      <span className="truncate">{lawyer.city}, {lawyer.state}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                      <span>{lawyer.experience_years} Years Experience</span>
                    </div>
                  </div>

                  {/* Bio */}
                  {lawyer.bio && (
                    <p className="text-xs text-[#A5A3B2] leading-relaxed line-clamp-3 mt-3.5">
                      {lawyer.bio}
                    </p>
                  )}

                  {/* Practice Area Chips */}
                  <div className="mt-4 space-y-1.5">
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider block">
                      Specializations
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {lawyer.practice_areas.map((pa) => (
                        <span
                          key={pa}
                          className="px-2.5 py-0.5 rounded-full bg-white/[0.03] text-[11px] font-medium text-white/80 border border-white/[0.08]"
                        >
                          {pa}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Languages Spoken */}
                  <div className="mt-3.5 flex items-center gap-1.5 text-[11px] text-[#A5A3B2]">
                    <LanguagesIcon className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                    <span className="truncate">
                      {lawyer.languages.join(", ")}
                    </span>
                  </div>
                </div>

                {/* Card Action */}
                <div className="pt-5 mt-5 border-t border-white/[0.06] relative z-[1]">
                  <MagneticWrapper className="w-full" maxDisplacement={6}>
                    <Link
                      href={consultationHref}
                      className="w-full py-2.5 rounded-lg bg-[#C5A059] hover:bg-[#DFBE7E] text-[#090B10] font-semibold text-xs transition-colors shadow-md shadow-[#C5A059]/15 flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] block"
                    >
                      <span>Request Consultation</span>
                      <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
                    </Link>
                  </MagneticWrapper>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Empty / No Results State */
        <div className="p-12 sm:p-16 rounded-2xl bg-[#0C0F17]/80 border border-white/[0.08] text-center space-y-4 max-w-xl mx-auto shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/25 flex items-center justify-center text-[#DFBE7E] mx-auto">
            <Scale className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-serif text-white font-medium">
            No advocates match these filters
          </h2>
          <p className="text-xs sm:text-sm text-[#A5A3B2] leading-relaxed max-w-md mx-auto">
            Try broadening your search keywords, switching practice areas, or
            clearing active filters to view all verified practitioners.
          </p>
          <div className="pt-2">
            <button
              onClick={clearAllFilters}
              className="px-5 py-2.5 rounded-lg bg-[#191923] hover:bg-[#22212D] text-xs font-semibold text-white border border-white/10 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
