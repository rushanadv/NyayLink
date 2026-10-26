"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/context";
import { Share, PlusSquare, CheckCircle2, X } from "lucide-react";

interface IOSInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IOSInstallModal({ isOpen, onClose }: IOSInstallModalProps) {
  const { t, isHindi } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ios-install-title"
    >
      <div className="bg-white rounded-t-3xl sm:rounded-2xl border border-[#D5E5D9] max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-6 relative animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#EAF3ED] hover:bg-[#D5E5D9] text-[#202824] flex items-center justify-center transition-colors"
          aria-label={t.common.close}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with NyayLink Brand */}
        <div className="flex items-center gap-3.5 pr-8">
          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#D5E5D9] shadow-xs">
            <Image
              src="/icons/apple-touch-icon.png"
              alt="NyayLink App Icon"
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 id="ios-install-title" className="text-lg font-serif font-semibold text-[#202824]">
              {t.pwa.iosInstallTitle}
            </h3>
            <p className="text-xs text-[#69736D] leading-tight mt-0.5">
              {t.pwa.iosInstallSubtitle}
            </p>
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="space-y-3.5 text-xs text-[#202824] bg-[#FDFEFC] p-4 rounded-xl border border-[#D5E5D9]">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#EAF3ED] text-[#205C43] font-bold flex items-center justify-center shrink-0 text-xs">
              1
            </div>
            <div className="pt-0.5">
              <p className="font-semibold">{t.pwa.iosStep1}</p>
              <p className="text-[11px] text-[#69736D]">
                {isHindi
                  ? "यदि आप किसी अन्य ऐप में हैं, तो Safari में खोलें।"
                  : "If you are inside an in-app browser, switch to Safari."}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#EAF3ED] text-[#205C43] font-bold flex items-center justify-center shrink-0 text-xs">
              <Share className="w-3.5 h-3.5 text-[#205C43]" />
            </div>
            <div className="pt-0.5">
              <p className="font-semibold">{t.pwa.iosStep2}</p>
              <p className="text-[11px] text-[#69736D]">
                {isHindi
                  ? "सफ़ारी के नेविगेशन बार में चौकोर तीर वाला शेयर आइकन ढूंढें।"
                  : "Look for the square icon with an upward arrow in Safari's toolbar."}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#EAF3ED] text-[#205C43] font-bold flex items-center justify-center shrink-0 text-xs">
              <PlusSquare className="w-3.5 h-3.5 text-[#205C43]" />
            </div>
            <div className="pt-0.5">
              <p className="font-semibold">{t.pwa.iosStep3}</p>
              <p className="text-[11px] text-[#69736D]">
                {isHindi
                  ? "शेयर शीट में नीचे स्क्रॉल करके 'Add to Home Screen' चुनें।"
                  : "Scroll down the actions list until you see 'Add to Home Screen'."}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#EAF3ED] text-[#205C43] font-bold flex items-center justify-center shrink-0 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#205C43]" />
            </div>
            <div className="pt-0.5">
              <p className="font-semibold">{t.pwa.iosStep4}</p>
              <p className="text-[11px] text-[#69736D]">
                {isHindi
                  ? "पुष्टि करने के लिए ऊपर दाईं ओर 'Add' पर टैप करें।"
                  : "Tap 'Add' to place NyayLink directly on your iPhone home screen."}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white font-semibold text-xs transition-colors shadow-xs"
        >
          {t.pwa.gotIt}
        </button>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
