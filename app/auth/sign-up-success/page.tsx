import Link from "next/link";

export default function SignUpSuccessPage() {
  return (
    <div className="w-full space-y-6">
      <div className="w-12 h-12 rounded-xl bg-[#A99AFF]/15 border border-[#A99AFF]/30 flex items-center justify-center text-[#A99AFF] shadow-[0_0_20px_rgba(169,154,255,0.2)]">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#191923] border border-white/[0.06] text-[11px] font-mono text-[#A99AFF] mb-3">
          <span>ONBOARDING CONFIRMATION</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#F5F4FA]">
          Verification email dispatched
        </h2>
        <p className="text-sm text-[#A5A3B2] mt-3 leading-relaxed">
          Your account request has been recorded. Please check your inbox and click the confirmation link to activate your access token.
        </p>
      </div>

      <div className="p-4 rounded-lg bg-[#111119] border border-white/[0.08] space-y-2">
        <div className="text-xs font-mono text-[#A99AFF]">NEXT STEPS</div>
        <div className="text-xs text-[#A5A3B2] leading-relaxed">
          Once confirmed, practitioners can submit Bar Council credentials in the verification portal.
        </div>
      </div>

      <div className="pt-2">
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center w-full h-11 rounded-lg bg-[#191923] hover:bg-[#22212D] border border-white/[0.08] text-[#F5F4FA] text-sm font-medium transition-colors"
        >
          Return to Sign In
        </Link>
      </div>
    </div>
  );
}
