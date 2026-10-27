"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  X,
  Printer,
  Copy,
  Check,
  Bookmark,
  Share2,
  Compass,
  FileText,
  AlertTriangle,
  Scale,
  Calendar,
  Layers,
  HelpCircle,
  Plus,
  Trash2,
  Edit3,
  ShieldCheck,
  CheckCircle2,
  Languages,
  Loader2,
} from "lucide-react";
import { LawyerReadyBrief, BriefFact, BriefDate, MentionedDocument, StatutorySource } from "@/lib/intake/brief-types";
import { saveClientBrief } from "@/app/actions/briefs";
import { AdvocateHandoffDialog, SelectedAdvocate } from "@/components/intake/advocate-handoff-dialog";

interface LawyerBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBrief: LawyerReadyBrief;
  initialLocale?: "en" | "hi";
  onHandoffComplete?: (handoffId: string) => void;
}

export function LawyerBriefModal({
  isOpen,
  onClose,
  initialBrief,
  initialLocale = "en",
  onHandoffComplete,
}: LawyerBriefModalProps) {
  const router = useRouter();

  // Internal mutable brief state so user edits and exclusions are preserved
  const [brief, setBrief] = useState<LawyerReadyBrief>(initialBrief);
  const [locale, setLocale] = useState<"en" | "hi">(initialLocale);

  // Section exclusion toggles
  const [excludedSections, setExcludedSections] = useState<Set<string>>(new Set());

  // Editing state for questions
  const [editingQuestionIdx, setEditingQuestionIdx] = useState<number | null>(null);
  const [questionEditText, setQuestionEditText] = useState("");
  const [newQuestionText, setNewQuestionText] = useState("");
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  // Actions feedback
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  // Handoff Dialog
  const [isHandoffDialogOpen, setIsHandoffDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const isHi = locale === "hi";

  // Toggle exclusion of a section
  const toggleSection = (sectionKey: string) => {
    setExcludedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionKey)) {
        next.delete(sectionKey);
      } else {
        next.add(sectionKey);
      }
      return next;
    });
  };

  const isSectionIncluded = (sectionKey: string) => !excludedSections.has(sectionKey);

  // Question editing
  const handleStartEditQuestion = (index: number, text: string) => {
    setEditingQuestionIdx(index);
    setQuestionEditText(text);
  };

  const handleSaveEditQuestion = (index: number) => {
    if (!questionEditText.trim()) return;
    setBrief((prev) => {
      const updated = [...prev.questionsForAdvocate];
      updated[index] = questionEditText.trim();
      return { ...prev, questionsForAdvocate: updated };
    });
    setEditingQuestionIdx(null);
    setQuestionEditText("");
  };

  const handleDeleteQuestion = (index: number) => {
    setBrief((prev) => ({
      ...prev,
      questionsForAdvocate: prev.questionsForAdvocate.filter((_, i) => i !== index),
    }));
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;
    setBrief((prev) => ({
      ...prev,
      questionsForAdvocate: [...prev.questionsForAdvocate, newQuestionText.trim()],
    }));
    setNewQuestionText("");
    setIsAddingQuestion(false);
  };

  // Remove individual fact
  const handleRemoveFact = (factId: string) => {
    setBrief((prev) => ({
      ...prev,
      facts: prev.facts.filter((f) => f.id !== factId),
    }));
  };

  // 1. ACTION: Download / Print formatted brief
  const handleDownloadBrief = () => {
    // Open clean print window
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to generate and print your legal brief.");
      return;
    }

    const includedFacts = isSectionIncluded("facts")
      ? brief.facts.filter((f) => !f.isAiInference || isSectionIncluded("inferences"))
      : [];

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="${locale}">
      <head>
        <meta charset="utf-8">
        <title>${brief.title}</title>
        <style>
          body {
            font-family: 'Georgia', serif;
            color: #202824;
            margin: 40px;
            line-height: 1.6;
          }
          .header {
            border-bottom: 2px solid #205C43;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #205C43;
          }
          .badge {
            display: inline-block;
            background: #EAF3ED;
            color: #205C43;
            font-family: monospace;
            font-size: 11px;
            font-weight: bold;
            padding: 3px 8px;
            border-radius: 4px;
            margin-top: 5px;
          }
          .disclaimer {
            background: #FFFDF7;
            border: 1px solid #E8DCC0;
            padding: 12px;
            font-size: 11px;
            color: #7A5E1A;
            margin-bottom: 20px;
            border-radius: 6px;
          }
          h2 {
            color: #205C43;
            font-size: 16px;
            border-bottom: 1px solid #D5E5D9;
            padding-bottom: 4px;
            margin-top: 20px;
          }
          ul {
            padding-left: 20px;
          }
          li {
            margin-bottom: 6px;
            font-size: 13px;
          }
          .statute {
            background: #F8FAF9;
            border-left: 3px solid #205C43;
            padding: 8px 12px;
            margin-bottom: 8px;
            font-size: 12px;
          }
          .footer {
            margin-top: 40px;
            border-top: 1px solid #D5E5D9;
            padding-top: 10px;
            font-size: 10px;
            color: #69736D;
            display: flex;
            justify-content: space-between;
          }
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">NyayLink (न्यायलिंक)</div>
          <div><strong>${brief.title}</strong></div>
          <div class="badge">CONFIDENTIAL PRECONSULTATION BRIEF</div>
          <div style="font-size: 11px; color: #69736D; margin-top: 5px;">
            Generated: ${new Date(brief.createdAt).toLocaleString()} | Jurisdiction: ${brief.jurisdiction.state || "India"}
          </div>
        </div>

        <div class="disclaimer">
          <strong>Mandatory Notice / संविधिक प्रकटीकरण:</strong><br>
          ${brief.disclaimer.en}<br><br>
          ${brief.disclaimer.hi}
        </div>

        ${
          isSectionIncluded("summary")
            ? `<h2>1. Neutral Issue Summary / मामले का संक्षिप्त विवरण</h2>
               <p style="font-size: 13px;">${brief.issueSummary}</p>`
            : ""
        }

        ${
          includedFacts.length > 0
            ? `<h2>2. Stated & Confirmed Facts / पुष्टीकृत तथ्य</h2>
               <ul>
                 ${includedFacts
                   .map(
                     (f) =>
                       `<li><strong>[${f.userConfirmed ? "User-Confirmed" : f.isAiInference ? "AI Inference" : "User-Stated"}]</strong> ${f.statement}</li>`
                   )
                   .join("")}
               </ul>`
            : ""
        }

        ${
          isSectionIncluded("dates") && brief.dates.length > 0
            ? `<h2>3. Timeline & Critical Dates / समयरेखा</h2>
               <ul>
                 ${brief.dates
                   .map(
                     (d) =>
                       `<li>${d.confirmedDate ? `<strong>Confirmed: ${d.confirmedDate}</strong>` : `Stated phrasing: "${d.originalText}" (Needs confirmation)`}</li>`
                   )
                   .join("")}
               </ul>`
            : ""
        }

        ${
          isSectionIncluded("documents") && brief.documentsMentioned.length > 0
            ? `<h2>4. Documents Mentioned in Narrative (Not Yet Attached) / उल्लिखित दस्तावेज़</h2>
               <ul>
                 ${brief.documentsMentioned
                   .map((doc) => `<li>${doc.name} <em>[Mentioned only — no files attached]</em></li>`)
                   .join("")}
               </ul>`
            : ""
        }

        ${
          isSectionIncluded("questions") && brief.questionsForAdvocate.length > 0
            ? `<h2>5. Client Questions for Advocate / अधिवक्ता से पूछे जाने वाले प्रश्न</h2>
               <ol>
                 ${brief.questionsForAdvocate.map((q) => `<li>${q}</li>`).join("")}
               </ol>`
            : ""
        }

        ${
          isSectionIncluded("statutes") && brief.retrievedSources.length > 0
            ? `<h2>6. Verified Indian Statutory References / संविधिक संदर्भ</h2>
               ${brief.retrievedSources
                 .map(
                   (s) =>
                     `<div class="statute"><strong>${s.actName} — ${s.section}:</strong> ${s.title}<br><span style="color:#555;">${s.summary}</span></div>`
                 )
                 .join("")} `
            : ""
        }

        <div class="footer">
          <span>Prepared via NyayLink AI Preconsultation System</span>
          <span>Subject to Advocate-Client Privilege upon formal engagement</span>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // 2. ACTION: Copy Brief to clipboard
  const handleCopyBrief = async () => {
    const includedFacts = isSectionIncluded("facts")
      ? brief.facts.filter((f) => !f.isAiInference || isSectionIncluded("inferences"))
      : [];

    let text = `# ${brief.title}\n`;
    text += `[CONFIDENTIAL AI PRECONSULTATION BRIEF — NYAYLINK]\n`;
    text += `Date: ${new Date(brief.createdAt).toLocaleDateString()}\n\n`;

    text += `### MANDATORY NOTICE\n${brief.disclaimer.en}\n\n`;

    if (isSectionIncluded("summary")) {
      text += `## ISSUE SUMMARY\n${brief.issueSummary}\n\n`;
    }

    if (includedFacts.length > 0) {
      text += `## RELEVANT FACTS\n`;
      includedFacts.forEach((f) => {
        text += `- [${f.userConfirmed ? "Confirmed" : f.isAiInference ? "AI Inference" : "Stated"}] ${f.statement}\n`;
      });
      text += `\n`;
    }

    if (isSectionIncluded("dates") && brief.dates.length > 0) {
      text += `## TIMELINE & DATES\n`;
      brief.dates.forEach((d) => {
        text += `- ${d.confirmedDate ? `Confirmed: ${d.confirmedDate}` : `Preserved phrasing: "${d.originalText}"`}\n`;
      });
      text += `\n`;
    }

    if (isSectionIncluded("documents") && brief.documentsMentioned.length > 0) {
      text += `## DOCUMENTS MENTIONED (Not Attached)\n`;
      brief.documentsMentioned.forEach((doc) => {
        text += `- ${doc.name} (Mentioned only — not yet attached)\n`;
      });
      text += `\n`;
    }

    if (isSectionIncluded("questions") && brief.questionsForAdvocate.length > 0) {
      text += `## QUESTIONS FOR ADVOCATE\n`;
      brief.questionsForAdvocate.forEach((q, i) => {
        text += `${i + 1}. ${q}\n`;
      });
      text += `\n`;
    }

    if (isSectionIncluded("statutes") && brief.retrievedSources.length > 0) {
      text += `## STATUTORY CITATIONS\n`;
      brief.retrievedSources.forEach((s) => {
        text += `- ${s.actName} (${s.section}): ${s.title}\n`;
      });
      text += `\n`;
    }

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  // 3. ACTION: Save to my account
  const handleSaveToAccount = async () => {
    setSaveStatus("saving");
    setSaveErrorMessage(null);

    const snapshotToSave: LawyerReadyBrief = {
      ...brief,
      locale,
      excludedSections: Array.from(excludedSections),
    };

    try {
      const res = await saveClientBrief({ brief: snapshotToSave });
      if (!res.success) {
        setSaveStatus("error");
        setSaveErrorMessage(res.error || "Failed to save brief. Please sign in.");
        return;
      }

      setBrief((prev) => ({ ...prev, id: res.briefId }));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err: unknown) {
      setSaveStatus("error");
      setSaveErrorMessage(err instanceof Error ? err.message : "Error saving brief.");
    }
  };

  // 4. ACTION: Find an Advocate (browsing directory only; NEVER auto-shares)
  const handleFindAdvocate = () => {
    // Cache the brief in sessionStorage so it remains active without auto-sharing
    try {
      sessionStorage.setItem("nyaylink_active_brief", JSON.stringify(brief));
    } catch (e) {
      console.warn("Could not cache brief in session storage", e);
    }
    onClose();
    router.push("/lawyers");
  };

  // 5. ACTION: Share with a selected advocate (launches consent dialog)
  const handleShareWithAdvocate = () => {
    setIsHandoffDialogOpen(true);
  };

  return createPortal(
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div
          className="w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl border border-[#D5E5D9] shadow-2xl flex flex-col overflow-hidden text-[#202824]"
          role="dialog"
          aria-modal="true"
        >
          {/* Modal Header */}
          <div className="px-6 py-4 bg-[#F8FAF9] border-b border-[#D5E5D9] flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#205C43] text-white flex items-center justify-center shrink-0 shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-serif font-bold text-[#202824]">
                    {isHi ? "वकील हेतु तैयार कानूनी सारांश" : "Lawyer-Ready Preconsultation Brief"}
                  </h2>
                  <span className="text-[10px] font-mono font-semibold bg-[#EAF3ED] text-[#205C43] px-2 py-0.5 rounded border border-[#205C43]/20">
                    CONFIDENTIAL
                  </span>
                </div>
                <p className="text-[11px] text-[#69736D]">
                  {isHi
                    ? "अधिवक्ता से परामर्श से पूर्व अपने तथ्यों, प्रश्नों और कानूनी संविधियों की समीक्षा करें।"
                    : "Review, edit, and tailor your brief before sharing, saving, or downloading."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Bilingual Toggle preserving state */}
              <button
                type="button"
                onClick={() => setLocale(locale === "en" ? "hi" : "en")}
                className="px-2.5 py-1.5 rounded-lg border border-[#D5E5D9] bg-white hover:bg-[#EAF3ED] text-xs font-semibold text-[#205C43] flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Switch Language / भाषा बदलें"
              >
                <Languages className="w-3.5 h-3.5" />
                <span>{locale === "en" ? "हिन्दी" : "English"}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#69736D] hover:bg-[#EAF3ED] hover:text-[#202824] transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mandatory Statutory Notice Banner */}
          <div className="px-6 py-2.5 bg-[#FFFDF7] border-b border-[#E8DCC0] flex items-start gap-2.5 text-[11px] text-[#7A5E1A] shrink-0">
            <ShieldCheck className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>{isHi ? "विधिक सूचना: " : "Mandatory Notice: "}</strong>
              {isHi ? brief.disclaimer.hi : brief.disclaimer.en}
            </p>
          </div>

          {/* Main Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Save Status / Error Feedback */}
            {saveStatus === "error" && saveErrorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center justify-between">
                <span>{saveErrorMessage}</span>
                <button
                  type="button"
                  onClick={() => router.push("/auth/login?intent=client&next=/intake")}
                  className="font-semibold underline ml-2 text-red-900"
                >
                  {isHi ? "लॉगिन करें" : "Sign In"}
                </button>
              </div>
            )}
            {saveStatus === "saved" && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  {isHi
                    ? "विधिक सारांश आपके डैशबोर्ड में सुरक्षित रूप से सहेज लिया गया है।"
                    : "Brief successfully saved to your client account."}
                </span>
              </div>
            )}

            {/* Section 1: Issue Summary */}
            <div className="p-4 rounded-xl border border-[#D5E5D9] bg-[#FDFEFC] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#202824] flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSectionIncluded("summary")}
                    onChange={() => toggleSection("summary")}
                    className="h-3.5 w-3.5 rounded border-[#D5E5D9] text-[#205C43] focus:ring-[#205C43]"
                  />
                  <span>1. {isHi ? "कानूनी मुद्दे का सारांश" : "Legal Issue Summary"}</span>
                </label>
                <span className="text-[10px] font-mono text-[#69736D]">
                  {isSectionIncluded("summary") ? (isHi ? "शामिल" : "Included") : (isHi ? "छोड़ दिया" : "Excluded")}
                </span>
              </div>

              {isSectionIncluded("summary") && (
                <div className="p-3 rounded-lg bg-white border border-[#D5E5D9]/80 text-xs text-[#202824] leading-relaxed">
                  {brief.issueSummary}
                </div>
              )}
            </div>

            {/* Section 2: Separated Facts & AI Inferences */}
            <div className="p-4 rounded-xl border border-[#D5E5D9] bg-[#FDFEFC] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#202824] flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSectionIncluded("facts")}
                    onChange={() => toggleSection("facts")}
                    className="h-3.5 w-3.5 rounded border-[#D5E5D9] text-[#205C43] focus:ring-[#205C43]"
                  />
                  <span>2. {isHi ? "तथ्य बनाम एआई अनुमान" : "Facts vs AI Inferences"}</span>
                </label>

                {isSectionIncluded("facts") && (
                  <label className="text-[11px] text-[#69736D] flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSectionIncluded("inferences")}
                      onChange={() => toggleSection("inferences")}
                      className="h-3 w-3 rounded text-[#205C43]"
                    />
                    <span>{isHi ? "एआई अनुमान शामिल रखें" : "Include AI Inferences"}</span>
                  </label>
                )}
              </div>

              {isSectionIncluded("facts") && (
                <div className="space-y-2">
                  {brief.facts
                    .filter((f) => !f.isAiInference || isSectionIncluded("inferences"))
                    .map((fact) => (
                      <div
                        key={fact.id}
                        className={`p-3 rounded-lg border text-xs flex items-start justify-between gap-3 ${
                          fact.isAiInference
                            ? "bg-amber-50/50 border-amber-200/80 text-[#202824]"
                            : fact.userConfirmed
                            ? "bg-[#EAF3ED]/40 border-[#205C43]/20 text-[#202824]"
                            : "bg-white border-[#D5E5D9] text-[#202824]"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[9.5px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                                fact.isAiInference
                                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                                  : fact.userConfirmed
                                  ? "bg-[#EAF3ED] text-[#205C43] border border-[#205C43]/30"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {fact.isAiInference
                                ? isHi ? "एआई अनुमान — वकील द्वारा सत्यापन आवश्यक" : "AI Inference — Verify with Lawyer"
                                : fact.userConfirmed
                                ? isHi ? "पुष्टीकृत तथ्य" : "Confirmed Fact"
                                : isHi ? "कथित तथ्य" : "User-Stated"}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed">{fact.statement}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveFact(fact.id)}
                          className="text-[#69736D] hover:text-red-700 p-1 rounded transition-colors"
                          title="Remove fact"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Section 3: Timeline & Ambiguous Dates */}
            {brief.dates.length > 0 && (
              <div className="p-4 rounded-xl border border-[#D5E5D9] bg-[#FDFEFC] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#202824] flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSectionIncluded("dates")}
                      onChange={() => toggleSection("dates")}
                      className="h-3.5 w-3.5 rounded border-[#D5E5D9] text-[#205C43] focus:ring-[#205C43]"
                    />
                    <span>3. {isHi ? "घटनाक्रम और समयरेखा" : "Timeline & Key Dates"}</span>
                  </label>
                </div>

                {isSectionIncluded("dates") && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {brief.dates.map((dateItem) => (
                      <div
                        key={dateItem.id}
                        className="p-2.5 rounded-lg bg-white border border-[#D5E5D9] flex items-center gap-2.5"
                      >
                        <Calendar className="w-4 h-4 text-[#205C43] shrink-0" />
                        <div>
                          {dateItem.confirmedDate ? (
                            <span className="font-semibold text-[#205C43]">
                              {dateItem.confirmedDate}
                            </span>
                          ) : (
                            <div>
                              <span className="font-medium text-[#202824]">
                                &ldquo;{dateItem.originalText}&rdquo;
                              </span>
                              <span className="text-[10px] text-amber-700 block">
                                {isHi ? "(सटीक तारीख की पुष्टि आवश्यक)" : "(Relative phrasing — needs exact date)"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Section 4: Documents Mentioned (Not Attached) */}
            {brief.documentsMentioned.length > 0 && (
              <div className="p-4 rounded-xl border border-[#D5E5D9] bg-[#FDFEFC] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#202824] flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSectionIncluded("documents")}
                      onChange={() => toggleSection("documents")}
                      className="h-3.5 w-3.5 rounded border-[#D5E5D9] text-[#205C43] focus:ring-[#205C43]"
                    />
                    <span>
                      4. {isHi ? "वार्ता में उल्लिखित दस्तावेज़" : "Documents Mentioned in Narrative"}
                    </span>
                  </label>
                  <span className="text-[10.5px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {isHi ? "केवल उल्लिखित — फाइलें संलग्न नहीं हैं" : "Mentioned Only — Not Attached"}
                  </span>
                </div>

                {isSectionIncluded("documents") && (
                  <div className="space-y-1.5">
                    {brief.documentsMentioned.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-2 rounded bg-white border border-[#D5E5D9]/80 flex items-center justify-between text-xs"
                      >
                        <span className="font-medium text-[#202824]">• {doc.name}</span>
                        <span className="text-[10px] text-[#69736D] italic">
                          {isHi ? "परामर्श के समय साथ लाएं" : "Bring hardcopy or digital copy to meeting"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Section 5: Client Questions for Advocate (Editable) */}
            <div className="p-4 rounded-xl border border-[#D5E5D9] bg-[#FDFEFC] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#202824] flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSectionIncluded("questions")}
                    onChange={() => toggleSection("questions")}
                    className="h-3.5 w-3.5 rounded border-[#D5E5D9] text-[#205C43] focus:ring-[#205C43]"
                  />
                  <span>
                    5. {isHi ? "वकील से पूछने योग्य प्रस्तावित प्रश्न" : "Proposed Questions for Advocate"}
                  </span>
                </label>
                {isSectionIncluded("questions") && (
                  <button
                    type="button"
                    onClick={() => setIsAddingQuestion(true)}
                    className="text-xs font-semibold text-[#205C43] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isHi ? "प्रश्न जोड़ें" : "Add Question"}</span>
                  </button>
                )}
              </div>

              {isSectionIncluded("questions") && (
                <div className="space-y-2">
                  {brief.questionsForAdvocate.map((question, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-white border border-[#D5E5D9] flex items-start justify-between gap-3 text-xs"
                    >
                      {editingQuestionIdx === idx ? (
                        <div className="flex-1 space-y-2">
                          <textarea
                            value={questionEditText}
                            onChange={(e) => setQuestionEditText(e.target.value)}
                            className="w-full p-2 border border-[#205C43] rounded-lg text-xs text-[#202824] focus:outline-none"
                            rows={2}
                            autoFocus
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSaveEditQuestion(idx)}
                              className="px-2.5 py-1 bg-[#205C43] text-white rounded text-[11px] font-semibold"
                            >
                              {isHi ? "सहेजें" : "Save"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingQuestionIdx(null)}
                              className="px-2.5 py-1 bg-white border border-[#D5E5D9] text-[#69736D] rounded text-[11px]"
                            >
                              {isHi ? "रद्द करें" : "Cancel"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start gap-2">
                            <span className="font-mono text-[#205C43] font-bold">{idx + 1}.</span>
                            <span className="text-[#202824] leading-relaxed">{question}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleStartEditQuestion(idx, question)}
                              className="p-1 text-[#69736D] hover:text-[#205C43] rounded"
                              title="Edit question"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteQuestion(idx)}
                              className="p-1 text-[#69736D] hover:text-red-700 rounded"
                              title="Delete question"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {/* Add question form */}
                  {isAddingQuestion && (
                    <form onSubmit={handleAddQuestion} className="p-3 rounded-lg bg-[#EAF3ED]/40 border border-[#205C43]/30 space-y-2">
                      <input
                        type="text"
                        value={newQuestionText}
                        onChange={(e) => setNewQuestionText(e.target.value)}
                        placeholder={
                          isHi
                            ? "वकील के लिए अपना प्रश्न यहाँ लिखें..."
                            : "Enter your question for the advocate..."
                        }
                        className="w-full p-2 border border-[#D5E5D9] rounded-lg text-xs bg-white text-[#202824] focus:outline-none focus:border-[#205C43]"
                        autoFocus
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="submit"
                          className="px-3 py-1 bg-[#205C43] text-white rounded text-[11px] font-semibold"
                        >
                          {isHi ? "जोड़ें" : "Add"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddingQuestion(false)}
                          className="px-3 py-1 bg-white border border-[#D5E5D9] text-[#69736D] rounded text-[11px]"
                        >
                          {isHi ? "रद्द करें" : "Cancel"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Section 6: Verified Indian Statutory Citations */}
            {brief.retrievedSources.length > 0 && (
              <div className="p-4 rounded-xl border border-[#D5E5D9] bg-[#FDFEFC] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#202824] flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSectionIncluded("statutes")}
                      onChange={() => toggleSection("statutes")}
                      className="h-3.5 w-3.5 rounded border-[#D5E5D9] text-[#205C43] focus:ring-[#205C43]"
                    />
                    <span>
                      6. {isHi ? "सत्यापित भारतीय संविधिक स्रोत" : "Verified Indian Statutory Sources"}
                    </span>
                  </label>
                </div>

                {isSectionIncluded("statutes") && (
                  <div className="space-y-2">
                    {brief.retrievedSources.map((source, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-white border border-[#D5E5D9] text-xs space-y-1"
                      >
                        <div className="font-semibold text-[#205C43]">
                          {source.actName} — {source.section}
                        </div>
                        <div className="font-medium text-[#202824]">{source.title}</div>
                        <p className="text-[#69736D] text-[11px] leading-relaxed">
                          {source.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 5 Real Actions Bar */}
          <div className="px-6 py-4 bg-[#F8FAF9] border-t border-[#D5E5D9] flex flex-wrap items-center justify-between gap-3 shrink-0">
            {/* Left Group: Document Utilities */}
            <div className="flex items-center gap-2">
              {/* Action 1: Download Brief */}
              <button
                type="button"
                onClick={handleDownloadBrief}
                className="px-3 py-2 rounded-xl bg-white border border-[#D5E5D9] hover:bg-[#EAF3ED] text-[#205C43] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Download formatted printable PDF brief"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isHi ? "डाउनलोड / प्रिंट" : "Download PDF"}</span>
              </button>

              {/* Action 2: Copy Brief */}
              <button
                type="button"
                onClick={handleCopyBrief}
                className="px-3 py-2 rounded-xl bg-white border border-[#D5E5D9] hover:bg-[#EAF3ED] text-[#205C43] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Copy formatted summary to clipboard"
              >
                {copyFeedback ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">{isHi ? "कॉपी हो गया!" : "Copied!"}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{isHi ? "कॉपी करें" : "Copy Brief"}</span>
                  </>
                )}
              </button>

              {/* Action 3: Save to Account */}
              <button
                type="button"
                onClick={handleSaveToAccount}
                disabled={saveStatus === "saving"}
                className="px-3 py-2 rounded-xl bg-white border border-[#D5E5D9] hover:bg-[#EAF3ED] text-[#205C43] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Save this brief to your account under My Matters"
              >
                {saveStatus === "saving" ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{isHi ? "सहेजा जा रहा है..." : "Saving..."}</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{isHi ? "खाते में सहेजें" : "Save to Account"}</span>
                  </>
                )}
              </button>
            </div>

            {/* Right Group: Lawyer Actions */}
            <div className="flex items-center gap-2">
              {/* Action 4: Find an Advocate (browsing directory only; NEVER auto-shares) */}
              <button
                type="button"
                onClick={handleFindAdvocate}
                className="px-3.5 py-2 rounded-xl bg-white border border-[#205C43] text-[#205C43] hover:bg-[#EAF3ED] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Browse advocate directory without sharing brief"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{isHi ? "वकील खोजें" : "Find Advocates"}</span>
              </button>

              {/* Action 5: Share with a Selected Advocate (consent handoff) */}
              <button
                type="button"
                onClick={handleShareWithAdvocate}
                className="px-4 py-2 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="Explicit consent handoff to a verified advocate"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{isHi ? "वकील से साझा करें" : "Share with Advocate"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Consent-Based Advocate Handoff Dialog */}
      <AdvocateHandoffDialog
        isOpen={isHandoffDialogOpen}
        onClose={() => setIsHandoffDialogOpen(false)}
        brief={{
          ...brief,
          locale,
          excludedSections: Array.from(excludedSections),
        }}
        isHindi={isHi}
      />
    </>,
    document.body
  );
}
