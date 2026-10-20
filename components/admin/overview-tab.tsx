import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, ArrowUpRight, Clock } from "lucide-react";
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
  const hasPending = stats.pendingVerifications > 0;

  return (
    <div className="space-y-10">
      {/* 1. EDITORIAL ASYMMETRIC METRICS ARCHITECTURE */}
      <section className="rounded-2xl border border-white/[0.06] bg-[#111119] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.06]">
          {/* Priority Hero Metric: Pending Verifications Queue */}
          <div className="lg:col-span-5 p-7 sm:p-8 flex flex-col justify-between bg-gradient-to-br from-[#161426] via-[#121120] to-[#0D0D17] relative overflow-hidden group">
            {/* Luminous focal glow */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#A99AFF]/10 blur-3xl pointer-events-none group-hover:bg-[#A99AFF]/15 transition-all duration-500" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[11px] font-mono tracking-wider uppercase text-[#A99AFF] px-2.5 py-0.5 rounded-full bg-[#A99AFF]/10 border border-[#A99AFF]/20">
                  Priority Operational Queue
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[#A5A3B2]">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      hasPending
                        ? "bg-[#A99AFF] shadow-[0_0_8px_rgba(169,154,255,0.8)] animate-pulse"
                        : "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]"
                    }`}
                  />
                  <span>{hasPending ? "Action Required" : "Queue Current"}</span>
                </span>
              </div>

              <div className="text-sm font-medium text-[#A5A3B2]">
                Pending Advocate Verifications
              </div>

              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-6xl sm:text-7xl font-semibold tracking-tight text-[#F5F4FA] tabular-nums">
                  {stats.pendingVerifications}
                </span>
                <span className="text-xs font-mono text-[#6F6E7D]">
                  credentials awaiting review
                </span>
              </div>

              <p className="mt-3 text-xs text-[#A5A3B2] max-w-sm leading-relaxed">
                {hasPending
                  ? "Bar Council enrollment verification and practice credentials submitted for administrative vetting."
                  : "All submitted practitioner filings have been processed. New Bar Council filings will appear here instantly."}
              </p>
            </div>

            <div className="relative z-10 mt-8 pt-5 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-xs font-mono text-[#6F6E7D]">
                Enrolled practitioners: {stats.totalLawyers}
              </span>
              <Link
                href="/admin/dashboard?tab=verifications"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#A99AFF] hover:text-white transition-colors group/link"
              >
                <span>Review Queue</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Secondary Metric Grid (4 Structural Panes) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 divide-x-0 sm:divide-x divide-white/[0.06]">
            {/* Registered Users */}
            <div className="divide-y divide-white/[0.06]">
              <div className="p-7 hover:bg-white/[0.01] transition-colors">
                <div className="text-[11px] font-mono tracking-wider uppercase text-[#6F6E7D] mb-2 flex items-center justify-between">
                  <span>Registered Users</span>
                  <span className="text-[10px] text-[#A99AFF]">Auth / RLS</span>
                </div>
                <div className="text-4xl font-semibold tracking-tight text-[#F5F4FA] tabular-nums">
                  {stats.totalUsers}
                </div>
                <div className="text-xs text-[#A5A3B2] mt-1.5 flex items-center gap-2">
                  <span className="font-mono text-[#F5F4FA]">{stats.activeClients}</span> client accounts recorded
                </div>
              </div>

              {/* Advocate Directory */}
              <div className="p-7 hover:bg-white/[0.01] transition-colors">
                <div className="text-[11px] font-mono tracking-wider uppercase text-[#6F6E7D] mb-2 flex items-center justify-between">
                  <span>Advocate Profiles</span>
                  <span className="text-[10px] text-[#A5A3B2]">Directory</span>
                </div>
                <div className="text-4xl font-semibold tracking-tight text-[#F5F4FA] tabular-nums">
                  {stats.totalLawyers}
                </div>
                <div className="text-xs text-[#A5A3B2] mt-1.5 flex items-center gap-2">
                  <span className="font-mono text-[#F5F4FA]">{stats.approvedLawyers}</span> verified & discoverable
                </div>
              </div>
            </div>

            {/* Column 2 */}
            <div className="divide-y divide-white/[0.06]">
              {/* Approved Advocates */}
              <div className="p-7 hover:bg-white/[0.01] transition-colors">
                <div className="text-[11px] font-mono tracking-wider uppercase text-[#6F6E7D] mb-2 flex items-center justify-between">
                  <span>Verified Advocates</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-4xl font-semibold tracking-tight text-[#F5F4FA] tabular-nums">
                  {stats.approvedLawyers}
                </div>
                <div className="text-xs text-[#A5A3B2] mt-1.5">
                  Published with active Bar credentials
                </div>
              </div>

              {/* Issued Invitations */}
              <div className="p-7 hover:bg-white/[0.01] transition-colors">
                <div className="text-[11px] font-mono tracking-wider uppercase text-[#6F6E7D] mb-2 flex items-center justify-between">
                  <span>Access Invitations</span>
                  <span className="text-[10px] text-[#6F6E7D]">SHA-256</span>
                </div>
                <div className="text-4xl font-semibold tracking-tight text-[#F5F4FA] tabular-nums">
                  {stats.totalInvitations}
                </div>
                <div className="text-xs text-[#A5A3B2] mt-1.5">
                  Cryptographic onboarding tokens
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PRIMARY OPERATIONAL WORKSPACE: ADVOCATE VERIFICATION QUEUE */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-white/[0.06] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold tracking-tight text-[#F5F4FA]">
                Advocate Verification Ledger
              </h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-[#A5A3B2] border border-white/[0.06]">
                {recentLawyers.length} filings
              </span>
            </div>
            <p className="text-xs text-[#6F6E7D] mt-0.5">
              Live Bar Council credential submissions and public directory indexing state
            </p>
          </div>
          <Link
            href="/admin/dashboard?tab=lawyers"
            className="text-xs font-mono text-[#A99AFF] hover:text-white transition-colors flex items-center gap-1 shrink-0"
          >
            <span>Complete Directory</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentLawyers.length === 0 ? (
          <div className="border border-white/[0.06] bg-[#111119] rounded-xl p-8 sm:p-10 text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-[#F5F4FA] mb-1">
              Verification Queue is Clear
            </h4>
            <p className="text-xs text-[#A5A3B2] max-w-sm mb-5 leading-relaxed">
              No advocate filings are currently awaiting administrative review. New practitioner registrations will populate this ledger upon submission.
            </p>
            <Link
              href="/admin/dashboard?tab=invitations"
              className="px-4 py-2 rounded-lg text-xs font-medium bg-[#1A1926] hover:bg-[#232135] text-[#F5F4FA] border border-white/[0.08] transition-colors"
            >
              Issue Advocate Invitation
            </Link>
          </div>
        ) : (
          <div className="border border-white/[0.06] bg-[#111119] rounded-xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#F5F4FA]">
                <thead className="border-b border-white/[0.06] bg-[#0E0E17] text-[11px] font-mono tracking-wider uppercase text-[#6F6E7D]">
                  <tr>
                    <th className="px-6 py-3.5 font-medium">Advocate</th>
                    <th className="px-6 py-3.5 font-medium">Bar Council Identifier</th>
                    <th className="px-6 py-3.5 font-medium">Jurisdiction</th>
                    <th className="px-6 py-3.5 font-medium">Experience</th>
                    <th className="px-6 py-3.5 font-medium">Review Status</th>
                    <th className="px-6 py-3.5 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {recentLawyers.slice(0, 6).map((lawyer) => {
                    const status = lawyer.verification?.status || "pending";
                    return (
                      <tr
                        key={lawyer.id}
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-[#F5F4FA] group-hover:text-[#A99AFF] transition-colors">
                            {lawyer.professional_name}
                          </div>
                          <div className="text-[11px] font-mono text-[#6F6E7D] mt-0.5">
                            ID: {lawyer.id.slice(0, 8)}...
                          </div>
                        </td>

                        <td className="px-6 py-4 font-mono text-xs">
                          <span className="text-[#F5F4FA] font-medium">
                            {lawyer.bar_council_number}
                          </span>
                          <span className="block text-[10px] text-[#6F6E7D] mt-0.5">
                            {lawyer.bar_council_state} ({lawyer.bar_council_enrollment_year})
                          </span>
                        </td>

                        <td className="px-6 py-4 text-[#A5A3B2]">
                          {lawyer.city}, {lawyer.state}
                        </td>

                        <td className="px-6 py-4 text-[#A5A3B2] font-mono">
                          {lawyer.experience_years} yrs
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

                        <td className="px-6 py-4 text-right">
                          <Link
                            href="/admin/dashboard?tab=lawyers"
                            className="text-xs font-mono text-[#A99AFF] hover:text-white transition-colors inline-flex items-center gap-1"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="w-3 h-3" />
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

      {/* 3. ACTIVITY & SECURITY AUDIT LEDGER */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-white/[0.06] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold tracking-tight text-[#F5F4FA]">
                Chronological Security Ledger
              </h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-[#A5A3B2] border border-white/[0.06]">
                PostgreSQL Immutability
              </span>
            </div>
            <p className="text-xs text-[#6F6E7D] mt-0.5">
              Append-only tamper-evident security audit trail generated by database triggers
            </p>
          </div>
          <Link
            href="/admin/dashboard?tab=audit"
            className="text-xs font-mono text-[#A99AFF] hover:text-white transition-colors flex items-center gap-1 shrink-0"
          >
            <span>Complete Ledger ({recentAuditLogs.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentAuditLogs.length === 0 ? (
          <div className="border border-white/[0.06] bg-[#111119] rounded-xl p-8 text-center text-xs text-[#6F6E7D]">
            No audit records registered in the current session cycle.
          </div>
        ) : (
          <div className="border border-white/[0.06] bg-[#111119] rounded-xl divide-y divide-white/[0.04] overflow-hidden">
            {recentAuditLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors text-xs"
              >
                <div className="flex items-center gap-3">
                  <span suppressHydrationWarning className="font-mono text-[11px] text-[#6F6E7D] flex items-center gap-1.5 shrink-0">
                    <Clock className="w-3 h-3 text-[#6F6E7D]" />
                    {new Date(log.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#A99AFF] bg-[#A99AFF]/10 px-2 py-0.5 rounded border border-[#A99AFF]/20">
                    {log.action}
                  </span>
                  <span className="text-[#F5F4FA]">
                    Target: <code className="font-mono text-[#A5A3B2]">{log.target_table}</code>
                  </span>
                </div>

                <div className="font-mono text-[11px] text-[#6F6E7D] truncate">
                  Actor: {log.actor_id ? `${log.actor_id.slice(0, 8)}...` : "Database Trigger"}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
