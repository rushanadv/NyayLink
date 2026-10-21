"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getPostLoginRedirectPath } from "@/lib/auth/post-login-redirect";
import { User, Briefcase, Eye, EyeOff } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  // Support both 'intent' and 'role' query parameters as presentation hints
  const roleHint = searchParams.get("role") || searchParams.get("intent");
  const isLawyerIntent = roleHint === "lawyer";

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        throw signInError;
      }

      if (signInData?.user) {
        const explicitNext = searchParams.get("next");
        // If user followed an explicit protected deep link, prioritize it (except old default fallback)
        if (explicitNext && explicitNext !== "/admin/dashboard") {
          router.push(explicitNext);
        } else {
          // Route strictly based on ACTUAL database user_roles (server-side security boundary)
          const targetPath = await getPostLoginRedirectPath(supabase, signInData.user.id);
          router.push(targetPath);
        }
        router.refresh();
      }
    } catch (err: unknown) {
      console.error("[NyayaLink Sign-In Error]:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === "object" && err !== null && "message" in err) {
        setError(String((err as { message: unknown }).message));
      } else {
        setError("Authentication failed. Please verify your email and password.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const nextParam = searchParams.get("next");
  const nextQuery = nextParam ? `&next=${encodeURIComponent(nextParam)}` : "";

  return (
    <div className="w-full">
      {/* Header Context Indicator */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EAF3ED] border border-[#D5E5D9] text-[11px] font-mono mb-4 shadow-xs">
          {isLawyerIntent ? (
            <>
              <Briefcase className="w-3.5 h-3.5 text-[#174530]" />
              <span className="font-semibold text-[#202824]">ADVOCATE CHAMBERS PORTAL</span>
            </>
          ) : (
            <>
              <User className="w-3.5 h-3.5 text-[#205C43]" />
              <span className="font-semibold text-[#202824]">LEGAL CLIENT PORTAL</span>
            </>
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-serif tracking-tight text-[#202824] text-balance">
          {isLawyerIntent ? "Sign in to your practice workspace" : "Sign in to access your legal brief"}
        </h2>
        <p className="text-sm text-[#69736D] mt-2 leading-relaxed">
          {isLawyerIntent
            ? "Access daily cause list alerts, active client dockets, Vakalatnama vault, and retainers."
            : "Review your intake brief, message your verified advocate, and view consultation schedules."}
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-5">
        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
            <svg
              className="w-4 h-4 text-red-600 shrink-0 mt-0.5"
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
            <span className="leading-relaxed font-medium">{error}</span>
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-xs font-mono font-semibold text-[#202824] tracking-wide uppercase"
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
            className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#D5E5D9] text-[#202824] placeholder-[#69736D] text-sm focus:outline-none focus:border-[#205C43] focus:ring-2 focus:ring-[#205C43]/15 shadow-xs transition-colors disabled:opacity-50"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-xs font-mono font-semibold text-[#202824] tracking-wide uppercase"
            >
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-[#205C43] hover:text-[#174530] hover:underline transition-colors font-mono"
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
              className="w-full h-11 pl-3.5 pr-11 rounded-xl bg-white border border-[#D5E5D9] text-[#202824] placeholder-[#69736D] text-sm focus:outline-none focus:border-[#205C43] focus:ring-2 focus:ring-[#205C43]/15 shadow-xs transition-colors disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#69736D] hover:text-[#202824] transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full h-11 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 ${
            isLawyerIntent
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
              <span>Verifying credentials...</span>
            </>
          ) : (
            <span>{isLawyerIntent ? "Sign In as Advocate" : "Sign In to Client Portal"}</span>
          )}
        </button>

        {/* Switch Intent Context */}
        <div className="pt-2 text-center">
          {isLawyerIntent ? (
            <p className="text-xs text-[#69736D]">
              Looking for legal assistance instead?{" "}
              <Link
                href={`/auth/login?role=client${nextQuery}`}
                className="text-[#205C43] hover:text-[#174530] hover:underline font-semibold"
              >
                Switch to client sign-in
              </Link>
            </p>
          ) : (
            <p className="text-xs text-[#69736D]">
              Practicing advocate looking for chambers portal?{" "}
              <Link
                href={`/auth/login?role=lawyer${nextQuery}`}
                className="text-[#205C43] hover:text-[#174530] hover:underline font-semibold"
              >
                Switch to lawyer sign-in
              </Link>
            </p>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-[#D5E5D9] text-center">
          <p className="text-xs text-[#69736D]">
            Don&apos;t have an account yet?{" "}
            <Link
              href={`/auth/sign-up?intent=${isLawyerIntent ? "lawyer" : "client"}${nextQuery}`}
              className="text-[#202824] hover:text-[#205C43] font-semibold transition-colors"
            >
              Create Account
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
