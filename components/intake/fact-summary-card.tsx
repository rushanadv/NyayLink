"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  FileCheck2,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Edit2,
  X,
  Plus,
  Scale,
  BookOpen,
  Calendar,
} from "lucide-react";
import { resolvePracticeAreaCategory } from "@/lib/taxonomy/practice-areas";

interface FactSummaryCardProps {
  inquiryText: string;
  answerText: string;
  jurisdiction: string;
  isHindi: boolean;
}

export function FactSummaryCard({
  inquiryText,
  answerText,
  jurisdiction,
  isHindi,
}: FactSummaryCardProps) {
  // Extract initial facts from the inquiry
  const detectedCategory = useMemo(() => {
    return resolvePracticeAreaCategory(inquiryText) || resolvePracticeAreaCategory("Civil Litigation");
  }, [inquiryText]);

  // Initial parsed fact points
  const [facts, setFacts] = useState<string[]>(() => {
    const rawSentences = inquiryText
      .split(/[.?!;\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 8);
    return rawSentences.length > 0 ? rawSentences : [inquiryText.trim()];
  });

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [newFactInput, setNewFactInput] = useState("");
  const [showAddFact, setShowAddFact] = useState(false);

  // Detect whether specific dates were mentioned
  const dateMentioned = useMemo(() => {
    const dateRegex = /\b(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}|\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}|\d{4})\b/i;
    const match = inquiryText.match(dateRegex);
    return match ? match[0] : null;
  }, [inquiryText]);

  // Unanswered / Material Missing Inquiries
  const missingInquiries = useMemo(() => {
    const missing: string[] = [];
    if (!dateMentioned) {
      missing.push(
        isHindi
          ? "घटना अथवा वाद कारण की सटीक तिथि दर्ज नहीं है (सीमावधि जांच हेतु आवश्यक)।"
          : "Exact cause of action or transaction date not disclosed (vital for statutory limitation screening)."
      );
    }
    if (
      !inquiryText.toLowerCase().includes("notice") &&
      !inquiryText.toLowerCase().includes("नोटिस")
    ) {
      missing.push(
        isHindi
          ? "क्या विपक्षी को कोई पूर्व लिखित कानूनी नोटिस दिया गया है?"
          : "Whether any prior statutory or formal written notice has been served on the opposite party."
      );
    }
    if (
      !inquiryText.toLowerCase().includes("agreement") &&
      !inquiryText.toLowerCase().includes("contract") &&
      !inquiryText.toLowerCase().includes("अनुबंध")
    ) {
      missing.push(
        isHindi
          ? "क्या कोई हस्ताक्षरित लिखित अनुबंध अथवा रसीद उपलब्ध है?"
          : "Whether a written contract, tax invoice, or signed agreement is available in evidence."
      );
    }
    return missing;
  }, [inquiryText, dateMentioned, isHindi]);

  const handleEditStart = (index: number) => {
    setEditingIndex(index);
    setEditText(facts[index]);
  };

  const handleEditSave = (index: number) => {
    if (!editText.trim()) return;
    setFacts((prev) => {
      const copy = [...prev];
      copy[index] = editText.trim();
      return copy;
    });
    setEditingIndex(null);
  };

  const handleDeleteFact = (index: number) => {
    setFacts((prev) => prev.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  const handleAddFactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFactInput.trim()) return;
    setFacts((prev) => [...prev, newFactInput.trim()]);
    setNewFactInput("");
    setShowAddFact(false);
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D5E5D9]">
        <div className="flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-[#205C43]" />
          <h3 className="text-sm font-serif font-bold text-[#202824] uppercase tracking-wider">
            {isHindi ? "तथ्य सारांश व संरचित विवरण" : "Plain-Language Fact Extraction Summary"}
          </h3>
        </div>
        <span className="text-[11px] font-mono text-[#69736D] bg-[#F8FAF9] px-2.5 py-0.5 rounded-full border border-[#D5E5D9] self-start sm:self-auto">
          {isHindi ? "मुवक्किल द्वारा सत्यापित करने योग्य" : "Client-Verifiable Facts"}
        </span>
      </div>

      {/* Facts Metadata Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9]/80 space-y-0.5">
          <span className="text-[10px] font-mono text-[#69736D] uppercase block font-semibold">
            {isHindi ? "पहचाना गया कानूनी विषय" : "Identified Domain"}
          </span>
          <p className="font-semibold text-[#202824]">
            {isHindi ? detectedCategory?.hiLabel : detectedCategory?.enLabel || "General Civil Law"}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9]/80 space-y-0.5">
          <span className="text-[10px] font-mono text-[#69736D] uppercase block font-semibold">
            {isHindi ? "अधिकार क्षेत्र (Jurisdiction)" : "Applicable Jurisdiction"}
          </span>
          <p className="font-semibold text-[#202824] flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#205C43]" />
            <span>{jurisdiction}</span>
          </p>
        </div>

        <div className="p-3 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9]/80 space-y-0.5">
          <span className="text-[10px] font-mono text-[#69736D] uppercase block font-semibold">
            {isHindi ? "प्रकट की गई तिथि" : "Disclosed Timeline"}
          </span>
          <p className="font-semibold text-[#202824] flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#205C43]" />
            <span>{dateMentioned || (isHindi ? "कोई तिथि दर्ज नहीं" : "No specific date stated")}</span>
          </p>
        </div>
      </div>

      {/* Editable Facts Review List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase text-[#69736D] font-bold">
            {isHindi ? "प्रस्तुत किए गए तथ्य (जांचें या संशोधित करें):" : "Disclosed Fact Points (Review or Correct):"}
          </span>
          {!showAddFact && (
            <button
              type="button"
              onClick={() => setShowAddFact(true)}
              className="text-[11px] text-[#205C43] hover:underline inline-flex items-center gap-1 font-semibold"
            >
              <Plus className="w-3 h-3" />
              <span>{isHindi ? "तथ्य जोड़ें" : "Add Fact Point"}</span>
            </button>
          )}
        </div>

        <div className="space-y-2">
          {facts.map((fact, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-[#FDFEFC] border border-[#D5E5D9] text-xs flex items-start justify-between gap-2"
            >
              {editingIndex === idx ? (
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#205C43] text-xs outline-none bg-white"
                  />
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingIndex(null)}
                      className="px-2.5 py-1 rounded-md text-[11px] text-[#69736D] hover:bg-[#F8FAF9]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditSave(idx)}
                      className="px-2.5 py-1 rounded-md bg-[#205C43] text-white text-[11px] font-semibold"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-[#202824] leading-relaxed flex-1">
                    <strong className="text-[#205C43] font-mono mr-1.5">{idx + 1}.</strong>
                    {fact}
                  </p>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEditStart(idx)}
                      className="p-1 rounded hover:bg-[#EAF3ED] text-[#69736D] hover:text-[#205C43]"
                      title="Edit fact point"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteFact(idx)}
                      className="p-1 rounded hover:bg-rose-50 text-[#69736D] hover:text-rose-700"
                      title="Remove fact point"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {showAddFact && (
            <form onSubmit={handleAddFactSubmit} className="p-3 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] space-y-2">
              <input
                type="text"
                autoFocus
                value={newFactInput}
                onChange={(e) => setNewFactInput(e.target.value)}
                placeholder="Enter additional relevant detail (e.g. Received email refusal on 12th August)..."
                className="w-full px-3 py-1.5 rounded-lg border border-[#D5E5D9] bg-white text-xs outline-none focus:border-[#205C43]"
              />
              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowAddFact(false)}
                  className="px-2.5 py-1 text-xs text-[#69736D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-[#205C43] text-white text-xs font-semibold rounded-lg"
                >
                  Add Point
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Unanswered / Missing Questions */}
      {missingInquiries.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-amber-950 font-mono text-[11px] uppercase">
            <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
            <span>{isHindi ? "अस्पष्ट अथवा अनुत्तरित प्रश्न" : "Material Unanswered Questions"}</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-amber-900 text-[11px]">
            {missingInquiries.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Structured Next-Step Action Bridges */}
      <div className="pt-3 border-t border-[#D5E5D9] space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#69736D] font-bold block">
          {isHindi ? "अनुशंसित कानूनी अगला कदम" : "RECOMMENDED NEXT STEPS & TOOLS"}
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Limitation Calculator */}
          <Link
            href="/intake/limitation"
            className="p-3 rounded-xl bg-[#F8FAF9] hover:bg-[#EAF3ED] border border-[#D5E5D9] transition-colors flex flex-col justify-between space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-[#205C43]">
              <Clock className="w-4 h-4" />
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div>
              <p className="font-semibold text-xs text-[#202824]">
                {isHindi ? "समय सीमा जांचें" : "Screen Limitation"}
              </p>
              <p className="text-[10px] text-[#69736D]">
                Statutory deadline check
              </p>
            </div>
          </Link>

          {/* Filing Checklists */}
          <Link
            href="/intake/checklists"
            className="p-3 rounded-xl bg-[#F8FAF9] hover:bg-[#EAF3ED] border border-[#D5E5D9] transition-colors flex flex-col justify-between space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-[#205C43]">
              <FileCheck2 className="w-4 h-4" />
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div>
              <p className="font-semibold text-xs text-[#202824]">
                {isHindi ? "दाखिला चेकलिस्ट" : "Filing Checklist"}
              </p>
              <p className="text-[10px] text-[#69736D]">
                Required court forms
              </p>
            </div>
          </Link>

          {/* Sourced References */}
          <Link
            href="/intake/references"
            className="p-3 rounded-xl bg-[#F8FAF9] hover:bg-[#EAF3ED] border border-[#D5E5D9] transition-colors flex flex-col justify-between space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-[#205C43]">
              <BookOpen className="w-4 h-4" />
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div>
              <p className="font-semibold text-xs text-[#202824]">
                {isHindi ? "कानूनी स्रोत देखें" : "Legal Sources"}
              </p>
              <p className="text-[10px] text-[#69736D]">
                Official India Code texts
              </p>
            </div>
          </Link>
        </div>

        {/* Find Matching Advocates Button */}
        <div className="pt-2 flex justify-end">
          <Link
            href={`/lawyers?practiceArea=${encodeURIComponent(
              detectedCategory?.canonicalName || "Civil Litigation"
            )}`}
            className="px-5 py-2.5 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <span>{isHindi ? "संबंधित सत्यापित अधिवक्ता खोजें" : "Discover Advocates in this Practice Area"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
