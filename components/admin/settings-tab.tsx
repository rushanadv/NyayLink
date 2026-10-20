import { CheckCircle2, Shield, Database, Key } from "lucide-react";
import type { UserRole } from "@/lib/admin/types";

interface SettingsTabProps {
  userEmail: string;
  userId: string;
  roles: UserRole[];
}

export function SettingsTab({ userEmail, userId, roles }: SettingsTabProps) {
  const securityPolicies = [
    { table: "profiles", rls: "Enforced", rule: "Self-edit; admin manage all", status: "Active" },
    { table: "user_roles", rls: "Enforced", rule: "Admin-only mutations; anti-enumeration", status: "Active" },
    { table: "lawyer_profiles", rls: "Enforced", rule: "Lawyer self-manage; admin view/edit; Bar details restricted", status: "Active" },
    { table: "lawyer_verifications", rls: "Enforced", rule: "Column-level grant; internal_notes hidden from lawyer", status: "Active" },
    { table: "invitations", rls: "Enforced", rule: "Admin-only management; SHA-256 token hashes", status: "Active" },
    { table: "audit_logs", rls: "Enforced", rule: "Append-only triggers; immutable against UPDATE/DELETE", status: "Active" },
  ];

  return (
    <div className="space-y-8">
      {/* Infrastructure Telemetry Overview */}
      <section className="border border-white/[0.06] bg-[#111119] rounded-2xl divide-y divide-white/[0.06] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        <div className="p-6 sm:p-7">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold tracking-tight text-[#F5F4FA]">
              Institutional Infrastructure
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Operational
            </span>
          </div>
          <p className="text-xs text-[#6F6E7D] mt-1">
            Database access governance, cluster topology, and active administrative session
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.06] p-0 text-xs">
          <div className="p-6 sm:p-7 space-y-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-mono tracking-wider uppercase text-[#A99AFF]">
              <Database className="w-3.5 h-3.5" />
              <span>Database Engine</span>
            </div>
            <div className="text-sm font-semibold text-[#F5F4FA]">
              Supabase PostgreSQL 17
            </div>
            <div className="text-[11px] text-[#A5A3B2] font-mono space-y-1">
              <div>Region: AWS ap-south-1</div>
              <div>Connection: Server-Side Pooled Session</div>
            </div>
          </div>

          <div className="p-6 sm:p-7 space-y-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-mono tracking-wider uppercase text-[#A99AFF]">
              <Shield className="w-3.5 h-3.5" />
              <span>Access Governance</span>
            </div>
            <div className="text-sm font-semibold text-[#F5F4FA]">
              Row-Level Security (RLS)
            </div>
            <div className="text-[11px] text-[#A5A3B2] font-mono space-y-1">
              <div>Scope: 6 of 6 Core Tables Active</div>
              <div>Privilege: Principle of Least Privilege</div>
            </div>
          </div>

          <div className="p-6 sm:p-7 space-y-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-mono tracking-wider uppercase text-[#A99AFF]">
              <Key className="w-3.5 h-3.5" />
              <span>Active Admin Session</span>
            </div>
            <div className="text-sm font-semibold text-[#F5F4FA] truncate" title={userEmail}>
              {userEmail}
            </div>
            <div className="text-[11px] text-[#A5A3B2] font-mono space-y-1">
              <div>Roles: <span className="text-[#A99AFF]">{roles.join(", ")}</span></div>
              <div className="truncate">UID: {userId}</div>
            </div>
          </div>
        </div>
      </section>

      {/* RLS Policy Ledger */}
      <section className="space-y-4">
        <div className="border-b border-white/[0.06] pb-3">
          <h4 className="text-base font-semibold text-[#F5F4FA] tracking-tight">
            Row-Level Security & Privilege Specifications
          </h4>
          <p className="text-xs text-[#6F6E7D] mt-0.5">
            Cryptographic policies deployed in migration schema
          </p>
        </div>

        <div className="border border-white/[0.06] bg-[#111119] rounded-xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#F5F4FA]">
              <thead className="border-b border-white/[0.06] bg-[#0E0E17] text-[11px] font-mono tracking-wider uppercase text-[#6F6E7D]">
                <tr>
                  <th className="px-6 py-3.5 font-medium">Table Target</th>
                  <th className="px-6 py-3.5 font-medium">RLS Enforcement</th>
                  <th className="px-6 py-3.5 font-medium">Policy Specification</th>
                  <th className="px-6 py-3.5 font-medium text-right">Verification Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {securityPolicies.map((row) => (
                  <tr key={row.table} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-[#F5F4FA]">
                      public.{row.table}
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-[#A99AFF]">
                      {row.rls}
                    </td>
                    <td className="px-6 py-4 text-[#A5A3B2] text-xs">
                      {row.rule}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
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
      </section>
    </div>
  );
}
