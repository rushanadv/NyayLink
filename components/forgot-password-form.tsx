"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { KeyRound, Mail, ArrowLeft } from "lucide-react";

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
        <div className="w-12 h-12 rounded-2xl bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center text-[#205C43] shadow-xs">
          <Mail className="w-6 h-6" />
        </div>

        <div>
          <h2 className="text-2xl font-serif font-normal tracking-tight text-[#202824]">
            Check your inbox
          </h2>
          <p className="text-sm text-[#69736D] mt-2 leading-relaxed">
            We sent a secure password reset link to <strong className="text-[#202824] font-mono">{email}</strong>. Please follow the instructions in the email to select a new password.
          </p>
        </div>

        <div className="pt-4 border-t border-[#D5E5D9]">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#205C43] hover:text-[#174530] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to sign in</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EAF3ED] border border-[#D5E5D9] text-[11px] font-mono text-[#205C43] mb-4 shadow-xs">
          <KeyRound className="w-3.5 h-3.5 text-[#205C43]" />
          <span>ACCOUNT RECOVERY</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif tracking-tight text-[#202824]">
          Reset Password
        </h2>
        <p className="text-sm text-[#69736D] mt-2">
          Enter your registered email address to receive secure password recovery instructions.
        </p>
      </div>

      <form onSubmit={handleForgotPassword} className="space-y-5">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
            <svg
              className="w-4 h-4 text-red-600 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="leading-relaxed font-medium">{error}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label
            htmlFor="recovery-email"
            className="block text-xs font-mono font-semibold text-[#202824] tracking-wide uppercase"
          >
            Email Address
          </label>
          <input
            id="recovery-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="advocate@nyay.live"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#D5E5D9] text-[#202824] placeholder-[#69736D] text-sm focus:outline-none focus:border-[#205C43] focus:ring-2 focus:ring-[#205C43]/15 shadow-xs transition-colors disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white font-semibold text-sm transition-all duration-200 shadow-sm active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Transmitting reset token...</span>
            </>
          ) : (
            <span>Send Reset Instructions</span>
          )}
        </button>

        <div className="pt-4 border-t border-[#D5E5D9] text-center">
          <Link
            href="/auth/login"
            className="text-xs text-[#69736D] hover:text-[#202824] transition-colors font-mono"
          >
            ← Back to sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
