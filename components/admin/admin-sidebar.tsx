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
    <aside className="w-64 bg-[#0C0D0C] border-r border-white/[0.07] flex flex-col shrink-0 min-h-screen text-[#92958E] select-none">
      {/* Editorial Typographic Brand Header */}
      <div className="h-20 px-6 flex items-center border-b border-white/[0.07]">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B8A078]" />
            <span className="font-serif tracking-[0.2em] text-base text-[#EEECE5] font-normal uppercase">
              NyayaLink
            </span>
            <span className="text-[10px] font-mono tracking-widest text-[#92958E]/70 pl-1">
              / OPS
            </span>
          </div>
          <span className="text-[10px] tracking-wider text-[#92958E]/60 uppercase font-sans mt-0.5">
            Institutional Console
          </span>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-3 py-6 space-y-0.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-medium tracking-widest uppercase text-[#92958E]/50 font-mono">
          Operations
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <Link
              key={item.id}
              href={`/admin/dashboard?tab=${item.id}`}
              className={`group flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all duration-150 border-l-2 ${
                isActive
                  ? "bg-[#141614] text-[#EEECE5] border-[#B8A078]"
                  : "text-[#92958E] hover:text-[#EEECE5] hover:bg-[#141614]/60 border-transparent"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? "text-[#B8A078]" : "text-[#92958E] group-hover:text-[#EEECE5]"
                  }`}
                  strokeWidth={1.5}
                />
                <span className="tracking-wide">{item.label}</span>
              </div>

              {typeof item.badge === "number" && item.badge > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-[#B8A078]/15 text-[#B8A078] border border-[#B8A078]/25">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-8 px-3 pb-2 text-[10px] font-medium tracking-widest uppercase text-[#92958E]/50 font-mono">
          External
        </div>
        <Link
          href="/"
          target="_blank"
          className="group flex items-center justify-between px-3 py-2 rounded-md text-xs text-[#92958E] hover:text-[#EEECE5] hover:bg-[#141614]/60 transition-colors border-l-2 border-transparent"
        >
          <span className="tracking-wide">Public Portal</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#92958E]/60 group-hover:text-[#EEECE5]" />
        </Link>
      </nav>

      {/* Admin Profile Footer */}
      <div className="p-4 border-t border-white/[0.07] bg-[#0E100E]">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-widest text-[#92958E]/60 uppercase">
              Administrator
            </span>
            <div className="flex items-center gap-1">
              {userRoles.map((role) => (
                <span
                  key={role}
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase tracking-wider ${
                    role === "admin"
                      ? "text-[#B8A078] bg-[#B8A078]/10 border border-[#B8A078]/20"
                      : "text-[#92958E] bg-white/[0.04]"
                  }`}
                >
                  {role}
                </span>
              ))}
            </div>
          </div>

          <div
            className="text-xs text-[#EEECE5] font-mono truncate"
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
