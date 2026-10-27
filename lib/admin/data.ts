import { createClient } from "@/lib/supabase/server";
import type {
  AdminOverviewStats,
  LawyerProfileRecord,
  LawyerVerificationRecord,
  UserProfileRecord,
  InvitationRecord,
  AuditLogRecord,
  UserRole,
} from "./types";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Fetch real database-driven counts for admin overview metrics.
 * Runs authenticated under the admin's session, respecting RLS.
 */
export async function fetchAdminStats(supabase: SupabaseServerClient): Promise<AdminOverviewStats> {
  const [
    usersRes,
    lawyersRes,
    pendingVerifRes,
    approvedVerifRes,
    invitationsRes,
    clientsRes,
    auditRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("lawyer_profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("admin_lawyer_verifications")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("admin_lawyer_verifications")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved"),
    supabase.from("invitations").select("*", { count: "exact", head: true }),
    supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "client"),
    supabase.from("audit_logs").select("*", { count: "exact", head: true }),
  ]);

  return {
    totalUsers: usersRes.count ?? 0,
    totalLawyers: lawyersRes.count ?? 0,
    pendingVerifications: pendingVerifRes.count ?? 0,
    approvedLawyers: approvedVerifRes.count ?? 0,
    totalInvitations: invitationsRes.count ?? 0,
    activeClients: clientsRes.count ?? 0,
    recentAuditCount: auditRes.count ?? 0,
  };
}

/**
 * Fetch lawyer profiles joined with admin-accessible verification review details.
 * Retrieves sensitive internal_notes via the security barrier view public.admin_lawyer_verifications.
 */
export async function fetchLawyersWithVerifications(
  supabase: SupabaseServerClient
): Promise<LawyerProfileRecord[]> {
  const [lawyersRes, verifRes] = await Promise.all([
    supabase
      .from("lawyer_profiles")
      .select(`
        id,
        professional_name,
        bio,
        practice_areas,
        experience_years,
        city,
        state,
        languages,
        is_profile_completed,
        is_published,
        published_at,
        published_by,
        bar_council_number,
        bar_council_state,
        bar_council_enrollment_year,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false }),
    supabase
      .from("admin_lawyer_verifications")
      .select(`
        id,
        lawyer_id,
        status,
        reviewed_by,
        reviewed_at,
        lawyer_feedback,
        internal_notes,
        submitted_at,
        created_at,
        updated_at
      `),
  ]);

  if (lawyersRes.error) {
    console.error("[NyayaLink Admin Data] Error fetching lawyer profiles:", lawyersRes.error.message);
    return [];
  }

  const verifMap = new Map<string, LawyerVerificationRecord>();
  if (verifRes.data) {
    for (const v of verifRes.data) {
      verifMap.set(v.lawyer_id, v as LawyerVerificationRecord);
    }
  }

  return (lawyersRes.data || []).map((lawyer) => ({
    ...(lawyer as LawyerProfileRecord),
    verification: verifMap.get(lawyer.id) || null,
  }));
}

/**
 * Fetch registered user profiles and their assigned roles from public.user_roles.
 */
export async function fetchUserProfilesWithRoles(
  supabase: SupabaseServerClient
): Promise<UserProfileRecord[]> {
  const [profilesRes, rolesRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, phone, avatar_url, is_active, created_at, updated_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("user_roles")
      .select("user_id, role, assigned_at, assigned_by"),
  ]);

  if (profilesRes.error) {
    console.error("[NyayaLink Admin Data] Error fetching profiles:", profilesRes.error.message);
    return [];
  }

  const roleMap = new Map<string, UserRole[]>();
  if (rolesRes.data) {
    for (const r of rolesRes.data) {
      const existing = roleMap.get(r.user_id) || [];
      existing.push(r.role as UserRole);
      roleMap.set(r.user_id, existing);
    }
  }

  return (profilesRes.data || []).map((p) => ({
    ...(p as UserProfileRecord),
    roles: roleMap.get(p.id) || [],
  }));
}

/**
 * Fetch invitations issued by administrators.
 */
export async function fetchInvitations(supabase: SupabaseServerClient): Promise<InvitationRecord[]> {
  const { data, error } = await supabase
    .from("invitations")
    .select("id, email, token_hash, status, invited_by, expires_at, accepted_at, accepted_by, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[NyayaLink Admin Data] Error fetching invitations:", error.message);
    return [];
  }

  return (data || []) as InvitationRecord[];
}

/**
 * Fetch recent append-only audit log events.
 */
export async function fetchAuditLogs(
  supabase: SupabaseServerClient,
  limit: number = 50
): Promise<AuditLogRecord[]> {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("id, actor_id, action, target_table, target_id, metadata, ip_address, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[NyayaLink Admin Data] Error fetching audit logs:", error.message);
    return [];
  }

  return (data || []) as AuditLogRecord[];
}

/**
 * Fetch legal source documents, provisions, and ingestion runs for admin management.
 */
export async function fetchLegalSourcesData(supabase: SupabaseServerClient) {
  try {
    const [docsRes, provsRes, runsRes] = await Promise.all([
      supabase.from("legal_source_documents").select("*").order("act_year", { ascending: false }),
      supabase.from("legal_source_provisions").select("*").order("provision_identifier", { ascending: true }),
      supabase.from("legal_source_ingestion_runs").select("*").order("created_at", { ascending: false }).limit(10),
    ]);

    const { CANONICAL_DOCUMENTS, CANONICAL_PROVISIONS } = await import("@/lib/legal/canonical-registry");

    const documents = docsRes.data && docsRes.data.length > 0 ? docsRes.data : CANONICAL_DOCUMENTS;
    const provisions = provsRes.data && provsRes.data.length > 0 ? provsRes.data : CANONICAL_PROVISIONS;
    const ingestionRuns = runsRes.data || [];

    return {
      documents,
      provisions,
      ingestionRuns,
      isLiveDb: Boolean(docsRes.data && docsRes.data.length > 0),
    };
  } catch (err) {
    console.error("[NyayaLink Admin Data] Error fetching legal sources:", err);
    const { CANONICAL_DOCUMENTS, CANONICAL_PROVISIONS } = await import("@/lib/legal/canonical-registry");
    return {
      documents: CANONICAL_DOCUMENTS,
      provisions: CANONICAL_PROVISIONS,
      ingestionRuns: [],
      isLiveDb: false,
    };
  }
}

