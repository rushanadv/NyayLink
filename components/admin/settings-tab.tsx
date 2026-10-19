import { Shield, Lock, Server, CheckCircle2 } from "lucide-react";
import type { UserRole } from "@/lib/admin/types";

interface SettingsTabProps {
  userEmail: string;
  userId: string;
  roles: UserRole[];
}

export function SettingsTab({ userEmail, userId, roles }: SettingsTabProps) {
  const securityPolicies = [
    { table: "profiles", rls: "Enabled", rule: "Self-edit; admin manage all", status: "Active" },
    { table: "user_roles", rls: "Enabled", rule: "Admin-only mutations; anti-enumeration", status: "Active" },
    { table: "lawyer_profiles", rls: "Enabled", rule: "Lawyer self-manage; admin view/edit; Bar details restricted", status: "Active" },
    { table: "lawyer_verifications", rls: "Enabled", rule: "Column-level grant; internal_notes hidden from lawyer", status: "Active" },
    { table: "invitations", rls: "Enabled", rule: "Admin-only management; SHA-256 token hashes", status: "Active" },
    { table: "audit_logs", rls: "Enabled", rule: "Append-only triggers; immutable against UPDATE/DELETE", status: "Active" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#11141D] border border-[#1F2536] rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#E5C07B] uppercase tracking-wider font-mono">
            <Server className="w-4 h-4" />
            Backend Infrastructure
          </div>
          <div className="text-sm font-semibold text-slate-100">
            Supabase PostgreSQL Engine
          </div>
          <div className="text-xs text-slate-400 font-mono space-y-1">
            <div>Engine Version: PostgreSQL 17</div>
            <div>Region: AWS ap-south-1 (Mumbai)</div>
            <div>Connection: SSR Pooled Session</div>
          </div>
        </div>

        <div className="bg-[#11141D] border border-[#1F2536] rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono">
            <Shield className="w-4 h-4" />
            Access Control Security
          </div>
          <div className="text-sm font-semibold text-slate-100">
            Row Level Security (RLS)
          </div>
          <div className="text-xs text-slate-400 font-mono space-y-1">
            <div>Enforced on: 6 of 6 Core Tables</div>
            <div>Minimal SQL Grants: Applied</div>
            <div>Role Probing: Anti-Enumeration Active</div>
          </div>
        </div>

        <div className="bg-[#11141D] border border-[#1F2536] rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider font-mono">
            <Lock className="w-4 h-4" />
            Current Administrator Session
          </div>
          <div className="text-sm font-semibold text-slate-100 truncate" title={userEmail}>
            {userEmail}
          </div>
          <div className="text-xs text-slate-400 font-mono space-y-1">
            <div>User ID: {userId.slice(0, 16)}...</div>
            <div className="flex items-center gap-1">
              <span>Roles:</span>
              <span className="text-[#E5C07B]">{roles.join(", ")}</span>
            </div>
            <div>Session Type: Authenticated JWT</div>
          </div>
        </div>
      </div>

      {/* RLS Policies Matrix */}
      <div className="bg-[#11141D] border border-[#1F2536] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-[#1F2536] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold font-serif text-slate-100">
              Database Row Level Security & Privilege Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict isolation policies deployed in migration 20261019181722_initial_nyayalink_schema.sql
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            All 6 Tables Hardened
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0E121C] text-slate-400 uppercase tracking-wider text-[10px] border-b border-[#1F2536] font-mono">
              <tr>
                <th className="px-6 py-3.5">Table Name</th>
                <th className="px-6 py-3.5">RLS Status</th>
                <th className="px-6 py-3.5">Security & Privilege Specification</th>
                <th className="px-6 py-3.5 text-right">Protection State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2536]">
              {securityPolicies.map((row) => (
                <tr key={row.table} className="hover:bg-[#141926] transition-colors">
                  <td className="px-6 py-4 font-mono font-semibold text-slate-100">
                    public.{row.table}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      {row.rls}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300 text-xs">
                    {row.rule}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
