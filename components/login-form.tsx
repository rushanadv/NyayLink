"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getPostLoginRedirectPath } from "@/lib/auth/post-login-redirect";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const intentParam = searchParams.get("intent");
  const isLawyerIntent = intentParam === "lawyer";

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      if (signInData?.user) {
        const explicitNext = searchParams.get("next");
        // If user followed an explicit protected deep link, prioritize it (except the old default fallback)
        if (explicitNext && explicitNext !== "/admin/dashboard") {
          router.push(explicitNext);
        } else {
          // Route based on ACTUAL user_roles from database (admin > lawyer > client)
          const targetPath = await getPostLoginRedirectPath(supabase, signInData.user.id);
          router.push(targetPath);
        }
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed. Please verify your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const nextParam = searchParams.get("next");
  const nextQuery = nextParam ? `&next=${encodeURIComponent(nextParam)}` : "";

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#191923] border border-white/[0.06] text-[11px] font-mono text-[#DFBE7E] mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
          <span>{isLawyerIntent ? "ADVOCATE WORKSPACE" : "LEGAL CLIENT PORTAL"}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif tracking-tight text-[#F5F4FA]">
          {isLawyerIntent ? "Sign in to manage your practice" : "Sign in to find your advocate"}
        </h2>
        <p className="text-sm text-[#A5A3B2] mt-2 leading-relaxed">
          {isLawyerIntent
            ? "Access your court calendar, active briefs, Vakalatnama vault, and client intake."
            : "Track your active case, message your verified lawyer, and access your legal vault."}
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-5">
        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-500/25 text-red-200 text-xs flex items-start gap-2.5">
            <svg
              className="w-4 h-4 text-red-400 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-xs font-mono font-medium text-[#A5A3B2] tracking-wide uppercase"
          >
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={isLawyerIntent ? "advocate@chambers.in" : "client@domain.in"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="w-full h-11 px-3.5 rounded-lg bg-[#111119] border border-white/[0.08] text-[#F5F4FA] placeholder-[#6F6E7D] text-sm focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/30 transition-colors disabled:opacity-50"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-xs font-mono font-medium text-[#A5A3B2] tracking-wide uppercase"
            >
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-[#DFBE7E] hover:underline transition-colors font-mono"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full h-11 pl-3.5 pr-11 rounded-lg bg-[#111119] border border-white/[0.08] text-[#F5F4FA] placeholder-[#6F6E7D] text-sm focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/30 transition-colors disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6F6E7D] hover:text-[#F5F4FA] transition-colors"
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 rounded-lg bg-[#C5A059] hover:bg-[#DFBE7E] text-[#090B10] font-semibold text-sm transition-all duration-200 shadow-md shadow-[#C5A059]/20 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-[#090B10]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Verifying credentials...</span>
            </>
          ) : (
            <span>{isLawyerIntent ? "Sign In as Advocate" : "Sign In to Client Portal"}</span>
          )}
        </button>

        {/* Switch Intent Link */}
        <div className="pt-2 text-center">
          {isLawyerIntent ? (
            <p className="text-xs text-[#A5A3B2]">
              Looking for legal assistance instead?{" "}
              <Link
                href={`/auth/login?intent=client${nextQuery}`}
                className="text-[#DFBE7E] hover:underline font-medium"
              >
                Switch to client sign-in
              </Link>
            </p>
          ) : (
            <p className="text-xs text-[#A5A3B2]">
              Looking to offer legal services instead?{" "}
              <Link
                href={`/auth/login?intent=lawyer${nextQuery}`}
                className="text-[#DFBE7E] hover:underline font-medium"
              >
                Switch to lawyer sign-in
              </Link>
            </p>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-white/[0.06] text-center">
          <p className="text-xs text-[#A5A3B2]">
            Don&apos;t have an account yet?{" "}
            <Link
              href={`/auth/sign-up?intent=${isLawyerIntent ? "lawyer" : "client"}${nextQuery}`}
              className="text-[#C5A059] hover:text-[#DFBE7E] font-medium transition-colors"
            >
              Create Account
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
