import Link from "next/link";
import {
  LayoutDashboard,
  Scale,
  ShieldCheck,
  Users,
  MailCheck,
  FileText,
  Sliders,
  ExternalLink,
} from "lucide-react";
import type { AdminDashboardTab, UserRole } from "@/lib/admin/types";
import { LogoutButton } from "@/components/logout-button";

interface AdminSidebarProps {
  currentTab: AdminDashboardTab;
  pendingCount: number;
  userEmail: string;
  userRoles: UserRole[];
}

export function AdminSidebar({
  currentTab,
  pendingCount,
  userEmail,
  userRoles,
}: AdminSidebarProps) {
  const navItems: Array<{
    id: AdminDashboardTab;
    label: string;
    icon: typeof LayoutDashboard;
    badge?: number;
  }> = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "lawyers", label: "Lawyers", icon: Scale },
    {
      id: "verifications",
      label: "Pending Verifications",
      icon: ShieldCheck,
      badge: pendingCount,
    },
    { id: "clients", label: "Users & Roles", icon: Users },
    { id: "invitations", label: "Invitations", icon: MailCheck },
    { id: "audit", label: "Audit Logs", icon: FileText },
    { id: "settings", label: "System Settings", icon: Sliders },
  ];

  return (
    <aside className="w-72 bg-[#0C0F17] border-r border-[#1F2536] flex flex-col shrink-0 min-h-screen text-slate-300 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#1F2536]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C5A059] to-[#8C6B2B] flex items-center justify-center text-slate-950 shadow-lg shadow-[#C5A059]/15">
            <Scale className="w-5 h-5" strokeWidth={2.2} />
          </div>
          <div>
            <div className="font-bold tracking-wider text-slate-100 text-base font-serif flex items-center gap-1.5">
              NYAYALINK
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#C5A059]/20 text-[#E5C07B] font-sans font-semibold tracking-normal border border-[#C5A059]/30">
                ADMIN
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-tight">
              Legal Marketplace Core
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <Link
              key={item.id}
              href={`/admin/dashboard?tab=${item.id}`}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? "bg-[#C5A059]/15 text-[#E5C07B] border border-[#C5A059]/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#161B26]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? "text-[#E5C07B]" : "text-slate-400 group-hover:text-slate-200"
                  }`}
                  strokeWidth={isActive ? 2.2 : 1.75}
                />
                <span>{item.label}</span>
              </div>

              {typeof item.badge === "number" && item.badge > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-6 px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Quick Links
        </div>
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-[#161B26] transition-colors"
        >
          <span>Public Portal</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </Link>
      </nav>

      {/* Admin Profile & Role Info Footer */}
      <div className="p-4 border-t border-[#1F2536] bg-[#0E121C]">
        <div className="bg-[#141926] border border-[#232B3D] rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Signed in Administrator
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
          </div>

          <div className="text-xs font-medium text-slate-200 truncate mb-2 font-mono" title={userEmail}>
            {userEmail}
          </div>

          <div className="flex flex-wrap gap-1 mb-3">
            {userRoles.map((role) => (
              <span
                key={role}
                className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold uppercase tracking-wider ${
                  role === "admin"
                    ? "bg-[#C5A059]/20 text-[#E5C07B] border border-[#C5A059]/40"
                    : "bg-slate-800 text-slate-300 border border-slate-700/60"
                }`}
              >
                {role}
              </span>
            ))}
          </div>

          <div className="pt-2 border-t border-[#232B3D]/80 flex justify-end">
            <LogoutButton />
          </div>
        </div>
      </div>
    </aside>
  );
}
