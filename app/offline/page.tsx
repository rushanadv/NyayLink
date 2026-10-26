"use client";

import Link from "next/link";
import { NyayLinkLogo } from "@/components/ui/nyaylink-logo";
import { useLanguage } from "@/lib/i18n/context";
import { WifiOff, RotateCcw, Home, ShieldAlert } from "lucide-react";

export default function OfflinePage() {
  const { isHindi } = useLanguage();

  return (
    <div className="min-h-screen bg-[#FDFEFC] text-[#202824] flex flex-col justify-between p-6 sm:p-10 selection:bg-[#205C43] selection:text-white">
      {/* Top Header */}
      <header className="flex items-center justify-between max-w-4xl mx-auto w-full pt-4">
        <NyayLinkLogo variant="full" size="md" href="/" />
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono font-medium">
          <WifiOff className="w-3.5 h-3.5 text-amber-600" />
          <span>{isHindi ? "ऑफ़लाइन मोड" : "Offline Mode"}</span>
        </div>
      </header>

      {/* Main Content Box */}
      <main className="max-w-lg mx-auto w-full my-auto text-center space-y-6 py-8">
        <div className="w-16 h-16 rounded-2xl bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center text-[#205C43] mx-auto shadow-xs">
          <WifiOff className="w-8 h-8" />
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-serif font-medium text-[#202824]">
            {isHindi ? "इंटरनेट कनेक्शन उपलब्ध नहीं है" : "You Are Currently Offline"}
          </h1>
          <p className="text-xs sm:text-sm text-[#46514A] leading-relaxed">
            {isHindi
              ? "नागरिक गोपनीयता एवं डेटा सुरक्षा नियमों के तहत, एआई पूर्व-परामर्श, वकील खोज एवं केस वॉल्ट हेतु सक्रिय सुरक्षित कनेक्शन आवश्यक है।"
              : "To protect privileged citizen confidentiality and comply with legal data security standards, live AI Preconsultation, advocate discovery, and case vault access require an active connection."}
          </p>
        </div>

        {/* Security Notice */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-left text-xs text-amber-900 flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p>
            {isHindi
              ? "सुरक्षा कारणों से, संवेदनशील कानूनी दस्तावेज़ या व्यक्तिगत बातचीत ऑफ़लाइन कैश में संग्रहीत नहीं की जाती हैं।"
              : "For strict security, private legal documents and privileged conversations are never stored in unprotected offline browser caches."}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl bg-[#205C43] hover:bg-[#174530] text-xs font-semibold text-white transition-colors flex items-center gap-2 shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isHindi ? "पुनः प्रयास करें" : "Retry Connection"}</span>
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-[#EAF3ED] text-xs font-semibold text-[#202824] border border-[#D5E5D9] transition-colors flex items-center gap-2 shadow-xs"
          >
            <Home className="w-3.5 h-3.5 text-[#205C43]" />
            <span>{isHindi ? "होमपेज" : "Home"}</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-[#69736D] max-w-4xl mx-auto w-full pb-4">
        NyayLink Legal Technology • DPDP Act 2023 Compliant Architecture
      </footer>
    </div>
  );
}
