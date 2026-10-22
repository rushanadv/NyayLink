import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserRole } from "@/lib/admin/types";

/**
 * Determines the target dashboard route based on the user's ACTUAL roles from public.user_roles.
 * 
 * Strict Role Priority Hierarchy:
 * 1. 'admin'  → /admin/dashboard
 * 2. 'lawyer' → /lawyer/dashboard (or /lawyer/onboarding if profile is incomplete)
 * 3. 'client' → /dashboard (default for clients and general signups)
 */
export async function getPostLoginRedirectPath(
  supabase: SupabaseClient,
  userId: string
): Promise<string> {
  try {
    const { data: roleRecords, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (error || !roleRecords || roleRecords.length === 0) {
      return "/dashboard";
    }

    const roles = roleRecords.map((r) => r.role as UserRole);

    // 1. Admin priority
    if (roles.includes("admin")) {
      return "/admin/dashboard";
    }

    // 2. Lawyer priority
    if (roles.includes("lawyer")) {
      const { data: lawyerProfile } = await supabase
        .from("lawyer_profiles")
        .select("is_profile_completed")
        .eq("id", userId)
        .maybeSingle();

      if (!lawyerProfile || !lawyerProfile.is_profile_completed) {
        return "/lawyer/onboarding";
      }

      return "/lawyer/dashboard";
    }

    // 3. Client default
    return "/dashboard";
  } catch (err) {
    console.error("[PostLoginRedirect] Error fetching user roles:", err);
    return "/dashboard";
  }
}

