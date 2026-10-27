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

  // 2. Query target directory views
  // - Verified profiles (approved + published) are discoverable by everyone via public_lawyer_directory / client_lawyer_directory
  // - Profiles Under Review (pending + published) are ONLY accessible to authenticated clients via client_under_review_directory
  let profileRecord: any = null;

  let verifiedRecord: any = null;

  const verifiedRes = await supabase
    .from("public_lawyer_directory")
    .select(
      "id, professional_name, bio, practice_areas, experience_years, city, state, languages, courts_of_practice, consultation_modes, consultation_fee, office_address, verification_status, verified_at, created_at"
    )
    .eq("id", id)
    .eq("verification_status", "approved")
    .maybeSingle();

  if (!verifiedRes.error && verifiedRes.data) {
    verifiedRecord = verifiedRes.data;
  } else {
    const baseRes = await supabase
      .from("public_lawyer_directory")
      .select(
        "id, professional_name, bio, practice_areas, experience_years, city, state, languages, courts_of_practice, consultation_modes, consultation_fee, office_address, verification_status, created_at"
      )
      .eq("id", id)
      .eq("verification_status", "approved")
      .maybeSingle();
    if (baseRes.data) {
      verifiedRecord = {
        ...baseRes.data,
        verified_at: null,
      };
    }
  }

  if (verifiedRecord) {
    profileRecord = verifiedRecord;
  } else if (isAuthenticated) {
    // If not found in verified and user is authenticated, check Profiles Under Review
    const { data: underReviewRecord, error: underReviewErr } = await supabase
      .from("client_under_review_directory")
      .select(
        "id, professional_name, bio, practice_areas, experience_years, city, state, languages, courts_of_practice, consultation_modes, consultation_fee, office_address, verification_status, created_at"
      )
      .eq("id", id)
      .eq("verification_status", "pending")
      .maybeSingle();

    if (underReviewRecord) {
      profileRecord = {
        ...underReviewRecord,
        // Server-side enforcement: consultation_fee must be null for pending profiles
        consultation_fee: null,
      };
    } else {
      // Fallback check against client_lawyer_directory in case new view is not yet indexed
      const { data: fallbackRecord } = await supabase
        .from("client_lawyer_directory")
        .select(
          "id, professional_name, bio, practice_areas, experience_years, city, state, languages, courts_of_practice, consultation_modes, consultation_fee, office_address, verification_status, created_at"
        )
        .eq("id", id)
        .eq("verification_status", "pending")
        .maybeSingle();

      if (fallbackRecord) {
        profileRecord = {
          ...fallbackRecord,
          consultation_fee: null,
        };
      }
    }
  }

  // If still not found (or unauthenticated visitor trying to view a pending profile)
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
    verification_status: profileRecord.verification_status === "pending" ? "pending" : "approved",
    verified_at: profileRecord.verified_at || null,
    courts_of_practice: profileRecord.courts_of_practice || [],
    consultation_modes: profileRecord.consultation_modes || ["Online Video Consultation", "In-Chambers Consultation"],
    consultation_fee: profileRecord.verification_status === "pending" ? null : (profileRecord.consultation_fee || null),
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
