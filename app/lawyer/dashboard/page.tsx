import { Suspense } from "react";
import { requireLawyerOrRedirect } from "@/lib/lawyer/auth";
import { LawyerShell } from "@/components/lawyer/lawyer-shell";
import {
  LegalMatter,
  ConsultationRequest,
  LawyerProfileData,
  LawyerVerificationData,
} from "@/lib/portal/types";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

function LawyerDashboardSkeleton() {
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

async function LawyerDashboardContent({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const authResult = await requireLawyerOrRedirect("/lawyer/dashboard");

  if (!authResult.authorized) {
    return (
      <div className="min-h-screen bg-[#FDFEFC] text-[#202824] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white border border-[#D5E5D9] text-center space-y-5 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-semibold text-[#202824]">
              Advocate Role Required
            </h1>
            <p className="text-xs text-[#69736D] mt-2 leading-relaxed">
              Your account does not possess the verified &apos;lawyer&apos; role in the Bar Council registry. To access the advocate chambers portal, sign in with an advocate account.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/dashboard"
              className="px-4 py-2.5 rounded-xl bg-[#205C43] hover:bg-[#174530] text-xs font-semibold text-white transition-colors shadow-xs"
            >
              Go to Client Dashboard
            </Link>
            <Link
              href="/auth/login?role=lawyer"
              className="px-4 py-2 rounded-xl text-xs text-[#69736D] hover:text-[#202824] transition-colors"
            >
              Switch to Lawyer Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { user, supabase } = authResult;
  const resolvedParams = (await searchParams) || {};
  const initialTab = resolvedParams.tab || "overview";

  // Fetch lawyer profile, verification status, matters, and consultation requests under RLS
  const [profileRes, verifRes, mattersRes, requestsRes] = await Promise.all([
    supabase.from("lawyer_profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("lawyer_verifications").select("*").eq("lawyer_id", user.id).maybeSingle(),
    supabase
      .from("legal_matters")
      .select("*, matter_updates(*)")
      .eq("assigned_lawyer_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("consultation_requests")
      .select("*")
      .eq("lawyer_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const lawyerProfile = (profileRes.data as LawyerProfileData | null) || null;
  const verification = (verifRes.data as LawyerVerificationData | null) || null;
  const rawMatters = (mattersRes.data as LegalMatter[]) || [];
  const rawRequests = (requestsRes.data as ConsultationRequest[]) || [];

  // Enrich client details if available
  const clientIds = Array.from(
    new Set([
      ...rawMatters.map((m) => m.client_id),
      ...rawRequests.map((r) => r.client_id),
    ])
  ).filter(Boolean);

  const clientMap: Record<string, { full_name?: string; phone?: string }> = {};
  if (clientIds.length > 0) {
    const { data: clientProfiles } = await supabase
      .from("profiles")
      .select("id, full_name, phone")
      .in("id", clientIds);

    if (clientProfiles) {
      clientProfiles.forEach((cp) => {
        clientMap[cp.id] = {
          full_name: cp.full_name || undefined,
          phone: cp.phone || undefined,
        };
      });
    }
  }

  const matters: LegalMatter[] = rawMatters.map((m) => ({
    ...m,
    client: clientMap[m.client_id] || null,
  }));

  const consultations: ConsultationRequest[] = rawRequests.map((r) => ({
    ...r,
    client: clientMap[r.client_id] || null,
  }));

  const displayName =
    lawyerProfile?.professional_name ||
    user.user_metadata?.full_name ||
    "Advocate";

  return (
    <LawyerShell
      displayName={displayName}
      userEmail={user.email || ""}
      userId={user.id}
      lawyerProfile={lawyerProfile}
      verification={verification}
      matters={matters}
      consultations={consultations}
      initialTab={initialTab}
    />
  );
}

export default async function LawyerDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  return (
    <Suspense fallback={<LawyerDashboardSkeleton />}>
      <LawyerDashboardContent searchParams={searchParams} />
    </Suspense>
  );
}
