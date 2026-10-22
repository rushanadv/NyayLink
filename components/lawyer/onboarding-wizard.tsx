"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  FileCheck2,
  Check,
  Scale,
} from "lucide-react";


interface WizardProps {
  userId: string;
  userEmail: string;
  initialProfile: {
    professional_name?: string | null;
    phone?: string | null;
    bar_council_number?: string | null;
    bar_council_state?: string | null;
    bar_council_enrollment_year?: number | null;
    city?: string | null;
    state?: string | null;
    practice_areas?: string[] | null;
    languages?: string[] | null;
    experience_years?: number | null;
    bio?: string | null;
    is_profile_completed?: boolean | null;
  } | null;
  initialVerification: {
    status?: string | null;
    submitted_at?: string | null;
  } | null;
}

const STATE_BAR_COUNCILS = [
  "Bar Council of Delhi",
  "Bar Council of Maharashtra & Goa",
  "Bar Council of Uttar Pradesh",
  "Bar Council of Karnataka",
  "Bar Council of Tamil Nadu & Puducherry",
  "Bar Council of West Bengal",
  "Bar Council of Punjab & Haryana",
  "Bar Council of Gujarat",
  "Bar Council of Rajasthan",
  "Bar Council of Madhya Pradesh",
  "Bar Council of Bihar",
  "Bar Council of Kerala",
  "Bar Council of Andhra Pradesh",
  "Bar Council of Telangana",
  "Bar Council of Odisha",
  "Bar Council of Assam, Nagaland, Mizoram, Arunachal Pradesh & Sikkim",
  "Bar Council of Jharkhand",
  "Bar Council of Chhattisgarh",
  "Bar Council of Himachal Pradesh",
  "Bar Council of Uttarakhand",
  "Bar Council of Jammu & Kashmir and Ladakh",
];

const PRACTICE_AREAS_OPTIONS = [
  "Criminal Law",
  "Civil Litigation",
  "Constitutional & Writ",
  "Family & Matrimonial",
  "Corporate & Commercial",
  "Real Estate & RERA",
  "Banking & DRT / IBC",
  "Consumer Protection",
  "Taxation & GST",
  "Labour & Industrial",
  "Intellectual Property",
  "Cyber Law & IT Act",
  "Arbitration & ADR",
  "Motor Accident (MACT)",
];

const LANGUAGE_OPTIONS = [
  "English",
  "Hindi",
  "Bengali",
  "Marathi",
  "Telugu",
  "Tamil",
  "Gujarati",
  "Kannada",
  "Malayalam",
  "Punjabi",
  "Odia",
  "Urdu",
  "Assamese",
];

