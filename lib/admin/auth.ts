import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import type { UserRole } from "./types";

export type AdminAuthResult =
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
 * Server-side authorization check for NyayaLink Admin Portal.
 * 
 * Security rules:
 * 1. Checks genuine Supabase Auth user session (cannot be spoofed from client).
 * 2. Directly verifies administrative assignment against public.user_roles in PostgreSQL.
 * 3. Supports multi-role users (e.g. users holding both 'client' and 'admin' roles).
 * 4. Never relies on user-editable metadata or client headers.
 * 5. Uses standard authenticated SSR Supabase client obeying RLS policies.
 */
export async function verifyAdminSession(): Promise<AdminAuthResult> {
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
    console.error("[NyayaLink Admin Auth] Failed to fetch user_roles:", roleError?.message);
    return {
      authorized: false,
      reason: "forbidden",
      user,
      roles: [],
      supabase,
    };
  }

  const roles = roleRecords.map((r) => r.role as UserRole);
  const isAdmin = roles.includes("admin");

  if (!isAdmin) {
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
 * Helper to enforce admin authorization in server components or pages.
 * Automatically redirects unauthenticated visitors to login.
 */
export async function requireAdminOrRedirect(nextPath: string = "/admin/dashboard"): Promise<
  | { authorized: true; user: User; roles: UserRole[]; supabase: Awaited<ReturnType<typeof createClient>> }
  | { authorized: false; reason: "forbidden"; user: User; roles: UserRole[]; supabase: Awaited<ReturnType<typeof createClient>> }
> {
  const result = await verifyAdminSession();

  if (!result.authorized) {
    if (result.reason === "unauthenticated") {
      redirect(`/auth/login?next=${encodeURIComponent(nextPath)}`);
    }
    // Return forbidden status so the page can render a dedicated 403 Access Denied view
    return result;
  }

  return result;
}
