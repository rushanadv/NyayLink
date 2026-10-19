"use client";

import { useState, useMemo } from "react";
import {
  Scale,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Shield,
  Eye,
  X,
  FileText,
  Lock,
  Globe,
  MapPin,
  GraduationCap,
} from "lucide-react";
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
      {/* Top Banner Notice: Read-only Notice */}
      <div className="bg-[#141926] border border-[#C5A059]/30 rounded-xl p-4 flex items-start gap-3">
        <Lock className="w-5 h-5 text-[#E5C07B] shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#E5C07B] mb-0.5 font-mono">
            Read-Only Review Mode Enforced
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Lawyer verification reviews are displayed in read-only mode during this phase. Approve, reject, and changes-requested mutations are reserved until administrative review workflow sign-off.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#11141D] border border-[#1F2536] rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {[
            { id: "all", label: "All Lawyers" },
            { id: "pending", label: "Pending Review" },
            { id: "approved", label: "Approved" },
            { id: "changes_requested", label: "Changes Requested" },
            { id: "rejected", label: "Rejected" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedStatus === tab.id
                  ? "bg-[#C5A059] text-slate-950 font-semibold shadow-md shadow-[#C5A059]/20"
                  : "bg-[#161B26] text-slate-400 hover:text-slate-200 hover:bg-[#1A2130]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, Bar Council, city, or practice..."
            className="w-full pl-10 pr-4 py-2 bg-[#161B26] border border-[#232B3D] focus:border-[#C5A059] rounded-xl text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Lawyers Table or Empty State */}
      {filteredLawyers.length === 0 ? (
        <div className="bg-[#11141D] border border-[#1F2536] rounded-2xl p-12 text-center flex flex-col items-center justify-center shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center text-slate-400 mb-4">
            <Scale className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-slate-200 mb-1 font-serif">
            No lawyer profiles match the criteria
          </h3>
          <p className="text-xs text-slate-400 max-w-md">
            {initialLawyers.length === 0
              ? "There are currently no registered lawyer profiles in the database. When lawyers create profiles and submit Bar Council enrollment, they will be listed here."
              : "Try clearing your search query or selecting a different status filter."}
          </p>
        </div>
      ) : (
        <div className="bg-[#11141D] border border-[#1F2536] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0E121C] text-slate-400 uppercase tracking-wider text-[10px] border-b border-[#1F2536] font-mono">
                <tr>
                  <th className="px-5 py-3.5">Lawyer Name</th>
                  <th className="px-5 py-3.5">Bar Council Reg</th>
                  <th className="px-5 py-3.5">Location</th>
                  <th className="px-5 py-3.5">Experience</th>
                  <th className="px-5 py-3.5">Practice Areas</th>
                  <th className="px-5 py-3.5">Verification</th>
                  <th className="px-5 py-3.5">Publication</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2536]">
                {filteredLawyers.map((lawyer) => {
                  const status = lawyer.verification?.status || "pending";
                  return (
                    <tr
                      key={lawyer.id}
                      className="hover:bg-[#141926] transition-colors group cursor-pointer"
                      onClick={() => setSelectedLawyer(lawyer)}
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-100 group-hover:text-[#E5C07B] transition-colors">
                          {lawyer.professional_name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]" title={lawyer.id}>
                          ID: {lawyer.id.slice(0, 8)}...
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono">
                        <span className="px-2 py-1 rounded bg-[#161B26] border border-[#232B3D] text-slate-200">
                          {lawyer.bar_council_number}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {lawyer.bar_council_state} ({lawyer.bar_council_enrollment_year})
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{lawyer.city}, {lawyer.state}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                          <span>{lawyer.experience_years} yrs</span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {lawyer.practice_areas.slice(0, 2).map((pa) => (
                            <span
                              key={pa}
                              className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700/60"
                            >
                              {pa}
                            </span>
                          ))}
                          {lawyer.practice_areas.length > 2 && (
                            <span className="px-1.5 py-0.5 text-[10px] text-slate-400">
                              +{lawyer.practice_areas.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            status === "approved"
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              : status === "pending"
                              ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                              : status === "changes_requested"
                              ? "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                              : "bg-red-500/15 text-red-300 border border-red-500/30"
                          }`}
                        >
                          {status === "approved" && <CheckCircle2 className="w-3 h-3" />}
                          {status === "pending" && <Clock className="w-3 h-3" />}
                          {status === "changes_requested" && <AlertCircle className="w-3 h-3" />}
                          {status === "rejected" && <XCircle className="w-3 h-3" />}
                          {status.replace("_", " ")}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono ${
                            lawyer.is_published
                              ? "bg-[#C5A059]/15 text-[#E5C07B] border border-[#C5A059]/30"
                              : "bg-slate-800/80 text-slate-400 border border-slate-700/50"
                          }`}
                        >
                          <Globe className="w-3 h-3" />
                          {lawyer.is_published ? "Published" : "Private"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLawyer(lawyer);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#161B26] hover:bg-[#C5A059] hover:text-slate-950 text-slate-300 border border-[#232B3D] text-xs font-medium transition-all flex items-center gap-1.5 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
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

      {/* Lawyer Detail Modal / Drawer */}
      {selectedLawyer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#0E121C] border-l border-[#1F2536] h-full overflow-y-auto p-8 shadow-2xl space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between pb-6 border-b border-[#1F2536]">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#E5C07B] mb-1 block">
                  Confidential Administrative Record
                </span>
                <h2 className="text-xl font-bold font-serif text-slate-100">
                  {selectedLawyer.professional_name}
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  User ID: {selectedLawyer.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedLawyer(null)}
                className="w-8 h-8 rounded-lg bg-[#161B26] border border-[#232B3D] text-slate-400 hover:text-slate-100 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Verification Status Card */}
            <div className="bg-[#141926] border border-[#232B3D] rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Verification Lifecycle Status
                </span>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    selectedLawyer.verification?.status === "approved"
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                      : selectedLawyer.verification?.status === "pending"
                      ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                      : "bg-red-500/15 text-red-300 border border-red-500/30"
                  }`}
                >
                  {selectedLawyer.verification?.status || "pending"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-2 border-t border-[#1F2536]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Reviewed By:</span>
                  <span className="text-slate-200">
                    {selectedLawyer.verification?.reviewed_by
                      ? `${selectedLawyer.verification.reviewed_by.slice(0, 12)}...`
                      : "Unreviewed"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Reviewed Timestamp:</span>
                  <span className="text-slate-200">
                    {selectedLawyer.verification?.reviewed_at
                      ? new Date(selectedLawyer.verification.reviewed_at).toLocaleString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Bar Council Credentials Section */}
            <div className="bg-[#141926] border border-[#232B3D] rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-semibold text-[#E5C07B] uppercase tracking-wider flex items-center gap-2 font-mono">
                <Shield className="w-4 h-4" />
                Bar Council Registration Details
              </h3>

              <div className="grid grid-cols-3 gap-4 text-xs font-mono pt-2">
                <div>
                  <span className="text-slate-400 block text-[10px]">Enrollment Number:</span>
                  <span className="text-slate-100 font-bold bg-[#161B26] px-2 py-1 rounded border border-[#232B3D] inline-block mt-1">
                    {selectedLawyer.bar_council_number}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Enrolling State:</span>
                  <span className="text-slate-200 inline-block mt-1 font-sans">
                    {selectedLawyer.bar_council_state}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Enrollment Year:</span>
                  <span className="text-slate-200 inline-block mt-1 font-sans">
                    {selectedLawyer.bar_council_enrollment_year}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Overview */}
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1">
                  Professional Bio
                </span>
                <p className="text-slate-300 leading-relaxed bg-[#141926] p-4 rounded-xl border border-[#232B3D]">
                  {selectedLawyer.bio || "No professional biography provided."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1">
                    Practice Areas
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLawyer.practice_areas.map((pa) => (
                      <span
                        key={pa}
                        className="px-2.5 py-1 rounded bg-[#161B26] text-slate-300 border border-[#232B3D]"
                      >
                        {pa}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1">
                    Languages
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLawyer.languages.map((lang) => (
                      <span
                        key={lang}
                        className="px-2.5 py-1 rounded bg-[#161B26] text-slate-300 border border-[#232B3D]"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Internal Admin Notes (Strictly Protected) */}
            <div className="bg-[#141926] border border-[#C5A059]/40 rounded-xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#E5C07B] uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Lock className="w-3.5 h-3.5" />
                  Internal Administrator Notes (Confidential)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  From admin_lawyer_verifications
                </span>
              </div>
              <p className="text-xs text-slate-300 bg-[#0E121C] p-3 rounded-lg border border-[#232B3D] font-mono whitespace-pre-wrap">
                {selectedLawyer.verification?.internal_notes || "No internal notes recorded."}
              </p>
            </div>

            {/* Lawyer-Visible Feedback */}
            <div className="bg-[#141926] border border-[#232B3D] rounded-xl p-5 space-y-2">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <FileText className="w-3.5 h-3.5" />
                Lawyer-Facing Feedback
              </span>
              <p className="text-xs text-slate-400 bg-[#0E121C] p-3 rounded-lg border border-[#232B3D] whitespace-pre-wrap">
                {selectedLawyer.verification?.lawyer_feedback || "No feedback issued to lawyer."}
              </p>
            </div>

            {/* Publication Consent Metadata */}
            <div className="bg-[#141926] border border-[#232B3D] rounded-xl p-4 text-xs font-mono space-y-1.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                Publication Consent Audit Trail
              </span>
              <div className="flex justify-between text-slate-300">
                <span>Directory Visibility:</span>
                <span className={selectedLawyer.is_published ? "text-[#E5C07B]" : "text-slate-400"}>
                  {selectedLawyer.is_published ? "Explicitly Consented" : "Unpublished / Private"}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Consent Timestamp:</span>
                <span>{selectedLawyer.published_at ? new Date(selectedLawyer.published_at).toLocaleString() : "N/A"}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Consented By UUID:</span>
                <span>{selectedLawyer.published_by ? `${selectedLawyer.published_by.slice(0, 16)}...` : "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
