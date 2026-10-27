"use client";

import React, { useState } from "react";
import {
  Scale,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  ShieldAlert,
  Info,
  ChevronDown,
  ChevronUp,
  FileText,
  Save,
  Edit2,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import {
  cleanCNR,
  formatCNR,
  validateCNRNumber,
  getOfficialPortalLink,
  getProvenanceLabel,
  INDIAN_COURT_COMPLEXES,
  STANDARD_CASE_TYPES,
  CaseProvenanceType,
  CaseVerificationStatus,
} from "@/lib/court-data/ecourts-adapter";
import { updateMatterECourtsDetails } from "@/app/actions/ecourts";
import { LegalMatter } from "@/lib/portal/types";

interface ECourtsCaseLookupPanelProps {
  matter: LegalMatter;
  userRole?: "client" | "lawyer" | "admin";
  onUpdated?: () => void;
  compact?: boolean;
}

export function ECourtsCaseLookupPanel({
  matter,
  userRole = "client",
  onUpdated,
  compact = false,
}: ECourtsCaseLookupPanelProps) {
  const { isHindi } = useLanguage();

  // Initial state derived from matter
  const initialCNR = matter.cnr_number || "";
  const initialCourt = matter.court_complex || INDIAN_COURT_COMPLEXES[1]; // Delhi High Court default
  const initialType = matter.case_type || STANDARD_CASE_TYPES[0];
  const initialNumber = matter.case_number || "";
  const initialYear = matter.case_year || new Date().getFullYear();
  const initialStatus = matter.court_status || "";
  const initialHearingDate = matter.court_hearing_date || "";

  // Form State
  const [cnrInput, setCnrInput] = useState(initialCNR);
  const [courtComplex, setCourtComplex] = useState(initialCourt);
  const [caseType, setCaseType] = useState(initialType);
  const [caseNumber, setCaseNumber] = useState(initialNumber);
  const [caseYear, setCaseYear] = useState<number>(initialYear);
  const [courtStatus, setCourtStatus] = useState(initialStatus);
  const [outcomeSummary, setOutcomeSummary] = useState("");
  const [nextHearingDate, setNextHearingDate] = useState(initialHearingDate);
  const [syncCalendar, setSyncCalendar] = useState(true);

  // UI state
  const [isEditingDocket, setIsEditingDocket] = useState(!initialCNR);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);

  // Live CNR Validation
  const cnrValidation = cnrInput.trim() ? validateCNRNumber(cnrInput.trim()) : null;
  const portalInfo = getOfficialPortalLink(courtComplex, cnrInput.trim() || undefined);

  // Provenance Label
  const defaultSource: CaseProvenanceType =
    userRole === "lawyer" ? "advocate_manual_entry" : "user_manual_entry";
  const provenance = getProvenanceLabel(
    (matter.court_status_source as CaseProvenanceType) || defaultSource,
    "user_entered" as CaseVerificationStatus,
    isHindi
  );

  const handleCopyCNR = async () => {
    const textToCopy = cnrValidation?.cleanCNR || cleanCNR(cnrInput);
    if (!textToCopy) return;

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for older devices/contexts
        const textarea = document.createElement("textarea");
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn("Clipboard write failed:", err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (cnrInput.trim() && cnrValidation && !cnrValidation.isValid) {
      setFeedback({
        type: "error",
        message: cnrValidation.error || "Please provide a valid 16-character CNR.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await updateMatterECourtsDetails({
        matterId: matter.id,
        cnrNumber: cnrInput.trim() || undefined,
        courtComplex,
        caseType,
        caseNumber: caseNumber.trim() || undefined,
        caseYear,
        courtStatus: courtStatus.trim() || undefined,
        outcomeSummary: outcomeSummary.trim() || undefined,
        nextHearingDate: nextHearingDate || undefined,
        syncCalendar,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to update case details.");
      }

      setFeedback({
        type: "success",
        message: isHindi
          ? "ई-कोर्ट्स वाद विवरण व मैनुअल स्थिति सफलतापूर्वक दर्ज की गई।"
          : "eCourts case record and manual status updated successfully.",
      });
      setIsEditingDocket(false);
      setOutcomeSummary("");
      onUpdated?.();
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Update failed.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cleanCurrentCNR = cnrValidation?.cleanCNR || cleanCNR(matter.cnr_number || "");
  const formattedCurrentCNR = cleanCurrentCNR ? formatCNR(cleanCurrentCNR) : null;

  return (
    <div
      className={`rounded-2xl border border-[#D5E5D9] bg-white shadow-xs ${
        compact ? "p-4 space-y-4" : "p-5 sm:p-6 space-y-6"
      }`}
    >
      {/* 1. Header with Official Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#D5E5D9]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center text-[#205C43] shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-serif font-bold text-[#202824]">
                {isHindi ? "आधिकारिक ई-कोर्ट्स केस खोज व वाद ट्रैकिंग" : "Official eCourts Case Search & Docket Tracking"}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold uppercase bg-[#EAF3ED] text-[#205C43] border border-[#205C43]/20">
                {isHindi ? "मैनुअल आधिकारिक खोज" : "Manual Official Lookup"}
              </span>
            </div>
            <p className="text-xs text-[#69736D] mt-0.5">
              {isHindi
                ? "आधिकारिक सरकारी पोर्टल (services.ecourts.gov.in) पर केस स्थिति खोजें व सत्यापन रिकॉर्ड रखें।"
                : "Deep link to official government portal (services.ecourts.gov.in) with manual provenance tracking."}
            </p>
          </div>
        </div>

        {/* Edit Docket Toggle */}
        <button
          type="button"
          onClick={() => setIsEditingDocket(!isEditingDocket)}
          className="text-xs font-semibold text-[#205C43] hover:text-[#174530] flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-lg hover:bg-[#F4FAF6] border border-transparent hover:border-[#D5E5D9] transition-all"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>{isEditingDocket ? (isHindi ? "रद्द करें" : "Close Edit") : (isHindi ? "सीएनआर / कोर्ट बदलें" : "Edit CNR / Forum")}</span>
        </button>
      </div>

      {/* Feedback Messages */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          {feedback.type === "success" ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span className="leading-relaxed">{feedback.message}</span>
        </div>
      )}

      {/* 2. CNR Showcase & 1-Click Action Bar */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* CNR Details */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#69736D]">
              {isHindi ? "केस राष्ट्रीय पहचान संख्या (CNR)" : "Case National Identifier (CNR Number)"}
            </span>
            <div className="flex items-center gap-2.5 flex-wrap">
              {cleanCurrentCNR ? (
                <>
                  <span className="text-base sm:text-lg font-mono font-bold text-[#202824] tracking-wide bg-white px-3 py-1 rounded-lg border border-[#D5E5D9] shadow-2xs select-all">
                    {formattedCurrentCNR || cleanCurrentCNR}
                  </span>
                  <span className="text-[11px] font-mono text-[#205C43] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                    {isHindi ? "16-अंकीय प्रारूप मान्य" : "16-Char Format Valid"}
                  </span>
                </>
              ) : (
                <span className="text-xs text-[#69736D] italic">
                  {isHindi
                    ? "कोई सीएनआर लिंक नहीं है। नीचे सीएनआर दर्ज करें।"
                    : "No CNR linked to this matter yet. Enter CNR below."}
                </span>
              )}
            </div>
            {matter.cnr_number && cleanCurrentCNR !== matter.cnr_number && (
              <p className="text-[10px] font-mono text-[#69736D]">
                Original Input: {matter.cnr_number}
              </p>
            )}
          </div>

          {/* Action Buttons: Copy CNR + Open Official Portal */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {cleanCurrentCNR && (
              <button
                type="button"
                onClick={handleCopyCNR}
                className="h-10 px-4 rounded-xl bg-white hover:bg-[#F4FAF6] border border-[#D5E5D9] text-xs font-semibold text-[#202824] flex items-center gap-2 transition-all shadow-2xs active:scale-95"
                title="Copy 16-character CNR without hyphens"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">{isHindi ? "कॉपी हो गया!" : "Copied CNR!"}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#205C43]" />
                    <span>{isHindi ? "सीएनआर कॉपी करें" : "Copy CNR"}</span>
                  </>
                )}
              </button>
            )}

            <a
              href={portalInfo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 px-4 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs active:scale-95"
            >
              <span>{isHindi ? "आधिकारिक ई-कोर्ट्स केस खोज खोलें" : "Open official eCourts case search"}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Forum and Case Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#D5E5D9]/70 text-xs">
          <div>
            <span className="text-[10px] font-mono text-[#69736D] uppercase block">
              {isHindi ? "न्यायालय / फोरम" : "Court / Forum"}
            </span>
            <span className="font-medium text-[#202824] line-clamp-1">
              {matter.court_complex || courtComplex}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-[#69736D] uppercase block">
              {isHindi ? "केस संदर्भ संख्या" : "Case Registration"}
            </span>
            <span className="font-medium text-[#202824]">
              {matter.case_number
                ? `${matter.case_type || "Case"} ${matter.case_number}/${matter.case_year || ""}`
                : isHindi
                ? "दर्ज नहीं"
                : "Not Provided"}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-[#69736D] uppercase block">
              {isHindi ? "मैनुअल स्थिति" : "Recorded Status"}
            </span>
            <span className="font-medium text-[#202824]">
              {matter.court_status || (isHindi ? "प्रतीक्षित" : "Pending Manual Check")}
            </span>
          </div>
        </div>
      </div>

      {/* 3. External Portal & CAPTCHA Guidance Note */}
      <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/90 text-xs text-amber-950 space-y-2">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-amber-950 text-xs">
              {isHindi ? "बाहरी सरकारी वेबसाइट व कैप्चा सुरक्षा निर्देश" : "External Government Portal & CAPTCHA Notice"}
            </h4>
            <p className="text-[11px] leading-relaxed text-amber-900">
              {isHindi ? portalInfo.hindiDisclaimer : portalInfo.disclaimer}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowInstructions(!showInstructions)}
          className="text-[11px] font-semibold text-amber-900 underline flex items-center gap-1 mt-1"
        >
          <span>{showInstructions ? (isHindi ? "निर्देश छुपाएं" : "Hide 3-Step Search Guide") : (isHindi ? "3-चरणीय खोज निर्देश देखें" : "View 3-Step Search Guide")}</span>
          {showInstructions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {showInstructions && (
          <ol className="list-decimal pl-5 space-y-1 text-[11px] text-amber-900 pt-1 border-t border-amber-200/60 leading-relaxed">
            <li>
              <strong>{isHindi ? "सीएनआर कॉपी करें:" : "Copy CNR:"}</strong>{" "}
              {isHindi
                ? "ऊपर दिए गए 'सीएनआर कॉपी करें' बटन पर क्लिक करें।"
                : "Click the 'Copy CNR' button above to copy the 16-character identifier."}
            </li>
            <li>
              <strong>{isHindi ? "आधिकारिक पोर्टल खोलें:" : "Open Official Portal:"}</strong>{" "}
              {isHindi
                ? "पोर्टल बटन पर क्लिक करें। आधिकारिक वेबसाइट एक नए टैब में खुलेगी।"
                : "Click 'Open official eCourts case search'. The government portal opens in a new tab."}
            </li>
            <li>
              <strong>{isHindi ? "सीएनआर पेस्ट करें व कैप्चा भरें:" : "Paste CNR & Solve CAPTCHA:"}</strong>{" "}
              {isHindi
                ? "पोर्टल पर सीएनआर पेस्ट करें, सरकारी सुरक्षा कैप्चा हल करें और आधिकारिक आदेश व वाद सूची देखें।"
                : "Paste the CNR into the portal's search box, solve the official graphic CAPTCHA, and view cause lists/orders."}
            </li>
            <li>
              <strong>{isHindi ? "मैनुअल परिणाम दर्ज करें:" : "Record Outcome Here:"}</strong>{" "}
              {isHindi
                ? "यहाँ वापस आएं और अगली सुनवाई की तारीख व प्रक्रियात्मक स्थिति को अपने सुरक्षित रिकॉर्ड में सहेजें।"
                : "Return here to record the next hearing date and status outcome in your privileged docket."}
            </li>
          </ol>
        )}
      </div>

      {/* 4. Docket Information Form (Collapsible / Toggleable) */}
      {isEditingDocket && (
        <form onSubmit={handleSave} className="p-4 sm:p-5 rounded-xl bg-white border border-[#D5E5D9] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#D5E5D9]">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#202824] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#205C43]" />
              <span>{isHindi ? "सीएनआर व न्यायालय विवरण संपादित करें" : "Link or Edit CNR & Court Details"}</span>
            </h4>
            <span className="text-[10px] font-mono text-[#69736D]">
              {isHindi ? "क्लाइंट व अधिवक्ता के लिए सुरक्षित" : "Protected under Matter RLS"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* CNR Input */}
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-[11px] font-mono font-semibold uppercase text-[#202824]">
                {isHindi ? "16-अंकीय सीएनआर संख्या" : "16-Character CNR Number"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cnrInput}
                  onChange={(e) => setCnrInput(e.target.value)}
                  placeholder="e.g. DLHC01-001234-2024 or MHCC020056782023"
                  className="w-full h-10 px-3 font-mono text-xs rounded-xl border border-[#D5E5D9] bg-[#F8FAF9] focus:bg-white focus:outline-none focus:border-[#205C43] transition-all uppercase"
                />
              </div>
              {cnrValidation && !cnrValidation.isValid && (
                <p className="text-[11px] text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{cnrValidation.error}</span>
                </p>
              )}
              {cnrValidation && cnrValidation.isValid && (
                <p className="text-[11px] text-emerald-700 flex items-center gap-1 mt-1 font-mono">
                  <Check className="w-3 h-3 shrink-0" />
                  <span>{isHindi ? "मान्य सीएनआर प्रारूप" : "Format Valid"}: {cnrValidation.formattedCNR} ({cnrValidation.stateCode} {cnrValidation.establishmentCode})</span>
                </p>
              )}
            </div>

            {/* Court Complex */}
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-[11px] font-mono font-semibold uppercase text-[#202824]">
                {isHindi ? "न्यायालय परिसर / उच्च न्यायालय" : "Court Complex / Jurisdiction"}
              </label>
              <select
                value={courtComplex}
                onChange={(e) => setCourtComplex(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#D5E5D9] text-xs bg-white focus:outline-none focus:border-[#205C43]"
              >
                {INDIAN_COURT_COMPLEXES.map((court) => (
                  <option key={court} value={court}>
                    {court}
                  </option>
                ))}
              </select>
            </div>

            {/* Case Type */}
            <div className="space-y-1">
              <label className="block text-[11px] font-mono font-semibold uppercase text-[#202824]">
                {isHindi ? "केस प्रकार" : "Case Type"}
              </label>
              <select
                value={caseType}
                onChange={(e) => setCaseType(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#D5E5D9] text-xs bg-white focus:outline-none focus:border-[#205C43]"
              >
                {STANDARD_CASE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Case Number & Year */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-[11px] font-mono font-semibold uppercase text-[#202824]">
                  {isHindi ? "केस सं." : "Case No."}
                </label>
                <input
                  type="text"
                  value={caseNumber}
                  onChange={(e) => setCaseNumber(e.target.value)}
                  placeholder="e.g. 1234"
                  className="w-full h-10 px-3 rounded-xl border border-[#D5E5D9] text-xs bg-[#F8FAF9] focus:bg-white focus:outline-none focus:border-[#205C43]"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-mono font-semibold uppercase text-[#202824]">
                  {isHindi ? "वर्ष" : "Year"}
                </label>
                <input
                  type="number"
                  value={caseYear}
                  onChange={(e) => setCaseYear(parseInt(e.target.value, 10) || new Date().getFullYear())}
                  className="w-full h-10 px-3 rounded-xl border border-[#D5E5D9] text-xs bg-[#F8FAF9] focus:bg-white focus:outline-none focus:border-[#205C43]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditingDocket(false)}
              className="px-4 py-2 rounded-xl border border-[#D5E5D9] text-xs font-semibold text-[#69736D] hover:bg-[#F8FAF9]"
            >
              {isHindi ? "रद्द करें" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? (isHindi ? "सहेज रहे हैं..." : "Saving...") : (isHindi ? "सीएनआर सहेजें" : "Save Docket Info")}</span>
            </button>
          </div>
        </form>
      )}

      {/* 5. Manual Status & Outcome Record Card */}
      <form onSubmit={handleSave} className="p-4 sm:p-5 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#D5E5D9]">
          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#202824]">
              {isHindi ? "मैनुअल केस परिणाम व सुनवाई तारीख दर्ज करें" : "Record Manually Checked Outcome & Next Hearing"}
            </h4>
            <p className="text-[11px] text-[#69736D] mt-0.5">
              {isHindi
                ? "ई-कोर्ट्स पोर्टल पर देखे गए परिणामों को अपने केस टाइमलाइन में दर्ज करें।"
                : "Record verified findings from your eCourts search directly into your case timeline."}
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-medium bg-amber-50 text-amber-800 border-amber-200">
            {isHindi ? "उपयोगकर्ता प्रविष्टि" : "User-Entered"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Latest Status */}
          <div className="space-y-1">
            <label className="block text-[11px] font-mono font-semibold uppercase text-[#202824]">
              {isHindi ? "नवीनतम वाद स्थिति" : "Latest Procedural Status"}
            </label>
            <input
              type="text"
              value={courtStatus}
              onChange={(e) => setCourtStatus(e.target.value)}
              placeholder="e.g. Arguments in Progress, Notice Issued, Reserved for Orders"
              className="w-full h-10 px-3 rounded-xl border border-[#D5E5D9] text-xs bg-white focus:outline-none focus:border-[#205C43]"
            />
          </div>

          {/* Next Hearing Date */}
          <div className="space-y-1">
            <label className="block text-[11px] font-mono font-semibold uppercase text-[#202824]">
              {isHindi ? "अगली सुनवाई की तारीख (यदि लागू हो)" : "Next Hearing Date (If Listed)"}
            </label>
            <input
              type="date"
              value={nextHearingDate}
              onChange={(e) => setNextHearingDate(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[#D5E5D9] text-xs bg-white focus:outline-none focus:border-[#205C43]"
            />
          </div>

          {/* Outcome Notes / Summary */}
          <div className="sm:col-span-2 space-y-1">
            <label className="block text-[11px] font-mono font-semibold uppercase text-[#202824]">
              {isHindi ? "आदेश / सुनवाई सारांश या अधिवक्ता नोट्स" : "Hearing Outcome / Order Summary / Chamber Notes"}
            </label>
            <textarea
              value={outcomeSummary}
              onChange={(e) => setOutcomeSummary(e.target.value)}
              rows={2}
              placeholder="e.g. Interim stay extended until next date. Counter-affidavit to be filed within 2 weeks."
              className="w-full p-3 rounded-xl border border-[#D5E5D9] text-xs bg-white focus:outline-none focus:border-[#205C43] leading-relaxed resize-none"
            />
          </div>

          {/* Calendar Checkbox */}
          {nextHearingDate && (
            <div className="sm:col-span-2 p-3 rounded-xl bg-white border border-[#D5E5D9] flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#202824]">
                <input
                  type="checkbox"
                  checked={syncCalendar}
                  onChange={(e) => setSyncCalendar(e.target.checked)}
                  className="rounded text-[#205C43] focus:ring-[#205C43] w-4 h-4"
                />
                <span>
                  {isHindi
                    ? "इस सुनवाई की तारीख को कानूनी कैलेंडर में जोड़ें (उपयोगकर्ता-दर्ज के रूप में चिह्नित)"
                    : "Add this hearing date to your legal calendar (marked as user-entered hearing)"}
                </span>
              </label>
              <span className="text-[10px] font-mono text-[#69736D] shrink-0">
                {isHindi ? "कोई गुप्त अधिलेखन नहीं" : "No Silent Overwrites"}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] text-[#69736D]">
            {isHindi
              ? "यह प्रविष्टि केस टाइमलाइन में स्पष्ट रूप से 'उपयोगकर्ता-दर्ज' के रूप में संग्रहीत होगी।"
              : "This entry will be logged with full timestamped provenance in your matter timeline."}
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all disabled:opacity-50 shrink-0"
          >
            <Save className="w-3.5 h-3.5" />
            <span>
              {isSubmitting
                ? isHindi
                  ? "सहेज रहे हैं..."
                  : "Recording..."
                : isHindi
                ? "मैनुअल परिणाम दर्ज करें"
                : "Record Manual Check"}
            </span>
          </button>
        </div>
      </form>

      {/* 6. Provenance & Source Labeling Box */}
      <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] text-xs space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#69736D] shrink-0" />
            <span className="font-semibold text-[#202824]">
              {isHindi ? "डेटा स्रोत व प्रामाणिकता सूचना" : "Data Provenance & Source Authentication"}
            </span>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold uppercase ${provenance.badgeStyle}`}>
            {provenance.badgeText}
          </span>
        </div>
        <p className="text-[11px] text-[#69736D] leading-relaxed">
          {provenance.description}
        </p>
        <div className="pt-2 border-t border-[#D5E5D9]/60 flex items-center justify-between text-[10px] font-mono text-[#69736D]">
          <span>
            {isHindi ? "अंतिम मैनुअल जांच:" : "Last Checked:"}{" "}
            {matter.court_last_checked_at
              ? new Date(matter.court_last_checked_at).toLocaleString()
              : isHindi
              ? "अभी तक जाँचा नहीं गया"
              : "Never Checked"}
          </span>
          <span>
            {isHindi ? "स्रोत प्रकार:" : "Source:"}{" "}
            {matter.court_status_source || "user_manual_entry"}
          </span>
        </div>
      </div>
    </div>
  );
}
