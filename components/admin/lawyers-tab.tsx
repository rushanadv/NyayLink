"use client";

import { useState, useMemo } from "react";
import { Search, X, Shield, Lock, ArrowRight } from "lucide-react";
import type { LawyerProfileRecord } from "@/lib/admin/types";

interface LawyersTabProps {
  initialLawyers: LawyerProfileRecord[];
}

export function LawyersTab({ initialLawyers }: LawyersTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedLawyer, setSelectedLawyer] = useState<LawyerProfileRecord | null>(null);

  const filteredLawyers = useMemo(() => {
    return initialLawyers.filter((lawyer) => {
      const status = lawyer.verification?.status || "pending";
      const matchesStatus = selectedStatus === "all" || status === selectedStatus;

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        lawyer.professional_name.toLowerCase().includes(q) ||
        lawyer.bar_council_number.toLowerCase().includes(q) ||
        lawyer.city.toLowerCase().includes(q) ||
        lawyer.state.toLowerCase().includes(q) ||
        lawyer.practice_areas.some((pa) => pa.toLowerCase().includes(q));

      return matchesStatus && matchesQuery;
    });
  }, [initialLawyers, selectedStatus, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Read-Only Status Notice */}
      <div className="border border-white/[0.06] bg-[#111119] rounded-xl px-5 py-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <Lock className="w-3.5 h-3.5 text-[#A99AFF]" strokeWidth={1.5} />
          <span className="text-[#A5A3B2]">
            Advocate verification queue is currently operating in <strong className="text-[#F5F4FA] font-medium">read-only administrative view</strong>. Mutation transitions require operational clearance.
          </span>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#A99AFF] px-2 py-0.5 rounded bg-[#A99AFF]/10 border border-[#A99AFF]/20 shrink-0 ml-4">
          Read-Only Access
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="border border-white/[0.06] bg-[#111119] rounded-xl p-3 sm:p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {[
            { id: "all", label: "All Records" },
            { id: "pending", label: "Pending Review" },
            { id: "approved", label: "Approved" },
            { id: "changes_requested", label: "Changes Requested" },
            { id: "rejected", label: "Rejected" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans transition-all ${
                selectedStatus === tab.id
                  ? "bg-[#A99AFF]/15 text-[#F5F4FA] font-medium border border-[#A99AFF]/30 shadow-[0_0_12px_rgba(169,154,255,0.1)]"
                  : "text-[#A5A3B2] hover:text-[#F5F4FA] hover:bg-white/[0.03] border border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-[#6F6E7D] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, Bar ID, jurisdiction..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#09090F] border border-white/[0.08] focus:border-[#A99AFF]/50 rounded-lg text-xs text-[#F5F4FA] placeholder:text-[#6F6E7D] focus:outline-none transition-colors font-sans"
          />
        </div>
      </div>

      {/* Data Table */}
      {filteredLawyers.length === 0 ? (
        <div className="border border-white/[0.06] bg-[#111119] rounded-xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#6F6E7D] mb-3">
            <Search className="w-4 h-4" />
          </div>
          <h3 className="text-base font-semibold text-[#F5F4FA] mb-1">
            No advocate records match this filter
          </h3>
          <p className="text-xs text-[#A5A3B2] max-w-sm">
            {initialLawyers.length === 0
              ? "The advocate directory is currently empty. As practitioners register and submit Bar credentials, they will be cataloged here."
              : "Try refining your search keyword or selecting a different status filter."}
          </p>
        </div>
      ) : (
        <div className="border border-white/[0.06] bg-[#111119] rounded-xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#F5F4FA]">
              <thead className="border-b border-white/[0.06] bg-[#0E0E17] text-[11px] font-mono tracking-wider uppercase text-[#6F6E7D]">
                <tr>
                  <th className="px-6 py-3.5 font-medium">Advocate Name</th>
                  <th className="px-6 py-3.5 font-medium">Bar Registration</th>
                  <th className="px-6 py-3.5 font-medium">Jurisdiction</th>
                  <th className="px-6 py-3.5 font-medium">Experience</th>
                  <th className="px-6 py-3.5 font-medium">Practice Areas</th>
                  <th className="px-6 py-3.5 font-medium">Verification Status</th>
                  <th className="px-6 py-3.5 font-medium">Directory</th>
                  <th className="px-6 py-3.5 font-medium text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredLawyers.map((lawyer) => {
                  const status = lawyer.verification?.status || "pending";
                  return (
                    <tr
                      key={lawyer.id}
                      onClick={() => setSelectedLawyer(lawyer)}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-[#F5F4FA] group-hover:text-[#A99AFF] transition-colors">
                          {lawyer.professional_name}
                        </div>
                        <div className="text-[10px] font-mono text-[#6F6E7D] mt-0.5" title={lawyer.id}>
                          UUID: {lawyer.id.slice(0, 8)}...
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono text-xs">
                        <span className="text-[#F5F4FA] font-medium">
                          {lawyer.bar_council_number}
                        </span>
                        <div className="text-[10px] text-[#6F6E7D] mt-0.5">
                          {lawyer.bar_council_state} ({lawyer.bar_council_enrollment_year})
                        </div>
                      </td>

                      <td className="px-6 py-4 text-[#A5A3B2]">
                        {lawyer.city}, {lawyer.state}
                      </td>

                      <td className="px-6 py-4 text-[#A5A3B2] font-mono">
                        {lawyer.experience_years} yrs
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {lawyer.practice_areas.slice(0, 2).map((pa) => (
                            <span
                              key={pa}
                              className="px-2 py-0.5 rounded text-[10px] bg-white/[0.04] text-[#A5A3B2] border border-white/[0.06]"
                            >
                              {pa}
                            </span>
                          ))}
                          {lawyer.practice_areas.length > 2 && (
                            <span className="text-[10px] text-[#6F6E7D] px-1 py-0.5 font-mono">
                              +{lawyer.practice_areas.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                            status === "approved"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : status === "pending"
                              ? "bg-[#A99AFF]/10 text-[#A99AFF] border border-[#A99AFF]/25"
                              : status === "changes_requested"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              status === "approved"
                                ? "bg-emerald-400"
                                : status === "pending"
                                ? "bg-[#A99AFF]"
                                : status === "changes_requested"
                                ? "bg-amber-400"
                                : "bg-rose-400"
                            }`}
                          />
                          {status.replace("_", " ")}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-mono text-[11px]">
                        <span
                          className={
                            lawyer.is_published
                              ? "text-emerald-400"
                              : "text-[#6F6E7D]"
                          }
                        >
                          {lawyer.is_published ? "Published" : "Private"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLawyer(lawyer);
                          }}
                          className="px-3 py-1 rounded-lg bg-white/[0.04] hover:bg-[#A99AFF]/15 text-xs font-mono text-[#F5F4FA] hover:text-[#A99AFF] border border-white/[0.08] hover:border-[#A99AFF]/30 transition-colors inline-flex items-center gap-1"
                        >
                          <span>Dossier</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-over Inspection Drawer */}
      {selectedLawyer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-[#09090F] border-l border-white/[0.08] h-full overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between pb-6 border-b border-white/[0.06]">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#A99AFF] px-2 py-0.5 rounded bg-[#A99AFF]/10 border border-[#A99AFF]/20 inline-block mb-2">
                  Advocate Dossier
                </span>
                <h2 className="text-2xl font-semibold tracking-tight text-[#F5F4FA]">
                  {selectedLawyer.professional_name}
                </h2>
                <div className="text-xs font-mono text-[#6F6E7D] mt-1">
                  UUID: {selectedLawyer.id}
                </div>
              </div>
              <button
                onClick={() => setSelectedLawyer(null)}
                className="w-8 h-8 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.08] text-[#A5A3B2] hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Verification Status Card */}
            <div className="border border-white/[0.06] bg-[#111119] rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#A5A3B2]">
                  Verification Lifecycle
                </span>
                <span className="text-xs font-mono uppercase tracking-wider text-[#A99AFF] px-2.5 py-0.5 rounded-full bg-[#A99AFF]/10 border border-[#A99AFF]/20">
                  {selectedLawyer.verification?.status || "pending"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/[0.04] text-xs font-mono">
                <div>
                  <span className="text-[10px] text-[#6F6E7D] block uppercase">Reviewer</span>
                  <span className="text-[#F5F4FA]">
                    {selectedLawyer.verification?.reviewed_by
                      ? `${selectedLawyer.verification.reviewed_by.slice(0, 12)}...`
                      : "Unassigned"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6F6E7D] block uppercase">Review Timestamp</span>
                  <span suppressHydrationWarning className="text-[#F5F4FA]">
                    {selectedLawyer.verification?.reviewed_at
                      ? new Date(selectedLawyer.verification.reviewed_at).toLocaleDateString()
                      : "Pending review"}
                  </span>
                </div>
              </div>
            </div>

            {/* Bar Council Credentials */}
            <div className="border border-white/[0.06] bg-[#111119] rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#A99AFF]">
                <Shield className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Bar Council Enrollment Verification</span>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-[#6F6E7D] block uppercase">Registration</span>
                  <span className="text-[#F5F4FA] font-bold block mt-1">
                    {selectedLawyer.bar_council_number}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6F6E7D] block uppercase">State Council</span>
                  <span className="text-[#F5F4FA] block mt-1 font-sans">
                    {selectedLawyer.bar_council_state}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6F6E7D] block uppercase">Enrollment Year</span>
                  <span className="text-[#F5F4FA] block mt-1 font-sans">
                    {selectedLawyer.bar_council_enrollment_year}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-mono tracking-wider uppercase text-[#6F6E7D] block mb-1.5">
                  Professional Biography
                </span>
                <p className="border border-white/[0.06] bg-[#111119] p-4 rounded-xl text-[#F5F4FA] leading-relaxed">
                  {selectedLawyer.bio || "No professional biography provided."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-mono tracking-wider uppercase text-[#6F6E7D] block mb-1.5">
                    Practice Areas
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLawyer.practice_areas.map((pa) => (
                      <span
                        key={pa}
                        className="px-2 py-0.5 rounded-md bg-white/[0.04] text-[#F5F4FA] border border-white/[0.06] text-[11px]"
                      >
                        {pa}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono tracking-wider uppercase text-[#6F6E7D] block mb-1.5">
                    Languages
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLawyer.languages.map((lang) => (
                      <span
                        key={lang}
                        className="px-2 py-0.5 rounded-md bg-white/[0.04] text-[#F5F4FA] border border-white/[0.06] text-[11px]"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Confidential Internal Notes */}
            <div className="border border-[#A99AFF]/25 bg-[#141322] rounded-xl p-5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#A99AFF]">
                  Internal Admin Notes (Confidential)
                </span>
                <span className="font-mono text-[10px] text-[#6F6E7D]">
                  via admin_lawyer_verifications
                </span>
              </div>
              <p className="text-xs text-[#F5F4FA] font-mono p-3 rounded-lg bg-[#09090F] border border-white/[0.06] whitespace-pre-wrap">
                {selectedLawyer.verification?.internal_notes || "No internal notes recorded."}
              </p>
            </div>

            {/* Lawyer-Visible Feedback */}
            <div className="border border-white/[0.06] bg-[#111119] rounded-xl p-5 space-y-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#A5A3B2] block">
                Lawyer-Facing Feedback
              </span>
              <p className="text-xs text-[#A5A3B2] p-3 rounded-lg bg-[#09090F] border border-white/[0.06] whitespace-pre-wrap">
                {selectedLawyer.verification?.lawyer_feedback || "No feedback issued to lawyer."}
              </p>
            </div>

            {/* Publication Consent Audit */}
            <div className="border border-white/[0.06] bg-[#111119] rounded-xl p-4 text-xs font-mono space-y-1.5 text-[#A5A3B2]">
              <span className="text-[10px] uppercase tracking-wider text-[#6F6E7D] block mb-1">
                Publication Consent Audit Trail
              </span>
              <div className="flex justify-between">
                <span>Public Listing:</span>
                <span className={selectedLawyer.is_published ? "text-emerald-400" : "text-[#6F6E7D]"}>
                  {selectedLawyer.is_published ? "Consented & Visible" : "Unpublished / Private"}
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>Consent Date:</span>
                <span>{selectedLawyer.published_at ? new Date(selectedLawyer.published_at).toLocaleString() : "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
