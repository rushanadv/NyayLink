import { Suspense } from "react";
import { requireAdminOrRedirect } from "@/lib/admin/auth";
import {
  fetchAdminStats,
  fetchLawyersWithVerifications,
  fetchUserProfilesWithRoles,
  fetchInvitations,
  fetchAuditLogs,
} from "@/lib/admin/data";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { OverviewTab } from "@/components/admin/overview-tab";
import { LawyersTab } from "@/components/admin/lawyers-tab";
import { VerificationsTab } from "@/components/admin/verifications-tab";
import { ClientsTab } from "@/components/admin/clients-tab";
import { InvitationsTab } from "@/components/admin/invitations-tab";
import { AuditTab } from "@/components/admin/audit-tab";
import { SettingsTab } from "@/components/admin/settings-tab";
import { AccessDenied } from "@/components/admin/access-denied";
import type { AdminDashboardTab } from "@/lib/admin/types";

interface AdminDashboardPageProps {
  searchParams?: Promise<{
    tab?: string;
  }>;
}

function AdminDashboardSkeleton() {
  return (
    <div className="flex h-screen bg-[#0C0D0C] text-[#EEECE5] overflow-hidden font-sans">
      <div className="w-64 bg-[#0C0D0C] border-r border-white/[0.07] p-6 space-y-6">
        <div className="h-6 w-32 bg-white/[0.03] rounded animate-pulse" />
        <div className="space-y-2 pt-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-7 bg-white/[0.02] rounded animate-pulse" />
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col bg-[#0C0D0C]">
        <div className="h-20 bg-[#0C0D0C] border-b border-white/[0.07] px-8 flex items-center justify-between">
          <div className="h-7 w-40 bg-white/[0.03] rounded animate-pulse" />
          <div className="h-4 w-28 bg-white/[0.02] rounded animate-pulse" />
        </div>
        <div className="p-8 space-y-8">
          <div className="h-44 bg-[#141614] border border-white/[0.07] rounded-lg animate-pulse" />
          <div className="h-64 bg-[#141614] border border-white/[0.07] rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}

async function AdminDashboardContent({
  searchParamsPromise,
}: {
  searchParamsPromise?: Promise<{ tab?: string }>;
}) {
  // 1. Strict Server-Side Authentication & Role Verification against public.user_roles
  const authResult = await requireAdminOrRedirect("/admin/dashboard");

  // If user is authenticated but lacks 'admin' role in public.user_roles:
  if (!authResult.authorized) {
    return <AccessDenied user={authResult.user} roles={authResult.roles} />;
  }

  const { user, roles, supabase } = authResult;

  // 2. Resolve requested navigation tab
  const resolvedSearchParams = (await searchParamsPromise) || {};
  const validTabs: AdminDashboardTab[] = [
    "overview",
    "lawyers",
    "verifications",
    "clients",
    "invitations",
    "audit",
    "settings",
  ];
  const currentTab: AdminDashboardTab = validTabs.includes(
    resolvedSearchParams.tab as AdminDashboardTab
  )
    ? (resolvedSearchParams.tab as AdminDashboardTab)
    : "overview";

  // 3. Fetch real database statistics and records in parallel under RLS
  const [stats, lawyers, userProfiles, invitations, auditLogs] = await Promise.all([
    fetchAdminStats(supabase),
    fetchLawyersWithVerifications(supabase),
    fetchUserProfilesWithRoles(supabase),
    fetchInvitations(supabase),
    fetchAuditLogs(supabase),
  ]);

  return (
    <div className="flex h-screen bg-[#0C0D0C] text-[#EEECE5] overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <AdminSidebar
        currentTab={currentTab}
        pendingCount={stats.pendingVerifications}
        userEmail={user.email || user.id}
        userRoles={roles}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0C0D0C]">
        <AdminHeader currentTab={currentTab} />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {currentTab === "overview" && (
              <OverviewTab
                stats={stats}
                recentLawyers={lawyers}
                recentAuditLogs={auditLogs}
              />
            )}

            {currentTab === "lawyers" && <LawyersTab initialLawyers={lawyers} />}

            {currentTab === "verifications" && (
              <VerificationsTab lawyers={lawyers} />
            )}

            {currentTab === "clients" && (
              <ClientsTab initialProfiles={userProfiles} />
            )}

            {currentTab === "invitations" && (
              <InvitationsTab invitations={invitations} />
            )}

            {currentTab === "audit" && <AuditTab auditLogs={auditLogs} />}

            {currentTab === "settings" && (
              <SettingsTab
                userEmail={user.email || user.id}
                userId={user.id}
                roles={roles}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminDashboardPage(props: AdminDashboardPageProps) {
  return (
    <Suspense fallback={<AdminDashboardSkeleton />}>
      <AdminDashboardContent searchParamsPromise={props.searchParams} />
    </Suspense>
  );
}
