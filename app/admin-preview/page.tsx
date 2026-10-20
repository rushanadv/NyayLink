"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { OverviewTab } from "@/components/admin/overview-tab";
import { LawyersTab } from "@/components/admin/lawyers-tab";
import { VerificationsTab } from "@/components/admin/verifications-tab";
import { ClientsTab } from "@/components/admin/clients-tab";
import { InvitationsTab } from "@/components/admin/invitations-tab";
import { AuditTab } from "@/components/admin/audit-tab";
import { SettingsTab } from "@/components/admin/settings-tab";
import type {
  AdminDashboardTab,
  AdminOverviewStats,
  LawyerProfileRecord,
  UserProfileRecord,
  InvitationRecord,
  AuditLogRecord,
} from "@/lib/admin/types";

const mockStats: AdminOverviewStats = {
  totalUsers: 142,
  totalLawyers: 38,
  pendingVerifications: 4,
  approvedLawyers: 31,
  totalInvitations: 19,
  activeClients: 104,
  recentAuditCount: 86,
};

const mockLawyers: LawyerProfileRecord[] = [
  {
    id: "9f8a7b6c-1111-4000-8000-000000000001",
    professional_name: "Adv. Rajesh V. Nariman",
    bio: "Senior Constitutional and Appellate Counsel practicing primarily before the Supreme Court of India and High Court of Delhi. Specializing in dispute resolution, writ petitions, and commercial arbitration.",
    practice_areas: ["Constitutional Law", "Commercial Arbitration", "Civil Writs"],
    experience_years: 18,
    city: "New Delhi",
    state: "Delhi",
    languages: ["English", "Hindi"],
    is_profile_completed: true,
    is_published: false,
    published_at: null,
    published_by: null,
    bar_council_number: "D/1842/2008",
    bar_council_state: "Delhi",
    bar_council_enrollment_year: 2008,
    created_at: "2026-10-18T10:14:00Z",
    updated_at: "2026-10-19T08:30:00Z",
    verification: {
      id: "v-001",
      lawyer_id: "9f8a7b6c-1111-4000-8000-000000000001",
      status: "pending",
      reviewed_by: null,
      reviewed_at: null,
      lawyer_feedback: null,
      internal_notes: "Bar Council certificate submitted via state portal. Enrollment date matches Bar Council of Delhi registry. Pending administrative cross-check.",
      submitted_at: "2026-10-19T08:30:00Z",
      created_at: "2026-10-19T08:30:00Z",
      updated_at: "2026-10-19T08:30:00Z",
    },
  },
  {
    id: "9f8a7b6c-2222-4000-8000-000000000002",
    professional_name: "Adv. Sunita K. Deshmukh",
    bio: "Corporate transactions, merger clearances, and Intellectual Property Counsel. Empaneled with Bombay High Court.",
    practice_areas: ["Intellectual Property", "Corporate Law", "M&A"],
    experience_years: 12,
    city: "Mumbai",
    state: "Maharashtra",
    languages: ["English", "Marathi", "Hindi"],
    is_profile_completed: true,
    is_published: true,
    published_at: "2026-10-15T12:00:00Z",
    published_by: "admin-system",
    bar_council_number: "MAH/2940/2014",
    bar_council_state: "Maharashtra & Goa",
    bar_council_enrollment_year: 2014,
    created_at: "2026-10-12T09:00:00Z",
    updated_at: "2026-10-15T12:00:00Z",
    verification: {
      id: "v-002",
      lawyer_id: "9f8a7b6c-2222-4000-8000-000000000002",
      status: "approved",
      reviewed_by: "admin-operations",
      reviewed_at: "2026-10-15T12:00:00Z",
      lawyer_feedback: "Credentials verified against Bar Council of Maharashtra & Goa database.",
      internal_notes: "Verified against State Bar enrollment directory. All documents attested.",
      submitted_at: "2026-10-13T11:00:00Z",
      created_at: "2026-10-13T11:00:00Z",
      updated_at: "2026-10-15T12:00:00Z",
    },
  },
  {
    id: "9f8a7b6c-3333-4000-8000-000000000003",
    professional_name: "Adv. Arvind Swaminathan",
    bio: "Maritime, Admiralty and International Trade Law specialist practicing across Madras High Court and National Company Law Tribunal.",
    practice_areas: ["Maritime Law", "NCLT & Insolvency", "Banking"],
    experience_years: 9,
    city: "Chennai",
    state: "Tamil Nadu",
    languages: ["English", "Tamil"],
    is_profile_completed: true,
    is_published: false,
    published_at: null,
    published_by: null,
    bar_council_number: "MS/1104/2017",
    bar_council_state: "Tamil Nadu & Puducherry",
    bar_council_enrollment_year: 2017,
    created_at: "2026-10-19T14:20:00Z",
    updated_at: "2026-10-19T14:20:00Z",
    verification: {
      id: "v-003",
      lawyer_id: "9f8a7b6c-3333-4000-8000-000000000003",
      status: "pending",
      reviewed_by: null,
      reviewed_at: null,
      lawyer_feedback: null,
      internal_notes: "Enrollment ID verification pending confirmation with State Bar Council registry.",
      submitted_at: "2026-10-19T14:20:00Z",
      created_at: "2026-10-19T14:20:00Z",
      updated_at: "2026-10-19T14:20:00Z",
    },
  },
  {
    id: "9f8a7b6c-4444-4000-8000-000000000004",
    professional_name: "Adv. Meera Sen",
    bio: "Criminal Defense, Bail Applications, and Human Rights litigation before Calcutta High Court and City Sessions Court.",
    practice_areas: ["Criminal Defense", "Bail Jurisprudence", "Cyber Crime"],
    experience_years: 14,
    city: "Kolkata",
    state: "West Bengal",
    languages: ["English", "Bengali", "Hindi"],
    is_profile_completed: true,
    is_published: false,
    published_at: null,
    published_by: null,
    bar_council_number: "WB/820/2012",
    bar_council_state: "West Bengal",
    bar_council_enrollment_year: 2012,
    created_at: "2026-10-20T06:10:00Z",
    updated_at: "2026-10-20T06:10:00Z",
    verification: {
      id: "v-004",
      lawyer_id: "9f8a7b6c-4444-4000-8000-000000000004",
      status: "pending",
      reviewed_by: null,
      reviewed_at: null,
      lawyer_feedback: null,
      internal_notes: "Identity documents match Bar Council card.",
      submitted_at: "2026-10-20T06:10:00Z",
      created_at: "2026-10-20T06:10:00Z",
      updated_at: "2026-10-20T06:10:00Z",
    },
  },
];

