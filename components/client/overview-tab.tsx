"use client";

import { LegalMatter, ConsultationRequest } from "@/lib/portal/types";
import {
  Briefcase,
  CalendarCheck,
  Sparkles,
  ArrowRight,
  Clock,
} from "lucide-react";

interface OverviewTabProps {
  displayName: string;
  matters: LegalMatter[];
  consultations: ConsultationRequest[];
  onNavigateTab: (tab: string) => void;
  onOpenNewMatter: () => void;
}

export function OverviewTab({
  displayName,
  matters,
  consultations,
  onNavigateTab,
  onOpenNewMatter,
}: OverviewTabProps) {
  const activeMatters = matters.filter(
    (m) => m.status !== "closed" && m.status !== "resolved"
  );
  const pendingConsultations = consultations.filter((c) => c.status === "pending");
  const upcomingConsultations = consultations.filter(
    (c) => c.status === "scheduled" || c.status === "accepted"
  );

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#F4FAF6] via-[#EAF3ED] to-[#FFFFFF] border border-[#D5E5D9] shadow-xs">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#D5E5D9] text-[11px] font-mono font-semibold text-[#205C43] mb-3 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#205C43] animate-pulse" />
            CLIENT LEGAL WORKSPACE
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#202824] tracking-tight">
            Welcome back, {displayName}
          </h1>
          <p className="text-sm text-[#69736D] mt-2 leading-relaxed">
            Manage your legal matters, schedule verified advocate consultations, and monitor timeline progress from this confidential workspace.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={onOpenNewMatter}
              className="px-4 py-2.5 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs active:scale-[0.99]"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Start New Legal Matter</span>
            </button>
            <button
              onClick={() => onNavigateTab("advocates")}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#F2F7F4] border border-[#D5E5D9] text-[#202824] text-xs font-semibold flex items-center gap-2 transition-all shadow-xs"
            >
              <span>Find Verified Advocates</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#69736D]" />
            </button>
            <a
              href="/intake"
              className="px-4 py-2.5 rounded-xl bg-[#EAF3ED] hover:bg-[#D5E5D9] border border-[#D5E5D9] text-[#205C43] text-xs font-semibold flex items-center gap-2 transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#205C43]" />
              <span>Start AI Preconsultation</span>
            </a>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#69736D]">
              Active Matters
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EAF3ED] text-[#205C43] flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-semibold text-[#202824]">
            {activeMatters.length}
          </div>
          <p className="text-xs text-[#69736D]">
            {activeMatters.length === 1
              ? "1 active legal docket underway"
              : `${activeMatters.length} active legal dockets`}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#69736D]">
              Pending Requests
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-semibold text-[#202824]">
            {pendingConsultations.length}
          </div>
          <p className="text-xs text-[#69736D]">
            {pendingConsultations.length === 1
              ? "1 advocate review in progress"
              : `${pendingConsultations.length} awaiting advocate review`}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#69736D]">
              Scheduled Conferences
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EAF3ED] text-[#205C43] flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-semibold text-[#202824]">
            {upcomingConsultations.length}
          </div>
          <p className="text-xs text-[#69736D]">
            {upcomingConsultations.length > 0
              ? "Advocate consultation confirmed"
              : "No upcoming appointments"}
          </p>
        </div>
      </div>

      {/* Two Column Section: Recent Matters & Consultations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Matters Summary */}
        <div className="p-6 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-serif font-semibold text-[#202824]">
                Recent Legal Matters
              </h2>
              <p className="text-xs text-[#69736D]">
                Your registered dockets and proceedings
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("matters")}
              className="text-xs font-semibold text-[#205C43] hover:text-[#174530] flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {matters.length === 0 ? (
            <div className="p-6 rounded-xl bg-[#F8FAF9] border border-dashed border-[#D5E5D9] text-center space-y-2">
              <Briefcase className="w-6 h-6 text-[#69736D] mx-auto opacity-60" />
              <p className="text-xs font-medium text-[#202824]">No legal matters registered yet</p>
              <p className="text-[11px] text-[#69736D]">
                Start your first matter to track counsel assignment and milestone timelines.
              </p>
              <button
                onClick={onOpenNewMatter}
                className="mt-2 text-xs font-semibold text-[#205C43] hover:underline"
              >
                + Register New Matter
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {matters.slice(0, 3).map((matter) => (
                <div
                  key={matter.id}
                  onClick={() => onNavigateTab("matters")}
                  className="p-3.5 rounded-xl border border-[#D5E5D9] hover:border-[#205C43] hover:bg-[#F8FAF9] cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#202824] line-clamp-1">
                      {matter.title}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-medium bg-[#EAF3ED] text-[#205C43] border border-[#D5E5D9] shrink-0">
                      {matter.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-[#69736D] line-clamp-1">
                    {matter.category} · {matter.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Consultations Summary */}
        <div className="p-6 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-serif font-semibold text-[#202824]">
                Consultation Requests
              </h2>
              <p className="text-xs text-[#69736D]">
                Advocate appointments and status
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("consultations")}
              className="text-xs font-semibold text-[#205C43] hover:text-[#174530] flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {consultations.length === 0 ? (
            <div className="p-6 rounded-xl bg-[#F8FAF9] border border-dashed border-[#D5E5D9] text-center space-y-2">
              <CalendarCheck className="w-6 h-6 text-[#69736D] mx-auto opacity-60" />
              <p className="text-xs font-medium text-[#202824]">No consultation requests placed</p>
              <p className="text-[11px] text-[#69736D]">
                Find a verified advocate across high courts and book a preliminary conference.
              </p>
              <button
                onClick={() => onNavigateTab("advocates")}
                className="mt-2 text-xs font-semibold text-[#205C43] hover:underline"
              >
                Browse Advocate Directory &rarr;
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {consultations.slice(0, 3).map((c) => (
                <div
                  key={c.id}
                  onClick={() => onNavigateTab("consultations")}
                  className="p-3.5 rounded-xl border border-[#D5E5D9] hover:border-[#205C43] hover:bg-[#F8FAF9] cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#202824] line-clamp-1">
                      {c.subject}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-medium border shrink-0 ${
                        c.status === "accepted" || c.status === "scheduled"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : c.status === "pending"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-gray-50 text-gray-700 border-gray-200"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#69736D] line-clamp-1">
                    {c.lawyer?.professional_name || "Assigned Advocate"} · {c.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Legal Calendar & Cause List Card */}
      <div className="p-6 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EAF3ED] text-[#205C43] border border-[#D5E5D9] flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-serif font-semibold text-[#202824]">
                Upcoming Legal Calendar & Hearings
              </h2>
              <p className="text-xs text-[#69736D]">
                Scheduled advocate conferences, court hearings, and filing dates
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab("calendar")}
            className="px-3.5 py-1.5 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <span>View Full Calendar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {upcomingConsultations.length === 0 ? (
          <div className="p-4 rounded-xl bg-[#F8FAF9] border border-dashed border-[#D5E5D9] text-center text-xs text-[#69736D]">
            <span>No upcoming hearings scheduled today. </span>
            <button
              onClick={() => onNavigateTab("calendar")}
              className="font-semibold text-[#205C43] hover:underline ml-1"
            >
              Open Legal Calendar &rarr;
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingConsultations.slice(0, 3).map((c) => (
              <div
                key={c.id}
                onClick={() => onNavigateTab("calendar")}
                className="p-3 rounded-xl border border-[#D5E5D9] hover:border-[#205C43] bg-[#FDFEFC] hover:bg-white cursor-pointer transition-all space-y-1"
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                    Confirmed
                  </span>
                  <span className="text-[#69736D]">
                    {c.scheduled_at ? new Date(c.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Flexible"}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-[#202824] line-clamp-1">
                  {c.subject}
                </h4>
                <p className="text-[11px] text-[#69736D] line-clamp-1">
                  Advocate: {c.lawyer?.professional_name || "Assigned Counsel"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Legal Intake Card */}
      <div className="p-6 rounded-2xl bg-[#F8FAF9] border border-[#D5E5D9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center text-[#205C43] shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#202824]">
              Nyay AI Preconsultation & Case Assessment
            </h3>
            <p className="text-xs text-[#69736D] mt-0.5 max-w-xl leading-relaxed">
              Analyze Indian legal provisions, structure your case facts, and generate a lawyer-ready case brief before booking your advocate consultation.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab("intake")}
          className="px-4 py-2 rounded-xl bg-white hover:bg-[#EAF3ED] border border-[#D5E5D9] text-[#205C43] text-xs font-semibold shrink-0 transition-colors shadow-xs"
        >
          Open AI Preconsultation &rarr;
        </button>
      </div>
    </div>
  );
}
