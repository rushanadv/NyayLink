import Link from "next/link";
import {
  LayoutDashboard,
  Scale,
  ShieldCheck,
  Users,
  MailCheck,
  FileText,
  Sliders,
  ArrowUpRight,
} from "lucide-react";
import type { AdminDashboardTab, UserRole } from "@/lib/admin/types";
import { LogoutButton } from "@/components/logout-button";
import { NyayLinkLogo } from "@/components/ui/nyaylink-logo";

interface AdminSidebarProps {
  currentTab: AdminDashboardTab;
  pendingCount: number;
  userEmail: string;
  userRoles: UserRole[];
  onTabSelect?: (tab: AdminDashboardTab) => void;
}

export function AdminSidebar({
  currentTab,
  pendingCount,
  userEmail,
  userRoles,
  onTabSelect,
}: AdminSidebarProps) {
  const navItems: Array<{
    id: AdminDashboardTab;
    label: string;
    icon: typeof LayoutDashboard;
    badge?: number;
  }> = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "lawyers", label: "Advocates", icon: Scale },
    {
      id: "verifications",
      label: "Verifications",
      icon: ShieldCheck,
      badge: pendingCount,
    },
    { id: "clients", label: "Users & Roles", icon: Users },
    { id: "invitations", label: "Invitations", icon: MailCheck },
    { id: "audit", label: "Audit Ledger", icon: FileText },
    { id: "settings", label: "Settings", icon: Sliders },
  ];

  return (
    <aside className="w-64 bg-[#09090F] border-r border-white/[0.06] flex flex-col shrink-0 min-h-screen text-[#A5A3B2] select-none font-sans">
      {/* Brand Header with Custom Obsidian Monogram */}
      <div className="h-20 px-6 flex items-center border-b border-white/[0.06]">
        <NyayLinkLogo size="sm" theme="dark" subtitle="Admin HQ" href="/admin" />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-medium tracking-widest uppercase text-[#6F6E7D] font-mono">
          Administrative Console
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <Link
              key={item.id}
              href={`/admin/dashboard?tab=${item.id}`}
              onClick={(e) => {
                if (onTabSelect) {
                  e.preventDefault();
                  onTabSelect(item.id);
                }
              }}
              className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 border-l-2 ${
                isActive
                  ? "bg-[#191923] text-[#F5F4FA] border-[#A99AFF] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  : "text-[#A5A3B2] hover:text-[#F5F4FA] hover:bg-[#14141E] border-transparent"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? "text-[#A99AFF]" : "text-[#6F6E7D] group-hover:text-[#F5F4FA]"
                  }`}
                  strokeWidth={1.75}
                />
                <span className="tracking-normal">{item.label}</span>
              </div>

              {typeof item.badge === "number" && item.badge > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-[#A99AFF]/15 text-[#A99AFF] border border-[#A99AFF]/30 animate-pulse">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[10px] font-medium tracking-widest uppercase text-[#6F6E7D] font-mono">
          Public Network
        </div>
        <Link
          href="/"
          target="_blank"
          className="group flex items-center justify-between px-3 py-2 rounded-lg text-xs text-[#A5A3B2] hover:text-[#F5F4FA] hover:bg-[#14141E] transition-colors border-l-2 border-transparent"
        >
          <span className="tracking-normal">Citizen Portal</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#6F6E7D] group-hover:text-[#F5F4FA]" />
        </Link>
      </nav>

      {/* Admin Profile Footer */}
      <div className="p-4 border-t border-white/[0.06] bg-[#0C0C14]">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-wider text-[#6F6E7D] uppercase">
              Authenticated Session
            </span>
            <div className="flex items-center gap-1">
              {userRoles.map((role) => (
                <span
                  key={role}
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    role === "admin"
                      ? "text-[#A99AFF] bg-[#A99AFF]/15 border border-[#A99AFF]/25 font-semibold"
                      : "text-[#A5A3B2] bg-white/[0.04]"
                  }`}
                >
                  {role}
                </span>
              ))}
            </div>
          </div>

          <div
            className="text-xs text-[#F5F4FA] font-mono truncate"
            title={userEmail}
          >
            {userEmail}
          </div>

          <div className="pt-1 flex justify-start">
            <LogoutButton />
          </div>
        </div>
      </div>
    </aside>
  );
}
