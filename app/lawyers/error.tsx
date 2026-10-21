"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function LawyersErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[NyayaLink Directory Error Boundary Caught]:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6">
      <div className="max-w-md w-full p-8 rounded-2xl bg-[#0F121C] border border-white/10 text-center space-y-6 shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-[#DFBE7E] flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6 text-[#C5A059]" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-serif text-white tracking-tight">
            We&apos;re having trouble loading advocates right now
          </h2>
          <p className="text-xs text-[#A5A3B2] leading-relaxed">
            Our directory service is temporarily synchronizing with the registry. You can try refreshing or return to the main portal.
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-white/30 pt-1">
              Error Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#C5A059] hover:bg-[#DFBE7E] text-[#090B10] font-semibold text-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.05] hover:bg-white/10 text-white font-medium text-xs border border-white/10 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
