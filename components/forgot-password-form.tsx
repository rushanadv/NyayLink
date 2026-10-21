"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/auth/update-password`,
        }
      );
      if (resetError) throw resetError;
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Password reset request failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full space-y-6">
        <div className="w-12 h-12 rounded-xl bg-[#A99AFF]/15 border border-[#A99AFF]/30 flex items-center justify-center text-[#A99AFF] shadow-[0_0_20px_rgba(169,154,255,0.2)]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#F5F4FA]">
            Check your inbox
          </h2>
          <p className="text-sm text-[#A5A3B2] mt-2 leading-relaxed">
            We sent a secure password reset link to <strong className="text-[#F5F4FA] font-mono">{email}</strong>. Please follow the link in your email to choose a new password.
          </p>
        </div>

        <div className="pt-4 border-t border-white/[0.06]">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-xs font-mono text-[#A99AFF] hover:text-[#C4BCFF] transition-colors"
          >
            ← Return to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#191923] border border-white/[0.06] text-[11px] font-mono text-[#A99AFF] mb-4">
          <span>ACCOUNT RECOVERY</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#F5F4FA]">
          Reset Password
        </h2>
        <p className="text-sm text-[#A5A3B2] mt-2">
          Enter your registered email address to receive password restoration instructions.
        </p>
      </div>

      <form onSubmit={handleForgotPassword} className="space-y-5">
        {error && (
          <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-500/25 text-red-200 text-xs flex items-start gap-2.5">
            <svg
              className="w-4 h-4 text-red-400 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label
            htmlFor="recovery-email"
            className="block text-xs font-mono font-medium text-[#A5A3B2] tracking-wide uppercase"
          >
            Email Address
          </label>
          <input
            id="recovery-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="advocate@nyayalink.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="w-full h-11 px-3.5 rounded-lg bg-[#111119] border border-white/[0.08] text-[#F5F4FA] placeholder-[#6F6E7D] text-sm focus:outline-none focus:border-[#A99AFF] focus:ring-1 focus:ring-[#A99AFF]/30 transition-colors disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 rounded-lg bg-gradient-to-r from-[#A99AFF] to-[#8C7BFF] hover:from-[#B9ACFF] hover:to-[#9B8BFF] text-[#09090F] font-semibold text-sm transition-all duration-200 shadow-[0_0_20px_rgba(169,154,255,0.22)] hover:shadow-[0_0_25px_rgba(169,154,255,0.35)] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-[#09090F]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Transmitting reset token...</span>
            </>
          ) : (
            <span>Send Reset Instructions</span>
          )}
        </button>

        <div className="pt-4 border-t border-white/[0.06] text-center">
          <Link
            href="/auth/login"
            className="text-xs text-[#A5A3B2] hover:text-[#F5F4FA] transition-colors font-mono"
          >
            ← Back to sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