const mockProfiles: UserProfileRecord[] = [
  {
    id: "u-1001-admin",
    full_name: "Administrative Officer",
    phone: "+91 98200 12345",
    avatar_url: null,
    is_active: true,
    created_at: "2026-10-01T00:00:00Z",
    updated_at: "2026-10-20T00:00:00Z",
    roles: ["admin"],
  },
  {
    id: "u-2001-lawyer",
    full_name: "Adv. Rajesh V. Nariman",
    phone: "+91 98111 22334",
    avatar_url: null,
    is_active: true,
    created_at: "2026-10-18T10:14:00Z",
    updated_at: "2026-10-19T08:30:00Z",
    roles: ["lawyer"],
  },
  {
    id: "u-3001-client",
    full_name: "Karan Johar Enterprises Ltd.",
    phone: "+91 97690 99887",
    avatar_url: null,
    is_active: true,
    created_at: "2026-10-16T14:00:00Z",
    updated_at: "2026-10-16T14:00:00Z",
    roles: ["client"],
  },
  {
    id: "u-3002-client",
    full_name: "Vikramaditya Logistics Pvt.",
    phone: "+91 99300 44556",
    avatar_url: null,
    is_active: true,
    created_at: "2026-10-17T09:20:00Z",
    updated_at: "2026-10-17T09:20:00Z",
    roles: ["client"],
  },
];

