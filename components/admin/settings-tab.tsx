import { CheckCircle2 } from "lucide-react";
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
      <section className="border border-white/[0.07] bg-[#141614] rounded-lg divide-y divide-white/[0.07]">
        <div className="p-6">
          <h3 className="text-lg font-serif text-[#EEECE5] tracking-tight">
            Institutional Configuration
          </h3>
          <p className="text-xs text-[#92958E] mt-0.5">
            Database access controls, cluster topology, and active administrative session
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.07] p-0 text-xs">
          <div className="p-6 space-y-2">
            <span className="text-[10px] font-mono tracking-wider uppercase text-[#B8A078] block">
              Database Engine
            </span>
            <div className="text-sm font-medium text-[#EEECE5]">
              Supabase PostgreSQL 17
            </div>
            <div className="text-[11px] text-[#92958E] font-mono space-y-0.5">
              <div>Region: AWS ap-south-1</div>
              <div>Connection: SSR Pooled Session</div>
            </div>
          </div>

          <div className="p-6 space-y-2">
            <span className="text-[10px] font-mono tracking-wider uppercase text-[#B8A078] block">
              Access Governance
            </span>
            <div className="text-sm font-medium text-[#EEECE5]">
              Row-Level Security (RLS)
            </div>
            <div className="text-[11px] text-[#92958E] font-mono space-y-0.5">
              <div>Scope: 6 of 6 Core Tables</div>
              <div>Privilege: Minimal Grants Applied</div>
            </div>
          </div>

          <div className="p-6 space-y-2">
            <span className="text-[10px] font-mono tracking-wider uppercase text-[#B8A078] block">
              Session Identity
            </span>
            <div className="text-sm font-medium text-[#EEECE5] truncate" title={userEmail}>
              {userEmail}
            </div>
            <div className="text-[11px] text-[#92958E] font-mono space-y-0.5">
              <div>Roles: {roles.join(", ")}</div>
              <div>UID: {userId.slice(0, 16)}...</div>
            </div>
          </div>
        </div>
      </section>

      {/* RLS Policy Ledger */}
      <section className="space-y-3">
        <div className="border-b border-white/[0.07] pb-3">
          <h4 className="text-sm font-serif text-[#EEECE5] tracking-tight">
            Row Level Security & Privilege Specifications
          </h4>
          <p className="text-xs text-[#92958E] mt-0.5">
            Active constraints deployed in migration 20261019181722_initial_nyayalink_schema.sql
          </p>
        </div>

        <div className="border border-white/[0.07] bg-[#141614] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#EEECE5]">
              <thead className="border-b border-white/[0.07] bg-[#0E100E] text-[10px] font-mono tracking-wider uppercase text-[#92958E]">
                <tr>
                  <th className="px-6 py-3 font-medium">Table Target</th>
                  <th className="px-6 py-3 font-medium">RLS Status</th>
                  <th className="px-6 py-3 font-medium">Policy Specification</th>
                  <th className="px-6 py-3 font-medium text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {securityPolicies.map((row) => (
                  <tr key={row.table} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-[#EEECE5]">
                      public.{row.table}
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-[#B8A078]">
                      {row.rls}
                    </td>
                    <td className="px-6 py-4 text-[#92958E] text-xs">
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
