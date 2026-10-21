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
          {filtered.map((req) => (
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

                <div className="flex items-center gap-2">
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

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-[#202824]">
                  {req.subject}
                </h3>
                <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] text-xs text-[#202824] leading-relaxed whitespace-pre-wrap">
                  {req.message}
                </div>
              </div>

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
          ))}
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
    </div>
  );
}
