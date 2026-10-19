import type { AdminDashboardTab } from "@/lib/admin/types";

interface AdminHeaderProps {
  currentTab: AdminDashboardTab;
}

const tabMeta: Record<AdminDashboardTab, { title: string; subtitle: string }> = {
  overview: {
    title: "Operations",
    subtitle: "Credential verification queue, advocate enrollment status, and institutional audit stream.",
  },
  lawyers: {
    title: "Advocate Directory",
    subtitle: "Registered legal practitioners, Bar Council credentials, and publication status.",
  },
  verifications: {
    title: "Verification Queue",
    subtitle: "Pending Bar Council filings awaiting administrative review and validation.",
  },
  clients: {
    title: "Users & Access Control",
    subtitle: "User directory and role assignments managed under public.user_roles.",
  },
  invitations: {
    title: "Onboarding Invitations",
    subtitle: "Cryptographic token invitations issued to advocates and law firm partners.",
  },
  audit: {
    title: "Security Ledger",
    subtitle: "Chronological, append-only security audit log recording administrative events.",
  },
  settings: {
    title: "Infrastructure & Policies",
    subtitle: "Database row-level security policy matrix and active session configuration.",
  },
};

export function AdminHeader({ currentTab }: AdminHeaderProps) {
  const meta = tabMeta[currentTab] || tabMeta.overview;

  return (
    <header className="h-20 bg-[#0C0D0C] border-b border-white/[0.07] px-8 flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-2xl lg:text-3xl font-serif font-normal tracking-tight text-[#EEECE5]">
          {meta.title}
        </h1>
        <p className="text-xs text-[#92958E] font-sans mt-0.5 max-w-xl truncate">
          {meta.subtitle}
        </p>
      </div>

      <div className="hidden md:flex items-center gap-4 text-xs font-mono text-[#92958E]/70">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
          <span>AP-SOUTH-1</span>
        </span>
        <span className="text-white/10">|</span>
        <span>20 OCT 2026</span>
      </div>
    </header>
  );
}
