"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  ShieldCheck,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  X,
  FileText,
  Search,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { LawyerReadyBrief } from "@/lib/intake/brief-types";
import { shareBriefWithAdvocate, getAdvocatesForHandoff } from "@/app/actions/briefs";

export interface SelectedAdvocate {
  id: string;
  professional_name: string;
  city?: string;
  state?: string;
  practice_areas?: string[];
  experience_years?: number;
  verification_status?: string;
}

interface AdvocateHandoffDialogProps {
  isOpen: boolean;
  onClose: () => void;
  brief: LawyerReadyBrief;
  initialAdvocate?: SelectedAdvocate | null;
  isHindi?: boolean;
}

export function AdvocateHandoffDialog({
  isOpen,
  onClose,
  brief,
  initialAdvocate = null,
  isHindi = false,
}: AdvocateHandoffDialogProps) {
  const [selectedLawyer, setSelectedLawyer] = useState<SelectedAdvocate | null>(initialAdvocate);
  const [availableLawyers, setAvailableLawyers] = useState<SelectedAdvocate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingLawyers, setIsLoadingLawyers] = useState(false);

  // Consent checkbox MUST be initially unchecked
  const [hasAgreedToShare, setHasAgreedToShare] = useState(false);
  const [clientNotes, setClientNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    handoffId: string;
    lawyerName: string;
    consultationId?: string;
  } | null>(null);

  // Sync initial advocate
  useEffect(() => {
    if (initialAdvocate) {
      setSelectedLawyer(initialAdvocate);
    }
  }, [initialAdvocate]);

  // Load verified advocates if none pre-selected
  useEffect(() => {
    if (isOpen && !initialAdvocate) {
      setIsLoadingLawyers(true);
      getAdvocatesForHandoff()
        .then((res) => {
          if (res.success && res.advocates) {
            setAvailableLawyers(res.advocates);
            if (!selectedLawyer && res.advocates.length > 0) {
              setSelectedLawyer(res.advocates[0]);
            }
          }
        })
        .catch((err) => {
          console.error("Failed to fetch advocates for handoff:", err);
        })
        .finally(() => {
          setIsLoadingLawyers(false);
        });
    }
  }, [isOpen, initialAdvocate]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLawyer) {
      setErrorNotice(
        isHindi
          ? "कृपया सारांश साझा करने के लिए एक सत्यापित अधिवक्ता का चयन करें।"
          : "Please select a verified advocate to receive your brief."
      );
      return;
    }

    if (!hasAgreedToShare) {
      setErrorNotice(
        isHindi
          ? "आपको आगे बढ़ने से पहले सहमति बॉक्स को चेक करना होगा।"
          : "You must explicitly check the consent box to share this brief."
      );
      return;
    }

    setIsSubmitting(true);
    setErrorNotice(null);

    try {
      const res = await shareBriefWithAdvocate({
        briefId: brief.id,
        lawyerId: selectedLawyer.id,
        briefSnapshot: brief,
        consentGiven: hasAgreedToShare,
        clientNotes: clientNotes.trim() || undefined,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to share brief with advocate.");
      }

      setSuccessResult({
        handoffId: res.handoffId || "",
        lawyerName: res.lawyerName || selectedLawyer.professional_name,
        consultationId: res.consultationId,
      });
    } catch (err: unknown) {
      setErrorNotice(err instanceof Error ? err.message : "Sharing failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLawyers = availableLawyers.filter((l) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.professional_name.toLowerCase().includes(q) ||
      (l.city && l.city.toLowerCase().includes(q)) ||
      l.practice_areas?.some((a) => a.toLowerCase().includes(q))
    );
  });

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl border border-[#D5E5D9] shadow-2xl flex flex-col overflow-hidden text-[#202824]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="handoff-dialog-title"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#F8FAF9] border-b border-[#D5E5D9] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EAF3ED] text-[#205C43] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="handoff-dialog-title"
                className="text-sm font-semibold text-[#202824]"
              >
                {isHindi
                  ? "अधिवक्ता के साथ सुरक्षित विधिक सारांश साझाकरण"
                  : "Secure Advocate Brief Handoff"}
              </h2>
              <p className="text-[11px] text-[#69736D]">
                {isHindi
                  ? "सहमति-आधारित गोपनीयता और बार काउंसिल संविधिक सुरक्षा"
                  : "Consent-based privacy & Bar Council fiduciary protection"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#69736D] hover:bg-[#EAF3ED] hover:text-[#202824] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success View */}
        {successResult ? (
          <div className="p-8 text-center space-y-5 overflow-y-auto">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-serif font-bold text-[#202824]">
                {isHindi ? "विधिक सारांश सफलतापूर्वक साझा किया गया" : "Legal Brief Shared Successfully"}
              </h3>
              <p className="text-xs text-[#69736D] max-w-md mx-auto leading-relaxed">
                {isHindi
                  ? `आपका पूर्व-परामर्श सारांश अधिवक्ता ${successResult.lawyerName} के सुरक्षित कक्ष इनबॉक्स में स्थानांतरित कर दिया गया है।`
                  : `Your preconsultation brief has been securely transmitted to Advocate ${successResult.lawyerName}'s chamber inbox.`}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between items-center text-[11px] text-[#69736D]">
                <span>{isHindi ? "हैंडऑफ संदर्भ आईडी:" : "Handoff Reference ID:"}</span>
                <span className="font-mono text-[#205C43] font-semibold">{successResult.handoffId.slice(0, 13)}...</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-[#69736D]">
                <span>{isHindi ? "स्थिति:" : "Status:"}</span>
                <span className="font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold">
                  {isHindi ? "प्रतीक्षारत समीक्षा" : "Pending Advocate Review"}
                </span>
              </div>
              <p className="text-[10.5px] text-[#69736D] italic pt-1 border-t border-[#D5E5D9]/60">
                {isHindi
                  ? "यदि आप अपना विचार बदलते हैं, तो आप इसे अपने क्लाइंट डैशबोर्ड से किसी भी समय वापस/रद्द कर सकते हैं।"
                  : "You can withdraw or revoke this brief at any time from your client dashboard before the advocate accepts it."}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/dashboard?tab=consultations"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <span>{isHindi ? "डैशबोर्ड में ट्रैक करें" : "Track in My Dashboard"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white border border-[#D5E5D9] text-[#69736D] hover:bg-[#F8FAF9] text-xs font-medium transition-colors"
              >
                {isHindi ? "बंद करें" : "Close"}
              </button>
            </div>
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleShareSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Error Banner */}
            {errorNotice && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorNotice}</span>
              </div>
            )}

            {/* Recipient Advocate Selection */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-[#202824] flex items-center justify-between">
                <span>{isHindi ? "प्राप्तकर्ता अधिवक्ता का चयन करें:" : "Select Recipient Advocate:"}</span>
                {selectedLawyer && (
                  <span className="text-[11px] text-[#205C43] font-mono flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{isHindi ? "सत्यापित अधिवक्ता" : "Bar Council Verified"}</span>
                  </span>
                )}
              </label>

              {/* If no advocate preselected, show search and cards */}
              {!initialAdvocate && (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#69736D]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={
                        isHindi
                          ? "अधिवक्ता का नाम, शहर या कार्यक्षेत्र खोजें..."
                          : "Search advocate by name, city, or practice area..."
                      }
                      className="w-full pl-9 pr-3 py-2 text-xs border border-[#D5E5D9] rounded-xl bg-[#F8FAF9] focus:bg-white focus:outline-none focus:border-[#205C43]"
                    />
                  </div>

                  {isLoadingLawyers ? (
                    <div className="p-6 text-center text-xs text-[#69736D] flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#205C43]" />
                      <span>{isHindi ? "सत्यापित अधिवक्ता लोड हो रहे हैं..." : "Loading verified advocates..."}</span>
                    </div>
                  ) : (
                    <div className="max-h-40 overflow-y-auto border border-[#D5E5D9] rounded-xl divide-y divide-[#D5E5D9]/60">
                      {filteredLawyers.map((lawyer) => {
                        const isSelected = selectedLawyer?.id === lawyer.id;
                        return (
                          <button
                            key={lawyer.id}
                            type="button"
                            onClick={() => setSelectedLawyer(lawyer)}
                            className={`w-full p-2.5 text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                              isSelected ? "bg-[#EAF3ED] font-semibold text-[#205C43]" : "hover:bg-[#F8FAF9]"
                            }`}
                          >
                            <div>
                              <div className="font-medium text-[#202824]">{lawyer.professional_name}</div>
                              <div className="text-[11px] text-[#69736D]">
                                {lawyer.city || "All India"} • {lawyer.experience_years || 5}+ yrs exp •{" "}
                                {lawyer.practice_areas?.slice(0, 2).join(", ") || "General Practice"}
                              </div>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-[#205C43] shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Selected Advocate Card */}
              {selectedLawyer && (
                <div className="p-3.5 rounded-xl bg-[#EAF3ED]/60 border border-[#205C43]/30 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-[#174530]">
                      {selectedLawyer.professional_name}
                    </h4>
                    <p className="text-[11px] text-[#69736D]">
                      {selectedLawyer.city || "India"} •{" "}
                      {selectedLawyer.practice_areas?.slice(0, 3).join(", ") || "Advocate"}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono bg-white text-[#205C43] px-2 py-0.5 rounded border border-[#205C43]/30">
                    {isHindi ? "पंजीकृत अधिवक्ता" : "Advocate on Record"}
                  </span>
                </div>
              )}
            </div>

            {/* What Will Be Shared Preview */}
            <div className="space-y-2 p-3.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] text-xs">
              <span className="text-[11px] font-mono uppercase text-[#69736D] font-bold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#205C43]" />
                <span>{isHindi ? "साझा की जाने वाली जानकारी का पूर्वावलोकन:" : "What Will Be Shared:"}</span>
              </span>

              <div className="space-y-1 text-xs text-[#202824]">
                <p>
                  <strong>{isHindi ? "मुद्दे का सारांश: " : "Issue Summary: "}</strong>
                  <span className="text-[#69736D]">{brief.issueSummary.slice(0, 160)}...</span>
                </p>
                <p>
                  <strong>{isHindi ? "तथ्य और अनुमान: " : "Separated Facts: "}</strong>
                  <span className="text-[#69736D]">
                    {brief.facts.filter((f) => f.userConfirmed).length}{" "}
                    {isHindi ? "पुष्टीकृत तथ्य" : "confirmed facts"},{" "}
                    {brief.facts.filter((f) => f.isAiInference).length}{" "}
                    {isHindi ? "एआई अनुमान" : "AI inferences"}
                  </span>
                </p>
                <p>
                  <strong>{isHindi ? "अधिवक्ता हेतु प्रश्न: " : "Questions for Advocate: "}</strong>
                  <span className="text-[#69736D]">
                    {brief.questionsForAdvocate.length}{" "}
                    {isHindi ? "तैयार किए गए प्रश्न" : "editable preliminary questions"}
                  </span>
                </p>
                {brief.documentsMentioned.length > 0 && (
                  <p className="text-[11px] text-amber-800">
                    ⚠️ <strong>{isHindi ? "उल्लिखित दस्तावेज़: " : "Mentioned Documents: "}</strong>
                    <span>
                      {brief.documentsMentioned.map((d) => d.name).join(", ")} (
                      {isHindi ? "केवल उल्लिखित — वास्तविक फाइलें संलग्न नहीं हैं" : "mentioned only — no files attached"}
                      )
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Optional Personal Note to Advocate */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#202824] flex items-center justify-between">
                <span>
                  {isHindi
                    ? "अधिवक्ता के लिए अतिरिक्त व्यक्तिगत टिप्पणी (वैकल्पिक):"
                    : "Additional Note for Advocate (Optional):"}
                </span>
                <span className="text-[10px] text-[#69736D] font-mono">
                  {clientNotes.length}/300
                </span>
              </label>
              <textarea
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value.slice(0, 300))}
                rows={2}
                placeholder={
                  isHindi
                    ? "उदा. मैं अगले सप्ताह सोमवार या मंगलवार को परामर्श हेतु उपलब्ध हूँ..."
                    : "e.g., I am available for a conference call next Tuesday morning..."
                }
                className="w-full p-2.5 text-xs border border-[#D5E5D9] rounded-xl bg-white focus:outline-none focus:border-[#205C43]"
              />
            </div>

            {/* Mandatory Unchecked Consent Checkbox */}
            <div className="p-3.5 rounded-xl bg-[#FFFDF7] border border-[#E8DCC0] space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="handoff-consent-checkbox"
                  checked={hasAgreedToShare}
                  onChange={(e) => setHasAgreedToShare(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[#C5A059] text-[#205C43] focus:ring-[#205C43] cursor-pointer"
                />
                <span className="text-xs font-semibold text-[#7A5E1A] leading-snug">
                  {isHindi
                    ? "मैं इस विधिक सारांश को मेरे द्वारा चयनित अधिवक्ता के साथ साझा करने की स्पष्ट सहमति देता/देती हूँ।"
                    : "I agree to share this summary with the advocate I select."}
                </span>
              </label>

              <p className="text-[10.5px] text-[#7A5E1A]/80 pl-6 leading-relaxed">
                {isHindi
                  ? "अधिवक्ता अधिनियम, 1961 और बार काउंसिल आचार संहिता के तहत वकील मुवक्किल की गोपनीयता बनाए रखने के लिए बाध्य हैं। यह सारांश किसी अन्य तृतीय पक्ष के साथ साझा नहीं किया जाता है।"
                  : "Under the Advocates Act, 1961 and Bar Council rules, advocates are bound to maintain client confidentiality. This brief is strictly restricted to your selected advocate."}
              </p>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#D5E5D9]">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-[#D5E5D9] text-[#69736D] hover:bg-[#F8FAF9] text-xs font-medium transition-colors"
              >
                {isHindi ? "रद्द करें" : "Cancel"}
              </button>

              <button
                type="submit"
                disabled={!hasAgreedToShare || !selectedLawyer || isSubmitting}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                  hasAgreedToShare && selectedLawyer && !isSubmitting
                    ? "bg-[#205C43] hover:bg-[#174530] text-white"
                    : "bg-[#D5E5D9] text-[#69736D] cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{isHindi ? "साझा किया जा रहा है..." : "Transmitting Brief..."}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>
                      {isHindi
                        ? `अधिवक्ता ${selectedLawyer?.professional_name || ""} के साथ साझा करें`
                        : `Share brief with ${selectedLawyer?.professional_name || "Advocate"}`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
