export type UserRole = "client" | "lawyer" | "admin";

export interface UserRoleRecord {
  id?: string;
  user_id: string;
  role: UserRole;
  assigned_at: string;
  assigned_by: string | null;
}

export interface UserProfileRecord {
  id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  roles?: UserRole[];
}

export interface LawyerVerificationRecord {
  id: string;
  lawyer_id: string;
  status: "pending" | "approved" | "rejected" | "changes_requested";
  reviewed_by: string | null;
  reviewed_at: string | null;
  lawyer_feedback: string | null;
  internal_notes: string | null;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export interface LawyerProfileRecord {
  id: string;
  professional_name: string;
  bio: string | null;
  practice_areas: string[];
  experience_years: number;
  city: string;
  state: string;
  languages: string[];
  is_profile_completed: boolean;
  is_published: boolean;
  published_at: string | null;
  published_by: string | null;
  bar_council_number: string;
  bar_council_state: string;
  bar_council_enrollment_year: number;
  created_at: string;
  updated_at: string;
  verification?: LawyerVerificationRecord | null;
}

export interface InvitationRecord {
  id: string;
  email: string;
  token_hash: string;
  status: "pending" | "accepted" | "revoked" | "expired";
  invited_by: string;
  expires_at: string;
  accepted_at: string | null;
  accepted_by: string | null;
  created_at: string;
  updated_at?: string;
}

export interface AuditLogRecord {
  id: string;
  actor_id: string | null;
  action: string;
  target_table: string;
  target_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

export interface AdminOverviewStats {
  totalUsers: number;
  totalLawyers: number;
  pendingVerifications: number;
  approvedLawyers: number;
  totalInvitations: number;
  activeClients: number;
  recentAuditCount: number;
}

export type AdminDashboardTab =
  | "overview"
  | "lawyers"
  | "verifications"
  | "clients"
  | "invitations"
  | "audit"
  | "settings";
