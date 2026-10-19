import Link from "next/link";
import {
  Users,
  Scale,
  ShieldAlert,
  ShieldCheck,
  MailCheck,
  ArrowRight,
  Clock,
  Activity,
  FileText,
} from "lucide-react";
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
  const statCards = [
    {
      label: "Total Registered Users",
      value: stats.totalUsers,
      subtext: `${stats.activeClients} client accounts`,
      icon: Users,
      color: "border-[#C5A059]/30 text-[#E5C07B]",
      bg: "bg-[#C5A059]/10",
      link: "/admin/dashboard?tab=clients",
    },
    {
      label: "Total Lawyer Profiles",
      value: stats.totalLawyers,
      subtext: `${stats.approvedLawyers} verified & active`,
      icon: Scale,
      color: "border-blue-500/30 text-blue-400",
      bg: "bg-blue-500/10",
      link: "/admin/dashboard?tab=lawyers",
    },
    {
      label: "Pending Verifications",
      value: stats.pendingVerifications,
      subtext: "Awaiting administrator review",
      icon: ShieldAlert,
      color:
        stats.pendingVerifications > 0
          ? "border-amber-500/40 text-amber-300 ring-2 ring-amber-500/20"
          : "border-slate-800 text-slate-400",
      bg: stats.pendingVerifications > 0 ? "bg-amber-500/15" : "bg-slate-800/40",
      link: "/admin/dashboard?tab=verifications",
      urgent: stats.pendingVerifications > 0,
    },
    {
      label: "Approved Lawyers",
      value: stats.approvedLawyers,
      subtext: "Eligible for public directory",
      icon: ShieldCheck,
      color: "border-emerald-500/30 text-emerald-400",
      bg: "bg-emerald-500/10",
      link: "/admin/dashboard?tab=lawyers&status=approved",
    },
    {
      label: "Total Invitations",
      value: stats.totalInvitations,
      subtext: "Admin onboarding tokens",
      icon: MailCheck,
      color: "border-purple-500/30 text-purple-400",
      bg: "bg-purple-500/10",
      link: "/admin/dashboard?tab=invitations",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.link}
              className={`block bg-[#11141D] border ${card.color} rounded-2xl p-5 hover:border-[#C5A059]/60 hover:bg-[#141926] transition-all duration-200 group relative overflow-hidden shadow-lg`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-400 tracking-wide">
                  {card.label}
                </span>
                <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" strokeWidth={2} />
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold font-serif text-slate-50 tracking-tight">
                  {card.value}
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#E5C07B] group-hover:translate-x-1 transition-all" />
              </div>

              <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
                {card.urgent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                )}
                <span>{card.subtext}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Content Split: Recent Verifications & Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Verification Queue Preview (7 cols) */}
        <div className="lg:col-span-7 bg-[#11141D] border border-[#1F2536] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1F2536]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100 font-serif">
                  Verification Review Queue
                </h3>
                <p className="text-xs text-slate-400">
                  Lawyer credential submissions pending verification
                </p>
              </div>
            </div>
            <Link
              href="/admin/dashboard?tab=verifications"
              className="text-xs font-semibold text-[#E5C07B] hover:text-[#C5A059] flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentLawyers.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center text-slate-400 mb-3">
                <Scale className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-medium text-slate-200 mb-1">
                No lawyer records found
              </h4>
              <p className="text-xs text-slate-400 max-w-sm">
                As lawyers register and submit their Bar Council credentials, they will appear here for administrative verification.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentLawyers.slice(0, 5).map((lawyer) => {
                const status = lawyer.verification?.status || "pending";
                return (
                  <div
                    key={lawyer.id}
                    className="p-3.5 rounded-xl bg-[#161B26] border border-[#232B3D] flex items-center justify-between hover:border-[#C5A059]/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-200">
                          {lawyer.professional_name}
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/50">
                          {lawyer.bar_council_number}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-3">
                        <span>{lawyer.city}, {lawyer.state}</span>
                        <span>•</span>
                        <span>{lawyer.experience_years} years exp</span>
                        <span>•</span>
                        <span>{lawyer.practice_areas.slice(0, 2).join(", ") || "General Practice"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          status === "approved"
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                            : status === "pending"
                            ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                            : status === "changes_requested"
                            ? "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                            : "bg-red-500/15 text-red-300 border border-red-500/30"
                        }`}
                      >
                        {status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Audit Activity (5 cols) */}
        <div className="lg:col-span-5 bg-[#11141D] border border-[#1F2536] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1F2536]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center text-[#E5C07B]">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100 font-serif">
                  Security Audit Trail
                </h3>
                <p className="text-xs text-slate-400">
                  Append-only event stream from public.audit_logs
                </p>
              </div>
            </div>
            <Link
              href="/admin/dashboard?tab=audit"
              className="text-xs font-semibold text-[#E5C07B] hover:text-[#C5A059] flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentAuditLogs.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center text-slate-400 mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-medium text-slate-200 mb-1">
                No audit entries recorded yet
              </h4>
              <p className="text-xs text-slate-400 max-w-xs">
                Platform actions such as role assignments, verification transitions, and publication consents will automatically be logged here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAuditLogs.slice(0, 6).map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-[#161B26] border border-[#232B3D] flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-[#E5C07B] bg-[#C5A059]/10 px-1.5 py-0.5 rounded border border-[#C5A059]/20">
                        {log.action}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        on {log.target_table}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono truncate max-w-[220px]" title={log.actor_id || "System"}>
                      Actor: {log.actor_id ? log.actor_id.slice(0, 8) + "..." : "System"}
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
