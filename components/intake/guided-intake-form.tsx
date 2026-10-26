"use client";

import React, { useState } from "react";
import {
  Scale,
  Briefcase,
  AlertTriangle,
  MapPin,
  Calendar,
  Send,
  PhoneCall,
  Shield,
  HelpCircle,
  FileText,
  UserCheck,
  CheckCircle2,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { IntakeIntent, GuidedFormData } from "@/lib/intake/fact-types";

interface GuidedIntakeFormProps {
  isHindi: boolean;
  selectedState: string;
  onStateChange: (state: string) => void;
  onSubmit: (formData: GuidedFormData) => void;
  isLoading: boolean;
  voiceMicSlot?: React.ReactNode;
  initialDescription?: string;
}

const INDIAN_STATES = [
  "All India (General)",
  "Delhi (NCT)",
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "Uttar Pradesh",
  "West Bengal",
  "Telangana",
  "Gujarat",
  "Kerala",
  "Rajasthan",
  "Punjab & Haryana",
  "Madhya Pradesh",
  "Bihar",
  "Odisha",
  "Andhra Pradesh",
];

const TOPICS = [
  { id: "criminal", en: "Police & Criminal Procedure (BNS/BNSS)", hi: "पुलिस व आपराधिक प्रक्रिया (BNS/BNSS)" },
  { id: "property", en: "Property, Tenancy & RERA", hi: "संपत्ति, किराया व रेरा (RERA)" },
  { id: "consumer", en: "Consumer Complaint & Service Deficiency", hi: "उपभोक्ता शिकायत व सेवा में कमी" },
  { id: "cheque", en: "Cheque Bounce (NI Act Sec 138)", hi: "चेक बाउंस (एनआई एक्ट धारा 138)" },
  { id: "labour", en: "Employment, Withheld Salary & Labour", hi: "नौकरी, रोका गया वेतन व श्रम कानून" },
  { id: "family", en: "Family, Matrimonial & Maintenance", hi: "पारिवारिक, वैवाहिक व भरण-पोषण" },
  { id: "cyber", en: "Cyber Fraud & Online Scams", hi: "साइबर धोखाधड़ी व ऑनलाइन ठगी" },
  { id: "general", en: "Other Civil or General Matter", hi: "अन्य दीवानी या सामान्य विषय" },
];

export function GuidedIntakeForm({
  isHindi,
  selectedState,
  onStateChange,
  onSubmit,
  isLoading,
  voiceMicSlot,
  initialDescription = "",
}: GuidedIntakeFormProps) {
  const [intent, setIntent] = useState<IntakeIntent>("understand_position");
  const [legalTopic, setLegalTopic] = useState(TOPICS[0].en);
  const [district, setDistrict] = useState("");
  const [dateOfIncident, setDateOfIncident] = useState("");
  const [userRole, setUserRole] = useState("Aggrieved / Complainant");
  const [desiredOutcome, setDesiredOutcome] = useState("Understand rights & next steps");
  const [description, setDescription] = useState(initialDescription);
  const [questionsForAdvocate, setQuestionsForAdvocate] = useState("");
  const [useSimpleMode, setUseSimpleMode] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setValidationError(
        isHindi
          ? "कृपया अपनी स्थिति या कानूनी प्रश्न का विवरण दर्ज करें।"
          : "Please describe your legal situation or question to continue."
      );
      return;
    }
    setValidationError(null);

    onSubmit({
      intent,
      legalTopic,
      state: selectedState,
      district,
      dateOfIncident,
      userRole,
      desiredOutcome,
      description: description.trim(),
      specificQuestions: questionsForAdvocate.trim() || undefined,
    });
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* 1. THREE CLEAR WAYS TO BEGIN */}
      <div className="space-y-2">
        <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-[#69736D]">
          {isHindi ? "1. शुरुआत कैसे करना चाहते हैं? (उद्देश्य चुनें):" : "1. How would you like to begin? (Select your goal):"}
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Option 1: Understand Legal Position */}
          <button
            type="button"
            onClick={() => setIntent("understand_position")}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 relative ${
              intent === "understand_position"
                ? "bg-[#EAF3ED] border-[#205C43] ring-2 ring-[#205C43]/20 shadow-sm"
                : "bg-white border-[#D5E5D9] hover:border-[#205C43]/50 hover:bg-[#F8FAF9]"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  intent === "understand_position"
                    ? "bg-[#205C43] text-white"
                    : "bg-[#EAF3ED] text-[#205C43]"
                }`}
              >
                <Scale className="w-5 h-5" />
              </div>
              {intent === "understand_position" && (
                <CheckCircle2 className="w-4 h-4 text-[#205C43]" />
              )}
            </div>
            <div>
              <h4 className="font-semibold text-xs sm:text-sm text-[#202824]">
                {isHindi ? "कानूनी स्थिति समझें" : "Understand my legal position"}
              </h4>
              <p className="text-[11px] text-[#69736D] mt-0.5 leading-relaxed">
                {isHindi
                  ? "लागू संविधिक धाराएँ, अपने अधिकार और उपलब्ध विधिक उपाय जानें।"
                  : "Discover applicable Indian statutes, your rights, and actionable remedies."}
              </p>
            </div>
          </button>

          {/* Option 2: Prepare for Lawyer Consultation */}
          <button
            type="button"
            onClick={() => setIntent("prepare_consultation")}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 relative ${
              intent === "prepare_consultation"
                ? "bg-[#EAF3ED] border-[#205C43] ring-2 ring-[#205C43]/20 shadow-sm"
                : "bg-white border-[#D5E5D9] hover:border-[#205C43]/50 hover:bg-[#F8FAF9]"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  intent === "prepare_consultation"
                    ? "bg-[#205C43] text-white"
                    : "bg-[#EAF3ED] text-[#205C43]"
                }`}
              >
                <Briefcase className="w-5 h-5" />
              </div>
              {intent === "prepare_consultation" && (
                <CheckCircle2 className="w-4 h-4 text-[#205C43]" />
              )}
            </div>
            <div>
              <h4 className="font-semibold text-xs sm:text-sm text-[#202824]">
                {isHindi ? "वकील से मिलने की तैयारी करें" : "Prepare for a lawyer consultation"}
              </h4>
              <p className="text-[11px] text-[#69736D] mt-0.5 leading-relaxed">
                {isHindi
                  ? "तथ्य सारांश, समय-सीमा और वकील से पूछने योग्य प्रश्नों की सूची बनाएं।"
                  : "Organize timeline, essential documents, and targeted questions for an advocate."}
              </p>
            </div>
          </button>

          {/* Option 3: Urgent Help */}
          <button
            type="button"
            onClick={() => setIntent("urgent_help")}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 relative ${
              intent === "urgent_help"
                ? "bg-red-50/70 border-red-400 ring-2 ring-red-400/20 shadow-sm"
                : "bg-white border-[#D5E5D9] hover:border-red-300 hover:bg-red-50/30"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  intent === "urgent_help"
                    ? "bg-red-600 text-white"
                    : "bg-red-100 text-red-700"
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              {intent === "urgent_help" && (
                <CheckCircle2 className="w-4 h-4 text-red-600" />
              )}
            </div>
            <div>
              <h4 className="font-semibold text-xs sm:text-sm text-[#202824]">
                {isHindi ? "मुझे तत्काल सहायता चाहिए" : "I need urgent help"}
              </h4>
              <p className="text-[11px] text-[#69736D] mt-0.5 leading-relaxed">
                {isHindi
                  ? "आपातकालीन नंबर, तत्काल सुरक्षा व त्वरित विधिक सहायता मार्गदर्शन।"
                  : "Emergency helplines, immediate safety steps, and critical next actions."}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* EMERGENCY HELPLINES (Visible immediately if Urgent Help is selected) */}
      {intent === "urgent_help" && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <PhoneCall className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-red-900 text-xs sm:text-sm">
                {isHindi ? "आपातकालीन सरकारी हेल्पलाइन (Emergency Helplines):" : "Official Government Emergency Helplines:"}
              </h5>
              <p className="text-[11px] text-red-800 mt-0.5">
                {isHindi
                  ? "यदि आप या कोई अन्य व्यक्ति शारीरिक खतरे या तत्काल अपराध की स्थिति में है, तो तुरंत संपर्क करें:"
                  : "If you are facing imminent danger, physical threat, or immediate cyber financial loss, contact official authorities now:"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
            <a
              href="tel:112"
              className="p-2 rounded-lg bg-white border border-red-200 hover:bg-red-100/50 flex flex-col items-center justify-center text-center font-bold text-red-800"
            >
              <span className="text-sm">112</span>
              <span className="text-[10px] font-sans font-normal text-red-700">
                {isHindi ? "अखिल भारतीय पुलिस/आपातकाल" : "All-India Police / Emergency"}
              </span>
            </a>
            <a
              href="tel:1091"
              className="p-2 rounded-lg bg-white border border-red-200 hover:bg-red-100/50 flex flex-col items-center justify-center text-center font-bold text-red-800"
            >
              <span className="text-sm">1091 / 181</span>
              <span className="text-[10px] font-sans font-normal text-red-700">
                {isHindi ? "महिला हेल्पलाइन" : "Women in Distress Helpline"}
              </span>
            </a>
            <a
              href="tel:1930"
              className="p-2 rounded-lg bg-white border border-red-200 hover:bg-red-100/50 flex flex-col items-center justify-center text-center font-bold text-red-800"
            >
              <span className="text-sm">1930</span>
              <span className="text-[10px] font-sans font-normal text-red-700">
                {isHindi ? "साइबर वित्तीय धोखाधड़ी" : "Cyber Financial Fraud"}
              </span>
            </a>
            <a
              href="tel:15100"
              className="p-2 rounded-lg bg-white border border-red-200 hover:bg-red-100/50 flex flex-col items-center justify-center text-center font-bold text-red-800"
            >
              <span className="text-sm">15100</span>
              <span className="text-[10px] font-sans font-normal text-red-700">
                {isHindi ? "नालसा विधिक सहायता" : "NALSA Free Legal Aid"}
              </span>
            </a>
          </div>

          <p className="text-[10.5px] text-red-700 italic border-t border-red-200 pt-2">
            {isHindi
              ? "न्यायलिंक एक सूचनात्मक एआई प्रणाली है, कोई आपातकालीन पुलिस डिस्पैच सेवा नहीं। अत्यधिक आपातकाल में सीधे 112 पर कॉल करें।"
              : "NyayLink is an informational guidance platform, not a live emergency dispatch service. For active emergencies, contact 112 directly."}
          </p>
        </div>
      )}

      {/* 2. GUIDED INTAKE FORM WITH PROGRESSIVE DISCLOSURE */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Toggle between Structured Fields and Free-text mode */}
        <div className="flex items-center justify-between text-xs">
          <label className="font-mono font-semibold uppercase tracking-wider text-[#69736D]">
            {isHindi ? "2. स्थिति का विवरण दर्ज करें:" : "2. Enter your situation details:"}
          </label>
          <button
            type="button"
            onClick={() => setUseSimpleMode(!useSimpleMode)}
            className="text-[#205C43] hover:underline text-[11px] font-semibold cursor-pointer"
          >
            {useSimpleMode
              ? (isHindi ? "विस्तृत संरचित फ़ॉर्म दिखाएं" : "Show Guided Fields")
              : (isHindi ? "केवल सीधे शब्दों में लिखें" : "Describe in own words only")}
          </button>
        </div>

        {!useSimpleMode && (
          <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] space-y-3.5 text-xs">
            {/* Row 1: Legal Topic & State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#202824] mb-1">
                  {isHindi ? "कानूनी विषय / श्रेणी" : "Legal Domain / Topic"}
                </label>
                <select
                  value={legalTopic}
                  onChange={(e) => setLegalTopic(e.target.value)}
                  className="w-full p-2 rounded-lg bg-white border border-[#D5E5D9] text-[#202824] text-xs focus:ring-1 focus:ring-[#205C43] outline-none"
                >
                  {TOPICS.map((t) => (
                    <option key={t.id} value={t.en}>
                      {isHindi ? t.hi : t.en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#202824] mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#205C43]" />
                  <span>{isHindi ? "राज्य (अधिकार क्षेत्र)" : "State (Jurisdiction)"}</span>
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => onStateChange(e.target.value)}
                  className="w-full p-2 rounded-lg bg-white border border-[#D5E5D9] text-[#202824] text-xs focus:ring-1 focus:ring-[#205C43] outline-none"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Date of Incident & User Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#202824] mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#205C43]" />
                  <span>{isHindi ? "घटना / लेनदेन की अनुमानित तिथि" : "Date of Incident / Cause"}</span>
                </label>
                <input
                  type="text"
                  value={dateOfIncident}
                  onChange={(e) => setDateOfIncident(e.target.value)}
                  placeholder={isHindi ? "उदा. पिछले सप्ताह, 15 मार्च 2026..." : "e.g., Last Friday, March 15, 2026..."}
                  className="w-full p-2 rounded-lg bg-white border border-[#D5E5D9] text-[#202824] text-xs focus:ring-1 focus:ring-[#205C43] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#202824] mb-1 flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-[#205C43]" />
                  <span>{isHindi ? "आपकी भूमिका" : "Your Role in Matter"}</span>
                </label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="w-full p-2 rounded-lg bg-white border border-[#D5E5D9] text-[#202824] text-xs focus:ring-1 focus:ring-[#205C43] outline-none"
                >
                  <option value="Aggrieved / Complainant">
                    {isHindi ? "पीड़ित / शिकायतकर्ता (Complainant)" : "Aggrieved / Complainant"}
                  </option>
                  <option value="Accused / Respondent">
                    {isHindi ? "प्रतिवादी / आरोपी (Respondent/Accused)" : "Accused / Respondent"}
                  </option>
                  <option value="Tenant / Homebuyer">
                    {isHindi ? "किरायेदार / घर खरीदार (Tenant/Buyer)" : "Tenant / Homebuyer"}
                  </option>
                  <option value="Employee / Consumer">
                    {isHindi ? "कर्मचारी / उपभोक्ता (Employee/Consumer)" : "Employee / Consumer"}
                  </option>
                  <option value="Other">{isHindi ? "अन्य" : "Other"}</option>
                </select>
              </div>
            </div>

            {/* Row 3: Conditional fields based on intent */}
            {intent === "prepare_consultation" && (
              <div>
                <label className="block text-[11px] font-medium text-[#205C43] mb-1">
                  {isHindi
                    ? "वकील से पूछने योग्य विशिष्ट प्रश्न (वैकल्पिक):"
                    : "Specific questions you want to ask your advocate (optional):"}
                </label>
                <input
                  type="text"
                  value={questionsForAdvocate}
                  onChange={(e) => setQuestionsForAdvocate(e.target.value)}
                  placeholder={
                    isHindi
                      ? "उदा. क्या नोटिस का उत्तर देना अनिवार्य है? अदालती खर्च कितना आएगा?"
                      : "e.g., Is statutory notice mandatory? What is the limitation period?"
                  }
                  className="w-full p-2 rounded-lg bg-white border border-[#D5E5D9] text-[#202824] text-xs focus:ring-1 focus:ring-[#205C43] outline-none"
                />
              </div>
            )}
          </div>
        )}

        {/* Narrative Free-Text Input */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-[#202824]">
            {isHindi
              ? "विस्तार से बताएं क्या हुआ (तथ्य, अनुबंध, संवाद या नोटिस का विवरण):"
              : "Describe what happened in your own words (facts, agreements, notices):"}
          </label>
          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder={
                isHindi
                  ? "अपनी स्थिति स्पष्ट रूप से लिखें (उदा. मकान मालिक ने 4 महीने से डिपॉजिट नहीं लौटाया, पुलिस में शिकायत की स्थिति, चेक अनादर)..."
                  : "Explain the key facts clearly (e.g., landlord refused to return 4 months security deposit without cause, employer withheld settlement, notice received)..."
              }
              className="w-full p-3 pr-12 rounded-xl bg-white border border-[#D5E5D9] text-[#202824] text-xs sm:text-sm focus:ring-2 focus:ring-[#205C43]/20 focus:border-[#205C43] outline-none transition-all resize-y"
            />
            {voiceMicSlot && (
              <div className="absolute right-3 bottom-3">
                {voiceMicSlot}
              </div>
            )}
          </div>
        </div>

        {validationError && (
          <p className="text-xs text-red-600 font-medium">{validationError}</p>
        )}

        {/* REQUIRED PRIVACY NOTICE (PHASE 1) */}
        <div className="p-3 rounded-xl bg-[#FFFDF7] border border-[#E8DCC0] text-[11px] text-[#7A5E1A] space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-[#665220]">
            <Shield className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
            <span>
              {isHindi ? "एआई कानूनी जानकारी — विधिक सलाह नहीं" : "AI legal information — not legal advice"}
            </span>
          </div>
          <p className="text-[#665220] leading-relaxed">
            {isHindi
              ? "कृपया नाम, आधार संख्या, फ़ोन नंबर, ओटीपी, पासवर्ड या अत्यधिक गोपनीय व्यक्तिगत दस्तावेज़ दर्ज न करें। आपका संदेश हमारे कॉन्फ़िगर किए गए एआई सेवा प्रदाता (Groq / OpenRouter) द्वारा संसाधित किया जा सकता है।"
              : "Please do not enter names, Aadhaar numbers, phone numbers, OTPs, passwords or confidential documents. Your message may be processed by our configured AI service provider (Groq / OpenRouter)."}
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-5 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-60 cursor-pointer"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{isHindi ? "विश्लेषण किया जा रहा है..." : "Processing Intake..."}</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>{isHindi ? "एआई पूर्व-परामर्श शुरू करें" : "Begin AI Preconsultation"}</span>
              <Send className="w-3.5 h-3.5 ml-1" />
            </span>
          )}
        </button>
      </form>
    </div>
  );
}
