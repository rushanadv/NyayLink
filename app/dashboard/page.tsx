import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Scale, FileText, MessageSquare, ShieldCheck, ArrowLeft } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";

function ClientDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#090B10] text-[#F5F4FA] font-sans p-6 animate-pulse">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-8 w-40 bg-white/[0.05] rounded" />
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

async function ClientDashboardContent() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login?intent=client&next=/dashboard");
  }

  // Fetch user profile or roles
  const { data: roleRecords } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  const roles = roleRecords?.map((r) => r.role) || ["client"];
  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Client";

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
            Client Portal
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
            Client Workspace · Coming Soon
          </span>
          <h1 className="text-3xl font-serif text-white font-normal mt-1">
            Welcome to NyayaLink, {displayName}
          </h1>
          <p className="text-sm text-[#A5A3B2] mt-2 max-w-2xl leading-relaxed">
            Your personal legal assistance workspace is being prepared. You can track your legal inquiries,
            consult with verified advocates, and manage case documents securely.
          </p>
        </div>

        {/* Feature Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-[#0C0F17] border border-white/[0.08] space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center text-[#C5A059]">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Case Tracker</h3>
            <p className="text-xs text-[#A5A3B2] leading-relaxed">
              Track milestones, legal notices, and court hearing dates in plain language with zero confusion.
            </p>
            <span className="inline-block text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
              Module In Development
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#0C0F17] border border-white/[0.08] space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center text-[#C5A059]">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Advocate Consultations</h3>
            <p className="text-xs text-[#A5A3B2] leading-relaxed">
              Direct, privileged communication with your assigned Bar Council verified advocate.
            </p>
            <span className="inline-block text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
              Module In Development
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#0C0F17] border border-white/[0.08] space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center text-[#C5A059]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Escrow Protection</h3>
            <p className="text-xs text-[#A5A3B2] leading-relaxed">
              Transparent milestone fees held in RBI-compliant escrow until your case step is verified.
            </p>
            <span className="inline-block text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
              100% Protected
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

export default function ClientDashboardPage() {
  return (
    <Suspense fallback={<ClientDashboardSkeleton />}>
      <ClientDashboardContent />
    </Suspense>
  );
}

