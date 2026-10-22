"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, ShieldCheck, Mail, RotateCw, ArrowLeft, ArrowRight, AlertCircle } from "lucide-react";

function SignUpSuccessContent() {
  const searchParams = useSearchParams();
  const intent = searchParams.get("role") || searchParams.get("intent") || "lawyer";
  const emailParam = searchParams.get("email") || "";
  const isLawyerIntent = intent === "lawyer";

  const [resendCooldown, setResendCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (!emailParam || resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setResendStatus("idle");
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const origin =
        typeof window !== "undefined" && window.location.origin
          ? window.location.origin
          : "https://nyay.live";

      const nextTarget = isLawyerIntent ? "/lawyer/onboarding" : "/dashboard";
      const redirectUrl = `${origin}/auth/confirm?next=${encodeURIComponent(nextTarget)}`;

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: emailParam,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        throw error;
      }

      setResendStatus("sent");
      setResendCooldown(60);
    } catch (err: unknown) {
      console.error("[Resend Email Error]:", err);
      setResendStatus("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Could not resend confirmation email. Rate limit may apply."
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Icon */}
      <div className="w-12 h-12 rounded-2xl bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center text-[#205C43] shadow-xs">
        <Mail className="w-6 h-6 text-[#205C43]" />
      </div>

      {/* Headings */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EAF3ED] border border-[#D5E5D9] text-[11px] font-mono text-[#69736D] mb-3 shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-[#205C43]" />
          <span>
            {isLawyerIntent
              ? "ADVOCATE REGISTRATION RECORDED"
              : "CLIENT ACCOUNT RECORDED"}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif tracking-tight text-[#202824]">
          Check Your Inbox
        </h2>
        <p className="text-sm text-[#69736D] mt-2 leading-relaxed">
          We sent a verification link to activate your NyayLink account credentials.
        </p>
      </div>

      {/* Display Registered Email Address */}
      {emailParam && (
        <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] flex items-center justify-between gap-3 shadow-xs">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono uppercase text-[#69736D] tracking-wider block">
              Registered Email
            </span>
            <span className="text-sm font-semibold text-[#202824] truncate block">
              {emailParam}
            </span>
          </div>
          <Link
            href={`/auth/sign-up?intent=${intent}`}
            className="text-xs text-[#205C43] hover:text-[#174530] font-medium underline shrink-0"
          >
            Change
          </Link>
        </div>
      )}

      {/* Verification Instructions */}
      <div className="p-4 rounded-xl bg-[#EAF3ED]/50 border border-[#D5E5D9] space-y-2.5">
        <div className="text-xs font-mono text-[#174530] font-semibold flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#205C43]" />
          <span>WHAT TO DO NEXT</span>
        </div>
        <ol className="text-xs text-[#404D44] space-y-2 leading-relaxed list-decimal list-inside">
          <li>Open the confirmation email from NyayLink.</li>
          <li>Click the verification link to confirm your account.</li>
          {isLawyerIntent ? (
            <li>
              You will automatically be guided to the{" "}
              <strong>3-step Advocate Profile Setup</strong> (Bar Council number, practice areas, and jurisdiction).
            </li>
          ) : (
            <li>You will proceed straight to your client dashboard.</li>
          )}
        </ol>
        <p className="text-[11px] text-[#69736D] pt-1 border-t border-[#D5E5D9]/70">
          Tip: If the email doesn&apos;t appear in 2 minutes, check your Spam or Promotions folder.
        </p>
      </div>

      {/* Resend Status Alerts */}
      {resendStatus === "sent" && (
        <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <span>A fresh confirmation link was dispatched to your email.</span>
        </div>
      )}

      {resendStatus === "error" && errorMessage && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Actions */}
      <div className="pt-2 flex flex-col gap-3">
        {/* Resend Link with Cooldown */}
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0 || isResending || !emailParam}
          className="w-full min-h-[44px] h-11 rounded-xl bg-white hover:bg-[#EAF3ED] border border-[#D5E5D9] text-[#202824] text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isResending ? "animate-spin" : ""}`} />
          {isResending ? (
            <span>Sending...</span>
          ) : resendCooldown > 0 ? (
            <span>Resend confirmation email ({resendCooldown}s)</span>
          ) : (
            <span>Resend confirmation email</span>
          )}
        </button>

        {/* Go to Login if already confirmed */}
        <Link
          href={`/auth/login?role=${intent}${emailParam ? `&email=${encodeURIComponent(emailParam)}` : ""}`}
          className="w-full min-h-[44px] h-11 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
        >
          <span>Confirmed already? Sign in</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        {/* Return to Registration */}
        <div className="text-center pt-2">
          <Link
            href={`/auth/sign-up?intent=${intent}`}
            className="inline-flex items-center gap-1.5 text-xs text-[#69736D] hover:text-[#202824] transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Mistyped email? Start again</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function SignUpSuccessFallback() {
  return (
    <div className="w-full space-y-4 animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-[#E2ECE5]/60" />
      <div className="h-6 w-36 bg-[#E2ECE5]/60 rounded" />
      <div className="h-9 w-56 bg-[#E2ECE5]/80 rounded" />
      <div className="h-20 w-full bg-[#E2ECE5]/40 rounded-xl mt-4" />
      <div className="h-11 w-full bg-[#E2ECE5]/80 rounded-lg mt-4" />
    </div>
  );
}

export default function SignUpSuccessPage() {
  return (
    <Suspense fallback={<SignUpSuccessFallback />}>
      <SignUpSuccessContent />
    </Suspense>
  );
}

