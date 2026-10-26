"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Scale,
  FileText,
  Printer,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  Hash,
  Download,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import {
  generateVakalatnamaText,
  type VakalatnamaData,
} from "@/lib/legal/vakalatnama-template";
import {
  initiateESignSession,
  type ESignSessionResult,
} from "@/lib/esign/adapter";
import { INDIAN_COURT_COMPLEXES } from "@/lib/court-data/ecourts-adapter";
import { useLanguage } from "@/lib/i18n/context";

export default function DigitalVakalatnamaPage() {
  const { isHindi } = useLanguage();

  const [formData, setFormData] = useState<VakalatnamaData>({
    courtName: INDIAN_COURT_COMPLEXES[1], // Delhi High Court
    caseTitle: "Ramesh Kumar vs State (NCT of Delhi) & Ors.",
    suitNumber: "Crl. Misc. App. No. 4821/2026",
    clientName: "Ramesh Kumar",
    clientAddress: "B-42, Defence Colony, New Delhi - 110024",
    advocateName: "Arjun Mehta",
    advocateEnrolmentNumber: "D/1482/2012",
    advocateChamberAddress: "Chamber No. 342, High Court Lawyers Chambers, New Delhi",
    dateOfExecution: new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  });

  const [hasReviewed, setHasReviewed] = useState(false);
  const [eSignResult, setESignResult] = useState<ESignSessionResult | null>(null);
  const [isInitiating, setIsInitiating] = useState(false);

  const vakalatnamaDraftText = generateVakalatnamaText(formData);

  const handleInitiateSigning = async () => {
    if (!hasReviewed) return;
    setIsInitiating(true);

    try {
      const res = await initiateESignSession({
        documentId: `VAK_${Date.now()}`,
        documentTitle: `Vakalatnama - ${formData.caseTitle}`,
        documentTextContent: vakalatnamaDraftText,
        signerName: formData.clientName,
        signerEmail: "client@nyaya.live",
        signerRole: "client",
      });
      setESignResult(res);
    } catch (err) {
      console.error("eSign initiation error:", err);
    } finally {
      setIsInitiating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#FDFEFC] text-[#202824] antialiased">
      {/* Top Breadcrumb */}
      <div className="border-b border-[#D5E5D9] bg-white print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-[#205C43] hover:text-[#174530] flex items-center gap-1.5"
          >
            ← {isHindi ? "डैशबोर्ड पर वापस" : "Back to Client Portal"}
          </Link>
          <span className="text-[11px] font-mono text-[#69736D]">
            {isHindi ? "डिजिटल वकालतनामा ड्राफ्टिंग व निष्पादन" : "Digital Vakalatnama Workflow • Sec 30 Advocates Act 1961"}
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Header */}
        <div className="space-y-3 print:hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#EAF3ED] border border-[#D5E5D9] text-xs font-mono font-semibold text-[#205C43]">
            <Scale className="w-3.5 h-3.5" />
            <span>{isHindi ? "वकालतनामा मेमो ड्राफ्टिंग" : "STATUTORY APPOINTMENT OF ADVOCATE"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#202824] tracking-tight">
            {isHindi ? "डिजिटल वकालतनामा (मेमो ऑफ अपीयरेंस)" : "Digital Vakalatnama Workflow & Drafting"}
          </h1>
          <p className="text-xs sm:text-sm text-[#69736D] leading-relaxed max-w-2xl">
            {isHindi
              ? "अधिवक्ता अधिनियम, 1961 की धारा 30 के अंतर्गत भारतीय न्यायालयों व अधिकरणों में अधिवक्ता की नियुक्ति हेतु वैधानिक प्रारूप।"
              : "Generate an authentic appointment memo under Section 30 of the Advocates Act, 1961. Review terms of authority, inspect cryptographic SHA-256 fingerprint, and export for physical or e-Filing 3.0 execution."}
          </p>
        </div>

        {/* 2-Column Layout: Left Form & Right Legal Document Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Draft Details Form (5 cols) */}
          <div className="lg:col-span-5 space-y-5 print:hidden">
            <div className="p-6 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-4">
              <h2 className="text-sm font-serif font-bold text-[#202824] uppercase tracking-wider">
                {isHindi ? "मुकदमा व अधिवक्ता विवरण" : "Matter & Counsel Particulars"}
              </h2>

              <div className="space-y-3 text-xs">
                {/* Court Name */}
                <div className="space-y-1">
                  <label className="font-mono text-[#69736D] uppercase text-[10px] font-semibold">
                    Court / Tribunal *
                  </label>
                  <select
                    value={formData.courtName}
                    onChange={(e) => setFormData({ ...formData, courtName: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-[#D5E5D9] bg-[#F8FAF9] text-xs text-[#202824] outline-none"
                  >
                    {INDIAN_COURT_COMPLEXES.map((court) => (
                      <option key={court} value={court}>
                        {court}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Case Title */}
                <div className="space-y-1">
                  <label className="font-mono text-[#69736D] uppercase text-[10px] font-semibold">
                    Case / Cause Title *
                  </label>
                  <input
                    type="text"
                    value={formData.caseTitle}
                    onChange={(e) => setFormData({ ...formData, caseTitle: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-[#D5E5D9] bg-white text-xs outline-none focus:border-[#205C43]"
                  />
                </div>

                {/* Suit Number */}
                <div className="space-y-1">
                  <label className="font-mono text-[#69736D] uppercase text-[10px] font-semibold">
                    Suit / Case Number
                  </label>
                  <input
                    type="text"
                    value={formData.suitNumber || ""}
                    onChange={(e) => setFormData({ ...formData, suitNumber: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-[#D5E5D9] bg-white text-xs outline-none focus:border-[#205C43]"
                  />
                </div>

                {/* Client Name */}
                <div className="space-y-1">
                  <label className="font-mono text-[#69736D] uppercase text-[10px] font-semibold">
                    Executant (Client) Name *
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-[#D5E5D9] bg-white text-xs outline-none focus:border-[#205C43]"
                  />
                </div>

                {/* Advocate Name */}
                <div className="space-y-1">
                  <label className="font-mono text-[#69736D] uppercase text-[10px] font-semibold">
                    Advocate Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.advocateName}
                    onChange={(e) => setFormData({ ...formData, advocateName: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-[#D5E5D9] bg-white text-xs outline-none focus:border-[#205C43]"
                  />
                </div>

                {/* Bar Enrolment Number */}
                <div className="space-y-1">
                  <label className="font-mono text-[#69736D] uppercase text-[10px] font-semibold">
                    State Bar Council Enrolment No. *
                  </label>
                  <input
                    type="text"
                    value={formData.advocateEnrolmentNumber}
                    onChange={(e) => setFormData({ ...formData, advocateEnrolmentNumber: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-[#D5E5D9] bg-white text-xs font-mono outline-none focus:border-[#205C43]"
                  />
                </div>
              </div>
            </div>

            {/* Terms Review Checkbox */}
            <div className="p-4 rounded-xl bg-white border border-[#D5E5D9] space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#202824] leading-relaxed select-none">
                <input
                  type="checkbox"
                  checked={hasReviewed}
                  onChange={(e) => setHasReviewed(e.target.checked)}
                  className="mt-0.5 rounded border-[#D5E5D9] text-[#205C43] focus:ring-[#205C43] cursor-pointer"
                />
                <span>
                  {isHindi
                    ? "मैंने वकालतनामा की शर्तों की समीक्षा कर ली है। मैं समझता हूँ कि न्यायालय में प्रस्तुति से पूर्व अधिवक्ता कल्याण स्टैम्प लगाना अनिवार्य है।"
                    : "I have reviewed the terms of authority under Section 30 of the Advocates Act, 1961. I understand physical filing requires an Advocate Welfare Stamp."}
                </span>
              </label>

              {/* Execution Actions */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleInitiateSigning}
                  disabled={!hasReviewed || isInitiating}
                  className="w-full py-2.5 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isHindi ? "डिजिटल हस्ताक्षर गेटवे तैयार करें" : "Prepare Digital eSign Gateway"}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="w-full py-2.5 rounded-xl border border-[#D5E5D9] bg-white hover:bg-[#F8FAF9] text-[#202824] text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5 text-[#205C43]" />
                  <span>{isHindi ? "प्रिंट / PDF डाउनलोड करें" : "Print / Export Vakalatnama"}</span>
                </button>
              </div>
            </div>

            {/* eSign Boundary / Unconfigured Gateway Notice */}
            {eSignResult && !eSignResult.isConfigured && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-amber-900 font-mono text-[11px] uppercase">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  <span>Licensed ESP Integration Boundary</span>
                </div>
                <p className="leading-relaxed text-[11px] text-amber-900">
                  {eSignResult.missingConfigurationNotice}
                </p>
                <div className="pt-1 text-[10px] font-mono text-amber-800 break-all">
                  <strong>Draft SHA-256:</strong> {eSignResult.documentHash}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Legal Vakalatnama Paper Preview (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#D5E5D9] shadow-sm p-6 sm:p-10 space-y-6 font-serif leading-relaxed text-[#202824] relative">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none text-6xl font-bold font-sans rotate-[-30deg]">
              NYAYLINK VAKALATNAMA
            </div>

            <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed text-[#202824] bg-[#FDFEFC] p-4 rounded-xl border border-[#D5E5D9]/70 overflow-x-auto">
              {vakalatnamaDraftText}
            </pre>

            {/* Official e-Filing Instructions */}
            <div className="pt-4 border-t border-[#D5E5D9] text-xs font-sans text-[#69736D] space-y-2 print:hidden">
              <span className="font-mono text-[10px] uppercase font-bold text-[#202824] block">
                OFFICIAL SUBMISSION INSTRUCTIONS (COURT REGISTRY):
              </span>
              <ol className="list-decimal pl-5 space-y-1 text-[11px]">
                <li>
                  <strong>Physical Filing:</strong> Print this generated Vakalatnama on green legal paper, affix required Advocate Welfare Fund stamps, sign, and file at the court registry filing counter.
                </li>
                <li>
                  <strong>e-Filing 3.0:</strong> Upload scanned copy with advocate digital signature certificate (DSC Token) via the official <a href="https://efiling.ecourts.gov.in" target="_blank" rel="noopener noreferrer" className="text-[#205C43] underline">eCourts e-Filing Portal</a>.
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
