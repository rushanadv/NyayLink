import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClientShell } from "@/components/client/client-shell";
import { LegalMatter, ConsultationRequest, UserProfile } from "@/lib/portal/types";
import { PublicLawyer } from "@/components/lawyers/lawyer-directory-client";

// Realistic fallback demo data if seed.sql has not yet been executed on the target database
const FALLBACK_DEMO_LAWYERS: PublicLawyer[] = [
  {
    id: "a1111111-1111-4111-8111-111111111111",
    professional_name: "Adv. Rajesh Sharma",
    bio: "Senior litigator practicing before the Supreme Court of India and Delhi High Court. Specialized in commercial disputes, criminal appeals, and fundamental rights writs.",
    practice_areas: ["Constitutional Law", "Criminal Defense", "Civil Appeals"],
    experience_years: 18,
    city: "New Delhi",
    state: "Delhi",
    languages: ["English", "Hindi", "Punjabi"],
  },
  {
    id: "a2222222-2222-4222-8222-222222222222",
    professional_name: "Adv. Meera Sen",
    bio: "Chambers lead focusing on cross-border arbitration, NCLT corporate insolvency proceedings, and company law before the Bombay High Court.",
    practice_areas: ["Corporate & Commercial", "Insolvency & Bankruptcy (NCLT)", "Arbitration"],
    experience_years: 12,
    city: "Mumbai",
    state: "Maharashtra",
    languages: ["English", "Hindi", "Marathi", "Bengali"],
  },
  {
    id: "a3333333-3333-4333-8333-333333333333",
    professional_name: "Adv. Arvind Swaminathan",
    bio: "Advising founders, product engineers, and enterprises on software patent litigation, digital copyright, and technology contract enforcement before Karnataka High Court.",
    practice_areas: ["Technology & IP", "Cyber Crime", "Contract Disputes"],
    experience_years: 9,
    city: "Bengaluru",
    state: "Karnataka",
    languages: ["English", "Kannada", "Tamil", "Hindi"],
  },
  {
    id: "a4444444-4444-4444-8444-444444444444",
    professional_name: "Adv. K. K. Venugopalan",
    bio: "Trial and appellate practice at Madras High Court and National Consumer Disputes Redressal Commission (NCDRC). Expert in consumer class litigation.",
    practice_areas: ["Consumer Protection", "Civil Litigation", "Maritime Law"],
    experience_years: 24,
    city: "Chennai",
    state: "Tamil Nadu",
    languages: ["English", "Tamil", "Malayalam"],
  },
];

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
      .from("public_lawyer_directory")
      .select("id, professional_name, bio, practice_areas, experience_years, city, state, languages, created_at")
      .order("experience_years", { ascending: false }),
  ]);

  const profile = (profileRes.data as UserProfile | null) || null;
  const matters = (mattersRes.data as LegalMatter[]) || [];
  const consultations = (consultationsRes.data as ConsultationRequest[]) || [];
  const advocates: PublicLawyer[] =
    directoryRes.data && directoryRes.data.length > 0
      ? (directoryRes.data as PublicLawyer[])
      : FALLBACK_DEMO_LAWYERS;

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
