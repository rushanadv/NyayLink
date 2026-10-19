import { Shield, Database, Lock } from "lucide-react";
import type { AdminDashboardTab } from "@/lib/admin/types";

interface AdminHeaderProps {
  currentTab: AdminDashboardTab;
}

const tabMeta: Record<AdminDashboardTab, { title: string; subtitle: string }> = {
  overview: {
    title: "System Overview",
    subtitle: "Real-time key operational metrics, verification pipeline, and platform activity.",
  },
  lawyers: {
    title: "Lawyer Management",
    subtitle: "Professional directory, Bar Council credentials, and verification review history.",
  },
  verifications: {
    title: "Pending Verifications",
    subtitle: "Verification review queue for newly submitted lawyer credentials and resubmissions.",
  },
  clients: {
    title: "Users & Role Assignments",
    subtitle: "All registered account profiles and assigned RBAC roles stored in public.user_roles.",
  },
  invitations: {
    title: "Lawyer Invitations",
    subtitle: "Admin-issued onboarding invitations protected with SHA-256 token hashes.",
  },
  audit: {
    title: "Immutable Audit Logs",
    subtitle: "Append-only security audit trail recording system events, role changes, and reviews.",
  },
  settings: {
    title: "Security & System Settings",
    subtitle: "Database schema configuration, RLS policy verification, and infrastructure status.",
  },
};

export function AdminHeader({ currentTab }: AdminHeaderProps) {
  const meta = tabMeta[currentTab] || tabMeta.overview;

  return (
    <header className="h-20 bg-[#0E121C] border-b border-[#1F2536] px-8 flex items-center justify-between shrink-0">
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
          <span>Admin Portal</span>
          <span>/</span>
          <span className="text-[#E5C07B] font-medium capitalize">{currentTab}</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-100 font-serif">
          {meta.title}
        </h1>
      </div>

      <div className="hidden md:flex items-center gap-3">
        {/* Security badges */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#141926] border border-[#232B3D] text-[11px] text-slate-300 font-mono">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>RLS Active</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#141926] border border-[#232B3D] text-[11px] text-slate-300 font-mono">
          <Database className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>Supabase PG17</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#141926] border border-[#232B3D] text-[11px] text-slate-300 font-mono">
          <Lock className="w-3.5 h-3.5 text-blue-400" />
          <span>RBAC Enforced</span>
        </div>
      </div>
    </header>
  );
}
