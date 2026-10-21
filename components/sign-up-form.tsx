"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User, Briefcase, Eye, EyeOff } from "lucide-react";

export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const intent = searchParams.get("role") || searchParams.get("intent") || "client";
  const isLawyer = intent === "lawyer";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      router.push(`/auth/sign-up-success?intent=${intent}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EAF3ED] border border-[#D5E5D9] text-[11px] font-mono mb-4 shadow-xs">
          {isLawyer ? (
            <>
              <Briefcase className="w-3.5 h-3.5 text-[#174530]" />
              <span className="font-semibold text-[#202824]">ADVOCATE REGISTRATION</span>
            </>
          ) : (
            <>
              <User className="w-3.5 h-3.5 text-[#205C43]" />
              <span className="font-semibold text-[#202824]">CLIENT ACCOUNT REGISTRATION</span>
            </>
          )}
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif tracking-tight text-[#202824]">
          Create Account
        </h2>
        <p className="text-sm text-[#69736D] mt-2">
          {isLawyer
            ? "Register your practice to access the advocate chambers workspace and cause list sync."
            : "Register to manage your legal inquiries, consultations, and document vaults."}
        </p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-4">
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
            htmlFor="signup-email"
            className="block text-xs font-mono font-semibold text-[#202824] tracking-wide uppercase"
          >
            Email Address
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={isLawyer ? "advocate@chambers.in" : "client@domain.in"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#D5E5D9] text-[#202824] placeholder-[#69736D] text-sm focus:outline-none focus:border-[#205C43] focus:ring-2 focus:ring-[#205C43]/15 shadow-xs transition-colors disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="signup-password"
            className="block text-xs font-mono font-semibold text-[#202824] tracking-wide uppercase"
          >
            Password (min 8 chars)
          </label>
          <div className="relative">
            <input
              id="signup-password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full h-11 pl-3.5 pr-11 rounded-xl bg-white border border-[#D5E5D9] text-[#202824] placeholder-[#69736D] text-sm focus:outline-none focus:border-[#205C43] focus:ring-2 focus:ring-[#205C43]/15 shadow-xs transition-colors disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#69736D] hover:text-[#202824] transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="signup-repeat-password"
            className="block text-xs font-mono font-semibold text-[#202824] tracking-wide uppercase"
          >
            Confirm Password
          </label>
          <input
            id="signup-repeat-password"
            name="repeatPassword"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            placeholder="••••••••••••"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            disabled={isLoading}
            className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#D5E5D9] text-[#202824] placeholder-[#69736D] text-sm focus:outline-none focus:border-[#205C43] focus:ring-2 focus:ring-[#205C43]/15 shadow-xs transition-colors disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full h-11 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 ${
            isLawyer
              ? "bg-[#174530] hover:bg-[#0E2C1E] text-white"
              : "bg-[#205C43] hover:bg-[#174530] text-white"
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Creating account...</span>
            </>
          ) : (
            <span>Complete Registration</span>
          )}
        </button>

        <div className="pt-4 border-t border-[#D5E5D9] text-center">
          <p className="text-xs text-[#69736D]">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-[#202824] hover:text-[#205C43] font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
