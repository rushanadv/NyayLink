"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ShieldAlert } from "lucide-react";

function SignUpSuccessContent() {
  const searchParams = useSearchParams();
  const isLawyerIntent = searchParams.get("intent") === "lawyer";

  return (
    <div className="w-full space-y-6">
      <div className="w-12 h-12 rounded-xl bg-[#C5A059]/15 border border-[#C5A059]/30 flex items-center justify-center text-[#DFBE7E] shadow-[0_0_20px_rgba(197,160,89,0.2)]">
        <CheckCircle2 className="w-6 h-6" />
      </div>

      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#191923] border border-white/[0.06] text-[11px] font-mono text-[#DFBE7E] mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
          <span>
            {isLawyerIntent
              ? "ADVOCATE REGISTRATION RECORDED"
              : "CLIENT ONBOARDING RECORDED"}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif tracking-tight text-[#F5F4FA]">
          {isLawyerIntent
            ? "Practitioner Account Initialized"
            : "Verification Email Dispatched"}
        </h2>
        <p className="text-sm text-[#A5A3B2] mt-3 leading-relaxed">
          {isLawyerIntent
            ? "Your registration has been logged in the NyayaLink registry. Please confirm your email address to activate your base credentials."
            : "Your account request has been recorded. Please check your inbox and click the confirmation link to activate your access token."}
        </p>
      </div>

      {isLawyerIntent ? (
        <div className="p-4 rounded-xl bg-[#14120B] border border-[#C5A059]/30 space-y-2">
          <div className="text-xs font-mono text-[#DFBE7E] flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-[#C5A059]" />
            BAR COUNCIL COMPLIANCE NOTICE
          </div>
          <div className="text-xs text-[#DFBE7E]/90 leading-relaxed font-medium">
            Your account is set up as a client for now — our team will verify your Bar Council credentials and enable your lawyer workspace shortly.
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-[#111119] border border-white/[0.08] space-y-2">
          <div className="text-xs font-mono text-[#DFBE7E]">NEXT STEPS</div>
          <div className="text-xs text-[#A5A3B2] leading-relaxed">
            Once confirmed, you will be directed to your dashboard where you can begin your intake or connect with verified advocates.
          </div>
        </div>
      )}

      <div className="pt-2 flex flex-col gap-2.5">
        <Link
          href={isLawyerIntent ? "/dashboard" : "/auth/login?intent=client"}
          className="inline-flex items-center justify-center w-full h-11 rounded-lg bg-[#C5A059] hover:bg-[#DFBE7E] text-[#090B10] text-sm font-semibold transition-colors"
        >
          {isLawyerIntent ? "Continue to Dashboard" : "Return to Sign In"}
        </Link>
      </div>
    </div>
  );
}

function SignUpSuccessFallback() {
  return (
    <div className="w-full space-y-4 animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-white/[0.05]" />
      <div className="h-6 w-36 bg-white/[0.05] rounded" />
      <div className="h-9 w-56 bg-white/[0.07] rounded" />
      <div className="h-20 w-full bg-white/[0.03] rounded-xl mt-4" />
      <div className="h-11 w-full bg-white/[0.08] rounded-lg mt-4" />
    </div>
  );
}

export default function SignUpSuccessPage() {
  return (
    <Suspense fallback={<SignUpSuccessFallback />}>
      <SignUpSuccessContent />
    </Suspense>
  );
}

