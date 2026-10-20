import { Suspense } from "react";
import Link from "next/link";

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const errorMsg = params?.error || "Authentication flow encountered an unrecoverable exception.";

  return (
    <div className="p-4 rounded-lg bg-red-950/30 border border-red-500/20 text-xs font-mono text-red-200 break-all leading-relaxed">
      {errorMsg}
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
      <div className="w-12 h-12 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-400">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#191923] border border-white/[0.06] text-[11px] font-mono text-red-400 mb-3">
          <span>AUTHENTICATION FAULT</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#F5F4FA]">
          Verification Interrupted
        </h2>
        <p className="text-sm text-[#A5A3B2] mt-2 leading-relaxed">
          The requested authentication token is invalid or expired.
        </p>
      </div>

      <Suspense fallback={<div className="h-16 bg-white/[0.04] rounded-lg animate-pulse" />}>
        <ErrorContent searchParams={searchParams} />
      </Suspense>

      <div className="pt-2">
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center w-full h-11 rounded-lg bg-gradient-to-r from-[#A99AFF] to-[#8C7BFF] hover:from-[#B9ACFF] hover:to-[#9B8BFF] text-[#09090F] font-semibold text-sm transition-all"
        >
          Return to Login
        </Link>
      </div>
    </div>
  );
}
