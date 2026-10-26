"use client";

import { useState } from "react";
import { usePWAInstall } from "./use-pwa-install";
import { IOSInstallModal } from "./ios-install-modal";
import { useLanguage } from "@/lib/i18n/context";
import { Download, Smartphone, CheckCircle2 } from "lucide-react";

interface PWAInstallButtonProps {
  variant?: "navbar" | "mobile-menu" | "footer" | "banner";
  className?: string;
  onInstalledClick?: () => void;
}

export function PWAInstallButton({
  variant = "navbar",
  className = "",
  onInstalledClick,
}: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, isIOSModalOpen, promptInstall, closeIOSModal } =
    usePWAInstall();
  const { t } = useLanguage();
  const [isPrompting, setIsPrompting] = useState(false);

  const handleInstallClick = async () => {
    setIsPrompting(true);
    try {
      const outcome = await promptInstall();
      if (outcome === "accepted" && onInstalledClick) {
        onInstalledClick();
      }
    } finally {
      setIsPrompting(false);
    }
  };

  // 1. Navbar compact variant (desktop navbar)
  if (variant === "navbar") {
    if (isInstalled) {
      return (
        <div
          className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#EAF3ED] text-[#205C43] text-xs font-semibold border border-[#D5E5D9] select-none ${className}`}
          title="NyayLink PWA is active"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-[#205C43]" />
          <span>{t.pwa.installed}</span>
        </div>
      );
    }

    if (!isInstallable) return null;

    return (
      <>
        <button
          onClick={handleInstallClick}
          disabled={isPrompting}
          className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EAF3ED] hover:bg-[#D5E5D9] text-[#205C43] text-xs font-semibold border border-[#D5E5D9] transition-all shadow-2xs active:scale-95 disabled:opacity-50 ${className}`}
          aria-label={t.pwa.installNyayLink}
        >
          <Smartphone className="w-3.5 h-3.5 text-[#205C43]" />
          <span>{t.pwa.installApp}</span>
        </button>
        <IOSInstallModal isOpen={isIOSModalOpen} onClose={closeIOSModal} />
      </>
    );
  }

  // 2. Mobile Menu item variant
  if (variant === "mobile-menu") {
    if (isInstalled) {
      return (
        <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#EAF3ED] text-[#205C43] text-xs font-semibold border border-[#D5E5D9]">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#205C43]" />
            <span>NyayLink App</span>
          </div>
          <span className="flex items-center gap-1 text-[11px] text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t.pwa.installed}
          </span>
        </div>
      );
    }

    return (
      <>
        <button
          onClick={handleInstallClick}
          disabled={isPrompting}
          className={`w-full py-2.5 px-3 rounded-lg bg-[#EAF3ED] hover:bg-[#D5E5D9] text-[#205C43] text-xs font-semibold border border-[#D5E5D9] transition-all flex items-center justify-center gap-2 shadow-2xs active:scale-98 disabled:opacity-50 ${className}`}
        >
          <Download className="w-4 h-4 text-[#205C43]" />
          <span>{t.pwa.installNyayLink}</span>
        </button>
        <IOSInstallModal isOpen={isIOSModalOpen} onClose={closeIOSModal} />
      </>
    );
  }

  // 3. Footer link variant
  if (variant === "footer") {
    if (isInstalled) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-[#69736D] select-none">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t.pwa.installed}</span>
        </span>
      );
    }

    return (
      <>
        <button
          onClick={handleInstallClick}
          className={`inline-flex items-center gap-1.5 text-xs text-left transition-colors hover:text-[#205C43] ${className}`}
        >
          <Download className="w-3.5 h-3.5 text-[#205C43]" />
          <span>{t.pwa.installNyayLink}</span>
        </button>
        <IOSInstallModal isOpen={isIOSModalOpen} onClose={closeIOSModal} />
      </>
    );
  }

  // 4. Banner / Card variant
  return (
    <>
      <button
        onClick={handleInstallClick}
        disabled={isPrompting}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white text-xs font-semibold transition-all shadow-xs active:scale-95 disabled:opacity-50 ${className}`}
      >
        <Download className="w-4 h-4" />
        <span>{t.pwa.installNyayLink}</span>
      </button>
      <IOSInstallModal isOpen={isIOSModalOpen} onClose={closeIOSModal} />
    </>
  );
}
