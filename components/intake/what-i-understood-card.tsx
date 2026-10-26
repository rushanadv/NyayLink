"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Edit2,
  Trash2,
  Plus,
  Scale,
  Calendar,
  Clock,
  MapPin,
  Check,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { IntakeFacts, FactItem, DateItem } from "@/lib/intake/fact-types";
import { extractFactsFromText } from "@/lib/intake/fact-extractor";

interface WhatIUnderstoodCardProps {
  inquiryText: string;
  answerText?: string;
  jurisdiction?: string;
  isHindi: boolean;
  factsData?: IntakeFacts | null;
  onConfirmFacts?: (confirmed: IntakeFacts) => void;
}

export function WhatIUnderstoodCard({
  inquiryText,
  answerText = "",
  jurisdiction,
  isHindi,
  factsData,
  onConfirmFacts,
}: WhatIUnderstoodCardProps) {
  // Initialize facts from factsData or extract from inquiryText
  const [currentFacts, setCurrentFacts] = useState<IntakeFacts>(() => {
    if (factsData) return factsData;
    return extractFactsFromText(inquiryText, jurisdiction);
  });

  const [editingFactId, setEditingFactId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [newFactText, setNewFactText] = useState("");
  const [isAddingFact, setIsAddingFact] = useState(false);
  const [confirmSuccessNotice, setConfirmSuccessNotice] = useState(false);
  const [dateConfirmInputs, setDateConfirmInputs] = useState<Record<string, string>>({});

  // Sync if parent updates factsData
  useEffect(() => {
    if (factsData) {
      setCurrentFacts(factsData);
    }
  }, [factsData]);

  // Edit Handlers
  const handleStartEdit = (fact: FactItem) => {
    setEditingFactId(fact.id);
    setEditText(fact.statement);
  };

  const handleSaveEdit = (factId: string) => {
    if (!editText.trim()) return;
    setCurrentFacts((prev) => ({
      ...prev,
      facts: prev.facts.map((f) =>
        f.id === factId ? { ...f, statement: editText.trim(), userConfirmed: true } : f
      ),
      hasConfirmed: false, // Reset confirmed status on edit
    }));
    setEditingFactId(null);
  };

  const handleDeleteFact = (factId: string) => {
    setCurrentFacts((prev) => ({
      ...prev,
      facts: prev.facts.filter((f) => f.id !== factId),
      hasConfirmed: false,
    }));
  };

  const handleAddFact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFactText.trim()) return;
    const newFact: FactItem = {
      id: `fact-user-${Date.now()}`,
      statement: newFactText.trim(),
      sourceText: newFactText.trim(),
      userConfirmed: true,
      isAiInference: false,
    };
    setCurrentFacts((prev) => ({
      ...prev,
      facts: [...prev.facts, newFact],
      hasConfirmed: false,
    }));
    setNewFactText("");
    setIsAddingFact(false);
  };

  // Confirm relative date into exact date
  const handleConfirmDate = (dateId: string) => {
    const val = dateConfirmInputs[dateId];
    if (!val || !val.trim()) return;

    setCurrentFacts((prev) => ({
      ...prev,
      dates: prev.dates.map((d) =>
        d.id === dateId
          ? { ...d, confirmedDate: val.trim(), needsConfirmation: false }
          : d
      ),
      hasConfirmed: false,
    }));
  };

  // Supply answer to a missing fact item
  const handleResolveMissingFact = (missingIndex: number, answerStr: string) => {
    if (!answerStr.trim()) return;
    const newFact: FactItem = {
      id: `fact-resolved-${Date.now()}`,
      statement: answerStr.trim(),
      sourceText: answerStr.trim(),
      userConfirmed: true,
      isAiInference: false,
    };
    setCurrentFacts((prev) => ({
      ...prev,
      facts: [...prev.facts, newFact],
      missingFacts: prev.missingFacts.filter((_, i) => i !== missingIndex),
      hasConfirmed: false,
    }));
  };

  // Genuine "Confirm Facts" Action
  const handleConfirmAction = async () => {
    const confirmed: IntakeFacts = {
      ...currentFacts,
      hasConfirmed: true,
      confirmedAt: new Date().toISOString(),
      facts: currentFacts.facts.map((f) => ({ ...f, userConfirmed: true })),
    };

    setCurrentFacts(confirmed);
    setConfirmSuccessNotice(true);
    setTimeout(() => setConfirmSuccessNotice(false), 4500);

    // Call parent handler
    if (onConfirmFacts) {
      onConfirmFacts(confirmed);
    }

    // Persist to server
    try {
      await fetch("/api/intake/extract-facts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "confirm",
          confirmedFacts: confirmed,
        }),
      });
    } catch {
      // Local state is authoritative
    }
  };

  const urgencyLabels = {
    urgent: isHindi ? "तत्काल कार्रवाई आवश्यक" : "Immediate Attention",
    time_sensitive: isHindi ? "समय-संवेदनशील (सीमावधि लागू)" : "Time Sensitive (Deadlines Apply)",
    normal: isHindi ? "सामान्य प्रक्रिया" : "Standard Timeline",
    unknown: isHindi ? "अज्ञात" : "Unspecified",
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D5E5D9]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center text-[#205C43]">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-serif font-bold text-[#202824] uppercase tracking-wider">
              {isHindi ? "जो हमने समझा" : "What I Understood"}
            </h3>
            <p className="text-[11px] text-[#69736D]">
              {isHindi
                ? "आपके द्वारा बताए गए तथ्यों की संरचित समीक्षा। कृपया जांचें और पुष्टि करें।"
                : "Structured summary of your legal situation. Review, edit, and confirm."}
            </p>
          </div>
        </div>

        {/* Confirmation Status Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {currentFacts.hasConfirmed ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-[#EAF3ED] text-[#205C43] px-2.5 py-1 rounded-full border border-[#D5E5D9]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#205C43]" />
              <span>{isHindi ? "तथ्य आपके द्वारा पुष्टीकृत हैं" : "Facts Confirmed by You"}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-[#FFFDF7] text-[#92600E] px-2.5 py-1 rounded-full border border-[#FDE68A]">
              <AlertCircle className="w-3.5 h-3.5 text-[#D97706]" />
              <span>{isHindi ? "समीक्षा और पुष्टि प्रतीक्षित" : "Review & Confirmation Pending"}</span>
            </span>
          )}
        </div>
      </div>

      {/* Confirmation Success Toast Banner */}
      {confirmSuccessNotice && (
        <div className="p-3 rounded-xl bg-[#EAF3ED] border border-[#205C43]/30 text-xs text-[#205C43] flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 shrink-0 text-[#205C43]" />
          <span className="font-medium">
            {isHindi
              ? "तथ्य सफलतापूर्वक पुष्टीकृत हो गए हैं। आगामी कानूनी उत्तर और वकील परामर्श में इन पुष्ट तथ्यों का उपयोग होगा।"
              : "Facts successfully confirmed. Subsequent legal guidance and lawyer consultation will rely on these verified facts."}
          </span>
        </div>
      )}

      {/* Overview Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* Domain / Practice Area */}
        <div className="p-3 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9]/80 space-y-0.5">
          <span className="text-[10px] font-mono text-[#69736D] uppercase block font-semibold">
            {isHindi ? "संभावित कानूनी क्षेत्र" : "Possible Practice Area"}
          </span>
          <p className="font-semibold text-[#202824]">
            {currentFacts.possiblePracticeAreas.length > 0
              ? currentFacts.possiblePracticeAreas.join(", ")
              : (isHindi ? "सामान्य कानूनी परामर्श" : "General Legal Orientation")}
          </p>
        </div>

        {/* Applicable Jurisdiction */}
        <div className="p-3 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9]/80 space-y-0.5">
          <span className="text-[10px] font-mono text-[#69736D] uppercase block font-semibold">
            {isHindi ? "अधिकार क्षेत्र" : "Jurisdiction"}
          </span>
          <p className="font-semibold text-[#202824] flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#205C43]" />
            <span>
              {currentFacts.jurisdiction.state || (isHindi ? "अनिर्दिष्ट राज्य" : "Unspecified State")}
            </span>
          </p>
        </div>

        {/* Timeline / Urgency */}
        <div className="p-3 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9]/80 space-y-0.5">
          <span className="text-[10px] font-mono text-[#69736D] uppercase block font-semibold">
            {isHindi ? "समय-संवेदनशीलता" : "Time Sensitivity"}
          </span>
          <p
            className={`font-semibold flex items-center gap-1 ${
              currentFacts.urgency === "urgent"
                ? "text-red-700"
                : currentFacts.urgency === "time_sensitive"
                ? "text-amber-700"
                : "text-[#202824]"
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>{urgencyLabels[currentFacts.urgency]}</span>
          </p>
        </div>
      </div>

      {/* Dates & Timeline Section */}
      {currentFacts.dates.length > 0 && (
        <div className="space-y-2 p-3 rounded-xl bg-[#FFFDF7] border border-[#FDE68A]/70 text-xs">
          <span className="text-[11px] font-mono uppercase text-[#92600E] font-bold flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#D97706]" />
            <span>{isHindi ? "उल्लिखित तिथियाँ व समय-सीमा:" : "Timeline & Dates Mentioned:"}</span>
          </span>

          <div className="space-y-2">
            {currentFacts.dates.map((dateItem) => (
              <div
                key={dateItem.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-white rounded-lg border border-[#FDE68A]"
              >
                <div>
                  <span className="font-semibold text-[#202824]">
                    &quot;{dateItem.originalText}&quot;
                  </span>
                  {dateItem.confirmedDate && (
                    <span className="ml-2 text-[11px] text-[#205C43] font-medium">
                      → {isHindi ? "पुष्टीकृत तिथि:" : "Confirmed Date:"} {dateItem.confirmedDate}
                    </span>
                  )}
                  {dateItem.needsConfirmation && !dateItem.confirmedDate && (
                    <span className="ml-2 text-[10.5px] text-[#B45309] font-medium">
                      ({isHindi ? "सापेक्षिक संदर्भ — वैधानिक समय-सीमा हेतु कैलेंडर तिथि पुष्ट करें" : "Relative reference — confirm calendar date for limitation"})
                    </span>
                  )}
                </div>

                {dateItem.needsConfirmation && !dateItem.confirmedDate && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <input
                      type="date"
                      value={dateConfirmInputs[dateItem.id] || ""}
                      onChange={(e) =>
                        setDateConfirmInputs((prev) => ({
                          ...prev,
                          [dateItem.id]: e.target.value,
                        }))
                      }
                      className="px-2 py-0.5 border border-[#D5E5D9] rounded text-xs bg-white text-[#202824]"
                      aria-label="Confirm exact date"
                    />
                    <button
                      type="button"
                      onClick={() => handleConfirmDate(dateItem.id)}
                      className="px-2 py-0.5 bg-[#205C43] text-white rounded text-[11px] font-medium hover:bg-[#174530]"
                    >
                      {isHindi ? "पुष्ट करें" : "Confirm"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editable Facts List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase text-[#69736D] font-bold">
            {isHindi ? "मुख्य तथ्य (सुधारें या नया जोड़ें):" : "Key Facts (Review or Correct):"}
          </span>
          {!isAddingFact && (
            <button
              type="button"
              onClick={() => setIsAddingFact(true)}
              className="text-[11px] text-[#205C43] hover:underline inline-flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isHindi ? "तथ्य जोड़ें" : "Add Fact"}</span>
            </button>
          )}
        </div>

        {/* Fact Items */}
        <div className="space-y-2">
          {currentFacts.facts.map((fact, index) => (
            <div
              key={fact.id}
              className="p-3 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9]/70 flex flex-col sm:flex-row sm:items-start justify-between gap-2 text-xs"
            >
              {editingFactId === fact.id ? (
                <div className="w-full space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full p-2 border border-[#205C43] rounded-lg bg-white text-[#202824] text-xs focus:outline-none"
                    rows={2}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(fact.id)}
                      className="px-2.5 py-1 bg-[#205C43] text-white rounded-md text-[11px] font-medium hover:bg-[#174530]"
                    >
                      {isHindi ? "सहेजें" : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingFactId(null)}
                      className="px-2.5 py-1 bg-white border border-[#D5E5D9] text-[#69736D] rounded-md text-[11px]"
                    >
                      {isHindi ? "रद्द करें" : "Cancel"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#EAF3ED] text-[#205C43] font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <div className="space-y-1">
                      <p className="text-[#202824] font-medium leading-relaxed">
                        {fact.statement}
                      </p>
                      <div className="flex items-center gap-2">
                        {fact.userConfirmed ? (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-[#205C43] font-medium">
                            <Check className="w-3 h-3 text-[#205C43]" />
                            <span>{isHindi ? "आपके द्वारा पुष्ट" : "Confirmed by you"}</span>
                          </span>
                        ) : fact.isAiInference ? (
                          <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                            {isHindi ? "एआई अनुमान" : "AI inference"}
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#69736D] bg-white px-1.5 py-0.5 rounded border border-[#D5E5D9]">
                            {isHindi ? "आपके विवरण से" : "From your description"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-start">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(fact)}
                      className="p-1 text-[#69736D] hover:text-[#205C43] rounded hover:bg-white"
                      title="Edit fact"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteFact(fact.id)}
                      className="p-1 text-[#69736D] hover:text-red-600 rounded hover:bg-white"
                      title="Remove fact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Add New Fact Input */}
          {isAddingFact && (
            <form
              onSubmit={handleAddFact}
              className="p-3 rounded-xl bg-white border border-[#205C43] space-y-2 text-xs"
            >
              <textarea
                value={newFactText}
                onChange={(e) => setNewFactText(e.target.value)}
                placeholder={
                  isHindi
                    ? "तथ्य लिखें (उदा. चेक 10 मार्च को दिया गया था)..."
                    : "Describe the specific factual point..."
                }
                className="w-full p-2 border border-[#D5E5D9] rounded-lg bg-white text-[#202824] text-xs focus:outline-none"
                rows={2}
                autoFocus
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-[#205C43] text-white rounded-md text-[11px] font-medium hover:bg-[#174530]"
                >
                  {isHindi ? "जोड़ें" : "Add Fact"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingFact(false)}
                  className="px-2.5 py-1 bg-white border border-[#D5E5D9] text-[#69736D] rounded-md text-[11px]"
                >
                  {isHindi ? "रद्द करें" : "Cancel"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Missing Information / Crucial Details Section */}
      {currentFacts.missingFacts.length > 0 && (
        <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] space-y-2 text-xs">
          <span className="text-[11px] font-mono uppercase text-[#69736D] font-bold flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-[#205C43]" />
            <span>
              {isHindi ? "अनुपस्थित जानकारी (जो कानूनी विश्लेषण को प्रभावित कर सकती है):" : "Missing Details that may affect legal analysis:"}
            </span>
          </span>

          <div className="space-y-1.5">
            {currentFacts.missingFacts.map((missing, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 p-2 rounded bg-white border border-[#D5E5D9]/60 text-xs text-[#202824]"
              >
                <span className="text-[11px] text-[#69736D]">• {missing}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Footer: Genuine Confirm Facts & Lawyer Handoff Bridge */}
      <div className="pt-3 border-t border-[#D5E5D9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleConfirmAction}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            currentFacts.hasConfirmed
              ? "bg-[#EAF3ED] text-[#205C43] border border-[#205C43]/40 hover:bg-[#D5E5D9]"
              : "bg-[#205C43] text-white hover:bg-[#174530] shadow-sm"
          }`}
        >
          <Check className="w-4 h-4" />
          <span>
            {currentFacts.hasConfirmed
              ? (isHindi ? "तथ्य पुष्टीकृत हैं (पुनः पुष्टि करें)" : "Facts Confirmed (Re-confirm)")
              : (isHindi ? "तथ्यों की पुष्टि करें" : "Confirm Facts")}
          </span>
        </button>

        <div className="flex items-center gap-2">
          <Link
            href="/lawyers"
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white border border-[#205C43] text-[#205C43] hover:bg-[#EAF3ED] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>{isHindi ? "वकील से साझा करें व खोजें" : "Share with Advocate & Find"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <p className="text-[10.5px] text-[#69736D] italic">
        {isHindi
          ? "यह सारांश किसी वकील के साथ तभी साझा किया जाएगा जब आप स्पष्ट रूप से 'वकील से साझा करें' चुनेंगे।"
          : "This summary is shared with an advocate only upon your explicit action to connect."}
      </p>
    </div>
  );
}

// Backward compatibility export
export const FactSummaryCard = WhatIUnderstoodCard;
