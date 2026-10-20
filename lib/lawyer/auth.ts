import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import type { UserRole } from "@/lib/admin/types";

export type LawyerAuthResult =
  | {
      authorized: true;
      user: User;
      roles: UserRole[];
      supabase: Awaited<ReturnType<typeof createClient>>;
    }
  | {
      authorized: false;
      reason: "unauthenticated";
      user: null;
      roles: [];
      supabase: Awaited<ReturnType<typeof createClient>>;
    }
  | {
      authorized: false;
      reason: "forbidden";
      user: User;
      roles: UserRole[];
      supabase: Awaited<ReturnType<typeof createClient>>;
    };

/**
 * Server-side authorization check for NyayaLink Lawyer Workspace.
 * 
 * Security rules:
 * 1. Checks authentic Supabase Auth session via getUser().
 * 2. Directly verifies 'lawyer' (or 'admin') role against public.user_roles in PostgreSQL.
 * 3. Never trusts client headers or metadata.
 */
export async function verifyLawyerSession(): Promise<LawyerAuthResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      authorized: false,
      reason: "unauthenticated",
      user: null,
      roles: [],
      supabase,
    };
  }

  // Query actual assigned roles from public.user_roles
  const { data: roleRecords, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  if (roleError || !roleRecords) {
    console.error("[NyayaLink Lawyer Auth] Failed to fetch user_roles:", roleError?.message);
    return {
      authorized: false,
      reason: "forbidden",
      user,
      roles: [],
      supabase,
    };
  }

  const roles = roleRecords.map((r) => r.role as UserRole);
  const isLawyer = roles.includes("lawyer") || roles.includes("admin");

  if (!isLawyer) {
    return {
      authorized: false,
      reason: "forbidden",
      user,
      roles,
      supabase,
    };
  }

  return {
    authorized: true,
    user,
    roles,
    supabase,
  };
}

/**
 * Helper to enforce lawyer authorization in server components or pages.
 * Automatically redirects unauthenticated visitors to login with intent=lawyer.
 */
export async function requireLawyerOrRedirect(
  nextPath: string = "/lawyer/dashboard"
): Promise<
  | { authorized: true; user: User; roles: UserRole[]; supabase: Awaited<ReturnType<typeof createClient>> }
  | { authorized: false; reason: "forbidden"; user: User; roles: UserRole[]; supabase: Awaited<ReturnType<typeof createClient>> }
> {
  const result = await verifyLawyerSession();

  if (!result.authorized) {
    if (result.reason === "unauthenticated") {
      redirect(`/auth/login?intent=lawyer&next=${encodeURIComponent(nextPath)}`);
    }
    return result;
  }

  return result;
}
