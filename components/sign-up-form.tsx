"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User, Briefcase, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, isHindi } = useLanguage();
  const initialIntent = searchParams.get("role") || searchParams.get("intent") || "lawyer";
  const [activeTab, setActiveTab] = useState<"lawyer" | "client">(
    initialIntent === "client" ? "client" : "lawyer"
  );

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDuplicateUser, setIsDuplicateUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isLawyer = activeTab === "lawyer";

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setIsDuplicateUser(false);

    if (!fullName.trim()) {
      setError("Please provide your full legal name.");
      setIsLoading(false);
      return;
    }

    if (password !== repeatPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setIsLoading(false);
      return;
    }

    if (!acceptedTerms) {
      setError("Please accept the Terms of Service and Privacy Policy to continue.");
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const origin =
        typeof window !== "undefined" && window.location.origin
          ? window.location.origin
          : "https://nyay.live";

      const nextTarget = isLawyer ? "/lawyer/onboarding" : "/dashboard";
      const redirectUrl = `${origin}/auth/confirm?next=${encodeURIComponent(nextTarget)}`;

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName.trim(),
            intent: activeTab,
            role: activeTab,
          },
        },
      });

      if (signUpError) {
        // Detect duplicate account error
        const msg = signUpError.message?.toLowerCase() || "";
        if (
          msg.includes("already registered") ||
          msg.includes("already exists") ||
          msg.includes("user_already_exists")
        ) {
          setIsDuplicateUser(true);
          setError("An account with this email address is already registered.");
          return;
        }
        throw signUpError;
      }

      // If user is returned and session is active (e.g. email confirmations disabled or instant signup)
      if (data?.session) {
        if (isLawyer) {
          router.push("/lawyer/onboarding");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
        return;
      }

      // Navigate to dedicated confirmation pending screen with email parameter
      router.push(
        `/auth/sign-up-success?intent=${activeTab}&email=${encodeURIComponent(email.trim().toLowerCase())}`
      );
    } catch (err: unknown) {
      console.error("[SignUp Error]:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration could not be completed. Please check your connection and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Role Switcher Tabs */}
      <div className="flex p-1 mb-6 rounded-xl bg-[#EAF3ED]/80 border border-[#D5E5D9] shadow-2xs">
        <button
          type="button"
          onClick={() => {
            setActiveTab("lawyer");
            setError(null);
            setIsDuplicateUser(false);
          }}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            isLawyer
              ? "bg-[#174530] text-white shadow-xs"
              : "text-[#69736D] hover:text-[#202824]"
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>{isHindi ? "अधिवक्ता के रूप में जुड़ें" : "Join as an Advocate"}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("client");
            setError(null);
            setIsDuplicateUser(false);
          }}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            !isLawyer
              ? "bg-[#205C43] text-white shadow-xs"
              : "text-[#69736D] hover:text-[#202824]"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>{isHindi ? "मुवक्किल खाता" : "Client Account"}</span>
        </button>
      </div>

      {/* Header Copy */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EAF3ED] border border-[#D5E5D9] text-[11px] font-mono mb-3 shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-[#205C43]" />
          <span className="font-semibold text-[#202824]">
            {isLawyer
              ? isHindi ? "अधिवक्ता पंजीकरण" : "ADVOCATE REGISTRATION"
              : isHindi ? "नागरिक व मुवक्किल पंजीकरण" : "CITIZEN & CLIENT ONBOARDING"}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif tracking-tight text-[#202824]">
          {isLawyer
            ? isHindi ? "अधिवक्ता के रूप में जुड़ें" : "Join as an Advocate"
            : isHindi ? "अपना मुवक्किल खाता बनाएं" : "Create Your Client Account"}
        </h2>
        <p className="text-xs sm:text-sm text-[#69736D] mt-2 leading-relaxed">
          {isLawyer
            ? isHindi
              ? "अपना NyayLink खाता बनाएं और अपनी व्यावसायिक प्रोफ़ाइल पूर्ण करें।"
              : "Create your NyayLink account and complete your professional profile."
            : isHindi
              ? "कानूनी पूछताछ दर्ज करने, अधिवक्ताओं से परामर्श करने और मामलों को ट्रैक करने के लिए सुरक्षित पंजीकरण करें।"
              : "Register securely to post legal inquiries, consult verified counsel, and track cases."}
        </p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <span className="leading-relaxed font-medium block">{error}</span>
              {isDuplicateUser && (
                <div className="pt-1.5">
                  <Link
                    href={`/auth/login?role=${activeTab}&email=${encodeURIComponent(email)}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-900 font-semibold transition-colors"
                  >
                    <span>Already registered? Sign in</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Full Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-name"
            className="block text-xs font-mono font-semibold text-[#202824] tracking-wide uppercase"
          >
            {isLawyer
              ? isHindi ? "अधिवक्ता का पूर्ण कानूनी नाम" : "Advocate's Full Legal Name"
              : t.auth.fullName}
          </label>
          <input
            id="signup-name"
            name="fullName"
            type="text"
            required
            autoComplete="name"
            inputMode="text"
            placeholder={isLawyer ? (isHindi ? "अधि. राजेश कुमार शर्मा" : "Adv. Rajesh Kumar Sharma") : (isHindi ? "राहुल शर्मा" : "Rahul Sharma")}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={isLoading}
            className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#D5E5D9] text-[#202824] placeholder-[#8F9A93] text-sm focus:outline-none focus:border-[#205C43] focus:ring-2 focus:ring-[#205C43]/15 shadow-2xs transition-colors disabled:opacity-50"
          />
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-email"
            className="block text-xs font-mono font-semibold text-[#202824] tracking-wide uppercase"
          >
            {t.auth.email}
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder={isLawyer ? "advocate@chambers.in" : "client@domain.in"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#D5E5D9] text-[#202824] placeholder-[#8F9A93] text-sm focus:outline-none focus:border-[#205C43] focus:ring-2 focus:ring-[#205C43]/15 shadow-2xs transition-colors disabled:opacity-50"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-password"
            className="block text-xs font-mono font-semibold text-[#202824] tracking-wide uppercase"
          >
            {t.auth.password} (min 8 chars)
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
              className="w-full h-11 pl-3.5 pr-11 rounded-xl bg-white border border-[#D5E5D9] text-[#202824] placeholder-[#8F9A93] text-sm focus:outline-none focus:border-[#205C43] focus:ring-2 focus:ring-[#205C43]/15 shadow-2xs transition-colors disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#69736D] hover:text-[#202824] transition-colors p-1"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-repeat-password"
            className="block text-xs font-mono font-semibold text-[#202824] tracking-wide uppercase"
          >
            {t.auth.repeatPassword}
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
            className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#D5E5D9] text-[#202824] placeholder-[#8F9A93] text-sm focus:outline-none focus:border-[#205C43] focus:ring-2 focus:ring-[#205C43]/15 shadow-2xs transition-colors disabled:opacity-50"
          />
        </div>

        {/* Terms and Privacy Checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 text-xs text-[#69736D] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              disabled={isLoading}
              className="mt-0.5 h-4 w-4 rounded border-[#D5E5D9] text-[#205C43] focus:ring-[#205C43] shrink-0"
            />
            <span className="leading-snug">
              {isHindi ? "मैं " : "I agree to the "}
              <Link href="/terms" target="_blank" className="text-[#205C43] font-medium underline">
                {isHindi ? "सेवा की शर्तें" : "Terms of Service"}
              </Link>{" "}
              {isHindi ? "और " : "and "}
              <Link href="/privacy" target="_blank" className="text-[#205C43] font-medium underline">
                {isHindi ? "गोपनीयता नीति" : "Privacy Policy"}
              </Link>
              {isHindi ? " स्वीकार करता हूँ" : ""}
              {isLawyer && (isHindi ? " तथा प्रमाणित करता हूँ कि मैं एक प्रामाणिक बार काउंसिल नामांकन रखता हूँ।" : " and affirm that I hold an authentic Bar Council enrollment")}.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full min-h-[44px] h-11 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 ${
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
              <span>{isHindi ? "खाता बनाया जा रहा है..." : "Creating your account..."}</span>
            </>
          ) : (
            <span>
              {isLawyer
                ? isHindi ? "प्रोफ़ाइल सेटअप पर जारी रखें" : "Continue to Profile Setup"
                : isHindi ? "पंजीकरण पूर्ण करें" : "Complete Registration"}
            </span>
          )}
        </button>

        {/* Already Registered Sign In Option */}
        <div className="pt-4 border-t border-[#D5E5D9] text-center">
          <p className="text-xs text-[#69736D]">
            {t.auth.haveAccount}{" "}
            <Link
              href={`/auth/login?role=${activeTab}`}
              className="text-[#202824] hover:text-[#205C43] font-semibold transition-colors"
            >
              {t.nav.signIn}
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

