"use client";

import {
  LegalMatter,
  ConsultationRequest,
  LawyerProfileData,
  LawyerVerificationData,
} from "@/lib/portal/types";
import {
  Briefcase,
  CalendarCheck,
  Clock,
  ArrowRight,
  Scale,
} from "lucide-react";

interface OverviewTabProps {
  displayName: string;
  lawyerProfile: LawyerProfileData | null;
  verification: LawyerVerificationData | null;
  matters: LegalMatter[];
  consultations: ConsultationRequest[];
  onNavigateTab: (tab: string) => void;
}

export function OverviewTab({
  displayName,
  lawyerProfile,
  verification,
  matters,
  consultations,
  onNavigateTab,
}: OverviewTabProps) {
  const pendingRequests = consultations.filter((c) => c.status === "pending");
  const confirmedConsultations = consultations.filter(
    (c) => c.status === "accepted" || c.status === "scheduled"
  );
  const activeMatters = matters.filter(
    (m) => m.status !== "closed" && m.status !== "resolved"
  );

  return (
    <div className="space-y-8">
      {/* Verification & Demonstration Status Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#F8FAF9] border border-[#D5E5D9] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#69736D]">
                Account Status
              </span>
              <h2 className="text-sm font-semibold text-[#202824]">
                Demonstration Advocate Profile — Bar Council Verification Pending
              </h2>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-medium self-start sm:self-auto">
            Status: {verification?.status || "pending"}
          </span>
        </div>
        <p className="text-xs text-[#69736D] leading-relaxed">
          In strict compliance with Section 36 of the Advocates Act, 1961 and Bar Council of India guidelines, this demonstration advocate profile is private and withheld from the public lawyer directory until statutory enrollment credentials undergo administrative review.
        </p>
      </div>

      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#F4FAF6] via-[#FFFFFF] to-[#EAF3ED] border border-[#D5E5D9] shadow-xs">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#D5E5D9] text-[11px] font-mono font-semibold text-[#174530] mb-3 shadow-xs">
            <Scale className="w-3.5 h-3.5 text-[#205C43]" />
            <span>ADVOCATE CHAMBERS DOCKET</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#202824] tracking-tight">
            Chambers of {lawyerProfile?.professional_name || displayName}
          </h1>
          <p className="text-sm text-[#69736D] mt-2 leading-relaxed">
            Manage incoming client intake requests, review retainers, maintain chronological matter timelines, and schedule privileged conferences.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigateTab("requests")}
              className="px-4 py-2.5 rounded-xl bg-[#174530] hover:bg-[#0E2C1E] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs active:scale-[0.99]"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Review Client Requests ({pendingRequests.length})</span>
            </button>
            <button
              onClick={() => onNavigateTab("matters")}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#F2F7F4] border border-[#D5E5D9] text-[#202824] text-xs font-semibold flex items-center gap-2 transition-all shadow-xs"
            >
              <Briefcase className="w-3.5 h-3.5 text-[#69736D]" />
              <span>View Active Dockets</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row (No fake numbers! Real DB counts only) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#69736D]">
              Incoming Requests
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-semibold text-[#202824]">
            {pendingRequests.length}
          </div>
          <p className="text-xs text-[#69736D]">
            {pendingRequests.length === 1
              ? "1 request awaiting chamber decision"
              : `${pendingRequests.length} awaiting chamber review`}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#69736D]">
              Assigned Matters
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
              ? "1 active legal docket retained"
              : `${activeMatters.length} active client dockets`}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#69736D]">
              Confirmed Conferences
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EAF3ED] text-[#205C43] flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-semibold text-[#202824]">
            {confirmedConsultations.length}
          </div>
          <p className="text-xs text-[#69736D]">
            {confirmedConsultations.length > 0
              ? "Scheduled consultation sessions"
              : "No upcoming appointments"}
          </p>
        </div>
      </div>

      {/* Two Columns: Pending Consultation Requests & Active Matters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Requests */}
        <div className="p-6 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-serif font-semibold text-[#202824]">
                Pending Client Requests
              </h2>
              <p className="text-xs text-[#69736D]">
                Consultations submitted to your chambers
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("requests")}
              className="text-xs font-semibold text-[#205C43] hover:text-[#174530] flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="p-6 rounded-xl bg-[#F8FAF9] border border-dashed border-[#D5E5D9] text-center space-y-2">
              <Clock className="w-6 h-6 text-[#69736D] mx-auto opacity-60" />
              <p className="text-xs font-medium text-[#202824]">No pending consultation requests</p>
              <p className="text-[11px] text-[#69736D]">
                New client consultation bookings will appear here for your review and acceptance.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.slice(0, 3).map((req) => (
                <div
                  key={req.id}
                  onClick={() => onNavigateTab("requests")}
                  className="p-3.5 rounded-xl border border-[#D5E5D9] hover:border-[#205C43] hover:bg-[#F8FAF9] cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#202824] line-clamp-1">
                      {req.subject}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-medium bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                      Pending Action
                    </span>
                  </div>
                  <p className="text-xs text-[#69736D] line-clamp-2">
                    {req.message}
                  </p>
                  <div className="text-[11px] text-[#69736D] pt-1 border-t border-[#D5E5D9]/50 flex justify-between">
                    <span>Preferred Date: {req.preferred_date || "Flexible"}</span>
                    <span className="font-semibold text-[#205C43]">Review & Respond &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assigned Matters */}
        <div className="p-6 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-serif font-semibold text-[#202824]">
                Assigned Legal Dockets
              </h2>
              <p className="text-xs text-[#69736D]">
                Matters retained under your representation
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
              <p className="text-xs font-medium text-[#202824]">No assigned dockets yet</p>
              <p className="text-[11px] text-[#69736D]">
                When clients retain your chambers for representation, their case files will be accessible here.
              </p>
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
                  <div className="text-[11px] text-[#69736D] pt-1 border-t border-[#D5E5D9]/50 flex justify-between">
                    <span>Updates: {matter.updates?.length || 0} entries</span>
                    <span className="font-semibold text-[#205C43]">Open Docket &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
