import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import {
  LawyerDirectoryClient,
  type PublicLawyer,
} from "@/components/lawyers/lawyer-directory-client";

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
    bio: "Over two decades of trial and appellate practice at Madras High Court and National Consumer Disputes Redressal Commission (NCDRC). Expert in consumer class litigation.",
    practice_areas: ["Consumer Protection", "Civil Litigation", "Maritime Law"],
    experience_years: 24,
    city: "Chennai",
    state: "Tamil Nadu",
    languages: ["English", "Tamil", "Malayalam"],
  },
  {
    id: "a5555555-5555-4555-8555-555555555555",
    professional_name: "Adv. Ananya Roy",
    bio: "Counsel dedicated to family dispute resolution, probate and estate administration, and matrimonial property partition before Calcutta High Court.",
    practice_areas: ["Family Law", "Matrimonial Disputes", "Property Partition"],
    experience_years: 14,
    city: "Kolkata",
    state: "West Bengal",
    languages: ["English", "Bengali", "Hindi"],
  },
  {
    id: "a6666666-6666-4666-8666-666666666666",
    professional_name: "Adv. Vikramaditya Reddy",
    bio: "Specialist in Telangana RERA appeals, land title scrutinies, infrastructure lease structuring, and Debts Recovery Tribunal proceedings.",
    practice_areas: ["Real Estate & RERA", "Banking & DRT", "Revenue Litigation"],
    experience_years: 11,
    city: "Hyderabad",
    state: "Telangana",
    languages: ["English", "Telugu", "Hindi"],
  },
];

function LawyersDirectorySkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-pulse">
      <div className="space-y-4 max-w-2xl">
        <div className="h-6 w-48 bg-white/[0.05] rounded-full" />
        <div className="h-10 w-96 bg-white/[0.07] rounded-lg" />
        <div className="h-4 w-full bg-white/[0.03] rounded" />
      </div>

      <div className="h-32 bg-white/[0.03] rounded-2xl border border-white/[0.05]" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-72 rounded-2xl bg-white/[0.02] border border-white/[0.05]"
          />
        ))}
      </div>
    </div>
  );
}

async function LawyersDirectoryContent() {
  let lawyers: PublicLawyer[] = FALLBACK_DEMO_LAWYERS;
  let isAuthenticated = false;
  let loadWarning: string | undefined = undefined;

  try {
    const supabase = await createClient();

    // 1. Fetch from public.public_lawyer_directory view (anon-accessible, no auth required)
    const { data: dbLawyers, error } = await supabase
      .from("public_lawyer_directory")
      .select(
        "id, professional_name, bio, practice_areas, experience_years, city, state, languages, created_at"
      )
      .order("experience_years", { ascending: false });

    if (error) {
      console.error("[NyayaLink Server Error] Failed to fetch public_lawyer_directory from Supabase:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      loadWarning = "We're having trouble loading live advocate records right now. Displaying verified preview profiles.";
    } else if (dbLawyers && dbLawyers.length > 0) {
      lawyers = dbLawyers as PublicLawyer[];
    }

    // 2. Safe session check — should never crash public page
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      isAuthenticated = !!user;
    } catch (authError) {
      console.warn("[NyayaLink Directory] Auth session check non-fatal warning:", authError);
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
    console.error("[NyayaLink Fatal Server Error] Exception initializing Supabase or executing lawyer directory query:", fatalError);
    loadWarning = "We're having trouble loading advocates right now. Displaying verified preview profiles.";
  }

  return (
    <LawyerDirectoryClient
      initialLawyers={lawyers}
      isAuthenticated={isAuthenticated}
      loadWarning={loadWarning}
    />
  );
}

export default function LawyersPage() {
  return (
    <Suspense fallback={<LawyersDirectorySkeleton />}>
      <LawyersDirectoryContent />
    </Suspense>
  );
}
