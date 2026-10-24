import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  LawyerProfileView,
  type DetailedLawyerProfile,
} from "@/components/lawyers/lawyer-profile-view";

export const instant = false;

function LawyerProfileSkeleton() {
  return (
    <div className="min-h-screen bg-surface-subtle py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="h-6 w-36 bg-surface-raised rounded-md" />
        <div className="bg-surface-raised border border-border-default rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex gap-6 items-center">
            <div className="w-20 h-20 rounded-2xl bg-surface-base" />
            <div className="space-y-3 flex-1">
              <div className="h-8 w-64 bg-surface-base rounded-lg" />
              <div className="h-5 w-40 bg-surface-base rounded" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-surface-raised rounded-2xl border border-border-default" />
            <div className="h-64 bg-surface-raised rounded-2xl border border-border-default" />
          </div>
          <div className="h-96 bg-surface-raised rounded-2xl border border-border-default" />
        </div>
      </div>
    </div>
  );
}

async function LawyerDetailContent({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  const { id } = await paramsPromise;

  if (!id) {
    notFound();
  }

  const supabase = await createClient();

  // 1. Session check to determine directory scope
  let isAuthenticated = false;
  let userEmail: string | undefined = undefined;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isAuthenticated = !!user;
    userEmail = user?.email || undefined;
  } catch (authError) {
    console.warn("[NyayLink Profile] Session evaluation non-fatal warning:", authError);
  }

  // 2. Query target view based on authentication state
  // Authenticated clients/lawyers access client_lawyer_directory (approved + pending advocates)
  // Unauthenticated visitors access public_lawyer_directory (approved-only)
  const targetView = isAuthenticated ? "client_lawyer_directory" : "public_lawyer_directory";

  const { data: profileRecord, error: profileErr } = await supabase
    .from(targetView)
    .select(
      "id, professional_name, bio, practice_areas, experience_years, city, state, languages, courts_of_practice, consultation_modes, consultation_fee, office_address, verification_status, created_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (profileErr) {
    console.error(`[NyayLink Profile Error] Failed to fetch lawyer ${id} from ${targetView}:`, profileErr);
  }

  if (!profileRecord) {
    notFound();
  }

  // 3. Query public education and qualifications
  const [eduRes, qualRes] = await Promise.all([
    supabase
      .from("lawyer_educations")
      .select("id, degree, institution, field_of_study, graduation_year")
      .eq("lawyer_id", id)
      .eq("is_public", true)
      .order("graduation_year", { ascending: false }),
    supabase
      .from("lawyer_qualifications")
      .select("id, title, issuing_authority, issue_date, verification_status")
      .eq("lawyer_id", id)
      .eq("is_public", true)
      .order("issue_date", { ascending: false, nullsFirst: false }),
  ]);

  const detailedProfile: DetailedLawyerProfile = {
    id: profileRecord.id,
    professional_name: profileRecord.professional_name,
    bio: profileRecord.bio,
    practice_areas: profileRecord.practice_areas || [],
    experience_years: profileRecord.experience_years || 0,
    city: profileRecord.city,
    state: profileRecord.state,
    languages: profileRecord.languages || [],
    verification_status: profileRecord.verification_status || (isAuthenticated ? "pending" : "approved"),
    courts_of_practice: profileRecord.courts_of_practice || [],
    consultation_modes: profileRecord.consultation_modes || ["Online Video Consultation", "In-Chambers Consultation"],
    consultation_fee: profileRecord.consultation_fee || null,
    office_address: profileRecord.office_address || null,
    created_at: profileRecord.created_at,
    educations: eduRes.data || [],
    qualifications: qualRes.data || [],
  };

  return (
    <LawyerProfileView
      lawyer={detailedProfile}
      isAuthenticated={isAuthenticated}
      userEmail={userEmail}
    />
  );
}

interface LawyerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function LawyerDetailPage({ params }: LawyerDetailPageProps) {
  return (
    <Suspense fallback={<LawyerProfileSkeleton />}>
      <LawyerDetailContent paramsPromise={params} />
    </Suspense>
  );
}
