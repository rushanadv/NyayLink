"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ShieldAlert } from "lucide-react";

function SignUpSuccessContent() {
  const searchParams = useSearchParams();
  const intent = searchParams.get("role") || searchParams.get("intent");
  const isLawyerIntent = intent === "lawyer";

  return (
    <div className="w-full space-y-6">
      <div className="w-12 h-12 rounded-2xl bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center text-[#205C43] shadow-xs">
        <CheckCircle2 className="w-6 h-6 text-[#205C43]" />
      </div>

      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EAF3ED] border border-[#D5E5D9] text-[11px] font-mono text-[#69736D] mb-3 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#205C43]" />
          <span>
            {isLawyerIntent
              ? "ADVOCATE REGISTRATION RECORDED"
              : "CLIENT ONBOARDING RECORDED"}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif tracking-tight text-[#202824]">
          {isLawyerIntent
            ? "Practitioner Account Initialized"
            : "Verification Email Dispatched"}
        </h2>
        <p className="text-sm text-[#69736D] mt-3 leading-relaxed">
          {isLawyerIntent
            ? "Your registration has been logged in the NyayLink registry. Please confirm your email address to activate your base credentials."
            : "Your account request has been recorded. Please check your inbox and click the confirmation link to activate your access token."}
        </p>
      </div>

      {isLawyerIntent ? (
        <div className="p-4 rounded-xl bg-[#EAF3ED]/40 border border-[#D5E5D9] space-y-2">
          <div className="text-xs font-mono text-[#205C43] flex items-center gap-2 font-semibold">
            <ShieldAlert className="w-3.5 h-3.5 text-[#205C43]" />
            BAR COUNCIL COMPLIANCE NOTICE
          </div>
          <div className="text-xs text-[#69736D] leading-relaxed font-medium">
            Your account is set up as a client for now — our team will verify your Bar Council credentials and enable your lawyer workspace shortly.
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-white border border-[#D5E5D9] space-y-2 shadow-xs">
          <div className="text-xs font-mono text-[#202824] font-semibold">NEXT STEPS</div>
          <div className="text-xs text-[#69736D] leading-relaxed">
            Once confirmed, you will be directed to your dashboard where you can begin your intake or connect with verified advocates.
          </div>
        </div>
      )}

      <div className="pt-2 flex flex-col gap-2.5">
        <Link
          href={isLawyerIntent ? "/dashboard" : "/auth/login?role=client"}
          className="inline-flex items-center justify-center w-full h-11 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white text-sm font-semibold transition-colors shadow-sm"
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
      <div className="w-12 h-12 rounded-xl bg-[#E2ECE5]/60" />
      <div className="h-6 w-36 bg-[#E2ECE5]/60 rounded" />
      <div className="h-9 w-56 bg-[#E2ECE5]/80 rounded" />
      <div className="h-20 w-full bg-[#E2ECE5]/40 rounded-xl mt-4" />
      <div className="h-11 w-full bg-[#E2ECE5]/80 rounded-lg mt-4" />
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
