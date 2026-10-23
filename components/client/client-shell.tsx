"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LegalMatter, ConsultationRequest, UserProfile } from "@/lib/portal/types";
import { PublicLawyer } from "@/components/lawyers/lawyer-directory-client";
import { OverviewTab } from "./overview-tab";
import { MattersTab } from "./matters-tab";
import { AdvocatesTab } from "./advocates-tab";
import { IntakeTab } from "./intake-tab";
import { ConsultationsTab } from "./consultations-tab";
import { DocumentsTab } from "./documents-tab";
import { ProfileTab } from "./profile-tab";
import { LogoutButton } from "@/components/logout-button";
import { CinematicVideoBackground } from "@/components/marketing/cinematic-video-background";
import {
  Scale,
  LayoutDashboard,
  Briefcase,
  Users,
  Sparkles,
  CalendarCheck,
  FolderLock,
  User,
  Plus,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";

interface ClientShellProps {
  displayName: string;
  userEmail: string;
  userId: string;
  profile: UserProfile | null;
  matters: LegalMatter[];
  consultations: ConsultationRequest[];
  advocates: PublicLawyer[];
  initialTab?: string;
}

export function ClientShell({
  displayName,
  userEmail,
  userId,
  profile,
  matters,
  consultations,
  advocates,
  initialTab = "overview",
}: ClientShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || initialTab;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNewMatterModalOpen, setIsNewMatterModalOpen] = useState(false);

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/dashboard?${params.toString()}`);
    setIsMobileMenuOpen(false);
  };

  const pendingConsultationsCount = consultations.filter(
    (c) => c.status === "pending"
  ).length;

  const navItems = [
    {
      id: "overview",
      label: "Overview",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: "matters",
      label: "My Matters",
      icon: <Briefcase className="w-4 h-4" />,
      badge: matters.length > 0 ? String(matters.length) : undefined,
    },
    {
      id: "advocates",
      label: "Find Advocates",
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: "intake",
      label: "AI Legal Intake",
      icon: <Sparkles className="w-4 h-4" />,
      special: true,
    },
    {
      id: "consultations",
      label: "Consultations",
      icon: <CalendarCheck className="w-4 h-4" />,
      badge: pendingConsultationsCount > 0 ? String(pendingConsultationsCount) : undefined,
    },
    {
      id: "documents",
      label: "Documents Vault",
      icon: <FolderLock className="w-4 h-4" />,
    },
    {
      id: "profile",
      label: "Profile & Account",
      icon: <User className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFEFC] text-[#202824] flex flex-col font-sans antialiased relative overflow-x-hidden">
      {/* Low-Intensity Atmospheric Green Smoke Treatment for Client Portal */}
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

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-[#205C43] text-white flex items-center justify-center shadow-xs">
              <Scale className="w-4 h-4" />
            </div>
            <span className="font-serif text-lg font-semibold tracking-tight text-[#202824]">
              NyayLink
            </span>
          </Link>

          <div className="hidden sm:block h-4 w-px bg-[#D5E5D9] mx-1" />

          <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase font-semibold bg-[#EAF3ED] text-[#205C43] border border-[#D5E5D9]">
            Client Portal
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewMatterModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.99]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Matter</span>
          </button>

          <div className="h-4 w-px bg-[#D5E5D9] hidden sm:block" />

          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-semibold text-[#202824] leading-tight">
              {displayName}
            </span>
            <span className="text-[11px] text-[#69736D] leading-tight">
              {userEmail}
            </span>
          </div>

          <LogoutButton />
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Desktop) */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#D5E5D9] p-4 shrink-0 justify-between">
          <div className="space-y-1.5">
            <div className="px-3 py-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#69736D]">
              Navigation
            </div>
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`w-full h-10 px-3 rounded-xl text-xs font-medium flex items-center justify-between transition-all ${
                    isActive
                      ? "bg-[#EAF3ED] text-[#205C43] font-semibold border border-[#D5E5D9] shadow-xs"
                      : "text-[#69736D] hover:bg-[#F8FAF9] hover:text-[#202824]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? "text-[#205C43]" : "text-[#69736D]"}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                        isActive
                          ? "bg-[#205C43] text-white"
                          : "bg-[#F2F7F4] text-[#69736D] border border-[#D5E5D9]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick AI Intake Promo in Sidebar */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#EAF3ED] to-[#F8FAF9] border border-[#D5E5D9] space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#205C43]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Need Quick Answers?</span>
            </div>
            <p className="text-[11px] text-[#69736D] leading-relaxed">
              Use Nyay AI to structure facts before consulting counsel.
            </p>
            <Link
              href="/intake"
              className="text-[11px] font-semibold text-[#205C43] hover:underline flex items-center gap-1"
            >
              <span>Start Intake</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden bg-black/40 backdrop-blur-xs flex">
            <div className="w-64 bg-white h-full p-4 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-[#D5E5D9]">
                  <span className="font-serif font-semibold text-sm text-[#202824]">
                    Client Navigation
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
                            ? "bg-[#EAF3ED] text-[#205C43] font-semibold border border-[#D5E5D9]"
                            : "text-[#69736D] hover:bg-[#F8FAF9] hover:text-[#202824]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EAF3ED] text-[#205C43] font-semibold">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-[#D5E5D9]">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsNewMatterModalOpen(true);
                  }}
                  className="w-full h-10 rounded-xl bg-[#205C43] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Start New Matter</span>
                </button>
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
              matters={matters}
              consultations={consultations}
              onNavigateTab={setTab}
              onOpenNewMatter={() => setIsNewMatterModalOpen(true)}
            />
          )}

          {currentTab === "matters" && (
            <MattersTab
              matters={matters}
              isNewMatterModalOpen={isNewMatterModalOpen}
              onCloseNewMatterModal={() => setIsNewMatterModalOpen(false)}
              onOpenNewMatterModal={() => setIsNewMatterModalOpen(true)}
            />
          )}

          {currentTab === "advocates" && (
            <AdvocatesTab
              advocates={advocates}
              matters={matters}
              onConsultationRequested={() => setTab("consultations")}
            />
          )}

          {currentTab === "intake" && <IntakeTab />}

          {currentTab === "consultations" && (
            <ConsultationsTab
              consultations={consultations}
              onNavigateTab={setTab}
            />
          )}

          {currentTab === "documents" && <DocumentsTab matters={matters} />}

          {currentTab === "profile" && (
            <ProfileTab
              userEmail={userEmail}
              userId={userId}
              profile={profile}
            />
          )}
        </main>
      </div>
    </div>
  );
}
