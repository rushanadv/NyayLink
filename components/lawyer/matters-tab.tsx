"use client";

import { useState } from "react";
import { LegalMatter } from "@/lib/portal/types";
import { addMatterTimelineUpdate } from "@/app/actions/portal";
import {
  Briefcase,
  CheckCircle2,
  Send,
} from "lucide-react";

interface MattersTabProps {
  matters: LegalMatter[];
}

export function MattersTab({ matters }: MattersTabProps) {
  const [selectedMatterId, setSelectedMatterId] = useState<string | null>(
    matters[0]?.id || null
  );

  // Update Note State
  const [noteContent, setNoteContent] = useState("");
  const [updateType, setUpdateType] = useState<"note" | "status_change" | "milestone">("note");
  const [newStatus, setNewStatus] = useState<string>("");
  const [isPostingNote, setIsPostingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [noteSuccess, setNoteSuccess] = useState(false);

  const selectedMatter =
    matters.find((m) => m.id === selectedMatterId) || matters[0];

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatter) return;

    setNoteError(null);
    setIsPostingNote(true);
    setNoteSuccess(false);

    try {
      const res = await addMatterTimelineUpdate({
        matterId: selectedMatter.id,
        content: noteContent,
        updateType,
        newStatus: newStatus || undefined,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to post timeline update");
      }

      setNoteContent("");
      setNewStatus("");
      setNoteSuccess(true);
      setTimeout(() => setNoteSuccess(false), 2500);
    } catch (err: unknown) {
      setNoteError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setIsPostingNote(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "intake":
        return { label: "Intake", bg: "bg-blue-50 text-blue-700 border-blue-200" };
      case "review":
        return { label: "Under Review", bg: "bg-amber-50 text-amber-800 border-amber-200" };
      case "assigned":
        return { label: "Retained", bg: "bg-purple-50 text-purple-700 border-purple-200" };
      case "in_progress":
        return { label: "In Progress", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" };
      case "resolved":
        return { label: "Resolved", bg: "bg-teal-50 text-teal-800 border-teal-200" };
      case "closed":
        return { label: "Archived", bg: "bg-gray-50 text-gray-700 border-gray-200" };
      default:
        return { label: status, bg: "bg-[#EAF3ED] text-[#205C43] border-[#D5E5D9]" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#D5E5D9]">
        <h1 className="text-xl sm:text-2xl font-serif font-semibold text-[#202824]">
          Assigned Legal Dockets
        </h1>
        <p className="text-xs text-[#69736D] mt-1">
          Review client case briefs, update procedural statuses, and log chronological litigation milestones.
        </p>
      </div>

      {matters.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white border border-[#D5E5D9] text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF3ED] text-[#174530] flex items-center justify-center mx-auto">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-serif font-semibold text-[#202824]">
              No Legal Dockets Assigned Yet
            </h3>
            <p className="text-xs text-[#69736D] leading-relaxed">
              When clients select your chambers or when an accepted consultation converts into active legal representation, the matter docket will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Matter List (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#69736D]">
              Chamber Dockets ({matters.length})
            </span>
            <div className="space-y-2.5">
              {matters.map((m) => {
                const badge = getStatusBadge(m.status);
                const isSelected = selectedMatter?.id === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMatterId(m.id)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#F4FAF6] border-[#174530] shadow-xs ring-1 ring-[#174530]/20"
                        : "bg-white border-[#D5E5D9] hover:border-[#205C43]/50 hover:bg-[#FBFDFB]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[11px] font-mono font-medium text-[#69736D] uppercase">
                        {m.category}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-medium uppercase ${badge.bg}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-[#202824] line-clamp-1">
                      {m.title}
                    </h3>
                    <p className="text-xs text-[#69736D] line-clamp-2 mt-1">
                      {m.description}
                    </p>
                    <div className="mt-3 pt-2.5 border-t border-[#D5E5D9]/60 flex items-center justify-between text-[11px] text-[#69736D]">
                      <span>Filed: {new Date(m.created_at).toLocaleDateString()}</span>
                      {m.is_demo && (
                        <span className="text-[10px] font-mono text-[#205C43] bg-[#EAF3ED] px-1.5 py-0.5 rounded">
                          DEMO DOCKET
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Matter Detail Inspector (7 cols) */}
          {selectedMatter && (
            <div className="lg:col-span-7 space-y-5">
              <div className="p-6 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-6">
                {/* Detail Header */}
                <div className="flex flex-col gap-2 pb-5 border-b border-[#D5E5D9]">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#69736D]">
                      Chamber Docket #{selectedMatter.id.slice(0, 8)}
                    </span>
                    <span
                      className={`text-xs font-mono px-2.5 py-0.5 rounded-full border font-medium uppercase ${
                        getStatusBadge(selectedMatter.status).bg
                      }`}
                    >
                      {getStatusBadge(selectedMatter.status).label}
                    </span>
                  </div>
                  <h2 className="text-xl font-serif font-semibold text-[#202824]">
                    {selectedMatter.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#69736D]">
                    <span>Category: <strong className="text-[#202824]">{selectedMatter.category}</strong></span>
                    <span>•</span>
                    <span>Client: <strong className="text-[#202824]">#{selectedMatter.client_id.slice(0, 8)}</strong></span>
                  </div>
                </div>

                {/* Case Brief Content */}
                <div className="space-y-2">
                  <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#69736D]">
                    Client Brief & Case History
                  </h3>
                  <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] text-xs text-[#202824] leading-relaxed whitespace-pre-wrap">
                    {selectedMatter.description}
                  </div>
                </div>

                {/* Post Update Form */}
                <div className="p-5 rounded-2xl bg-[#EAF3ED]/60 border border-[#D5E5D9] space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#174530]">
                      Add Chamber Case Note or Update Status
                    </h3>
                    <span className="text-[10px] font-mono text-[#69736D]">
                      Visible to retained client
                    </span>
                  </div>

                  {noteSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Case note added to chronological timeline.</span>
                    </div>
                  )}

                  {noteError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
                      {noteError}
                    </div>
                  )}

                  <form onSubmit={handlePostUpdate} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-mono font-semibold uppercase text-[#202824]">
                          Update Type
                        </label>
                        <select
                          value={updateType}
                          onChange={(e) =>
                            setUpdateType(e.target.value as "note" | "status_change" | "milestone")
                          }
                          disabled={isPostingNote}
                          className="w-full h-9 px-3 rounded-xl border border-[#D5E5D9] text-xs bg-white focus:outline-none focus:border-[#205C43]"
                        >
                          <option value="note">Counsel Note</option>
                          <option value="milestone">Litigation Milestone</option>
                          <option value="status_change">Docket Status Change</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-mono font-semibold uppercase text-[#202824]">
                          Change Status (Optional)
                        </label>
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          disabled={isPostingNote}
                          className="w-full h-9 px-3 rounded-xl border border-[#D5E5D9] text-xs bg-white focus:outline-none focus:border-[#205C43]"
                        >
                          <option value="">Keep Current Status ({selectedMatter.status})</option>
                          <option value="review">Set to Review</option>
                          <option value="in_progress">Set to In Progress</option>
                          <option value="resolved">Set to Resolved</option>
                          <option value="closed">Set to Closed</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <textarea
                        required
                        rows={3}
                        placeholder="Log proceedings, filing acknowledgements, or instructions for client..."
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        disabled={isPostingNote}
                        className="w-full p-3 rounded-xl border border-[#D5E5D9] text-xs text-[#202824] bg-white focus:outline-none focus:border-[#205C43] leading-relaxed"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isPostingNote}
                      className="px-4 py-2 rounded-xl bg-[#174530] hover:bg-[#0E2C1E] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isPostingNote ? "Posting..." : "Record Case Update"}</span>
                    </button>
                  </form>
                </div>

                {/* Chronological Timeline */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#69736D]">
                    Matter Event History
                  </h3>
                  {selectedMatter.updates && selectedMatter.updates.length > 0 ? (
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#D5E5D9]">
                      {selectedMatter.updates.map((update) => (
                        <div key={update.id} className="relative group">
                          <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#174530] ring-4 ring-white" />
                          <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] text-xs space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-mono text-[#69736D]">
                              <span className="uppercase font-semibold text-[#174530]">
                                {update.update_type.replace("_", " ")}
                              </span>
                              <span>
                                {new Date(update.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-[#202824] leading-relaxed">
                              {update.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#69736D] italic">
                      No case updates logged on this docket yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
