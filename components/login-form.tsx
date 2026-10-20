"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/admin/dashboard";

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      // Check whether user has admin role or proceed to target destination
      router.push(nextUrl);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed. Please verify your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#191923] border border-white/[0.06] text-[11px] font-mono text-[#A99AFF] mb-4">
          <span>PORTAL AUTHENTICATION</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#F5F4FA]">
          Sign in
        </h2>
        <p className="text-sm text-[#A5A3B2] mt-2">
          Enter your institutional credentials to access your NyayaLink account.
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
            placeholder="advocate@nyayalink.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="w-full h-11 px-3.5 rounded-lg bg-[#111119] border border-white/[0.08] text-[#F5F4FA] placeholder-[#6F6E7D] text-sm focus:outline-none focus:border-[#A99AFF] focus:ring-1 focus:ring-[#A99AFF]/30 transition-colors disabled:opacity-50"
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
              className="text-xs text-[#A99AFF] hover:text-[#C4BCFF] transition-colors font-mono"
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
              className="w-full h-11 pl-3.5 pr-11 rounded-lg bg-[#111119] border border-white/[0.08] text-[#F5F4FA] placeholder-[#6F6E7D] text-sm focus:outline-none focus:border-[#A99AFF] focus:ring-1 focus:ring-[#A99AFF]/30 transition-colors disabled:opacity-50"
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
          className="w-full h-11 rounded-lg bg-gradient-to-r from-[#A99AFF] to-[#8C7BFF] hover:from-[#B9ACFF] hover:to-[#9B8BFF] text-[#09090F] font-semibold text-sm transition-all duration-200 shadow-[0_0_20px_rgba(169,154,255,0.22)] hover:shadow-[0_0_25px_rgba(169,154,255,0.35)] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-[#09090F]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Verifying session...</span>
            </>
          ) : (
            <span>Sign In to Workspace</span>
          )}
        </button>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-white/[0.06] text-center">
          <p className="text-xs text-[#A5A3B2]">
            Don&apos;t have an account yet?{" "}
            <Link
              href="/auth/sign-up"
              className="text-[#A99AFF] hover:text-[#C4BCFF] font-medium transition-colors"
            >
              Create Account
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
