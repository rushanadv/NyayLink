"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/context";
import { Locale } from "@/lib/i18n/types";
import { NyayLinkLogo } from "@/components/ui/nyaylink-logo";
import {
  User,
  Briefcase,
  ArrowRight,
  Check,
  ChevronLeft,
  ShieldCheck,
  Sparkles,
  Scale,
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { locale, setLocale, t, isHindi } = useLanguage();

  // Step 1: Language Selection, Step 2: Role Selection
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedLanguage, setSelectedLanguage] = useState<Locale | null>(locale || null);

  const handleLanguageSelect = (lang: Locale) => {
    setSelectedLanguage(lang);
    setLocale(lang);
  };

  const handleContinueToRole = () => {
    if (!selectedLanguage) return;
    setLocale(selectedLanguage);
    setStep(2);
  };

  const handleBackToLanguage = () => {
    setStep(1);
  };

  const handleSelectRole = (
    role: "client" | "lawyer",
    intent: "login" | "signup" = "login"
  ) => {
    const targetUrl =
      intent === "signup"
        ? `/auth/sign-up?intent=${role}&role=${role}`
        : `/auth/login?intent=${role}&role=${role}`;
    router.push(targetUrl);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Top Header & Logo */}
      <div className="w-full flex items-center justify-between pb-8 border-b border-[#D5E5D9]/70 mb-8">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <NyayLinkLogo size="md" />
        </Link>

        {/* Step Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-semibold transition-all ${
                step === 1
                  ? "bg-[#205C43] text-white shadow-xs"
                  : "bg-[#EAF3ED] text-[#205C43] border border-[#205C43]/30"
              }`}
            >
              {step > 1 ? <Check className="w-3.5 h-3.5" /> : "1"}
            </span>
            <span
              className={`text-xs font-medium hidden sm:inline ${
                step === 1 ? "text-[#202824] font-semibold" : "text-[#69736D]"
              }`}
            >
              {isHindi ? "भाषा" : "Language"}
            </span>
          </div>

          <div className="w-6 h-px bg-[#D5E5D9]" />

          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-semibold transition-all ${
                step === 2
                  ? "bg-[#205C43] text-white shadow-xs"
                  : "bg-[#F0F4F1] text-[#69736D]"
              }`}
            >
              2
            </span>
            <span
              className={`text-xs font-medium hidden sm:inline ${
                step === 2 ? "text-[#202824] font-semibold" : "text-[#69736D]"
              }`}
            >
              {isHindi ? "भूमिका" : "Role"}
            </span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          /* STEP 1: LANGUAGE SELECTION */
          <motion.div
            key="step-language"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-full max-w-2xl"
          >
            <div className="text-center mb-8 sm:mb-10 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF3ED] border border-[#D5E5D9] text-[#205C43] text-xs font-medium font-mono uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Step 1 of 2 • चरण 1</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#202824] font-normal tracking-tight">
                {selectedLanguage === "hi"
                  ? "अपनी भाषा चुनें"
                  : "Choose your language"}
              </h1>
              <p className="text-sm sm:text-base text-[#69736D] max-w-lg mx-auto leading-relaxed font-light">
                {selectedLanguage === "hi"
                  ? "वह भाषा चुनें जिसमें आप NyayLink का उपयोग करना पसंद करेंगे।"
                  : "Choose the language you're most comfortable using."}
              </p>
            </div>

            {/* Language Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
              {/* Option A: English */}
              <button
                type="button"
                onClick={() => handleLanguageSelect("en")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleLanguageSelect("en");
                  }
                }}
                className={`relative group text-left rounded-2xl p-6 sm:p-7 transition-all duration-200 border-2 outline-none focus-visible:ring-2 focus-visible:ring-[#205C43] focus-visible:ring-offset-2 ${
                  selectedLanguage === "en"
                    ? "bg-white border-[#205C43] shadow-md shadow-[#205C43]/10"
                    : "bg-white/80 hover:bg-white border-[#D5E5D9] hover:border-[#205C43]/40 shadow-xs"
                }`}
                aria-pressed={selectedLanguage === "en"}
                aria-label="Select English language"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center text-lg font-serif font-bold text-[#205C43]">
                    En
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                      selectedLanguage === "en"
                        ? "bg-[#205C43] border-[#205C43] text-white"
                        : "border-[#D5E5D9] bg-white group-hover:border-[#205C43]/50"
                    }`}
                  >
                    {selectedLanguage === "en" && (
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-serif text-2xl font-medium text-[#202824]">
                      English
                    </h3>
                    <span className="text-xs text-[#69736D] font-mono">Latin</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#69736D] mt-1.5 leading-relaxed">
                    Standard Indian legal English across client consultations, cause lists, and filings.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#D5E5D9]/60 flex items-center justify-between text-[11px] font-mono text-[#205C43]">
                  <span>Preview: High Court Cause List</span>
                  <span>EN-IN</span>
                </div>
              </button>

              {/* Option B: Hindi */}
              <button
                type="button"
                onClick={() => handleLanguageSelect("hi")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleLanguageSelect("hi");
                  }
                }}
                className={`relative group text-left rounded-2xl p-6 sm:p-7 transition-all duration-200 border-2 outline-none focus-visible:ring-2 focus-visible:ring-[#205C43] focus-visible:ring-offset-2 ${
                  selectedLanguage === "hi"
                    ? "bg-white border-[#205C43] shadow-md shadow-[#205C43]/10"
                    : "bg-white/80 hover:bg-white border-[#D5E5D9] hover:border-[#205C43]/40 shadow-xs"
                }`}
                aria-pressed={selectedLanguage === "hi"}
                aria-label="हिंदी भाषा चुनें"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center text-lg font-serif font-bold text-[#205C43]">
                    अ
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                      selectedLanguage === "hi"
                        ? "bg-[#205C43] border-[#205C43] text-white"
                        : "border-[#D5E5D9] bg-white group-hover:border-[#205C43]/50"
                    }`}
                  >
                    {selectedLanguage === "hi" && (
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-serif text-2xl font-medium text-[#202824]">
                      हिंदी
                    </h3>
                    <span className="text-xs text-[#69736D] font-mono">देवनागरी</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#69736D] mt-1.5 leading-relaxed">
                    सहज, स्वाभाविक देवनागरी कानूनी इंटरफेस — मुवक्किल परामर्श और कॉज लिस्ट।
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#D5E5D9]/60 flex items-center justify-between text-[11px] font-mono text-[#205C43]">
                  <span>पूर्वावलोकन: उच्च न्यायालय कॉज लिस्ट</span>
                  <span>HI-IN</span>
                </div>
              </button>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <p className="text-xs text-[#69736D] text-center sm:text-left">
                {selectedLanguage === "hi"
                  ? "भाषा को बाद में किसी भी समय हेडर से बदला जा सकता है।"
                  : "You can change your language at any time from the navigation bar."}
              </p>

              <button
                type="button"
                onClick={handleContinueToRole}
                disabled={!selectedLanguage}
                className={`w-full sm:w-auto px-7 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-xs ${
                  selectedLanguage
                    ? "bg-[#205C43] hover:bg-[#174530] text-white cursor-pointer hover:shadow-md"
                    : "bg-[#D5E5D9] text-[#69736D] cursor-not-allowed opacity-60"
                }`}
              >
                <span>
                  {selectedLanguage === "hi" ? "जारी रखें" : "Continue"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          /* STEP 2: ROLE SELECTION (RENDERED IN CHOSEN LANGUAGE) */
          <motion.div
            key="step-role"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-full max-w-3xl"
          >
            {/* Back to language selection */}
            <div className="mb-4">
              <button
                type="button"
                onClick={handleBackToLanguage}
                className="inline-flex items-center gap-1.5 text-xs text-[#69736D] hover:text-[#205C43] transition-colors font-medium px-2 py-1 rounded-md hover:bg-[#EAF3ED]"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>
                  {isHindi
                    ? "भाषा बदलें (वर्तमान: हिंदी)"
                    : "Change language (Current: English)"}
                </span>
              </button>
            </div>

            <div className="text-center mb-8 sm:mb-10 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF3ED] border border-[#D5E5D9] text-[#205C43] text-xs font-medium font-mono uppercase tracking-wider">
                <Scale className="w-3.5 h-3.5" />
                <span>{isHindi ? "चरण 2 of 2" : "Step 2 of 2"}</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#202824] font-normal tracking-tight">
                {t.onboarding.roleTitle}
              </h1>
              <p className="text-sm sm:text-base text-[#69736D] max-w-xl mx-auto leading-relaxed font-light">
                {t.onboarding.roleSubtitle}
              </p>
            </div>

            {/* Role Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Card 1: Client */}
              <div className="bg-white rounded-2xl border-2 border-[#D5E5D9] hover:border-[#205C43] p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:shadow-[#205C43]/5 group">
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center text-[#205C43]">
                      <User className="w-6 h-6" />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#EAF3ED] text-[#205C43] font-semibold border border-[#D5E5D9]">
                      {t.onboarding.clientRoleBadge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-2xl font-normal text-[#202824] group-hover:text-[#205C43] transition-colors">
                      {t.onboarding.clientRoleTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#69736D] mt-1.5 leading-relaxed">
                      {t.onboarding.clientRoleSubtitle}
                    </p>
                  </div>

                  {/* Feature checklist */}
                  <div className="space-y-2.5 pt-2 border-t border-[#D5E5D9]/60">
                    <div className="flex items-start gap-2.5 text-xs text-[#202824]">
                      <Check className="w-4 h-4 text-[#205C43] shrink-0 mt-0.5" />
                      <span>{t.onboarding.clientRoleFeature1}</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-[#202824]">
                      <Check className="w-4 h-4 text-[#205C43] shrink-0 mt-0.5" />
                      <span>{t.onboarding.clientRoleFeature2}</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-[#202824]">
                      <Check className="w-4 h-4 text-[#205C43] shrink-0 mt-0.5" />
                      <span>{t.onboarding.clientRoleFeature3}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[#D5E5D9]/60 space-y-2.5">
                  <button
                    type="button"
                    onClick={() => handleSelectRole("client", "login")}
                    className="w-full py-3 px-4 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs hover:shadow-md cursor-pointer"
                  >
                    <span>
                      {isHindi ? "मुवक्किल के रूप में जारी रखें" : "Continue as Client"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-center text-[11px] text-[#69736D]">
                    {isHindi ? "मुफ़्त खाता • कोई अग्रिम शुल्क नहीं" : "Free access • No upfront charges"}
                  </p>
                </div>
              </div>

              {/* Card 2: Advocate / Lawyer */}
              <div className="bg-white rounded-2xl border-2 border-[#D5E5D9] hover:border-[#174530] p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:shadow-[#174530]/5 group">
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center text-[#174530]">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#EAF3ED] text-[#174530] font-semibold border border-[#D5E5D9]">
                      {t.onboarding.lawyerRoleBadge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-2xl font-normal text-[#202824] group-hover:text-[#174530] transition-colors">
                      {t.onboarding.lawyerRoleTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#69736D] mt-1.5 leading-relaxed">
                      {t.onboarding.lawyerRoleSubtitle}
                    </p>
                  </div>

                  {/* Feature checklist */}
                  <div className="space-y-2.5 pt-2 border-t border-[#D5E5D9]/60">
                    <div className="flex items-start gap-2.5 text-xs text-[#202824]">
                      <Check className="w-4 h-4 text-[#174530] shrink-0 mt-0.5" />
                      <span>{t.onboarding.lawyerRoleFeature1}</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-[#202824]">
                      <Check className="w-4 h-4 text-[#174530] shrink-0 mt-0.5" />
                      <span>{t.onboarding.lawyerRoleFeature2}</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-[#202824]">
                      <Check className="w-4 h-4 text-[#174530] shrink-0 mt-0.5" />
                      <span>{t.onboarding.lawyerRoleFeature3}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[#D5E5D9]/60 space-y-2.5">
                  <button
                    type="button"
                    onClick={() => handleSelectRole("lawyer", "signup")}
                    className="w-full py-3 px-4 rounded-xl bg-[#174530] hover:bg-[#0f2c1f] text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs hover:shadow-md cursor-pointer"
                  >
                    <span>
                      {isHindi ? "अधिवक्ता के रूप में जारी रखें" : "Continue as Advocate"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-center text-[11px] text-[#69736D]">
                    {isHindi ? "बार काउंसिल ऑफ इंडिया अनुपालक" : "BCI Compliant Practice Suite"}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Security Assurance */}
            <div className="flex items-center justify-center gap-2 text-xs text-[#69736D] font-mono text-center">
              <ShieldCheck className="w-4 h-4 text-[#205C43]" />
              <span>{t.onboarding.secureNotice}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