export function AdvocateOnboardingWizard({
  userId,
  initialProfile,
}: WizardProps) {

  // Wizard state: 1: Contact & Bar Council, 2: Practice & Profile, 3: Review & Verification
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitted, setIsSubmitted] = useState(
    Boolean(initialProfile?.is_profile_completed)
  );

  // Step 1: Contact & Bar Council details
  const [professionalName, setProfessionalName] = useState(
    initialProfile?.professional_name || ""
  );
  const [phone, setPhone] = useState(initialProfile?.phone || "");
  const [barCouncilState, setBarCouncilState] = useState(
    initialProfile?.bar_council_state || "Bar Council of Delhi"
  );
  const [barCouncilNumber, setBarCouncilNumber] = useState(
    initialProfile?.bar_council_number || ""
  );
  const [enrollmentYear, setEnrollmentYear] = useState<string>(
    initialProfile?.bar_council_enrollment_year
      ? String(initialProfile.bar_council_enrollment_year)
      : ""
  );
  const [city, setCity] = useState(initialProfile?.city || "");
  const state = initialProfile?.state || "";


  // Step 2: Practice & Languages
  const [practiceAreas, setPracticeAreas] = useState<string[]>(
    initialProfile?.practice_areas || ["Civil Litigation", "Criminal Law"]
  );
  const [languages, setLanguages] = useState<string[]>(
    initialProfile?.languages || ["English", "Hindi"]
  );
  const [experienceYears, setExperienceYears] = useState<string>(
    initialProfile?.experience_years ? String(initialProfile.experience_years) : "5"
  );
  const [bio, setBio] = useState(initialProfile?.bio || "");

  // Step 3: Confirmation
  const [confirmedTruthful, setConfirmedTruthful] = useState(false);

  // Submission & Save UI States
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Auto-dismiss save notice after 3 seconds
  useEffect(() => {
    if (saveSuccessNotice) {
      const timer = setTimeout(() => setSaveSuccessNotice(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccessNotice]);

  const togglePracticeArea = (area: string) => {
    if (practiceAreas.includes(area)) {
      setPracticeAreas(practiceAreas.filter((a) => a !== area));
    } else {
      setPracticeAreas([...practiceAreas, area]);
    }
  };

  const toggleLanguage = (lang: string) => {
    if (languages.includes(lang)) {
      setLanguages(languages.filter((l) => l !== lang));
    } else {
      setLanguages([...languages, lang]);
    }
  };

  // Intermediate Draft Save (ensures interruption / reload recovers data)
  const saveDraft = async (stepToValidate: 1 | 2) => {
    setError(null);
    if (stepToValidate === 1) {
      if (!professionalName.trim()) {
        setError("Please enter your Advocate / Professional Name.");
        return false;
      }
      if (!barCouncilNumber.trim()) {
        setError("Please enter your Bar Council Enrollment / Registration Number.");
        return false;
      }
      if (!city.trim()) {
        setError("Please enter your District / Primary Court of practice.");
        return false;
      }
    }

    if (stepToValidate === 2) {
      if (practiceAreas.length === 0) {
        setError("Please select at least one primary practice area.");
        return false;
      }
    }

    setIsSaving(true);
    try {
      const supabase = createClient();

      // Ensure user has lawyer role assigned
      await supabase.rpc("claim_lawyer_onboarding_role");

      // Save phone to profiles
      if (phone.trim()) {
        await supabase
          .from("profiles")
          .update({ phone: phone.trim() })
          .eq("id", userId);
      }

      // Upsert draft to lawyer_profiles
      const parsedYear = enrollmentYear ? parseInt(enrollmentYear, 10) : null;
      const parsedExp = experienceYears ? parseInt(experienceYears, 10) : 1;

      const { error: upsertError } = await supabase.from("lawyer_profiles").upsert(
        {
          id: userId,
          professional_name: professionalName.trim(),
          bar_council_number: barCouncilNumber.trim().toUpperCase(),
          bar_council_state: barCouncilState,
          bar_council_enrollment_year: isNaN(Number(parsedYear)) ? null : parsedYear,
          city: city.trim(),
          state: state.trim() || barCouncilState.replace("Bar Council of ", ""),
          practice_areas: practiceAreas,
          languages: languages,
          experience_years: isNaN(Number(parsedExp)) ? 1 : parsedExp,
          bio: bio.trim() || null,
          is_profile_completed: false, // Remains false until final step 3 submit
          is_published: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      if (upsertError) {
        console.warn("[Draft Save Warning]:", upsertError.message);
      } else {
        setSaveSuccessNotice("Draft progress saved to server");
      }
      return true;
    } catch (err: unknown) {
      console.error("[Draft Save Error]:", err);
      // Soft fail on draft save so user can still continue if network is slow
      return true;
    } finally {
      setIsSaving(false);
    }
  };

  const handleNextStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await saveDraft(1);
    if (ok) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await saveDraft(2);
    if (ok) {
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleFinalSubmit = async () => {
    setError(null);
    if (!confirmedTruthful) {
      setError("Please confirm that your Bar Council enrollment details are authentic.");
      return;
    }

    setIsSaving(true);
    try {
      const supabase = createClient();
      const parsedYear = enrollmentYear ? parseInt(enrollmentYear, 10) : 2020;
      const parsedExp = experienceYears ? parseInt(experienceYears, 10) : 5;

      const { error: rpcError } = await supabase.rpc(
        "submit_advocate_onboarding_profile",

        {
          p_professional_name: professionalName.trim(),
          p_phone: phone.trim() || "Not specified",
          p_bar_council_number: barCouncilNumber.trim().toUpperCase(),
          p_bar_council_state: barCouncilState,
          p_bar_council_enrollment_year: isNaN(Number(parsedYear)) ? 2020 : parsedYear,
          p_city: city.trim(),
          p_state: state.trim() || barCouncilState.replace("Bar Council of ", ""),
          p_practice_areas: practiceAreas,
          p_languages: languages,
          p_experience_years: isNaN(Number(parsedExp)) ? 5 : parsedExp,
          p_bio: bio.trim() || null,
        }
      );

      if (rpcError) {
        throw rpcError;
      }

      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      console.error("[Final Submit Error]:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not submit advocate profile. Please check your network and retry."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // If already submitted (or just finished submitting): show verification status card
  if (isSubmitted) {
    return (
      <div className="w-full max-w-xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="p-6 rounded-2xl bg-white border border-[#D5E5D9] shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center text-[#205C43]">
              <CheckCircle2 className="w-6 h-6 text-[#205C43]" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#205C43] font-bold block">
                PROFILE REGISTERED & SAVED
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#202824]">
                Welcome, {professionalName || "Advocate"}
              </h2>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-amber-800">
              <Clock className="w-4 h-4 text-amber-700" />
              <span>BAR COUNCIL VERIFICATION: PENDING REVIEW</span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed font-sans">
              Your enrollment (<strong>{barCouncilNumber}</strong>, {barCouncilState}) has been logged in the NyayLink credential registry. Our verification team reviews official State Bar Council gazettes within 24–48 hours.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] space-y-3 text-xs text-[#404D44]">
            <div className="font-semibold font-mono text-[#202824] uppercase tracking-wide">
              Your Advocate Access Status
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 text-[#202824]">
                <Check className="w-4 h-4 text-[#205C43]" />
                <span>Chambers workspace active</span>
              </div>
              <div className="flex items-center gap-2 text-[#202824]">
                <Check className="w-4 h-4 text-[#205C43]" />
                <span>Legal matters & dockets ready</span>
              </div>
              <div className="flex items-center gap-2 text-[#69736D]">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Public directory publication (Pending)</span>
              </div>
              <div className="flex items-center gap-2 text-[#69736D]">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Verified Badge (Upon review)</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/lawyer/dashboard"
              className="w-full min-h-[44px] h-12 rounded-xl bg-[#174530] hover:bg-[#0E2C1E] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <span>Enter Advocate Chambers Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Progress Stepper Indicator */}
      <div className="bg-white p-4 rounded-2xl border border-[#D5E5D9] shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-[#69736D]">
          <span className="font-semibold text-[#174530]">
            STEP {currentStep} OF 3
          </span>
          <span>
            {currentStep === 1 && "Bar Council & Contact"}
            {currentStep === 2 && "Practice Areas & Languages"}
            {currentStep === 3 && "Review & Verification"}
          </span>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full h-2 rounded-full bg-[#EAF3ED] overflow-hidden">
          <div
            className="h-full bg-[#205C43] transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span className="leading-relaxed font-medium">{error}</span>
        </div>
      )}

      {saveSuccessNotice && (
        <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <span>{saveSuccessNotice}</span>
        </div>
      )}

      {/* STEP 1: Contact & Bar Council */}
      {currentStep === 1 && (
        <form onSubmit={handleNextStep1} className="bg-white p-5 sm:p-7 rounded-2xl border border-[#D5E5D9] shadow-2xs space-y-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EAF3ED] text-[11px] font-mono text-[#174530] font-semibold mb-2">
              <Scale className="w-3.5 h-3.5" />
              <span>BAR COUNCIL ENROLLMENT</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-semibold text-[#202824]">
              Advocate Identity & Practice
            </h3>
            <p className="text-xs sm:text-sm text-[#69736D] mt-1 leading-relaxed">
              Enter your professional enrollment details as recorded with your State Bar Council.
            </p>
          </div>

          {/* Advocate Professional Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="lawyer-name"
              className="block text-xs font-mono font-semibold text-[#202824] uppercase tracking-wide"
            >
              Advocate Legal Name <span className="text-red-500">*</span>
            </label>
            <input
              id="lawyer-name"
              type="text"
              required
              inputMode="text"
              placeholder="Adv. Rajesh Kumar Sharma"
              value={professionalName}
              onChange={(e) => setProfessionalName(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#D5E5D9] text-[#202824] placeholder-[#8F9A93] text-sm focus:outline-none focus:border-[#205C43] focus:ring-2 focus:ring-[#205C43]/15 shadow-2xs transition-colors"
            />
          </div>

          {/* Mobile Number */}
          <div className="space-y-1.5">
            <label
              htmlFor="lawyer-phone"
              className="block text-xs font-mono font-semibold text-[#202824] uppercase tracking-wide"
            >
              Mobile Number
            </label>
            <input
              id="lawyer-phone"
              type="tel"
              inputMode="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#D5E5D9] text-[#202824] placeholder-[#8F9A93] text-sm focus:outline-none focus:border-[#205C43] focus:ring-2 focus:ring-[#205C43]/15 shadow-2xs transition-colors"
            />
            <p className="text-[11px] text-[#69736D]">
              Used for client consultation alerts and docket notifications.
            </p>
          </div>

          {/* State Bar Council Dropdown */}
          <div className="space-y-1.5">
            <label
              htmlFor="bar-council-state"
              className="block text-xs font-mono font-semibold text-[#202824] uppercase tracking-wide"
            >
              State Bar Council <span className="text-red-500">*</span>
            </label>
            <select
              id="bar-council-state"
              value={barCouncilState}
              onChange={(e) => setBarCouncilState(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-white border border-[#D5E5D9] text-[#202824] text-sm focus:outline-none focus:border-[#205C43] focus:ring-2 focus:ring-[#205C43]/15 shadow-2xs transition-colors"
            >
              {STATE_BAR_COUNCILS.map((bc) => (
                <option key={bc} value={bc}>
                  {bc}
                </option>
              ))}
            </select>
          </div>

          {/* Bar Enrollment Number & Year */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label
                htmlFor="bar-number"
                className="block text-xs font-mono font-semibold text-[#202824] uppercase tracking-wide"
              >
                Enrollment Number <span className="text-red-500">*</span>
              </label>
              <input
                id="bar-number"
                type="text"
                required
                placeholder="e.g. D/1425/2018 or MAH/2311/2015"
                value={barCouncilNumber}
                onChange={(e) => setBarCouncilNumber(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#D5E5D9] text-[#202824] placeholder-[#8F9A93] text-sm focus:outline-none focus:border-[#205C43] focus:ring-2 focus:ring-[#205C43]/15 shadow-2xs transition-colors font-mono uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="enrollment-year"
                className="block text-xs font-mono font-semibold text-[#202824] uppercase tracking-wide"
              >
                Enrollment Year
              </label>
              <input
                id="enrollment-year"
                type="number"
                inputMode="numeric"
                min="1950"
                max="2026"
                placeholder="2018"
                value={enrollmentYear}
                onChange={(e) => setEnrollmentYear(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#D5E5D9] text-[#202824] placeholder-[#8F9A93] text-sm focus:outline-none focus:border-[#205C43] focus:ring-2 focus:ring-[#205C43]/15 shadow-2xs transition-colors font-mono"
              />
            </div>
          </div>

          {/* District / Primary Court of Practice */}
          <div className="space-y-1.5">
            <label
              htmlFor="court-practice"
              className="block text-xs font-mono font-semibold text-[#202824] uppercase tracking-wide"
            >
              Primary Court / District Jurisdiction <span className="text-red-500">*</span>
            </label>
            <input
              id="court-practice"
              type="text"
              required
              placeholder="e.g. Tis Hazari District Courts, Delhi or Bombay High Court"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#D5E5D9] text-[#202824] placeholder-[#8F9A93] text-sm focus:outline-none focus:border-[#205C43] focus:ring-2 focus:ring-[#205C43]/15 shadow-2xs transition-colors"
            />
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full min-h-[44px] h-11 rounded-xl bg-[#174530] hover:bg-[#0E2C1E] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
            >
              {isSaving ? (
                <span>Saving details...</span>
              ) : (
                <>
                  <span>Save & Continue to Practice Areas</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: Practice Areas & Languages */}
      {currentStep === 2 && (
        <form onSubmit={handleNextStep2} className="bg-white p-5 sm:p-7 rounded-2xl border border-[#D5E5D9] shadow-2xs space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EAF3ED] text-[11px] font-mono text-[#174530] font-semibold mb-2">
              <Briefcase className="w-3.5 h-3.5" />
              <span>LEGAL EXPERTISE</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-semibold text-[#202824]">
              Practice Areas & Languages
            </h3>
            <p className="text-xs sm:text-sm text-[#69736D] mt-1 leading-relaxed">
              Select the legal domains you handle to receive relevant client matter consultations.
            </p>
          </div>

          {/* Practice Areas Chips */}
          <div className="space-y-2">
            <label className="block text-xs font-mono font-semibold text-[#202824] uppercase tracking-wide">
              Primary Practice Areas <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {PRACTICE_AREAS_OPTIONS.map((area) => {
                const selected = practiceAreas.includes(area);
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => togglePracticeArea(area)}
                    className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                      selected
                        ? "bg-[#174530] text-white border border-[#174530] shadow-xs"
                        : "bg-[#F8FAF9] text-[#202824] border border-[#D5E5D9] hover:bg-[#EAF3ED]"
                    }`}
                  >
                    {selected && <Check className="w-3.5 h-3.5" />}
                    <span>{area}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Languages Spoken Chips */}
          <div className="space-y-2">
            <label className="block text-xs font-mono font-semibold text-[#202824] uppercase tracking-wide">
              Languages of Practice
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {LANGUAGE_OPTIONS.map((lang) => {
                const selected = languages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                      selected
                        ? "bg-[#205C43] text-white border border-[#205C43] shadow-xs"
                        : "bg-[#F8FAF9] text-[#202824] border border-[#D5E5D9] hover:bg-[#EAF3ED]"
                    }`}
                  >
                    {selected && <Check className="w-3 h-3" />}
                    <span>{lang}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Years of Practice */}
          <div className="space-y-1.5">
            <label
              htmlFor="exp-years"
              className="block text-xs font-mono font-semibold text-[#202824] uppercase tracking-wide"
            >
              Years of Bar Practice
            </label>
            <input
              id="exp-years"
              type="number"
              inputMode="numeric"
              min="0"
              max="65"
              placeholder="e.g. 8"
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
              className="w-full sm:w-36 h-11 px-3.5 rounded-xl bg-white border border-[#D5E5D9] text-[#202824] text-sm focus:outline-none focus:border-[#205C43] focus:ring-2 focus:ring-[#205C43]/15 shadow-2xs font-mono"
            />
          </div>

          {/* Optional Bio / Chambers Overview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="advocate-bio"
                className="block text-xs font-mono font-semibold text-[#202824] uppercase tracking-wide"
              >
                Chambers Introduction
              </label>
              <span className="text-[11px] text-[#69736D] font-mono">Optional</span>
            </div>
            <textarea
              id="advocate-bio"
              rows={3}
              placeholder="Brief summary of your chamber practice, tribunal appearances, or focus areas..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-white border border-[#D5E5D9] text-[#202824] placeholder-[#8F9A93] text-sm focus:outline-none focus:border-[#205C43] focus:ring-2 focus:ring-[#205C43]/15 shadow-2xs leading-relaxed"
            />
          </div>

          {/* Navigation Controls */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="min-h-[44px] h-11 px-4 rounded-xl border border-[#D5E5D9] text-xs font-semibold text-[#202824] hover:bg-[#EAF3ED] transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 min-h-[44px] h-11 rounded-xl bg-[#174530] hover:bg-[#0E2C1E] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
            >
              {isSaving ? (
                <span>Saving details...</span>
              ) : (
                <>
                  <span>Continue to Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: Review & Verification Submission */}
      {currentStep === 3 && (
        <div className="bg-white p-5 sm:p-7 rounded-2xl border border-[#D5E5D9] shadow-2xs space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EAF3ED] text-[11px] font-mono text-[#174530] font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>CREDENTIAL VERIFICATION</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-semibold text-[#202824]">
              Review & Submit for Review
            </h3>
            <p className="text-xs sm:text-sm text-[#69736D] mt-1 leading-relaxed">
              Confirm your practitioner credentials before submitting to the NyayLink Registrar.
            </p>
          </div>

          {/* Summary Box */}
          <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#D5E5D9]">
              <span className="font-mono text-[#69736D] uppercase">Advocate Name</span>
              <span className="font-semibold text-[#202824]">{professionalName}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-[#D5E5D9]">
              <span className="font-mono text-[#69736D] uppercase">State Bar Council</span>
              <span className="font-semibold text-[#202824]">{barCouncilState}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-[#D5E5D9]">
              <span className="font-mono text-[#69736D] uppercase">Enrollment Number</span>
              <span className="font-semibold text-[#174530] font-mono">{barCouncilNumber}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-[#D5E5D9]">
              <span className="font-mono text-[#69736D] uppercase">Primary Jurisdiction</span>
              <span className="font-semibold text-[#202824]">{city}</span>
            </div>
            <div>
              <span className="font-mono text-[#69736D] uppercase block mb-1">Practice Areas</span>
              <div className="flex flex-wrap gap-1">
                {practiceAreas.map((pa) => (
                  <span
                    key={pa}
                    className="px-2 py-0.5 rounded-md bg-white border border-[#D5E5D9] text-[11px] text-[#202824]"
                  >
                    {pa}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* BCI Regulatory Compliance Notice */}
          <div className="p-4 rounded-xl bg-[#EAF3ED]/60 border border-[#D5E5D9] space-y-2 text-xs">
            <div className="font-mono text-[#174530] font-semibold flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>BAR COUNCIL OF INDIA (BCI) RULE 36 NOTICE</span>
            </div>
            <p className="text-[#404D44] leading-relaxed">
              NyayLink operates as an institutional legal directory and practice workflow platform. In adherence to professional ethics, registration does not constitute advertising or solicitation. Profiles are published only following administrative verification of Bar enrollment.
            </p>
          </div>

          {/* Truthfulness Declaration Checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 text-xs text-[#202824] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={confirmedTruthful}
                onChange={(e) => setConfirmedTruthful(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[#D5E5D9] text-[#205C43] focus:ring-[#205C43] shrink-0"
              />
              <span className="leading-snug font-medium">
                I hereby declare that I am an Advocate duly enrolled with the State Bar Council specified above, and all statements provided in this onboarding profile are authentic.
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="min-h-[44px] h-11 px-4 rounded-xl border border-[#D5E5D9] text-xs font-semibold text-[#202824] hover:bg-[#EAF3ED] transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSaving || !confirmedTruthful}
              className="flex-1 min-h-[44px] h-11 rounded-xl bg-[#174530] hover:bg-[#0E2C1E] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
            >
              {isSaving ? (
                <span>Submitting to Registrar...</span>
              ) : (
                <>
                  <span>Submit Profile for Review</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
