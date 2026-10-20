import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserRole } from "@/lib/admin/types";

/**
 * Determines the target dashboard route based on the user's ACTUAL roles from public.user_roles.
 * 
 * Strict Role Priority Hierarchy:
 * 1. 'admin'  → /admin/dashboard
 * 2. 'lawyer' → /lawyer/dashboard
 * 3. 'client' → /dashboard (default for clients and new signups)
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

    // Prioritize admin > lawyer > client
    if (roles.includes("admin")) {
      return "/admin/dashboard";
    }

    if (roles.includes("lawyer")) {
      return "/lawyer/dashboard";
    }

    return "/dashboard";
  } catch (err) {
    console.error("[PostLoginRedirect] Error fetching user roles:", err);
    return "/dashboard";
  }
}
