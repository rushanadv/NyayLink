import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldAlert } from "lucide-react";


async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const rawMsg = params?.error || "The confirmation link is invalid, expired, or has already been used.";

  return (
    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 leading-relaxed font-mono break-words">
      {rawMsg}
    </div>
  );
}

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div className="w-full space-y-6">
      <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-2xs">
        <ShieldAlert className="w-6 h-6 text-amber-700" />
      </div>

      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EAF3ED] border border-[#D5E5D9] text-[11px] font-mono text-[#174530] mb-3 shadow-2xs">
          <span>AUTHENTICATION NOTICE</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif tracking-tight text-[#202824]">
          Verification Interrupted
        </h2>
        <p className="text-sm text-[#69736D] mt-2 leading-relaxed">
          The link you used may have expired, already been verified, or experienced a network timeout.
        </p>
      </div>

      <Suspense fallback={<div className="h-16 bg-[#EAF3ED]/40 rounded-xl animate-pulse" />}>
        <ErrorContent searchParams={searchParams} />
      </Suspense>

      <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] space-y-2 text-xs text-[#404D44]">
        <div className="font-semibold font-mono text-[#202824] uppercase tracking-wide">
          Quick Recovery Steps
        </div>
        <ul className="list-disc list-inside space-y-1.5 text-[#69736D]">
          <li>If you already confirmed previously, your credentials may already be active. Try signing in directly.</li>
          <li>If the link expired, submit a fresh registration or request a password reset.</li>
        </ul>
      </div>

      <div className="pt-2 flex flex-col gap-2.5">
        <Link
          href="/auth/login"
          className="w-full min-h-[44px] h-11 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
        >
          <span>Sign In With Your Password</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <Link
          href="/auth/sign-up?intent=lawyer"
          className="w-full min-h-[44px] h-11 rounded-xl bg-white hover:bg-[#EAF3ED] border border-[#D5E5D9] text-[#202824] text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Advocate Registration</span>
        </Link>
      </div>
    </div>
  );
}

