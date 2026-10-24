import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileCompletionExperience } from "@/components/lawyer/profile-completion-experience";
import { getAdvocateFullProfile } from "@/app/actions/advocate-profile";
import { ShieldCheck } from "lucide-react";
import { NyayLinkLogo } from "@/components/ui/nyaylink-logo";

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

  const fullProfile = await getAdvocateFullProfile();

  return (
    <ProfileCompletionExperience
      initialData={fullProfile}
      onCompleteRedirect="/lawyer/dashboard"
    />
  );
}

export default function LawyerOnboardingPage() {
  return (
    <div className="min-h-screen bg-[#FDFEFC] text-[#202824] antialiased">
      {/* Header Bar */}
      <header className="border-b border-[#D5E5D9] bg-white sticky top-0 z-40 px-4 sm:px-6 py-3.5 shadow-2xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <NyayLinkLogo size="sm" subtitle="Advocate Onboarding" />

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

