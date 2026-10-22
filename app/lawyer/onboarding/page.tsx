import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdvocateOnboardingWizard } from "@/components/lawyer/onboarding-wizard";
import Link from "next/link";
import { Scale, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Advocate Onboarding | NyayLink",
  description: "Complete your professional advocate credentials and practice profile on NyayLink.",
};


function OnboardingSkeleton() {
  return (
    <div className="w-full max-w-xl mx-auto space-y-6 animate-pulse">
      <div className="h-16 bg-white rounded-2xl border border-[#D5E5D9]/50" />
      <div className="h-96 bg-white rounded-2xl border border-[#D5E5D9]/50" />
    </div>
  );
}

async function LawyerOnboardingContent() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login?intent=lawyer&next=/lawyer/onboarding");
  }

  // Ensure user has lawyer role assigned via secure RPC
  await supabase.rpc("claim_lawyer_onboarding_role");

  // Fetch existing draft profile and verification status
  const [profileRes, lawyerRes, verifRes] = await Promise.all([
    supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle(),
    supabase.from("lawyer_profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("lawyer_verifications").select("status, submitted_at").eq("lawyer_id", user.id).maybeSingle(),
  ]);

  const initialProfile = {
    professional_name: lawyerRes.data?.professional_name || profileRes.data?.full_name || "",
    phone: lawyerRes.data?.phone || profileRes.data?.phone || "",
    bar_council_number: lawyerRes.data?.bar_council_number || "",
    bar_council_state: lawyerRes.data?.bar_council_state || "Bar Council of Delhi",
    bar_council_enrollment_year: lawyerRes.data?.bar_council_enrollment_year || null,
    city: lawyerRes.data?.city || "",
    state: lawyerRes.data?.state || "",
    practice_areas: lawyerRes.data?.practice_areas || ["Civil Litigation", "Criminal Law"],
    languages: lawyerRes.data?.languages || ["English", "Hindi"],
    experience_years: lawyerRes.data?.experience_years || 5,
    bio: lawyerRes.data?.bio || "",
    is_profile_completed: lawyerRes.data?.is_profile_completed || false,
  };

  const initialVerification = verifRes.data || null;

  return (
    <AdvocateOnboardingWizard
      userId={user.id}
      userEmail={user.email || ""}
      initialProfile={initialProfile}
      initialVerification={initialVerification}
    />
  );
}

export default function LawyerOnboardingPage() {
  return (
    <div className="min-h-screen bg-[#FDFEFC] text-[#202824] antialiased">
      {/* Header Bar */}
      <header className="border-b border-[#D5E5D9] bg-white sticky top-0 z-40 px-4 sm:px-6 py-3.5 shadow-2xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center text-[#205C43]">
              <Scale className="w-4 h-4 text-[#205C43]" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-base font-semibold text-[#202824] leading-tight">
                NyayLink
              </span>
              <span className="text-[10px] font-mono tracking-wider text-[#69736D] uppercase">
                Advocate Onboarding
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF3ED] border border-[#D5E5D9] text-[11px] font-mono text-[#174530]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#205C43]" />
            <span className="hidden sm:inline">BCI Rule 36 Registry</span>
            <span className="sm:hidden">BCI Registry</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        <Suspense fallback={<OnboardingSkeleton />}>
          <LawyerOnboardingContent />
        </Suspense>
      </main>
    </div>
  );
}

