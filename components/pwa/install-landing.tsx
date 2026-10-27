"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { usePWAInstall } from "./use-pwa-install";
import { IOSInstallModal } from "./ios-install-modal";
import { useLanguage } from "@/lib/i18n/context";
import {
  Smartphone,
  Download,
  Share2,
  Copy,
  Check,
  ExternalLink,
  ChevronLeft,
  Sparkles,
  Scale,
  ShieldCheck,
  PlusSquare,
  QrCode,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

const CANONICAL_INSTALL_URL = "https://nyay.live/install";

export function InstallLanding() {
  const { t, isHindi, locale, setLocale } = useLanguage();
  const {
    isInstallable,
    isInstalled,
    isIOS,
    isIOSModalOpen,
    promptInstall,
    closeIOSModal,
    openIOSModal,
  } = usePWAInstall();

  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [showQrMobile, setShowQrMobile] = useState(false);
  const [isPrompting, setIsPrompting] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  // Generate high-resolution QR code on mount
  useEffect(() => {
    QRCode.toDataURL(CANONICAL_INSTALL_URL, {
      errorCorrectionLevel: "M",
      margin: 2,
      scale: 10,
      color: {
        dark: "#174530",
        light: "#FFFFFF",
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("[NyayLink QR] Failed to generate QR:", err));

    const checkMobile = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(CANONICAL_INSTALL_URL);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: t.installPage.metaTitle,
          text: t.installPage.heroSubtitle,
          url: CANONICAL_INSTALL_URL,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      openIOSModal();
      return;
    }
    setIsPrompting(true);
    try {
      await promptInstall();
    } finally {
      setIsPrompting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFEFC] text-[#202824] selection:bg-[#EAF3ED] selection:text-[#205C43]">
      {/* 1. Header Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#D5E5D9] px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#205C43] rounded-lg p-1"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#D5E5D9] shrink-0 bg-[#0F213A] flex items-center justify-center shadow-xs">
              <Image
                src="/brand/nyaylink-logo.png"
                alt="NyayLink Logo"
                width={32}
                height={32}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <span className="font-serif font-bold text-lg text-[#202824] tracking-tight group-hover:text-[#205C43] transition-colors">
              NyayLink
            </span>
          </Link>
          <span className="hidden sm:inline-block text-xs font-mono px-2 py-0.5 rounded-full bg-[#EAF3ED] text-[#205C43] border border-[#D5E5D9] font-medium">
            {t.installPage.badgePWA}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Language Switcher */}
          <div className="flex items-center bg-[#EAF3ED]/80 p-0.5 rounded-lg border border-[#D5E5D9] text-xs">
            <button
              onClick={() => setLocale("en")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                locale === "en"
                  ? "bg-[#205C43] text-white shadow-xs font-semibold"
                  : "text-[#69736D] hover:text-[#202824]"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLocale("hi")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                locale === "hi"
                  ? "bg-[#205C43] text-white shadow-xs font-semibold"
                  : "text-[#69736D] hover:text-[#202824]"
              }`}
            >
              हिंदी
            </button>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D5E5D9] bg-white hover:bg-[#EAF3ED] text-xs font-medium text-[#202824] transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>{t.installPage.backHome}</span>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-12 sm:space-y-16">
        {/* 2. Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF3ED] border border-[#D5E5D9] text-[#205C43] text-xs font-semibold">
            <Smartphone className="w-3.5 h-3.5" />
            <span>{t.installPage.badgePWA}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#202824] tracking-tight leading-tight sm:leading-tight">
            {t.installPage.heroTitle}
          </h1>

          <p className="text-base sm:text-lg text-[#69736D] leading-relaxed max-w-2xl mx-auto">
            {t.installPage.heroSubtitle}
          </p>

          {/* Action Row */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="px-6 py-3 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white font-semibold text-sm transition-all shadow-sm hover:shadow-md flex items-center gap-2 active:scale-98"
            >
              <span>{t.installPage.openNyayLink}</span>
              <ExternalLink className="w-4 h-4" />
            </Link>

            {/* Install Button / Installed Badge */}
            {isInstalled ? (
              <div className="px-5 py-3 rounded-xl bg-[#EAF3ED] text-[#205C43] border border-[#D5E5D9] font-semibold text-sm flex items-center gap-2 select-none shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-[#205C43]" />
                <span>{t.pwa.installed}</span>
              </div>
            ) : (
              <button
                onClick={handleInstallClick}
                disabled={isPrompting}
                className="px-6 py-3 rounded-xl bg-white hover:bg-[#EAF3ED] text-[#205C43] border border-[#205C43]/40 font-semibold text-sm transition-all shadow-2xs hover:shadow-xs flex items-center gap-2 active:scale-98 disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-[#205C43]" />
                <span>{t.pwa.installNyayLink}</span>
              </button>
            )}

            <button
              onClick={handleNativeShare}
              className="px-4 py-3 rounded-xl bg-white hover:bg-[#EAF3ED] text-[#69736D] hover:text-[#202824] border border-[#D5E5D9] font-medium text-sm transition-colors flex items-center gap-2 shadow-2xs"
              title={t.installPage.shareLink}
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">{t.installPage.shareLink}</span>
            </button>
          </div>
        </section>

        {/* 3. Central QR & Installation Flow Card */}
        <section className="bg-white rounded-3xl border border-[#D5E5D9] shadow-xl shadow-[#202824]/5 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#D5E5D9]">
            {/* Left: Scannable QR Code Panel (Desktop Primary / Mobile Collapsible) */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col items-center justify-between bg-[#FDFEFC]/60">
              <div className="w-full text-center space-y-2 mb-4">
                <span className="text-xs font-mono uppercase tracking-wider text-[#205C43] font-bold">
                  {isMobileScreen ? t.installPage.showQrMobile : t.installPage.qrTitle}
                </span>
                <p className="text-xs text-[#69736D]">
                  {isMobileScreen
                    ? t.installPage.mobileNotice
                    : t.installPage.qrSubtitle}
                </p>
              </div>

              {/* Mobile QR Toggle */}
              {isMobileScreen && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowQrMobile(!showQrMobile)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#EAF3ED] text-[#205C43] text-xs font-semibold border border-[#D5E5D9]"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{showQrMobile ? t.installPage.hideQrMobile : t.installPage.showQrMobile}</span>
                  </button>
                </div>
              )}

              {/* QR Image Container */}
              {(!isMobileScreen || showQrMobile) && (
                <div className="relative group p-4 sm:p-5 rounded-2xl bg-white border border-[#D5E5D9] shadow-sm flex flex-col items-center">
                  <div className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center relative">
                    {qrDataUrl ? (
                      <Image
                        src={qrDataUrl}
                        alt="NyayLink Canonical Installation QR Code"
                        width={256}
                        height={256}
                        className="w-full h-full object-contain rounded-lg"
                        unoptimized
                        priority
                      />
                    ) : (
                      <div className="animate-pulse flex items-center justify-center w-full h-full bg-[#EAF3ED] rounded-lg text-xs text-[#69736D]">
                        Generating QR Code...
                      </div>
                    )}
                  </div>

                  {/* Brand Tag below QR */}
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono text-[#69736D]">
                    <span className="w-2 h-2 rounded-full bg-[#205C43]" />
                    <span>https://nyay.live/install</span>
                  </div>
                </div>
              )}

              {/* QR Scan Helper / Fallback Actions */}
              <div className="w-full mt-6 space-y-3">
                <div className="flex items-center justify-center gap-2 text-xs font-medium text-[#205C43] bg-[#EAF3ED] py-2 px-3 rounded-xl border border-[#D5E5D9]">
                  <QrCode className="w-4 h-4 shrink-0" />
                  <span>{t.installPage.scanInstruction}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 py-2 px-3 rounded-lg bg-white hover:bg-[#EAF3ED] border border-[#D5E5D9] text-xs font-medium text-[#202824] flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">{t.installPage.copied}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#69736D]" />
                        <span>{t.installPage.copyLink}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleNativeShare}
                    className="py-2 px-3 rounded-lg bg-white hover:bg-[#EAF3ED] border border-[#D5E5D9] text-xs font-medium text-[#202824] flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                    title={t.installPage.shareLink}
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#69736D]" />
                    <span>{t.installPage.shareLink}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Pitch-Ready Flow & Device Guidance */}
            <div className="lg:col-span-7 p-6 sm:p-8 space-y-6 flex flex-col justify-between">
              {/* No App Store Overhead Banner */}
              <div className="p-4 rounded-2xl bg-[#EAF3ED]/60 border border-[#D5E5D9] space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#205C43]">
                  <ShieldCheck className="w-4 h-4 text-[#205C43]" />
                  <span>{t.installPage.appStoreClarificationTitle}</span>
                </div>
                <p className="text-xs text-[#69736D] leading-relaxed">
                  {t.installPage.appStoreClarificationDesc}
                </p>
              </div>

              {/* 4-Step Sequence */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#69736D] font-bold block">
                  Installation Sequence
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-[#D5E5D9] shadow-2xs flex flex-col justify-between">
                    <span className="w-5 h-5 rounded-full bg-[#EAF3ED] text-[#205C43] font-bold flex items-center justify-center text-[10px] mb-1">
                      1
                    </span>
                    <span className="font-semibold text-[#202824]">{t.installPage.flowStep1}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#D5E5D9] shadow-2xs flex flex-col justify-between">
                    <span className="w-5 h-5 rounded-full bg-[#EAF3ED] text-[#205C43] font-bold flex items-center justify-center text-[10px] mb-1">
                      2
                    </span>
                    <span className="font-semibold text-[#202824]">{t.installPage.flowStep2}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#D5E5D9] shadow-2xs flex flex-col justify-between">
                    <span className="w-5 h-5 rounded-full bg-[#EAF3ED] text-[#205C43] font-bold flex items-center justify-center text-[10px] mb-1">
                      3
                    </span>
                    <span className="font-semibold text-[#202824]">{t.installPage.flowStep3}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#D5E5D9] shadow-2xs flex flex-col justify-between">
                    <span className="w-5 h-5 rounded-full bg-[#EAF3ED] text-[#205C43] font-bold flex items-center justify-center text-[10px] mb-1">
                      4
                    </span>
                    <span className="font-semibold text-[#202824]">{t.installPage.flowStep4}</span>
                  </div>
                </div>
              </div>

              {/* Device Specific Installation Cards */}
              <div className="space-y-3 pt-2">
                {/* Android / Chromium Box */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    !isIOS && !isInstalled
                      ? "bg-[#FDFEFC] border-[#205C43]/40 shadow-xs"
                      : "bg-white border-[#D5E5D9]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-[#205C43]" />
                      <h3 className="text-xs font-semibold text-[#202824]">
                        {t.installPage.androidTitle}
                      </h3>
                    </div>
                    {!isIOS && !isInstalled && isInstallable && (
                      <button
                        onClick={handleInstallClick}
                        className="px-3 py-1 rounded-lg bg-[#205C43] text-white text-xs font-semibold hover:bg-[#174530] transition-colors"
                      >
                        {t.pwa.installNyayLink}
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-[#69736D] mt-1.5 leading-relaxed">
                    {t.installPage.androidDesc}
                  </p>
                </div>

                {/* iPhone / iPad Safari Box */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    isIOS && !isInstalled
                      ? "bg-[#FDFEFC] border-[#205C43]/40 shadow-xs"
                      : "bg-white border-[#D5E5D9]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-[#205C43]" />
                      <h3 className="text-xs font-semibold text-[#202824]">
                        {t.installPage.iosTitle}
                      </h3>
                    </div>
                    <button
                      onClick={openIOSModal}
                      className="px-3 py-1 rounded-lg bg-[#EAF3ED] hover:bg-[#D5E5D9] text-[#205C43] text-xs font-semibold transition-colors"
                    >
                      {isHindi ? "विस्तृत चरण देखें" : "View Steps"}
                    </button>
                  </div>
                  <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#202824]">
                    <div className="flex items-start gap-1.5 bg-[#FDFEFC] p-2 rounded-lg border border-[#D5E5D9]">
                      <span className="font-bold text-[#205C43]">1.</span>
                      <span>{t.installPage.iosStep1}</span>
                    </div>
                    <div className="flex items-start gap-1.5 bg-[#FDFEFC] p-2 rounded-lg border border-[#D5E5D9]">
                      <span className="font-bold text-[#205C43]">2.</span>
                      <span>{t.installPage.iosStep2}</span>
                    </div>
                    <div className="flex items-start gap-1.5 bg-[#FDFEFC] p-2 rounded-lg border border-[#D5E5D9]">
                      <span className="font-bold text-[#205C43]">3.</span>
                      <span>{t.installPage.iosStep3}</span>
                    </div>
                    <div className="flex items-start gap-1.5 bg-[#FDFEFC] p-2 rounded-lg border border-[#D5E5D9]">
                      <span className="font-bold text-[#205C43]">4.</span>
                      <span>{t.installPage.iosStep4}</span>
                    </div>
                  </div>
                </div>

                {/* Already Installed Card */}
                {isInstalled && (
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs">
                    <div className="flex items-center gap-2 font-semibold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{t.installPage.alreadyInstalledTitle}</span>
                    </div>
                    <p className="text-emerald-700 mt-1 leading-relaxed">
                      {t.installPage.alreadyInstalledDesc}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 4. Real App Screenshot Showcase Strip */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <span className="text-xs font-mono uppercase tracking-wider text-[#205C43] font-bold">
              PLATFORM SHOWCASE
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#202824]">
              {t.installPage.showcaseTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#69736D]">
              {t.installPage.showcaseSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Screen 1: Homepage & Folio */}
            <div className="group rounded-2xl border border-[#D5E5D9] bg-white p-3 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-[#D5E5D9] bg-[#EAF3ED]">
                <Image
                  src="/screenshots/showcase-homepage.png"
                  alt="NyayLink Homepage and Unfolding Brief"
                  fill
                  className="object-cover object-top group-hover:scale-102 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#205C43] font-semibold block">
                  01 • PRACTICE PATHWAYS
                </span>
                <h3 className="text-xs font-semibold text-[#202824]">
                  {t.installPage.screens.homepageTitle}
                </h3>
                <p className="text-[11px] text-[#69736D] leading-snug">
                  {t.installPage.screens.homepageDesc}
                </p>
              </div>
            </div>

            {/* Screen 2: AI Preconsultation */}
            <div className="group rounded-2xl border border-[#D5E5D9] bg-white p-3 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-[#D5E5D9] bg-[#EAF3ED]">
                <Image
                  src="/screenshots/showcase-intake.png"
                  alt="NyayLink AI Preconsultation Assistant"
                  fill
                  className="object-cover object-top group-hover:scale-102 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#205C43] font-semibold block">
                  02 • STATUTORY ORIENTATION
                </span>
                <h3 className="text-xs font-semibold text-[#202824]">
                  {t.installPage.screens.intakeTitle}
                </h3>
                <p className="text-[11px] text-[#69736D] leading-snug">
                  {t.installPage.screens.intakeDesc}
                </p>
              </div>
            </div>

            {/* Screen 3: Advocate Discovery */}
            <div className="group rounded-2xl border border-[#D5E5D9] bg-white p-3 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-[#D5E5D9] bg-[#EAF3ED]">
                <Image
                  src="/screenshots/showcase-lawyers.png"
                  alt="NyayLink Advocate Directory & Roster"
                  fill
                  className="object-cover object-top group-hover:scale-102 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#205C43] font-semibold block">
                  03 • CERTIFIED ADVOCACY
                </span>
                <h3 className="text-xs font-semibold text-[#202824]">
                  {t.installPage.screens.lawyersTitle}
                </h3>
                <p className="text-[11px] text-[#69736D] leading-snug">
                  {t.installPage.screens.lawyersDesc}
                </p>
              </div>
            </div>

            {/* Screen 4: Workspaces & Checklists */}
            <div className="group rounded-2xl border border-[#D5E5D9] bg-white p-3 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-[#D5E5D9] bg-[#EAF3ED]">
                <Image
                  src="/screenshots/showcase-checklists.png"
                  alt="NyayLink Matter Preparation and Checklists"
                  fill
                  className="object-cover object-top group-hover:scale-102 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#205C43] font-semibold block">
                  04 • CASE READINESS
                </span>
                <h3 className="text-xs font-semibold text-[#202824]">
                  {t.installPage.screens.checklistsTitle}
                </h3>
                <p className="text-[11px] text-[#69736D] leading-snug">
                  {t.installPage.screens.checklistsDesc}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Core Value Propositions (Restrained & Honest) */}
        <section className="space-y-6 pt-4">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <span className="text-xs font-mono uppercase tracking-wider text-[#205C43] font-bold">
              TWO CORE PILLARS
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#202824]">
              {t.installPage.valuePropsTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pillar 1: AI Preconsultation */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D5E5D9] shadow-xs hover:shadow-sm transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center text-[#205C43]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-serif font-bold text-[#202824]">
                  {t.installPage.aiTitle}
                </h3>
                <p className="text-xs sm:text-sm text-[#69736D] leading-relaxed">
                  {t.installPage.aiDesc}
                </p>
              </div>

              <div className="pt-4 border-t border-[#D5E5D9] flex items-start gap-2 text-[11px] text-[#69736D]">
                <HelpCircle className="w-4 h-4 text-[#205C43] shrink-0 mt-0.5" />
                <span className="leading-snug">{t.installPage.aiNote}</span>
              </div>
            </div>

            {/* Pillar 2: Advocate Directory & Verified Roster */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D5E5D9] shadow-xs hover:shadow-sm transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center text-[#205C43]">
                  <Scale className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-serif font-bold text-[#202824]">
                  {t.installPage.lawyersTitle}
                </h3>
                <p className="text-xs sm:text-sm text-[#69736D] leading-relaxed">
                  {t.installPage.lawyersDesc}
                </p>
              </div>

              <div className="pt-4 border-t border-[#D5E5D9] flex items-start gap-2 text-[11px] text-[#69736D]">
                <ShieldCheck className="w-4 h-4 text-[#205C43] shrink-0 mt-0.5" />
                <span className="leading-snug">{t.installPage.lawyersNote}</span>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Pitch Closing CTA */}
        <section className="bg-gradient-to-br from-[#174530] to-[#205C43] rounded-3xl p-8 sm:p-12 text-white text-center space-y-4 shadow-xl">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-200 font-semibold">
            READY TO PRESENT OR DEMO
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight">
            {isHindi ? "विधिक सशक्तिकरण, अब आपकी जेब में।" : "Legal Empowerment, In Your Pocket."}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl mx-auto leading-relaxed">
            {isHindi
              ? "क्यूआर कोड को किसी भी स्मार्टफोन से स्कैन करें, सीधे होम स्क्रीन पर जोड़ें, और पूर्व-परामर्श से लेकर केस तैयारी तक की गति का अनुभव करें।"
              : "Scan the QR code with any smartphone camera, add directly to your home screen, and experience fast, transparent legal assistance on the go."}
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="px-6 py-3 rounded-xl bg-white hover:bg-[#EAF3ED] text-[#174530] font-semibold text-xs sm:text-sm transition-all shadow-md active:scale-98"
            >
              {t.installPage.openNyayLink}
            </Link>
            <button
              onClick={handleNativeShare}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs sm:text-sm transition-all active:scale-98"
            >
              {t.installPage.shareLink}
            </button>
          </div>
        </section>
      </main>

      {/* 7. Footer */}
      <footer className="border-t border-[#D5E5D9] bg-white py-8 px-4 sm:px-8 mt-12 text-center text-xs text-[#69736D] space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-[#202824]">
          <Link href="/" className="hover:text-[#205C43]">
            {t.installPage.backHome}
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-[#205C43]">
            {t.home.footer.privacyPolicy}
          </Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-[#205C43]">
            {t.home.footer.termsService}
          </Link>
          <span>•</span>
          <Link href="/support" className="hover:text-[#205C43]">
            {t.home.footer.supportContact}
          </Link>
        </div>
        <p className="text-[11px] text-[#69736D]">
          {t.home.footer.copyright}
        </p>
      </footer>

      {/* iOS Safari Instruction Modal */}
      <IOSInstallModal isOpen={isIOSModalOpen} onClose={closeIOSModal} />
    </div>
  );
}
