"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LegalMatter,
  ConsultationRequest,
  LawyerProfileData,
  LawyerVerificationData,
} from "@/lib/portal/types";
import { OverviewTab } from "./overview-tab";
import { RequestsTab } from "./requests-tab";
import { MattersTab } from "./matters-tab";
import { CalendarTab } from "./calendar-tab";
import { ProfileTab } from "./profile-tab";
import { DocumentsTab } from "./documents-tab";
import { LogoutButton } from "@/components/logout-button";
import { NyayLinkLogo } from "@/components/ui/nyaylink-logo";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useLanguage } from "@/lib/i18n/context";
import {
  LayoutDashboard,
  Inbox,
  Briefcase,
  Calendar,
  UserCheck,
  FolderLock,
  Menu,
  X,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { CinematicVideoBackground } from "@/components/marketing/cinematic-video-background";

interface LawyerShellProps {
  displayName: string;
  userEmail: string;
  userId: string;
  lawyerProfile: LawyerProfileData | null;
  verification: LawyerVerificationData | null;
  matters: LegalMatter[];
  consultations: ConsultationRequest[];
  initialTab?: string;
}

export function LawyerShell({
  displayName,
  userEmail,
  userId,
  lawyerProfile,
  verification,
  matters,
  consultations,
  initialTab = "overview",
}: LawyerShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || initialTab;
  const { isHindi } = useLanguage();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/lawyer/dashboard?${params.toString()}`);
    setIsMobileMenuOpen(false);
  };

  const pendingRequestsCount = consultations.filter(
    (c) => c.status === "pending"
  ).length;

  const navItems = [
    {
      id: "overview",
      label: isHindi ? "डैशबोर्ड अवलोकन" : "Overview",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: "requests",
      label: isHindi ? "मुवक्किल अनुरोध" : "Client Requests",
      icon: <Inbox className="w-4 h-4" />,
      badge: pendingRequestsCount > 0 ? String(pendingRequestsCount) : undefined,
    },
    {
      id: "matters",
      label: isHindi ? "सक्रिय वाद व केस" : "Assigned Matters",
      icon: <Briefcase className="w-4 h-4" />,
      badge: matters.length > 0 ? String(matters.length) : undefined,
    },
    {
      id: "calendar",
      label: isHindi ? "कॉज लिस्ट व कैलेंडर" : "Calendar & Consults",
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: "profile",
      label: isHindi ? "चैंबर प्रोफाइल" : "Chamber Profile",
      icon: <UserCheck className="w-4 h-4" />,
    },
    {
      id: "documents",
      label: isHindi ? "केस दस्तावेज़" : "Case Vault",
      icon: <FolderLock className="w-4 h-4" />,
    },
  ];

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-[#FDFEFC] text-[#202824] flex flex-col font-sans antialiased relative overflow-x-hidden">
      {/* Low-Intensity Atmospheric Green Smoke Treatment for Advocate Chambers */}
      <CinematicVideoBackground variant="portal" />

      {/* Top Application Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#D5E5D9] px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-[#69736D] hover:bg-[#F2F7F4] transition-colors"
            aria-label="Toggle navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <NyayLinkLogo size="sm" />

          <div className="hidden sm:block h-4 w-px bg-[#D5E5D9] mx-1" />

          <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase font-semibold bg-[#174530] text-white">
            {isHindi ? "अधिवक्ता चैंबर" : "Advocate Chambers"}
          </span>

          {lawyerProfile?.bar_council_number && (
            <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#EAF3ED] text-[#174530] border border-[#D5E5D9]">
              Roll: {lawyerProfile.bar_council_number}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Global Language Switcher */}
          <LanguageSwitcher variant="compact" />

          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-semibold text-[#202824] leading-tight">
              {lawyerProfile?.professional_name || displayName}
            </span>
            <span className="text-[11px] text-[#69736D] leading-tight">
              {userEmail}
            </span>
          </div>

          <div className="h-4 w-px bg-[#D5E5D9] hidden sm:block" />

          <LogoutButton />
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Desktop) */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#D5E5D9] p-4 shrink-0 justify-between">
          <div className="space-y-1.5">
            <div className="px-3 py-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#69736D]">
              {isHindi ? "चैंबर प्रबंधन" : "Chamber Management"}
            </div>
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`w-full h-10 px-3 rounded-xl text-xs font-medium flex items-center justify-between transition-all ${
                    isActive
                      ? "bg-[#EAF3ED] text-[#174530] font-semibold border border-[#D5E5D9] shadow-xs"
                      : "text-[#69736D] hover:bg-[#F8FAF9] hover:text-[#202824]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? "text-[#174530]" : "text-[#69736D]"}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                        isActive
                          ? "bg-[#174530] text-white"
                          : "bg-amber-100 text-amber-900 border border-amber-200"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Verification Status Pill in Sidebar */}
          <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-mono text-[#69736D] uppercase">
                {isHindi ? "सत्यापन स्थिति" : "Verification"}
              </span>
              <span
                className={`font-mono px-1.5 py-0.5 rounded border ${
                  verification?.status === "approved"
                    ? "text-emerald-800 bg-emerald-50 border-emerald-200"
                    : "text-amber-800 bg-amber-50 border-amber-200"
                }`}
              >
                {verification?.status === "approved"
                  ? (isHindi ? "बीसीआई सत्यापित" : "BCI Verified")
                  : (isHindi ? "प्रक्रियाधीन" : "Pending")}
              </span>
            </div>
            <p className="text-[10px] text-[#69736D] leading-tight">
              {lawyerProfile?.is_published
                ? (isHindi ? "पंजीकृत मुवक्किलों को दृश्यमान।" : "Discoverable to registered clients.")
                : (isHindi ? "क्लाइंट निर्देशिका से छिपा हुआ।" : "Hidden from client directory.")}
            </p>
          </div>

          {/* Contextual Link to Public Client Intake */}
          <div className="pt-2">
            <Link
              href="/intake"
              target="_blank"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-[11px] text-[#69736D] hover:text-[#205C43] hover:bg-[#EAF3ED]/60 transition-colors border border-transparent hover:border-[#D5E5D9]"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#205C43]" />
                <span>{isHindi ? "एआई कानूनी इंटेक" : "AI Intake Gateway"}</span>
              </div>
              <ExternalLink className="w-3 h-3 text-[#69736D]" />
            </Link>
          </div>
        </aside>

        {/* Mobile Sidebar Drawer */}
        {isMobileMenuOpen && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsMobileMenuOpen(false);
            }}
            className="fixed inset-0 z-50 md:hidden bg-black/40 backdrop-blur-xs flex"
          >
            <div
              data-lenis-prevent
              className="w-64 bg-white h-full p-4 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200 overflow-y-auto"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-[#D5E5D9]">
                  <span className="font-serif font-semibold text-sm text-[#202824]">
                    {isHindi ? "अधिवक्ता चैंबर" : "Advocate Chambers"}
                  </span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 rounded-lg hover:bg-[#F2F7F4] text-[#69736D]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setTab(item.id)}
                        className={`w-full h-10 px-3 rounded-xl text-xs font-medium flex items-center justify-between transition-all ${
                          isActive
                            ? "bg-[#EAF3ED] text-[#174530] font-semibold border border-[#D5E5D9]"
                            : "text-[#69736D] hover:bg-[#F8FAF9] hover:text-[#202824]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div
              className="flex-1"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          </div>
        )}

        {/* Tab Content Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-6xl mx-auto w-full">
          {currentTab === "overview" && (
            <OverviewTab
              displayName={displayName}
              lawyerProfile={lawyerProfile}
              verification={verification}
              matters={matters}
              consultations={consultations}
              onNavigateTab={setTab}
            />
          )}

          {currentTab === "requests" && (
            <RequestsTab consultations={consultations} />
          )}

          {currentTab === "matters" && <MattersTab matters={matters} />}

          {currentTab === "calendar" && (
            <CalendarTab
              consultations={consultations}
              matters={matters}
              userId={userId}
            />
          )}

          {currentTab === "profile" && (
            <ProfileTab
              userEmail={userEmail}
              lawyerProfile={lawyerProfile}
              verification={verification}
            />
          )}

          {currentTab === "documents" && <DocumentsTab matters={matters} />}
        </main>
      </div>
    </div>
  );
}
