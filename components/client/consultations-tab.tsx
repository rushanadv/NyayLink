"use client";

import { useState } from "react";
import { ConsultationRequest } from "@/lib/portal/types";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  ShieldCheck,
  RotateCcw,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { revokeBriefHandoff } from "@/app/actions/briefs";

interface ConsultationsTabProps {
  consultations: ConsultationRequest[];
  onNavigateTab: (tab: string) => void;
}

export function ConsultationsTab({
  consultations,
  onNavigateTab,
}: ConsultationsTabProps) {
  const [filter, setFilter] = useState<string>("all");
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokeNotice, setRevokeNotice] = useState<string | null>(null);

  const handleRevoke = async (c: ConsultationRequest) => {
    if (
      !confirm(
        "Are you sure you want to withdraw this consultation request? Any shared AI preconsultation brief will be revoked immediately."
      )
    ) {
      return;
    }
    setRevokingId(c.id);
    try {
      if (c.brief_handoff_id) {
        await revokeBriefHandoff({
          handoffId: c.brief_handoff_id,
          reason: "Withdrawn by client from dashboard",
        });
      }
      setRevokeNotice("Consultation request and brief sharing successfully withdrawn.");
      setTimeout(() => setRevokeNotice(null), 3000);
      window.location.reload();
    } catch (e) {
      console.error("Revoke error:", e);
    } finally {
      setRevokingId(null);
    }
  };

  const filteredConsultations = consultations.filter((c) => {
    if (filter === "all") return true;
    if (filter === "pending") return c.status === "pending";
    if (filter === "scheduled")
      return c.status === "scheduled" || c.status === "accepted";
    if (filter === "archived")
      return c.status === "declined" || c.status === "completed" || c.status === "cancelled";
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "Awaiting Advocate Review",
          bg: "bg-amber-50 text-amber-800 border-amber-200",
          icon: <Clock className="w-3.5 h-3.5 text-amber-700" />,
        };
      case "accepted":
      case "scheduled":
        return {
          label: "Consultation Confirmed",
          bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />,
        };
      case "declined":
        return {
          label: "Declined by Chambers",
          bg: "bg-red-50 text-red-800 border-red-200",
          icon: <XCircle className="w-3.5 h-3.5 text-red-700" />,
        };
      case "completed":
        return {
          label: "Consultation Completed",
          bg: "bg-blue-50 text-blue-800 border-blue-200",
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />,
        };
      default:
        return {
          label: status,
          bg: "bg-gray-50 text-gray-700 border-gray-200",
          icon: <Clock className="w-3.5 h-3.5 text-gray-500" />,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D5E5D9]">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-semibold text-[#202824]">
            Advocate Consultations
          </h1>
          <p className="text-xs text-[#69736D] mt-1">
            Review consultation requests, confirmed conferences, and advocate responses.
          </p>
        </div>
        <button
          onClick={() => onNavigateTab("advocates")}
          className="px-4 py-2 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs self-start sm:self-auto"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Book New Consultation</span>
        </button>
      </div>

      {revokeNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{revokeNotice}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D5E5D9] pb-3 text-xs font-mono">
        {[
          { id: "all", label: `All (${consultations.length})` },
          {
            id: "pending",
            label: `Pending (${consultations.filter((c) => c.status === "pending").length})`,
          },
          {
            id: "scheduled",
            label: `Confirmed (${
              consultations.filter(
                (c) => c.status === "scheduled" || c.status === "accepted"
              ).length
            })`,
          },
          {
            id: "archived",
            label: `Past / Inactive (${
              consultations.filter(
                (c) =>
                  c.status === "declined" ||
                  c.status === "completed" ||
                  c.status === "cancelled"
              ).length
            })`,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === tab.id
                ? "bg-[#205C43] text-white font-semibold shadow-xs"
                : "text-[#69736D] hover:bg-[#F2F7F4] hover:text-[#202824]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Consultations List */}
      {filteredConsultations.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white border border-[#D5E5D9] text-center space-y-3">
          <Calendar className="w-8 h-8 text-[#69736D] mx-auto opacity-50" />
          <h3 className="text-base font-serif font-semibold text-[#202824]">
            No Consultations Found
          </h3>
          <p className="text-xs text-[#69736D] max-w-sm mx-auto">
            {filter === "all"
              ? "You haven't requested any advocate conferences yet. Browse our verified advocates directory to schedule a session."
              : "No consultations match the selected filter."}
          </p>
          <button
            onClick={() => onNavigateTab("advocates")}
            className="text-xs font-semibold text-[#205C43] hover:underline pt-2 block mx-auto"
          >
            Browse Advocate Directory &rarr;
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredConsultations.map((c) => {
            const badge = getStatusBadge(c.status);
            return (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#D5E5D9]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#EAF3ED] text-[#205C43] flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-serif font-semibold text-[#202824]">
                        {c.lawyer?.professional_name || "Advocate Chambers"}
                      </h3>
                      <p className="text-[11px] text-[#69736D]">
                        Requested on {new Date(c.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {(c.has_ai_brief ||
                      Boolean(c.brief_handoff_id) ||
                      c.message.includes("[AUDIT: CLIENT-SHARED AI PRECONSULTATION BRIEF]")) && (
                      <span className="text-[10px] font-mono font-semibold text-[#205C43] bg-[#EAF3ED] px-2 py-0.5 rounded border border-[#205C43]/30 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-[#205C43]" />
                        <span>AI Preconsultation Brief (Shared)</span>
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-full border font-medium ${badge.bg}`}
                    >
                      {badge.icon}
                      <span>{badge.label}</span>
                    </span>
                    {c.is_demo && (
                      <span className="text-[10px] font-mono text-[#205C43] bg-[#EAF3ED] px-2 py-0.5 rounded border border-[#D5E5D9]">
                        DEMO
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-[#202824]">
                    {c.subject}
                  </h4>
                  <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] text-xs text-[#202824] leading-relaxed whitespace-pre-wrap">
                    {c.message}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-[#69736D]">
                  <div className="flex items-center gap-3">
                    {c.preferred_date && (
                      <span>
                        Preferred Date: <strong className="text-[#202824]">{c.preferred_date}</strong>
                      </span>
                    )}
                    {c.scheduled_at && (
                      <span className="text-[#205C43] font-semibold">
                        Scheduled: {new Date(c.scheduled_at).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {c.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => handleRevoke(c)}
                      disabled={revokingId === c.id}
                      className="px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Withdraw request and revoke shared preconsultation brief"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{revokingId === c.id ? "Revoking..." : "Withdraw / Revoke Brief"}</span>
                    </button>
                  )}

                  {c.lawyer_response && (
                    <div className="w-full mt-2 p-3 rounded-xl bg-[#EAF3ED]/80 border border-[#D5E5D9] text-xs space-y-1">
                      <span className="font-mono font-semibold uppercase text-[10px] text-[#205C43]">
                        Advocate Response / Notes:
                      </span>
                      <p className="text-[#202824] leading-relaxed">
                        {c.lawyer_response}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
