import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type {
  AdminOverviewStats,
  LawyerProfileRecord,
  AuditLogRecord,
} from "@/lib/admin/types";

interface OverviewTabProps {
  stats: AdminOverviewStats;
  recentLawyers: LawyerProfileRecord[];
  recentAuditLogs: AuditLogRecord[];
}

export function OverviewTab({
  stats,
  recentLawyers,
  recentAuditLogs,
}: OverviewTabProps) {
  return (
    <div className="space-y-10">
      {/* 1. ARCHITECTURAL ASYMMETRIC METRICS COMPOSITION */}
      <section className="border border-white/[0.07] bg-[#141614] rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.07]">
          {/* Priority Hero Metric: Pending Verifications */}
          <div className="lg:col-span-5 p-8 flex flex-col justify-between bg-[#111311]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono tracking-widest uppercase text-[#B8A078]">
                  Operational Priority
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#92958E]">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      stats.pendingVerifications > 0
                        ? "bg-[#B8A078] animate-pulse"
                        : "bg-emerald-500/70"
                    }`}
                  />
                  <span>
                    {stats.pendingVerifications > 0 ? "Awaiting Review" : "Queue Clear"}
                  </span>
                </span>
              </div>

              <h2 className="text-sm font-sans text-[#EEECE5] font-medium tracking-wide">
                Pending Lawyer Verifications
              </h2>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-5xl lg:text-6xl font-serif text-[#EEECE5] tracking-tight">
                  {stats.pendingVerifications}
                </span>
                <span className="text-xs text-[#92958E]">
                  credential filings
                </span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-xs text-[#92958E]">
                Bar Council verification required before public directory indexing
              </span>
              <Link
                href="/admin/dashboard?tab=verifications"
                className="inline-flex items-center gap-1 text-xs font-medium text-[#B8A078] hover:text-[#EEECE5] transition-colors shrink-0 ml-4"
              >
                <span>Examine</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Secondary Metric Grid (2x2) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 divide-x-0 sm:divide-x divide-white/[0.07]">
            {/* Column 1 */}
            <div className="divide-y divide-white/[0.07]">
              <div className="p-6">
                <div className="text-[11px] font-mono tracking-wider uppercase text-[#92958E] mb-2">
                  Total Registered Users
                </div>
                <div className="text-3xl font-serif text-[#EEECE5] tracking-tight">
                  {stats.totalUsers}
                </div>
                <div className="text-xs text-[#92958E]/70 mt-1">
                  {stats.activeClients} active client profiles
                </div>
              </div>

              <div className="p-6">
                <div className="text-[11px] font-mono tracking-wider uppercase text-[#92958E] mb-2">
                  Advocate Profiles
                </div>
                <div className="text-3xl font-serif text-[#EEECE5] tracking-tight">
                  {stats.totalLawyers}
                </div>
                <div className="text-xs text-[#92958E]/70 mt-1">
                  Profiles initialized in directory
                </div>
              </div>
            </div>

            {/* Column 2 */}
            <div className="divide-y divide-white/[0.07]">
              <div className="p-6">
                <div className="text-[11px] font-mono tracking-wider uppercase text-[#92958E] mb-2">
                  Verified Advocates
                </div>
                <div className="text-3xl font-serif text-[#EEECE5] tracking-tight">
                  {stats.approvedLawyers}
                </div>
                <div className="text-xs text-[#92958E]/70 mt-1">
                  Approved & active for indexing
                </div>
              </div>

              <div className="p-6">
                <div className="text-[11px] font-mono tracking-wider uppercase text-[#92958E] mb-2">
                  Issued Invitations
                </div>
                <div className="text-3xl font-serif text-[#EEECE5] tracking-tight">
                  {stats.totalInvitations}
                </div>
                <div className="text-xs text-[#92958E]/70 mt-1">
                  Cryptographic tokens issued
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN WORKSPACE: RECENT VERIFICATION FILINGS TABLE */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between border-b border-white/[0.07] pb-3">
          <div>
            <h3 className="text-lg font-serif text-[#EEECE5] tracking-tight">
              Advocate Verification Queue
            </h3>
            <p className="text-xs text-[#92958E] mt-0.5">
              Recent Bar Council credential submissions and their current review status
            </p>
          </div>
          <Link
            href="/admin/dashboard?tab=lawyers"
            className="text-xs font-mono text-[#B8A078] hover:text-[#EEECE5] transition-colors flex items-center gap-1"
          >
            <span>Full Directory ({stats.totalLawyers})</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentLawyers.length === 0 ? (
          <div className="border border-white/[0.07] bg-[#141614] rounded-lg p-10 text-center flex flex-col items-center justify-center">
            <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#92958E] mb-3">
              <CheckCircle2 className="w-4 h-4 text-[#B8A078]" />
            </div>
            <h4 className="text-base font-serif text-[#EEECE5] mb-1">
              Verification queue is clear
            </h4>
            <p className="text-xs text-[#92958E] max-w-sm mb-5 leading-relaxed">
              No advocate filings are currently awaiting administrative review. New practitioner registrations will appear here automatically.
            </p>
            <Link
              href="/admin/dashboard?tab=invitations"
              className="px-3.5 py-1.5 rounded text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-[#EEECE5] border border-white/[0.1] transition-colors"
            >
              Issue Onboarding Invitation
            </Link>
          </div>
        ) : (
          <div className="border border-white/[0.07] bg-[#141614] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#EEECE5]">
                <thead className="border-b border-white/[0.07] bg-[#0E100E] text-[10px] font-mono tracking-wider uppercase text-[#92958E]">
                  <tr>
                    <th className="px-6 py-3 font-medium">Advocate</th>
                    <th className="px-6 py-3 font-medium">Bar Registration</th>
                    <th className="px-6 py-3 font-medium">Jurisdiction</th>
                    <th className="px-6 py-3 font-medium">Experience</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {recentLawyers.slice(0, 6).map((lawyer) => {
                    const status = lawyer.verification?.status || "pending";
                    return (
                      <tr
                        key={lawyer.id}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-[#EEECE5]">
                            {lawyer.professional_name}
                          </div>
                          <div className="text-[11px] font-mono text-[#92958E]/60 mt-0.5">
                            ID: {lawyer.id.slice(0, 8)}...
                          </div>
                        </td>

                        <td className="px-6 py-4 font-mono text-xs">
                          <span className="text-[#EEECE5]">
                            {lawyer.bar_council_number}
                          </span>
                          <span className="block text-[10px] text-[#92958E]/60 mt-0.5">
                            State: {lawyer.bar_council_state} ({lawyer.bar_council_enrollment_year})
                          </span>
                        </td>

                        <td className="px-6 py-4 text-[#92958E]">
                          {lawyer.city}, {lawyer.state}
                        </td>

                        <td className="px-6 py-4 text-[#92958E] font-mono">
                          {lawyer.experience_years} yrs
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

                        <td className="px-6 py-4 text-right">
                          <Link
                            href="/admin/dashboard?tab=lawyers"
                            className="text-xs font-mono text-[#B8A078] hover:text-[#EEECE5] transition-colors"
                          >
                            Examine →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* 3. ACTIVITY LEDGER */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between border-b border-white/[0.07] pb-3">
          <div>
            <h3 className="text-lg font-serif text-[#EEECE5] tracking-tight">
              Chronological Security Ledger
            </h3>
            <p className="text-xs text-[#92958E] mt-0.5">
              Append-only audit trail recorded by PostgreSQL security triggers
            </p>
          </div>
          <Link
            href="/admin/dashboard?tab=audit"
            className="text-xs font-mono text-[#B8A078] hover:text-[#EEECE5] transition-colors flex items-center gap-1"
          >
            <span>Full Ledger</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentAuditLogs.length === 0 ? (
          <div className="border border-white/[0.07] bg-[#141614] rounded-lg p-8 text-center text-xs text-[#92958E]">
            No audit records recorded in the current ledger cycle.
          </div>
        ) : (
          <div className="border border-white/[0.07] bg-[#141614] rounded-lg divide-y divide-white/[0.05]">
            {recentAuditLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-white/[0.02] transition-colors text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-[#92958E]/70 shrink-0">
                    {new Date(log.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                  <span className="font-mono text-[11px] text-[#B8A078] bg-[#B8A078]/10 px-2 py-0.5 rounded border border-[#B8A078]/20">
                    {log.action}
                  </span>
                  <span className="text-[#EEECE5] font-sans">
                    on <code className="font-mono text-[#92958E]">{log.target_table}</code>
                  </span>
                </div>

                <div className="font-mono text-[11px] text-[#92958E]/60 truncate">
                  Actor: {log.actor_id ? `${log.actor_id.slice(0, 8)}...` : "System Trigger"}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