const mockInvitations: InvitationRecord[] = [
  {
    id: "inv-001",
    email: "senior.partner@shardul-amarchand.law",
    token_hash: "a4f8b2c1d3e5f7a9b0c2d4e6f8a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7",
    status: "pending",
    invited_by: "u-1001-admin",
    expires_at: "2026-11-20T00:00:00Z",
    accepted_at: null,
    accepted_by: null,
    created_at: "2026-10-19T11:00:00Z",
  },
  {
    id: "inv-002",
    email: "managing.counsel@azbpartners.in",
    token_hash: "9b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7a4f8b2c1d3e5f7a9b0c2d4e6f8a",
    status: "accepted",
    invited_by: "u-1001-admin",
    expires_at: "2026-10-25T00:00:00Z",
    accepted_at: "2026-10-18T16:45:00Z",
    accepted_by: "u-2002-lawyer",
    created_at: "2026-10-15T09:30:00Z",
  },
];

const mockAuditLogs: AuditLogRecord[] = [
  {
    id: "aud-001",
    actor_id: "u-1001-admin",
    action: "ROLE_ASSIGNED",
    target_table: "public.user_roles",
    target_id: "u-2001-lawyer",
    metadata: { role: "lawyer", granted_by: "admin-console", ip: "103.21.124.5" },
    ip_address: "103.21.124.5",
    created_at: "2026-10-20T09:15:32Z",
  },
  {
    id: "aud-002",
    actor_id: "u-1001-admin",
    action: "VERIFICATION_APPROVED",
    target_table: "public.lawyer_verifications",
    target_id: "v-002",
    metadata: { lawyer_id: "9f8a7b6c-2222-4000-8000-000000000002", bar_council_number: "MAH/2940/2014" },
    ip_address: "103.21.124.5",
    created_at: "2026-10-19T15:20:10Z",
  },
  {
    id: "aud-003",
    actor_id: "u-1001-admin",
    action: "INVITATION_ISSUED",
    target_table: "public.invitations",
    target_id: "inv-001",
    metadata: { email: "senior.partner@shardul-amarchand.law", digest: "sha256" },
    ip_address: "103.21.124.5",
    created_at: "2026-10-19T11:00:00Z",
  },
];

export default function AdminPreviewPage() {
  const [currentTab, setCurrentTab] = useState<AdminDashboardTab>("overview");

  return (
    <div className="flex h-screen bg-[#09090F] text-[#F5F4FA] overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <AdminSidebar
        currentTab={currentTab}
        pendingCount={mockStats.pendingVerifications}
        userEmail="admin@nyayalink.in"
        userRoles={["admin"]}
        onTabSelect={(tab) => setCurrentTab(tab)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#09090F]">
        <AdminHeader currentTab={currentTab} />

        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {currentTab === "overview" && (
              <OverviewTab
                stats={mockStats}
                recentLawyers={mockLawyers}
                recentAuditLogs={mockAuditLogs}
              />
            )}

            {currentTab === "lawyers" && <LawyersTab initialLawyers={mockLawyers} />}

            {currentTab === "verifications" && (
              <VerificationsTab lawyers={mockLawyers} />
            )}

            {currentTab === "clients" && (
              <ClientsTab initialProfiles={mockProfiles} />
            )}

            {currentTab === "invitations" && (
              <InvitationsTab invitations={mockInvitations} />
            )}

            {currentTab === "audit" && <AuditTab auditLogs={mockAuditLogs} />}

            {currentTab === "settings" && (
              <SettingsTab
                userEmail="admin@nyayalink.in"
                userId="u-1001-admin"
                roles={["admin"]}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
