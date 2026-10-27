"use client";

import React, { useState } from "react";
import {
  Scale,
  X,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  Copy,
  Check,
} from "lucide-react";
import {
  INDIAN_COURT_COMPLEXES,
  validateCNRNumber,
  getOfficialECourtsUrl,
} from "@/lib/court-data/ecourts-adapter";
import { trackCourtCase } from "@/app/actions/case-tracking";
import { useLanguage } from "@/lib/i18n/context";

interface CaseTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  matters?: Array<{ id: string; title: string }>;
}

export function CaseTrackerModal({
  isOpen,
  onClose,
  onSuccess,
  matters = [],
}: CaseTrackerModalProps) {
  const { isHindi } = useLanguage();

  const [cnrNumber, setCnrNumber] = useState("");
  const [courtComplex, setCourtComplex] = useState<string>(INDIAN_COURT_COMPLEXES[1]); // Delhi High Court
  const [caseType, setCaseType] = useState("Criminal Appeal");
  const [caseNumber, setCaseNumber] = useState("");
  const [caseYear, setCaseYear] = useState<number>(new Date().getFullYear());
  const [petitioner, setPetitioner] = useState("");
  const [respondent, setRespondent] = useState("");
  const [nextHearingDate, setNextHearingDate] = useState("");
  const [courtHall, setCourtHall] = useState("");
  const [purposeOfHearing, setPurposeOfHearing] = useState("Arguments / Hearing");
  const [selectedMatterId, setSelectedMatterId] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCNR, setCopiedCNR] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  if (!isOpen) return null;

  // Realtime CNR format validation
  const cnrValidation = cnrNumber.trim() ? validateCNRNumber(cnrNumber.trim()) : null;
  const officialUrl = getOfficialECourtsUrl(cnrNumber.trim() || undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseNumber.trim() || !caseYear) return;

    if (cnrNumber.trim() && !cnrValidation?.isValid) {
      setFeedback({
        type: "error",
        message: cnrValidation?.error || "Invalid CNR format.",
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await trackCourtCase({
        cnrNumber: cnrNumber.trim() || undefined,
        courtComplex,
        caseType,
        caseNumber: caseNumber.trim(),
        caseYear,
        petitioner: petitioner.trim() || undefined,
        respondent: respondent.trim() || undefined,
        nextHearingDate: nextHearingDate || undefined,
        courtHall: courtHall.trim() || undefined,
        purposeOfHearing: purposeOfHearing.trim() || undefined,
        matterId: selectedMatterId || null,
      });

      if (res.success) {
        setFeedback({
          type: "success",
          message: isHindi
            ? "केस सफलता से ट्रैक किया गया। सुनवाई की तारीख कैलेंडर में जुड़ गई है।"
            : "Case tracked successfully. Hearing date integrated into your legal calendar.",
        });
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1200);
      } else {
        throw new Error(res.error || "Failed to track case");
      }
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Error tracking court case.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-[#D5E5D9] max-w-2xl w-full p-6 sm:p-8 shadow-xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#D5E5D9]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#205C43]" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#205C43] font-bold">
                {isHindi ? "ई-कोर्ट्स वाद ट्रैकिंग" : "ECOURTS CAUSE-LIST TRACKING"}
              </span>
            </div>
            <h2 className="text-xl font-serif font-bold text-[#202824]">
              {isHindi ? "अदालती मामला ट्रैक करें व कैलेंडर में जोड़ें" : "Track Court Case & Cause List"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#69736D] hover:text-[#202824] hover:bg-[#F8FAF9] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Provenance Notice */}
        <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-[#202824]">
            <ShieldAlert className="w-4 h-4 text-[#205C43]" />
            <span>{isHindi ? "डेटा स्रोत व प्रामाणिकता" : "Source Provenance & eCourts Portal Link"}</span>
          </div>
          <p className="text-[#69736D] text-[11px] leading-relaxed">
            {isHindi
              ? "सार्वजनिक ई-कोर्ट्स सेवा पोर्टल से सत्यापित करने के लिए सीधा लिंक उपलब्ध है। आपके द्वारा दर्ज की गई सुनवाई तिथि 'User-Entered' के रूप में कैलेंडर में सहेजी जाएगी।"
              : "Manual tracking workflow with official eCourts Services portal verification. Hearing entries are truthfully marked as user-entered with timestamped provenance."}
          </p>
          <div className="pt-1 flex items-center gap-3 flex-wrap">
            {cnrValidation?.isValid && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(cnrValidation.cleanCNR);
                    setCopiedCNR(true);
                    setTimeout(() => setCopiedCNR(false), 2000);
                  } catch (err) {
                    console.warn("Copy failed:", err);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-[#D5E5D9] text-[11px] text-[#202824] hover:bg-[#F4FAF6] font-medium"
              >
                {copiedCNR ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">{isHindi ? "कॉपी हो गया!" : "Copied CNR!"}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#205C43]" />
                    <span>{isHindi ? "सीएनआर कॉपी करें" : "Copy CNR"}</span>
                  </>
                )}
              </button>
            )}

            <a
              href={officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#205C43] text-white text-[11px] hover:bg-[#174530] font-semibold"
            >
              <span>{isHindi ? "आधिकारिक ई-कोर्ट्स केस खोज खोलें" : "Open official eCourts case search"}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
              feedback.type === "success"
                ? "bg-[#EAF3ED] border border-[#D5E5D9] text-[#174530]"
                : "bg-rose-50 border border-rose-200 text-rose-800"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-[#205C43] shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* CNR Number (16 chars) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase text-[#69736D] font-semibold">
                CNR Number (eCourts 16-Character ID)
              </label>
              {cnrValidation && (
                <span
                  className={`text-[10px] font-mono ${
                    cnrValidation.isValid ? "text-[#205C43]" : "text-amber-700"
                  }`}
                >
                  {cnrValidation.isValid ? "✓ Valid CNR Format" : cnrValidation.error}
                </span>
              )}
            </div>
            <input
              type="text"
              value={cnrNumber}
              onChange={(e) => setCnrNumber(e.target.value.toUpperCase())}
              placeholder="e.g. DLHC010123452024"
              maxLength={18}
              className="w-full h-10 px-3 rounded-lg border border-[#D5E5D9] bg-[#FDFEFC] text-xs font-mono tracking-wider text-[#202824] uppercase outline-none focus:border-[#205C43]"
            />
          </div>

          {/* Court Complex & Case Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-[#69736D] font-semibold">
                Court Complex / Forum *
              </label>
              <select
                value={courtComplex}
                onChange={(e) => setCourtComplex(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#D5E5D9] bg-[#F8FAF9] text-xs text-[#202824] outline-none cursor-pointer"
              >
                {INDIAN_COURT_COMPLEXES.map((court) => (
                  <option key={court} value={court}>
                    {court}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-[#69736D] font-semibold">
                Case Type / Category *
              </label>
              <input
                type="text"
                required
                value={caseType}
                onChange={(e) => setCaseType(e.target.value)}
                placeholder="e.g. Criminal Appeal, Bail App, Writ Petition"
                className="w-full h-10 px-3 rounded-lg border border-[#D5E5D9] bg-white text-xs text-[#202824] outline-none focus:border-[#205C43]"
              />
            </div>
          </div>

          {/* Case Number & Year */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-[#69736D] font-semibold">
                Case Number *
              </label>
              <input
                type="text"
                required
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                placeholder="e.g. 4821"
                className="w-full h-10 px-3 rounded-lg border border-[#D5E5D9] bg-white text-xs text-[#202824] outline-none focus:border-[#205C43]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-[#69736D] font-semibold">
                Filing Year *
              </label>
              <input
                type="number"
                required
                min={1950}
                max={2030}
                value={caseYear}
                onChange={(e) => setCaseYear(parseInt(e.target.value) || 2026)}
                className="w-full h-10 px-3 rounded-lg border border-[#D5E5D9] bg-white text-xs text-[#202824] outline-none focus:border-[#205C43]"
              />
            </div>

            <div className="col-span-2 sm:col-span-1 space-y-1">
              <label className="text-xs font-mono uppercase text-[#69736D] font-semibold">
                Court Hall / Room
              </label>
              <input
                type="text"
                value={courtHall}
                onChange={(e) => setCourtHall(e.target.value)}
                placeholder="e.g. Court Room 14"
                className="w-full h-10 px-3 rounded-lg border border-[#D5E5D9] bg-white text-xs text-[#202824] outline-none focus:border-[#205C43]"
              />
            </div>
          </div>

          {/* Parties: Petitioner vs Respondent */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-[#69736D] font-semibold">
                Petitioner / Complainant
              </label>
              <input
                type="text"
                value={petitioner}
                onChange={(e) => setPetitioner(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full h-10 px-3 rounded-lg border border-[#D5E5D9] bg-white text-xs text-[#202824] outline-none focus:border-[#205C43]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-[#69736D] font-semibold">
                Respondent / Opposite Party
              </label>
              <input
                type="text"
                value={respondent}
                onChange={(e) => setRespondent(e.target.value)}
                placeholder="e.g. State of NCT of Delhi & Anr."
                className="w-full h-10 px-3 rounded-lg border border-[#D5E5D9] bg-white text-xs text-[#202824] outline-none focus:border-[#205C43]"
              />
            </div>
          </div>

          {/* Hearing Date & Purpose */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-[#69736D] font-semibold">
                Next Hearing Date (Syncs to Calendar)
              </label>
              <input
                type="date"
                value={nextHearingDate}
                onChange={(e) => setNextHearingDate(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#D5E5D9] bg-white text-xs text-[#202824] outline-none focus:border-[#205C43]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-[#69736D] font-semibold">
                Purpose of Listing
              </label>
              <input
                type="text"
                value={purposeOfHearing}
                onChange={(e) => setPurposeOfHearing(e.target.value)}
                placeholder="e.g. Final Arguments / Notice Returnable"
                className="w-full h-10 px-3 rounded-lg border border-[#D5E5D9] bg-white text-xs text-[#202824] outline-none focus:border-[#205C43]"
              />
            </div>
          </div>

          {/* Link to Matter */}
          {matters.length > 0 && (
            <div className="space-y-1 pt-1">
              <label className="text-xs font-mono uppercase text-[#69736D] font-semibold">
                Associate with NyayLink Legal Matter (Optional)
              </label>
              <select
                value={selectedMatterId}
                onChange={(e) => setSelectedMatterId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#D5E5D9] bg-[#F8FAF9] text-xs text-[#202824] outline-none cursor-pointer"
              >
                <option value="">No Matter Association</option>
                {matters.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D5E5D9]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#D5E5D9] text-xs font-semibold text-[#69736D] hover:bg-[#F8FAF9] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !caseNumber.trim()}
              className="px-5 py-2 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-40"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Tracking Case...</span>
                </>
              ) : (
                <>
                  <Scale className="w-3.5 h-3.5" />
                  <span>Track & Add Hearing to Calendar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
