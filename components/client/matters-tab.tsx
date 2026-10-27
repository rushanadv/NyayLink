"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LegalMatter } from "@/lib/portal/types";
import { createLegalMatter } from "@/app/actions/portal";
import { ECourtsCaseLookupPanel } from "@/components/court/ecourts-case-lookup-panel";
import {
  Briefcase,
  Plus,
  AlertCircle,
  Send,
  X,
  UserCheck,
  FileText,
} from "lucide-react";

interface MattersTabProps {
  matters: LegalMatter[];
  isNewMatterModalOpen: boolean;
  onCloseNewMatterModal: () => void;
  onOpenNewMatterModal: () => void;
}

const CATEGORIES = [
  "Commercial Contract Dispute",
  "Consumer Grievance (NCDRC)",
  "Real Estate & RERA Appeal",
  "Employment & Workplace Grievance",
  "Technology, IP & Data Protection",
  "Criminal Defense & Bail",
  "Family & Matrimonial Dispute",
  "General Civil Litigation",
];

export function MattersTab({
  matters,
  isNewMatterModalOpen,
  onCloseNewMatterModal,
  onOpenNewMatterModal,
}: MattersTabProps) {
  const [selectedMatterId, setSelectedMatterId] = useState<string | null>(
    matters[0]?.id || null
  );
  const router = useRouter();

  // New Matter Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedMatter = matters.find((m) => m.id === selectedMatterId) || matters[0];

  const handleCreateMatter = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await createLegalMatter({
        title,
        category,
        description,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to create matter");
      }

      // Reset form and close modal
      setTitle("");
      setDescription("");
      onCloseNewMatterModal();
      if (res.matter) {
        setSelectedMatterId(res.matter.id);
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "intake":
        return {
          label: "Intake Assessment",
          bg: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "review":
        return {
          label: "Under Review",
          bg: "bg-amber-50 text-amber-800 border-amber-200",
        };
      case "assigned":
        return {
          label: "Lawyer Assigned",
          bg: "bg-purple-50 text-purple-700 border-purple-200",
        };
      case "in_progress":
        return {
          label: "In Progress",
          bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
        };
      case "resolved":
        return {
          label: "Resolved",
          bg: "bg-teal-50 text-teal-800 border-teal-200",
        };
      case "closed":
        return {
          label: "Archived",
          bg: "bg-gray-50 text-gray-700 border-gray-200",
        };
      default:
        return {
          label: status,
          bg: "bg-[#EAF3ED] text-[#205C43] border-[#D5E5D9]",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D5E5D9]">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-semibold text-[#202824]">
            My Legal Matters
          </h1>
          <p className="text-xs text-[#69736D] mt-1">
            Track active dockets, counsel assignments, and chronological updates.
          </p>
        </div>
        <button
          onClick={onOpenNewMatterModal}
          className="px-4 py-2 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Register New Matter</span>
        </button>
      </div>

      {matters.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white border border-[#D5E5D9] text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF3ED] text-[#205C43] flex items-center justify-center mx-auto">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-serif font-semibold text-[#202824]">
              No Legal Matters on Record
            </h3>
            <p className="text-xs text-[#69736D] leading-relaxed">
              When you submit a legal problem or complete an intake evaluation, your case docket will appear here with encrypted timeline tracking.
            </p>
          </div>
          <button
            onClick={onOpenNewMatterModal}
            className="px-4 py-2.5 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white text-xs font-semibold transition-all shadow-xs inline-flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Your First Matter</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Matter List Column (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#69736D]">
              Active Dockets ({matters.length})
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
                        ? "bg-[#F4FAF6] border-[#205C43] shadow-xs ring-1 ring-[#205C43]/20"
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
                      <span>
                        Filed {new Date(m.created_at).toLocaleDateString()}
                      </span>
                      {m.is_demo && (
                        <span className="text-[10px] font-mono text-[#205C43] bg-[#EAF3ED] px-1.5 py-0.5 rounded">
                          DEMO
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
                      Docket #{selectedMatter.id.slice(0, 8)}
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
                    <span>Created: {new Date(selectedMatter.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Case Brief Content */}
                <div className="space-y-2">
                  <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#69736D]">
                    Matter Description & Instructions
                  </h3>
                  <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] text-xs text-[#202824] leading-relaxed whitespace-pre-wrap">
                    {selectedMatter.description}
                  </div>
                </div>

                {/* Counsel Assignment Box */}
                <div className="p-4 rounded-xl bg-[#EAF3ED]/60 border border-[#D5E5D9] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-[#D5E5D9] flex items-center justify-center text-[#205C43]">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-mono text-[#69736D] uppercase font-semibold">
                        Designated Counsel
                      </span>
                      <p className="text-xs font-semibold text-[#202824]">
                        {selectedMatter.assigned_lawyer_id
                          ? "Assigned Advocate (Verified Chambers)"
                          : "Awaiting Advocate Chamber Assignment"}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-[#205C43] px-2 py-0.5 rounded bg-white border border-[#D5E5D9]">
                    {selectedMatter.assigned_lawyer_id ? "Retained" : "Open Docket"}
                  </span>
                </div>

                {/* Next Step Guidance Helper */}
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-amber-950">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Next Action for Client</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800">
                    {selectedMatter.status === "intake"
                      ? "Review the generated brief. Schedule an advocate conference to initiate formal notice proceedings."
                      : selectedMatter.status === "review"
                      ? "Your advocate is analyzing the documentation and jurisdictional grounds."
                      : selectedMatter.status === "in_progress"
                      ? "Hearing dockets or draft filings are active. Check milestone updates below."
                      : "Matter is currently in good standing."}
                  </p>
                </div>

                {/* Matter Documents & Preconsultation Briefs */}
                <div className="space-y-3 p-4 rounded-xl bg-white border border-[#D5E5D9]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#69736D] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#205C43]" />
                      <span>Matter Records & Preconsultation Briefs</span>
                    </h3>
                    <span className="text-[10px] font-mono text-[#205C43] bg-[#EAF3ED] px-2 py-0.5 rounded border border-[#205C43]/20">
                      Privileged
                    </span>
                  </div>

                  <div className="space-y-2">
                    {selectedMatter.updates?.filter((u) => u.update_type === "document").length ? (
                      selectedMatter.updates
                        .filter((u) => u.update_type === "document")
                        .map((doc) => (
                          <div
                            key={doc.id}
                            className="p-3 rounded-lg bg-[#F8FAF9] border border-[#D5E5D9] flex items-start justify-between gap-3 text-xs"
                          >
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono font-semibold text-[#205C43] uppercase bg-[#EAF3ED] px-2 py-0.5 rounded">
                                AI Preconsultation Brief (Client Record)
                              </span>
                              <p className="text-[#202824] leading-relaxed">{doc.content}</p>
                              <span className="text-[10px] text-[#69736D] block">
                                Stored on {new Date(doc.created_at).toLocaleString()} • Confidential client record (Not a formal court pleading)
                              </span>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="p-3 rounded-lg bg-[#F8FAF9] border border-[#D5E5D9] text-xs text-[#69736D] flex items-center justify-between">
                        <span>No AI preconsultation brief linked to this docket yet.</span>
                        <a
                          href="/intake"
                          className="font-semibold text-[#205C43] hover:underline"
                        >
                          Launch AI Preconsultation &rarr;
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Official eCourts & Case Lookup Panel */}
                <ECourtsCaseLookupPanel
                  matter={selectedMatter}
                  userRole="client"
                  onUpdated={() => router.refresh()}
                />

                {/* Chronological Timeline */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#69736D]">
                    Matter Chronology & Updates
                  </h3>
                  {selectedMatter.updates && selectedMatter.updates.length > 0 ? (
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#D5E5D9]">
                      {selectedMatter.updates.map((update) => (
                        <div key={update.id} className="relative group">
                          <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#205C43] ring-4 ring-white" />
                          <div className="p-3 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] text-xs space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-mono text-[#69736D]">
                              <span className="uppercase font-semibold text-[#205C43]">
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
                      No subsequent notes recorded yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* New Matter Modal */}
      {isNewMatterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-[#D5E5D9] shadow-xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#D5E5D9]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EAF3ED] text-[#205C43] flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-semibold text-[#202824]">
                    Register Legal Matter
                  </h3>
                  <p className="text-[11px] text-[#69736D]">
                    Initiate a structured legal proceeding in your client vault
                  </p>
                </div>
              </div>
              <button
                onClick={onCloseNewMatterModal}
                className="text-[#69736D] hover:text-[#202824] transition-colors p-1 rounded-lg hover:bg-[#F2F7F4]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateMatter} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase text-[#202824]">
                  Matter Title / Subject
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Breach of Commercial Lease Agreement"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-10 px-3.5 rounded-xl border border-[#D5E5D9] text-xs text-[#202824] focus:outline-none focus:border-[#205C43] focus:ring-2 focus:ring-[#205C43]/15"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase text-[#202824]">
                  Legal Practice Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-10 px-3 rounded-xl border border-[#D5E5D9] text-xs text-[#202824] focus:outline-none focus:border-[#205C43] focus:ring-2 focus:ring-[#205C43]/15 bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase text-[#202824]">
                  Detailed Facts & Objectives
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Outline parties involved, key dates, monetary value, notice exchange, and legal remedy sought..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full p-3 rounded-xl border border-[#D5E5D9] text-xs text-[#202824] focus:outline-none focus:border-[#205C43] focus:ring-2 focus:ring-[#205C43]/15 leading-relaxed"
                />
                <span className="text-[10px] text-[#69736D]">
                  Minimum 10 characters. Encrypted under NyayLink secure client privacy policies.
                </span>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#D5E5D9]">
                <button
                  type="button"
                  onClick={onCloseNewMatterModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#69736D] hover:bg-[#F2F7F4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white text-xs font-semibold flex items-center gap-2 shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Registering Matter...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Create Docket</span>
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
