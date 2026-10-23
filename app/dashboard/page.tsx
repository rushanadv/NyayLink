import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClientShell } from "@/components/client/client-shell";
import { LegalMatter, ConsultationRequest, UserProfile } from "@/lib/portal/types";
import { PublicLawyer } from "@/components/lawyers/lawyer-directory-client";

function ClientDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#FDFEFC] text-[#202824] p-6 animate-pulse">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-10 w-48 bg-[#D5E5D9]/40 rounded-xl" />
        <div className="h-40 bg-[#EAF3ED]/50 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
          <div className="h-32 bg-[#D5E5D9]/30 rounded-2xl" />
          <div className="h-32 bg-[#D5E5D9]/30 rounded-2xl" />
          <div className="h-32 bg-[#D5E5D9]/30 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

async function ClientDashboardContent({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const supabase = await createClient();

  // 1. Authenticate user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login?intent=client&next=/dashboard");
  }

  // 2. Verify roles: strictly enforce lawyer -> lawyer dashboard
  const { data: roleRecords } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  const roles = roleRecords?.map((r) => r.role) || ["client"];
  if (roles.includes("lawyer") && !roles.includes("client") && !roles.includes("admin")) {
    redirect("/lawyer/dashboard");
  }

  // 3. Resolve navigation tab
  const resolvedParams = (await searchParams) || {};
  const initialTab = resolvedParams.tab || "overview";

  // 4. Fetch real database entities under RLS in parallel
  // Authenticated client accesses client_lawyer_directory (approved + consented pending advocates)
  const [profileRes, mattersRes, consultationsRes, directoryRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("legal_matters")
      .select("*, matter_updates(*)")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("consultation_requests")
      .select("*, lawyer:lawyer_profiles(id, professional_name, city, practice_areas)")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("client_lawyer_directory")
      .select("id, professional_name, bio, practice_areas, experience_years, city, state, languages, verification_status, created_at")
      .order("experience_years", { ascending: false }),
  ]);

  const profile = (profileRes.data as UserProfile | null) || null;
  const matters = (mattersRes.data as LegalMatter[]) || [];
  const consultations = (consultationsRes.data as ConsultationRequest[]) || [];
  const advocates: PublicLawyer[] =
    directoryRes.data && directoryRes.data.length > 0
      ? (directoryRes.data as PublicLawyer[])
      : [];

  const displayName =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Client";

  return (
    <ClientShell
      displayName={displayName}
      userEmail={user.email || ""}
      userId={user.id}
      profile={profile}
      matters={matters}
      consultations={consultations}
      advocates={advocates}
      initialTab={initialTab}
    />
  );
}

export default async function ClientDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  return (
    <Suspense fallback={<ClientDashboardSkeleton />}>
      <ClientDashboardContent searchParams={searchParams} />
    </Suspense>
  );
}
