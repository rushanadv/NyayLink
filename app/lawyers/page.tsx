import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import {
  LawyerDirectoryClient,
  type PublicLawyer,
} from "@/components/lawyers/lawyer-directory-client";


function LawyersDirectorySkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-pulse">
      <div className="space-y-4 max-w-2xl">
        <div className="h-6 w-48 bg-surface-raised rounded-full" />
        <div className="h-10 w-96 bg-surface-raised rounded-lg" />
        <div className="h-4 w-full bg-surface-raised rounded" />
      </div>

      <div className="h-32 bg-surface-raised rounded-xl border border-border-default" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-72 rounded-xl bg-surface-raised border border-border-default"
          />
        ))}
      </div>
    </div>
  );
}

async function LawyersDirectoryContent({
  initialPracticeArea,
}: {
  initialPracticeArea?: string;
} = {}) {
  let directoryState: "live" | "empty" | "error" = "empty";
  let lawyers: PublicLawyer[] = [];
  let isAuthenticated = false;
  let errorMessage: string | undefined = undefined;

  try {
    const supabase = await createClient();

    // 1. Session check to select appropriate directory view
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      isAuthenticated = !!user;
    } catch (authError) {
      console.warn("[NyayaLink Directory] Auth session check non-fatal warning:", authError);
    }

    // 2. Target view:
    // - Authenticated clients/users access client_lawyer_directory (approved + consented pending advocates)
    // - Unauthenticated visitors access public_lawyer_directory (Rule 36 approved-only advocates)
    const targetTable = isAuthenticated ? "client_lawyer_directory" : "public_lawyer_directory";

    const { data: dbLawyers, error } = await supabase
      .from(targetTable)
      .select(
        "id, professional_name, bio, practice_areas, experience_years, city, state, languages, courts_of_practice, consultation_modes, consultation_fee, verification_status, created_at"
      )
      .order("experience_years", { ascending: false });

    if (error) {
      console.error(`[NyayaLink Server Error] Failed to fetch ${targetTable} from Supabase:`, {
        message: error.message,
        code: error.code,
      });
      directoryState = "error";
      errorMessage = "Unable to connect to the advocate directory registry. Please retry shortly.";
    } else if (dbLawyers && dbLawyers.length > 0) {
      directoryState = "live";
      lawyers = dbLawyers.map((l: Record<string, unknown>) => ({
        ...l,
        verification_status:
          (l.verification_status as string) || (isAuthenticated ? "approved" : "approved"),
      })) as unknown as PublicLawyer[];
    } else {
      // Query succeeded with 0 records
      directoryState = "empty";
    }
  } catch (fatalError: unknown) {
    if (
      typeof fatalError === "object" &&
      fatalError !== null &&
      ((fatalError as { digest?: string }).digest === "HANGING_PROMISE_REJECTION" ||
        (fatalError as { digest?: string }).digest?.startsWith("NEXT_") ||
        (fatalError as { message?: string }).message?.includes("During prerendering"))
    ) {
      throw fatalError;
    }
    const isMissingEnv =
      fatalError instanceof Error &&
      fatalError.message.includes("Supabase environment variables missing");

    directoryState = "error";
    errorMessage = isMissingEnv
      ? "The advocate directory database service is not yet configured. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are added to Vercel Environment Variables."
      : "An exception occurred while initializing the directory service. Please retry shortly.";
  }

  return (
    <LawyerDirectoryClient
      initialLawyers={lawyers}
      isAuthenticated={isAuthenticated}
      directoryState={directoryState}
      errorMessage={errorMessage}
      initialPracticeArea={initialPracticeArea}
    />
  );
}

export default async function LawyersPage(props: {
  searchParams?: Promise<{ practiceArea?: string }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  return (
    <Suspense fallback={<LawyersDirectorySkeleton />}>
      <LawyersDirectoryContent initialPracticeArea={searchParams?.practiceArea} />
    </Suspense>
  );
}
