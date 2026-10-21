import type { AdminDashboardTab } from "@/lib/admin/types";

interface AdminHeaderProps {
  currentTab: AdminDashboardTab;
}

const tabMeta: Record<AdminDashboardTab, { breadcrumb: string; title: string; subtitle: string }> = {
  overview: {
    breadcrumb: "Console / Dashboard",
    title: "Overview",
    subtitle: "Real-time verification queue, advocate credentials, and system activity ledger.",
  },
  lawyers: {
    breadcrumb: "Console / Directory",
    title: "Advocates",
    subtitle: "Enrolled legal practitioners, Bar Council registration numbers, and public profiles.",
  },
  verifications: {
    breadcrumb: "Console / Applications",
    title: "Pending Verifications",
    subtitle: "Bar Council certificate submissions awaiting administrative review and approval.",
  },
  clients: {
    breadcrumb: "Console / Directory",
    title: "Users & Roles",
    subtitle: "Active platform accounts, permissions, and role assignments.",
  },
  invitations: {
    breadcrumb: "Console / Access",
    title: "Invitations",
    subtitle: "Cryptographic invitation tokens issued to partner law firms and advocates.",
  },
  audit: {
    breadcrumb: "Console / Security",
    title: "Audit Ledger",
    subtitle: "Chronological, tamper-evident record of administrative and security events.",
  },
  settings: {
    breadcrumb: "Console / Configuration",
    title: "Settings & System",
    subtitle: "Access control configuration and active administrative credentials.",
  },
};

export function AdminHeader({ currentTab }: AdminHeaderProps) {
  const meta = tabMeta[currentTab] || tabMeta.overview;

  return (
    <header className="h-20 bg-[#09090F] border-b border-white/[0.06] px-8 flex items-center justify-between shrink-0">
      <div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-[#6F6E7D]">
          <span>NyayLink Workspace</span>
          <span>/</span>
          <span className="text-[#A99AFF]">{meta.breadcrumb}</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#F5F4FA] mt-0.5">
          {meta.title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Subtle operational indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#111119] border border-white/[0.06] text-xs font-mono text-[#A5A3B2]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>System Healthy</span>
        </div>
      </div>
    </header>
  );
}
