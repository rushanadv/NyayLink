"use client";

import { useState } from "react";
import { ConsultationRequest } from "@/lib/portal/types";
import { respondToConsultationRequest } from "@/app/actions/portal";
import {
  Inbox,
  CheckCircle2,
  XCircle,
  User,
  Send,
  X,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Scale,
} from "lucide-react";

interface RequestsTabProps {
  consultations: ConsultationRequest[];
}

export function RequestsTab({ consultations }: RequestsTabProps) {
  const [filter, setFilter] = useState<string>("pending");
  const [activeRequest, setActiveRequest] = useState<ConsultationRequest | null>(null);
  const [actionType, setActionType] = useState<"accepted" | "declined" | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [viewingBriefReq, setViewingBriefReq] = useState<ConsultationRequest | null>(null);

  const filtered = consultations.filter((c) => {
    if (filter === "all") return true;
    if (filter === "pending") return c.status === "pending";
    if (filter === "accepted")
      return c.status === "accepted" || c.status === "scheduled";
    if (filter === "declined") return c.status === "declined";
    return true;
  });

  const handleOpenActionModal = (
    req: ConsultationRequest,
    type: "accepted" | "declined"
  ) => {
    setActiveRequest(req);
    setActionType(type);
    setResponseMessage(
      type === "accepted"
        ? "Chambers has reviewed your brief and accepted the preliminary conference. Please prepare relevant contracts and notice exchanges."
        : "Thank you for reaching out. Regrettably, due to active bench commitments and hearing schedules, chambers cannot accept new instructions in this matter at this time."
    );
    if (type === "accepted" && req.preferred_date) {
      setScheduledAt(`${req.preferred_date}T11:00`);
    } else {
      setScheduledAt("");
    }
    setFeedback(null);
  };

  const handleCloseModal = () => {
    setActiveRequest(null);
    setActionType(null);
    setFeedback(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequest || !actionType) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await respondToConsultationRequest({
        requestId: activeRequest.id,
        status: actionType,
        lawyerResponse: responseMessage,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to update consultation request");
      }

      setFeedback({
        type: "success",
        text: `Consultation request marked as ${actionType}. Client record updated.`,
      });

      setTimeout(() => {
        handleCloseModal();
      }, 1500);
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Action failed",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D5E5D9]">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-semibold text-[#202824]">
            Client Intake Requests
          </h1>
          <p className="text-xs text-[#69736D] mt-1">
            Review incoming consultation inquiries and accept or decline chamber retainers.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D5E5D9] pb-3 text-xs font-mono">
        {[
          {
            id: "pending",
            label: `Pending Review (${
              consultations.filter((c) => c.status === "pending").length
            })`,
          },
          {
            id: "accepted",
            label: `Accepted (${
              consultations.filter(
                (c) => c.status === "accepted" || c.status === "scheduled"
              ).length
            })`,
          },
          {
            id: "declined",
            label: `Declined (${
              consultations.filter((c) => c.status === "declined").length
            })`,
          },
          { id: "all", label: `All Requests (${consultations.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === tab.id
                ? "bg-[#174530] text-white font-semibold shadow-xs"
                : "text-[#69736D] hover:bg-[#F2F7F4] hover:text-[#202824]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white border border-[#D5E5D9] text-center space-y-3">
          <Inbox className="w-8 h-8 text-[#69736D] mx-auto opacity-50" />
          <h3 className="text-base font-serif font-semibold text-[#202824]">
            No Requests Found
          </h3>
          <p className="text-xs text-[#69736D] max-w-sm mx-auto">
            {filter === "pending"
              ? "All incoming inquiries have been reviewed and actioned."
              : "No consultation requests found for this category."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((req) => {
            const isAiBrief =
              Boolean(req.has_ai_brief) ||
              Boolean(req.brief_handoff_id) ||
              req.message.includes("[AUDIT: CLIENT-SHARED AI PRECONSULTATION BRIEF]");
            const isRevoked =
              req.status === "cancelled" ||
              req.message.includes("[BRIEF REVOKED]") ||
              req.message.includes("[CONSULTATION WITHDRAWN BY CLIENT]");

            return (
              <div
                key={req.id}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D5E5D9]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#EAF3ED] text-[#205C43] flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#202824]">
                        {req.client?.full_name || `Client #${req.client_id.slice(0, 8)}`}
                      </span>
                      <p className="text-[11px] text-[#69736D]">
                        Received on {new Date(req.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {isAiBrief && (
                      <span className="text-[10px] font-mono font-semibold text-[#205C43] bg-[#EAF3ED] px-2 py-0.5 rounded border border-[#205C43]/30 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-[#205C43]" />
                        <span>AI Preconsultation Brief (Client-Shared)</span>
                      </span>
                    )}
                    <span
                      className={`text-[11px] font-mono px-2.5 py-1 rounded-full border font-medium uppercase ${
                        req.status === "accepted" || req.status === "scheduled"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : req.status === "pending"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-red-50 text-red-800 border-red-200"
                      }`}
                    >
                      {req.status}
                    </span>
                    {req.is_demo && (
                      <span className="text-[10px] font-mono text-[#205C43] bg-[#EAF3ED] px-2 py-0.5 rounded border border-[#D5E5D9]">
                        DEMO
                      </span>
                    )}
                  </div>
                </div>

                {isRevoked ? (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
                    <div>
                      <strong className="block font-semibold">Consultation Withdrawn by Client</strong>
                      <span className="text-[11px] text-amber-800">
                        The client revoked this preconsultation brief. Brief contents are no longer active.
                      </span>
                    </div>
                  </div>
                ) : isAiBrief ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-[#202824]">
                        {req.subject}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setViewingBriefReq(req)}
                        className="px-3 py-1.5 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Full Brief</span>
                      </button>
                    </div>

                    <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] text-xs text-[#202824] leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap">
                      {req.message}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-[#202824]">
                      {req.subject}
                    </h3>
                    <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] text-xs text-[#202824] leading-relaxed whitespace-pre-wrap">
                      {req.message}
                    </div>
                  </div>
                )}

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#69736D]">
                <div className="flex items-center gap-3">
                  <span>
                    Client Requested Date:{" "}
                    <strong className="text-[#202824]">
                      {req.preferred_date || "Not specified"}
                    </strong>
                  </span>
                  {req.scheduled_at && (
                    <span className="text-emerald-700 font-semibold">
                      Scheduled for: {new Date(req.scheduled_at).toLocaleString()}
                    </span>
                  )}
                </div>

                {req.status === "pending" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenActionModal(req, "declined")}
                      className="px-3 py-1.5 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-50 text-red-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </button>
                    <button
                      onClick={() => handleOpenActionModal(req, "accepted")}
                      className="px-3.5 py-1.5 rounded-xl bg-[#174530] hover:bg-[#0E2C1E] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Accept & Schedule</span>
                    </button>
                  </div>
                )}
              </div>

              {req.lawyer_response && (
                <div className="p-3.5 rounded-xl bg-[#EAF3ED]/80 border border-[#D5E5D9] text-xs space-y-1 mt-2">
                  <span className="font-mono font-semibold uppercase text-[10px] text-[#174530]">
                    Your Response to Client:
                  </span>
                  <p className="text-[#202824] leading-relaxed">
                    {req.lawyer_response}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      )}

      {/* Action Modal */}
      {activeRequest && actionType && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-[#D5E5D9] shadow-xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#D5E5D9]">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    actionType === "accepted"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {actionType === "accepted" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-serif font-semibold text-[#202824]">
                    {actionType === "accepted"
                      ? "Accept Consultation Request"
                      : "Decline Consultation Request"}
                  </h3>
                  <p className="text-[11px] text-[#69736D]">
                    Matter: {activeRequest.subject}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-[#69736D] hover:text-[#202824] transition-colors p-1 rounded-lg hover:bg-[#F2F7F4]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-xl text-xs ${
                  feedback.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-red-50 border border-red-200 text-red-800"
                }`}
              >
                {feedback.text}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {actionType === "accepted" && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-semibold uppercase text-[#202824]">
                    Schedule Consultation Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full h-10 px-3.5 rounded-xl border border-[#D5E5D9] text-xs text-[#202824] focus:outline-none focus:border-[#205C43]"
                  />
                  <span className="text-[10px] text-[#69736D]">
                    Client requested: {activeRequest.preferred_date || "Flexible date"}
                  </span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase text-[#202824]">
                  Chamber Notes / Message to Client
                </label>
                <textarea
                  required
                  rows={4}
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full p-3 rounded-xl border border-[#D5E5D9] text-xs text-[#202824] focus:outline-none focus:border-[#205C43] leading-relaxed"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#D5E5D9]">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#69736D] hover:bg-[#F2F7F4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded-xl text-white text-xs font-semibold flex items-center gap-2 shadow-xs disabled:opacity-50 ${
                    actionType === "accepted"
                      ? "bg-[#174530] hover:bg-[#0E2C1E]"
                      : "bg-red-800 hover:bg-red-900"
                  }`}
                >
                  {isSubmitting ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>
                        {actionType === "accepted" ? "Confirm Acceptance" : "Confirm Decline"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full AI Preconsultation Brief Viewing Modal for Advocate */}
      {viewingBriefReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl border border-[#D5E5D9] shadow-2xl flex flex-col overflow-hidden text-[#202824]"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="px-6 py-4 bg-[#F8FAF9] border-b border-[#D5E5D9] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EAF3ED] text-[#205C43] flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#202824]">
                    AI Preconsultation Brief — {viewingBriefReq.client?.full_name || "Client"}
                  </h3>
                  <p className="text-[11px] text-[#69736D]">
                    Confidential Client Summary • Shared with Bar Council Privileged Fiduciary
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingBriefReq(null)}
                className="p-1 rounded-lg text-[#69736D] hover:bg-[#EAF3ED] hover:text-[#202824]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Advocate Verification Notice Banner */}
            <div className="px-6 py-3 bg-[#FFFDF7] border-b border-[#E8DCC0] flex items-start gap-2.5 text-xs text-[#7A5E1A]">
              <ShieldCheck className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Advocate Advisory:</strong> This brief is synthesized from AI preconsultation based on client-provided statements and automated statutory mapping. Facts and inferences must be independently verified by chambers prior to court pleadings or legal advice.
              </p>
            </div>

            {/* Brief Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] text-xs text-[#202824] leading-relaxed whitespace-pre-wrap font-sans">
                {viewingBriefReq.message}
              </div>
            </div>

            {/* Footer with Actions */}
            <div className="px-6 py-3 bg-[#F8FAF9] border-t border-[#D5E5D9] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setViewingBriefReq(null)}
                className="px-4 py-2 rounded-xl border border-[#D5E5D9] text-[#69736D] hover:bg-white text-xs font-medium cursor-pointer"
              >
                Close
              </button>

              {viewingBriefReq.status === "pending" && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const req = viewingBriefReq;
                      setViewingBriefReq(null);
                      handleOpenActionModal(req, "declined");
                    }}
                    className="px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-800 text-xs font-semibold cursor-pointer"
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const req = viewingBriefReq;
                      setViewingBriefReq(null);
                      handleOpenActionModal(req, "accepted");
                    }}
                    className="px-4 py-1.5 rounded-xl bg-[#174530] hover:bg-[#0E2C1E] text-white text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    Accept & Schedule
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
