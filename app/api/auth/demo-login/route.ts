import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // Demo login is permitted in non-production, or if explicitly enabled by server env
    const isDemoEnabled =
      process.env.NODE_ENV !== "production" ||
      process.env.ENABLE_DEMO_LOGIN === "true";

    if (!isDemoEnabled) {
      return NextResponse.json(
        { error: "Demo authentication is disabled in this environment." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const role = body.role === "lawyer" ? "lawyer" : "client";

    const email =
      role === "lawyer"
        ? process.env.DEMO_LAWYER_EMAIL || "demo.lawyer@nyay.live"
        : process.env.DEMO_CLIENT_EMAIL || "demo.client@nyay.live";

    const password =
      role === "lawyer"
        ? process.env.DEMO_LAWYER_PASSWORD || "NyayLink#DemoLawyer2026!"
        : process.env.DEMO_CLIENT_PASSWORD || "NyayLink#DemoClient2026!";

    // Create server-side SSR client that binds session cookies into the response
    const supabase = await createClient();

    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError || !signInData.user) {
      console.error("[Demo Login Error]:", signInError?.message);
      return NextResponse.json(
        { error: signInError?.message || "Failed to authenticate demo user." },
        { status: 401 }
      );
    }

    // Verify user's actual database role under server-side security boundary
    const { data: roleRecords, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", signInData.user.id);

    if (roleError) {
      console.error("[Demo Login Role Error]:", roleError.message);
    }

    const userRoles = roleRecords?.map((r) => r.role) || [];

    let targetPath = "/dashboard";
    if (role === "lawyer" && userRoles.includes("lawyer")) {
      targetPath = "/lawyer/dashboard";
    } else if (userRoles.includes("admin")) {
      targetPath = "/admin/dashboard";
    }

    return NextResponse.json({
      success: true,
      role,
      user: {
        id: signInData.user.id,
        email: signInData.user.email,
      },
      redirectUrl: targetPath,
    });
  } catch (err: unknown) {
    console.error("[Demo Login Exception]:", err);
    return NextResponse.json(
      { error: "Internal server error during demo authentication." },
      { status: 500 }
    );
  }
}
