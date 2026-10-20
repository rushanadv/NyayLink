import { Suspense } from "react";
import { requireLawyerOrRedirect } from "@/lib/lawyer/auth";
import Link from "next/link";
import { Scale, Briefcase, Calendar, ShieldCheck, ArrowLeft, LogOut } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";

function LawyerDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#090B10] text-[#F5F4FA] font-sans p-6 animate-pulse">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-8 w-44 bg-white/[0.05] rounded" />
        <div className="h-10 w-72 bg-white/[0.07] rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6">
          <div className="h-44 bg-white/[0.03] rounded-2xl" />
          <div className="h-44 bg-white/[0.03] rounded-2xl" />
          <div className="h-44 bg-white/[0.03] rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

async function LawyerDashboardContent() {
  const authResult = await requireLawyerOrRedirect("/lawyer/dashboard");

  if (!authResult.authorized) {
    return (
      <div className="min-h-screen bg-[#09090F] text-[#F5F4FA] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full p-8 rounded-2xl bg-[#111119] border border-white/[0.08] text-center space-y-5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">
              Advocate Verification Required
            </h1>
            <p className="text-xs text-[#A5A3B2] mt-2 leading-relaxed">
              Your account is registered, but the &apos;lawyer&apos; role is not yet activated.
              In compliance with the Advocates Act, 1961, your State Bar Council enrollment
              number must be verified before accessing the advocate chambers.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/dashboard"
              className="px-4 py-2.5 rounded-lg bg-[#191923] hover:bg-[#22212D] text-xs font-medium text-white transition-colors border border-white/[0.08]"
            >
              Go to Client Dashboard
            </Link>
            <Link
              href="/"
              className="px-4 py-2 rounded-lg text-xs text-[#A5A3B2] hover:text-white transition-colors"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { user, roles } = authResult;
  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Advocate";

  return (
    <div className="min-h-screen bg-[#090B10] text-[#F5F4FA] font-sans">
      {/* Top Header */}
      <header className="border-b border-white/[0.08] bg-[#0C0F17]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group text-white">
            <div className="w-8 h-8 rounded-lg bg-[#C5A059]/15 border border-[#C5A059]/30 flex items-center justify-center text-[#DFBE7E]">
              <Scale className="w-4 h-4" />
            </div>
            <span className="font-serif text-lg font-medium tracking-tight">NyayaLink</span>
          </Link>
          <div className="h-4 w-px bg-white/10 mx-1" />
          <span className="text-xs font-mono text-[#C5A059] px-2 py-0.5 rounded bg-[#C5A059]/10 border border-[#C5A059]/20 uppercase">
            Advocate Workspace
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="text-[#A5A3B2] hidden sm:inline">
            Logged in as <strong className="text-white">{displayName}</strong>
          </span>
          <LogoutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#C5A059]">
            Advocate Chambers · Coming Soon
          </span>
          <h1 className="text-3xl font-serif text-white font-normal mt-1">
            Welcome, Adv. {displayName}
          </h1>
          <p className="text-sm text-[#A5A3B2] mt-2 max-w-2xl leading-relaxed">
            Your verified practice portal is being prepared. You hold the following roles in our registry:{" "}
            <span className="font-mono text-[#DFBE7E]">{roles.join(", ")}</span>.
          </p>
        </div>

        {/* Feature Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-[#0C0F17] border border-white/[0.08] space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center text-[#C5A059]">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Daily Cause List</h3>
            <p className="text-xs text-[#A5A3B2] leading-relaxed">
              Automated e-Courts synchronization for your item numbers across High Courts and District Benches.
            </p>
            <span className="inline-block text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
              Module In Development
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#0C0F17] border border-white/[0.08] space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center text-[#C5A059]">
              <Briefcase className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Active Case Vault</h3>
            <p className="text-xs text-[#A5A3B2] leading-relaxed">
              Encrypted case repositories, digital Vakalatnama signing with Aadhaar e-Sign, and verified client intake.
            </p>
            <span className="inline-block text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
              Module In Development
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#0C0F17] border border-white/[0.08] space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center text-[#C5A059]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Bar Council Roll</h3>
            <p className="text-xs text-[#A5A3B2] leading-relaxed">
              State Bar Council credentials validated. In full compliance with Section 36 of the Advocates Act, 1961.
            </p>
            <span className="inline-block text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
              Verified Status
            </span>
          </div>
        </div>

        <div className="pt-4 flex items-center gap-4 text-xs text-[#A5A3B2]">
          <Link href="/" className="hover:text-white flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to NyayaLink Homepage
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function LawyerDashboardPage() {
  return (
    <Suspense fallback={<LawyerDashboardSkeleton />}>
      <LawyerDashboardContent />
    </Suspense>
  );
}

