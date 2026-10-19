"use client";

import { useState, useMemo } from "react";
import { Search, X, Shield, Lock } from "lucide-react";
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
      <div className="border border-white/[0.07] bg-[#141614] rounded-lg px-5 py-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <Lock className="w-3.5 h-3.5 text-[#B8A078]" strokeWidth={1.5} />
          <span className="text-[#92958E]">
            Verification review actions are currently <strong className="text-[#EEECE5] font-medium">read-only</strong>. State mutations (Approve, Reject, Request Changes) will be enabled after administrative workflow sign-off.
          </span>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#B8A078] shrink-0 ml-4">
          Read-Only Mode
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="border border-white/[0.07] bg-[#141614] rounded-lg p-3 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-1 w-full md:w-auto">
          {[
            { id: "all", label: "All Records" },
            { id: "pending", label: "Pending" },
            { id: "approved", label: "Approved" },
            { id: "changes_requested", label: "Changes Requested" },
            { id: "rejected", label: "Rejected" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded text-xs font-sans transition-all ${
                selectedStatus === tab.id
                  ? "bg-white/[0.08] text-[#EEECE5] font-medium border border-white/[0.12]"
                  : "text-[#92958E] hover:text-[#EEECE5] hover:bg-white/[0.03] border border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Minimal Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-[#92958E]/60 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, bar registration, city..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#0C0D0C] border border-white/[0.08] focus:border-[#B8A078]/50 rounded text-xs text-[#EEECE5] placeholder:text-[#92958E]/50 focus:outline-none transition-colors font-sans"
          />
        </div>
      </div>

      {/* Data Table */}
      {filteredLawyers.length === 0 ? (
        <div className="border border-white/[0.07] bg-[#141614] rounded-lg p-12 text-center flex flex-col items-center justify-center">
          <h3 className="text-base font-serif text-[#EEECE5] mb-1">
            No advocate records match this filter
          </h3>
          <p className="text-xs text-[#92958E] max-w-sm">
            {initialLawyers.length === 0
              ? "The advocate directory is currently empty. As practitioners register and submit Bar credentials, they will be cataloged here."
              : "Try refining your search keyword or selecting a different status filter."}
          </p>
        </div>
      ) : (
        <div className="border border-white/[0.07] bg-[#141614] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#EEECE5]">
              <thead className="border-b border-white/[0.07] bg-[#0E100E] text-[10px] font-mono tracking-wider uppercase text-[#92958E]">
                <tr>
                  <th className="px-6 py-3 font-medium">Advocate Name</th>
                  <th className="px-6 py-3 font-medium">Bar Registration</th>
                  <th className="px-6 py-3 font-medium">Jurisdiction</th>
                  <th className="px-6 py-3 font-medium">Experience</th>
                  <th className="px-6 py-3 font-medium">Practice Areas</th>
                  <th className="px-6 py-3 font-medium">Verification</th>
                  <th className="px-6 py-3 font-medium">Directory</th>
                  <th className="px-6 py-3 font-medium text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {filteredLawyers.map((lawyer) => {
                  const status = lawyer.verification?.status || "pending";
                  return (
                    <tr
                      key={lawyer.id}
                      onClick={() => setSelectedLawyer(lawyer)}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-[#EEECE5] group-hover:text-[#B8A078] transition-colors">
                          {lawyer.professional_name}
                        </div>
                        <div className="text-[10px] font-mono text-[#92958E]/60 mt-0.5" title={lawyer.id}>
                          UUID: {lawyer.id.slice(0, 8)}...
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono text-xs">
                        <span className="text-[#EEECE5]">
                          {lawyer.bar_council_number}
                        </span>
                        <div className="text-[10px] text-[#92958E]/60 mt-0.5">
                          {lawyer.bar_council_state} ({lawyer.bar_council_enrollment_year})
                        </div>
                      </td>

                      <td className="px-6 py-4 text-[#92958E]">
                        {lawyer.city}, {lawyer.state}
                      </td>

                      <td className="px-6 py-4 text-[#92958E] font-mono">
                        {lawyer.experience_years} yrs
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {lawyer.practice_areas.slice(0, 2).map((pa) => (
                            <span
                              key={pa}
                              className="px-1.5 py-0.5 rounded text-[10px] bg-white/[0.04] text-[#92958E] border border-white/[0.06]"
                            >
                              {pa}
                            </span>
                          ))}
                          {lawyer.practice_areas.length > 2 && (
                            <span className="text-[10px] text-[#92958E]/60 px-1 py-0.5">
                              +{lawyer.practice_areas.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${
                            status === "approved"
                              ? "bg-emerald-950/40 text-emerald-300 border border-emerald-800/40"
                              : status === "pending"
                              ? "bg-[#B8A078]/10 text-[#B8A078] border border-[#B8A078]/25"
                              : status === "changes_requested"
                              ? "bg-sky-950/40 text-sky-300 border border-sky-800/40"
                              : "bg-red-950/40 text-red-300 border border-red-800/40"
                          }`}
                        >
                          <span
                            className={`w-1 h-1 rounded-full ${
                              status === "approved"
                                ? "bg-emerald-400"
                                : status === "pending"
                                ? "bg-[#B8A078]"
                                : status === "changes_requested"
                                ? "bg-sky-400"
                                : "bg-red-400"
                            }`}
                          />
                          {status.replace("_", " ")}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-mono text-[11px]">
                        <span
                          className={
                            lawyer.is_published
                              ? "text-[#B8A078]"
                              : "text-[#92958E]/60"
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
                          className="px-2.5 py-1 rounded bg-white/[0.03] hover:bg-white/[0.08] text-xs font-mono text-[#EEECE5] border border-white/[0.08] transition-colors"
                        >
                          Inspect →
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-[#0C0D0C] border-l border-white/[0.08] h-full overflow-y-auto p-8 space-y-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between pb-6 border-b border-white/[0.07]">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#B8A078] block mb-1">
                  Advocate Dossier
                </span>
                <h2 className="text-2xl font-serif text-[#EEECE5]">
                  {selectedLawyer.professional_name}
                </h2>
                <div className="text-xs font-mono text-[#92958E]/60 mt-1">
                  UUID: {selectedLawyer.id}
                </div>
              </div>
              <button
                onClick={() => setSelectedLawyer(null)}
                className="w-8 h-8 rounded border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-[#92958E] hover:text-[#EEECE5] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Verification Status */}
            <div className="border border-white/[0.07] bg-[#141614] rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans text-[#92958E]">
                  Verification Lifecycle
                </span>
                <span className="text-xs font-mono uppercase tracking-wider text-[#B8A078]">
                  {selectedLawyer.verification?.status || "pending"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/[0.05] text-xs font-mono">
                <div>
                  <span className="text-[10px] text-[#92958E]/60 block uppercase">Reviewer</span>
                  <span className="text-[#EEECE5]">
                    {selectedLawyer.verification?.reviewed_by
                      ? `${selectedLawyer.verification.reviewed_by.slice(0, 12)}...`
                      : "Unassigned"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#92958E]/60 block uppercase">Review Timestamp</span>
                  <span className="text-[#EEECE5]">
                    {selectedLawyer.verification?.reviewed_at
                      ? new Date(selectedLawyer.verification.reviewed_at).toLocaleDateString()
                      : "Pending review"}
                  </span>
                </div>
              </div>
            </div>

            {/* Bar Council Credentials */}
            <div className="border border-white/[0.07] bg-[#141614] rounded-lg p-5 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-sans text-[#B8A078]">
                <Shield className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Bar Council Enrollment Verification</span>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-[#92958E]/60 block uppercase">Registration</span>
                  <span className="text-[#EEECE5] font-bold block mt-1">
                    {selectedLawyer.bar_council_number}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#92958E]/60 block uppercase">State Council</span>
                  <span className="text-[#EEECE5] block mt-1 font-sans">
                    {selectedLawyer.bar_council_state}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#92958E]/60 block uppercase">Year</span>
                  <span className="text-[#EEECE5] block mt-1 font-sans">
                    {selectedLawyer.bar_council_enrollment_year}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-mono tracking-wider uppercase text-[#92958E]/60 block mb-1">
                  Professional Biography
                </span>
                <p className="border border-white/[0.07] bg-[#141614] p-4 rounded-lg text-[#EEECE5] leading-relaxed">
                  {selectedLawyer.bio || "No professional biography provided."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-mono tracking-wider uppercase text-[#92958E]/60 block mb-1">
                    Practice Areas
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedLawyer.practice_areas.map((pa) => (
                      <span
                        key={pa}
                        className="px-2 py-0.5 rounded bg-white/[0.04] text-[#EEECE5] border border-white/[0.06] text-[11px]"
                      >
                        {pa}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono tracking-wider uppercase text-[#92958E]/60 block mb-1">
                    Languages
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedLawyer.languages.map((lang) => (
                      <span
                        key={lang}
                        className="px-2 py-0.5 rounded bg-white/[0.04] text-[#EEECE5] border border-white/[0.06] text-[11px]"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Confidential Internal Notes */}
            <div className="border border-[#B8A078]/25 bg-[#141614] rounded-lg p-5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#B8A078]">
                  Internal Admin Notes (Confidential)
                </span>
                <span className="font-mono text-[10px] text-[#92958E]/60">
                  via admin_lawyer_verifications
                </span>
              </div>
              <p className="text-xs text-[#EEECE5] font-mono p-3 rounded bg-[#0C0D0C] border border-white/[0.06] whitespace-pre-wrap">
                {selectedLawyer.verification?.internal_notes || "No internal notes recorded."}
              </p>
            </div>

            {/* Lawyer-Visible Feedback */}
            <div className="border border-white/[0.07] bg-[#141614] rounded-lg p-5 space-y-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#92958E] block">
                Lawyer-Facing Feedback
              </span>
              <p className="text-xs text-[#92958E] p-3 rounded bg-[#0C0D0C] border border-white/[0.06] whitespace-pre-wrap">
                {selectedLawyer.verification?.lawyer_feedback || "No feedback issued to lawyer."}
              </p>
            </div>

            {/* Publication Consent Audit */}
            <div className="border border-white/[0.07] bg-[#141614] rounded-lg p-4 text-xs font-mono space-y-1.5 text-[#92958E]">
              <span className="text-[10px] uppercase tracking-wider text-[#92958E]/60 block mb-1">
                Publication Consent Audit Trail
              </span>
              <div className="flex justify-between">
                <span>Public Listing:</span>
                <span className={selectedLawyer.is_published ? "text-[#B8A078]" : "text-[#92958E]"}>
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
